import React from 'react';
import { Box, Typography, Paper, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { BarChart as ChartIcon, Download as DownloadIcon } from '@mui/icons-material';

/**
 * Analytics page - Performance metrics and reports
 */
const Analytics: React.FC = () => {
  return (
    <Box>
      {/* Page header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Analytics & Reports
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Performance metrics, trends, and insights for maternal health emergency response
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={() => alert('Exporting report...')}
        >
          Export Report
        </Button>
      </Box>

      {/* Date range selector */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Report Period
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Date Range</InputLabel>
            <Select
              label="Date Range"
              defaultValue="30"
              size="small"
            >
              <MenuItem value="7">Last 7 days</MenuItem>
              <MenuItem value="30">Last 30 days</MenuItem>
              <MenuItem value="90">Last 90 days</MenuItem>
              <MenuItem value="custom">Custom Range</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={() => alert('Applying filters...')}
          >
            Apply Filters
          </Button>
        </Box>
      </Paper>

      {/* Key metrics */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Key Performance Indicators
        </Typography>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {[
            { label: 'Avg Response Time', value: '18.5 min', change: '-2.3%' },
            { label: 'Total Emergencies', value: '247', change: '+12.4%' },
            { label: 'Success Rate', value: '94.2%', change: '+1.8%' },
            { label: 'Avg Risk Score', value: '42.7', change: '-0.5%' },
          ].map((metric, index) => (
            <Paper
              key={index}
              sx={{
                p: 3,
                minWidth: '200px',
                flexGrow: 1,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
              }}
            >
              <Typography variant="h3" fontWeight={700} gutterBottom>
                {metric.value}
              </Typography>
              <Typography variant="body1" fontWeight={500} gutterBottom>
                {metric.label}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: metric.change.startsWith('+') ? 'success.main' : 'error.main',
                  fontWeight: 600,
                }}
              >
                {metric.change} from previous period
              </Typography>
            </Paper>
          ))}
        </Box>
      </Box>

      {/* Charts placeholder */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          minHeight: '400px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'grey.50',
        }}
      >
        <ChartIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2, opacity: 0.5 }} />
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Analytics Charts
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center', maxWidth: '500px' }}>
          This area will display interactive charts showing response time trends,
          emergency volume, outcomes distribution, and other key metrics.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => alert('View sample charts')}
          >
            View Sample Charts
          </Button>
          <Button
            variant="contained"
            onClick={() => alert('Custom report builder coming soon')}
          >
            Build Custom Report
          </Button>
        </Box>
      </Paper>

      {/* Insights */}
      <Paper
        sx={{
          p: 3,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Key Insights
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[
            'Response times have improved by 12% over the last quarter',
            'High-risk pregnancy detection rate increased to 89%',
            'Ambulance utilization is optimal at 78% capacity',
            'Emergency success rate remains consistently above 90%',
          ].map((insight, index) => (
            <Box
              key={index}
              sx={{
                p: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                backgroundColor: 'background.default',
              }}
            >
              <Typography variant="body1">{insight}</Typography>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default Analytics;