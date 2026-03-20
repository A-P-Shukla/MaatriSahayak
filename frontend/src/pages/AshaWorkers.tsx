import React from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import { useAshaWorkers, useAshaStats } from '../hooks/useAsha';

const AshaWorkers: React.FC = () => {
  const { data: workers = [], isLoading } = useAshaWorkers({});
  const { data: stats } = useAshaStats();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        ASHA Workers Management
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Monitor and manage ASHA workers and their assigned patients
      </Typography>

      {stats && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6">Statistics</Typography>
          <Typography>Total Workers: {stats.total_asha_workers}</Typography>
          <Typography>Active Workers: {stats.active_workers}</Typography>
          <Typography>Total Patients: {stats.total_patients_covered}</Typography>
        </Paper>
      )}

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>ASHA Workers ({workers.length})</Typography>
        {workers.length === 0 ? (
          <Typography color="text.secondary">No ASHA workers found</Typography>
        ) : (
          workers.map((worker) => (
            <Box key={worker.asha_id} sx={{ p: 2, mb: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="body1" fontWeight={600}>{worker.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {worker.village}, {worker.district} - {worker.assigned_patients_count} patients
              </Typography>
            </Box>
          ))
        )}
      </Paper>
    </Box>
  );
};

export default AshaWorkers;
