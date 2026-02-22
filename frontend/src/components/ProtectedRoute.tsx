import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '@hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

/**
 * ProtectedRoute component for authentication guards
 * 
 * @param children - Child components to protect
 * @param requireAuth - Whether authentication is required (default: true)
 * @param redirectTo - Where to redirect if not authenticated (default: '/login')
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true,
  redirectTo = '/login'
}) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '300px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // If authentication is required and user is not authenticated, redirect to login
  if (requireAuth && !user) {
    // Save the current location so we can redirect back after login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If authentication is NOT required and user IS authenticated, redirect away from login page
  if (!requireAuth && user) {
    // Redirect to dashboard or the page they were trying to access before login
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  // User is authenticated (or auth not required), render children
  return <>{children}</>;
};

export default ProtectedRoute;