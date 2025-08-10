import { Request, Response, NextFunction } from 'express';
import { authenticate } from '../../../src/middlewares/auth.middleware';
import { extractTokenFromHeader, verifyToken } from '../../../src/utils/token';
import { sendError } from '../../../src/utils/response';
import prisma from '../../../src/config/database';
import { logger } from '../../../src/config/logger';
import { AuthRequest } from '../../../src/types';

// Mock dependencies
jest.mock('../../../src/utils/token');
jest.mock('../../../src/utils/response');
jest.mock('../../../src/config/database', () => ({
  user: {
    findUnique: jest.fn()
  }
}));
jest.mock('../../../src/config/logger');

const mockExtractTokenFromHeader = extractTokenFromHeader as jest.MockedFunction<typeof extractTokenFromHeader>;
const mockVerifyToken = verifyToken as jest.MockedFunction<typeof verifyToken>;
const mockSendError = sendError as jest.MockedFunction<typeof sendError>;
const mockPrismaUserFindUnique = prisma.user.findUnique as jest.MockedFunction<typeof prisma.user.findUnique>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('Auth Middleware', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {}
    };
    mockRes = {};
    mockNext = jest.fn();

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should authenticate successfully with valid token and user', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        name: 'Test User'
      };
      const mockPayload = { id: '1', email: 'test@example.com' };

      mockReq.headers = { authorization: 'Bearer valid-token' };
      mockExtractTokenFromHeader.mockReturnValue('valid-token');
      mockVerifyToken.mockReturnValue(mockPayload);
      mockPrismaUserFindUnique.mockResolvedValue(mockUser as any);

      await authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockExtractTokenFromHeader).toHaveBeenCalledWith('Bearer valid-token');
      expect(mockVerifyToken).toHaveBeenCalledWith('valid-token');
      expect(mockPrismaUserFindUnique).toHaveBeenCalledWith({
        where: { id: '1' }
      });
      expect(mockReq.user).toBe(mockUser);
      expect(mockNext).toHaveBeenCalled();
      expect(mockSendError).not.toHaveBeenCalled();
    });

    it('should return 401 when no token is provided', async () => {
      mockReq.headers = {};
      mockExtractTokenFromHeader.mockReturnValue(null);

      await authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockSendError).toHaveBeenCalledWith(
        mockRes,
        'Authentication required',
        [{ field: 'token', message: 'No token provided' }],
        401
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when token is invalid', async () => {
      mockReq.headers = { authorization: 'Bearer invalid-token' };
      mockExtractTokenFromHeader.mockReturnValue('invalid-token');
      mockVerifyToken.mockReturnValue(null);

      await authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockSendError).toHaveBeenCalledWith(
        mockRes,
        'Authentication failed',
        [{ field: 'token', message: 'Invalid or expired token' }],
        401
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when user is not found', async () => {
      const mockPayload = { id: '999', email: 'nonexistent@example.com' };

      mockReq.headers = { authorization: 'Bearer valid-token' };
      mockExtractTokenFromHeader.mockReturnValue('valid-token');
      mockVerifyToken.mockReturnValue(mockPayload);
      mockPrismaUserFindUnique.mockResolvedValue(null);

      await authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockSendError).toHaveBeenCalledWith(
        mockRes,
        'Authentication failed',
        [{ field: 'token', message: 'User not found' }],
        401
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      const mockPayload = { id: '1', email: 'test@example.com' };
      const dbError = new Error('Database connection failed');

      mockReq.headers = { authorization: 'Bearer valid-token' };
      mockExtractTokenFromHeader.mockReturnValue('valid-token');
      mockVerifyToken.mockReturnValue(mockPayload);
      mockPrismaUserFindUnique.mockRejectedValue(dbError);

      await authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockLogger.error).toHaveBeenCalledWith('Authentication error:', dbError);
      expect(mockSendError).toHaveBeenCalledWith(
        mockRes,
        'Authentication error',
        [{ field: 'auth', message: 'An error occurred during authentication' }],
        500
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle token verification errors', async () => {
      const tokenError = new Error('Token verification failed');

      mockReq.headers = { authorization: 'Bearer malformed-token' };
      mockExtractTokenFromHeader.mockReturnValue('malformed-token');
      mockVerifyToken.mockImplementation(() => {
        throw tokenError;
      });

      await authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockLogger.error).toHaveBeenCalledWith('Authentication error:', tokenError);
      expect(mockSendError).toHaveBeenCalledWith(
        mockRes,
        'Authentication error',
        [{ field: 'auth', message: 'An error occurred during authentication' }],
        500
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle missing authorization header', async () => {
      mockReq.headers = { authorization: undefined };
      mockExtractTokenFromHeader.mockReturnValue(null);

      await authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockExtractTokenFromHeader).toHaveBeenCalledWith(undefined);
      expect(mockSendError).toHaveBeenCalledWith(
        mockRes,
        'Authentication required',
        [{ field: 'token', message: 'No token provided' }],
        401
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle empty authorization header', async () => {
      mockReq.headers = { authorization: '' };
      mockExtractTokenFromHeader.mockReturnValue(null);

      await authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockExtractTokenFromHeader).toHaveBeenCalledWith('');
      expect(mockSendError).toHaveBeenCalledWith(
        mockRes,
        'Authentication required',
        [{ field: 'token', message: 'No token provided' }],
        401
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});