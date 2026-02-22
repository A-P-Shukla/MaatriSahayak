import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import {
  PregnantWoman as PregnancyIcon,
  Warning as WarningIcon,
  LocalTaxi as AmbulanceIcon,
} from '@mui/icons-material';

/**
 * Dashboard page - Overview of key metrics
 */
const Dashboard: React.FC = () => {
  // Mock data - in real app, this would come from API
  const metrics = [
    {
      title: 'Total Pregnancies',
      value: '1,247',
      icon: <PregnancyIcon fontSize="large" />,
      color: 'primary.main',
      change: '+12%',
    },
    {
      title: 'High-Risk',
      value: '89',
      icon: <WarningIcon fontSize="large" />,
      color: 'warning.main',
      change: '+3%',
    },
    {
      title: 'Active Emergencies',
      value: '5',
      icon: <WarningIcon fontSize="large" />,
      color: 'error.main',
      change: '-2%',
    },
    {
      title: 'Available Ambulances',
      value: '18',
      icon: <AmbulanceIcon fontSize="large" />,
      color: 'success.main',
      change: '+1%',
    },
  ];

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
              <Typography variant="body1" fontWeight={500} gutterBottom>
                {metric.title}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: metric.change.startsWith('+') ? 'success.main' : 'error.main',
                  fontWeight: 600,
                }}
              >
                {metric.change} from last week
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
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Recent Emergencies
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Last 10 emergency events
            </Typography>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No recent emergencies
              </Typography>
              <Typography variant="caption" color="text.secondary">
                All systems are operating normally
              </Typography>
            </Box>
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
            <Typography variant="h6" fontWeight={600} gutterBottom>
              High-Risk Pregnancies
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Top 10 by risk score
            </Typography>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                Loading pregnancy data...
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Please wait while we fetch the latest information
              </Typography>
            </Box>
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
              onClick={() => window.location.href = '/pregnancies'}
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
              onClick={() => window.location.href = '/emergencies'}
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
              onClick={() => window.location.href = '/tracking'}
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
              onClick={() => window.location.href = '/analytics'}
            >
              <Typography variant="body1" fontWeight={500}>
                View Analytics
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;