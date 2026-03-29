import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import { AuthProvider } from '@hooks/useAuth';

import Header from '@components/Header';
import Sidebar from '@components/Sidebar';
import Footer from '@components/Footer';
import ErrorBoundary from '@components/ErrorBoundary';
import ProtectedRoute from '@components/ProtectedRoute';
import NotFound from '@components/NotFound';

import Dashboard from '@pages/Dashboard';
import PregnanciesList from '@pages/PregnanciesList';
import PregnancyDetails from '@pages/PregnancyDetails';
import EmergencyAlerts from '@pages/EmergencyAlerts';
import LiveTracking from '@pages/LiveTracking';
import Analytics from '@pages/Analytics';
import AshaWorkers from '@pages/AshaWorkers';
import AshaWorkerDetails from '@pages/AshaWorkerDetails';
import Login from '@pages/Login';
import OfficerRegister from '@pages/OfficerRegister';
import Drivers from '@pages/Drivers';
import DriverDetails from '@pages/DriverDetails';
import Hospitals from '@pages/Hospitals';
import Profile from '@pages/Profile';
import RoleSelect from '@pages/RoleSelect';
import DriverLogin from '@pages/DriverLogin';
import DriverRegister from '@pages/DriverRegister';
import Home from '@pages/Home';
import About from '@pages/About';
import Contact from '@pages/Contact';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      gcTime: 300000,
      refetchOnWindowFocus: false,
      retry: 3,
      retryDelay: (i) => Math.min(1000 * 2 ** i, 30000),
    },
  },
});

const theme = createTheme({
  palette: {
    mode: 'light',
    primary:    { main: '#1B6B4A', light: '#2E8B62', dark: '#0F4A32', contrastText: '#fff' },
    secondary:  { main: '#E8F5EE', light: '#F0FAF4', dark: '#C8E6D4', contrastText: '#1B6B4A' },
    background: { default: '#F4F7F5', paper: '#FFFFFF' },
    text:       { primary: '#1A2E25', secondary: '#5A7A6A' },
    error:      { main: '#D32F2F' },
    warning:    { main: '#E65100' },
    success:    { main: '#1B6B4A' },
    info:       { main: '#0277BD' },
    divider:    '#DDE8E2',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 14,
    h3: { fontSize: '2.5rem', fontWeight: 700, color: '#1A2E25' },
    h4: { fontSize: '2rem', fontWeight: 700, color: '#1A2E25' },
    h5: { fontSize: '1.5rem', fontWeight: 700, color: '#1A2E25' },
    h6: { fontSize: '1.25rem', fontWeight: 600, color: '#1A2E25' },
    body1: { fontSize: '1rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.5 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { 
          textTransform: 'none', 
          fontWeight: 600, 
          borderRadius: 10,
          fontSize: '0.95rem',
          padding: '10px 20px',
        },
        sizeLarge: {
          fontSize: '1.05rem',
          padding: '14px 28px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #DDE8E2',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#F4F7F5',
          color: '#5A7A6A',
          fontWeight: 700,
          fontSize: '0.8rem',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          borderBottom: '2px solid #DDE8E2',
          padding: '16px',
        },
        root: { 
          borderBottomColor: '#EEF3F0',
          fontSize: '0.9rem',
          padding: '16px',
        },
      },
    },
    MuiChip: {
      styleOverrides: { 
        root: { 
          fontWeight: 600, 
          fontSize: '0.8rem',
          height: '28px',
        } 
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            fontSize: '0.95rem',
          },
          '& .MuiInputLabel-root': {
            fontSize: '0.95rem',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { backgroundImage: 'none', backgroundColor: '#FFFFFF' },
      },
    },
  },
});

const DRAWER_WIDTH = 270;

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const emergencyCount = 0;
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header onMenuClick={() => setSidebarOpen(true)} emergencyCount={emergencyCount} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} emergencyCount={emergencyCount} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          width: { xs: '100%', md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          pt: { xs: '56px', md: '64px' },
          overflowX: 'hidden',
        }}
      >
        <Box sx={{ flexGrow: 1, p: { xs: 2, sm: 3, md: 4 }, maxWidth: '100%' }}>{children}</Box>
        <Footer />
      </Box>
    </Box>
  );
};

const App: React.FC = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              <Route path="/home" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/role-select" element={<RoleSelect />} />
              <Route path="/login" element={<Login />} />
              <Route path="/driver/login" element={<DriverLogin />} />
              <Route path="/register" element={<OfficerRegister />} />
              <Route path="/drivers/register" element={<DriverRegister />} />
              <Route path="/drivers" element={<ProtectedRoute><MainLayout><Drivers /></MainLayout></ProtectedRoute>} />
              <Route path="/drivers/:id" element={<ProtectedRoute><MainLayout><DriverDetails /></MainLayout></ProtectedRoute>} />
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/dashboard" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
              <Route path="/pregnancies" element={<ProtectedRoute><MainLayout><PregnanciesList /></MainLayout></ProtectedRoute>} />
              <Route path="/pregnancies/:id" element={<ProtectedRoute><MainLayout><PregnancyDetails /></MainLayout></ProtectedRoute>} />
              <Route path="/emergencies" element={<ProtectedRoute><MainLayout><EmergencyAlerts /></MainLayout></ProtectedRoute>} />
              <Route path="/tracking" element={<ProtectedRoute><MainLayout><LiveTracking /></MainLayout></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><MainLayout><Analytics /></MainLayout></ProtectedRoute>} />
              <Route path="/asha" element={<ProtectedRoute><MainLayout><AshaWorkers /></MainLayout></ProtectedRoute>} />
              <Route path="/asha/:id" element={<ProtectedRoute><MainLayout><AshaWorkerDetails /></MainLayout></ProtectedRoute>} />
              <Route path="/hospitals" element={<ProtectedRoute><MainLayout><Hospitals /></MainLayout></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><MainLayout><Profile /></MainLayout></ProtectedRoute>} />
              <Route path="*" element={<ProtectedRoute><MainLayout><NotFound /></MainLayout></ProtectedRoute>} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
