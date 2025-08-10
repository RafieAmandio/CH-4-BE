import bcrypt from 'bcryptjs';

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
 */
export const verifyPassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(plainPassword, hashedPassword);
};
