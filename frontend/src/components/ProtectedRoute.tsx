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
  redirectTo = '/role-select'
}) => {
  const { isAuthenticated, isLoading } = useAuth();
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
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If authentication is NOT required and user IS authenticated, redirect away from login page
  if (!requireAuth && isAuthenticated) {
    const from = (location.state as any)?.from?.pathname;
    const authPages = ['/login', '/driver/login', '/role-select', '/register', '/drivers/register'];
    const safeTo = from && !authPages.includes(from) ? from : '/dashboard';
    return <Navigate to={safeTo} replace />;
  }

  // User is authenticated (or auth not required), render children
  return <>{children}</>;
};

export default ProtectedRoute;