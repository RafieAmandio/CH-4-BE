export interface RegisterInput {
  auth: 'APPLE' | 'LINKEDIN' | 'EMAIL';
  email: string;
  password: string;
  username: string;
  name: string;
  nickname: string;
  photo: string;
  is_active: boolean;
}

export interface LoginInput {
  email: string;
  password: string;
}
