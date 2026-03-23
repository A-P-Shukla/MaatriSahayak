import React, { useState } from 'react';
import {
  Box, Typography, Button, Chip, Avatar, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Stack, TextField, InputAdornment, CircularProgress, Alert,
  useMediaQuery, useTheme, Dialog, DialogTitle, DialogContent,
  DialogActions, DialogContentText,
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon, Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CheckCircle as ApproveIcon, Cancel as RejectIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAshaWorkers, useAshaStats } from '../hooks/useAsha';
import { verifyAshaRegistration } from '../services/asha';
import type { AshaWorker } from '../types/asha';

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
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ worker: AshaWorker; action: 'APPROVE' | 'REJECT' } | null>(null);
  const [overrides, setOverrides] = useState<Record<string, string>>({});

  const { data: workers = [], isLoading } = useAshaWorkers({});
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
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.phone?.includes(search) ||
    w.district?.toLowerCase().includes(search.toLowerCase()) ||
    w.village?.toLowerCase().includes(search.toLowerCase())
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
      <Card elevation={0} sx={{ border: '1px solid #d1fae5', borderRadius: 3, mb: 2 }}>
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
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={800} color="#0f172a">ASHA Workers</Typography>
          <Typography variant="body2" color="text.secondary">Manage and monitor all registered ASHA workers</Typography>
        </Box>
      </Stack>

      <Stack direction="row" spacing={2} mb={3} flexWrap="wrap">
        {[
          { label: 'Total Workers', value: stats?.total_asha_workers ?? workers.length, color: '#1B6B4A', bg: '#f0faf7' },
          { label: 'Pending Approval', value: pendingCount, color: '#d97706', bg: '#fffbeb' },
          { label: 'Active', value: stats?.active_workers ?? 0, color: '#16a34a', bg: '#f0fdf4' },
          { label: 'Total Patients', value: stats?.total_patients_covered ?? 0, color: '#7c3aed', bg: '#f5f3ff' },
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
        fullWidth placeholder="Search by name, phone, district or village..."
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

      {actionError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setActionError(null)}>{actionError}</Alert>}

      {isLoading ? (
        <Box display="flex" justifyContent="center" py={6}><CircularProgress sx={{ color: '#0d9488' }} /></Box>
      ) : filtered.length === 0 ? (
        <Box textAlign="center" py={6}>
          <PersonIcon sx={{ fontSize: 56, color: '#d1fae5', mb: 1 }} />
          <Typography color="text.secondary">No ASHA workers found</Typography>
        </Box>
      ) : isMobile ? (
        <Box>{filtered.map((w) => <WorkerCard key={w.asha_id} worker={w} />)}</Box>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #d1fae5', borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f0faf7' }}>
                {['ASHA Worker', 'Phone', 'Location', 'Patients', 'Verification', 'Actions'].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 700, color: '#1B6B4A', fontSize: '0.8rem', py: 1.5 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((worker) => {
                const vs = getVerificationStatus(worker);
                return (
                  <TableRow key={worker.asha_id} hover sx={{ '&:hover': { bgcolor: '#f0faf7' } }}>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Avatar sx={{ bgcolor: '#1B6B4A', width: 36, height: 36, fontSize: '0.8rem', fontWeight: 700 }}>
                          {worker.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </Avatar>
                        <Box>
                          <Typography fontWeight={600} fontSize="0.9rem">{worker.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{worker.asha_id}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem' }}>{worker.phone ?? '—'}</TableCell>
                    <TableCell sx={{ fontSize: '0.85rem' }}>{worker.village}, {worker.district}</TableCell>
                    <TableCell sx={{ fontSize: '0.85rem' }}>{worker.assigned_patients_count}</TableCell>
                    <TableCell>
                      <Chip label={vs} color={VERIFY_COLORS[vs] ?? 'default'} size="small" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <VerifyButtons worker={worker} />
                        <Button
                          size="small" variant="outlined"
                          onClick={() => navigate(`/asha/${worker.asha_id}`)}
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
          <Button onClick={() => setConfirm(null)} sx={{ textTransform: 'none' }}>Cancel</Button>
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
