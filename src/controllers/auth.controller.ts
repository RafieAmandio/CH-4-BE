import { Request, Response } from 'express';
import { AuthRequest } from '../types/index.js';
import {
  RegisterInput,
  LoginInput,
  CallbackInput,
} from '../types/auth.types.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { generateToken } from '../utils/token.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logger } from '../config/logger.js';
import prisma from '../config/database.js';

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
        auth: userData.auth,
        email: userData.email,
        password_hash: hashedPassword,
        username: userData.username,
        name: userData.name,
        nickname: userData.nickname,
        photo_link: userData.photo,
        is_active: userData.is_active,
      },
    });

    // Generate token
    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
    });

    // Return user data (excluding password)
    const { password_hash: _passwordHash, ...userWithoutPassword } = newUser;

    sendSuccess(
      res,
      'User registered successfully',
      { user: userWithoutPassword, token },
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

    // Return user data (excluding password)
    const { password_hash: _passwordHash, ...userWithoutPassword } = user;

    sendSuccess(
      res,
      'Login successful',
      { user: userWithoutPassword, token },
      200
    );
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

    // Return user data (excluding password)
    const { password_hash: _passwordHash, ...userWithoutPassword } = user;

    sendSuccess(
      res,
      'Profile retrieved successfully',
      userWithoutPassword,
      200
    );
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

export const callback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name, provider }: CallbackInput = req.body;

    // Check if user exists by email (OAuth users might have different IDs)
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    let user;

    if (existingUser) {
      // User exists, update their information and treat like login
      user = await prisma.user.update({
        where: { email },
        data: {
          name,
          auth: provider,
        },
      });
    } else {
      // User doesn't exist, create new user
      user = await prisma.user.create({
        data: {
          email,
          name,
          auth: provider,
          is_active: true, // OAuth users are active by default
        },
      });
    }

    // Generate token for both existing and new users
    const token = generateToken({
      id: user.id,
      email: user.email,
    });

    // Return user data (excluding password)
    const { password_hash: _passwordHash, ...userWithoutPassword } = user;

    sendSuccess(
      res,
      existingUser
        ? 'Login successful'
        : 'User created and logged in successfully',
      { user: userWithoutPassword, token },
      existingUser ? 200 : 201
    );
  } catch (error) {
    logger.error('Callback error:', error);
    sendError(
      res,
      'Callback failed',
      [{ field: 'server', message: 'An error occurred during callback' }],
      500
    );
  }
};
