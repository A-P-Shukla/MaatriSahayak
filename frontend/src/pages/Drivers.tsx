import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Chip, Avatar, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Stack, TextField, InputAdornment, CircularProgress, Alert,
  useMediaQuery, useTheme, IconButton, Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon, Add as AddIcon,
  DirectionsCar as CarIcon, Phone as PhoneIcon,
  Star as StarIcon, LocalShipping as TruckIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getDriverProfile } from '../services/driver';

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'default'> = {
  AVAILABLE: 'success',
  ON_RIDE: 'warning',
  OFFLINE: 'default',
};

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: 'Available',
  ON_RIDE: 'On Ride',
  OFFLINE: 'Offline',
};

// Mock list — replace with real list API when available
const MOCK_DRIVERS = [
  { id: 'drv_001', name: 'Ramesh Kumar', phone: '+919876543210', email: 'ramesh@example.com', licenseNumber: 'UP32-2021-0012345', ambulanceId: 'amb_001', status: 'AVAILABLE', rating: 4.8, totalRides: 42, createdAt: '2024-01-15T10:00:00Z' },
  { id: 'drv_002', name: 'Suresh Yadav', phone: '+919876543211', email: 'suresh@example.com', licenseNumber: 'UP32-2020-0054321', ambulanceId: 'amb_002', status: 'ON_RIDE', rating: 4.5, totalRides: 78, createdAt: '2024-02-10T10:00:00Z' },
  { id: 'drv_003', name: 'Mahesh Singh', phone: '+919876543212', email: 'mahesh@example.com', licenseNumber: 'UP32-2019-0098765', ambulanceId: 'amb_003', status: 'OFFLINE', rating: 4.2, totalRides: 31, createdAt: '2024-03-05T10:00:00Z' },
];

const Drivers: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [drivers] = useState(MOCK_DRIVERS);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  const filtered = drivers.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.phone.includes(search) ||
    d.licenseNumber.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: drivers.length,
    available: drivers.filter((d) => d.status === 'AVAILABLE').length,
    onRide: drivers.filter((d) => d.status === 'ON_RIDE').length,
    offline: drivers.filter((d) => d.status === 'OFFLINE').length,
  };

  const DriverCard = ({ driver }: { driver: typeof MOCK_DRIVERS[0] }) => (
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
          <Chip
            label={STATUS_LABELS[driver.status]}
            color={STATUS_COLORS[driver.status]}
            size="small"
            sx={{ fontWeight: 600, fontSize: '0.7rem' }}
          />
        </Stack>
        <Stack direction="row" spacing={2} flexWrap="wrap">
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
        <Button
          size="small" variant="outlined" fullWidth
          onClick={() => navigate(`/drivers/${driver.id}`)}
          sx={{ mt: 1.5, borderColor: '#0d9488', color: '#0d9488', borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
        >
          View Profile
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* Header */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={800} color="#0f172a">Ambulance Drivers</Typography>
          <Typography variant="body2" color="text.secondary">Manage and monitor all registered drivers</Typography>
        </Box>
        <Button
          variant="contained" startIcon={<AddIcon />}
          onClick={() => navigate('/drivers/register')}
          sx={{
            background: 'linear-gradient(135deg, #1B6B4A 0%, #0d9488 100%)',
            borderRadius: 2, textTransform: 'none', fontWeight: 700,
            boxShadow: '0 4px 14px rgba(13,148,136,0.3)',
          }}
        >
          Register Driver
        </Button>
      </Stack>

      {/* Stats */}
      <Stack direction="row" spacing={2} mb={3} flexWrap="wrap">
        {[
          { label: 'Total Drivers', value: stats.total, color: '#1B6B4A', bg: '#f0faf7' },
          { label: 'Available', value: stats.available, color: '#16a34a', bg: '#f0fdf4' },
          { label: 'On Ride', value: stats.onRide, color: '#d97706', bg: '#fffbeb' },
          { label: 'Offline', value: stats.offline, color: '#64748b', bg: '#f8fafc' },
        ].map((s) => (
          <Card key={s.label} elevation={0} sx={{ border: `1px solid ${s.bg}`, bgcolor: s.bg, borderRadius: 2.5, flex: '1 1 120px', minWidth: 100 }}>
            <CardContent sx={{ p: '12px 16px !important', textAlign: 'center' }}>
              <Typography variant="h5" fontWeight={800} sx={{ color: s.color }}>{s.value}</Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>{s.label}</Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Search */}
      <TextField
        fullWidth placeholder="Search by name, phone or license..."
        value={search} onChange={(e) => setSearch(e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#0d9488' }} /></InputAdornment> }}
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

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center" py={6}><CircularProgress sx={{ color: '#0d9488' }} /></Box>
      ) : filtered.length === 0 ? (
        <Box textAlign="center" py={6}>
          <CarIcon sx={{ fontSize: 56, color: '#d1fae5', mb: 1 }} />
          <Typography color="text.secondary">No drivers found</Typography>
        </Box>
      ) : isMobile ? (
        <Box>{filtered.map((d) => <DriverCard key={d.id} driver={d} />)}</Box>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #d1fae5', borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f0faf7' }}>
                {['Driver', 'Phone', 'License No.', 'Ambulance', 'Status', 'Rating', 'Rides', ''].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 700, color: '#1B6B4A', fontSize: '0.8rem', py: 1.5 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((driver) => (
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
                    <Chip
                      label={STATUS_LABELS[driver.status]}
                      color={STATUS_COLORS[driver.status]}
                      size="small"
                      sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <StarIcon sx={{ fontSize: 14, color: '#f59e0b' }} />
                      <Typography fontSize="0.85rem">{driver.rating}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.85rem' }}>{driver.totalRides}</TableCell>
                  <TableCell>
                    <Button
                      size="small" variant="outlined"
                      onClick={() => navigate(`/drivers/${driver.id}`)}
                      sx={{ borderColor: '#0d9488', color: '#0d9488', borderRadius: 2, textTransform: 'none', fontWeight: 600, fontSize: '0.75rem' }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Drivers;
