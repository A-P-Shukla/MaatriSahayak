import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { LocationOn as LocationIcon, Refresh as RefreshIcon } from '@mui/icons-material';

/**
 * Live Tracking page - Map view of ambulance locations
 */
const LiveTracking: React.FC = () => {
  return (
    <Box>
      {/* Page header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Live Ambulance Tracking
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Real-time tracking of ambulance locations and emergency routes
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => alert('Refreshing locations...')}
        >
          Refresh Locations
        </Button>
      </Box>

      {/* Map placeholder */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          minHeight: '500px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'grey.50',
        }}
      >
        <LocationIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2, opacity: 0.5 }} />
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Live Map View
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center', maxWidth: '400px' }}>
          This area will display an interactive map showing ambulance locations,
          emergency routes, and hospital locations in real-time.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => alert('View sample map')}
          >
            View Sample Map
          </Button>
          <Button
            variant="contained"
            onClick={() => alert('Full screen map coming soon')}
          >
            Full Screen Map
          </Button>
        </Box>
      </Paper>

      {/* Ambulance status summary */}
      <Paper
        sx={{
          p: 3,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Ambulance Fleet Status
        </Typography>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {[
            { status: 'Available', count: 18, color: 'success.main' },
            { status: 'Dispatched', count: 0, color: 'warning.main' },
            { status: 'Busy', count: 0, color: 'error.main' },
            { status: 'Maintenance', count: 2, color: 'text.secondary' },
          ].map((item, index) => (
            <Box
              key={index}
              sx={{
                p: 2,
                minWidth: '120px',
                textAlign: 'center',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
              }}
            >
              <Typography variant="h4" fontWeight={700} sx={{ color: item.color }}>
                {item.count}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.status}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default LiveTracking;