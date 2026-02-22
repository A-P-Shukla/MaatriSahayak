import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import { AuthProvider } from '@hooks/useAuth';

// Components
import Header from '@components/Header';
import Sidebar from '@components/Sidebar';
import Footer from '@components/Footer';
import ErrorBoundary from '@components/ErrorBoundary';
import ProtectedRoute from '@components/ProtectedRoute';
import NotFound from '@components/NotFound';

// Pages
import Dashboard from '@pages/Dashboard';
import PregnanciesList from '@pages/PregnanciesList';
import PregnancyDetails from '@pages/PregnancyDetails';
import EmergencyAlerts from '@pages/EmergencyAlerts';
import LiveTracking from '@pages/LiveTracking';
import Analytics from '@pages/Analytics';
import Login from '@pages/Login';

// Create a React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 seconds
      gcTime: 300000, // 5 minutes (cacheTime renamed to gcTime in v5)
      refetchOnWindowFocus: false,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

// Create theme with cool tones
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2', // Cool blue
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#9c27b0', // Cool purple
      light: '#ba68c8',
      dark: '#7b1fa2',
    },
    background: {
      default: '#f8fafc', // Very light cool gray
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b', // Cool dark gray
      secondary: '#64748b', // Cool medium gray
    },
    error: {
      main: '#dc2626', // Cool red
    },
    warning: {
      main: '#f59e0b', // Cool amber
    },
    success: {
      main: '#10b981', // Cool green
    },
    info: {
      main: '#3b82f6', // Cool blue
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid',
          borderColor: 'rgba(0, 0, 0, 0.08)',
        },
      },
    },
  },
});

/**
 * MainLayout component that wraps protected routes with header, sidebar, and footer
 */
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const emergencyCount = 0; // This would come from a real data source

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Header
        onMenuClick={() => setSidebarOpen(true)}
        emergencyCount={emergencyCount}
      />
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        emergencyCount={emergencyCount}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          pt: { xs: 7, md: 8 }, // Account for header height
          pl: { md: '280px' }, // Account for sidebar width on desktop
        }}
      >
        <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>
          {children}
        </Box>
        <Footer />
      </Box>
    </Box>
  );
};

/**
 * App component - Root of the application
 */
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            <Router>
              <Routes>
                {/* Public routes */}
                <Route
                  path="/login"
                  element={
                    <ProtectedRoute requireAuth={false}>
                      <Login />
                    </ProtectedRoute>
                  }
                />

                {/* Protected routes with main layout */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Dashboard />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/pregnancies"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <PregnanciesList />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/pregnancies/:id"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <PregnancyDetails />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/emergencies"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <EmergencyAlerts />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tracking"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <LiveTracking />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Analytics />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />

                {/* 404 route */}
                <Route
                  path="*"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <NotFound />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Router>
          </AuthProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;