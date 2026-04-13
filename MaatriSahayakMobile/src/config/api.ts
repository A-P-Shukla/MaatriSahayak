/**
 * API Configuration
 */

export const API_CONFIG = {
    BASE_URL: 'https://q5u5grjknj.execute-api.ap-south-1.amazonaws.com/dev',
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3,
};

export const ENDPOINTS = {
    // Auth
    LOGIN: '/asha/login',
    REGISTER: '/asha/register',
    DRIVER_LOGIN: '/driver/login',
    DRIVER_REGISTER: '/driver/register',
    REFRESH_TOKEN: '/auth/refresh',

    // Pregnancies
    PREGNANCIES: '/pregnancies',
    PREGNANCY_DETAILS: (id: string) => `/pregnancies/${id}`,

    // Vitals
    RECORD_VITALS: '/vitals',
    VITALS_HISTORY: (id: string) => `/pregnancies/${id}/vitals-history`,

    // Emergency
    TRIGGER_EMERGENCY: '/emergency',
    EMERGENCIES: '/emergencies',
    EMERGENCY_STATUS: (id: string) => `/emergency/${id}/status`,

    // ANC
    RECORD_ANC: '/anc/visits',
    ANC_HISTORY: (id: string) => `/pregnancies/${id}/anc-history`,
    PROCESS_ANC_CARD: '/anc/process-card',

    // Hospitals
    HOSPITALS: '/hospitals',

    // Analytics
    ANALYTICS: '/analytics',
};
