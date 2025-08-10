import { Request, Response } from 'express';
import { register, login, getProfile } from '../../../src/controllers/auth.controller';
import { hashPassword, verifyPassword } from '../../../src/utils/password';
import { generateToken } from '../../../src/utils/token';
import { sendSuccess, sendError } from '../../../src/utils/response';
import { logger } from '../../../src/config/logger';
import prisma from '../../../src/config/database';
import { AuthRequest } from '../../../src/types';

// Mock dependencies
jest.mock('../../../src/utils/password');
jest.mock('../../../src/utils/token');
jest.mock('../../../src/utils/response');
jest.mock('../../../src/config/logger');
jest.mock('../../../src/config/database', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn()
  }
}));

const mockHashPassword = hashPassword as jest.MockedFunction<typeof hashPassword>;
const mockVerifyPassword = verifyPassword as jest.MockedFunction<typeof verifyPassword>;
const mockGenerateToken = generateToken as jest.MockedFunction<typeof generateToken>;
const mockSendSuccess = sendSuccess as jest.MockedFunction<typeof sendSuccess>;
const mockSendError = sendError as jest.MockedFunction<typeof sendError>;
const mockLogger = logger as jest.Mocked<typeof logger>;
const mockPrismaUserFindUnique = prisma.user.findUnique as jest.MockedFunction<typeof prisma.user.findUnique>;
const mockPrismaUserCreate = prisma.user.create as jest.MockedFunction<typeof prisma.user.create>;

describe('Auth Controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockAuthReq: Partial<AuthRequest>;

  beforeEach(() => {
    mockReq = {
      body: {}
    };
    mockRes = {};
    mockAuthReq = {
      body: {},
      user: undefined
    };

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('register', () => {
    const mockRegisterData = {
      auth: 'local',
      email: 'test@example.com',
      password: 'password123',
      username: 'testuser',
      name: 'Test User',
      nickname: 'Tester',
      photo: 'photo.jpg',
      is_active: true
    };

    it('should register a new user successfully', async () => {
      const mockHashedPassword = 'hashed_password_123';
      const mockToken = 'jwt_token_123';
      const mockNewUser = {
        id: '1',
        ...mockRegisterData,
        passwordHash: mockHashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockReq.body = mockRegisterData;
      mockPrismaUserFindUnique.mockResolvedValue(null);
      mockHashPassword.mockResolvedValue(mockHashedPassword);
      mockPrismaUserCreate.mockResolvedValue(mockNewUser as any);
      mockGenerateToken.mockReturnValue(mockToken);

      await register(mockReq as Request, mockRes as Response);

      expect(mockPrismaUserFindUnique).toHaveBeenCalledWith({
        where: { email: mockRegisterData.email }
      });
      expect(mockHashPassword).toHaveBeenCalledWith(mockRegisterData.password);
      expect(mockPrismaUserCreate).toHaveBeenCalledWith({
        data: {
          auth: mockRegisterData.auth,
          email: mockRegisterData.email,
          passwordHash: mockHashedPassword,
          username: mockRegisterData.username,
          name: mockRegisterData.name,
          nickname: mockRegisterData.nickname,
          photo: mockRegisterData.photo,
          is_active: mockRegisterData.is_active
        }
      });
      expect(mockGenerateToken).toHaveBeenCalledWith({
        id: mockNewUser.id,
        email: mockNewUser.email
      });
      const { passwordHash, ...expectedUser } = mockNewUser;
      expect(mockSendSuccess).toHaveBeenCalledWith(
        mockRes,
        'User registered successfully',
        { user: expectedUser, token: mockToken },
        201
      );
    });

    it('should return error when email already exists', async () => {
      const existingUser = {
        id: '1',
        email: mockRegisterData.email,
        username: 'existinguser'
      };

      mockReq.body = mockRegisterData;
      mockPrismaUserFindUnique.mockResolvedValue(existingUser as any);

      await register(mockReq as Request, mockRes as Response);

      expect(mockSendError).toHaveBeenCalledWith(
        mockRes,
        'Registration failed',
        [{ field: 'email', message: 'Email already in use' }],
        400
      );
      expect(mockHashPassword).not.toHaveBeenCalled();
      expect(mockPrismaUserCreate).not.toHaveBeenCalled();
    });

    it('should handle database errors during registration', async () => {
      const dbError = new Error('Database connection failed');

      mockReq.body = mockRegisterData;
      mockPrismaUserFindUnique.mockRejectedValue(dbError);

      await register(mockReq as Request, mockRes as Response);

      expect(mockLogger.error).toHaveBeenCalledWith('Registration error:', dbError);
      expect(mockSendError).toHaveBeenCalledWith(
        mockRes,
        'Registration failed',
        [{ field: 'server', message: 'An error occurred during registration' }],
        500
      );
    });

    it('should handle password hashing errors', async () => {
      const hashError = new Error('Password hashing failed');

      mockReq.body = mockRegisterData;
      mockPrismaUserFindUnique.mockResolvedValue(null);
      mockHashPassword.mockRejectedValue(hashError);

      await register(mockReq as Request, mockRes as Response);

      expect(mockLogger.error).toHaveBeenCalledWith('Registration error:', hashError);
      expect(mockSendError).toHaveBeenCalledWith(
        mockRes,
        'Registration failed',
        [{ field: 'server', message: 'An error occurred during registration' }],
        500
      );
    });
  });

  describe('login', () => {
    const mockLoginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    const mockUser = {
      id: '1',
      email: 'test@example.com',
      username: 'testuser',
      name: 'Test User',
      passwordHash: 'hashed_password_123',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should login user successfully with valid credentials', async () => {
      const mockToken = 'jwt_token_123';
      const { passwordHash: _passwordHash, ...userWithoutPassword } = mockUser;

      mockReq.body = mockLoginData;
      mockPrismaUserFindUnique.mockResolvedValue(mockUser as any);
      mockVerifyPassword.mockResolvedValue(true);
      mockGenerateToken.mockReturnValue(mockToken);

      await login(mockReq as Request, mockRes as Response);

      expect(mockPrismaUserFindUnique).toHaveBeenCalledWith({
        where: { email: mockLoginData.email }
      });
      expect(mockVerifyPassword).toHaveBeenCalledWith(
        mockLoginData.password,
        mockUser.passwordHash
      );
      expect(mockGenerateToken).toHaveBeenCalledWith({
        id: mockUser.id,
        email: mockUser.email
      });
      expect(mockSendSuccess).toHaveBeenCalledWith(
        mockRes,
        'Login successful',
        { user: userWithoutPassword, token: mockToken },
        200
      );
    });

    it('should return error when user does not exist', async () => {
      mockReq.body = mockLoginData;
      mockPrismaUserFindUnique.mockResolvedValue(null);

      await login(mockReq as Request, mockRes as Response);

      expect(mockSendError).toHaveBeenCalledWith(
        mockRes,
        'Login failed',
        [{ field: 'credentials', message: 'Invalid email or password' }],
        401
      );
      expect(mockVerifyPassword).not.toHaveBeenCalled();
      expect(mockGenerateToken).not.toHaveBeenCalled();
    });

    it('should return error when password is incorrect', async () => {
      mockReq.body = mockLoginData;
      mockPrismaUserFindUnique.mockResolvedValue(mockUser as any);
      mockVerifyPassword.mockResolvedValue(false);

      await login(mockReq as Request, mockRes as Response);

      expect(mockVerifyPassword).toHaveBeenCalledWith(
        mockLoginData.password,
        mockUser.passwordHash
      );
      expect(mockSendError).toHaveBeenCalledWith(
        mockRes,
        'Login failed',
        [{ field: 'credentials', message: 'Invalid email or password' }],
        401
      );
      expect(mockGenerateToken).not.toHaveBeenCalled();
    });

    it('should handle database errors during login', async () => {
      const dbError = new Error('Database connection failed');

      mockReq.body = mockLoginData;
      mockPrismaUserFindUnique.mockRejectedValue(dbError);

      await login(mockReq as Request, mockRes as Response);

      expect(mockLogger.error).toHaveBeenCalledWith('Login error:', dbError);
      expect(mockSendError).toHaveBeenCalledWith(
        mockRes,
        'Login failed',
        [{ field: 'server', message: 'An error occurred during login' }],
        500
      );
    });

    it('should handle password verification errors', async () => {
      const verifyError = new Error('Password verification failed');

      mockReq.body = mockLoginData;
      mockPrismaUserFindUnique.mockResolvedValue(mockUser as any);
      mockVerifyPassword.mockRejectedValue(verifyError);

      await login(mockReq as Request, mockRes as Response);

      expect(mockLogger.error).toHaveBeenCalledWith('Login error:', verifyError);
      expect(mockSendError).toHaveBeenCalledWith(
        mockRes,
        'Login failed',
        [{ field: 'server', message: 'An error occurred during login' }],
        500
      );
    });
  });

  describe('getProfile', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      username: 'testuser',
      name: 'Test User',
      passwordHash: 'hashed_password_123',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should return user profile successfully', async () => {
      mockAuthReq.user = mockUser as any;

      await getProfile(mockAuthReq as AuthRequest, mockRes as Response);

      const { passwordHash, ...expectedUser } = mockUser;
      expect(mockSendSuccess).toHaveBeenCalledWith(
        mockRes,
        'Profile retrieved successfully',
        expectedUser,
        200
      );
    });

    it('should return error when user is not authenticated', async () => {
      mockAuthReq.user = undefined;

      await getProfile(mockAuthReq as AuthRequest, mockRes as Response);

      expect(mockSendError).toHaveBeenCalledWith(
        mockRes,
        'Authentication required',
        [{ field: 'auth', message: 'User not authenticated' }],
        401
      );
    });

    it('should handle errors during profile retrieval', async () => {
      const profileError = new Error('Profile retrieval failed');
      mockAuthReq.user = mockUser as any;

      // Mock sendSuccess to throw an error
      mockSendSuccess.mockImplementation(() => {
        throw profileError;
      });

      await getProfile(mockAuthReq as AuthRequest, mockRes as Response);

      expect(mockLogger.error).toHaveBeenCalledWith('Get profile error:', profileError);
      expect(mockSendError).toHaveBeenCalledWith(
        mockRes,
        'Failed to retrieve profile',
        [{
          field: 'server',
          message: 'An error occurred while retrieving profile'
        }],
        500
      );
    });

    it('should return user profile when user is null', async () => {
      mockAuthReq.user = null as any;

      await getProfile(mockAuthReq as AuthRequest, mockRes as Response);

      expect(mockSendError).toHaveBeenCalledWith(
        mockRes,
        'Authentication required',
        [{ field: 'auth', message: 'User not authenticated' }],
        401
      );
    });
  });
});