import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Chip, Avatar, Card, CardContent,
  Stack, CircularProgress, Divider,
  Grid, Select, MenuItem, FormControl, InputLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  useMediaQuery, useTheme, Snackbar,
} from '@mui/material';
import {
  ArrowLeft, Phone, Mail, CreditCard, Truck,
  Star, Car, CheckCircle, Clock, Contact2, Circle,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDriverProfile, updateDriverStatus, getAssignedEmergencies, type Driver } from '../services/driver';

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'default'> = {
  AVAILABLE: 'success',
  ON_RIDE: 'warning',
  OFFLINE: 'default',
};

const STATUS_DOT: Record<string, string> = {
  AVAILABLE: '#16a34a',
  ON_RIDE: '#d97706',
  OFFLINE: '#94a3b8',
};

// Mock emergency history — replace with real API when list endpoint is available
const MOCK_HISTORY = [
  { id: 'emg_001', patient_name: 'Priya Sharma', event_type: 'HIGH_BP_EMERGENCY', severity: 'HIGH', status: 'COMPLETED', triggered_at: '2024-03-10T14:22:00Z', response_time_minutes: 18 },
  { id: 'emg_002', patient_name: 'Sunita Devi', event_type: 'PREMATURE_LABOR', severity: 'CRITICAL', status: 'COMPLETED', triggered_at: '2024-03-08T09:15:00Z', response_time_minutes: 24 },
  { id: 'emg_003', patient_name: 'Meena Kumari', event_type: 'SEVERE_BLEEDING', severity: 'CRITICAL', status: 'COMPLETED', triggered_at: '2024-03-05T22:40:00Z', response_time_minutes: 31 },
];

const SEV_COLORS: Record<string, string> = {
  LOW: '#16a34a', MEDIUM: '#d97706', HIGH: '#ea580c', CRITICAL: '#dc2626',
};

const DriverDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [snack, setSnack] = useState<string | null>(null);
  const [emergencies, setEmergencies] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getDriverProfile(id)
      .then((d) => {
        setDriver(d);
        if (d.ambulanceId) {
          getAssignedEmergencies(d.ambulanceId)
            .then(setEmergencies)
            .catch(() => {});
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (newStatus: 'AVAILABLE' | 'ON_RIDE' | 'OFFLINE') => {
    if (!driver) return;
    setStatusUpdating(true);
    try {
      await updateDriverStatus(driver.id, newStatus);
      setDriver({ ...driver, status: newStatus });
      setSnack(`Status updated to ${newStatus}`);
    } catch (e) {
      setSnack('Failed to update status');
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress sx={{ color: '#0d9488' }} />
      </Box>
    );
  }

  if (error || !driver) {
    return (
      <Box>
        <Button startIcon={<ArrowLeft size={16} />} onClick={() => navigate('/drivers')}
          sx={{ mb: 3, color: '#1B6B4A', fontWeight: 600, textTransform: 'none', '&:hover': { bgcolor: '#f0faf7' } }}>
          Back to Drivers
        </Button>
        <Card elevation={0} sx={{ border: '1px solid #fecaca', borderRadius: 3, bgcolor: '#fef2f2', p: 3, textAlign: 'center' }}>
          <Car size={48} color="#fca5a5" />
          <Typography fontWeight={700} color="#dc2626" mb={0.5}>Failed to load driver profile</Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>{error ?? 'Driver not found'}</Typography>
          <Button variant="outlined" onClick={() => { setError(null); setLoading(true); if (id) getDriverProfile(id).then(setDriver).catch((e) => setError(e.message)).finally(() => setLoading(false)); }}
            sx={{ borderColor: '#dc2626', color: '#dc2626', textTransform: 'none', fontWeight: 600, borderRadius: 2 }}>
            Retry
          </Button>
        </Card>
      </Box>
    );
  }

  return (
    <DriverDetailsContent
      driver={driver} isMobile={isMobile} emergencies={emergencies}
      statusUpdating={statusUpdating} snack={snack}
      onStatusChange={handleStatusChange} onSnackClose={() => setSnack(null)}
      onBack={() => navigate('/drivers')}
    />
  );
};

interface ContentProps {
  driver: Driver;
  isMobile: boolean;
  emergencies: any;
  statusUpdating: boolean;
  snack: string | null;
  onStatusChange: (s: 'AVAILABLE' | 'ON_RIDE' | 'OFFLINE') => void;
  onSnackClose: () => void;
  onBack: () => void;
}

const DriverDetailsContent: React.FC<ContentProps> = ({
  driver, isMobile, emergencies, statusUpdating, snack,
  onStatusChange, onSnackClose, onBack,
}) => {
  const cardSx = {
    elevation: 0,
    sx: { border: '1px solid #d1fae5', borderRadius: 3, height: '100%' },
  };

  const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <Stack direction="row" alignItems="center" spacing={1.5} py={1}>
      <Box sx={{ color: '#0d9488', display: 'flex' }}>{icon}</Box>
      <Box>
        <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
        <Typography variant="body2" fontWeight={600}>{value || '—'}</Typography>
      </Box>
    </Stack>
  );

  return (
    <Box>
      {/* Back */}
      <Button startIcon={<ArrowLeft size={16} />} onClick={onBack}
        sx={{ mb: 3, color: '#1B6B4A', fontWeight: 600, textTransform: 'none', '&:hover': { bgcolor: '#f0faf7' } }}>
        Back to Drivers
      </Button>

      {/* Hero Card */}
      <Card elevation={0} sx={{ border: '1px solid #d1fae5', borderRadius: 3, mb: 3, background: 'linear-gradient(135deg, #f0faf7 0%, #ffffff 100%)' }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', sm: 'center' }}>
            {/* Avatar */}
            <Avatar sx={{ width: 80, height: 80, bgcolor: '#1B6B4A', fontSize: '1.8rem', fontWeight: 800, flexShrink: 0 }}>
              {driver.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </Avatar>

            {/* Info */}
            <Box flex={1}>
              <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap" mb={0.5}>
                <Typography variant="h5" fontWeight={800} color="#0f172a">{driver.name}</Typography>
                <Chip
                  icon={<Circle size={8} color={STATUS_DOT[driver.status]} fill={STATUS_DOT[driver.status]} />}
                  label={driver.status.replace('_', ' ')}
                  color={STATUS_COLORS[driver.status]}
                  size="small"
                  sx={{ fontWeight: 700, fontSize: '0.75rem' }}
                />
              </Stack>
              <Typography variant="body2" color="text.secondary" mb={1}>Driver ID: {driver.id}</Typography>
              <Stack direction="row" spacing={3} flexWrap="wrap">
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Star size={16} color="#f59e0b" />
                  <Typography variant="body2" fontWeight={700}>{driver.rating}</Typography>
                  <Typography variant="caption" color="text.secondary">rating</Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Car size={16} color="#0d9488" />
                  <Typography variant="body2" fontWeight={700}>{driver.totalRides}</Typography>
                  <Typography variant="caption" color="text.secondary">total rides</Typography>
                </Stack>
              </Stack>
            </Box>

            {/* Status Control */}
            <Box sx={{ minWidth: 160 }}>
              <FormControl fullWidth size="small" disabled={statusUpdating}>
                <InputLabel sx={{ color: '#0d9488', '&.Mui-focused': { color: '#0d9488' } }}>Update Status</InputLabel>
                <Select
                  value={driver.status}
                  label="Update Status"
                  onChange={(e) => onStatusChange(e.target.value as any)}
                  sx={{
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#d1fae5' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#0d9488' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#0d9488' },
                  }}
                >
                  <MenuItem value="AVAILABLE">🟢 Available</MenuItem>
                  <MenuItem value="ON_RIDE">🟡 On Ride</MenuItem>
                  <MenuItem value="OFFLINE">⚫ Offline</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Details Grid */}
      <Grid container spacing={2.5} mb={3}>
        {/* Contact Info */}
        <Grid item xs={12} md={6}>
          <Card {...cardSx}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} color="#1B6B4A" mb={1}>Contact Information</Typography>
              <Divider sx={{ mb: 2, borderColor: '#d1fae5' }} />
              <InfoRow icon={<Phone size={16} />} label="Phone" value={driver.phone} />
              <InfoRow icon={<Mail size={16} />} label="Email" value={driver.email} />
              {driver.emergencyContact && (
                <InfoRow icon={<Contact2 size={16} />} label="Emergency Contact" value={driver.emergencyContact} />
              )}
              <InfoRow icon={<CreditCard size={16} />} label="License Number" value={driver.licenseNumber} />
            </CardContent>
          </Card>
        </Grid>

        {/* Ambulance Info */}
        <Grid item xs={12} md={6}>
          <Card {...cardSx}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} color="#1B6B4A" mb={1}>Assigned Ambulance</Typography>
              <Divider sx={{ mb: 2, borderColor: '#d1fae5' }} />
              {driver.ambulance_details ? (
                <>
                  <InfoRow icon={<Truck size={16} />} label="Vehicle Number" value={driver.ambulance_details.vehicle_number} />
                  <InfoRow icon={<Car size={16} />} label="Ambulance ID" value={driver.ambulance_details.id} />
                  <InfoRow icon={<CheckCircle size={16} />} label="Type" value={driver.ambulance_details.type} />
                  <InfoRow icon={<Circle size={16} />} label="District" value={driver.ambulance_details.district} />
                </>
              ) : (
                <>
                  <InfoRow icon={<Truck size={16} />} label="Ambulance ID" value={driver.ambulanceId} />
                  <Typography variant="caption" color="text.secondary">Full ambulance details not available</Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Stats */}
        <Grid item xs={12} md={6}>
          <Card {...cardSx}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} color="#1B6B4A" mb={1}>Performance Stats</Typography>
              <Divider sx={{ mb: 2, borderColor: '#d1fae5' }} />
              <Grid container spacing={2}>
                {[
                  { label: 'Total Rides', value: driver.totalRides, color: '#1B6B4A', bg: '#f0faf7' },
                  { label: 'Rating', value: `${driver.rating} ⭐`, color: '#d97706', bg: '#fffbeb' },
                  { label: 'Status', value: driver.status.replace('_', ' '), color: STATUS_DOT[driver.status], bg: '#f8fafc' },
                  { label: 'Member Since', value: new Date(driver.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }), color: '#0d9488', bg: '#f0fdf4' },
                ].map((s) => (
                  <Grid item xs={6} key={s.label}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: s.bg, textAlign: 'center' }}>
                      <Typography fontWeight={800} sx={{ color: s.color, fontSize: '1.1rem' }}>{s.value}</Typography>
                      <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Emergency */}
        <Grid item xs={12} md={6}>
          <Card {...cardSx}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} color="#1B6B4A" mb={1}>Active Emergency</Typography>
              <Divider sx={{ mb: 2, borderColor: '#d1fae5' }} />
              {emergencies?.active_emergency ? (
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#fff7ed', border: '1px solid #fed7aa' }}>
                  <Typography fontWeight={700} color="#ea580c">{emergencies.active_emergency.patient_name}</Typography>
                  <Typography variant="body2" color="text.secondary">{emergencies.active_emergency.event_type?.replace(/_/g, ' ')}</Typography>
                  <Chip label={emergencies.active_emergency.severity} size="small"
                    sx={{ mt: 1, bgcolor: SEV_COLORS[emergencies.active_emergency.severity] + '20', color: SEV_COLORS[emergencies.active_emergency.severity], fontWeight: 700, fontSize: '0.7rem' }} />
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <CheckCircle size={40} color="#d1fae5" />
                  <Typography variant="body2" color="text.secondary">No active emergency</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Emergency History */}
      <Card elevation={0} sx={{ border: '1px solid #d1fae5', borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} color="#1B6B4A" mb={1}>Recent Emergency History</Typography>
          <Divider sx={{ mb: 2, borderColor: '#d1fae5' }} />

          {isMobile ? (
            <Stack spacing={1.5}>
              {MOCK_HISTORY.map((e) => (
                <Box key={e.id} sx={{ p: 2, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: '#fafafa' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={0.5}>
                    <Typography fontWeight={700} fontSize="0.9rem">{e.patient_name}</Typography>
                    <Chip label={e.severity} size="small"
                      sx={{ bgcolor: SEV_COLORS[e.severity] + '20', color: SEV_COLORS[e.severity], fontWeight: 700, fontSize: '0.65rem' }} />
                  </Stack>
                  <Typography variant="caption" color="text.secondary" display="block">{e.event_type.replace(/_/g, ' ')}</Typography>
                  <Stack direction="row" spacing={2} mt={0.5}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Clock size={12} color="#9e9e9e" />
                      <Typography variant="caption" color="text.secondary">{e.response_time_minutes} min</Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">{new Date(e.triggered_at).toLocaleDateString('en-IN')}</Typography>
                  </Stack>
                </Box>
              ))}
            </Stack>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f0faf7' }}>
                    {['Patient', 'Event Type', 'Severity', 'Response Time', 'Date', 'Status'].map((h) => (
                      <TableCell key={h} sx={{ fontWeight: 700, color: '#1B6B4A', fontSize: '0.78rem' }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {MOCK_HISTORY.map((e) => (
                    <TableRow key={e.id} hover sx={{ '&:hover': { bgcolor: '#f0faf7' } }}>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>{e.patient_name}</TableCell>
                      <TableCell sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>{e.event_type.replace(/_/g, ' ')}</TableCell>
                      <TableCell>
                        <Chip label={e.severity} size="small"
                          sx={{ bgcolor: SEV_COLORS[e.severity] + '20', color: SEV_COLORS[e.severity], fontWeight: 700, fontSize: '0.7rem' }} />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.85rem' }}>{e.response_time_minutes} min</TableCell>
                      <TableCell sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>{new Date(e.triggered_at).toLocaleDateString('en-IN')}</TableCell>
                      <TableCell>
                        <Chip label="Completed" size="small" color="success" sx={{ fontWeight: 600, fontSize: '0.7rem' }} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Snackbar
        open={!!snack} autoHideDuration={3000} onClose={onSnackClose}
        message={snack}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default DriverDetails;
