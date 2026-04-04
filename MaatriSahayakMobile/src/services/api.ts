import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api';
import { Config } from '../config';

const AUTH_KEYS = Object.values(Config.STORAGE_KEYS).filter(k => k !== Config.STORAGE_KEYS.SYNC_QUEUE);

// Create main API instance
const api = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: { 'Content-Type': 'application/json' },
});

// Public API instance — no auth header, used for login/register endpoints
export const publicApi = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem(Config.STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - Handle errors and token refresh
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh token
                const refreshToken = await AsyncStorage.getItem('refreshToken');
                if (refreshToken) {
                    const response = await publicApi.post('/auth/refresh', { refreshToken });
                    const { token } = response.data;
                    await AsyncStorage.setItem(Config.STORAGE_KEYS.AUTH_TOKEN, token);

                    // Retry original request with new token
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                    }
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed, clear auth and redirect to login
                await AsyncStorage.multiRemove(AUTH_KEYS);
            }
        }

        // Handle network errors
        if (!error.response) {
            error.message = 'Network error. Please check your connection.';
        }

        return Promise.reject(error);
    }
);

// Helper function for retry logic
export const apiWithRetry = async <T>(
    requestFn: () => Promise<T>,
    retries = API_CONFIG.RETRY_ATTEMPTS
): Promise<T> => {
    try {
        return await requestFn();
    } catch (error) {
        if (retries > 0 && axios.isAxiosError(error) && !error.response) {
            // Retry on network errors
            await new Promise(resolve => setTimeout(resolve, 1000));
            return apiWithRetry(requestFn, retries - 1);
        }
        throw error;
    }
};

export default api;
