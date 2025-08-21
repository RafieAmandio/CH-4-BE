// import {
//   parsePagination,
//   createPaginatedResponse,
//   DEFAULT_PAGE,
//   DEFAULT_LIMIT
// } from '../../../src/utils/pagination';
// import { PaginationQuery, ListResponse } from '../../../src/types';

// describe('Pagination Utils', () => {
//   describe('parsePagination', () => {
//     it('should return default values for empty query', () => {
//       const query: PaginationQuery = {};
//       const result = parsePagination(query);

//       expect(result).toEqual({
//         page: DEFAULT_PAGE,
//         limit: DEFAULT_LIMIT,
//         skip: 0,
//         search: undefined,
//         sortBy: undefined,
//         sortOrder: undefined
//       });
//     });

//     it('should parse valid page and limit', () => {
//       const query: PaginationQuery = {
//         page: 2,
//         limit: 20
//       };
//       const result = parsePagination(query);

//       expect(result).toEqual({
//         page: 2,
//         limit: 20,
//         skip: 20, // (2-1) * 20
//         search: undefined,
//         sortBy: undefined,
//         sortOrder: undefined
//       });
//     });

//     it('should handle invalid page and limit values', () => {
//       const query: any = {
//         page: 'invalid',
//         limit: 'invalid'
//       };
//       const result = parsePagination(query);

//       expect(result).toEqual({
//         page: DEFAULT_PAGE,
//         limit: DEFAULT_LIMIT,
//         skip: 0,
//         search: undefined,
//         sortBy: undefined,
//         sortOrder: undefined
//       });
//     });

//     it('should enforce minimum page value of 1', () => {
//       const query: PaginationQuery = {
//         page: 0
//       };
//       const result = parsePagination(query);

//       expect(result.page).toBe(1);
//       expect(result.skip).toBe(0);
//     });

//     it('should enforce minimum limit value of 1', () => {
//       const query: PaginationQuery = {
//         limit: 0
//       };
//       const result = parsePagination(query);

//       expect(result.limit).toBe(1);
//     });

//     it('should enforce maximum limit value of 100', () => {
//       const query: PaginationQuery = {
//         limit: 150
//       };
//       const result = parsePagination(query);

//       expect(result.limit).toBe(100);
//     });

//     it('should handle negative page and limit values', () => {
//       const query: PaginationQuery = {
//         page: -5,
//         limit: -10
//       };
//       const result = parsePagination(query);

//       expect(result.page).toBe(1);
//       expect(result.limit).toBe(1);
//       expect(result.skip).toBe(0);
//     });

//     it('should parse search parameter', () => {
//       const query: PaginationQuery = {
//         search: 'test query'
//       };
//       const result = parsePagination(query);

//       expect(result.search).toBe('test query');
//     });

//     it('should parse sortBy parameter', () => {
//       const query: PaginationQuery = {
//         sortBy: 'name'
//       };
//       const result = parsePagination(query);

//       expect(result.sortBy).toBe('name');
//     });

//     it('should parse sortOrder parameter', () => {
//       const query: PaginationQuery = {
//         sortOrder: 'desc'
//       };
//       const result = parsePagination(query);

//       expect(result.sortOrder).toBe('desc');
//     });

//     it('should parse all parameters together', () => {
//       const query: PaginationQuery = {
//         page: 3,
//         limit: 25,
//         search: 'john doe',
//         sortBy: 'createdAt',
//         sortOrder: 'asc'
//       };
//       const result = parsePagination(query);

//       expect(result).toEqual({
//         page: 3,
//         limit: 25,
//         skip: 50, // (3-1) * 25
//         search: 'john doe',
//         sortBy: 'createdAt',
//         sortOrder: 'asc'
//       });
//     });

//     it('should calculate skip correctly for different pages', () => {
//       const testCases = [
//         { page: 1, limit: 10, expectedSkip: 0 },
//         { page: 2, limit: 10, expectedSkip: 10 },
//         { page: 3, limit: 15, expectedSkip: 30 },
//         { page: 5, limit: 20, expectedSkip: 80 }
//       ];

//       testCases.forEach(({ page, limit, expectedSkip }) => {
//         const query: PaginationQuery = {
//           page: page,
//           limit: limit
//         };
//         const result = parsePagination(query);

//         expect(result.skip).toBe(expectedSkip);
//       });
//     });
//   });

//   describe('createPaginatedResponse', () => {
//     it('should create paginated response with correct structure', () => {
//       const data = [{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }];
//       const totalData = 25;
//       const page = 1;
//       const limit = 10;

//       const result = createPaginatedResponse(data, totalData, page, limit);

//       expect(result).toEqual({
//         totalData: 25,
//         totalPage: 3, // Math.ceil(25 / 10)
//         entries: data
//       });
//     });

//     it('should calculate total pages correctly', () => {
//       const testCases = [
//         { totalData: 0, limit: 10, expectedTotalPage: 0 },
//         { totalData: 5, limit: 10, expectedTotalPage: 1 },
//         { totalData: 10, limit: 10, expectedTotalPage: 1 },
//         { totalData: 11, limit: 10, expectedTotalPage: 2 },
//         { totalData: 25, limit: 10, expectedTotalPage: 3 },
//         { totalData: 100, limit: 20, expectedTotalPage: 5 }
//       ];

//       testCases.forEach(({ totalData, limit, expectedTotalPage }) => {
//         const result = createPaginatedResponse([], totalData, 1, limit);
//         expect(result.totalPage).toBe(expectedTotalPage);
//       });
//     });

//     it('should handle empty data array', () => {
//       const data: any[] = [];
//       const totalData = 0;
//       const page = 1;
//       const limit = 10;

//       const result = createPaginatedResponse(data, totalData, page, limit);

//       expect(result).toEqual({
//         totalData: 0,
//         totalPage: 0,
//         entries: []
//       });
//     });

//     it('should handle single item', () => {
//       const data = [{ id: 1, name: 'Single Item' }];
//       const totalData = 1;
//       const page = 1;
//       const limit = 10;

//       const result = createPaginatedResponse(data, totalData, page, limit);

//       expect(result).toEqual({
//         totalData: 1,
//         totalPage: 1,
//         entries: data
//       });
//     });

//     it('should handle large datasets', () => {
//       const data = Array.from({ length: 50 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` }));
//       const totalData = 1000;
//       const page = 5;
//       const limit = 50;

//       const result = createPaginatedResponse(data, totalData, page, limit);

//       expect(result).toEqual({
//         totalData: 1000,
//         totalPage: 20, // Math.ceil(1000 / 50)
//         entries: data
//       });
//     });

//     it('should work with different data types', () => {
//       const data = [
//         { id: 'uuid-1', title: 'Post 1', published: true },
//         { id: 'uuid-2', title: 'Post 2', published: false }
//       ];
//       const totalData = 15;
//       const page = 2;
//       const limit = 5;

//       const result = createPaginatedResponse(data, totalData, page, limit);

//       expect(result).toEqual({
//         totalData: 15,
//         totalPage: 3, // Math.ceil(15 / 5)
//         entries: data
//       });
//     });
//   });
// });