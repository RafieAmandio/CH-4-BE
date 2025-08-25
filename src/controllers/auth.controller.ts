import { Request, Response } from 'express';
import { AuthRequest } from '../types/index.js';
import { RegisterInput, LoginInput } from '../types/auth.types.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { generateToken } from '../utils/token.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logger } from '../config/logger.js';
import prisma from '../config/database.js';

/**
 * Helper function to check if user is in an active event and get attendee info
 */
const checkActiveEventForUser = async (userId: string) => {
  try {
    const activeAttendee = await prisma.attendee.findFirst({
      where: {
        user_id: userId,
        is_active: true,
        deleted_at: null,
        event: {
          status: 'ONGOING',
          is_active: true,
          deleted_at: null,
        },
      },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            start: true,
            end: true,
            detail: true,
            photo_link: true,
            location_name: true,
            location_address: true,
            location_link: true,
            latitude: true,
            longitude: true,
            link: true,
            status: true,
            current_participants: true,
            code: true,
            creator: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return activeAttendee;
  } catch (error) {
    logger.error('Error checking active event for user:', error);
    return null;
  }
};

/**
 * Maps user data from database format (snake_case) to API response format (camelCase)
 */
const mapUserToApiResponse = (user: any, isFirstTime: boolean = false): any => {
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

  // Add profession details if available
  if (userWithoutPassword.profession) {
    userResponse.profession = {
      id: userWithoutPassword.profession.id,
      name: userWithoutPassword.profession.name,
      categoryName: userWithoutPassword.profession.category.category,
    };
  } else {
    userResponse.profession = null;
  }

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
      include: {
        profession: {
          include: {
            category: true,
          },
        },
      },
    });

    // Check if user is in an active event
    const activeAttendee = await checkActiveEventForUser(newUser.id);

    // Prepare token payload
    const tokenPayload: any = {
      id: newUser.id,
      email: newUser.email,
    };

    // Include attendee ID if user is in an active event
    if (activeAttendee) {
      tokenPayload.attendeeId = activeAttendee.id;
    }

    // Generate token
    const token = generateToken(tokenPayload);

    // Map user data to API response format
    const userResponse = mapUserToApiResponse(newUser);

    // Prepare response data
    const responseData: any = {
      user: userResponse,
      token,
    };

    // Include active event data if user is in an ongoing event
    if (activeAttendee) {
      responseData.activeEvent = {
        attendeeId: activeAttendee.id,
        event: {
          id: activeAttendee.event.id,
          name: activeAttendee.event.name,
          start: activeAttendee.event.start,
          end: activeAttendee.event.end,
          detail: activeAttendee.event.detail,
          photo_link: activeAttendee.event.photo_link,
          location_name: activeAttendee.event.location_name,
          location_address: activeAttendee.event.location_address,
          location_link: activeAttendee.event.location_link,
          latitude: activeAttendee.event.latitude,
          longitude: activeAttendee.event.longitude,
          link: activeAttendee.event.link,
          status: activeAttendee.event.status,
          current_participants: activeAttendee.event.current_participants,
          code: activeAttendee.event.code,
          creator: {
            id: activeAttendee.event.creator.id,
            name: activeAttendee.event.creator.name,
          },
        },
      };
    }

    const successMessage = activeAttendee
      ? 'User registered successfully - You are currently in an active event'
      : 'User registered successfully';

    sendSuccess(res, successMessage, responseData, 201);
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
      include: {
        profession: {
          include: {
            category: true,
          },
        },
      },
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

    // Check if user is in an active event
    const activeAttendee = await checkActiveEventForUser(user.id);

    // Prepare token payload
    const tokenPayload: any = {
      id: user.id,
      email: user.email,
    };

    // Include attendee ID if user is in an active event
    if (activeAttendee) {
      tokenPayload.attendeeId = activeAttendee.id;
    }

    // Generate token
    const token = generateToken(tokenPayload);

    // Map user data to API response format
    const userResponse = mapUserToApiResponse(user);

    // Prepare response data
    const responseData: any = {
      user: userResponse,
      token,
    };

    // Include active event data if user is in an ongoing event
    if (activeAttendee) {
      responseData.activeEvent = {
        attendeeId: activeAttendee.id,
        event: {
          id: activeAttendee.event.id,
          name: activeAttendee.event.name,
          start: activeAttendee.event.start,
          end: activeAttendee.event.end,
          detail: activeAttendee.event.detail,
          photo_link: activeAttendee.event.photo_link,
          location_name: activeAttendee.event.location_name,
          location_address: activeAttendee.event.location_address,
          location_link: activeAttendee.event.location_link,
          latitude: activeAttendee.event.latitude,
          longitude: activeAttendee.event.longitude,
          link: activeAttendee.event.link,
          status: activeAttendee.event.status,
          current_participants: activeAttendee.event.current_participants,
          code: activeAttendee.event.code,
          creator: {
            id: activeAttendee.event.creator.id,
            name: activeAttendee.event.creator.name,
          },
        },
      };
    }

    const successMessage = activeAttendee
      ? 'Login successful - You are currently in an active event'
      : 'Login successful';

    sendSuccess(res, successMessage, responseData, 200);
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

    // Get fresh user data with profession details
    const freshUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        profession: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!freshUser) {
      sendError(
        res,
        'Profile not found',
        [{ field: 'user', message: 'User profile not found' }],
        404
      );
      return;
    }

    // Map user data to API response format
    const userResponse = mapUserToApiResponse(freshUser);

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
      include: {
        profession: {
          include: {
            category: true,
          },
        },
      },
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
        include: {
          profession: {
            include: {
              category: true,
            },
          },
        },
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
        include: {
          profession: {
            include: {
              category: true,
            },
          },
        },
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

    // Check if user is in an active event
    const activeAttendee = await checkActiveEventForUser(user.id);

    // Prepare token payload
    const tokenPayload: any = {
      id: user.id,
      email: user.email,
    };

    // Include attendee ID if user is in an active event
    if (activeAttendee) {
      tokenPayload.attendeeId = activeAttendee.id;
      logger.info('User is in active event, including attendee ID in token:', {
        attendeeId: activeAttendee.id,
        eventName: activeAttendee.event.name,
        eventCreator: activeAttendee.event.creator.name,
      });
    }

    // Generate our JWT token for the user
    const token = generateToken(tokenPayload);

    logger.info('JWT token generated successfully', {
      tokenLength: token.length,
      userId: user.id,
      hasAttendeeId: !!activeAttendee,
    });

    // Map user data to API response format
    const userResponse = mapUserToApiResponse(user, isFirstTime);

    // Prepare response data
    const responseData: any = {
      user: userResponse,
      token,
    };

    // Include active event data if user is in an ongoing event
    if (activeAttendee) {
      responseData.activeEvent = {
        attendeeId: activeAttendee.id,
        event: {
          id: activeAttendee.event.id,
          name: activeAttendee.event.name,
          start: activeAttendee.event.start,
          end: activeAttendee.event.end,
          detail: activeAttendee.event.detail,
          photo_link: activeAttendee.event.photo_link,
          location_name: activeAttendee.event.location_name,
          location_address: activeAttendee.event.location_address,
          location_link: activeAttendee.event.location_link,
          latitude: activeAttendee.event.latitude,
          longitude: activeAttendee.event.longitude,
          link: activeAttendee.event.link,
          status: activeAttendee.event.status,
          current_participants: activeAttendee.event.current_participants,
          code: activeAttendee.event.code,
          creator: {
            id: activeAttendee.event.creator.id,
            name: activeAttendee.event.creator.name,
          },
        },
      };
    }

    const processingTime = Date.now() - startTime;
    logger.info('Callback authentication completed successfully:', {
      isExistingUser: !!existingUser,
      userId: user.id,
      processingTimeMs: processingTime,
      responseStatus: existingUser ? 200 : 201,
    });

    const successMessage = existingUser
      ? activeAttendee
        ? 'Login successful - You are currently in an active event'
        : 'Login successful'
      : activeAttendee
        ? 'User created and logged in successfully - You are currently in an active event'
        : 'User created and logged in successfully';

    sendSuccess(res, successMessage, responseData, existingUser ? 200 : 201);

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
