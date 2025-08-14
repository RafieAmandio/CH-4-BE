import bcrypt from 'bcryptjs';
import { logger } from '../config/logger.js';

/**
 * Hash a password using bcrypt
 * @param password The plain password to hash
 * @returns The hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

/**
 * Verify if a plain password matches a hashed password
 * @param plainPassword The plain password to verify
 * @param hashedPassword The hashed password to compare against
 * @returns True if the passwords match, false otherwise
 * @throws Error if the hash format is invalid
 */
export const verifyPassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  // Validate hash format - bcrypt hashes start with $2a$, $2b$, $2x$, or $2y$ and have specific length
  const bcryptHashRegex = /^\$2[abxy]?\$\d+\$.{53}$/;
  if (!bcryptHashRegex.test(hashedPassword)) {
    throw new Error('Invalid hash format');
  }

  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    logger.error('Error comparing passwords:', error);
    throw new Error('Invalid hash format');
  }
};
