import apiClient, { ApiResponse, handleApiError } from './api';
import type { User, AuthTokens, LoginCredentials } from '../types';

/**
 * Authentication Service
 * Handles user authentication with AWS Cognito
 */

// Storage keys from environment variables
const AUTH_TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_KEY || 'auth_token';
const REFRESH_TOKEN_KEY = import.meta.env.VITE_REFRESH_TOKEN_KEY || 'refresh_token';
const ID_TOKEN_KEY = import.meta.env.VITE_ID_TOKEN_KEY || 'id_token';
const USER_KEY = import.meta.env.VITE_USER_DATA_KEY || 'user_data';

// Login with email and password
export const login = async (credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> => {
  try {
    const response = await apiClient.post<ApiResponse<{
      access_token: string;
      id_token: string;
      refresh_token: string;
      expires_in: number;
      token_type: string;
      user: User;
    }>>(
      '/dev/asha/login',
      {
        email: credentials.email,
        password: credentials.password,
      }
    );

    if (!response.data.data) {
      throw new Error('Login failed');
    }

    const { user, access_token, id_token, refresh_token, expires_in, token_type } = response.data.data;

    const tokens: AuthTokens = {
      access_token,
      id_token,
      refresh_token,
      expires_in,
      token_type,
    };

    // Store tokens securely
    storeTokens(tokens);
    storeUser(user);

    return { user, tokens };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Logout user
export const logout = async (): Promise<void> => {
  try {
    // Call backend logout endpoint if available
    await apiClient.post('/auth/logout');
  } catch (error) {
    // Continue with local logout even if backend call fails
    console.error('Logout error:', error);
  } finally {
    // Clear all stored auth data
    clearAuthData();
  }
};

// Refresh access token
export const refreshToken = async (): Promise<AuthTokens> => {
  try {
    const refreshToken = getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<ApiResponse<AuthTokens>>(
      '/dev/auth/refresh',
      { refresh_token: refreshToken }
    );

    if (!response.data.data) {
      throw new Error('Token refresh failed');
    }

    const tokens = response.data.data;
    storeTokens(tokens);

    return tokens;
  } catch (error) {
    clearAuthData();
    throw new Error(handleApiError(error));
  }
};

// Get current user profile (ASHA worker)
export const getCurrentUser = async (): Promise<User> => {
  try {
    const storedUser = getStoredUser();
    if (!storedUser?.user_id) {
      throw new Error('No user ID found');
    }

    const response = await apiClient.get<ApiResponse<User>>(`/dev/asha/${storedUser.user_id}`);

    if (!response.data.data) {
      throw new Error('Failed to get user profile');
    }

    const user = response.data.data;
    storeUser(user);

    return user;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Update ASHA worker profile
export const updateProfile = async (profileData: Partial<User>): Promise<User> => {
  try {
    const storedUser = getStoredUser();
    if (!storedUser?.user_id) {
      throw new Error('No user ID found');
    }

    const response = await apiClient.put<ApiResponse<User>>(
      `/dev/asha/${storedUser.user_id}`,
      profileData
    );

    if (!response.data.data) {
      throw new Error('Failed to update profile');
    }

    const user = response.data.data;
    storeUser(user);

    return user;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Register new ASHA worker
export const registerASHA = async (registrationData: {
  name: string;
  phone: string;
  email: string;
  password: string;
  district: string;
}): Promise<User> => {
  try {
    const response = await apiClient.post<ApiResponse<User>>(
      '/dev/asha/register',
      registrationData
    );

    if (!response.data.data) {
      throw new Error('Failed to register ASHA worker');
    }

    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Verify if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  return !!token;
};

// Token storage helpers
export const storeTokens = (tokens: AuthTokens): void => {
  localStorage.setItem(AUTH_TOKEN_KEY, tokens.access_token);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
  if (tokens.id_token) {
    localStorage.setItem(ID_TOKEN_KEY, tokens.id_token);
  }
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const getIdToken = (): string | null => {
  return localStorage.getItem(ID_TOKEN_KEY);
};

// User storage helpers
export const storeUser = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getStoredUser = (): User | null => {
  const userData = localStorage.getItem(USER_KEY);
  if (!userData) return null;
  
  try {
    return JSON.parse(userData) as User;
  } catch {
    return null;
  }
};

// Clear all auth data
export const clearAuthData = (): void => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(ID_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// Check if token is expired (basic check)
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= expirationTime;
  } catch {
    return true;
  }
};

// Auto-refresh token if needed
export const ensureValidToken = async (): Promise<string> => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No authentication token');
  }

  if (isTokenExpired(token)) {
    const tokens = await refreshToken();
    return tokens.access_token;
  }

  return token;
};
