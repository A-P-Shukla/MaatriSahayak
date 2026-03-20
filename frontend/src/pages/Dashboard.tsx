import React, { useState } from 'react';
import {
  Box, Typography, Grid, Paper, CircularProgress, Alert, Button, Chip, useTheme, useMediaQuery,
} from '@mui/material';
import {
  PregnantWoman as PregnancyIcon,
  Warning as WarningIcon,
  LocalTaxi as AmbulanceIcon,
  LocalHospital as EmergencyIcon,
  ArrowForward as ArrowForwardIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useWebSocket } from '../hooks/useWebSocket';
import EmergencyDetailsModal from '../components/EmergencyDetailsModal';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [selectedEmergencyId, setSelectedEmergencyId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: stats, isLoading, isError, error, refetch } = useDashboardStats();
  const { isConnected } = useWebSocket({ enabled: true });

  const metrics = stats ? [
    { title: 'Total Pregnancies', value: (stats.total_pregnancies || 0).toLocaleString(), icon: <PregnancyIcon />, color: '#1B6B4A', bg: '#E8F5EE' },
    { title: 'High-Risk Cases', value: (stats.high_risk_count || 0).toLocaleString(), icon: <WarningIcon />, color: '#E65100', bg: '#FFF3E0' },
    { title: 'Active Emergencies', value: (stats.active_emergencies || 0).toLocaleString(), icon: <EmergencyIcon />, color: '#D32F2F', bg: '#FFEBEE' },
    { title: 'Available Ambulances', value: (stats.available_ambulances || 0).toLocaleString(), icon: <AmbulanceIcon />, color: '#0277BD', bg: '#E3F2FD' },
  ] : [];

  const quickActions = [
    { label: 'Pregnancies', path: '/pregnancies', color: '#1B6B4A' },
    { label: 'Emergencies', path: '/emergencies', color: '#D32F2F' },
    { label: 'Live Tracking', path: '/tracking', color: '#0277BD' },
    { label: 'Analytics', path: '/analytics', color: '#7B1FA2' },
  ];

  return (
    <Box sx={{ maxWidth: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
        mb: 3,
      }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: '1.4rem', md: '2rem' } }}>
              Dashboard Overview
            </Typography>
            {isConnected && <Chip label="Live" color="success" size="small" sx={{ fontWeight: 700 }} />}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Monitor maternal health metrics and emergency responses
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => refetch()}
          disabled={isLoading}
          size={isMobile ? 'small' : 'medium'}
          sx={{ flexShrink: 0 }}
        >
          Refresh
        </Button>
      </Box>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
          <CircularProgress size={48} />
        </Box>
      )}

      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error?.message || 'Failed to load dashboard statistics.'}
        </Alert>
      )}

      {!isLoading && !isError && stats && (
        <>
          {/* Metric Cards */}
          <Grid container spacing={{ xs: 1.5, md: 2 }} sx={{ mb: 3 }}>
            {metrics.map((m, i) => (
              <Grid item xs={6} sm={6} md={3} key={i}>
                <Paper elevation={0} sx={{
                  p: { xs: 2, md: 3 },
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  transition: 'all 0.2s',
                  '&:hover': { transform: 'translateY(-3px)', boxShadow: 3, borderColor: m.color },
                }}>
                  <Box sx={{
                    width: { xs: 40, md: 52 },
                    height: { xs: 40, md: 52 },
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1.5,
                    bgcolor: m.bg,
                    color: m.color,
                    '& svg': { fontSize: { xs: '1.3rem', md: '1.6rem' } },
                  }}>
                    {m.icon}
                  </Box>
                  <Typography fontWeight={700} sx={{ fontSize: { xs: '1.6rem', md: '2.2rem' }, lineHeight: 1, mb: 0.5, color: 'text.primary' }}>
                    {m.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                    {m.title}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Recent Activity */}
          <Grid container spacing={{ xs: 1.5, md: 2 }} sx={{ mb: 3 }}>
            {/* Recent Emergencies */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%' }}>
                <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1rem', md: '1.1rem' } }}>Recent Emergencies</Typography>
                    <Typography variant="caption" color="text.secondary">Last 10 events</Typography>
                  </Box>
                  <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/emergencies')} sx={{ fontWeight: 600 }}>
                    View All
                  </Button>
                </Box>
                <Box sx={{ p: 2, maxHeight: 360, overflowY: 'auto' }}>
                  {stats.recent_emergencies?.length > 0 ? stats.recent_emergencies.slice(0, 10).map((e) => (
                    <Box
                      key={e.event_id}
                      onClick={(ev) => { ev.stopPropagation(); setSelectedEmergencyId(e.event_id); setModalOpen(true); }}
                      sx={{
                        p: 1.5, mb: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1.5,
                        cursor: 'pointer', transition: 'all 0.15s',
                        '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' },
                        '&:last-child': { mb: 0 },
                      }}
                    >
                      <Typography variant="body2" fontWeight={600}>{e.patient_name}</Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.3, flexWrap: 'wrap' }}>
                        <Typography variant="caption" color="text.secondary">Status: {e.status}</Typography>
                        <Typography variant="caption" color="text.secondary">·</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(e.trigger_timestamp).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>
                    </Box>
                  )) : (
                    <Box sx={{ textAlign: 'center', py: 5 }}>
                      <EmergencyIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">No recent emergencies</Typography>
                      <Typography variant="caption" color="text.secondary">All systems operating normally</Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* High-Risk Pregnancies */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%' }}>
                <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1rem', md: '1.1rem' } }}>High-Risk Pregnancies</Typography>
                    <Typography variant="caption" color="text.secondary">Top 10 by risk score</Typography>
                  </Box>
                  <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/pregnancies')} sx={{ fontWeight: 600 }}>
                    View All
                  </Button>
                </Box>
                <Box sx={{ p: 2, maxHeight: 360, overflowY: 'auto' }}>
                  {stats.high_risk_pregnancies?.length > 0 ? stats.high_risk_pregnancies.slice(0, 10).map((p) => (
                    <Box
                      key={p.pregnancy_id}
                      onClick={() => navigate(`/pregnancies/${p.pregnancy_id}`)}
                      sx={{
                        p: 1.5, mb: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1.5,
                        cursor: 'pointer', transition: 'all 0.15s',
                        '&:hover': { bgcolor: 'action.hover', borderColor: 'warning.main' },
                        '&:last-child': { mb: 0 },
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" fontWeight={600}>{p.patient_name}</Typography>
                        <Chip label={`${p.risk_score}`} size="small" color="warning" sx={{ fontWeight: 700, height: 20, fontSize: '0.7rem' }} />
                      </Box>
                      <Typography variant="caption" color="text.secondary">{p.village}, {p.district}</Typography>
                    </Box>
                  )) : (
                    <Box sx={{ textAlign: 'center', py: 5 }}>
                      <WarningIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">No high-risk pregnancies</Typography>
                      <Typography variant="caption" color="text.secondary">All within normal risk levels</Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Quick Actions */}
          <Box>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 1.5, fontSize: { xs: '1rem', md: '1.1rem' } }}>
              Quick Actions
            </Typography>
            <Grid container spacing={{ xs: 1, md: 1.5 }}>
              {quickActions.map((a) => (
                <Grid item xs={6} sm={3} key={a.path}>
                  <Paper
                    elevation={0}
                    onClick={() => navigate(a.path)}
                    sx={{
                      p: { xs: 1.5, md: 2 },
                      textAlign: 'center',
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: a.color,
                        borderColor: a.color,
                        transform: 'translateY(-2px)',
                        boxShadow: 3,
                        '& .action-label': { color: 'white' },
                      },
                    }}
                  >
                    <Typography className="action-label" variant="body2" fontWeight={600} sx={{ transition: 'color 0.2s', fontSize: { xs: '0.8rem', md: '0.9rem' } }}>
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
    </Box>
  );
};

export default Dashboard;
