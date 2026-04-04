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
      '/asha/login',
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

// Login as driver
export const loginDriver = async (credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> => {
  try {
    const response = await apiClient.post<ApiResponse<{
      access_token: string;
      id_token: string;
      refresh_token: string;
      expires_in: number;
      token_type: string;
      user: User;
    }>>(
      '/driver/login',
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
    // Note: Backend doesn't have a logout endpoint, just clear local data
    // Cognito tokens will expire naturally
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
      '/auth/refresh',
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

    const response = await apiClient.get<ApiResponse<User>>(`/asha/${storedUser.user_id}`);

    if (!response.data.data) {
      throw new Error('Failed to fetch user data');
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
      `/asha/${storedUser.user_id}`,
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
  age: number;
  district: string;
  village: string;
  block?: string;
  qualification?: string;
  experience_years?: number;
  languages?: string[];
}): Promise<User> => {
  try {
    const response = await apiClient.post<ApiResponse<User>>(
      '/asha/register',
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

// Register new District Officer via Cognito sign-up
export const registerOfficer = async (data: {
  name: string;
  email: string;
  phone: string;
  district: string;
  designation: string;
  employee_id: string;
  password: string;
}): Promise<void> => {
  const CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID;
  const REGION = import.meta.env.VITE_AWS_REGION || 'ap-south-1';
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const body = {
    ClientId: CLIENT_ID,
    Username: data.email,
    Password: data.password,
    UserAttributes: [
      { Name: 'name', Value: data.name },
      { Name: 'phone_number', Value: data.phone },
      { Name: 'custom:role', Value: 'OFFICER' },
      { Name: 'custom:district', Value: data.district },
    ],
  };

  const res = await fetch(
    `https://cognito-idp.${REGION}.amazonaws.com/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-amz-json-1.1',
        'X-Amz-Target': 'AWSCognitoIdentityProviderService.SignUp',
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    const msg = err.message || err.__type || 'Registration failed';
    throw new Error(msg);
  }

  // Send welcome email via Lambda (non-blocking)
  try {
    await fetch(`${API_BASE}/officer/welcome-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        district: data.district,
        designation: data.designation,
        employee_id: data.employee_id,
      }),
    });
  } catch {
    // non-fatal — registration already succeeded
  }
};

// Send forgot password code via our Lambda (uses SES directly)
export const forgotPassword = async (email: string): Promise<void> => {
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'request', email }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || data.error || 'Failed to send reset code');
};

// Confirm new password with the code sent to email
export const confirmForgotPassword = async (email: string, code: string, newPassword: string): Promise<void> => {
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'confirm', email, code, new_password: newPassword }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || data.error || 'Failed to reset password');
};

// Verify if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  return !!token;
};

// Token storage helpers
export const storeTokens = (tokens: AuthTokens): void => {
  // Validate tokens before storing
  const validateJWT = (token: string): boolean => {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    try {
      // Try to decode the payload to ensure it's valid base64 and JSON
      JSON.parse(atob(parts[1]));
      return true;
    } catch {
      return false;
    }
  };

  if (validateJWT(tokens.access_token)) {
    localStorage.setItem(AUTH_TOKEN_KEY, tokens.access_token);
  } else {
    console.error('Invalid access_token format, not storing');
  }

  if (validateJWT(tokens.refresh_token)) {
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
  } else {
    console.error('Invalid refresh_token format, not storing');
  }

  if (tokens.id_token && validateJWT(tokens.id_token)) {
    localStorage.setItem(ID_TOKEN_KEY, tokens.id_token);
  } else if (tokens.id_token) {
    console.error('Invalid id_token format, not storing');
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
