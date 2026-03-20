import React from 'react';
import { Box, Typography, Paper, CircularProgress, Alert, Button } from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAshaWorker, useAshaPregnancies } from '../hooks/useAsha';

const AshaWorkerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: worker, isLoading, isError, error } = useAshaWorker(id || '');
  const { data: pregnancies = [] } = useAshaPregnancies(id || '');

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !worker) {
    return (
      <Box>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/asha')} sx={{ mb: 3 }}>
          Back to ASHA Workers
        </Button>
        <Alert severity="error">
          Failed to load ASHA worker details: {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Button startIcon={<BackIcon />} onClick={() => navigate('/asha')} sx={{ mb: 3 }}>
        Back to ASHA Workers
      </Button>
      
      <Typography variant="h4" fontWeight={600} gutterBottom>
        {worker.name}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        ASHA Worker ID: {worker.asha_id}
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Contact Information</Typography>
        <Typography>Phone: {worker.phone}</Typography>
        <Typography>Email: {worker.email}</Typography>
        <Typography>Location: {worker.village}, {worker.district}</Typography>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Performance Metrics</Typography>
        <Typography>Assigned Patients: {worker.assigned_patients_count}</Typography>
        <Typography>Active Pregnancies: {worker.active_pregnancies}</Typography>
        <Typography>High Risk Cases: {worker.high_risk_cases}</Typography>
        <Typography>Emergencies Handled: {worker.total_emergencies_handled}</Typography>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Assigned Patients ({pregnancies.length})</Typography>
        {pregnancies.length === 0 ? (
          <Typography color="text.secondary">No patients assigned yet</Typography>
        ) : (
          pregnancies.map((pregnancy: any) => (
            <Box key={pregnancy.pregnancy_id} sx={{ p: 2, mb: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="body1" fontWeight={600}>{pregnancy.patient_name}</Typography>
              <Typography variant="body2" color="text.secondary">
                Age: {pregnancy.age} | Village: {pregnancy.village}
              </Typography>
            </Box>
          ))
        )}
      </Paper>
    </Box>
  );
};

export default AshaWorkerDetails;
