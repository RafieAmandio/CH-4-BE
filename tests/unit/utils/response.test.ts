// import { Response } from 'express';
// import { sendSuccess, sendPaginatedSuccess, sendError } from '../../../src/utils/response';
// import { ApiResponse, Error, ListResponse } from '../../../src/types';

// describe('Response Utils', () => {
//   let mockResponse: Partial<Response>;
//   let mockJson: jest.Mock;
//   let mockStatus: jest.Mock;

//   beforeEach(() => {
//     mockJson = jest.fn();
//     mockStatus = jest.fn().mockReturnValue({ json: mockJson });
//     mockResponse = {
//       status: mockStatus,
//       json: mockJson
//     };
//   });

//   describe('sendSuccess', () => {
//     it('should send success response with default status code 200', () => {
//       const message = 'Operation successful';
//       const data = { id: 1, name: 'Test' };

//       sendSuccess(mockResponse as Response, message, data);

//       expect(mockStatus).toHaveBeenCalledWith(200);
//       expect(mockJson).toHaveBeenCalledWith({
//         success: true,
//         message,
//         data: data,
//         errors: []
//       });
//     });

//     it('should send success response with custom status code', () => {
//       const message = 'Resource created';
//       const data = { id: 1, name: 'Test' };
//       const statusCode = 201;

//       sendSuccess(mockResponse as Response, message, data, statusCode);

//       expect(mockStatus).toHaveBeenCalledWith(201);
//       expect(mockJson).toHaveBeenCalledWith({
//         success: true,
//         message,
//         data: data,
//         errors: []
//       });
//     });

//     it('should handle null data', () => {
//       const message = 'Success with null data';
//       const data = null;

//       sendSuccess(mockResponse as Response, message, data);

//       expect(mockStatus).toHaveBeenCalledWith(200);
//       expect(mockJson).toHaveBeenCalledWith({
//         success: true,
//         message,
//         data: null,
//         errors: []
//       });
//     });

//     it('should handle array data', () => {
//       const message = 'Array data success';
//       const data = [{ id: 1 }, { id: 2 }];

//       sendSuccess(mockResponse as Response, message, data);

//       expect(mockStatus).toHaveBeenCalledWith(200);
//       expect(mockJson).toHaveBeenCalledWith({
//         success: true,
//         message,
//         data: data,
//         errors: []
//       });
//     });
//   });

//   describe('sendPaginatedSuccess', () => {
//     it('should send paginated success response with default status code 200', () => {
//       const message = 'Paginated data retrieved';
//       const data: ListResponse<any> = {
//         totalData: 100,
//         totalPage: 10,
//         entries: [{ id: 1 }, { id: 2 }]
//       };

//       sendPaginatedSuccess(mockResponse as Response, message, data);

//       expect(mockStatus).toHaveBeenCalledWith(200);
//       expect(mockJson).toHaveBeenCalledWith({
//         success: true,
//         message,
//         data: data,
//         errors: []
//       });
//     });

//     it('should send paginated success response with custom status code', () => {
//       const message = 'Paginated data created';
//       const data: ListResponse<any> = {
//         totalData: 1,
//         totalPage: 1,
//         entries: [{ id: 1 }]
//       };
//       const statusCode = 201;

//       sendPaginatedSuccess(mockResponse as Response, message, data, statusCode);

//       expect(mockStatus).toHaveBeenCalledWith(201);
//       expect(mockJson).toHaveBeenCalledWith({
//         success: true,
//         message,
//         data: data,
//         errors: []
//       });
//     });

//     it('should handle empty paginated data', () => {
//       const message = 'No data found';
//       const data: ListResponse<any> = {
//         totalData: 0,
//         totalPage: 0,
//         entries: []
//       };

//       sendPaginatedSuccess(mockResponse as Response, message, data);

//       expect(mockStatus).toHaveBeenCalledWith(200);
//       expect(mockJson).toHaveBeenCalledWith({
//         success: true,
//         message,
//         data: data,
//         errors: []
//       });
//     });
//   });

//   describe('sendError', () => {
//     it('should send error response with default status code 400', () => {
//       const message = 'Validation failed';
//       const errors: Error[] = [
//         { field: 'email', message: 'Email is required' },
//         { field: 'password', message: 'Password is too short' }
//       ];

//       sendError(mockResponse as Response, message, errors);

//       expect(mockStatus).toHaveBeenCalledWith(400);
//       expect(mockJson).toHaveBeenCalledWith({
//         success: false,
//         message,
//         data: null,
//         errors
//       });
//     });

//     it('should send error response with custom status code', () => {
//       const message = 'Unauthorized access';
//       const errors: Error[] = [
//         { field: 'auth', message: 'Invalid token' }
//       ];
//       const statusCode = 401;

//       sendError(mockResponse as Response, message, errors, statusCode);

//       expect(mockStatus).toHaveBeenCalledWith(401);
//       expect(mockJson).toHaveBeenCalledWith({
//         success: false,
//         message,
//         data: null,
//         errors
//       });
//     });

//     it('should send error response with empty errors array', () => {
//       const message = 'Internal server error';

//       sendError(mockResponse as Response, message);

//       expect(mockStatus).toHaveBeenCalledWith(400);
//       expect(mockJson).toHaveBeenCalledWith({
//         success: false,
//         message,
//         data: null,
//         errors: []
//       });
//     });

//     it('should handle server error status codes', () => {
//       const message = 'Database connection failed';
//       const errors: Error[] = [
//         { field: 'server', message: 'Unable to connect to database' }
//       ];
//       const statusCode = 500;

//       sendError(mockResponse as Response, message, errors, statusCode);

//       expect(mockStatus).toHaveBeenCalledWith(500);
//       expect(mockJson).toHaveBeenCalledWith({
//         success: false,
//         message,
//         data: null,
//         errors
//       });
//     });
//   });
// });