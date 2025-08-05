import { Request } from "express";
import { User } from "@prisma/client";

export interface ApiResponse<T = any> {
  message: string;
  content: T;
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
  sortOrder?: "asc" | "desc";
}

export interface Error {
  field: string;
  message: string;
}

export interface AuthRequest extends Request {
  user?: User;
}

export interface UserPayload {
  id: string;
  email: string;
}

export interface RegisterInput {
  name: string;
  password: string;
  grade: string;
  school: string;
  phone: string;
  email: string;
  major: string;
  interests: string[];
  referral?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
