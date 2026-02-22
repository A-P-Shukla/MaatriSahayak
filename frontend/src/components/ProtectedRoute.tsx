import React from 'react';
// import { Navigate, useLocation } from 'react-router-dom';
// import { Box, CircularProgress } from '@mui/material';
// import { useAuth } from '@hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

/**
 * ProtectedRoute component for authentication guards
 *
 * ⚠️  BYPASS_AUTH = true  →  auth is DISABLED for testing.
 *     Flip to false (or remove this block) to re-enable auth guards.
 */
const BYPASS_AUTH = true;

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // --- Auth bypass for local testing ---
  if (BYPASS_AUTH) {
    return <>{children}</>;
  }

  // --- Normal auth logic (restore when BYPASS_AUTH = false) ---
  // const { user, isLoading } = useAuth();
  // const location = useLocation();
  // if (isLoading) { ... }
  // if (requireAuth && !user) { return <Navigate to={redirectTo} ... />; }
  // if (!requireAuth && user) { return <Navigate to="/" replace />; }
  return <>{children}</>;
};

export default ProtectedRoute;