import React, { useState } from 'react';
import {
  Box, Typography, Button, Chip, Avatar, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Stack, TextField, InputAdornment, CircularProgress, Alert,
  useMediaQuery, useTheme, Dialog, DialogTitle, DialogContent,
  DialogActions, DialogContentText, Grid, MenuItem,
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon, Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CheckCircle as ApproveIcon, Cancel as RejectIcon,
  Group as GroupIcon, HourglassEmpty as PendingIcon,
  VerifiedUser as ActiveIcon, People as PatientsIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import SendNotificationButton from '../components/SendNotificationButton';
import { useNavigate } from 'react-router-dom';
import { useAshaWorkers, useAshaStats } from '../hooks/useAsha';
import { verifyAshaRegistration } from '../services/asha';
import type { AshaWorker } from '../types/asha';

const DRAWER_WIDTH = 270;

const VERIFY_COLORS: Record<string, 'warning' | 'success' | 'error' | 'default'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
};

const AshaWorkers: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ worker: AshaWorker; action: 'APPROVE' | 'REJECT' } | null>(null);
  const [overrides, setOverrides] = useState<Record<string, string>>({});

  const { data: workers = [], isLoading, refetch } = useAshaWorkers({});
  const { data: stats } = useAshaStats();

  const handleVerify = async (worker: AshaWorker, action: 'APPROVE' | 'REJECT') => {
    setConfirm(null);
    const id = worker.asha_id;
    setActionLoading(id);
    try {
      await verifyAshaRegistration(id, action);
      setOverrides((prev) => ({ ...prev, [id]: action === 'APPROVE' ? 'APPROVED' : 'REJECTED' }));
    } catch (e: any) {
      setActionError(e.message ?? 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const getVerificationStatus = (worker: AshaWorker) =>
    overrides[worker.asha_id] ?? (worker as any).verificationStatus ?? 'APPROVED';

  const filtered = workers.filter((w) =>
    (w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.phone?.includes(search) ||
    w.district?.toLowerCase().includes(search.toLowerCase()) ||
    w.village?.toLowerCase().includes(search.toLowerCase())) &&
    (!district || w.district === district)
  );

  const pendingCount = workers.filter((w) => getVerificationStatus(w) === 'PENDING').length;

  const VerifyButtons = ({ worker }: { worker: AshaWorker }) => {
    const vs = getVerificationStatus(worker);
    if (vs !== 'PENDING') return null;
    const busy = actionLoading === worker.asha_id;
    return (
      <Stack direction="row" spacing={0.5}>
        <Button
          size="small" variant="contained" color="success"
          disabled={busy}
          startIcon={busy ? <CircularProgress size={12} color="inherit" /> : <ApproveIcon />}
          onClick={() => setConfirm({ worker, action: 'APPROVE' })}
          sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.7rem', borderRadius: 1.5 }}
        >
          Approve
        </Button>
        <Button
          size="small" variant="outlined" color="error"
          disabled={busy}
          startIcon={<RejectIcon />}
          onClick={() => setConfirm({ worker, action: 'REJECT' })}
          sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.7rem', borderRadius: 1.5 }}
        >
          Reject
        </Button>
      </Stack>
    );
  };

  const WorkerCard = ({ worker }: { worker: AshaWorker }) => {
    const vs = getVerificationStatus(worker);
    return (
      <Card elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3, mb: 2, '&:hover': { boxShadow: 2 }, transition: 'all 0.2s' }}>
        <CardContent sx={{ p: 2.5 }}>
          <Stack direction="row" alignItems="center" spacing={2} mb={1.5}>
            <Avatar sx={{ bgcolor: '#1B6B4A', width: 44, height: 44, fontWeight: 700 }}>
              {worker.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </Avatar>
            <Box flex={1} minWidth={0}>
              <Typography fontWeight={700} noWrap>{worker.name}</Typography>
              <Typography variant="caption" color="text.secondary">{worker.asha_id}</Typography>
            </Box>
            <Chip label={vs} color={VERIFY_COLORS[vs] ?? 'default'} size="small" sx={{ fontWeight: 700, fontSize: '0.65rem' }} />
          </Stack>
          <Stack direction="row" spacing={2} flexWrap="wrap" mb={1.5}>
            {worker.phone && (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">{worker.phone}</Typography>
              </Stack>
            )}
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <LocationIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">{worker.village}, {worker.district}</Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary">{worker.assigned_patients_count} patients</Typography>
          </Stack>
          <VerifyButtons worker={worker} />
          {vs === 'APPROVED' && (
            <Box mt={1}>
              <SendNotificationButton
                ashaWorkerId={worker.asha_id}
                ashaWorkerName={worker.name}
                variant="icon"
              />
            </Box>
          )}
          <Button
            size="small" variant="outlined" fullWidth
            onClick={() => navigate(`/asha/${worker.asha_id}`)}
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
                ASHA Workers
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                Manage and monitor all registered ASHA workers
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={() => refetch()}
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
            { label: 'Total Workers', value: stats?.total_asha_workers ?? workers.length, color: '#1B6B4A', bg: '#E8F5EE', icon: GroupIcon },
            { label: 'Pending Approval', value: pendingCount, color: '#d97706', bg: '#FFF3E0', icon: PendingIcon },
            { label: 'Active', value: stats?.active_workers ?? 0, color: '#16a34a', bg: '#E8F5E9', icon: ActiveIcon },
            { label: 'Total Patients', value: stats?.total_patients_covered ?? 0, color: '#7c3aed', bg: '#F3E5F5', icon: PatientsIcon },
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

        {/* Search and District Filter */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search by name, phone, or village..."
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
              flex: 1,
              minWidth: 250,
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                bgcolor: 'white',
                '& fieldset': { borderColor: '#e5e7eb' },
                '&:hover fieldset': { borderColor: '#0d9488' },
                '&.Mui-focused fieldset': { borderColor: '#0d9488' },
              },
            }}
          />
          <TextField
            select
            label="Filter by District"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            sx={{
              minWidth: 200,
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                bgcolor: 'white',
              },
            }}
          >
            <MenuItem value="">All Districts</MenuItem>
            <MenuItem value="Lucknow">Lucknow</MenuItem>
            <MenuItem value="Kanpur">Kanpur</MenuItem>
            <MenuItem value="Varanasi">Varanasi</MenuItem>
            <MenuItem value="Agra">Agra</MenuItem>
            <MenuItem value="Sitapur">Sitapur</MenuItem>
          </TextField>
        </Box>

        {actionError && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setActionError(null)}>
            {actionError}
          </Alert>
        )}

        {/* Content */}
        {isLoading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress sx={{ color: '#0d9488' }} />
          </Box>
        ) : filtered.length === 0 ? (
          <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3, py: 8, textAlign: 'center' }}>
            <PersonIcon sx={{ fontSize: 64, color: '#e5e7eb', mb: 2 }} />
            <Typography variant="body1" color="text.secondary" fontWeight={600}>
              No ASHA workers found
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {search ? 'Try adjusting your search' : 'No workers registered yet'}
            </Typography>
          </Paper>
        ) : isMobile ? (
          <Box>{filtered.map((w) => <WorkerCard key={w.asha_id} worker={w} />)}</Box>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f9fafb' }}>
                  {['ASHA Worker', 'Phone', 'Location', 'Patients', 'Verification', 'Actions'].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.8rem', py: 2 }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((worker) => {
                  const vs = getVerificationStatus(worker);
                  return (
                    <TableRow key={worker.asha_id} hover sx={{ '&:hover': { bgcolor: '#f9fafb' } }}>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Avatar sx={{ bgcolor: '#1B6B4A', width: 40, height: 40, fontSize: '0.85rem', fontWeight: 700 }}>
                            {worker.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </Avatar>
                          <Box>
                            <Typography fontWeight={600} fontSize="0.9rem">
                              {worker.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {worker.asha_id}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.85rem' }}>{worker.phone ?? '—'}</TableCell>
                      <TableCell sx={{ fontSize: '0.85rem' }}>
                        {worker.village}, {worker.district}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                        {worker.assigned_patients_count}
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
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <VerifyButtons worker={worker} />
                          {vs === 'APPROVED' && (
                            <SendNotificationButton
                              ashaWorkerId={worker.asha_id}
                              ashaWorkerName={worker.name}
                              variant="icon"
                            />
                          )}
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => navigate(`/asha/${worker.asha_id}`)}
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
          {confirm?.action === 'APPROVE' ? 'Approve ASHA Worker?' : 'Reject ASHA Worker?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirm?.action === 'APPROVE'
              ? `This will enable ${confirm?.worker.name}'s account so they can log in.`
              : `This will reject ${confirm?.worker.name}'s registration and keep their account disabled.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirm(null)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color={confirm?.action === 'APPROVE' ? 'success' : 'error'}
            onClick={() => confirm && handleVerify(confirm.worker, confirm.action)}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            {confirm?.action === 'APPROVE' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AshaWorkers;
