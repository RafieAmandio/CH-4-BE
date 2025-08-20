import { Response, NextFunction } from 'express';
import { extractTokenFromHeader, verifyToken } from '../utils/token.js';
import { sendError } from '../utils/response.js';
import prisma from '../config/database.js';
import { AuthRequest } from '../types/index.js';
import { logger } from '../config/logger.js';
import {
  verifySupabaseToken,
  extractSupabaseToken,
} from '../utils/supabase.js';

/**
 * Authentication middleware to protect routes
 * Verifies the JWT token and attaches the user to the request
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      sendError(
        res,
        'Authentication required',
        [{ field: 'token', message: 'No token provided' }],
        401
      );
      return;
    }

    // Verify token
    const payload = verifyToken(token);

    if (!payload) {
      sendError(
        res,
        'Authentication failed',
        [{ field: 'token', message: 'Invalid or expired token' }],
        401
      );
      return;
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!user) {
      sendError(
        res,
        'Authentication failed',
        [{ field: 'token', message: 'User not found' }],
        401
      );
      return;
    }

    // Attach user to request
    req.user = user;

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    sendError(
      res,
      'Authentication error',
      [{ field: 'auth', message: 'An error occurred during authentication' }],
      500
    );
  }
};

/**
 * Supabase authentication middleware
 * Verifies Supabase token and attaches Supabase user data to request
 */
export const authenticateSupabase = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract Supabase token from Authorization header
    const authHeader = req.headers.authorization;
    const supabaseToken = extractSupabaseToken(authHeader);

    if (!supabaseToken) {
      sendError(
        res,
        'Authentication required',
        [{ field: 'token', message: 'No Supabase token provided' }],
        401
      );
      return;
    }

    // Verify Supabase token and get user data
    const supabaseUser = await verifySupabaseToken(supabaseToken);

    if (!supabaseUser || !supabaseUser.email) {
      sendError(
        res,
        'Authentication failed',
        [
          {
            field: 'token',
            message: 'Invalid Supabase token or missing email',
          },
        ],
        401
      );
      return;
    }

    // Attach Supabase user data to request
    req.supabaseUser = supabaseUser;

    next();
  } catch (error) {
    logger.error('Supabase authentication error:', error);
    sendError(
      res,
      'Authentication error',
      [
        {
          field: 'auth',
          message: 'An error occurred during Supabase authentication',
        },
      ],
      500
    );
  }
};
