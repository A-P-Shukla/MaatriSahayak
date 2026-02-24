import React, { useState } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress, Alert, Button } from '@mui/material';
import {
  PregnantWoman as PregnancyIcon,
  Warning as WarningIcon,
  LocalTaxi as AmbulanceIcon,
  LocalHospital as EmergencyIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDashboardStats } from '../hooks/useDashboardStats';
import EmergencyDetailsModal from '../components/EmergencyDetailsModal';

/**
 * Dashboard page - Overview of key metrics
 */
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // Modal state
  const [selectedEmergencyId, setSelectedEmergencyId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Handle opening modal
  const handleOpenModal = (emergencyId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedEmergencyId(emergencyId);
    setModalOpen(true);
  };

  // Handle closing modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedEmergencyId(null);
  };
  
  // Fetch dashboard statistics with auto-refresh
  const { data: stats, isLoading, isError, error } = useDashboardStats();

  // Format number with commas
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  // Prepare metrics data from API response
  const metrics = stats ? [
    {
      title: 'Total Pregnancies',
      value: formatNumber(stats.total_pregnancies),
      icon: <PregnancyIcon fontSize="large" />,
      color: 'primary.main',
    },
    {
      title: 'High-Risk',
      value: formatNumber(stats.high_risk_count),
      icon: <WarningIcon fontSize="large" />,
      color: 'warning.main',
    },
    {
      title: 'Active Emergencies',
      value: formatNumber(stats.active_emergencies),
      icon: <EmergencyIcon fontSize="large" />,
      color: 'error.main',
    },
    {
      title: 'Available Ambulances',
      value: formatNumber(stats.available_ambulances),
      icon: <AmbulanceIcon fontSize="large" />,
      color: 'success.main',
    },
  ] : [];

  return (
    <Box>
      {/* Page header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Dashboard Overview
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome to MaatriSahayak Dashboard. Monitor maternal health metrics and emergency responses.
        </Typography>
      </Box>

      {/* Loading state */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress size={60} />
        </Box>
      )}

      {/* Error state */}
      {isError && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error?.message || 'Failed to load dashboard statistics. Please try again.'}
        </Alert>
      )}

      {/* Dashboard content - only show when data is loaded */}
      {!isLoading && !isError && stats && (
        <>
          {/* Metrics cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {metrics.map((metric, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper
                  sx={{
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    height: '100%',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                      backgroundColor: `${metric.color}15`, // 15% opacity
                      color: metric.color,
                    }}
                  >
                    {metric.icon}
                  </Box>
                  <Typography variant="h3" fontWeight={700} gutterBottom>
                    {metric.value}
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {metric.title}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Recent activity sections */}
          <Grid container spacing={3}>
            {/* Recent Emergencies */}
            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 3,
                  height: '100%',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Recent Emergencies
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Last 10 emergency events
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate('/emergencies')}
                  >
                    View All
                  </Button>
                </Box>
                {stats.recent_emergencies.length > 0 ? (
                  <Box>
                    {stats.recent_emergencies.slice(0, 10).map((emergency) => (
                      <Box
                        key={emergency.event_id}
                        sx={{
                          p: 2,
                          mb: 1,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          },
                        }}
                        onClick={(e) => handleOpenModal(emergency.event_id, e)}
                      >
                        <Typography variant="body2" fontWeight={600}>
                          {emergency.patient_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Status: {emergency.status} | {new Date(emergency.trigger_timestamp).toLocaleString()}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No recent emergencies
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      All systems are operating normally
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* High-Risk Pregnancies */}
            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 3,
                  height: '100%',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      High-Risk Pregnancies
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Top 10 by risk score
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate('/pregnancies')}
                  >
                    View All
                  </Button>
                </Box>
                {stats.high_risk_pregnancies.length > 0 ? (
                  <Box>
                    {stats.high_risk_pregnancies.slice(0, 10).map((pregnancy) => (
                      <Box
                        key={pregnancy.pregnancy_id}
                        sx={{
                          p: 2,
                          mb: 1,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          },
                        }}
                        onClick={() => navigate(`/pregnancies/${pregnancy.pregnancy_id}`)}
                      >
                        <Typography variant="body2" fontWeight={600}>
                          {pregnancy.patient_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Risk Score: {pregnancy.risk_score} | {pregnancy.village}, {pregnancy.district}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No high-risk pregnancies
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      All pregnancies are within normal risk levels
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* Quick actions */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                  onClick={() => navigate('/pregnancies')}
                >
                  <Typography variant="body1" fontWeight={500}>
                    View All Pregnancies
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                  onClick={() => navigate('/emergencies')}
                >
                  <Typography variant="body1" fontWeight={500}>
                    View All Emergencies
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                  onClick={() => navigate('/tracking')}
                >
                  <Typography variant="body1" fontWeight={500}>
                    Live Ambulance Tracking
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                  onClick={() => navigate('/analytics')}
                >
                  <Typography variant="body1" fontWeight={500}>
                    View Analytics
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </>
      )}

      {/* Emergency Details Modal */}
      <EmergencyDetailsModal
        emergencyId={selectedEmergencyId}
        open={modalOpen}
        onClose={handleCloseModal}
      />
    </Box>
  );
};

export default Dashboard;