import React from 'react';
import { Box, Typography, Paper, Button, Chip } from '@mui/material';
import { Warning as WarningIcon, History as HistoryIcon } from '@mui/icons-material';

/**
 * Emergency Alerts page - Real-time monitoring of emergencies
 */
const EmergencyAlerts: React.FC = () => {
  return (
    <Box>
      {/* Page header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Emergency Alerts
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor active emergencies and review emergency history in real-time
        </Typography>
      </Box>

      {/* Active emergencies section */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <WarningIcon color="error" sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight={600}>
            Active Emergencies
          </Typography>
          <Chip
            label="0 Active"
            color="success"
            size="small"
            sx={{ ml: 2 }}
          />
        </Box>

        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            No active emergencies at this time
          </Typography>
          <Typography variant="caption" color="text.secondary">
            All systems are operating normally
          </Typography>
        </Box>
      </Paper>

      {/* Emergency history section */}
      <Paper
        sx={{
          p: 3,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <HistoryIcon color="action" sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight={600}>
            Emergency History
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            No emergency history available
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Past emergency events will appear here
          </Typography>
        </Box>
      </Paper>

      {/* Quick actions */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Emergency Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="error"
            onClick={() => alert('Manual emergency trigger coming soon')}
          >
            Trigger Manual Emergency
          </Button>
          <Button
            variant="outlined"
            onClick={() => alert('Emergency settings coming soon')}
          >
            Emergency Settings
          </Button>
          <Button
            variant="outlined"
            onClick={() => alert('Response team management coming soon')}
          >
            Manage Response Teams
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default EmergencyAlerts;