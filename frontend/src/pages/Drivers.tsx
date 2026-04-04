import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Chip, Avatar, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Stack, TextField, InputAdornment, CircularProgress, Alert,
  useMediaQuery, useTheme, Dialog, DialogTitle, DialogContent,
  DialogActions, DialogContentText, Grid,
} from '@mui/material';
import {
  Search as SearchIcon,
  DirectionsCar as CarIcon,
  Phone as PhoneIcon,
  Star as StarIcon,
  LocalShipping as TruckIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Group as GroupIcon,
  HourglassEmpty as PendingIcon,
  CheckCircleOutline as AvailableIcon,
  DriveEta as OnRideIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { listDrivers, verifyRegistration, Driver } from '../services/driver';

const DRAWER_WIDTH = 270;

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'default' | 'error'> = {
  AVAILABLE: 'success',
  ON_RIDE: 'warning',
  OFFLINE: 'default',
};

const VERIFY_COLORS: Record<string, 'warning' | 'success' | 'error' | 'default'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
};

const Drivers: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ driver: Driver; action: 'APPROVE' | 'REJECT' } | null>(null);

  const fetchDrivers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listDrivers();
      setDrivers(data);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load drivers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDrivers(); }, [fetchDrivers]);

  const handleVerify = async (driver: Driver, action: 'APPROVE' | 'REJECT') => {
    setConfirm(null);
    setActionLoading(driver.id);
    try {
      await verifyRegistration(driver.id, 'DRIVER', action);
      setDrivers((prev) =>
        prev.map((d) =>
          d.id === driver.id
            ? { ...d, verificationStatus: action === 'APPROVE' ? 'APPROVED' : 'REJECTED' }
            : d
        )
      );
    } catch (e: any) {
      setError(e.message ?? 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = drivers.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.phone.includes(search) ||
    d.licenseNumber.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: drivers.length,
    pending: drivers.filter((d) => (d as any).verificationStatus === 'PENDING').length,
    available: drivers.filter((d) => d.status === 'AVAILABLE').length,
    onRide: drivers.filter((d) => d.status === 'ON_RIDE').length,
  };

  const VerifyButtons = ({ driver }: { driver: Driver }) => {
    const vs = (driver as any).verificationStatus;
    if (vs !== 'PENDING') return null;
    const busy = actionLoading === driver.id;
    return (
      <Stack direction="row" spacing={0.5}>
        <Button
          size="small" variant="contained" color="success"
          disabled={busy}
          startIcon={busy ? <CircularProgress size={12} color="inherit" /> : <ApproveIcon />}
          onClick={() => setConfirm({ driver, action: 'APPROVE' })}
          sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.7rem', borderRadius: 1.5 }}
        >
          Approve
        </Button>
        <Button
          size="small" variant="outlined" color="error"
          disabled={busy}
          startIcon={<RejectIcon />}
          onClick={() => setConfirm({ driver, action: 'REJECT' })}
          sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.7rem', borderRadius: 1.5 }}
        >
          Reject
        </Button>
      </Stack>
    );
  };

  const DriverCard = ({ driver }: { driver: Driver }) => {
    const vs = (driver as any).verificationStatus ?? 'APPROVED';
    return (
      <Card elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3, mb: 2, '&:hover': { boxShadow: 2 }, transition: 'all 0.2s' }}>
        <CardContent sx={{ p: 2.5 }}>
          <Stack direction="row" alignItems="center" spacing={2} mb={1.5}>
            <Avatar sx={{ bgcolor: '#1B6B4A', width: 44, height: 44, fontWeight: 700 }}>
              {driver.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </Avatar>
            <Box flex={1} minWidth={0}>
              <Typography fontWeight={700} noWrap>{driver.name}</Typography>
              <Typography variant="caption" color="text.secondary">{driver.licenseNumber}</Typography>
            </Box>
            <Stack spacing={0.5} alignItems="flex-end">
              <Chip label={vs} color={VERIFY_COLORS[vs] ?? 'default'} size="small" sx={{ fontWeight: 700, fontSize: '0.65rem' }} />
              {vs === 'APPROVED' && (
                <Chip label={driver.status} color={STATUS_COLORS[driver.status] ?? 'default'} size="small" sx={{ fontWeight: 600, fontSize: '0.65rem' }} />
              )}
            </Stack>
          </Stack>
          <Stack direction="row" spacing={2} flexWrap="wrap" mb={1.5}>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">{driver.phone}</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <TruckIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">{driver.ambulanceId}</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <StarIcon sx={{ fontSize: 14, color: '#f59e0b' }} />
              <Typography variant="caption" color="text.secondary">{driver.rating} · {driver.totalRides} rides</Typography>
            </Stack>
          </Stack>
          <VerifyButtons driver={driver} />
          <Button
            size="small" variant="outlined" fullWidth
            onClick={() => navigate(`/drivers/${driver.id}`)}
            sx={{ mt: 1, borderColor: '#0d9488', color: '#0d9488', borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            View Profile
          </Button>
        </CardContent>
      </Card>
    );
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
              <Typography variant="h4" fontWeight={700} color="white" mb={0.5}>
                Ambulance Drivers
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                Manage and monitor all registered drivers
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={fetchDrivers}
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
        </Box>
      </Box>

      {/* Main Content */}
      <Box maxWidth={1400} mx="auto" px={3} sx={{ py: 4 }}>
        {/* Stats Cards */}
        <Grid container spacing={3} mb={4}>
          {[
            { label: 'Total Drivers', value: stats.total, color: '#1B6B4A', bg: '#E8F5EE', icon: GroupIcon },
            { label: 'Pending Approval', value: stats.pending, color: '#d97706', bg: '#FFF3E0', icon: PendingIcon },
            { label: 'Available', value: stats.available, color: '#16a34a', bg: '#E8F5E9', icon: AvailableIcon },
            { label: 'On Ride', value: stats.onRide, color: '#7c3aed', bg: '#F3E5F5', icon: OnRideIcon },
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

        {/* Search Bar */}
        <TextField
          fullWidth
          placeholder="Search by name, phone or license..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#0d9488' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              bgcolor: 'white',
              '& fieldset': { borderColor: '#e5e7eb' },
              '&:hover fieldset': { borderColor: '#0d9488' },
              '&.Mui-focused fieldset': { borderColor: '#0d9488' },
            },
          }}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Content */}
        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress sx={{ color: '#0d9488' }} />
          </Box>
        ) : filtered.length === 0 ? (
          <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3, py: 8, textAlign: 'center' }}>
            <CarIcon sx={{ fontSize: 64, color: '#e5e7eb', mb: 2 }} />
            <Typography variant="body1" color="text.secondary" fontWeight={600}>
              No drivers found
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {search ? 'Try adjusting your search' : 'No drivers registered yet'}
            </Typography>
          </Paper>
        ) : isMobile ? (
          <Box>{filtered.map((d) => <DriverCard key={d.id} driver={d} />)}</Box>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f9fafb' }}>
                  {['Driver', 'Phone', 'License No.', 'Ambulance', 'Verification', 'Status', 'Rating', 'Actions'].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.8rem', py: 2 }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((driver) => {
                  const vs = (driver as any).verificationStatus ?? 'APPROVED';
                  return (
                    <TableRow key={driver.id} hover sx={{ '&:hover': { bgcolor: '#f9fafb' } }}>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Avatar sx={{ bgcolor: '#1B6B4A', width: 40, height: 40, fontSize: '0.85rem', fontWeight: 700 }}>
                            {driver.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </Avatar>
                          <Box>
                            <Typography fontWeight={600} fontSize="0.9rem">
                              {driver.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {driver.email}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.85rem' }}>{driver.phone}</TableCell>
                      <TableCell sx={{ fontSize: '0.85rem', fontFamily: 'monospace', fontWeight: 600 }}>
                        {driver.licenseNumber}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={driver.ambulanceId}
                          size="small"
                          sx={{ bgcolor: '#E8F5EE', color: '#1B6B4A', fontWeight: 600, fontSize: '0.7rem' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={vs}
                          color={VERIFY_COLORS[vs] ?? 'default'}
                          size="small"
                          sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                        />
                      </TableCell>
                      <TableCell>
                        {vs === 'APPROVED' && (
                          <Chip
                            label={driver.status}
                            color={STATUS_COLORS[driver.status] ?? 'default'}
                            size="small"
                            sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <StarIcon sx={{ fontSize: 16, color: '#f59e0b' }} />
                          <Typography fontSize="0.85rem" fontWeight={600}>
                            {driver.rating}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ({driver.totalRides})
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <VerifyButtons driver={driver} />
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => navigate(`/drivers/${driver.id}`)}
                            sx={{
                              borderColor: '#0d9488',
                              color: '#0d9488',
                              borderRadius: 2,
                              textTransform: 'none',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              '&:hover': { borderColor: '#0d9488', bgcolor: 'rgba(13,148,136,0.08)' },
                            }}
                          >
                            View
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Confirm Dialog */}
      <Dialog open={!!confirm} onClose={() => setConfirm(null)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>
          {confirm?.action === 'APPROVE' ? 'Approve Driver?' : 'Reject Driver?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirm?.action === 'APPROVE'
              ? `This will enable ${confirm?.driver.name}'s account so they can log in.`
              : `This will reject ${confirm?.driver.name}'s registration and keep their account disabled.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirm(null)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color={confirm?.action === 'APPROVE' ? 'success' : 'error'}
            onClick={() => confirm && handleVerify(confirm.driver, confirm.action)}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            {confirm?.action === 'APPROVE' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Drivers;
