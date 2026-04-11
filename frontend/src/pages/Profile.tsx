import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Stack,
  Avatar,
  TextField,
  Button,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Grid,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Edit as EditIcon,
  Logout as LogoutIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Badge as BadgeIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Security as SecurityIcon,
  Verified as VerifiedIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from '../services/auth';

const DRAWER_WIDTH = 270;

const Profile: React.FC = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [form, setForm] = useState({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    district: user?.district ?? '',
  });

  useEffect(() => {
    if (user) {
      console.log('User object:', user);
      console.log('User ID fields:', {
        user_id: user.user_id,
        id: (user as any).id,
        userId: (user as any).userId,
      });
      setForm({
        name: user.name ?? '',
        phone: user.phone ?? '',
        district: user.district ?? '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      await updateProfile(form);
      await refreshUser();
      setSaveSuccess(true);
      setEditing(false);
    } catch (e: any) {
      setSaveError(e.message ?? 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshUser();
    } catch (e: any) {
      setSaveError(e.message ?? 'Failed to refresh profile');
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    setLogoutConfirm(false);
    await logout();
    navigate('/login', { replace: true });
  };

  const handleCancel = () => {
    setEditing(false);
    setSaveError(null);
    setForm({
      name: user?.name ?? '',
      phone: user?.phone ?? '',
      district: user?.district ?? '',
    });
  };

  const getInitials = () => {
    if (!user?.name) return 'DO';
    return user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <Box sx={{
      position: 'absolute',
      top: { xs: 56, md: 64 },
      left: { xs: 0, md: DRAWER_WIDTH },
      right: 0,
      bottom: 0,
      bgcolor: '#f5f7fa',
      overflow: 'auto'
    }}>
      {/* Header Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
          pt: 4,
          pb: 8,
          px: 3,
        }}
      >
        <Box maxWidth={1400} mx="auto">
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
            <Box>
              <Typography variant="h4" fontWeight={700} color="white" mb={0.5}>
                Profile Settings
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                Manage your account information and preferences
              </Typography>
            </Box>
            <Stack direction="row" spacing={1.5}>
              <Tooltip title="Refresh profile">
                <IconButton
                  onClick={handleRefresh}
                  disabled={refreshing}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                  }}
                >
                  {refreshing ? (
                    <CircularProgress size={20} sx={{ color: 'white' }} />
                  ) : (
                    <RefreshIcon />
                  )}
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                startIcon={<LogoutIcon />}
                onClick={() => setLogoutConfirm(true)}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                }}
              >
                Sign Out
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Box>

      {/* Main Content */}
      <Box maxWidth={1400} mx="auto" px={3} sx={{ mt: -5, pb: 4 }}>
        {/* Alerts */}
        {saveSuccess && (
          <Alert
            severity="success"
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setSaveSuccess(false)}
          >
            Profile updated successfully!
          </Alert>
        )}
        {saveError && (
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setSaveError(null)}
          >
            {saveError}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Left Column - Profile Card */}
          <Grid item xs={12} md={4}>
            <Card
              elevation={0}
              sx={{
                border: '1px solid #e5e7eb',
                borderRadius: 3,
                overflow: 'hidden',
              }}
            >
              {/* Cover */}
              <Box
                sx={{
                  height: 120,
                  background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
                }}
              />

              {/* Avatar & Name */}
              <Box sx={{ px: 3, pb: 3, textAlign: 'center', mt: -6 }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: '#1B6B4A',
                    fontSize: '2.5rem',
                    fontWeight: 700,
                    border: '5px solid white',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    mx: 'auto',
                  }}
                >
                  {getInitials()}
                </Avatar>

                <Typography variant="h5" fontWeight={700} color="#0f172a" mt={2}>
                  {user?.name ?? 'District Officer'}
                </Typography>

                <Typography variant="body2" color="text.secondary" mb={2}>
                  {user?.email ?? '—'}
                </Typography>

                <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
                  <Chip
                    icon={<VerifiedIcon sx={{ fontSize: 16 }} />}
                    label="District Officer"
                    size="small"
                    sx={{
                      bgcolor: '#f0fdf4',
                      color: '#15803d',
                      fontWeight: 600,
                      border: '1px solid #bbf7d0',
                    }}
                  />
                  {user?.district && (
                    <Chip
                      icon={<LocationIcon sx={{ fontSize: 16 }} />}
                      label={user.district}
                      size="small"
                      sx={{
                        bgcolor: '#eff6ff',
                        color: '#1e40af',
                        fontWeight: 600,
                        border: '1px solid #bfdbfe',
                      }}
                    />
                  )}
                </Stack>
              </Box>

              <Divider />

              {/* Account Info */}
              <Box sx={{ p: 3 }}>
                <Typography
                  variant="caption"
                  fontWeight={700}
                  color="text.secondary"
                  textTransform="uppercase"
                  letterSpacing={0.5}
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}
                >
                  <SecurityIcon sx={{ fontSize: 14 }} />
                  Account Information
                </Typography>

                <Stack spacing={2.5}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: '#f0fdf4',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <BadgeIcon sx={{ fontSize: 20, color: '#15803d' }} />
                    </Box>
                    <Box flex={1} minWidth={0}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        User ID
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: '0.8rem',
                          color: '#0f172a',
                          wordBreak: 'break-all',
                          lineHeight: 1.4,
                        }}
                      >
                        {user?.user_id || (user as any)?.id || (user as any)?.userId || '—'}
                      </Typography>
                    </Box>
                  </Stack>

                  {user?.created_at && (
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          bgcolor: '#eff6ff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <CalendarIcon sx={{ fontSize: 20, color: '#1e40af' }} />
                      </Box>
                      <Box flex={1}>
                        <Typography variant="caption" color="text.secondary">
                          Member Since
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {new Date(user.created_at).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </Typography>
                      </Box>
                    </Stack>
                  )}

                  {user?.last_login && (
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          bgcolor: '#fef3c7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <TimeIcon sx={{ fontSize: 20, color: '#92400e' }} />
                      </Box>
                      <Box flex={1}>
                        <Typography variant="caption" color="text.secondary">
                          Last Login
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {new Date(user.last_login).toLocaleString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Typography>
                      </Box>
                    </Stack>
                  )}
                </Stack>
              </Box>
            </Card>
          </Grid>

          {/* Right Column - Edit Form */}
          <Grid item xs={12} md={8}>
            <Card
              elevation={0}
              sx={{
                border: '1px solid #e5e7eb',
                borderRadius: 3,
                p: { xs: 2, sm: 3, md: 4 },
                position: 'relative',
              }}
            >
              {!editing && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: { xs: 16, sm: 24, md: 32 },
                    right: { xs: 16, sm: 24, md: 32 },
                    zIndex: 1,
                  }}
                >
                  <Button
                    startIcon={<EditIcon />}
                    onClick={() => setEditing(true)}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      color: '#0d9488',
                      bgcolor: '#f0fdfa',
                      px: 3,
                      py: 1,
                      borderRadius: 2,
                      whiteSpace: 'nowrap',
                      '&:hover': { bgcolor: '#ccfbf1' },
                    }}
                  >
                    Edit Profile
                  </Button>
                </Box>
              )}

              <Box sx={{ mb: 3, pr: { xs: 0, sm: 14 } }}>
                <Typography variant="h6" fontWeight={700} color="#0f172a" sx={{ mb: 0.5 }}>
                  Personal Information
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Update your personal details and contact information
                </Typography>
              </Box>

              <Divider sx={{ mb: 4 }} />

              {editing ? (
                <Stack spacing={3}>
                  <Box>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color="#374151"
                      mb={1.5}
                    >
                      Full Name
                    </Typography>
                    <TextField
                      fullWidth
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Enter your full name"
                      InputProps={{
                        startAdornment: (
                          <PersonIcon sx={{ mr: 1.5, color: '#9ca3af', fontSize: 20 }} />
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          bgcolor: '#f9fafb',
                          '& fieldset': { borderColor: '#e5e7eb' },
                          '&:hover fieldset': { borderColor: '#0d9488' },
                          '&.Mui-focused fieldset': {
                            borderColor: '#0d9488',
                            borderWidth: 2,
                          },
                        },
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color="#374151"
                      mb={1.5}
                    >
                      Email Address
                    </Typography>
                    <TextField
                      fullWidth
                      value={user?.email ?? ''}
                      disabled
                      InputProps={{
                        startAdornment: (
                          <EmailIcon sx={{ mr: 1.5, color: '#9ca3af', fontSize: 20 }} />
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          bgcolor: '#f3f4f6',
                          '& fieldset': { borderColor: '#e5e7eb' },
                        },
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                      Email cannot be changed for security reasons
                    </Typography>
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="#374151"
                        mb={1.5}
                      >
                        Phone Number
                      </Typography>
                      <TextField
                        fullWidth
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="Enter your phone number"
                        InputProps={{
                          startAdornment: (
                            <PhoneIcon sx={{ mr: 1.5, color: '#9ca3af', fontSize: 20 }} />
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: '#f9fafb',
                            '& fieldset': { borderColor: '#e5e7eb' },
                            '&:hover fieldset': { borderColor: '#0d9488' },
                            '&.Mui-focused fieldset': {
                              borderColor: '#0d9488',
                              borderWidth: 2,
                            },
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="#374151"
                        mb={1.5}
                      >
                        District
                      </Typography>
                      <TextField
                        fullWidth
                        value={form.district}
                        onChange={(e) => setForm({ ...form, district: e.target.value })}
                        placeholder="Enter your district"
                        InputProps={{
                          startAdornment: (
                            <LocationIcon sx={{ mr: 1.5, color: '#9ca3af', fontSize: 20 }} />
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: '#f9fafb',
                            '& fieldset': { borderColor: '#e5e7eb' },
                            '&:hover fieldset': { borderColor: '#0d9488' },
                            '&.Mui-focused fieldset': {
                              borderColor: '#0d9488',
                              borderWidth: 2,
                            },
                          },
                        }}
                      />
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="contained"
                      startIcon={
                        saving ? (
                          <CircularProgress size={16} sx={{ color: 'white' }} />
                        ) : (
                          <SaveIcon />
                        )
                      }
                      onClick={handleSave}
                      disabled={saving}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: 2,
                        px: 4,
                        py: 1.2,
                        bgcolor: '#0d9488',
                        '&:hover': { bgcolor: '#0f766e' },
                      }}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: 2,
                        px: 4,
                        py: 1.2,
                        borderColor: '#e5e7eb',
                        color: '#6b7280',
                        '&:hover': {
                          borderColor: '#d1d5db',
                          bgcolor: '#f9fafb',
                        },
                      }}
                    >
                      Cancel
                    </Button>
                  </Stack>
                </Stack>
              ) : (
                <Stack spacing={3}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      bgcolor: '#f9fafb',
                      borderRadius: 2,
                      border: '1px solid #e5e7eb',
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          bgcolor: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <PersonIcon sx={{ color: '#0d9488', fontSize: 24 }} />
                      </Box>
                      <Box flex={1}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Full Name
                        </Typography>
                        <Typography variant="body1" fontWeight={600} color="#0f172a">
                          {user?.name ?? '—'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>

                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      bgcolor: '#f9fafb',
                      borderRadius: 2,
                      border: '1px solid #e5e7eb',
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          bgcolor: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <EmailIcon sx={{ color: '#0d9488', fontSize: 24 }} />
                      </Box>
                      <Box flex={1}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Email Address
                        </Typography>
                        <Typography variant="body1" fontWeight={600} color="#0f172a">
                          {user?.email ?? '—'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          bgcolor: '#f9fafb',
                          borderRadius: 2,
                          border: '1px solid #e5e7eb',
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: 2,
                              bgcolor: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <PhoneIcon sx={{ color: '#0d9488', fontSize: 24 }} />
                          </Box>
                          <Box flex={1}>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Phone Number
                            </Typography>
                            <Typography variant="body1" fontWeight={600} color="#0f172a">
                              {user?.phone ?? '—'}
                            </Typography>
                          </Box>
                        </Stack>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          bgcolor: '#f9fafb',
                          borderRadius: 2,
                          border: '1px solid #e5e7eb',
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: 2,
                              bgcolor: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <LocationIcon sx={{ color: '#0d9488', fontSize: 24 }} />
                          </Box>
                          <Box flex={1}>
                            <Typography variant="caption" color="text.secondary" display="block">
                              District
                            </Typography>
                            <Typography variant="body1" fontWeight={600} color="#0f172a">
                              {user?.district ?? '—'}
                            </Typography>
                          </Box>
                        </Stack>
                      </Paper>
                    </Grid>
                  </Grid>
                </Stack>
              )}
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutConfirm}
        onClose={() => setLogoutConfirm(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Sign Out?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to sign out? You will be redirected to the login page.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setLogoutConfirm(false)}
            sx={{ textTransform: 'none', fontWeight: 600, color: '#6b7280' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleLogout}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
            }}
          >
            Sign Out
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;
