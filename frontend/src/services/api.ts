import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API configuration from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://73qjqd2j7c.execute-api.ap-south-1.amazonaws.com/dev';
const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 10000; // 10 seconds default
const MAX_RETRIES = Number(import.meta.env.VITE_API_MAX_RETRIES) || 3; // 3 retries default

// Create axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication tokens
apiClient.interceptors.request.use(
  (config) => {
    // Prefer id_token (Cognito authorizer expects it), fall back to access_token
    const token = localStorage.getItem('id_token') || localStorage.getItem('auth_token');
    if (token) {
      // Ensure token is a valid JWT format (3 parts separated by dots)
      const parts = token.split('.');
      if (parts.length === 3) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.error('Invalid token format detected, clearing auth data');
        localStorage.removeItem('id_token');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean; _retryCount?: number };

    // Handle authentication errors (401)
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Handle network errors with retry logic (do NOT retry 500s — they are app errors)
    if (
      !error.response ||
      error.code === 'ECONNABORTED' ||
      error.code === 'ERR_NETWORK'
    ) {
      originalRequest._retryCount = originalRequest._retryCount || 0;

      if (originalRequest._retryCount < MAX_RETRIES) {
        originalRequest._retryCount += 1;
        originalRequest._retry = true;

        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.min(1000 * Math.pow(2, originalRequest._retryCount - 1), 4000);
        
        await new Promise((resolve) => setTimeout(resolve, delay));
        
        return apiClient(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

// Generic API response type
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Paginated response type
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Helper function to handle API errors
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const d = error.response.data;
      return d?.message || d?.error || d?.detail || `Server error (${error.response.status})`;
    } else if (error.request) {
      return 'Unable to connect. Please check your internet connection.';
    }
  }
  return 'An unexpected error occurred';
};

export default apiClient;
