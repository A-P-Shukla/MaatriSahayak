import React, { useState } from 'react';
import {
  Box, Typography, TextField, Button, Alert,
  InputAdornment, CircularProgress, IconButton,
} from '@mui/material';
import {
  EmailOutlined, LockOutlined, KeyOutlined,
  FavoriteOutlined, VerifiedOutlined, TrendingUpOutlined,
} from '@mui/icons-material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { forgotPassword, confirmForgotPassword } from '../services/auth';
import logo from '../assets/logo.png';

const C = {
  purple:      '#2D0A4E',
  purpleMid:   '#4A1272',
  purpleLight: '#6B2FA0',
  roseDark:    '#A0294A',
  rose:        '#C0395B',
  roseLight:   '#E05578',
  pink:        '#F9A8D4',
  bgForm:      '#F8F4FF',
  cardBg:      '#FFFFFF',
  textDark:    '#1A0A2E',
  textMid:     '#5C3A7A',
  textLight:   '#9580AA',
  border:      'rgba(160,41,74,0.14)',
};

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

const StatCard = ({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) => (
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

type Step = 'request' | 'confirm' | 'done';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await forgotPassword(email);
      setStep('confirm');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await confirmForgotPassword(email, code, newPassword);
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif' }}>

      {/* LEFT BRAND PANEL */}
      <Box sx={{
        width: { lg: '42%' },
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: '48px 44px',
        background: `linear-gradient(160deg, ${C.purple} 0%, ${C.purpleMid} 50%, ${C.purpleLight} 100%)`,
        position: 'relative',
        overflow: 'hidden',
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 6 }}>
            <Box sx={{
              width: 62, height: 62, borderRadius: '14px', bgcolor: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              p: '7px', flexShrink: 0,
              boxShadow: '0 8px 24px rgba(0,0,0,0.3), 0 0 0 3px rgba(255,255,255,0.15)',
            }}>
              <Box component="img" src={logo} alt="MaatriSahayak" sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
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

          <Typography sx={{ fontSize: '1.18rem', fontWeight: 400, color: '#E9D5FF', lineHeight: 1.75, mb: 5, maxWidth: 360 }}>
            Reset your password securely. A{' '}
            <Box component="span" sx={{ color: C.pink, fontWeight: 600 }}>verification code</Box>{' '}
            will be sent to your registered email address.
          </Typography>

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <StatCard icon={<FavoriteOutlined sx={{ fontSize: 24 }} />} value="15,000+" label="Mothers Covered" />
            <StatCard icon={<VerifiedOutlined sx={{ fontSize: 24 }} />} value="500+" label="ASHA Workers" />
            <StatCard icon={<TrendingUpOutlined sx={{ fontSize: 24 }} />} value="45+" label="Districts" />
          </Box>
        </Box>
        <Typography sx={{ fontSize: '0.72rem', color: 'rgba(249,168,212,0.55)', position: 'relative', zIndex: 1 }}>
          © {new Date().getFullYear()} MaatriSahayak · National Health Mission India
        </Typography>
      </Box>

      {/* RIGHT FORM PANEL */}
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
            sx={{ width: 64, height: 64, objectFit: 'contain', borderRadius: '14px', mb: 1.5,
                  bgcolor: '#fff', p: '7px', boxShadow: '0 4px 12px rgba(45,10,78,0.25)' }} />
          <Typography sx={{ fontWeight: 900, fontSize: '1.2rem', color: C.purple }}>
            Maatri<Box component="span" sx={{ color: C.rose }}>Sahayak</Box>
          </Typography>
        </Box>

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

          {/* Step indicator */}
          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            {(['request', 'confirm', 'done'] as Step[]).map((s, i) => (
              <Box key={s} sx={{
                flex: 1, height: 3, borderRadius: 2,
                bgcolor: step === s || (step === 'confirm' && i === 0) || (step === 'done')
                  ? C.rose : 'rgba(160,41,74,0.15)',
                transition: 'background 0.3s',
              }} />
            ))}
          </Box>

          {/* STEP 1 — Request code */}
          {step === 'request' && (
            <>
              <Box sx={{ mb: 4 }}>
                <Box sx={{ width: 48, height: 48, borderRadius: '12px', bgcolor: 'rgba(192,57,91,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <KeyOutlined sx={{ color: C.rose, fontSize: 24 }} />
                </Box>
                <Typography sx={{ fontSize: { xs: '1.7rem', sm: '2rem' }, fontWeight: 800, color: C.textDark, letterSpacing: '-0.4px', lineHeight: 1.2, mb: 0.7 }}>
                  Forgot Password?
                </Typography>
                <Typography sx={{ fontSize: '0.92rem', color: C.textMid }}>
                  Enter your email and we'll send a{' '}
                  <Box component="span" sx={{ color: C.rose, fontWeight: 600 }}>verification code</Box>.
                </Typography>
              </Box>

              {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px', fontSize: '0.88rem' }}>{error}</Alert>}

              <form onSubmit={handleRequestCode}>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: C.textDark, mb: 0.8 }}>Email Address</Typography>
                <TextField fullWidth type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required disabled={isLoading}
                  placeholder="you@example.com"
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><EmailOutlined sx={{ color: C.rose, fontSize: 20 }} /></InputAdornment>,
                  }}
                  sx={{ ...fldSx, mb: 3.5 }} />

                <Button type="submit" fullWidth variant="contained" disabled={isLoading}
                  sx={{
                    py: '13px', fontSize: '0.95rem', fontWeight: 700,
                    borderRadius: '10px', textTransform: 'none', letterSpacing: 0.3,
                    background: `linear-gradient(135deg, ${C.roseDark} 0%, ${C.rose} 55%, ${C.roseLight} 100%)`,
                    boxShadow: `0 4px 14px rgba(192,57,91,0.4)`,
                    mb: 2,
                    '&:hover': { background: `linear-gradient(135deg, #881E3C 0%, ${C.roseDark} 100%)`, boxShadow: `0 8px 22px rgba(192,57,91,0.5)`, transform: 'translateY(-1px)' },
                    '&:disabled': { background: '#E9E0F0', color: '#B0A0C0' },
                    transition: 'all 0.25s ease',
                  }}>
                  {isLoading ? <><CircularProgress size={16} sx={{ color: '#fff', mr: 1 }} /> Sending…</> : 'Send Reset Code'}
                </Button>
              </form>
            </>
          )}

          {/* STEP 2 — Enter code + new password */}
          {step === 'confirm' && (
            <>
              <Box sx={{ mb: 4 }}>
                <Box sx={{ width: 48, height: 48, borderRadius: '12px', bgcolor: 'rgba(192,57,91,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <EmailOutlined sx={{ color: C.rose, fontSize: 24 }} />
                </Box>
                <Typography sx={{ fontSize: { xs: '1.7rem', sm: '2rem' }, fontWeight: 800, color: C.textDark, letterSpacing: '-0.4px', lineHeight: 1.2, mb: 0.7 }}>
                  Check Your Email
                </Typography>
                <Typography sx={{ fontSize: '0.92rem', color: C.textMid }}>
                  We sent a 6-digit code to{' '}
                  <Box component="span" sx={{ color: C.rose, fontWeight: 600 }}>{email}</Box>.
                  Enter it below along with your new password.
                </Typography>
              </Box>

              {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px', fontSize: '0.88rem' }}>{error}</Alert>}

              <form onSubmit={handleConfirm}>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: C.textDark, mb: 0.8 }}>Verification Code</Typography>
                <TextField fullWidth value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required disabled={isLoading}
                  placeholder="123456"
                  inputProps={{ maxLength: 6, style: { letterSpacing: '0.4em', fontSize: '1.2rem', textAlign: 'center' } }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><KeyOutlined sx={{ color: C.rose, fontSize: 20 }} /></InputAdornment>,
                  }}
                  sx={{ ...fldSx, mb: 2.5 }} />

                <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: C.textDark, mb: 0.8 }}>New Password</Typography>
                <TextField fullWidth type={showPw ? 'text' : 'password'} value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required disabled={isLoading}
                  placeholder="Min. 8 characters"
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

                <Button type="submit" fullWidth variant="contained" disabled={isLoading || code.length < 6}
                  sx={{
                    py: '13px', fontSize: '0.95rem', fontWeight: 700,
                    borderRadius: '10px', textTransform: 'none', letterSpacing: 0.3,
                    background: `linear-gradient(135deg, ${C.roseDark} 0%, ${C.rose} 55%, ${C.roseLight} 100%)`,
                    boxShadow: `0 4px 14px rgba(192,57,91,0.4)`,
                    mb: 2,
                    '&:hover': { background: `linear-gradient(135deg, #881E3C 0%, ${C.roseDark} 100%)`, boxShadow: `0 8px 22px rgba(192,57,91,0.5)`, transform: 'translateY(-1px)' },
                    '&:disabled': { background: '#E9E0F0', color: '#B0A0C0' },
                    transition: 'all 0.25s ease',
                  }}>
                  {isLoading ? <><CircularProgress size={16} sx={{ color: '#fff', mr: 1 }} /> Resetting…</> : 'Reset Password'}
                </Button>
              </form>

              <Button fullWidth variant="text" onClick={() => { setStep('request'); setError(null); }}
                sx={{ fontSize: '0.85rem', color: C.textMid, textTransform: 'none', '&:hover': { color: C.rose } }}>
                ← Resend code
              </Button>
            </>
          )}

          {/* STEP 3 — Success */}
          {step === 'done' && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Box sx={{
                width: 72, height: 72, borderRadius: '50%',
                bgcolor: 'rgba(27,107,74,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                mx: 'auto', mb: 3,
              }}>
                <VerifiedOutlined sx={{ color: '#1B6B4A', fontSize: 36 }} />
              </Box>
              <Typography sx={{ fontSize: '1.8rem', fontWeight: 800, color: C.textDark, mb: 1 }}>
                Password Reset!
              </Typography>
              <Typography sx={{ fontSize: '0.92rem', color: C.textMid, mb: 4 }}>
                Your password has been updated successfully. You can now sign in with your new password.
              </Typography>
              <Button fullWidth variant="contained"
                onClick={() => navigate('/login', { replace: true })}
                sx={{
                  py: '13px', fontSize: '0.95rem', fontWeight: 700,
                  borderRadius: '10px', textTransform: 'none',
                  background: `linear-gradient(135deg, ${C.roseDark} 0%, ${C.rose} 55%, ${C.roseLight} 100%)`,
                  boxShadow: `0 4px 14px rgba(192,57,91,0.4)`,
                  '&:hover': { background: `linear-gradient(135deg, #881E3C 0%, ${C.roseDark} 100%)` },
                }}>
                Back to Sign In
              </Button>
            </Box>
          )}

          {/* Back to login link (steps 1 & 2) */}
          {step !== 'done' && (
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography
                component="button" type="button"
                onClick={() => navigate('/login')}
                sx={{ fontSize: '0.82rem', color: C.textMid, background: 'none', border: 'none', cursor: 'pointer', '&:hover': { color: C.rose, textDecoration: 'underline' } }}>
                ← Back to Sign In
              </Typography>
            </Box>
          )}

          <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid rgba(160,41,74,0.08)', textAlign: 'center' }}>
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

export default ForgotPassword;
