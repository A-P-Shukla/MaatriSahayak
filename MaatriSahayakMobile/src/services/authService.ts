import api, { publicApi } from './api';
import { StorageService } from './storage';
import { ENDPOINTS } from '../config/api';

export interface LoginPayload {
    email: string;
    password: string;
    role?: 'asha' | 'driver';
}

export interface RegisterPayload {
    name: string;
    phone: string;
    email: string;
    district: string;
    village: string;
    age: number;
    password: string;
    photo?: string; // base64 encoded image
}

export interface DriverRegisterPayload {
    name: string;
    phone: string;
    email: string;
    license_number: string;
    ambulance_id?: string;
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
        const endpoint = payload.role === 'driver' ? ENDPOINTS.DRIVER_LOGIN : ENDPOINTS.LOGIN;
        const { data } = await publicApi.post(endpoint, { email: payload.email, password: payload.password });
        await StorageService.setAuthToken(data.data.access_token);
        await StorageService.setUserData(data.data.user);
        return { token: data.data.access_token, user: data.data.user };
    },

    async register(payload: RegisterPayload): Promise<{ success: true }> {
        await publicApi.post(ENDPOINTS.REGISTER, payload);
        return { success: true };
    },

    async registerDriver(payload: DriverRegisterPayload): Promise<{ id: string; ambulanceId: string }> {
        const body: any = {
            name: payload.name,
            phone: payload.phone,
            email: payload.email,
            license_number: payload.license_number,
            password: payload.password,
        };
        if (payload.ambulance_id) body.ambulance_id = payload.ambulance_id;
        const { data } = await publicApi.post(ENDPOINTS.DRIVER_REGISTER, body);
        return { id: data.data.id, ambulanceId: data.data.ambulanceId };
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
