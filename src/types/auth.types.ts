export interface RegisterInput {
  auth_provider: 'APPLE' | 'LINKEDIN' | 'EMAIL';
  email: string;
  password: string;
  username: string;
  name: string;
  is_active: boolean;
}

export interface LoginInput {
  email: string;
  password: string;
}


// Supabase user type for middleware
export interface SupabaseUser {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    [key: string]: any;
  };
  app_metadata?: {
    provider?: string;
    [key: string]: any;
  };
  [key: string]: any;
}
