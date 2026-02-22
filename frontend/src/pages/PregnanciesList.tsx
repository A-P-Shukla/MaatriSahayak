import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';

/**
 * Pregnancies List page - List of all registered pregnancies
 */
const PregnanciesList: React.FC = () => {
  return (
    <Box>
      {/* Page header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Pregnancies
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and monitor all registered pregnancies in your district
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => window.location.href = '/pregnancies/new'}
        >
          Register New Pregnancy
        </Button>
      </Box>

      {/* Search and filters */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body1" fontWeight={500} gutterBottom>
              Search Pregnancies
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Find pregnancies by patient name, village, or other criteria
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<SearchIcon />}
            onClick={() => alert('Search functionality coming soon')}
          >
            Search
          </Button>
        </Box>
      </Paper>

      {/* Pregnancies table placeholder */}
      <Paper
        sx={{
          p: 3,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          minHeight: '400px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Pregnancy Registry
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
          This page will display a comprehensive list of all registered pregnancies
          with filtering, sorting, and pagination capabilities.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => alert('View sample data')}
          >
            View Sample Data
          </Button>
          <Button
            variant="contained"
            onClick={() => window.location.href = '/pregnancies/new'}
          >
            Add First Pregnancy
          </Button>
        </Box>
      </Paper>

      {/* Quick stats */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Quick Statistics
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {[
            { label: 'Total Registered', value: '1,247' },
            { label: 'High-Risk', value: '89' },
            { label: 'Due This Month', value: '42' },
            { label: 'Requiring Follow-up', value: '18' },
          ].map((stat, index) => (
            <Paper
              key={index}
              sx={{
                p: 2,
                minWidth: '150px',
                textAlign: 'center',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
              }}
            >
              <Typography variant="h5" fontWeight={700}>
                {stat.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stat.label}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default PregnanciesList;