import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Fullscreen as FullscreenIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useAmbulances } from '../hooks/useAmbulances';
import AmbulanceMap from '../components/AmbulanceMap';
import type { AmbulanceStatus } from '../types';

/**
 * Live Tracking page - Map view of ambulance locations
 */
const LiveTracking: React.FC = () => {
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<AmbulanceStatus | ''>('');

  // Fetch ambulances with optional status filter
  const { data: ambulances = [], isLoading, isError, error, refetch } = useAmbulances(
    statusFilter ? { status: statusFilter } : {}
  );

  // Calculate ambulance counts by status
  const ambulanceCounts = {
    available: ambulances.filter((a) => a.status === 'available').length,
    dispatched: ambulances.filter((a) => a.status === 'dispatched').length,
    busy: ambulances.filter((a) => a.status === 'busy').length,
    maintenance: ambulances.filter((a) => a.status === 'maintenance').length,
  };

  const handleRefresh = () => {
    refetch();
  };
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
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={statusFilter}
              label="Filter by Status"
              onChange={(e) => setStatusFilter(e.target.value as AmbulanceStatus | '')}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="available">Available</MenuItem>
              <MenuItem value="dispatched">Dispatched</MenuItem>
              <MenuItem value="busy">Busy</MenuItem>
              <MenuItem value="maintenance">Maintenance</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Error state */}
      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load ambulance locations: {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
      )}

      {/* Map view */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Live Map View ({ambulances.length} ambulances)
          </Typography>
          <Button
            variant="contained"
            startIcon={<FullscreenIcon />}
            onClick={() => setFullscreenOpen(true)}
          >
            Full Screen Map
          </Button>
        </Box>

        {isLoading ? (
          <Box
            sx={{
              minHeight: '500px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <AmbulanceMap ambulances={ambulances} height="500px" />
        )}
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
            { status: 'Available', count: ambulanceCounts.available, color: 'success.main' },
            { status: 'Dispatched', count: ambulanceCounts.dispatched, color: 'warning.main' },
            { status: 'Busy', count: ambulanceCounts.busy, color: 'error.main' },
            { status: 'Maintenance', count: ambulanceCounts.maintenance, color: 'text.secondary' },
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

      {/* Fullscreen Map Dialog */}
      <Dialog
        open={fullscreenOpen}
        onClose={() => setFullscreenOpen(false)}
        maxWidth={false}
        fullWidth
        PaperProps={{
          sx: {
            height: '90vh',
            maxHeight: '90vh',
          },
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={600}>
              Live Ambulance Tracking - Full Screen
            </Typography>
            <IconButton onClick={() => setFullscreenOpen(false)} edge="end">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: '100%' }}>
          <AmbulanceMap ambulances={ambulances} height="100%" />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default LiveTracking;