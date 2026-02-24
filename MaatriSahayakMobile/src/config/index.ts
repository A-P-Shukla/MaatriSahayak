export const Config = {
    // API Configuration
    API_BASE_URL: 'https://your-api-gateway-url.amazonaws.com/prod',
    API_TIMEOUT: 10000,

    // App Configuration
    APP_NAME: 'MaatriSahayak',
    APP_VERSION: '1.0.0',

    // Storage Keys
    STORAGE_KEYS: {
        AUTH_TOKEN: 'authToken',
        USER_DATA: 'userData',
        SYNC_QUEUE: 'syncQueue',
    },

    // Sync Configuration
    SYNC_INTERVAL: 300000, // 5 minutes
    MAX_RETRY_ATTEMPTS: 3,

    // Emergency Configuration
    EMERGENCY_SEVERITY_LEVELS: ['high', 'medium', 'low'],

    // Validation Rules
    VALIDATION: {
        MIN_AGE: 15,
        MAX_AGE: 50,
        PHONE_LENGTH: 10,
    },
};
