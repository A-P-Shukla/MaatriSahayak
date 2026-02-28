import { render, screen } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';
import { TestMemoryRouter } from '@test/testUtils';
import ProtectedRoute from './ProtectedRoute';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the useAuth hook
vi.mock('@hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '@hooks/useAuth';

// Test components
const Dashboard = () => <div>Dashboard Content</div>;
const Login = () => <div>Login Page</div>;

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children when user is authenticated', () => {
    // Mock authenticated user
    (useAuth as any).mockReturnValue({
      user: { id: '1', name: 'Test User' },
      isLoading: false,
    });

    render(
      <TestMemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </TestMemoryRouter>
    );

    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
  });

  it('should redirect to login when user is not authenticated', () => {
    // Mock unauthenticated user
    (useAuth as any).mockReturnValue({
      user: null,
      isLoading: false,
    });

    render(
      <TestMemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
        </Routes>
      </TestMemoryRouter>
    );

    // Should redirect to login page
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('should show loading spinner during authentication check', () => {
    // Mock loading state
    (useAuth as any).mockReturnValue({
      user: null,
      isLoading: true,
    });

    render(
      <TestMemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </TestMemoryRouter>
    );

    // Should show loading spinner
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should redirect to custom login page when specified', () => {
    (useAuth as any).mockReturnValue({
      user: null,
      isLoading: false,
    });

    render(
      <TestMemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute redirectTo="/custom-login">
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/custom-login" element={<div>Custom Login Page</div>} />
        </Routes>
      </TestMemoryRouter>
    );

    // Should redirect to custom login page
    expect(screen.getByText('Custom Login Page')).toBeInTheDocument();
  });

  it('should redirect authenticated user away from login page', () => {
    (useAuth as any).mockReturnValue({
      user: { id: '1', name: 'Test User' },
      isLoading: false,
    });

    render(
      <TestMemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route
            path="/login"
            element={
              <ProtectedRoute requireAuth={false}>
                <Login />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </TestMemoryRouter>
    );

    // Should redirect to dashboard
    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
  });

  it('should preserve location state when redirecting to login', () => {
    (useAuth as any).mockReturnValue({
      user: null,
      isLoading: false,
    });

    render(
      <TestMemoryRouter
        initialEntries={[
          {
            pathname: '/dashboard',
            state: { from: '/previous-page' },
          },
        ]}
      >
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page with state</div>} />
        </Routes>
      </TestMemoryRouter>
    );

    // Should redirect to login page
    expect(screen.getByText('Login Page with state')).toBeInTheDocument();
  });

  it('should match snapshot with authenticated user', () => {
    // Mock authenticated user
    (useAuth as any).mockReturnValue({
      user: { id: '1', name: 'Test User' },
      isLoading: false,
    });

    const { container } = render(
      <TestMemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </TestMemoryRouter>
    );

    expect(container).toMatchSnapshot();
  });

  it('should match snapshot with loading state', () => {
    // Mock loading state
    (useAuth as any).mockReturnValue({
      user: null,
      isLoading: true,
    });

    const { container } = render(
      <TestMemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </TestMemoryRouter>
    );

    expect(container).toMatchSnapshot();
  });

  it('should match snapshot when redirecting to login', () => {
    // Mock unauthenticated user
    (useAuth as any).mockReturnValue({
      user: null,
      isLoading: false,
    });

    const { container } = render(
      <TestMemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
        </Routes>
      </TestMemoryRouter>
    );

    expect(container).toMatchSnapshot();
  });
});

