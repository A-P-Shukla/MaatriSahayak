import React, { useState } from 'react';
import {
  Box, Typography, CircularProgress, Alert, Button,
  Avatar, Chip, Grid, Card, CardContent, Stack, Divider, Dialog,
  DialogTitle, DialogContent, DialogActions, DialogContentText,
} from '@mui/material';
import {
  ArrowBack as BackIcon, Phone as PhoneIcon, Email as EmailIcon,
  LocationOn as LocationIcon, People as PeopleIcon,
  Warning as WarningIcon, LocalHospital as EmergencyIcon,
  CheckCircle as ApproveIcon, Cancel as RejectIcon, Build as BuildIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAshaWorker, useAshaPregnancies } from '../hooks/useAsha';
import { verifyAshaRegistration } from '../services/asha';
import SyncUserDialog from '../components/SyncUserDialog';

const VERIFY_COLORS: Record<string, 'warning' | 'success' | 'error' | 'default'> = {
  PENDING: 'warning', APPROVED: 'success', REJECTED: 'error',
};

const AshaWorkerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: worker, isLoading, isError, error } = useAshaWorker(id || '');
  const { data: pregnancies = [] } = useAshaPregnancies(id || '');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);

  const handleVerify = async (action: 'APPROVE' | 'REJECT') => {
    if (!worker) return;
    setConfirm(null);
    setActionLoading(true);
    try {
      await verifyAshaRegistration(worker.asha_id, action);
      setVerificationStatus(action === 'APPROVE' ? 'APPROVED' : 'REJECTED');
    } catch (e: any) {
      setActionError(e.message ?? 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !worker) {
    return (
      <Box>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/asha')} sx={{ mb: 3 }}>
          Back to ASHA Workers
        </Button>
        <Alert severity="error">
          Failed to load ASHA worker details: {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
      </Box>
    );
  }

  const vs = verificationStatus ?? (worker as any).verificationStatus ?? 'APPROVED';

  return (
    <Box>
      <Button startIcon={<BackIcon />} onClick={() => navigate('/asha')}
        sx={{ mb: 3, color: '#1B6B4A', fontWeight: 600, textTransform: 'none', '&:hover': { bgcolor: '#f0faf7' } }}>
        Back to ASHA Workers
      </Button>

      {actionError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setActionError(null)}>{actionError}</Alert>}

      {/* Hero Card */}
      <Card elevation={0} sx={{ border: '1px solid #d1fae5', borderRadius: 3, mb: 3, background: 'linear-gradient(135deg, #f0faf7 0%, #ffffff 100%)' }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', sm: 'center' }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: '#1B6B4A', fontSize: '1.8rem', fontWeight: 800, flexShrink: 0 }}>
              {worker.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </Avatar>
            <Box flex={1}>
              <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap" mb={0.5}>
                <Typography variant="h5" fontWeight={800} color="#0f172a">{worker.name}</Typography>
                <Chip label={vs} color={VERIFY_COLORS[vs] ?? 'default'} size="small" sx={{ fontWeight: 700 }} />
              </Stack>
              <Typography variant="body2" color="text.secondary" mb={1}>ID: {worker.asha_id}</Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                {worker.phone && (
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <PhoneIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">{worker.phone}</Typography>
                  </Stack>
                )}
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <LocationIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">{worker.village}, {worker.district}</Typography>
                </Stack>
              </Stack>
            </Box>
            {vs === 'PENDING' && (
              <Stack direction="row" spacing={1}>
                <Button variant="contained" color="success" size="small"
                  disabled={actionLoading} startIcon={<ApproveIcon />}
                  onClick={() => setConfirm('APPROVE')}
                  sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>
                  Approve
                </Button>
                <Button variant="outlined" color="error" size="small"
                  disabled={actionLoading} startIcon={<RejectIcon />}
                  onClick={() => setConfirm('REJECT')}
                  sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>
                  Reject
                </Button>
              </Stack>
            )}
            <Button
              variant="outlined"
              size="small"
              startIcon={<BuildIcon />}
              onClick={() => setSyncDialogOpen(true)}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: 2,
                borderColor: '#0d9488',
                color: '#0d9488',
                '&:hover': { borderColor: '#0f766e', bgcolor: '#f0fdf4' },
              }}
            >
              Fix Data
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={2.5} mb={3}>
        {/* Contact */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid #d1fae5', borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} color="#1B6B4A" mb={1}>Contact Information</Typography>
              <Divider sx={{ mb: 2, borderColor: '#d1fae5' }} />
              <Stack spacing={1.5}>
                {worker.phone && (
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <PhoneIcon sx={{ fontSize: 18, color: '#0d9488' }} />
                    <Box><Typography variant="caption" color="text.secondary" display="block">Phone</Typography>
                      <Typography variant="body2" fontWeight={600}>{worker.phone}</Typography></Box>
                  </Stack>
                )}
                {worker.email && (
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <EmailIcon sx={{ fontSize: 18, color: '#0d9488' }} />
                    <Box><Typography variant="caption" color="text.secondary" display="block">Email</Typography>
                      <Typography variant="body2" fontWeight={600}>{worker.email}</Typography></Box>
                  </Stack>
                )}
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <LocationIcon sx={{ fontSize: 18, color: '#0d9488' }} />
                  <Box><Typography variant="caption" color="text.secondary" display="block">Location</Typography>
                    <Typography variant="body2" fontWeight={600}>{worker.village}, {worker.district}</Typography></Box>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Stats */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid #d1fae5', borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} color="#1B6B4A" mb={1}>Performance Metrics</Typography>
              <Divider sx={{ mb: 2, borderColor: '#d1fae5' }} />
              <Grid container spacing={1.5}>
                {[
                  { label: 'Assigned Patients', value: worker.assigned_patients_count, icon: <PeopleIcon />, color: '#1B6B4A', bg: '#f0faf7' },
                  { label: 'Active Pregnancies', value: worker.active_pregnancies, icon: <PeopleIcon />, color: '#0d9488', bg: '#f0fdf4' },
                  { label: 'High Risk Cases', value: worker.high_risk_cases, icon: <WarningIcon />, color: '#d97706', bg: '#fffbeb' },
                  { label: 'Emergencies Handled', value: worker.total_emergencies_handled, icon: <EmergencyIcon />, color: '#dc2626', bg: '#fef2f2' },
                ].map((s) => (
                  <Grid item xs={6} key={s.label}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: s.bg, textAlign: 'center' }}>
                      <Typography fontWeight={800} sx={{ color: s.color, fontSize: '1.4rem' }}>{s.value ?? 0}</Typography>
                      <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Assigned Patients */}
      <Card elevation={0} sx={{ border: '1px solid #d1fae5', borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} color="#1B6B4A" mb={1}>
            Assigned Patients ({pregnancies.length})
          </Typography>
          <Divider sx={{ mb: 2, borderColor: '#d1fae5' }} />
          {pregnancies.length === 0 ? (
            <Box textAlign="center" py={4}>
              <PeopleIcon sx={{ fontSize: 48, color: '#d1fae5', mb: 1 }} />
              <Typography color="text.secondary">No patients assigned yet</Typography>
            </Box>
          ) : (
            <Stack spacing={1}>
              {pregnancies.map((p: any) => (
                <Box key={p.pregnancy_id} sx={{
                  p: 2, border: '1px solid #e2e8f0', borderRadius: 2, bgcolor: '#fafafa',
                  cursor: 'pointer', '&:hover': { bgcolor: '#f0faf7', borderColor: '#0d9488' },
                  transition: 'all 0.15s',
                }} onClick={() => navigate(`/pregnancies/${p.pregnancy_id}`)}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography fontWeight={700} fontSize="0.9rem">{p.patient_name}</Typography>
                      <Typography variant="caption" color="text.secondary">Age: {p.age} · {p.village}</Typography>
                    </Box>
                    {p.risk_category && (
                      <Chip label={p.risk_category.toUpperCase()} size="small"
                        color={p.risk_category === 'high' || p.risk_category === 'critical' ? 'error' : p.risk_category === 'medium' ? 'warning' : 'success'}
                        sx={{ fontWeight: 700, fontSize: '0.65rem' }} />
                    )}
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Confirm Dialog */}
      <Dialog open={!!confirm} onClose={() => setConfirm(null)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>{confirm === 'APPROVE' ? 'Approve ASHA Worker?' : 'Reject ASHA Worker?'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirm === 'APPROVE'
              ? `This will enable ${worker.name}'s account so they can log in.`
              : `This will reject ${worker.name}'s registration and keep their account disabled.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirm(null)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" color={confirm === 'APPROVE' ? 'success' : 'error'}
            onClick={() => confirm && handleVerify(confirm)}
            sx={{ textTransform: 'none', fontWeight: 700 }}>
            {confirm === 'APPROVE' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sync User Dialog */}
      <SyncUserDialog
        open={syncDialogOpen}
        onClose={() => setSyncDialogOpen(false)}
        ashaId={worker.asha_id}
        currentEmail={worker.email || ''}
        phone={worker.phone || ''}
      />
    </Box>
  );
};

export default AshaWorkerDetails;
