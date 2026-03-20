import React, { useState } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Alert,
  InputAdornment, IconButton, Container, Stack, Divider,
} from '@mui/material';
import {
  Visibility, VisibilityOff, EmailOutlined, LockOutlined,
  PersonOutlined, PhoneOutlined, DriveEta, LocalShipping,
  ContactPhone,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { registerDriver } from '../services/driver';

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2, backgroundColor: '#f8fafc', fontSize: '0.95rem',
    '& fieldset': { borderColor: '#e2e8f0', borderWidth: 1.5 },
    '&:hover fieldset': { borderColor: '#0d9488' },
    '&.Mui-focused fieldset': { borderColor: '#0d9488', borderWidth: 2 },
  },
  '& .MuiInputLabel-root': { fontSize: '0.9rem' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#0d9488' },
};

const DriverRegister: React.FC = () => {
  const [form, setForm] = useState({
    name: '', phone: '', email: '', password: '', confirmPassword: '',
    license_number: '', ambulance_id: '', emergency_contact: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [field]: e.target.value });
    setError(null);
  };

  const validate = () => {
    if (!form.name.trim()) return 'Name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Valid email is required';
    if (!/^\+?\d{10,13}$/.test(form.phone.replace(/\s/g, ''))) return 'Valid phone number is required';
    if (!form.license_number.trim()) return 'License number is required';
    if (!form.ambulance_id.trim()) return 'Ambulance ID is required';
    if (form.password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(form.password)) return 'Password must contain an uppercase letter';
    if (!/[0-9]/.test(form.password)) return 'Password must contain a number';
    if (!/[^A-Za-z0-9]/.test(form.password)) return 'Password must contain a special character';
    if (form.password !== form.confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setIsLoading(true);
    setError(null);
    try {
      await registerDriver({
        name: form.name,
        phone: form.phone.startsWith('+') ? form.phone : `+91${form.phone}`,
        email: form.email,
        password: form.password,
        license_number: form.license_number,
        ambulance_id: form.ambulance_id,
        emergency_contact: form.emergency_contact || undefined,
      });
      setSuccess(true);
      setTimeout(() => navigate('/drivers'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f0faf7' }}>
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px solid #d1fae5', maxWidth: 400, boxShadow: '0 8px 32px rgba(27,107,74,0.10)' }}>
          <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            <Typography sx={{ fontSize: 36 }}>✅</Typography>
          </Box>
          <Typography variant="h5" fontWeight={800} gutterBottom sx={{ color: '#1B6B4A' }}>Driver Registered!</Typography>
          <Typography variant="body2" color="text.secondary">Account created successfully. Redirecting to drivers list...</Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f0faf7', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 4, border: '1px solid #d1fae5', bgcolor: '#ffffff', boxShadow: '0 8px 40px rgba(27,107,74,0.12), 0 2px 8px rgba(13,148,136,0.08)' }}>

          {/* Header */}
          <Stack alignItems="center" spacing={1.5} sx={{ mb: 4 }}>
            <Box sx={{ width: 72, height: 72, borderRadius: '16px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(13,148,136,0.25), 0 0 0 3px #d1fae5', p: '6px' }}>
              <Box component="img" src={logo} alt="logo" sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={800} sx={{ color: '#0f172a', fontSize: { xs: '1.6rem', sm: '1.9rem' } }}>Register Driver</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Add a new ambulance driver · NHM India</Typography>
            </Box>
          </Stack>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Stack spacing={2.5}>

              <TextField fullWidth label="Full Name" value={form.name} onChange={set('name')} required disabled={isLoading}
                InputProps={{ startAdornment: <InputAdornment position="start"><PersonOutlined sx={{ color: '#0d9488' }} /></InputAdornment> }}
                sx={fieldSx} />

              <TextField fullWidth label="Email Address" type="email" value={form.email} onChange={set('email')} required disabled={isLoading}
                InputProps={{ startAdornment: <InputAdornment position="start"><EmailOutlined sx={{ color: '#0d9488' }} /></InputAdornment> }}
                sx={fieldSx} />

              <TextField fullWidth label="Phone Number" type="tel" value={form.phone} onChange={set('phone')} required disabled={isLoading}
                placeholder="+91XXXXXXXXXX"
                InputProps={{ startAdornment: <InputAdornment position="start"><PhoneOutlined sx={{ color: '#0d9488' }} /></InputAdornment> }}
                sx={fieldSx} />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField fullWidth label="License Number" value={form.license_number} onChange={set('license_number')} required disabled={isLoading}
                  placeholder="e.g. UP32-2021-0012345"
                  InputProps={{ startAdornment: <InputAdornment position="start"><DriveEta sx={{ color: '#0d9488' }} /></InputAdornment> }}
                  sx={fieldSx} />

                <TextField fullWidth label="Ambulance ID" value={form.ambulance_id} onChange={set('ambulance_id')} required disabled={isLoading}
                  placeholder="e.g. amb_001"
                  InputProps={{ startAdornment: <InputAdornment position="start"><LocalShipping sx={{ color: '#0d9488' }} /></InputAdornment> }}
                  sx={fieldSx} />
              </Stack>

              <TextField fullWidth label="Emergency Contact (optional)" value={form.emergency_contact} onChange={set('emergency_contact')} disabled={isLoading}
                placeholder="+91XXXXXXXXXX"
                InputProps={{ startAdornment: <InputAdornment position="start"><ContactPhone sx={{ color: '#0d9488' }} /></InputAdornment> }}
                sx={fieldSx} />

              <TextField fullWidth label="Password" type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')} required disabled={isLoading}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LockOutlined sx={{ color: '#0d9488' }} /></InputAdornment>,
                  endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPw(p => !p)} edge="end" disabled={isLoading}>{showPw ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>,
                }}
                sx={fieldSx} />

              <TextField fullWidth label="Confirm Password" type={showConfirmPw ? 'text' : 'password'} value={form.confirmPassword} onChange={set('confirmPassword')} required disabled={isLoading}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LockOutlined sx={{ color: '#0d9488' }} /></InputAdornment>,
                  endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowConfirmPw(p => !p)} edge="end" disabled={isLoading}>{showConfirmPw ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>,
                }}
                sx={fieldSx} />

              <Button type="submit" fullWidth variant="contained" size="large" disabled={isLoading}
                sx={{
                  py: 1.6, fontWeight: 700, borderRadius: 2, textTransform: 'none', fontSize: '1rem',
                  background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
                  boxShadow: '0 4px 14px rgba(13,148,136,0.3)',
                  '&:hover': { background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)', boxShadow: '0 6px 20px rgba(13,148,136,0.4)' },
                }}>
                {isLoading ? 'Registering...' : 'Register Driver'}
              </Button>
            </Stack>
          </form>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>Already registered?</Typography>
          </Divider>

          <Button fullWidth variant="outlined" size="large" onClick={() => navigate('/drivers')} disabled={isLoading}
            sx={{ py: 1.6, fontWeight: 700, borderRadius: 2, textTransform: 'none', fontSize: '1rem', borderColor: '#0d9488', borderWidth: 1.5, color: '#0d9488', '&:hover': { borderColor: '#0d9488', borderWidth: 1.5, bgcolor: 'rgba(13,148,136,0.05)' } }}>
            View All Drivers
          </Button>

          <Box sx={{ mt: 3, textAlign: 'center', pt: 2, borderTop: '1px solid #f0fdf4' }}>
            <Typography variant="caption" color="text.secondary" display="block" fontWeight={500}>National Health Mission · Government of India</Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.72rem' }}>© {new Date().getFullYear()} MaatriSahayak. All rights reserved.</Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default DriverRegister;
