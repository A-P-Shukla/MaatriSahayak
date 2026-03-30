import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Paper, CircularProgress, Alert, Button, Chip,
  useTheme, useMediaQuery, IconButton, Badge, Tooltip, Stack, Avatar, Divider, LinearProgress,
  Snackbar,
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

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  useMediaQuery(theme.breakpoints.down('sm'));

  const [selectedEmergencyId, setSelectedEmergencyId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [approvalsOpen, setApprovalsOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  const { data: stats, isLoading, isError, error, refetch } = useDashboardStats();
  const { isConnected, lastMessage } = useWebSocket({ enabled: true });

  // Handle WebSocket messages for new registrations
  useEffect(() => {
    if (lastMessage?.type === 'new_registration') {
      const { registrationType, name } = lastMessage.data || {};
      const type = registrationType === 'DRIVER' ? 'Driver' : 'ASHA Worker';
      setNotificationMessage(`New ${type} registration: ${name || 'Unknown'}`);
      setNotificationOpen(true);
      // Optionally auto-open the approvals panel
      // setApprovalsOpen(true);
    }
  }, [lastMessage]);

  const metrics = stats ? [
    {
      title: 'Total Pregnancies',
      value: stats.total_pregnancies || 0,
      icon: <Baby size={20} />,
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
      icon: <AlertTriangle size={20} />,
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
      icon: <HeartPulse size={20} />,
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
      icon: <Ambulance size={20} />,
      color: '#0277BD',
      bg: 'linear-gradient(135deg, #0277BD 0%, #29B6F6 100%)',
      lightBg: '#E3F2FD',
      trend: 'Ready',
      sub: 'On standby',
      path: '/tracking',
    },
  ] : [];

  const quickActions = [
    { label: 'Pregnancies', path: '/pregnancies', icon: <Baby size={20} />, color: '#1B6B4A', bg: '#E8F5EE' },
    { label: 'Emergencies', path: '/emergencies', icon: <HeartPulse size={20} />, color: '#C62828', bg: '#FFEBEE' },
    { label: 'Live Tracking', path: '/tracking', icon: <Ambulance size={20} />, color: '#0277BD', bg: '#E3F2FD' },
    { label: 'Analytics', path: '/analytics', icon: <TrendingUp size={20} />, color: '#6A1B9A', bg: '#F3E5F5' },
    { label: 'Hospitals', path: '/hospitals', icon: <ShieldPlus size={20} />, color: '#00695C', bg: '#E0F2F1' },
    { label: 'Drivers', path: '/drivers', icon: <Gauge size={20} />, color: '#4527A0', bg: '#EDE7F6' },
  ];

  const now = new Date().toLocaleString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <Box sx={{ maxWidth: '100%', overflow: 'hidden', pb: 4 }}>

      {/* ── Header ── */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
        mb: 4,
      }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 0.5 }}>
            <Typography variant="h4" fontWeight={800} sx={{ fontSize: { xs: '1.5rem', md: '2rem' }, letterSpacing: '-0.5px' }}>
              Dashboard
            </Typography>
            {isConnected && (
              <Chip
                icon={<Circle size={6} color="#4CAF50" fill="#4CAF50" />}
                label="Live"
                size="small"
                sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 700, fontSize: '0.7rem', height: 22 }}
              />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Clock size={14} />
            {now}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
          <Tooltip title="Pending Approvals">
            <IconButton
              onClick={() => setApprovalsOpen(true)}
              sx={{
                border: '1.5px solid',
                borderColor: pendingCount > 0 ? 'error.main' : 'divider',
                borderRadius: 2,
                bgcolor: pendingCount > 0 ? '#FFF5F5' : '#fff',
                width: 40, height: 40,
              }}
            >
              <Badge badgeContent={pendingCount} color="error"
                sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', fontWeight: 700, minWidth: 16, height: 16 } }}>
                <Bell size={18} color={pendingCount > 0 ? '#d32f2f' : '#1B6B4A'} />
              </Badge>
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<RefreshCw size={16} />}
            onClick={() => refetch()}
            disabled={isLoading}
            size="small"
            sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none', px: 2 }}
          >
            Refresh
          </Button>
        </Stack>
      </Box>

      {/* ── Loading ── */}
      {isLoading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 2 }}>
          <CircularProgress size={44} thickness={4} sx={{ color: '#1B6B4A' }} />
          <Typography variant="body2" color="text.secondary">Loading dashboard data…</Typography>
        </Box>
      )}

      {/* ── Error ── */}
      {isError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error?.message || 'Failed to load dashboard statistics.'}
        </Alert>
      )}

      {!isLoading && !isError && stats && (
        <>
          {/* ── Metric Cards ── */}
          <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
            {metrics.map((m, i) => (
              <Grid item xs={6} sm={6} md={3} key={i}>
                <Paper
                  elevation={0}
                  onClick={() => navigate(m.path)}
                  sx={{
                    p: { xs: 2, md: 2.5 },
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 32px ${m.color}22`,
                      borderColor: m.color,
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0, left: 0, right: 0,
                      height: 3,
                      background: m.bg,
                      borderRadius: '3px 3px 0 0',
                    },
                  }}
                >
                  {/* Pulse ring for active emergencies */}
                  {m.pulse && (
                    <Box sx={{
                      position: 'absolute', top: 12, right: 12,
                      width: 10, height: 10, borderRadius: '50%',
                      bgcolor: '#D32F2F',
                      '&::after': {
                        content: '""', position: 'absolute',
                        top: -4, left: -4, right: -4, bottom: -4,
                        borderRadius: '50%', border: '2px solid #D32F2F',
                        animation: 'pulse 1.5s ease-out infinite',
                        opacity: 0.6,
                      },
                      '@keyframes pulse': {
                        '0%': { transform: 'scale(0.8)', opacity: 0.8 },
                        '100%': { transform: 'scale(2)', opacity: 0 },
                      },
                    }} />
                  )}

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{
                      width: { xs: 42, md: 48 }, height: { xs: 42, md: 48 },
                      borderRadius: 2.5,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      bgcolor: m.lightBg, color: m.color,
                      '& svg': { fontSize: { xs: '1.3rem', md: '1.5rem' } },
                    }}>
                      {m.icon}
                    </Box>
                    <Chip
                      label={m.trend}
                      size="small"
                      sx={{
                        height: 20, fontSize: '0.65rem', fontWeight: 700,
                        bgcolor: m.pulse ? '#FFEBEE' : '#F5F5F5',
                        color: m.pulse ? '#C62828' : 'text.secondary',
                      }}
                    />
                  </Box>

                  <Typography fontWeight={800} sx={{
                    fontSize: { xs: '1.8rem', md: '2.4rem' },
                    lineHeight: 1, mb: 0.4,
                    color: 'text.primary',
                    letterSpacing: '-1px',
                  }}>
                    {m.value.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ fontSize: { xs: '0.78rem', md: '0.875rem' }, mb: 0.2 }}>
                    {m.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {m.sub}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* ── Activity + Risk Panels ── */}
          <Grid container spacing={2.5} sx={{ mb: 3.5 }}>

            {/* Recent Emergencies */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#FFEBEE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <HeartPulse size={18} color="#C62828" />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.2 }}>Recent Emergencies</Typography>
                      <Typography variant="caption" color="text.secondary">Last 10 events</Typography>
                    </Box>
                  </Box>
                  <Button
                    size="small" endIcon={<ArrowRight size={14} />}
                    onClick={() => navigate('/emergencies')}
                    sx={{ fontWeight: 600, textTransform: 'none', fontSize: '0.8rem', color: '#C62828' }}
                  >
                    View All
                  </Button>
                </Box>
                <Divider />
                <Box sx={{ flex: 1, overflowY: 'auto', maxHeight: 380, p: 1.5 }}>
                  {stats.recent_emergencies?.length > 0
                    ? stats.recent_emergencies.slice(0, 10).map((e) => {
                      const sc = STATUS_COLOR[e.status] || { bg: '#F5F5F5', text: '#616161' };
                      const sev = e.severity_level?.toLowerCase() || 'low';
                      return (
                        <Box
                          key={e.event_id}
                          onClick={() => { setSelectedEmergencyId(e.event_id); setModalOpen(true); }}
                          sx={{
                            display: 'flex', alignItems: 'center', gap: 1.5,
                            p: 1.5, mb: 0.75, borderRadius: 2,
                            border: '1px solid transparent',
                            cursor: 'pointer', transition: 'all 0.15s',
                            '&:hover': { bgcolor: '#FAFAFA', borderColor: 'divider' },
                          }}
                        >
                          <Avatar sx={{ width: 36, height: 36, bgcolor: SEVERITY_COLOR[sev] + '18', color: SEVERITY_COLOR[sev], fontSize: '0.8rem', fontWeight: 700 }}>
                            {(e.patient_name || '?').charAt(0).toUpperCase()}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={600} noWrap>{e.patient_name}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.2 }}>
                              <Clock size={11} color="#bdbdbd" />
                              <Typography variant="caption" color="text.secondary">
                                {new Date(e.trigger_timestamp).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </Typography>
                            </Box>
                          </Box>
                          <Stack direction="column" alignItems="flex-end" spacing={0.5}>
                            <Chip label={e.status.replace('_', ' ').toUpperCase()} size="small"
                              sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700, bgcolor: sc.bg, color: sc.text, px: 0.5 }} />
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: SEVERITY_COLOR[sev] }} />
                          </Stack>
                        </Box>
                      );
                    })
                    : (
                      <Box sx={{ textAlign: 'center', py: 6 }}>
                        <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1.5 }}>
                          <HeartPulse size={28} color="#bdbdbd" />
                        </Box>
                        <Typography variant="body2" fontWeight={600} color="text.secondary">No recent emergencies</Typography>
                        <Typography variant="caption" color="text.disabled">All systems operating normally</Typography>
                      </Box>
                    )}
                </Box>
              </Paper>
            </Grid>

            {/* High-Risk Pregnancies */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#FFF3E0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AlertTriangle size={18} color="#E65100" />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.2 }}>High-Risk Pregnancies</Typography>
                      <Typography variant="caption" color="text.secondary">Top 10 by risk score</Typography>
                    </Box>
                  </Box>
                  <Button
                    size="small" endIcon={<ArrowRight size={14} />}
                    onClick={() => navigate('/pregnancies')}
                    sx={{ fontWeight: 600, textTransform: 'none', fontSize: '0.8rem', color: '#E65100' }}
                  >
                    View All
                  </Button>
                </Box>
                <Divider />
                <Box sx={{ flex: 1, overflowY: 'auto', maxHeight: 380, p: 1.5 }}>
                  {stats.high_risk_pregnancies?.length > 0
                    ? stats.high_risk_pregnancies.slice(0, 10).map((p) => {
                      const score = p.risk_score || 0;
                      const riskColor = score >= 80 ? '#C62828' : score >= 60 ? '#E65100' : score >= 40 ? '#F9A825' : '#2E7D32';
                      return (
                        <Box
                          key={p.pregnancy_id}
                          onClick={() => navigate(`/pregnancies/${p.pregnancy_id}`)}
                          sx={{
                            p: 1.5, mb: 0.75, borderRadius: 2,
                            border: '1px solid transparent',
                            cursor: 'pointer', transition: 'all 0.15s',
                            '&:hover': { bgcolor: '#FAFAFA', borderColor: 'divider' },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 36, height: 36, bgcolor: riskColor + '18', color: riskColor, fontSize: '0.8rem', fontWeight: 700 }}>
                              {(p.patient_name || '?').charAt(0).toUpperCase()}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: '60%' }}>{p.patient_name}</Typography>
                                <Typography variant="caption" fontWeight={800} sx={{ color: riskColor }}>{score}%</Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={score}
                                sx={{
                                  height: 4, borderRadius: 2, bgcolor: riskColor + '20',
                                  '& .MuiLinearProgress-bar': { bgcolor: riskColor, borderRadius: 2 },
                                  mb: 0.5,
                                }}
                              />
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <MapPin size={11} color="#bdbdbd" />
                                <Typography variant="caption" color="text.secondary" noWrap>
                                  {p.village}, {p.district}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      );
                    })
                    : (
                      <Box sx={{ textAlign: 'center', py: 6 }}>
                        <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1.5 }}>
                          <AlertTriangle size={28} color="#bdbdbd" />
                        </Box>
                        <Typography variant="body2" fontWeight={600} color="text.secondary">No high-risk pregnancies</Typography>
                        <Typography variant="caption" color="text.disabled">All within normal risk levels</Typography>
                      </Box>
                    )}
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* ── Quick Actions ── */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={700}>Quick Actions</Typography>
              <Chip label="Navigate" size="small" sx={{ height: 18, fontSize: '0.65rem', bgcolor: '#F5F5F5', color: 'text.secondary' }} />
            </Box>
            <Grid container spacing={1.5}>
              {quickActions.map((a) => (
                <Grid item xs={6} sm={4} md={2} key={a.path}>
                  <Paper
                    elevation={0}
                    onClick={() => navigate(a.path)}
                    sx={{
                      p: { xs: 1.5, md: 2 },
                      borderRadius: 2.5,
                      border: '1.5px solid',
                      borderColor: 'divider',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 1,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: a.color,
                        bgcolor: a.bg,
                        transform: 'translateY(-3px)',
                        boxShadow: `0 8px 24px ${a.color}22`,
                        '& .qa-icon': { color: a.color, transform: 'scale(1.15)' },
                        '& .qa-label': { color: a.color },
                      },
                    }}
                  >
                    <Box className="qa-icon" sx={{ color: 'text.secondary', transition: 'all 0.2s', '& svg': { fontSize: '1.4rem' } }}>
                      {a.icon}
                    </Box>
                    <Typography className="qa-label" variant="caption" fontWeight={700} sx={{ transition: 'color 0.2s', color: 'text.secondary', fontSize: '0.75rem', textAlign: 'center' }}>
                      {a.label}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </>
      )}

      <EmergencyDetailsModal
        emergencyId={selectedEmergencyId}
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedEmergencyId(null); }}
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
            bgcolor: '#1B6B4A',
            color: '#fff',
            fontWeight: 600,
            boxShadow: '0 8px 24px rgba(27, 107, 74, 0.3)',
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
    </Box>
  );
};

export default Dashboard;
