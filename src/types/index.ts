import { Request } from 'express';
import { User } from '@prisma/client';
import { SupabaseUser } from './auth.types.js';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  errors: Error[];
}

export interface ListResponse<T = any> {
  totalData: number;
  totalPage: number;
  entries: T[];
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface Error {
  field: string;
  message: string;
}

export interface AuthRequest extends Request {
  user?: User;
  supabaseUser?: SupabaseUser;
}

export interface UserPayload {
  id: string;
  email: string;
}
