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
  Chip,
  Grid,
  Stack,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Fullscreen as FullscreenIcon,
  Close as CloseIcon,
  LocalShipping as AvailableIcon,
  DirectionsCar as DispatchedIcon,
  DriveEta as BusyIcon,
  Build as MaintenanceIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';
import { useAmbulances } from '../hooks/useAmbulances';
import { useWebSocket } from '../hooks/useWebSocket';
import LiveAmbulanceMap from '../components/LiveAmbulanceMap';
import type { AmbulanceStatus } from '../types';

const DRAWER_WIDTH = 270;

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

  // WebSocket for real-time location updates
  const { isConnected } = useWebSocket({ enabled: true });

  // Calculate ambulance counts by status
  const ambulanceCounts = {
    available: ambulances.filter((a) => a.status?.toUpperCase() === 'AVAILABLE').length,
    dispatched: ambulances.filter((a) => a.status?.toUpperCase() === 'DISPATCHED').length,
    busy: ambulances.filter((a) => ['BUSY', 'ON_RIDE', 'IN_TRANSIT'].includes(a.status?.toUpperCase())).length,
    maintenance: ambulances.filter((a) => a.status?.toUpperCase() === 'MAINTENANCE').length,
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: { xs: 56, md: 64 },
        left: { xs: 0, md: DRAWER_WIDTH },
        right: 0,
        bottom: 0,
        bgcolor: '#f5f7fa',
        overflow: 'auto',
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
          pt: 4,
          pb: 4,
          px: 3,
        }}
      >
        <Box maxWidth={1400} mx="auto">
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                <Typography variant="h4" fontWeight={700} color="white">
                  Live Ambulance Tracking
                </Typography>
                {isConnected && (
                  <Chip
                    icon={<CircleIcon sx={{ fontSize: 8, color: '#4CAF50' }} />}
                    label="Live"
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      height: 24,
                      border: '1px solid rgba(255,255,255,0.3)',
                    }}
                  />
                )}
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                Real-time tracking of ambulance locations using OpenStreetMap
              </Typography>
            </Box>
            <Stack direction="row" spacing={1.5}>
              <FormControl size="small" sx={{ minWidth: 150, bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 1 }}>
                <InputLabel sx={{ color: 'rgba(255,255,255,0.9)' }}>Filter Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Filter Status"
                  onChange={(e) => setStatusFilter(e.target.value as AmbulanceStatus | '')}
                  sx={{
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' },
                    '& .MuiSvgIcon-root': { color: 'white' },
                  }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="AVAILABLE">Available</MenuItem>
                  <MenuItem value="DISPATCHED">Dispatched</MenuItem>
                  <MenuItem value="BUSY">Busy</MenuItem>
                  <MenuItem value="MAINTENANCE">Maintenance</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                disabled={isLoading}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                }}
              >
                Refresh
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Box>

      {/* Main Content */}
      <Box maxWidth={1400} mx="auto" px={3} sx={{ py: 4 }}>
        {/* Stats Cards */}
        <Grid container spacing={3} mb={4}>
          {[
            { label: 'Available', value: ambulanceCounts.available, color: '#16a34a', bg: '#E8F5E9', icon: AvailableIcon },
            { label: 'Dispatched', value: ambulanceCounts.dispatched, color: '#d97706', bg: '#FFF3E0', icon: DispatchedIcon },
            { label: 'Busy', value: ambulanceCounts.busy, color: '#C62828', bg: '#FFEBEE', icon: BusyIcon },
            { label: 'Maintenance', value: ambulanceCounts.maintenance, color: '#616161', bg: '#F5F5F5', icon: MaintenanceIcon },
          ].map((s) => (
            <Grid item xs={12} sm={6} md={3} key={s.label}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: '1px solid #e5e7eb',
                  bgcolor: 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 28px ${s.color}22`,
                    borderColor: s.color,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: s.bg,
                    mb: 2,
                  }}
                >
                  <s.icon sx={{ color: s.color, fontSize: 24 }} />
                </Box>
                <Typography variant="h4" fontWeight={800} sx={{ color: s.color, mb: 0.5 }}>
                  {s.value}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  {s.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Error state */}
        {isError && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            Failed to load ambulance locations: {error instanceof Error ? error.message : 'Unknown error'}
          </Alert>
        )}

        {/* Map view */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            border: '1px solid #e5e7eb',
            bgcolor: 'white',
          }}
        >
          <Box
            sx={{
              px: 3,
              py: 2.5,
              borderBottom: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Live Map View
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {ambulances.length} ambulances tracked
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<FullscreenIcon />}
              onClick={() => setFullscreenOpen(true)}
              sx={{
                bgcolor: '#0d9488',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': { bgcolor: '#0f766e' },
              }}
            >
              Full Screen
            </Button>
          </Box>

          {isLoading ? (
            <Box
              sx={{
                minHeight: '600px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <CircularProgress size={48} sx={{ color: '#0d9488' }} />
              <Typography variant="body2" color="text.secondary">
                Loading ambulance locations...
              </Typography>
            </Box>
          ) : (
            <Box sx={{ p: 2 }}>
              <LiveAmbulanceMap ambulances={ambulances} height="600px" />
            </Box>
          )}
        </Paper>
      </Box>

      {/* Fullscreen Map Dialog */}
      <Dialog
        open={fullscreenOpen}
        onClose={() => setFullscreenOpen(false)}
        maxWidth={false}
        fullWidth
        PaperProps={{
          sx: {
            height: '95vh',
            maxHeight: '95vh',
            m: 2,
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Live Ambulance Tracking - Full Screen
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {ambulances.length} ambulances tracked
              </Typography>
            </Box>
            <IconButton
              onClick={() => setFullscreenOpen(false)}
              edge="end"
              sx={{
                bgcolor: '#f5f5f5',
                '&:hover': { bgcolor: '#e0e0e0' },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: '100%' }}>
          <LiveAmbulanceMap ambulances={ambulances} height="100%" />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default LiveTracking;
