import { Request } from 'express';
import { Attendee, User } from '@prisma/client';
import { SupabaseUser } from './auth.types.js';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  errors: Error[];
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
  attendee?: Attendee;
  supabaseUser?: SupabaseUser;
}

export interface UserPayload {
  id?: string;
  attendeeId?: string;
  email?: string;
}

export interface PaginationResponse {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
