import { useState, useEffect, useCallback, createContext, useContext, ReactNode, createElement } from 'react';
import {
  login as loginService,
  loginDriver as loginDriverService,
  loginOfficer as loginOfficerService,
  logout as logoutService,
  getCurrentUser,
  isAuthenticated as checkAuth,
  getStoredUser,
  clearAuthData,
} from '../services/auth';
import type { LoginCredentials, AuthState } from '../types';

/**
 * Authentication Hook
 * Manages user authentication state and provides auth methods
 */

// Create Auth Context
interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  loginDriver: (credentials: LoginCredentials) => Promise<void>;
  loginOfficer: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const isAuth = checkAuth();

        if (isAuth) {
          // Try to get stored user first
          const storedUser = getStoredUser();

          if (storedUser) {
            setAuthState({
              user: storedUser,
              tokens: null,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            // Fetch current user from API
            const user = await getCurrentUser();
            setAuthState({
              user,
              tokens: null,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          }
        } else {
          setAuthState({
            user: null,
            tokens: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearAuthData();
        setAuthState({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Authentication failed',
        });
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      const { user, tokens } = await loginService(credentials);

      setAuthState({
        user,
        tokens,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setAuthState({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  }, []);

  // Login as driver
  const loginDriver = useCallback(async (credentials: LoginCredentials) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      const { user, tokens } = await loginDriverService(credentials);

      setAuthState({
        user,
        tokens,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setAuthState({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  }, []);

  // Login as District Officer
  const loginOfficer = useCallback(async (credentials: LoginCredentials) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      const { user, tokens } = await loginOfficerService(credentials);

      setAuthState({
        user,
        tokens,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setAuthState({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await logoutService();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAuthState({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      setAuthState((prev) => ({
        ...prev,
        user,
      }));
    } catch (error) {
      console.error('Failed to refresh user:', error);
      throw error;
    }
  }, []);

  const value: AuthContextType = {
    ...authState,
    login,
    loginDriver,
    loginOfficer,
    logout,
    refreshUser,
  };

  return createElement(AuthContext.Provider, { value }, children);
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

// Export for convenience
export default useAuth;
