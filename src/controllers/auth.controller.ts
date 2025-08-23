import { Request, Response } from 'express';
import { AuthRequest } from '../types/index.js';
import { RegisterInput, LoginInput } from '../types/auth.types.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { generateToken } from '../utils/token.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logger } from '../config/logger.js';
import prisma from '../config/database.js';

/**
 * Maps user data from database format (snake_case) to API response format (camelCase)
 */
const mapUserToApiResponse = (user: any, isFirstTime: boolean = false) => {
  const { password_hash: _passwordHash, ...userWithoutPassword } = user;

  // Map snake_case to camelCase for API response
  const userResponse = {
    ...userWithoutPassword,
    linkedinUsername: userWithoutPassword.linkedin_username,
    photoLink: userWithoutPassword.photo_link,
    professionId: userWithoutPassword.profession_id,
    ...(isFirstTime !== undefined && { isFirst: isFirstTime }),
  };

  // Remove snake_case fields
  delete (userResponse as any).linkedin_username;
  delete (userResponse as any).photo_link;
  delete (userResponse as any).profession_id;

  return userResponse;
};

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const userData: RegisterInput = req.body;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      sendError(
        res,
        'Registration failed',
        [{ field: 'email', message: 'Email already in use' }],
        400
      );
      return;
    }

    // Hash the password
    const hashedPassword = await hashPassword(userData.password);

    // Create the user
    const newUser = await prisma.user.create({
      data: {
        auth_provider: userData.auth_provider ?? 'EMAIL', // Default to EMAIL if not provided
        email: userData.email,
        password_hash: hashedPassword,
        username: userData.username,
        name: userData.name,
        is_active: userData.is_active ?? true, // Default to true if not provided
      },
    });

    // Generate token
    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
    });

    // Map user data to API response format
    const userResponse = mapUserToApiResponse(newUser);

    sendSuccess(
      res,
      'User registered successfully',
      { user: userResponse, token },
      201
    );
  } catch (error) {
    logger.error('Registration error:', error);
    sendError(
      res,
      'Registration failed',
      [{ field: 'server', message: 'An error occurred during registration' }],
      500
    );
  }
};

/**
 * Login a user
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginInput = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Check if user exists and password is correct
    if (
      !user ||
      !user.password_hash ||
      !(await verifyPassword(password, user.password_hash))
    ) {
      sendError(
        res,
        'Login failed',
        [{ field: 'credentials', message: 'Invalid email or password' }],
        401
      );
      return;
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
    });

    // Map user data to API response format
    const userResponse = mapUserToApiResponse(user);

    sendSuccess(res, 'Login successful', { user: userResponse, token }, 200);
  } catch (error) {
    logger.error('Login error:', error);
    sendError(
      res,
      'Login failed',
      [{ field: 'server', message: 'An error occurred during login' }],
      500
    );
  }
};

/**
 * Get the current user's profile
 */
export const getProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      sendError(
        res,
        'Authentication required',
        [{ field: 'auth', message: 'User not authenticated' }],
        401
      );
      return;
    }

    // Map user data to API response format
    const userResponse = mapUserToApiResponse(user);

    sendSuccess(res, 'Profile retrieved successfully', userResponse, 200);
  } catch (error) {
    logger.error('Get profile error:', error);
    sendError(
      res,
      'Failed to retrieve profile',
      [
        {
          field: 'server',
          message: 'An error occurred while retrieving profile',
        },
      ],
      500
    );
  }
};

export const callback = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const startTime = Date.now();
  logger.info('=== CALLBACK AUTHENTICATION STARTED ===');

  try {
    // Log request details
    logger.info('Callback request details:', {
      method: req.method,
      url: req.url,
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.connection.remoteAddress,
      timestamp: new Date().toISOString(),
    });

    // Get Supabase user data from middleware
    const supabaseUser = req.supabaseUser;
    logger.info('Supabase user data received from middleware:', {
      hasUser: !!supabaseUser,
      userId: supabaseUser?.id,
      email: supabaseUser?.email,
      provider: supabaseUser?.app_metadata?.provider,
      emailVerified: supabaseUser?.email_confirmed_at ? true : false,
      userMetadata: supabaseUser?.user_metadata
        ? Object.keys(supabaseUser.user_metadata)
        : [],
      appMetadata: supabaseUser?.app_metadata
        ? Object.keys(supabaseUser.app_metadata)
        : [],
    });

    if (!supabaseUser || !supabaseUser.email) {
      logger.warn(
        'Authentication failed: Missing Supabase user data or email',
        {
          hasUser: !!supabaseUser,
          hasEmail: !!supabaseUser?.email,
        }
      );
      sendError(
        res,
        'Authentication failed',
        [{ field: 'auth', message: 'Supabase user data not found' }],
        401
      );
      return;
    }

    logger.info('Checking if user exists in local database:', {
      email: supabaseUser.email,
    });

    // Check if user exists in our User table by email
    const existingUser = await prisma.user.findUnique({
      where: { email: supabaseUser.email },
    });

    logger.info('Database user lookup result:', {
      userExists: !!existingUser,
      userId: existingUser?.id,
      currentProvider: existingUser?.auth_provider,
      isActive: existingUser?.is_active,
      createdAt: existingUser?.created_at,
      lastUpdated: existingUser?.updated_at,
    });

    let user;
    let isFirstTime = false;

    if (existingUser) {
      logger.info('Updating existing user information');

      const updateData = {
        name: supabaseUser.user_metadata?.full_name || supabaseUser.email,
        // Keep existing auth_provider or update based on Supabase provider
      };

      logger.info('User update data:', updateData);

      // User exists, update their information and treat like login
      user = await prisma.user.update({
        where: { email: supabaseUser.email },
        data: updateData,
      });

      logger.info('User updated successfully:', {
        userId: user.id,
        updatedFields: Object.keys(updateData),
      });
    } else {
      logger.info('Creating new user account');
      isFirstTime = true;

      // User doesn't exist, create new user
      // Determine provider based on Supabase user data
      let authProvider = 'EMAIL'; // default
      if (supabaseUser.app_metadata?.provider) {
        const provider = supabaseUser.app_metadata.provider.toUpperCase();
        if (['APPLE', 'LINKEDIN'].includes(provider)) {
          authProvider = provider;
        }
      }

      const createData = {
        email: supabaseUser.email,
        name: supabaseUser.user_metadata?.full_name || supabaseUser.email,
        auth_provider: authProvider as any,
        is_active: true, // OAuth users are active by default
      };

      logger.info('User creation data:', {
        ...createData,
        determinedProvider: authProvider,
        originalProvider: supabaseUser.app_metadata?.provider,
      });

      user = await prisma.user.create({
        data: createData,
      });

      logger.info('New user created successfully:', {
        userId: user.id,
        email: user.email,
        provider: user.auth_provider,
      });
    }

    logger.info('Generating JWT token for user:', {
      userId: user.id,
      email: user.email,
    });

    // Generate our JWT token for the user
    const token = generateToken({
      id: user.id,
      email: user.email,
    });

    logger.info('JWT token generated successfully', {
      tokenLength: token.length,
      userId: user.id,
    });

    // Map user data to API response format
    const userResponse = mapUserToApiResponse(user, isFirstTime);

    const responseData = {
      user: userResponse,
      token,
    };

    const processingTime = Date.now() - startTime;
    logger.info('Callback authentication completed successfully:', {
      isExistingUser: !!existingUser,
      userId: user.id,
      processingTimeMs: processingTime,
      responseStatus: existingUser ? 200 : 201,
    });

    sendSuccess(
      res,
      existingUser
        ? 'Login successful'
        : 'User created and logged in successfully',
      responseData,
      existingUser ? 200 : 201
    );

    logger.info('=== CALLBACK AUTHENTICATION COMPLETED ===');
  } catch (error) {
    const processingTime = Date.now() - startTime;
    logger.error('Callback authentication failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      processingTimeMs: processingTime,
      supabaseUserId: req.supabaseUser?.id,
      supabaseEmail: req.supabaseUser?.email,
    });

    sendError(
      res,
      'Callback failed',
      [{ field: 'server', message: 'An error occurred during callback' }],
      500
    );

    logger.info('=== CALLBACK AUTHENTICATION FAILED ===');
  }
};
