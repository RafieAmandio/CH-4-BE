import { Response } from 'express';
import { ApiResponse, Error, ListResponse } from '../types';

/**
 * Send a success response
 * @param res Express response object
 * @param message Success message
 * @param data The data to include in the response
 * @param statusCode HTTP status code (default: 200)
 */
export const sendSuccess = <T>(
  res: Response,
  message: string,
  data: T,
  statusCode = 200
): void => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data: data,
    errors: [],
  };

  res.status(statusCode).json(response);
};

/**
 * Send a paginated response
 * @param res Express response object
 * @param message Success message
 * @param data The paginated data to include in the response
 * @param statusCode HTTP status code (default: 200)
 */
export const sendPaginatedSuccess = <T>(
  res: Response,
  message: string,
  data: ListResponse<T>,
  statusCode = 200
): void => {
  const response: ApiResponse<ListResponse<T>> = {
    success: true,
    message,
    data: data,
    errors: [],
  };

  res.status(statusCode).json(response);
};

/**
 * Send an error response
 * @param res Express response object
 * @param message Error message
 * @param errors Array of errors
 * @param statusCode HTTP status code (default: 400)
 */
export const sendError = (
  res: Response,
  message: string,
  errors: Error[] = [],
  statusCode = 400
): void => {
  const response: ApiResponse<null> = {
    success: false,
    message,
    data: null,
    errors,
  };

  res.status(statusCode).json(response);
};
