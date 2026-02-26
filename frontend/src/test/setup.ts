import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables for tests
process.env.VITE_API_BASE_URL = 'http://localhost:3000/api';
process.env.VITE_API_TIMEOUT = '5000';
process.env.VITE_API_MAX_RETRIES = '1';
process.env.VITE_AWS_REGION = 'ap-south-1';
process.env.VITE_COGNITO_USER_POOL_ID = 'test-pool-id';
process.env.VITE_COGNITO_CLIENT_ID = 'test-client-id';
process.env.VITE_MAP_TILES_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
process.env.VITE_MAP_ATTRIBUTION = 'OpenStreetMap';
process.env.VITE_APP_NAME = 'MaatriSahayak Dashboard';
process.env.VITE_APP_VERSION = '1.0.0';
process.env.VITE_AUTH_TOKEN_KEY = 'auth_token';
process.env.VITE_REFRESH_TOKEN_KEY = 'refresh_token';
process.env.VITE_ID_TOKEN_KEY = 'id_token';
process.env.VITE_USER_DATA_KEY = 'user_data';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock ResizeObserver for Recharts
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
