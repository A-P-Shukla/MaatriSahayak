import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Grid, Paper, CircularProgress, Alert, Button, Chip,
  useTheme, useMediaQuery, IconButton, Badge, Tooltip, Stack, Avatar, Divider, LinearProgress,
  Snackbar, Dialog,
} from '@mui/material';
import {
  Baby, AlertTriangle, Ambulance, HeartPulse, ArrowRight, RefreshCw,
  Bell, TrendingUp, Circle, Clock, MapPin, Gauge, ShieldPlus, Brain,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useWebSocket } from '../hooks/useWebSocket';
import EmergencyDetailsModal from '../components/EmergencyDetailsModal';
import PendingApprovalsPanel from '../components/PendingApprovalsPanel';
import EmergencyNotificationPanel from '../components/EmergencyNotificationPanel';
import { listDrivers } from '../services/driver';
import { getAshaWorkers } from '../services/asha';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const SEVERITY_COLOR: Record<string, string> = {
  critical: '#D32F2F',
  high: '#E65100',
  medium: '#F9A825',
  low: '#2E7D32',
};

const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  initiated: { bg: '#E3F2FD', text: '#0277BD' },
  dispatched: { bg: '#FFF8E1', text: '#F57F17' },
  in_transit: { bg: '#FFF3E0', text: '#E65100' },
  arrived: { bg: '#E8F5E9', text: '#2E7D32' },
  completed: { bg: '#F3E5F5', text: '#6A1B9A' },
};

const DRAWER_WIDTH = 270;

// ============================================================================
// HELPER FUNCTIONS - Data Transformation
// ============================================================================

const buildMetricsConfig = (stats: any) => [
  {
    title: 'Total Pregnancies',
    value: stats.total_pregnancies || 0,
    icon: <Baby size={24} />,
    color: '#0d9488',
    bg: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
    lightBg: '#f0fdfa',
    trend: '+12%',
    sub: 'Registered patients',
    path: '/pregnancies',
  },
  {
    title: 'High-Risk Cases',
    value: stats.high_risk_count || 0,
    icon: <AlertTriangle size={24} />,
    color: '#E65100',
    bg: 'linear-gradient(135deg, #E65100 0%, #FF8F00 100%)',
    lightBg: '#FFF3E0',
    trend: '-3%',
    sub: 'Needs attention',
    path: '/pregnancies',
  },
  {
    title: 'Active Emergencies',
    value: stats.active_emergencies || 0,
    icon: <HeartPulse size={24} />,
    color: '#C62828',
    bg: 'linear-gradient(135deg, #C62828 0%, #EF5350 100%)',
    lightBg: '#FFEBEE',
    trend: stats.active_emergencies > 0 ? 'LIVE' : 'Clear',
    sub: 'In progress now',
    path: '/emergencies',
    pulse: (stats.active_emergencies || 0) > 0,
  },
  {
    title: 'Available Ambulances',
    value: stats.available_ambulances || 0,
    icon: <Ambulance size={24} />,
    color: '#0277BD',
    bg: 'linear-gradient(135deg, #0277BD 0%, #29B6F6 100%)',
    lightBg: '#E3F2FD',
    trend: 'Ready',
    sub: 'On standby',
    path: '/tracking',
  },
];

const buildQuickActionsConfig = () => [
  { label: 'Pregnancies', path: '/pregnancies', icon: <Baby size={22} />, color: '#0d9488', bg: '#f0fdfa' },
  { label: 'Emergencies', path: '/emergencies', icon: <HeartPulse size={22} />, color: '#C62828', bg: '#FFEBEE' },
  { label: 'Live Tracking', path: '/tracking', icon: <Ambulance size={22} />, color: '#0277BD', bg: '#E3F2FD' },
  { label: 'Analytics', path: '/analytics', icon: <TrendingUp size={22} />, color: '#6A1B9A', bg: '#F3E5F5' },
  { label: 'Hospitals', path: '/hospitals', icon: <ShieldPlus size={22} />, color: '#00695C', bg: '#E0F2F1' },
  { label: 'Drivers', path: '/drivers', icon: <Gauge size={22} />, color: '#4527A0', bg: '#EDE7F6' },
];

const formatDateTime = () => new Date().toLocaleString('en-IN', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  hour: '2-digit', minute: '2-digit',
});

// ============================================================================
// CUSTOM HOOK - Registration Notifications
// ============================================================================

const useRegistrationNotifications = (lastMessage: any) => {
  const [pendingCount, setPendingCount] = useState(0);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [registrationDialogOpen, setRegistrationDialogOpen] = useState(false);
  const [newRegistration, setNewRegistration] = useState<{ type: string; name: string } | null>(null);
  const [previousCount, setPreviousCount] = useState(0);

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage?.type === 'new_registration') {
      const { registrationType, name } = lastMessage.data || {};
      const type = registrationType === 'DRIVER' ? 'Driver' : 'ASHA Worker';
      setNewRegistration({ type, name: name || 'Unknown' });
      setRegistrationDialogOpen(true);
      setNotificationMessage(`New ${type} registration: ${name || 'Unknown'}`);
      setNotificationOpen(true);
    }
  }, [lastMessage]);

  // Detect count increase and show popup
  useEffect(() => {
    if (pendingCount > previousCount && previousCount >= 0) {
      const diff = pendingCount - previousCount;
      if (diff > 0) {
        setNewRegistration({ type: 'Registration', name: `${diff} New Registration${diff > 1 ? 's' : ''}` });
        setRegistrationDialogOpen(true);
        setNotificationMessage(`${diff} new registration${diff > 1 ? 's' : ''} pending approval`);
        setNotificationOpen(true);
      }
    }
    setPreviousCount(pendingCount);
  }, [pendingCount]);

  return {
    pendingCount,
    setPendingCount,
    notificationOpen,
    setNotificationOpen,
    notificationMessage,
    registrationDialogOpen,
    setRegistrationDialogOpen,
    newRegistration,
    setNewRegistration,
  };
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  useMediaQuery(theme.breakpoints.down('sm'));

  // State - Modal Management
  const [selectedEmergencyId, setSelectedEmergencyId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [approvalsOpen, setApprovalsOpen] = useState(false);

  // Fetch pending registrations count on mount
  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const [drivers, ashas] = await Promise.all([listDrivers(), getAshaWorkers()]);
        const pendingDrivers = drivers.filter((d: any) => d.verificationStatus === 'PENDING').length;
        const pendingAshas = ashas.filter((a: any) => a.verificationStatus === 'PENDING').length;
        setPendingCount(pendingDrivers + pendingAshas);
      } catch (err) {
        console.error('Failed to fetch pending count:', err);
      }
    };
    fetchPendingCount();
  }, []);

  // Data Fetching
  const { data: stats, isLoading, isError, error, refetch } = useDashboardStats();
  const { isConnected, lastMessage } = useWebSocket({ enabled: true });

  // Registration Notifications
  const {
    pendingCount,
    setPendingCount,
    notificationOpen,
    setNotificationOpen,
    notificationMessage,
    registrationDialogOpen,
    setRegistrationDialogOpen,
    newRegistration,
    setNewRegistration,
  } = useRegistrationNotifications(lastMessage);

  // Memoized Data
  const metrics = useMemo(() => stats ? buildMetricsConfig(stats) : [], [stats]);
  const quickActions = useMemo(() => buildQuickActionsConfig(), []);
  const currentDateTime = useMemo(() => formatDateTime(), []);

  // ============================================================================
  // RENDER FUNCTIONS - UI Components
  // ============================================================================

  const renderHeader = () => (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
        pt: 4,
        pb: 4,
        px: 3,
      }}
    >
      <Box maxWidth={1400} mx="auto">
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 0.5 }}>
              <Typography variant="h4" fontWeight={700} color="white">
                Dashboard
              </Typography>
              {isConnected && (
                <Chip
                  icon={<Circle size={8} color="#4CAF50" fill="#4CAF50" />}
                  label="Live"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    height: 24,
                    border: '1px solid rgba(255,255,255,0.3)',
                  }}
                />
              )}
            </Box>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Clock size={14} />
              {currentDateTime}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <EmergencyNotificationPanel />
            <Tooltip title="Check for New Registrations">
              <IconButton
                onClick={async () => {
                  try {
                    const [drivers, ashas] = await Promise.all([listDrivers(), getAshaWorkers()]);
                    const pendingDrivers = drivers.filter((d: any) => d.verificationStatus === 'PENDING');
                    const pendingAshas = ashas.filter((a: any) => a.verificationStatus === 'PENDING');
                    const total = pendingDrivers.length + pendingAshas.length;

                    if (total > pendingCount) {
                      const latest = [...pendingDrivers, ...pendingAshas]
                        .sort((a: any, b: any) => {
                          const dateA = new Date(a.createdAt || a.registration_date || 0).getTime();
                          const dateB = new Date(b.createdAt || b.registration_date || 0).getTime();
                          return dateB - dateA;
                        })[0];

                      if (latest) {
                        const type = 'ambulanceId' in latest ? 'Driver' : 'ASHA Worker';
                        setRegistrationDialogOpen(true);
                        setNewRegistration({ type, name: latest.name });
                      }
                    }
                    setPendingCount(total);
                  } catch (err) {
                    console.error('Failed to check registrations:', err);
                  }
                }}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                }}
              >
                <RefreshCw size={20} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Pending Approvals">
              <IconButton
                onClick={() => setApprovalsOpen(true)}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                }}
              >
                <Badge
                  badgeContent={pendingCount}
                  color="error"
                  sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', fontWeight: 700 } }}
                >
                  <Bell size={20} />
                </Badge>
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<RefreshCw size={18} />}
              onClick={() => refetch()}
              disabled={isLoading}
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
              }}
            >
              Refresh
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );

  const renderLoadingState = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 2 }}>
      <CircularProgress size={48} thickness={4} sx={{ color: '#0d9488' }} />
      <Typography variant="body2" color="text.secondary">Loading dashboard data…</Typography>
    </Box>
  );

  const renderErrorState = () => (
    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
      {error?.message || 'Failed to load dashboard statistics.'}
    </Alert>
  );

  const renderMetricCard = (m: any, i: number) => (
    <Grid item xs={12} sm={6} md={3} key={i}>
      <Paper
        elevation={0}
        onClick={() => navigate(m.path)}
        sx={{
          p: 3,
          borderRadius: 3,
          border: '1px solid #DDE8E2',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          bgcolor: 'white',
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: `0 12px 40px ${m.color}25`,
            borderColor: m.color,
          },
        }}
      >
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: m.bg }} />
        {m.pulse && (
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: '#D32F2F',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: -4,
                left: -4,
                right: -4,
                bottom: -4,
                borderRadius: '50%',
                border: '2px solid #D32F2F',
                animation: 'pulse 1.5s ease-out infinite',
                opacity: 0.6,
              },
              '@keyframes pulse': {
                '0%': { transform: 'scale(0.8)', opacity: 0.8 },
                '100%': { transform: 'scale(2.5)', opacity: 0 },
              },
            }}
          />
        )}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: m.lightBg,
              color: m.color,
            }}
          >
            {m.icon}
          </Box>
          <Chip
            label={m.trend}
            size="small"
            sx={{
              height: 22,
              fontSize: '0.7rem',
              fontWeight: 700,
              bgcolor: m.pulse ? '#FFEBEE' : '#f5f5f5',
              color: m.pulse ? '#C62828' : 'text.secondary',
            }}
          />
        </Box>
        <Typography
          fontWeight={800}
          sx={{
            fontSize: '2.5rem',
            lineHeight: 1,
            mb: 0.5,
            color: 'text.primary',
            letterSpacing: '-1px',
          }}
        >
          {m.value.toLocaleString()}
        </Typography>
        <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ mb: 0.3 }}>
          {m.title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {m.sub}
        </Typography>
      </Paper>
    </Grid>
  );

  return (
    <Box sx={{
      position: 'absolute',
      top: { xs: 56, md: 64 },
      left: { xs: 0, md: DRAWER_WIDTH },
      right: 0,
      bottom: 0,
      bgcolor: '#f5f7fa',
      overflow: 'auto'
    }}>
      {renderHeader()}

      {/* Main Content */}
      <Box maxWidth={1400} mx="auto" px={3} sx={{ mt: 3, pb: 4 }}>
        {/* Loading */}
        {isLoading && renderLoadingState()}

        {/* Error */}
        {isError && renderErrorState()}

        {!isLoading && !isError && stats && (
          <>
            {/* Metric Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {metrics.map((m, i) => renderMetricCard(m, i))}
            </Grid>

            {/* AI Risk Assessment Dashboard - Redesigned */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                mb: 4,
                overflow: 'hidden',
                bgcolor: 'white',
                border: '1px solid #e5e7eb',
              }}
            >
              {/* Compact Header */}
              <Box
                sx={{
                  px: 3,
                  py: 2,
                  borderBottom: '1px solid #e5e7eb',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 1.5,
                      background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Brain size={20} color="white" />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      AI Risk Assessment
                      <Chip
                        label="Live"
                        size="small"
                        sx={{
                          bgcolor: '#f0fdfa',
                          color: '#0d9488',
                          fontWeight: 700,
                          fontSize: '0.65rem',
                          height: 20,
                          border: '1px solid #99f6e4',
                        }}
                      />
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ML-powered risk prediction & monitoring
                    </Typography>
                  </Box>
                </Box>
                <Button
                  size="small"
                  endIcon={<ArrowRight size={14} />}
                  onClick={() => navigate('/analytics')}
                  sx={{
                    color: '#0d9488',
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '0.8rem',
                    '&:hover': { bgcolor: '#f0fdfa' },
                  }}
                >
                  View Analytics
                </Button>
              </Box>

              {/* Risk Distribution */}
              <Box sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  {/* Risk Level Cards */}
                  <Grid item xs={12} md={8}>
                    <Typography variant="body2" fontWeight={700} color="text.secondary" sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.75rem' }}>
                      Risk Distribution
                    </Typography>
                    <Grid container spacing={2}>
                      {[
                        { level: 'Critical', range: '80-100', count: stats.high_risk_pregnancies?.filter((p: any) => (p.risk_score || 0) >= 80).length || 0, color: '#dc2626', bg: '#fef2f2', icon: '🔴' },
                        { level: 'High', range: '60-79', count: stats.high_risk_pregnancies?.filter((p: any) => (p.risk_score || 0) >= 60 && (p.risk_score || 0) < 80).length || 0, color: '#ea580c', bg: '#fff7ed', icon: '🟠' },
                        { level: 'Medium', range: '40-59', count: stats.high_risk_pregnancies?.filter((p: any) => (p.risk_score || 0) >= 40 && (p.risk_score || 0) < 60).length || 0, color: '#f59e0b', bg: '#fffbeb', icon: '🟡' },
                        { level: 'Low', range: '0-39', count: (stats.total_pregnancies || 0) - (stats.high_risk_count || 0), color: '#16a34a', bg: '#f0fdf4', icon: '🟢' },
                      ].map((risk, idx) => (
                        <Grid item xs={6} sm={3} key={idx}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              border: '1px solid',
                              borderColor: risk.color + '30',
                              bgcolor: risk.bg,
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: `0 4px 12px ${risk.color}20`,
                                borderColor: risk.color,
                              },
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="caption" fontWeight={700} sx={{ color: risk.color, fontSize: '0.7rem' }}>
                                {risk.level}
                              </Typography>
                              <Typography sx={{ fontSize: '1rem' }}>{risk.icon}</Typography>
                            </Box>
                            <Typography
                              variant="h5"
                              fontWeight={800}
                              sx={{ color: risk.color, mb: 0.5, lineHeight: 1 }}
                            >
                              {risk.count}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                              Score {risk.range}
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>

                  {/* Risk Trend Chart */}
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" fontWeight={700} color="text.secondary" sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.75rem' }}>
                      7-Day Trend
                    </Typography>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: '1px solid #e5e7eb',
                        bgcolor: '#fafafa',
                        height: 'calc(100% - 40px)',
                      }}
                    >
                      <ResponsiveContainer width="100%" height={140}>
                        <AreaChart
                          data={[
                            { day: 'Mon', critical: 3, high: 8, medium: 12 },
                            { day: 'Tue', critical: 4, high: 7, medium: 14 },
                            { day: 'Wed', critical: 2, high: 9, medium: 13 },
                            { day: 'Thu', critical: 5, high: 8, medium: 11 },
                            { day: 'Fri', critical: 3, high: 10, medium: 15 },
                            { day: 'Sat', critical: 4, high: 9, medium: 12 },
                            { day: 'Sun', critical: stats.high_risk_pregnancies?.filter((p: any) => (p.risk_score || 0) >= 80).length || 3, high: stats.high_risk_pregnancies?.filter((p: any) => (p.risk_score || 0) >= 60 && (p.risk_score || 0) < 80).length || 8, medium: stats.high_risk_pregnancies?.filter((p: any) => (p.risk_score || 0) >= 40 && (p.risk_score || 0) < 60).length || 14 },
                          ]}
                          margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                          <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                          <RechartsTooltip
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: 8,
                              fontSize: 12,
                            }}
                          />
                          <Area type="monotone" dataKey="critical" stackId="1" stroke="#C62828" fill="#C62828" fillOpacity={0.8} />
                          <Area type="monotone" dataKey="high" stackId="1" stroke="#E65100" fill="#E65100" fillOpacity={0.7} />
                          <Area type="monotone" dataKey="medium" stackId="1" stroke="#F9A825" fill="#F9A825" fillOpacity={0.6} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Top Risk Patients with Trajectory */}
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AlertTriangle size={18} />
                    Top 5 Critical Risk Patients - Trajectory Analysis
                  </Typography>
                  <Grid container spacing={2}>
                    {stats.high_risk_pregnancies?.slice(0, 5).map((p: any, idx: number) => {
                      const score = p.risk_score || 0;
                      const riskColor = score >= 80 ? '#C62828' : score >= 60 ? '#E65100' : score >= 40 ? '#F9A825' : '#2E7D32';
                      const riskLabel = score >= 80 ? 'CRITICAL' : score >= 60 ? 'HIGH' : score >= 40 ? 'MEDIUM' : 'LOW';

                      // Use pregnancy_id field
                      const pregnancyId = p.pregnancy_id;

                      // Generate mock trajectory data (in production, this would come from API)
                      const trajectoryData = [
                        { week: 'W-4', score: Math.max(20, score - 25 + Math.random() * 10) },
                        { week: 'W-3', score: Math.max(25, score - 18 + Math.random() * 8) },
                        { week: 'W-2', score: Math.max(30, score - 12 + Math.random() * 6) },
                        { week: 'W-1', score: Math.max(35, score - 6 + Math.random() * 4) },
                        { week: 'Now', score: score },
                      ];

                      return (
                        <Grid item xs={12} key={pregnancyId}>
                          <Paper
                            elevation={0}
                            onClick={() => navigate(`/pregnancies/${pregnancyId}`)}
                            sx={{
                              p: 2.5,
                              borderRadius: 2,
                              border: `2px solid ${riskColor}`,
                              bgcolor: `${riskColor}08`,
                              cursor: 'pointer',
                              transition: 'all 0.3s',
                              '&:hover': {
                                transform: 'translateX(8px)',
                                boxShadow: `0 8px 24px ${riskColor}30`,
                                bgcolor: `${riskColor}12`,
                              },
                            }}
                          >
                            <Grid container spacing={2} alignItems="center">
                              {/* Patient Info */}
                              <Grid item xs={12} sm={4}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Box
                                    sx={{
                                      width: 48,
                                      height: 48,
                                      borderRadius: '50%',
                                      bgcolor: riskColor,
                                      color: 'white',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontWeight: 900,
                                      fontSize: '1.2rem',
                                      position: 'relative',
                                    }}
                                  >
                                    {(p.patient_name || '?').charAt(0).toUpperCase()}
                                    <Box
                                      sx={{
                                        position: 'absolute',
                                        top: -2,
                                        right: -2,
                                        width: 20,
                                        height: 20,
                                        borderRadius: '50%',
                                        bgcolor: 'white',
                                        color: riskColor,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 900,
                                        fontSize: '0.7rem',
                                        border: `2px solid ${riskColor}`,
                                      }}
                                    >
                                      {idx + 1}
                                    </Box>
                                  </Box>
                                  <Box>
                                    <Typography variant="body1" fontWeight={700} sx={{ color: 'text.primary' }}>
                                      {p.patient_name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {p.village}, {p.district}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Grid>

                              {/* Risk Score */}
                              <Grid item xs={12} sm={2}>
                                <Box sx={{ textAlign: 'center' }}>
                                  <Typography
                                    variant="h3"
                                    fontWeight={900}
                                    sx={{ color: riskColor, lineHeight: 1, mb: 0.5 }}
                                  >
                                    {score}
                                  </Typography>
                                  <Chip
                                    label={riskLabel}
                                    size="small"
                                    sx={{
                                      bgcolor: riskColor,
                                      color: 'white',
                                      fontWeight: 800,
                                      fontSize: '0.65rem',
                                      height: 20,
                                    }}
                                  />
                                </Box>
                              </Grid>

                              {/* Trajectory Chart */}
                              <Grid item xs={12} sm={6}>
                                <Box sx={{ height: 80 }}>
                                  <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={trajectoryData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                      <XAxis dataKey="week" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                                      <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#9ca3af" />
                                      <RechartsTooltip
                                        contentStyle={{
                                          backgroundColor: 'white',
                                          border: `2px solid ${riskColor}`,
                                          borderRadius: 8,
                                          fontSize: 11,
                                        }}
                                      />
                                      <Line
                                        type="monotone"
                                        dataKey="score"
                                        stroke={riskColor}
                                        strokeWidth={3}
                                        dot={{ fill: riskColor, r: 4 }}
                                        activeDot={{ r: 6 }}
                                      />
                                    </LineChart>
                                  </ResponsiveContainer>
                                </Box>
                              </Grid>
                            </Grid>
                          </Paper>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              </Box>
            </Paper>

            {/* Activity Panels */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {/* Recent Emergencies */}
              <Grid item xs={12} lg={6}>
                <Paper
                  elevation={0}
                  sx={{
                    border: '1px solid #e5e7eb',
                    borderRadius: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: 'white',
                  }}
                >
                  <Box sx={{ px: 3, py: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          bgcolor: '#FFEBEE',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <HeartPulse size={20} color="#C62828" />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700}>
                          Recent Emergencies
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Last 10 events
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      size="small"
                      endIcon={<ArrowRight size={16} />}
                      onClick={() => navigate('/emergencies')}
                      sx={{
                        fontWeight: 600,
                        textTransform: 'none',
                        color: '#C62828',
                        '&:hover': { bgcolor: '#FFEBEE' },
                      }}
                    >
                      View All
                    </Button>
                  </Box>
                  <Divider />
                  <Box sx={{ flex: 1, overflowY: 'auto', maxHeight: 420, p: 2 }}>
                    {stats.recent_emergencies?.length > 0 ? (
                      stats.recent_emergencies.slice(0, 10).map((e) => {
                        const sc = STATUS_COLOR[e.status] || { bg: '#F5F5F5', text: '#616161' };
                        const sev = e.severity_level?.toLowerCase() || 'low';
                        return (
                          <Box
                            key={e.event_id}
                            onClick={() => {
                              setSelectedEmergencyId(e.event_id);
                              setModalOpen(true);
                            }}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                              p: 2,
                              mb: 1,
                              borderRadius: 2,
                              border: '1px solid transparent',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              '&:hover': { bgcolor: '#f9fafb', borderColor: '#e5e7eb' },
                            }}
                          >
                            <Avatar
                              sx={{
                                width: 44,
                                height: 44,
                                bgcolor: SEVERITY_COLOR[sev] + '18',
                                color: SEVERITY_COLOR[sev],
                                fontSize: '0.9rem',
                                fontWeight: 700,
                              }}
                            >
                              {(e.patient_name || '?').charAt(0).toUpperCase()}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="body2" fontWeight={600} noWrap>
                                {e.patient_name}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
                                <Clock size={12} color="#9ca3af" />
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(e.trigger_timestamp).toLocaleString('en-IN', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </Typography>
                              </Box>
                            </Box>
                            <Stack direction="column" alignItems="flex-end" spacing={0.5}>
                              <Chip
                                label={e.status.replace('_', ' ').toUpperCase()}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '0.65rem',
                                  fontWeight: 700,
                                  bgcolor: sc.bg,
                                  color: sc.text,
                                }}
                              />
                              <Box
                                sx={{
                                  width: 10,
                                  height: 10,
                                  borderRadius: '50%',
                                  bgcolor: SEVERITY_COLOR[sev],
                                }}
                              />
                            </Stack>
                          </Box>
                        );
                      })
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Box
                          sx={{
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            bgcolor: '#f5f5f5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2,
                          }}
                        >
                          <HeartPulse size={32} color="#bdbdbd" />
                        </Box>
                        <Typography variant="body2" fontWeight={600} color="text.secondary">
                          No recent emergencies
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          All systems operating normally
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Paper>
              </Grid>

              {/* High-Risk Pregnancies */}
              <Grid item xs={12} lg={6}>
                <Paper
                  elevation={0}
                  sx={{
                    border: '1px solid #e5e7eb',
                    borderRadius: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: 'white',
                  }}
                >
                  <Box sx={{ px: 3, py: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          bgcolor: '#FFF3E0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <AlertTriangle size={20} color="#E65100" />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700}>
                          High-Risk Pregnancies
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Top 10 by risk score
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      size="small"
                      endIcon={<ArrowRight size={16} />}
                      onClick={() => navigate('/pregnancies')}
                      sx={{
                        fontWeight: 600,
                        textTransform: 'none',
                        color: '#E65100',
                        '&:hover': { bgcolor: '#FFF3E0' },
                      }}
                    >
                      View All
                    </Button>
                  </Box>
                  <Divider />
                  <Box sx={{ flex: 1, overflowY: 'auto', maxHeight: 420, p: 2 }}>
                    {stats.high_risk_pregnancies?.length > 0 ? (
                      stats.high_risk_pregnancies.slice(0, 10).map((p) => {
                        const score = p.risk_score || 0;
                        const riskColor =
                          score >= 80 ? '#C62828' : score >= 60 ? '#E65100' : score >= 40 ? '#F9A825' : '#2E7D32';
                        const pregnancyId = p.pregnancy_id;
                        return (
                          <Box
                            key={pregnancyId}
                            onClick={() => navigate(`/pregnancies/${pregnancyId}`)}
                            sx={{
                              p: 2,
                              mb: 1,
                              borderRadius: 2,
                              border: '1px solid transparent',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              '&:hover': { bgcolor: '#f9fafb', borderColor: '#e5e7eb' },
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar
                                sx={{
                                  width: 44,
                                  height: 44,
                                  bgcolor: riskColor + '18',
                                  color: riskColor,
                                  fontSize: '0.9rem',
                                  fontWeight: 700,
                                }}
                              >
                                {(p.patient_name || '?').charAt(0).toUpperCase()}
                              </Avatar>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                  <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: '70%' }}>
                                    {p.patient_name}
                                  </Typography>
                                  <Typography variant="caption" fontWeight={800} sx={{ color: riskColor }}>
                                    {score}%
                                  </Typography>
                                </Box>
                                <LinearProgress
                                  variant="determinate"
                                  value={score}
                                  sx={{
                                    height: 6,
                                    borderRadius: 3,
                                    bgcolor: riskColor + '20',
                                    '& .MuiLinearProgress-bar': { bgcolor: riskColor, borderRadius: 3 },
                                    mb: 0.5,
                                  }}
                                />
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <MapPin size={12} color="#9ca3af" />
                                  <Typography variant="caption" color="text.secondary" noWrap>
                                    {p.village}, {p.district}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </Box>
                        );
                      })
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Box
                          sx={{
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            bgcolor: '#f5f5f5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2,
                          }}
                        >
                          <AlertTriangle size={32} color="#bdbdbd" />
                        </Box>
                        <Typography variant="body2" fontWeight={600} color="text.secondary">
                          No high-risk pregnancies
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          All within normal risk levels
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            {/* Quick Actions */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Typography variant="h6" fontWeight={700}>
                  Quick Actions
                </Typography>
                <Chip
                  label="Navigate"
                  size="small"
                  sx={{ height: 20, fontSize: '0.7rem', bgcolor: '#f5f5f5', color: 'text.secondary' }}
                />
              </Box>
              <Grid container spacing={2}>
                {quickActions.map((a) => (
                  <Grid item xs={6} sm={4} md={2} key={a.path}>
                    <Paper
                      elevation={0}
                      onClick={() => navigate(a.path)}
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        border: '1.5px solid #e5e7eb',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1.5,
                        transition: 'all 0.25s ease',
                        bgcolor: 'white',
                        '&:hover': {
                          borderColor: a.color,
                          bgcolor: a.bg,
                          transform: 'translateY(-4px)',
                          boxShadow: `0 8px 28px ${a.color}22`,
                          '& .qa-icon': { color: a.color, transform: 'scale(1.15)' },
                          '& .qa-label': { color: a.color },
                        },
                      }}
                    >
                      <Box
                        className="qa-icon"
                        sx={{
                          color: 'text.secondary',
                          transition: 'all 0.25s',
                        }}
                      >
                        {a.icon}
                      </Box>
                      <Typography
                        className="qa-label"
                        variant="body2"
                        fontWeight={700}
                        sx={{
                          transition: 'color 0.25s',
                          color: 'text.secondary',
                          textAlign: 'center',
                        }}
                      >
                        {a.label}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </>
        )}
      </Box>

      <EmergencyDetailsModal
        emergencyId={selectedEmergencyId}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedEmergencyId(null);
        }}
      />
      <PendingApprovalsPanel
        open={approvalsOpen}
        onClose={() => setApprovalsOpen(false)}
        onCountChange={setPendingCount}
      />

      <Snackbar
        open={notificationOpen}
        autoHideDuration={6000}
        onClose={() => setNotificationOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ mt: 8 }}
      >
        <Alert
          onClose={() => setNotificationOpen(false)}
          severity="info"
          variant="filled"
          icon={<Bell size={20} />}
          sx={{
            bgcolor: '#0d9488',
            color: '#fff',
            fontWeight: 600,
            boxShadow: '0 8px 24px rgba(13, 148, 136, 0.3)',
            '& .MuiAlert-action': { color: '#fff' },
          }}
          action={
            <Button
              size="small"
              onClick={() => {
                setNotificationOpen(false);
                setApprovalsOpen(true);
              }}
              sx={{ color: '#fff', fontWeight: 700, textTransform: 'none' }}
            >
              Review
            </Button>
          }
        >
          {notificationMessage}
        </Alert>
      </Snackbar>

      {/* New Registration Dialog */}
      <Dialog
        open={registrationDialogOpen}
        onClose={() => setRegistrationDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(13, 148, 136, 0.3)',
          },
        }}
      >
        <Box
          sx={{
            background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
            p: 3,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'pulse 2s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': { transform: 'scale(1)', opacity: 1 },
                '50%': { transform: 'scale(1.05)', opacity: 0.9 },
              },
            }}
          >
            <Bell size={28} />
          </Box>
          <Box flex={1}>
            <Typography variant="h6" fontWeight={700} mb={0.5}>
              🎉 New Registration Alert
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.95 }}>
              A new {newRegistration?.type} has registered via the mobile app
            </Typography>
          </Box>
        </Box>

        <Box sx={{ p: 3 }}>
          <Box
            sx={{
              p: 3,
              borderRadius: 2,
              bgcolor: '#f0faf7',
              border: '2px solid #d1fae5',
              mb: 3,
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: '#0d9488',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                }}
              >
                {newRegistration?.name?.charAt(0).toUpperCase() || '?'}
              </Avatar>
              <Box flex={1}>
                <Typography variant="h6" fontWeight={700} color="#0f172a">
                  {newRegistration?.name}
                </Typography>
                <Chip
                  label={newRegistration?.type}
                  size="small"
                  sx={{
                    bgcolor: '#0d9488',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    height: 22,
                    mt: 0.5,
                  }}
                />
              </Box>
            </Stack>
          </Box>

          <Alert
            severity="info"
            icon={<AlertTriangle size={20} />}
            sx={{
              borderRadius: 2,
              mb: 3,
              '& .MuiAlert-message': { width: '100%' },
            }}
          >
            <Typography variant="body2" fontWeight={600} mb={0.5}>
              Action Required
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Please review and approve or reject this registration in the Pending Approvals panel.
            </Typography>
          </Alert>

          <Stack direction="row" spacing={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setRegistrationDialogOpen(false)}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: 2,
                borderColor: '#d1fae5',
                color: '#0d9488',
                '&:hover': {
                  borderColor: '#0d9488',
                  bgcolor: '#f0faf7',
                },
              }}
            >
              Dismiss
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                setRegistrationDialogOpen(false);
                setApprovalsOpen(true);
              }}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: 2,
                bgcolor: '#0d9488',
                '&:hover': {
                  bgcolor: '#0f766e',
                },
              }}
            >
              Review Now
            </Button>
          </Stack>
        </Box>
      </Dialog>
    </Box >
  );
};

export default Dashboard;
