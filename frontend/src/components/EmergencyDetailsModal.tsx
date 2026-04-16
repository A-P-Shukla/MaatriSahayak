import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Divider,
  Grid,
  IconButton,
  CircularProgress,
  Alert,
  Stack,
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  LocalHospital as HospitalIcon,
  DirectionsCar as AmbulanceIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
} from '@mui/icons-material';
import { useEmergency } from '../hooks/useEmergencies';
import type { EmergencyStatus, SeverityLevel } from '../types';

interface EmergencyDetailsModalProps {
  emergencyId: string | null;
  open: boolean;
  onClose: () => void;
}

/**
 * Emergency Details Modal - Shows detailed information about an emergency event
 */
const EmergencyDetailsModal: React.FC<EmergencyDetailsModalProps> = ({
  emergencyId,
  open,
  onClose,
}) => {
  // Log when modal opens with emergency ID
  React.useEffect(() => {
    if (open) {
      console.log('EmergencyDetailsModal opened with ID:', emergencyId);
    }
  }, [open, emergencyId]);

  // Fetch emergency data
  const {
    data: emergency,
    isLoading,
    isError,
    error,
  } = useEmergency(emergencyId || '');

  // Log emergency data when it changes
  React.useEffect(() => {
    if (emergency) {
      console.log('Emergency data loaded:', emergency);
    }
  }, [emergency]);

  // Don't render if modal is not open
  if (!open) return null;

  // Get status color
  const getStatusColor = (status: EmergencyStatus): 'default' | 'primary' | 'warning' | 'success' | 'error' => {
    switch (status) {
      case 'initiated':
        return 'primary';
      case 'dispatched':
        return 'warning';
      case 'in_transit':
        return 'warning';
      case 'arrived':
        return 'success';
      case 'completed':
        return 'default';
      default:
        return 'default';
    }
  };

  // Get severity color
  const getSeverityColor = (severity: SeverityLevel): 'default' | 'info' | 'warning' | 'error' => {
    switch (severity) {
      case 'low':
        return 'info';
      case 'medium':
        return 'warning';
      case 'high':
        return 'warning';
      case 'critical':
        return 'error';
      default:
        return 'default';
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return 'N/A';
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'N/A';
    }
  };

  // Format response time
  const formatResponseTime = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Calculate time elapsed
  const calculateTimeElapsed = (startTime?: string) => {
    if (!startTime) return 'N/A';
    try {
      const start = new Date(startTime);
      if (isNaN(start.getTime())) return 'N/A';
      const now = new Date();
      const diffMs = now.getTime() - start.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);

      if (diffHours > 0) {
        return `${diffHours}h ${diffMins % 60}m ago`;
      }
      return `${diffMins}m ago`;
    } catch {
      return 'N/A';
    }
  };

  // Generate status timeline
  const getStatusTimeline = () => {
    if (!emergency) return [];

    const timeline = [
      {
        status: 'initiated',
        label: 'Emergency Initiated',
        timestamp: emergency.trigger_timestamp,
        completed: true,
      },
      {
        status: 'dispatched',
        label: 'Ambulance Dispatched',
        timestamp: emergency.dispatch_timestamp,
        completed: emergency.status !== 'initiated',
      },
      {
        status: 'in_transit',
        label: 'En Route to Patient',
        timestamp: emergency.dispatch_timestamp,
        completed: ['in_transit', 'arrived', 'completed'].includes(emergency.status),
      },
      {
        status: 'arrived',
        label: 'Arrived at Location',
        timestamp: emergency.arrival_timestamp,
        completed: ['arrived', 'completed'].includes(emergency.status),
      },
      {
        status: 'completed',
        label: 'Emergency Completed',
        timestamp: emergency.completion_timestamp,
        completed: emergency.status === 'completed',
      },
    ];

    return timeline;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      {/* Dialog Header */}
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          Emergency Details
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      {/* Dialog Content */}
      <DialogContent sx={{ pt: 3 }}>
        {/* Loading state - show while waiting for emergency ID or data */}
        {(!emergencyId || isLoading) && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Error state */}
        {emergencyId && isError && (
          <Alert severity="error">
            Failed to load emergency details: {error instanceof Error ? error.message : 'Unknown error'}
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Emergency ID: {emergencyId}
            </Typography>
          </Alert>
        )}

        {/* Emergency data */}
        {emergencyId && !isLoading && !isError && emergency && (
          <Box>
            {/* Status and Severity */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Chip
                label={emergency.status.replace('_', ' ').toUpperCase()}
                color={getStatusColor(emergency.status)}
                size="medium"
              />
              {emergency.severity_level && (
                <Chip
                  label={`${emergency.severity_level.toUpperCase()} SEVERITY`}
                  color={getSeverityColor(emergency.severity_level)}
                  size="medium"
                />
              )}
            </Box>

            {/* Event Information */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Event Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Triggered
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {formatTimestamp(emergency.trigger_timestamp)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {calculateTimeElapsed(emergency.trigger_timestamp)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Event Type
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {emergency.event_type}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Response Time
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {formatResponseTime(emergency.response_time_seconds)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Event ID
                    </Typography>
                    <Typography variant="body2" fontWeight={500} sx={{ fontFamily: 'monospace' }}>
                      {emergency.event_id}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Patient Details */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="subtitle2" fontWeight={600}>
                  Patient Information
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Name
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {emergency.patient_name}
                  </Typography>
                </Grid>
                {emergency.patient_phone && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Phone
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {emergency.patient_phone}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
                {emergency.patient_village && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Location
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {emergency.patient_village}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Ambulance Details */}
            {emergency.ambulance_id && emergency.ambulance_id !== 'PENDING' && (
              <>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AmbulanceIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="subtitle2" fontWeight={600}>
                      Ambulance Details
                    </Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">
                        Ambulance ID
                      </Typography>
                      <Typography variant="body2" fontWeight={500} sx={{ fontFamily: 'monospace' }}>
                        {emergency.ambulance_id}
                      </Typography>
                    </Grid>
                    {emergency.dispatch_timestamp && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">
                          Dispatched At
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {formatTimestamp(emergency.dispatch_timestamp)}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>
                <Divider sx={{ my: 3 }} />
              </>
            )}

            {/* Hospital Details */}
            {emergency.hospital_id && (
              <>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <HospitalIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="subtitle2" fontWeight={600}>
                      Hospital Details
                    </Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">
                        Hospital ID
                      </Typography>
                      <Typography variant="body2" fontWeight={500} sx={{ fontFamily: 'monospace' }}>
                        {emergency.hospital_id}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
                <Divider sx={{ my: 3 }} />
              </>
            )}

            {/* Status Timeline */}
            <Box>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Status Timeline
              </Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                {getStatusTimeline().map((item, index) => (
                  <Box
                    key={item.status}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      position: 'relative',
                      pl: 4,
                    }}
                  >
                    {/* Timeline dot */}
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 0,
                        top: 2,
                      }}
                    >
                      {item.completed ? (
                        <CheckCircleIcon color="primary" fontSize="small" />
                      ) : (
                        <RadioButtonUncheckedIcon color="disabled" fontSize="small" />
                      )}
                    </Box>

                    {/* Timeline connector */}
                    {index < getStatusTimeline().length - 1 && (
                      <Box
                        sx={{
                          position: 'absolute',
                          left: 10,
                          top: 24,
                          width: 2,
                          height: 32,
                          bgcolor: item.completed ? 'primary.main' : 'grey.300',
                        }}
                      />
                    )}

                    {/* Content */}
                    <Box>
                      <Typography
                        variant="body2"
                        fontWeight={item.completed ? 600 : 400}
                        color={item.completed ? 'text.primary' : 'text.secondary'}
                      >
                        {item.label}
                      </Typography>
                      {item.timestamp && item.completed && (
                        <Typography variant="caption" color="text.secondary">
                          {formatTimestamp(item.timestamp)}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Box>
        )}
      </DialogContent>

      {/* Dialog Actions */}
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmergencyDetailsModal;
