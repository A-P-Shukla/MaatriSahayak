import React, { useState, useEffect, useCallback } from 'react';
import {
  Drawer, Box, Typography, Stack, Avatar, Button,
  CircularProgress, Alert, Tabs, Tab, Badge, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
} from '@mui/material';
import { X, CheckCircle, XCircle, UserCircle, Car, RefreshCw } from 'lucide-react';
import { listDrivers, verifyRegistration, type Driver } from '../services/driver';
import { getAshaWorkers } from '../services/asha';
import type { AshaWorker } from '../types/asha';

interface Props {
  open: boolean;
  onClose: () => void;
  onCountChange?: (count: number) => void;
}

type ActionTarget = { id: string; name: string; type: 'DRIVER' | 'ASHA'; action: 'APPROVE' | 'REJECT' };

const PendingApprovalsPanel: React.FC<Props> = ({ open, onClose, onCountChange }) => {
  const [tab, setTab] = useState(0);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [ashas, setAshas] = useState<AshaWorker[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ActionTarget | null>(null);

  const pendingDrivers = drivers.filter((d) => d.verificationStatus === 'PENDING');
  const pendingAshas = ashas.filter((a) => a.verificationStatus === 'PENDING');
  const totalPending = pendingDrivers.length + pendingAshas.length;

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [d, a] = await Promise.all([
        listDrivers(),
        getAshaWorkers(),
      ]);
      setDrivers(d);
      setAshas(a);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (open) fetchAll(); }, [open, fetchAll]);

  useEffect(() => { onCountChange?.(totalPending); }, [totalPending, onCountChange]);

  const handleAction = async () => {
    if (!confirm) return;
    setActionLoading(confirm.id);
    setConfirm(null);
    try {
      await verifyRegistration(confirm.id, confirm.type, confirm.action);
      if (confirm.type === 'DRIVER') {
        setDrivers((prev) => prev.map((d) =>
          d.id === confirm.id ? { ...d, verificationStatus: confirm.action === 'APPROVE' ? 'APPROVED' : 'REJECTED' } : d
        ));
      } else {
        setAshas((prev) => prev.map((a) =>
          a.asha_id === confirm.id ? { ...a, verificationStatus: confirm.action === 'APPROVE' ? 'APPROVED' : 'REJECTED' } : a
        ));
      }
    } catch (e: any) {
      setError(e.message ?? 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const DriverRow = ({ d }: { d: Driver }) => (
    <Box sx={{ p: 2, border: '1px solid #d1fae5', borderRadius: 2.5, mb: 1.5, bgcolor: '#fff' }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar sx={{ bgcolor: '#1B6B4A', width: 40, height: 40, fontSize: '0.85rem', fontWeight: 700 }}>
          {d.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
        </Avatar>
        <Box flex={1} minWidth={0}>
          <Typography fontWeight={700} fontSize="0.9rem" noWrap>{d.name}</Typography>
          <Typography variant="caption" color="text.secondary">{d.phone} · {d.licenseNumber}</Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            Ambulance: {d.ambulanceId || '—'} · Joined {new Date(d.createdAt).toLocaleDateString('en-IN')}
          </Typography>
        </Box>
      </Stack>
      <Stack direction="row" spacing={1} mt={1.5}>
        <Button size="small" variant="contained" color="success" fullWidth disabled={actionLoading === d.id}
          startIcon={actionLoading === d.id ? <CircularProgress size={12} color="inherit" /> : <CheckCircle size={14} />}
          onClick={() => setConfirm({ id: d.id, name: d.name, type: 'DRIVER', action: 'APPROVE' })}
          sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem', borderRadius: 1.5 }}>
          Approve
        </Button>
        <Button size="small" variant="outlined" color="error" fullWidth disabled={actionLoading === d.id}
          startIcon={<XCircle size={14} />}
          onClick={() => setConfirm({ id: d.id, name: d.name, type: 'DRIVER', action: 'REJECT' })}
          sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem', borderRadius: 1.5 }}>
          Reject
        </Button>
      </Stack>
    </Box>
  );

  const AshaRow = ({ a }: { a: AshaWorker }) => (
    <Box sx={{ p: 2, border: '1px solid #d1fae5', borderRadius: 2.5, mb: 1.5, bgcolor: '#fff' }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar sx={{ bgcolor: '#0d9488', width: 40, height: 40, fontSize: '0.85rem', fontWeight: 700 }}>
          {a.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
        </Avatar>
        <Box flex={1} minWidth={0}>
          <Typography fontWeight={700} fontSize="0.9rem" noWrap>{a.name}</Typography>
          <Typography variant="caption" color="text.secondary">{a.phone} · {a.district}</Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            Village: {a.village || '—'} · Joined {a.registration_date ? new Date(a.registration_date).toLocaleDateString('en-IN') : '—'}
          </Typography>
        </Box>
      </Stack>
      <Stack direction="row" spacing={1} mt={1.5}>
        <Button size="small" variant="contained" color="success" fullWidth disabled={actionLoading === a.asha_id}
          startIcon={actionLoading === a.asha_id ? <CircularProgress size={12} color="inherit" /> : <CheckCircle size={14} />}
          onClick={() => setConfirm({ id: a.asha_id, name: a.name, type: 'ASHA', action: 'APPROVE' })}
          sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem', borderRadius: 1.5 }}>
          Approve
        </Button>
        <Button size="small" variant="outlined" color="error" fullWidth disabled={actionLoading === a.asha_id}
          startIcon={<XCircle size={14} />}
          onClick={() => setConfirm({ id: a.asha_id, name: a.name, type: 'ASHA', action: 'REJECT' })}
          sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem', borderRadius: 1.5 }}>
          Reject
        </Button>
      </Stack>
    </Box>
  );

  return (
    <>
      <Drawer anchor="right" open={open} onClose={onClose}
        PaperProps={{ sx: { width: { xs: '100vw', sm: 420 }, bgcolor: '#f0faf7' } }}>
        {/* Header */}
        <Box sx={{ px: 2.5, py: 2, bgcolor: '#1B6B4A', color: '#fff' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography fontWeight={800} fontSize="1.05rem">Pending Approvals</Typography>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                {totalPending} request{totalPending !== 1 ? 's' : ''} awaiting review
              </Typography>
            </Box>
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="Refresh">
                <IconButton size="small" onClick={fetchAll} disabled={loading} sx={{ color: '#fff' }}>
                  <RefreshCw size={16} />
                </IconButton>
              </Tooltip>
              <IconButton size="small" onClick={onClose} sx={{ color: '#fff' }}>
                <X size={16} />
              </IconButton>
            </Stack>
          </Stack>
        </Box>

        {/* Tabs */}
        <Tabs value={tab} onChange={(_, v) => setTab(v)}
          sx={{ bgcolor: '#fff', borderBottom: '1px solid #d1fae5', minHeight: 44,
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, fontSize: '0.85rem', minHeight: 44 },
            '& .Mui-selected': { color: '#1B6B4A' },
            '& .MuiTabs-indicator': { bgcolor: '#1B6B4A' },
          }}>
          <Tab icon={<Badge badgeContent={pendingDrivers.length} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem' } }}>
            <Car size={18} /></Badge>} iconPosition="start" label="Drivers" />
          <Tab icon={<Badge badgeContent={pendingAshas.length} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem' } }}>
            <UserCircle size={18} /></Badge>} iconPosition="start" label="ASHA Workers" />
        </Tabs>

        {/* Content */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>{error}</Alert>}

          {loading ? (
            <Box display="flex" justifyContent="center" py={6}><CircularProgress sx={{ color: '#0d9488' }} /></Box>
          ) : tab === 0 ? (
            pendingDrivers.length === 0 ? (
              <Box textAlign="center" py={6}>
                <Car size={48} color="#d1fae5" />
                <Typography color="text.secondary" fontWeight={600}>No pending driver requests</Typography>
              </Box>
            ) : pendingDrivers.map((d) => <DriverRow key={d.id} d={d} />)
          ) : (
            pendingAshas.length === 0 ? (
              <Box textAlign="center" py={6}>
                <UserCircle size={48} color="#d1fae5" />
                <Typography color="text.secondary" fontWeight={600}>No pending ASHA requests</Typography>
              </Box>
            ) : pendingAshas.map((a) => <AshaRow key={a.asha_id} a={a} />)
          )}
        </Box>
      </Drawer>

      {/* Confirm Dialog */}
      <Dialog open={!!confirm} onClose={() => setConfirm(null)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>
          {confirm?.action === 'APPROVE' ? `Approve ${confirm?.type === 'DRIVER' ? 'Driver' : 'ASHA Worker'}?`
            : `Reject ${confirm?.type === 'DRIVER' ? 'Driver' : 'ASHA Worker'}?`}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirm?.action === 'APPROVE'
              ? `This will activate ${confirm?.name}'s account so they can log in and use the app.`
              : `This will reject ${confirm?.name}'s registration request.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirm(null)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" color={confirm?.action === 'APPROVE' ? 'success' : 'error'}
            onClick={handleAction} sx={{ textTransform: 'none', fontWeight: 700 }}>
            {confirm?.action === 'APPROVE' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PendingApprovalsPanel;
