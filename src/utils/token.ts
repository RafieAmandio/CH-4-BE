import jwt from 'jsonwebtoken';
import { env } from '../config/environment';
import { UserPayload } from '../types';
import { logger } from '../config/logger';

/**
 * Generate a JWT token for a user
 * @param payload The user payload to encode in the token
 * @returns The generated JWT token
 */
export const generateToken = (payload: UserPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '7d', // Token expires in 7 days
  });
};

/**
 * Verify and decode a JWT token
 * @param token The JWT token to verify
 * @returns The decoded user payload if valid, null otherwise
 */
export const verifyToken = (token: string): UserPayload | null => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as UserPayload;
    return decoded;
  } catch (error) {
    logger.error('Token verification error:', error);
    return null;
  }
};

/**
 * Extract a token from the Authorization header
 * @param authHeader The Authorization header value
 * @returns The token if present and valid, null otherwise
 */
export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.substring(7); // Remove 'Bearer ' prefix
};
