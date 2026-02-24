import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';

// Mock the useAuth hook BEFORE importing App
vi.mock('@hooks/useAuth', () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock the useDashboardStats hook
vi.mock('@hooks/useDashboardStats', () => ({
  useDashboardStats: vi.fn(() => ({
    data: {
      total_pregnancies: 100,
      high_risk_count: 10,
      active_emergencies: 2,
      available_ambulances: 15,
      recent_emergencies: [],
      high_risk_pregnancies: [],
    },
    isLoading: false,
    isError: false,
    error: null,
  })),
}));

// Import useAuth after mocking
import { useAuth } from '@hooks/useAuth';

// Import App after all mocks are set up
import App from './App';

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

vi.mock('@components/ErrorBoundary', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock ProtectedRoute to always render children (since BYPASS_AUTH = true)
vi.mock('@components/ProtectedRoute', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock the App component's Router to use MemoryRouter instead
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    BrowserRouter: ({ children }: { children: React.ReactNode }) => children,
  };
});

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
      // Use queryByText which is more flexible
      const notFoundElement = screen.queryByText(/404 Not Found/i);
      expect(notFoundElement).toBeTruthy();
    }, { timeout: 3000 });
  });

  it('should render dashboard even while loading (BYPASS_AUTH = true)', async () => {
    mockUseAuth({ isLoading: true });
    
    renderApp('/');
    
    // With BYPASS_AUTH = true, dashboard renders immediately
    await waitFor(() => {
      const dashboardElement = screen.queryByText(/Dashboard Page/i);
      expect(dashboardElement).toBeTruthy();
    }, { timeout: 3000 });
  });

  it('should render dashboard without auth (BYPASS_AUTH = true)', async () => {
    mockUseAuth({ user: null, isLoading: false });
    
    renderApp('/');
    
    // With BYPASS_AUTH = true, dashboard renders even without auth
    await waitFor(() => {
      const dashboardElement = screen.queryByText(/Dashboard Page/i);
      expect(dashboardElement).toBeTruthy();
    }, { timeout: 3000 });
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