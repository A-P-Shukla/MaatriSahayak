import api from './api';
import { StorageService } from './storage';
import { ENDPOINTS } from '../config/api';

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    name: string;
    phone: string;
    email: string;
    district: string;
    village: string;
    age: number;
    password: string;
}

export interface AuthUser {
    id: string;
    name: string;
    phone: string;
    district: string;
    role: string;
    ashaId?: string;
}

export interface AuthResponse {
    token: string;
    user: AuthUser;
}

export const AuthService = {
    async login(payload: LoginPayload): Promise<AuthResponse> {
        const { data } = await api.post(ENDPOINTS.LOGIN, { email: payload.email, password: payload.password });
        await StorageService.setAuthToken(data.data.access_token);
        await StorageService.setUserData(data.data.user);
        return { token: data.data.access_token, user: data.data.user };
    },

    async register(payload: RegisterPayload): Promise<void> {
        await api.post(ENDPOINTS.REGISTER, payload);
    },

    async logout(): Promise<void> {
        await StorageService.removeAuthToken();
        await StorageService.clearAll();
    },

    async getStoredSession(): Promise<{ token: string; user: AuthUser } | null> {
        const token = await StorageService.getAuthToken();
        const user = await StorageService.getUserData();
        if (token && user) return { token, user };
        return null;
    },
};
