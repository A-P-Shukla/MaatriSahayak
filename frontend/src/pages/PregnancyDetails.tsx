import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';

/**
 * Pregnancy Details page - Detailed view of a specific pregnancy
 */
const PregnancyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <Box>
      {/* Header with back button */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/pregnancies')}
          sx={{ mr: 2 }}
        >
          Back to List
        </Button>
        <Typography variant="h4" fontWeight={600}>
          Pregnancy Details
        </Typography>
      </Box>

      <Paper
        sx={{
          p: 3,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          mb: 3,
        }}
      >
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Pregnancy #{id}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Detailed view for pregnancy record. This page will show comprehensive
          information about the pregnancy including patient details, medical history,
          vital signs, and related emergency events.
        </Typography>
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Patient information, medical history, vital signs, and emergency
            history will be displayed here.
          </Typography>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Button
          variant="contained"
          onClick={() => alert('Edit functionality coming soon')}
        >
          Edit Details
        </Button>
        <Button
          variant="outlined"
          onClick={() => alert('Record vitals functionality coming soon')}
        >
          Record Vitals
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={() => alert('Emergency trigger coming soon')}
        >
          Trigger Emergency
        </Button>
      </Box>
    </Box>
  );
};

export default PregnancyDetails;