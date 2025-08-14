import { PaginationQuery, ListResponse } from '../types/index.js';

/**
 * Default pagination values
 */
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;

/**
 * Parse pagination parameters from query
 * @param query Query parameters
 * @returns Parsed pagination parameters
 */
export const parsePagination = (
  query: PaginationQuery
): {
  page: number;
  limit: number;
  skip: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
} => {
  const page = Math.max(1, Number(query.page) || DEFAULT_PAGE);
  const limitValue =
    query.limit !== undefined ? Number(query.limit) : DEFAULT_LIMIT;
  const limit = Math.max(
    1,
    Math.min(100, isNaN(limitValue) ? DEFAULT_LIMIT : limitValue)
  );
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
    search: query.search,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
  };
};

/**
 * Create a paginated response
 * @param data Array of items
 * @param totalData Total count of items
 * @param page Current page number
 * @param limit Items per page
 * @returns Paginated response object
 */
export const createPaginatedResponse = <T>(
  data: T[],
  totalData: number,
  page: number,
  limit: number
): ListResponse<T> => {
  return {
    totalData,
    totalPage: Math.ceil(totalData / limit),
    entries: data,
  };
};
