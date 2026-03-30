import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api';
import { Config } from '../config';

const AUTH_KEYS = Object.values(Config.STORAGE_KEYS).filter(k => k !== Config.STORAGE_KEYS.SYNC_QUEUE);

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

api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem(Config.STORAGE_KEYS.AUTH_TOKEN);
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Clear all auth keys but preserve offline sync queue
            await AsyncStorage.multiRemove(AUTH_KEYS);
        }
        return Promise.reject(error);
    }
);

export default api;
