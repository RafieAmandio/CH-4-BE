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

export interface CallbackInput {
  id: string;
  email: string;
  name: string;
  provider: 'APPLE' | 'LINKEDIN' | 'EMAIL';
}
