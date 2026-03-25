/**
 * User and authentication-related type definitions
 */

export type UserRole = 'district_officer' | 'admin' | 'asha_worker' | 'anm' | 'driver';

export interface User {
  user_id: string;
  email: string;
  name: string;
  role: UserRole;
  district?: string;
  phone?: string;
  created_at?: string;
  last_login?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  id_token: string;
  expires_in: number;
  token_type: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
