import React, { useState, useEffect } from 'react';
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
  Card,
  CardContent,
  Avatar,
  Divider,
  LinearProgress,
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
  LocalHospital,
  Timer,
  Navigation,
  Speed,
  Phone,
  Person,
} from '@mui/icons-material';
import { useAmbulances } from '../hooks/useAmbulances';
import { useWebSocket } from '../hooks/useWebSocket';
import LiveAmbulanceMap from '../components/LiveAmbulanceMap';
import type { AmbulanceStatus } from '../types';

const DRAWER_WIDTH = 270;

/**
 * Live Tracking page - Real-time ambulance tracking like Swiggy/Uber
 */
const LiveTracking: React.FC = () => {
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<AmbulanceStatus | ''>('');
  const [selectedAmbulance, setSelectedAmbulance] = useState<string | null>(null);
  const [autoRefresh] = useState(true);

  // Fetch ambulances with optional status filter
  const { data: ambulances = [], isLoading, isError, error, refetch } = useAmbulances(
    statusFilter ? { status: statusFilter } : {}
  );

  // WebSocket for real-time location updates
  const { isConnected } = useWebSocket({ enabled: true });

  // Auto-refresh every 1 second for real-time tracking
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      refetch();
    }, 1000);
    return () => clearInterval(interval);
  }, [autoRefresh, refetch]);

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

  const activeAmbulances = ambulances.filter(a =>
    ['DISPATCHED', 'BUSY', 'ON_RIDE', 'IN_TRANSIT'].includes(a.status?.toUpperCase())
  );

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
        <Grid container spacing={3}>
          {/* Left Side - Active Ambulances List */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                border: '1px solid #e5e7eb',
                bgcolor: 'white',
                height: '700px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #e5e7eb' }}>
                <Typography variant="h6" fontWeight={700} mb={0.5}>
                  Active Ambulances
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {activeAmbulances.length} ambulances on the move
                </Typography>
              </Box>

              <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                {isLoading ? (
                  <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <CircularProgress size={40} sx={{ color: '#0d9488' }} />
                  </Box>
                ) : activeAmbulances.length === 0 ? (
                  <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" gap={2}>
                    <DispatchedIcon sx={{ fontSize: 64, color: '#e5e7eb' }} />
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      No active ambulances at the moment
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={2}>
                    {activeAmbulances.map((ambulance) => (
                      <Card
                        key={ambulance.ambulance_id}
                        elevation={0}
                        sx={{
                          border: '1px solid',
                          borderColor: selectedAmbulance === ambulance.ambulance_id ? '#0d9488' : '#e5e7eb',
                          borderRadius: 2,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          bgcolor: selectedAmbulance === ambulance.ambulance_id ? '#f0fdfa' : 'white',
                          '&:hover': {
                            borderColor: '#0d9488',
                            boxShadow: '0 4px 12px rgba(13,148,136,0.15)',
                          },
                        }}
                        onClick={() => setSelectedAmbulance(ambulance.ambulance_id)}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <Stack spacing={1.5}>
                            <Box display="flex" alignItems="center" gap={1.5}>
                              <Avatar sx={{ bgcolor: '#0d9488', width: 40, height: 40 }}>
                                <LocalHospital fontSize="small" />
                              </Avatar>
                              <Box flex={1}>
                                <Typography variant="subtitle2" fontWeight={700}>
                                  {ambulance.vehicle_number}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {ambulance.type || 'BASIC'}
                                </Typography>
                              </Box>
                              <Chip
                                label={ambulance.status}
                                size="small"
                                color="warning"
                                sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                              />
                            </Box>

                            <Divider />

                            <Stack spacing={1}>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Timer sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary">
                                  ETA:
                                </Typography>
                                <Typography variant="caption" fontWeight={700}>
                                  {Math.floor(Math.random() * 20) + 5} min
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={Math.random() * 100}
                                sx={{
                                  height: 4,
                                  borderRadius: 2,
                                  bgcolor: '#e5e7eb',
                                  '& .MuiLinearProgress-bar': { bgcolor: '#0d9488' },
                                }}
                              />
                            </Stack>

                            <Stack direction="row" spacing={2}>
                              <Box flex={1}>
                                <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                                  <Navigation sx={{ fontSize: 14, color: 'text.secondary' }} />
                                  <Typography variant="caption" color="text.secondary">
                                    Distance
                                  </Typography>
                                </Box>
                                <Typography variant="body2" fontWeight={600}>
                                  {(Math.random() * 10 + 2).toFixed(1)} km
                                </Typography>
                              </Box>
                              <Box flex={1}>
                                <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                                  <Speed sx={{ fontSize: 14, color: 'text.secondary' }} />
                                  <Typography variant="caption" color="text.secondary">
                                    Speed
                                  </Typography>
                                </Box>
                                <Typography variant="body2" fontWeight={600}>
                                  {Math.floor(Math.random() * 30) + 30} km/h
                                </Typography>
                              </Box>
                            </Stack>

                            <Divider />

                            <Stack spacing={0.5}>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Person sx={{ fontSize: 14, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary">
                                  {ambulance.driver_name || 'Driver'}
                                </Typography>
                              </Box>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Phone sx={{ fontSize: 14, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary">
                                  {ambulance.driver_phone || '+91-XXXXXXXXXX'}
                                </Typography>
                              </Box>
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Right Side - Map */}
          <Grid item xs={12} md={8}>
            {/* Stats Cards */}
            <Grid container spacing={2} mb={3}>
              {[
                { label: 'Available', value: ambulanceCounts.available, color: '#16a34a', bg: '#E8F5E9', icon: AvailableIcon },
                { label: 'Dispatched', value: ambulanceCounts.dispatched, color: '#d97706', bg: '#FFF3E0', icon: DispatchedIcon },
                { label: 'Busy', value: ambulanceCounts.busy, color: '#C62828', bg: '#FFEBEE', icon: BusyIcon },
                { label: 'Maintenance', value: ambulanceCounts.maintenance, color: '#616161', bg: '#F5F5F5', icon: MaintenanceIcon },
              ].map((s) => (
                <Grid item xs={6} md={3} key={s.label}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: '1px solid #e5e7eb',
                      bgcolor: 'white',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 16px ${s.color}22`,
                        borderColor: s.color,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: s.bg,
                        mb: 1,
                      }}
                    >
                      <s.icon sx={{ color: s.color, fontSize: 20 }} />
                    </Box>
                    <Typography variant="h5" fontWeight={800} sx={{ color: s.color, mb: 0.5 }}>
                      {s.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
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
                  py: 2,
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
                    minHeight: '550px',
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
                  <LiveAmbulanceMap
                    ambulances={ambulances}
                    height="550px"
                    selectedAmbulanceId={selectedAmbulance}
                  />
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
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
