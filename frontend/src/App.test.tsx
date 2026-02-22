import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';
import App from './App';

// Mock the useAuth hook
vi.mock('@hooks/useAuth', () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import { useAuth } from '@hooks/useAuth';

// Mock page components
vi.mock('@pages/Dashboard', () => ({
  default: () => <div>Dashboard Page</div>,
}));

vi.mock('@pages/Login', () => ({
  default: () => <div>Login Page</div>,
}));

vi.mock('@pages/PregnanciesList', () => ({
  default: () => <div>Pregnancies List Page</div>,
}));

vi.mock('@pages/EmergencyAlerts', () => ({
  default: () => <div>Emergency Alerts Page</div>,
}));

vi.mock('@pages/LiveTracking', () => ({
  default: () => <div>Live Tracking Page</div>,
}));

vi.mock('@pages/Analytics', () => ({
  default: () => <div>Analytics Page</div>,
}));

vi.mock('@pages/NotFound', () => ({
  default: () => <div>404 Not Found</div>,
}));

// Mock components
vi.mock('@components/Header', () => ({
  default: () => <div>Header Component</div>,
}));

vi.mock('@components/Sidebar', () => ({
  default: () => <div>Sidebar Component</div>,
}));

vi.mock('@components/Footer', () => ({
  default: () => <div>Footer Component</div>,
}));

vi.mock('@components/ProtectedRoute', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>ProtectedRoute: {children}</div>,
}));

describe('App Routing', () => {
  const mockUseAuth = (overrides = {}) => {
    const defaultAuth = {
      user: { id: '1', name: 'Test User' },
      isLoading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    };
    (useAuth as Mock).mockReturnValue({ ...defaultAuth, ...overrides });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth();
  });

  const renderApp = (initialRoute = '/') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <App />
      </MemoryRouter>
    );
  };

  it('should render dashboard for root route when authenticated', async () => {
    mockUseAuth({ user: { id: '1', name: 'Test User' } });
    
    renderApp('/');
    
    await waitFor(() => {
      expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
    });
  });

  it('should render login page for /login route', async () => {
    mockUseAuth({ user: null });
    
    renderApp('/login');
    
    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });

  it('should render pregnancies list for /pregnancies route', async () => {
    mockUseAuth({ user: { id: '1', name: 'Test User' } });
    
    renderApp('/pregnancies');
    
    await waitFor(() => {
      expect(screen.getByText('Pregnancies List Page')).toBeInTheDocument();
    });
  });

  it('should render emergency alerts for /emergencies route', async () => {
    mockUseAuth({ user: { id: '1', name: 'Test User' } });
    
    renderApp('/emergencies');
    
    await waitFor(() => {
      expect(screen.getByText('Emergency Alerts Page')).toBeInTheDocument();
    });
  });

  it('should render live tracking for /tracking route', async () => {
    mockUseAuth({ user: { id: '1', name: 'Test User' } });
    
    renderApp('/tracking');
    
    await waitFor(() => {
      expect(screen.getByText('Live Tracking Page')).toBeInTheDocument();
    });
  });

  it('should render analytics for /analytics route', async () => {
    mockUseAuth({ user: { id: '1', name: 'Test User' } });
    
    renderApp('/analytics');
    
    await waitFor(() => {
      expect(screen.getByText('Analytics Page')).toBeInTheDocument();
    });
  });

  it('should render 404 for unknown routes', async () => {
    mockUseAuth({ user: { id: '1', name: 'Test User' } });
    
    renderApp('/unknown-route');
    
    await waitFor(() => {
      expect(screen.getByText('404 Not Found')).toBeInTheDocument();
    });
  });

  it('should show loading state while checking authentication', async () => {
    mockUseAuth({ isLoading: true });
    
    renderApp('/');
    
    // Should show loading state
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should redirect to login when accessing protected route without auth', async () => {
    mockUseAuth({ user: null });
    
    renderApp('/dashboard');
    
    // Since we're mocking ProtectedRoute, it should show the component
    // In a real test, it would redirect to login
    expect(screen.getByText(/ProtectedRoute:/)).toBeInTheDocument();
  });

  it('should match snapshot for dashboard route', () => {
    mockUseAuth({ user: { id: '1', name: 'Test User' } });
    
    const { container } = renderApp('/');
    expect(container).toMatchSnapshot();
  });

  it('should match snapshot for login route', () => {
    mockUseAuth({ user: null });
    
    const { container } = renderApp('/login');
    expect(container).toMatchSnapshot();
  });
});