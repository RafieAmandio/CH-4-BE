import { Response, NextFunction } from 'express';
import { extractTokenFromHeader, verifyToken } from '../utils/token.js';
import { sendError } from '../utils/response.js';
import prisma from '../config/database.js';
import { AuthRequest } from '../types/index.js';
import { logger } from '../config/logger.js';
import { createClient } from '@supabase/supabase-js';

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





export const authenticateSupabaseToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || '';

  const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
  try {
    console.log('authenticateToken');
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

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      sendError(
        res,
        'Authentication failed',
        [{ field: 'token', message: 'Invalid or expired token' }],
        401
      );
      return;
    }
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};