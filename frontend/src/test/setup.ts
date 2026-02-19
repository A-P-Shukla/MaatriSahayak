import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables for tests
process.env.VITE_API_BASE_URL = 'http://localhost:3000/api';
process.env.VITE_AWS_REGION = 'ap-south-1';
process.env.VITE_COGNITO_USER_POOL_ID = 'test-pool-id';
process.env.VITE_COGNITO_CLIENT_ID = 'test-client-id';
process.env.VITE_MAP_TILES_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
process.env.VITE_MAP_ATTRIBUTION = 'OpenStreetMap';
process.env.VITE_APP_NAME = 'MaatriSahayak Dashboard';
process.env.VITE_APP_VERSION = '1.0.0';

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
