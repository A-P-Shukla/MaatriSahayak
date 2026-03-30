import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Chip, Avatar, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Stack, TextField, InputAdornment, CircularProgress, Alert,
  useMediaQuery, useTheme, Dialog, DialogTitle, DialogContent,
  DialogActions, DialogContentText,
} from '@mui/material';
import { Search, Car, Phone, Star, Truck, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { listDrivers, verifyRegistration, Driver } from '../services/driver';

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
          startIcon={busy ? <CircularProgress size={12} color="inherit" /> : <CheckCircle size={14} />}
          onClick={() => setConfirm({ driver, action: 'APPROVE' })}
          sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.7rem', borderRadius: 1.5 }}
        >
          Approve
        </Button>
        <Button
          size="small" variant="outlined" color="error"
          disabled={busy}
          startIcon={<XCircle size={14} />}
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
      <Card elevation={0} sx={{ border: '1px solid #d1fae5', borderRadius: 3, mb: 2 }}>
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
              <Phone size={14} color="#9e9e9e" />
              <Typography variant="caption" color="text.secondary">{driver.phone}</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Truck size={14} color="#9e9e9e" />
              <Typography variant="caption" color="text.secondary">{driver.ambulanceId}</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Star size={14} color="#f59e0b" />
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
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={800} color="#0f172a">Ambulance Drivers</Typography>
          <Typography variant="body2" color="text.secondary">Manage and monitor all registered drivers</Typography>
        </Box>
      </Stack>

      <Stack direction="row" spacing={2} mb={3} flexWrap="wrap">
        {[
          { label: 'Total', value: stats.total, color: '#1B6B4A', bg: '#f0faf7' },
          { label: 'Pending Approval', value: stats.pending, color: '#d97706', bg: '#fffbeb' },
          { label: 'Available', value: stats.available, color: '#16a34a', bg: '#f0fdf4' },
          { label: 'On Ride', value: stats.onRide, color: '#7c3aed', bg: '#f5f3ff' },
        ].map((s) => (
          <Card key={s.label} elevation={0} sx={{ border: `1px solid ${s.bg}`, bgcolor: s.bg, borderRadius: 2.5, flex: '1 1 120px', minWidth: 100 }}>
            <CardContent sx={{ p: '12px 16px !important', textAlign: 'center' }}>
              <Typography variant="h5" fontWeight={800} sx={{ color: s.color }}>{s.value}</Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>{s.label}</Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <TextField
        fullWidth placeholder="Search by name, phone or license..."
        value={search} onChange={(e) => setSearch(e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><Search size={18} color="#0d9488" /></InputAdornment> }}
        sx={{
          mb: 3,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2, bgcolor: '#f8fafc',
            '& fieldset': { borderColor: '#d1fae5' },
            '&:hover fieldset': { borderColor: '#0d9488' },
            '&.Mui-focused fieldset': { borderColor: '#0d9488' },
          },
        }}
      />

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center" py={6}><CircularProgress sx={{ color: '#0d9488' }} /></Box>
      ) : filtered.length === 0 ? (
        <Box textAlign="center" py={6}>
          <Car size={56} color="#d1fae5" />
          <Typography color="text.secondary">No drivers found</Typography>
        </Box>
      ) : isMobile ? (
        <Box>{filtered.map((d) => <DriverCard key={d.id} driver={d} />)}</Box>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #d1fae5', borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f0faf7' }}>
                {['Driver', 'Phone', 'License No.', 'Ambulance', 'Verification', 'Status', 'Rating', 'Actions'].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 700, color: '#1B6B4A', fontSize: '0.8rem', py: 1.5 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((driver) => {
                const vs = (driver as any).verificationStatus ?? 'APPROVED';
                return (
                  <TableRow key={driver.id} hover sx={{ '&:hover': { bgcolor: '#f0faf7' } }}>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Avatar sx={{ bgcolor: '#1B6B4A', width: 36, height: 36, fontSize: '0.8rem', fontWeight: 700 }}>
                          {driver.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </Avatar>
                        <Box>
                          <Typography fontWeight={600} fontSize="0.9rem">{driver.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{driver.email}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem' }}>{driver.phone}</TableCell>
                    <TableCell sx={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>{driver.licenseNumber}</TableCell>
                    <TableCell>
                      <Chip label={driver.ambulanceId} size="small" sx={{ bgcolor: '#f0faf7', color: '#1B6B4A', fontWeight: 600, fontSize: '0.7rem' }} />
                    </TableCell>
                    <TableCell>
                      <Chip label={vs} color={VERIFY_COLORS[vs] ?? 'default'} size="small" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
                    </TableCell>
                    <TableCell>
                      {vs === 'APPROVED' && (
                        <Chip label={driver.status} color={STATUS_COLORS[driver.status] ?? 'default'} size="small" sx={{ fontWeight: 600, fontSize: '0.75rem' }} />
                      )}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Star size={14} color="#f59e0b" />
                        <Typography fontSize="0.85rem">{driver.rating}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <VerifyButtons driver={driver} />
                        <Button
                          size="small" variant="outlined"
                          onClick={() => navigate(`/drivers/${driver.id}`)}
                          sx={{ borderColor: '#0d9488', color: '#0d9488', borderRadius: 2, textTransform: 'none', fontWeight: 600, fontSize: '0.75rem' }}
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
          <Button onClick={() => setConfirm(null)} sx={{ textTransform: 'none' }}>Cancel</Button>
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
