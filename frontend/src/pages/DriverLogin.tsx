import React, { useState } from 'react';
import {
  Box, Typography, TextField, Button, Alert,
  InputAdornment, IconButton, CircularProgress, Divider,
} from '@mui/material';
import {
  Visibility, VisibilityOff, EmailOutlined, LockOutlined,
  LocalShipping as TruckIcon, ArrowBack as BackIcon,
} from '@mui/icons-material';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import logo from '../assets/logo.png';
import apiClient, { handleApiError } from '../services/api';
import { storeTokens, storeUser } from '../services/auth';

const C = {
  purple:      '#2D0A4E',
  purpleMid:   '#4A1272',
  purpleLight: '#6B2FA0',
  rose:        '#C0395B',
  pink:        '#F9A8D4',
  bgForm:      '#F8F4FF',
  border:      'rgba(107,47,160,0.18)',
  textDark:    '#1A0A2E',
  textMid:     '#5C3A7A',
  textLight:   '#9580AA',
};

const fldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px', backgroundColor: '#FAFAFA', fontSize: '0.95rem',
    '& fieldset': { borderColor: 'rgba(180,180,200,0.5)', borderWidth: 1.5 },
    '&:hover fieldset': { borderColor: C.purpleLight },
    '&.Mui-focused fieldset': { borderColor: C.purpleLight, borderWidth: 2 },
    '& input': { py: '13px' },
  },
  '& .MuiInputLabel-root': { fontSize: '0.88rem', color: C.textMid },
  '& .MuiInputLabel-root.Mui-focused': { color: C.purpleLight },
};

const DriverLogin: React.FC = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  if (authLoading) return null;
  if (isAuthenticated) return <Navigate to="/drivers" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      // Driver login uses same Cognito pool — role checked via custom:role = DRIVER
      const res = await apiClient.post<any>('/asha/login', { email, password });
      const data = res.data?.data;
      if (!data) throw new Error('Login failed');

      // Verify role
      if (data.user?.role && data.user.role !== 'DRIVER' && data.user.role !== 'driver') {
        throw new Error('This account is not registered as a driver. Please use ASHA login.');
      }

      storeTokens({ access_token: data.access_token, id_token: data.id_token, refresh_token: data.refresh_token, expires_in: data.expires_in, token_type: data.token_type });
      storeUser(data.user);
      navigate('/drivers', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex',
      fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
    }}>

      {/* Left Brand Panel */}
      <Box sx={{
        width: { lg: '42%' }, display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column', justifyContent: 'space-between',
        p: '48px 44px',
        background: `linear-gradient(160deg, ${C.purple} 0%, ${C.purpleMid} 50%, ${C.purpleLight} 100%)`,
        position: 'relative', overflow: 'hidden',
        '&::before': {
          content: '""', position: 'absolute', top: '-80px', right: '-80px',
          width: 380, height: 380, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(192,57,91,0.22) 0%, transparent 65%)',
          pointerEvents: 'none',
        },
        '&::after': {
          content: '""', position: 'absolute', bottom: '-100px', left: '-60px',
          width: 320, height: 320, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(107,47,160,0.3) 0%, transparent 70%)',
          pointerEvents: 'none',
        },
      }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {/* Brand */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 6 }}>
            <Box component="img" src={logo} alt="MaatriSahayak"
              sx={{ width: 62, height: 62, objectFit: 'contain', borderRadius: '14px', bgcolor: '#fff', p: '6px',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.3)' }} />
            <Box>
              <Typography sx={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.4px', lineHeight: 1.1 }}>
                Maatri<Box component="span" sx={{ color: C.pink }}>Sahayak</Box>
              </Typography>
              <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '2.5px', color: C.pink, textTransform: 'uppercase', mt: 0.3 }}>
                Emergency Response
              </Typography>
            </Box>
          </Box>

          {/* Driver icon */}
          <Box sx={{
            width: 100, height: 100, borderRadius: '24px', mb: 4,
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <TruckIcon sx={{ fontSize: 52, color: C.pink }} />
          </Box>

          <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', mb: 1.5, lineHeight: 1.3 }}>
            Ambulance Driver Portal
          </Typography>
          <Typography sx={{ fontSize: '0.95rem', color: 'rgba(243,232,255,0.8)', lineHeight: 1.75, mb: 4, maxWidth: 340 }}>
            Accept emergency dispatches, navigate to patients and complete life-saving rides across India.
          </Typography>

          {[
            '🚑 Real-time emergency dispatch',
            '🗺️ GPS navigation to patients',
            '✅ Ride completion tracking',
            '📊 Performance dashboard',
          ].map((t) => (
            <Box key={t} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.2 }}>
              <Typography sx={{ fontSize: '0.85rem', color: 'rgba(243,232,255,0.85)' }}>{t}</Typography>
            </Box>
          ))}
        </Box>

        <Typography sx={{ fontSize: '0.72rem', color: 'rgba(249,168,212,0.55)', position: 'relative', zIndex: 1 }}>
          © {new Date().getFullYear()} MaatriSahayak · National Health Mission India
        </Typography>
      </Box>

      {/* Right Form Panel */}
      <Box sx={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: C.bgForm, p: { xs: 3, sm: 5, lg: 6 },
        position: 'relative',
        '&::before': {
          content: '""', position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 70% 30%, rgba(107,47,160,0.06) 0%, transparent 60%)',
          pointerEvents: 'none',
        },
      }}>

        {/* Mobile logo */}
        <Box sx={{ display: { xs: 'flex', lg: 'none' }, flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Box component="img" src={logo} alt="MaatriSahayak"
            sx={{ width: 64, height: 64, objectFit: 'contain', borderRadius: '14px', mb: 1.5, bgcolor: '#fff', p: '6px',
                  boxShadow: '0 4px 12px rgba(45,10,78,0.25)' }} />
          <Typography sx={{ fontWeight: 900, fontSize: '1.2rem', color: C.purple }}>
            Maatri<Box component="span" sx={{ color: C.rose }}>Sahayak</Box>
          </Typography>
          <Typography sx={{ fontSize: '0.58rem', letterSpacing: '2px', textTransform: 'uppercase', color: C.textMid, fontWeight: 600 }}>
            Driver Portal
          </Typography>
        </Box>

        {/* Card */}
        <Box sx={{
          width: '100%', maxWidth: 460,
          background: '#fff', borderRadius: '20px',
          border: `1px solid ${C.border}`,
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07), 0 20px 50px rgba(45,10,78,0.1)',
          p: { xs: '28px 24px', sm: '40px 44px' },
          position: 'relative', zIndex: 1,
        }}>

          {/* Back to role select */}
          <Button startIcon={<BackIcon />} onClick={() => navigate('/role-select')}
            sx={{ mb: 2, color: C.textMid, fontWeight: 600, textTransform: 'none', fontSize: '0.82rem', p: 0, minWidth: 0, '&:hover': { bgcolor: 'transparent', color: C.purple } }}>
            Back to role selection
          </Button>

          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: '8px', bgcolor: C.purple, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TruckIcon sx={{ fontSize: 20, color: '#fff' }} />
              </Box>
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: C.purple }}>Driver Portal</Typography>
            </Box>
            <Typography sx={{ fontSize: { xs: '1.7rem', sm: '2rem' }, fontWeight: 800, color: C.textDark, letterSpacing: '-0.4px', lineHeight: 1.2, mb: 0.7 }}>
              Driver Sign In
            </Typography>
            <Typography sx={{ fontSize: '0.92rem', color: C.textMid }}>
              Access your{' '}
              <Box component="span" sx={{ color: C.purpleLight, fontWeight: 600 }}>emergency dispatch</Box>{' '}
              dashboard
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px', fontSize: '0.88rem' }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: C.textDark, mb: 0.8 }}>Email Address</Typography>
            <TextField fullWidth type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              required disabled={isLoading} placeholder="you@example.com"
              InputProps={{ startAdornment: <InputAdornment position="start"><EmailOutlined sx={{ color: C.purpleLight, fontSize: 20 }} /></InputAdornment> }}
              sx={{ ...fldSx, mb: 2.5 }} />

            <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: C.textDark, mb: 0.8 }}>Password</Typography>
            <TextField fullWidth type={showPw ? 'text' : 'password'} value={password}
              onChange={(e) => setPassword(e.target.value)}
              required disabled={isLoading} placeholder="Enter your password"
              InputProps={{
                startAdornment: <InputAdornment position="start"><LockOutlined sx={{ color: C.purpleLight, fontSize: 20 }} /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPw(p => !p)} edge="end" disabled={isLoading} size="small">
                      {showPw ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ ...fldSx, mb: 3.5 }} />

            <Button type="submit" fullWidth variant="contained" disabled={isLoading}
              sx={{
                py: '13px', fontSize: '0.95rem', fontWeight: 700,
                borderRadius: '10px', textTransform: 'none', letterSpacing: 0.3,
                background: `linear-gradient(135deg, ${C.purple} 0%, ${C.purpleMid} 55%, ${C.purpleLight} 100%)`,
                boxShadow: `0 4px 14px rgba(45,10,78,0.4)`, mb: 2,
                '&:hover': { background: `linear-gradient(135deg, #1e0635 0%, ${C.purple} 100%)`, boxShadow: `0 8px 22px rgba(45,10,78,0.5)`, transform: 'translateY(-1px)' },
                '&:disabled': { background: '#E9E0F0', color: '#B0A0C0' },
                transition: 'all 0.25s ease',
              }}>
              {isLoading ? <><CircularProgress size={16} sx={{ color: '#fff', mr: 1 }} />Signing in…</> : 'Sign In as Driver'}
            </Button>
          </form>

          <Divider sx={{ my: 3, '&::before,&::after': { borderColor: 'rgba(107,47,160,0.12)' } }}>
            <Typography sx={{ fontSize: '0.8rem', color: C.textLight, px: 1, fontWeight: 500 }}>New driver?</Typography>
          </Divider>

          <Button fullWidth variant="outlined"
            onClick={() => navigate('/drivers/register')} disabled={isLoading}
            sx={{
              py: '12px', fontSize: '0.93rem', fontWeight: 600,
              borderRadius: '10px', textTransform: 'none',
              borderWidth: 1.5, borderColor: C.purple, color: C.purple,
              '&:hover': { borderColor: C.purpleLight, bgcolor: 'rgba(45,10,78,0.04)', transform: 'translateY(-1px)' },
              transition: 'all 0.25s ease',
            }}>
            Register as Driver
          </Button>

          <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid rgba(107,47,160,0.08)', textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.7rem', color: C.textLight, display: 'block', mb: 0.4 }}>
              National Health Mission · Government of India
            </Typography>
            <Typography sx={{ fontSize: '0.68rem', color: 'rgba(150,130,170,0.6)' }}>
              This is a secure government portal. Unauthorized access is strictly prohibited.
            </Typography>
          </Box>
        </Box>

        <Typography sx={{ mt: 3, fontSize: '0.71rem', color: C.textLight, position: 'relative', zIndex: 1 }}>
          © {new Date().getFullYear()} MaatriSahayak · All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default DriverLogin;
