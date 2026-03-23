import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Stack, Avatar, Divider,
  TextField, Button, Alert, CircularProgress, Grid, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText,
} from '@mui/material';
import {
  Person as PersonIcon, Email as EmailIcon, Phone as PhoneIcon,
  LocationOn as LocationIcon, Badge as BadgeIcon,
  Edit as EditIcon, Logout as LogoutIcon, Save as SaveIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const fldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2, bgcolor: '#f8fafc', fontSize: '0.93rem',
    '& fieldset': { borderColor: '#d1fae5' },
    '&:hover fieldset': { borderColor: '#0d9488' },
    '&.Mui-focused fieldset': { borderColor: '#0d9488', borderWidth: 2 },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#0d9488' },
};

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [form, setForm] = useState({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    district: user?.district ?? '',
  });

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      // Profile update would call an API — for now just show success
      // await updateProfile(form);
      setSaveSuccess(true);
      setEditing(false);
    } catch (e: any) {
      setSaveError(e.message ?? 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setLogoutConfirm(false);
    await logout();
    navigate('/login', { replace: true });
  };

  const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <Stack direction="row" alignItems="center" spacing={1.5} py={1.2}>
      <Box sx={{ color: '#0d9488', display: 'flex', flexShrink: 0 }}>{icon}</Box>
      <Box>
        <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
        <Typography variant="body2" fontWeight={600}>{value || '—'}</Typography>
      </Box>
    </Stack>
  );

  return (
    <Box maxWidth={700} mx="auto">
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={800} color="#0f172a">My Profile</Typography>
          <Typography variant="body2" color="text.secondary">Manage your account details</Typography>
        </Box>
        <Button variant="outlined" color="error" startIcon={<LogoutIcon />}
          onClick={() => setLogoutConfirm(true)}
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, borderWidth: 1.5 }}>
          Sign Out
        </Button>
      </Stack>

      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSaveSuccess(false)}>
          Profile updated successfully
        </Alert>
      )}
      {saveError && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSaveError(null)}>
          {saveError}
        </Alert>
      )}

      {/* Avatar Card */}
      <Card elevation={0} sx={{ border: '1px solid #d1fae5', borderRadius: 3, mb: 3, background: 'linear-gradient(135deg, #f0faf7 0%, #ffffff 100%)' }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', sm: 'center' }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: '#1B6B4A', fontSize: '1.8rem', fontWeight: 800, flexShrink: 0 }}>
              {user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) ?? 'DO'}
            </Avatar>
            <Box flex={1}>
              <Typography variant="h5" fontWeight={800} color="#0f172a" mb={0.5}>{user?.name ?? '—'}</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip label="District Officer" size="small"
                  sx={{ bgcolor: '#f0faf7', color: '#1B6B4A', fontWeight: 700, fontSize: '0.7rem', border: '1px solid #d1fae5' }} />
                {user?.district && (
                  <Chip label={user.district} size="small"
                    sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 600, fontSize: '0.7rem' }} />
                )}
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Details Card */}
      <Card elevation={0} sx={{ border: '1px solid #d1fae5', borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle1" fontWeight={700} color="#1B6B4A">Account Details</Typography>
            {!editing && (
              <Button size="small" startIcon={<EditIcon />} onClick={() => setEditing(true)}
                sx={{ textTransform: 'none', fontWeight: 600, color: '#0d9488' }}>
                Edit
              </Button>
            )}
          </Stack>
          <Divider sx={{ mb: 2, borderColor: '#d1fae5' }} />

          {editing ? (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth label="Full Name" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  InputProps={{ startAdornment: <PersonIcon sx={{ mr: 1, color: '#0d9488', fontSize: 20 }} /> }}
                  sx={fldSx} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Phone Number" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  InputProps={{ startAdornment: <PhoneIcon sx={{ mr: 1, color: '#0d9488', fontSize: 20 }} /> }}
                  sx={fldSx} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="District" value={form.district}
                  onChange={(e) => setForm({ ...form, district: e.target.value })}
                  InputProps={{ startAdornment: <LocationIcon sx={{ mr: 1, color: '#0d9488', fontSize: 20 }} /> }}
                  sx={fldSx} />
              </Grid>
              <Grid item xs={12}>
                <Stack direction="row" spacing={1.5}>
                  <Button variant="contained" startIcon={saving ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : <SaveIcon />}
                    onClick={handleSave} disabled={saving}
                    sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, bgcolor: '#1B6B4A', '&:hover': { bgcolor: '#0F4A32' } }}>
                    Save Changes
                  </Button>
                  <Button variant="outlined" onClick={() => { setEditing(false); setSaveError(null); }}
                    sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, borderColor: '#d1fae5', color: '#5A7A6A' }}>
                    Cancel
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          ) : (
            <Stack divider={<Divider sx={{ borderColor: '#f0faf7' }} />}>
              <InfoRow icon={<PersonIcon fontSize="small" />} label="Full Name" value={user?.name ?? '—'} />
              <InfoRow icon={<EmailIcon fontSize="small" />} label="Email Address" value={user?.email ?? '—'} />
              <InfoRow icon={<PhoneIcon fontSize="small" />} label="Phone Number" value={user?.phone ?? '—'} />
              <InfoRow icon={<LocationIcon fontSize="small" />} label="District" value={user?.district ?? '—'} />
              <InfoRow icon={<BadgeIcon fontSize="small" />} label="Role" value="District Officer" />
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card elevation={0} sx={{ border: '1px solid #d1fae5', borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} color="#1B6B4A" mb={1}>Account Information</Typography>
          <Divider sx={{ mb: 2, borderColor: '#d1fae5' }} />
          <Stack spacing={0.5}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">User ID</Typography>
              <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                {user?.user_id ?? '—'}
              </Typography>
            </Stack>
            {user?.created_at && (
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Member Since</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {new Date(user.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                </Typography>
              </Stack>
            )}
            {user?.last_login && (
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Last Login</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {new Date(user.last_login).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Logout Confirm */}
      <Dialog open={logoutConfirm} onClose={() => setLogoutConfirm(false)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>Sign Out?</DialogTitle>
        <DialogContent>
          <DialogContentText>You will be redirected to the login page.</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setLogoutConfirm(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleLogout}
            sx={{ textTransform: 'none', fontWeight: 700 }}>
            Sign Out
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;
