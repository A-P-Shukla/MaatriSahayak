import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Grid, Paper, CircularProgress, Alert, Button, Chip,
  useTheme, useMediaQuery, IconButton, Badge, Tooltip, Stack, Avatar, Divider, LinearProgress,
  Snackbar, Dialog,
} from '@mui/material';
import {
  Baby, AlertTriangle, Ambulance, HeartPulse, ArrowRight, RefreshCw,
  Bell, TrendingUp, Circle, Clock, MapPin, Gauge, ShieldPlus,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useWebSocket } from '../hooks/useWebSocket';
import EmergencyDetailsModal from '../components/EmergencyDetailsModal';
import PendingApprovalsPanel from '../components/PendingApprovalsPanel';

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
    color: '#1B6B4A',
    bg: 'linear-gradient(135deg, #1B6B4A 0%, #2E9E6E 100%)',
    lightBg: '#E8F5EE',
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
  { label: 'Pregnancies', path: '/pregnancies', icon: <Baby size={22} />, color: '#1B6B4A', bg: '#E8F5EE' },
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

  useEffect(() => {
    if (lastMessage?.type === 'new_registration') {
      const { registrationType, name } = lastMessage.data || {};
      const type = registrationType === 'DRIVER' ? 'Driver' : 'ASHA Worker';
      setNewRegistration({ type, name: name || 'Unknown' });
      setRegistrationDialogOpen(true);
      setNotificationMessage(`New ${type} registration: ${name || 'Unknown'}`);
      setNotificationOpen(true);
      setPendingCount((prev) => prev + 1);
    }
  }, [lastMessage]);

  return {
    pendingCount,
    setPendingCount,
    notificationOpen,
    setNotificationOpen,
    notificationMessage,
    registrationDialogOpen,
    setRegistrationDialogOpen,
    newRegistration,
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
          border: '1px solid #e5e7eb',
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
                        return (
                          <Box
                            key={p.pregnancy_id}
                            onClick={() => navigate(`/pregnancies/${p.pregnancy_id}`)}
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
              New Registration Alert
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
