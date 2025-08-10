import jwt from 'jsonwebtoken';
import { generateToken, verifyToken, extractTokenFromHeader } from '../../../src/utils/token';
import { UserPayload } from '../../../src/types';

// Mock the environment config
jest.mock('../../../src/config/environment', () => ({
  env: {
    JWT_SECRET: 'test-secret-key'
  }
}));

// Mock logger to avoid console output during tests
jest.mock('../../../src/config/logger', () => ({
  logger: {
    error: jest.fn()
  }
}));

describe('Token Utils', () => {
  const mockUserPayload: UserPayload = {
    id: 'test-user-id',
    email: 'test@example.com'
  };

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(mockUserPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should generate different tokens for different payloads', () => {
      const payload1: UserPayload = { id: 'user1', email: 'user1@example.com' };
      const payload2: UserPayload = { id: 'user2', email: 'user2@example.com' };

      const token1 = generateToken(payload1);
      const token2 = generateToken(payload2);

      expect(token1).not.toBe(token2);
    });

    it('should include expiration time in token', () => {
      const token = generateToken(mockUserPayload);
      const decoded = jwt.decode(token) as any;

      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp - decoded.iat).toBe(7 * 24 * 60 * 60); // 7 days in seconds
    });
  });

  describe('verifyToken', () => {
    it('should verify and decode a valid token', () => {
      const token = generateToken(mockUserPayload);
      const decoded = verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded?.id).toBe(mockUserPayload.id);
      expect(decoded?.email).toBe(mockUserPayload.email);
    });

    it('should return null for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      const decoded = verifyToken(invalidToken);

      expect(decoded).toBeNull();
    });

    it('should return null for expired token', () => {
      // Create an expired token
      const expiredToken = jwt.sign(
        mockUserPayload,
        'test-secret-key',
        { expiresIn: '-1s' }
      );

      const decoded = verifyToken(expiredToken);
      expect(decoded).toBeNull();
    });

    it('should return null for token with wrong secret', () => {
      const tokenWithWrongSecret = jwt.sign(
        mockUserPayload,
        'wrong-secret',
        { expiresIn: '7d' }
      );

      const decoded = verifyToken(tokenWithWrongSecret);
      expect(decoded).toBeNull();
    });

    it('should return null for malformed token', () => {
      const malformedToken = 'not.a.valid.jwt.token';
      const decoded = verifyToken(malformedToken);

      expect(decoded).toBeNull();
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from valid Bearer header', () => {
      const token = 'valid.jwt.token';
      const authHeader = `Bearer ${token}`;
      const extractedToken = extractTokenFromHeader(authHeader);

      expect(extractedToken).toBe(token);
    });

    it('should return null for header without Bearer prefix', () => {
      const authHeader = 'valid.jwt.token';
      const extractedToken = extractTokenFromHeader(authHeader);

      expect(extractedToken).toBeNull();
    });

    it('should return null for undefined header', () => {
      const extractedToken = extractTokenFromHeader(undefined);

      expect(extractedToken).toBeNull();
    });

    it('should return null for empty header', () => {
      const extractedToken = extractTokenFromHeader('');

      expect(extractedToken).toBeNull();
    });

    it('should return null for header with only Bearer', () => {
      const authHeader = 'Bearer';
      const extractedToken = extractTokenFromHeader(authHeader);

      expect(extractedToken).toBeNull();
    });

    it('should return null for header with Bearer and space only', () => {
      const authHeader = 'Bearer ';
      const extractedToken = extractTokenFromHeader(authHeader);

      expect(extractedToken).toBe('');
    });

    it('should handle Bearer with extra spaces', () => {
      const token = 'valid.jwt.token';
      const authHeader = `Bearer  ${token}`; // Extra space
      const extractedToken = extractTokenFromHeader(authHeader);

      expect(extractedToken).toBe(` ${token}`);
    });
  });
});