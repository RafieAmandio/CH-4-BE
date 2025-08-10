import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { validate } from '../../../src/utils/validation';
import { sendError } from '../../../src/utils/response';

// Mock express-validator
jest.mock('express-validator', () => ({
  validationResult: jest.fn()
}));

// Mock response utility
jest.mock('../../../src/utils/response', () => ({
  sendError: jest.fn()
}));

describe('Validation Utils', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockValidationResult: jest.MockedFunction<typeof validationResult>;
  let mockSendError: jest.MockedFunction<typeof sendError>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {};
    mockNext = jest.fn();
    mockValidationResult = validationResult as jest.MockedFunction<typeof validationResult>;
    mockSendError = sendError as jest.MockedFunction<typeof sendError>;
    
    jest.clearAllMocks();
  });

  describe('validate', () => {
    it('should call next() when validation passes', () => {
      // Mock validation result with no errors
      mockValidationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => []
      } as any);

      validate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockSendError).not.toHaveBeenCalled();
    });

    it('should send error response when validation fails', () => {
      const validationErrors = [
        {
          path: 'email',
          msg: 'Email is required'
        },
        {
          path: 'password',
          msg: 'Password must be at least 6 characters'
        }
      ];

      // Mock validation result with errors
      mockValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => validationErrors
      } as any);

      validate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockSendError).toHaveBeenCalledWith(
        mockResponse,
        'Validation Error',
        [
          { field: 'email', message: 'Email is required' },
          { field: 'password', message: 'Password must be at least 6 characters' }
        ],
        400
      );
    });

    it('should handle single validation error', () => {
      const validationErrors = [
        {
          path: 'username',
          msg: 'Username is required'
        }
      ];

      mockValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => validationErrors
      } as any);

      validate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockSendError).toHaveBeenCalledWith(
        mockResponse,
        'Validation Error',
        [
          { field: 'username', message: 'Username is required' }
        ],
        400
      );
    });

    it('should handle validation errors with nested field paths', () => {
      const validationErrors = [
        {
          path: 'user.profile.name',
          msg: 'Name is required'
        }
      ];

      mockValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => validationErrors
      } as any);

      validate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockSendError).toHaveBeenCalledWith(
        mockResponse,
        'Validation Error',
        [
          { field: 'user.profile.name', message: 'Name is required' }
        ],
        400
      );
    });

    it('should handle empty validation errors array', () => {
      mockValidationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => []
      } as any);

      validate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockSendError).not.toHaveBeenCalled();
    });

    it('should transform validation errors correctly', () => {
      const validationErrors = [
        {
          path: 'email',
          msg: 'Invalid email format',
          value: 'invalid-email'
        },
        {
          path: 'age',
          msg: 'Age must be a number',
          value: 'not-a-number'
        }
      ];

      mockValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => validationErrors
      } as any);

      validate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockSendError).toHaveBeenCalledWith(
        mockResponse,
        'Validation Error',
        [
          { field: 'email', message: 'Invalid email format' },
          { field: 'age', message: 'Age must be a number' }
        ],
        400
      );
    });
  });
});