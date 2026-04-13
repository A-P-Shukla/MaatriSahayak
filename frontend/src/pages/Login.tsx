import React, { useState } from 'react';
import {
  Box, Typography, TextField, Button, Alert,
  InputAdornment, IconButton, Divider, CircularProgress,
} from '@mui/material';
import {
  Visibility, VisibilityOff, EmailOutlined, LockOutlined,
  FavoriteOutlined, VerifiedOutlined, TrendingUpOutlined,
  PublicOutlined, SecurityOutlined,
  WorkspacePremiumOutlined,
} from '@mui/icons-material';
import { useAuth } from '@hooks/useAuth';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import logo from '../assets/logo.png';

/* ─── Design tokens (from Stitch) ──────────────────────────────────────── */
const C = {
  purple: '#2D0A4E',
  purpleMid: '#4A1272',
  purpleLight: '#6B2FA0',
  roseDark: '#A0294A',
  rose: '#C0395B',
  roseLight: '#E05578',
  pink: '#F9A8D4',
  bgForm: '#F8F4FF',
  cardBg: '#FFFFFF',
  textDark: '#1A0A2E',
  textMid: '#5C3A7A',
  textLight: '#9580AA',
  border: 'rgba(160,41,74,0.14)',
};

/* ─── Field style ───────────────────────────────────────────────────────── */
const fldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    backgroundColor: '#FAFAFA',
    fontSize: '0.95rem',
    '& fieldset': { borderColor: 'rgba(180,180,200,0.5)', borderWidth: 1.5 },
    '&:hover fieldset': { borderColor: C.rose },
    '&.Mui-focused fieldset': { borderColor: C.rose, borderWidth: 2 },
    '& input': { py: '13px' },
  },
  '& .MuiInputLabel-root': { fontSize: '0.88rem', color: C.textMid },
  '& .MuiInputLabel-root.Mui-focused': { color: C.rose },
};

/* ─── Frosted stat card ──────────────────────────────────────────────────── */
const StatCard = ({
  icon, value, label,
}: { icon: React.ReactNode; value: string; label: string }) => (
  <Box sx={{
    flex: 1, textAlign: 'center', py: 2, px: 1.5,
    borderRadius: '14px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.14)',
    backdropFilter: 'blur(10px)',
    transition: 'transform 0.2s',
    '&:hover': { transform: 'translateY(-3px)', background: 'rgba(255,255,255,0.13)' },
  }}>
    <Box sx={{ color: C.pink, mb: 0.6 }}>{icon}</Box>
    <Typography sx={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{value}</Typography>
    <Typography sx={{ fontSize: '0.65rem', color: C.pink, mt: 0.3, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</Typography>
  </Box>
);

/* ─── Trust row ──────────────────────────────────────────────────────────── */
const TrustRow = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1 }}>
    <Box sx={{ color: C.pink, display: 'flex', flexShrink: 0 }}>{icon}</Box>
    <Typography sx={{ fontSize: '0.82rem', color: 'rgba(243,232,255,0.85)', fontWeight: 400 }}>{text}</Typography>
  </Box>
);

/* ═══════════════════════════════════════════════════════════════════════════ */
const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { loginOfficer, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname;
  const authPages = ['/login', '/register', '/drivers/register'];
  const redirectTo = from && !authPages.includes(from) ? from : '/dashboard';

  if (authLoading) return null;
  if (isAuthenticated) return <Navigate to={redirectTo} replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      console.log('Attempting login with email:', email);
      await loginOfficer({ email, password });
      setTimeout(() => navigate(redirectTo, { replace: true }), 100);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
      console.error('Login error:', errorMsg);
      setError(errorMsg);
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
    }}>

      {/* ════════════════ LEFT BRAND PANEL ════════════════ */}
      <Box sx={{
        width: { lg: '42%' },
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: '48px 44px',
        background: `linear-gradient(160deg, ${C.purple} 0%, ${C.purpleMid} 50%, ${C.purpleLight} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        /* glow blobs */
        '&::before': {
          content: '""', position: 'absolute',
          top: '-80px', right: '-80px',
          width: 380, height: 380, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(192,57,91,0.22) 0%, transparent 65%)',
          pointerEvents: 'none',
        },
        '&::after': {
          content: '""', position: 'absolute',
          bottom: '-100px', left: '-60px',
          width: 320, height: 320, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(107,47,160,0.3) 0%, transparent 70%)',
          pointerEvents: 'none',
        },
      }}>
        {/* Top area */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {/* Brand */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 6 }}>
            <Box sx={{
              width: 62, height: 62, borderRadius: '14px', bgcolor: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              p: '7px', flexShrink: 0,
              boxShadow: '0 8px 24px rgba(0,0,0,0.3), 0 0 0 3px rgba(255,255,255,0.15)',
            }}>
              <Box component="img" src={logo} alt="MaatriSahayak"
                sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.4px', lineHeight: 1.1 }}>
                Maatri<Box component="span" sx={{ color: C.pink }}>Sahayak</Box>
              </Typography>
              <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '2.5px', color: C.pink, textTransform: 'uppercase', mt: 0.3 }}>
                District Officer Portal
              </Typography>
            </Box>
          </Box>

          {/* Tagline */}
          <Typography sx={{ fontSize: '1.18rem', fontWeight: 400, color: '#E9D5FF', lineHeight: 1.75, mb: 5, maxWidth: 360 }}>
            Approve <Box component="span" sx={{ color: C.pink, fontWeight: 600 }}>ASHA workers & drivers</Box>, monitor district health data and manage emergency response.
          </Typography>

          {/* Stat cards */}
          <Box sx={{ display: 'flex', gap: 1.5, mb: 5 }}>
            <StatCard icon={<FavoriteOutlined sx={{ fontSize: 24 }} />} value="15,000+" label="Mothers Covered" />
            <StatCard icon={<VerifiedOutlined sx={{ fontSize: 24 }} />} value="500+" label="ASHA Workers" />
            <StatCard icon={<TrendingUpOutlined sx={{ fontSize: 24 }} />} value="45+" label="Districts" />
          </Box>

          {/* Trusted platform card */}
          <Box sx={{
            p: '20px 22px',
            borderRadius: '16px',
            background: 'rgba(255,255,255,0.07)',
            border: `1px solid rgba(249,168,212,0.22)`,
            backdropFilter: 'blur(14px)',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.8 }}>
              <WorkspacePremiumOutlined sx={{ fontSize: 18, color: C.pink }} />
              <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#F3E8FF' }}>Trusted Platform</Typography>
            </Box>
            <TrustRow icon={<PublicOutlined sx={{ fontSize: 15 }} />} text="National Health Mission Initiative" />
            <TrustRow icon={<VerifiedOutlined sx={{ fontSize: 15 }} />} text="Government of India Certified" />
            <TrustRow icon={<SecurityOutlined sx={{ fontSize: 15 }} />} text="Secure & HIPAA Compliant" />
          </Box>
        </Box>

        {/* Bottom footer */}
        <Typography sx={{ fontSize: '0.72rem', color: 'rgba(249,168,212,0.55)', position: 'relative', zIndex: 1 }}>
          © {new Date().getFullYear()} MaatriSahayak · National Health Mission India
        </Typography>
      </Box>

      {/* ════════════════ RIGHT FORM PANEL ════════════════ */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: C.bgForm,
        p: { xs: 3, sm: 5, lg: 6 },
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
            sx={{
              width: 64, height: 64, objectFit: 'contain', borderRadius: '14px', mb: 1.5,
              bgcolor: '#fff', p: '7px', boxShadow: '0 4px 12px rgba(45,10,78,0.25)'
            }} />
          <Typography sx={{ fontWeight: 900, fontSize: '1.2rem', color: C.purple }}>
            Maatri<Box component="span" sx={{ color: C.rose }}>Sahayak</Box>
          </Typography>
          <Typography sx={{ fontSize: '0.58rem', letterSpacing: '2px', textTransform: 'uppercase', color: C.textMid, fontWeight: 600 }}>
            District Officer Portal
          </Typography>
        </Box>

        {/* Card */}
        <Box sx={{
          width: '100%', maxWidth: 460,
          background: C.cardBg,
          borderRadius: '20px',
          border: `1px solid ${C.border}`,
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07), 0 20px 50px rgba(45,10,78,0.1)',
          p: { xs: '28px 24px', sm: '40px 44px' },
          position: 'relative',
          zIndex: 1,
        }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            {/* Stitch-style logo mark at top of card (desktop) */}
            <Box sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Box sx={{
                width: 36, height: 36, borderRadius: '8px', bgcolor: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                p: '4px', boxShadow: '0 2px 8px rgba(45,10,78,0.2)',
              }}>
                <Box component="img" src={logo} alt="MaatriSahayak"
                  sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </Box>
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: C.purple }}>MaatriSahayak</Typography>
            </Box>

            <Typography sx={{ fontSize: { xs: '1.7rem', sm: '2rem' }, fontWeight: 800, color: C.textDark, letterSpacing: '-0.4px', lineHeight: 1.2, mb: 0.7 }}>
              Welcome Back
            </Typography>
            <Typography sx={{ fontSize: '0.92rem', color: C.textMid }}>
              Sign in to the{' '}
              <Box component="span" sx={{ color: C.rose, fontWeight: 600 }}>District Officer</Box>{' '}
              Dashboard
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '10px', fontSize: '0.88rem' }}>{error}</Alert>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: C.textDark, mb: 0.8 }}>Email Address</Typography>
            <TextField fullWidth type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              required disabled={isLoading}
              placeholder="you@example.com"
              InputProps={{
                startAdornment: <InputAdornment position="start"><EmailOutlined sx={{ color: C.rose, fontSize: 20 }} /></InputAdornment>,
              }}
              sx={{ ...fldSx, mb: 2.5 }} />

            {/* Password */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: C.textDark }}>Password</Typography>
              <Typography
                component="button" type="button"
                onClick={() => navigate('/forgot-password')}
                sx={{
                  fontSize: '0.78rem', color: C.rose, fontWeight: 500, cursor: 'pointer',
                  background: 'none', border: 'none', p: 0, '&:hover': { textDecoration: 'underline' }
                }}>
                Forgot Password?
              </Typography>
            </Box>
            <TextField fullWidth type={showPw ? 'text' : 'password'} value={password}
              onChange={(e) => setPassword(e.target.value)}
              required disabled={isLoading}
              placeholder="Enter your password"
              InputProps={{
                startAdornment: <InputAdornment position="start"><LockOutlined sx={{ color: C.rose, fontSize: 20 }} /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPw(p => !p)} edge="end" disabled={isLoading} size="small">
                      {showPw ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ ...fldSx, mb: 3.5 }} />

            {/* Sign In CTA */}
            <Button type="submit" fullWidth variant="contained" disabled={isLoading}
              sx={{
                py: '13px',
                fontSize: '0.95rem', fontWeight: 700,
                borderRadius: '10px', textTransform: 'none',
                letterSpacing: 0.3,
                background: `linear-gradient(135deg, ${C.roseDark} 0%, ${C.rose} 55%, ${C.roseLight} 100%)`,
                boxShadow: `0 4px 14px rgba(192,57,91,0.4)`,
                mb: 2,
                '&:hover': {
                  background: `linear-gradient(135deg, #881E3C 0%, ${C.roseDark} 100%)`,
                  boxShadow: `0 8px 22px rgba(192,57,91,0.5)`,
                  transform: 'translateY(-1px)',
                },
                '&:disabled': { background: '#E9E0F0', color: '#B0A0C0' },
                transition: 'all 0.25s ease',
              }}>
              {isLoading
                ? <><CircularProgress size={16} sx={{ color: '#fff', mr: 1 }} /> Signing in…</>
                : 'Sign In'}
            </Button>
          </form>

          <Divider sx={{ my: 3, '&::before,&::after': { borderColor: 'rgba(160,41,74,0.12)' } }}>
            <Typography sx={{ fontSize: '0.8rem', color: C.textLight, px: 1, fontWeight: 500 }}>New here?</Typography>
          </Divider>

          <Button fullWidth variant="outlined"
            onClick={() => navigate('/register')} disabled={isLoading}
            sx={{
              py: '12px', fontSize: '0.93rem', fontWeight: 600,
              borderRadius: '10px', textTransform: 'none',
              borderWidth: 1.5, borderColor: C.purple, color: C.purple,
              '&:hover': { borderColor: C.purpleLight, bgcolor: 'rgba(45,10,78,0.04)', transform: 'translateY(-1px)' },
              transition: 'all 0.25s ease',
            }}>
            Register as District Officer
          </Button>

          {/* Footer inside card */}
          <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid rgba(160,41,74,0.08)', textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.7rem', color: C.textLight, display: 'block', mb: 0.4 }}>
              National Health Mission · Government of India
            </Typography>
            <Typography sx={{ fontSize: '0.68rem', color: 'rgba(150,130,170,0.6)' }}>
              This is a secure government portal. Unauthorized access is strictly prohibited.
            </Typography>
          </Box>
        </Box>

        {/* Copyright below card */}
        <Typography sx={{ mt: 3, fontSize: '0.71rem', color: C.textLight, position: 'relative', zIndex: 1 }}>
          © {new Date().getFullYear()} MaatriSahayak · All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;
