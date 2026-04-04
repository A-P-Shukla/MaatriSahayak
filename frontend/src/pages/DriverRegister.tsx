import React, { useState } from 'react';
import {
  Box, Typography, TextField, Button, Alert,
  InputAdornment, IconButton, Stack, Divider,
  LinearProgress, CircularProgress,
} from '@mui/material';
import {
  Visibility, VisibilityOff, EmailOutlined, LockOutlined,
  PersonOutlined, PhoneOutlined, BadgeOutlined,
  DirectionsCarOutlined, LocalPhoneOutlined,
  CheckCircleOutline,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { registerDriver } from '../services/driver';

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
    fontSize: '0.93rem',
    '& fieldset': { borderColor: 'rgba(180,180,200,0.5)', borderWidth: 1.5 },
    '&:hover fieldset': { borderColor: C.rose },
    '&.Mui-focused fieldset': { borderColor: C.rose, borderWidth: 2 },
  },
  '& .MuiInputLabel-root': { fontSize: '0.88rem', color: C.textMid },
  '& .MuiInputLabel-root.Mui-focused': { color: C.rose },
};

const pwScore = (pw: string) => {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
};
const SW_LABEL = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const SW_COLOR = ['#e0e0e0', '#ef4444', '#f97316', '#eab308', '#22c55e'];

const DriverRegister: React.FC = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    license_number: '',
    ambulance_id: '',
    emergency_contact: '',
    password: '',
    confirmPassword: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [f]: e.target.value });
    setError(null);
  };

  const validate = () => {
    if (!form.name.trim()) return 'Full name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Enter a valid email address';
    if (!/^\d{10}$/.test(form.phone)) return 'Enter a valid 10-digit mobile number';
    if (!form.license_number.trim()) return 'License number is required';
    if (!form.ambulance_id.trim()) return 'Ambulance ID is required';
    if (form.emergency_contact && !/^\d{10}$/.test(form.emergency_contact)) {
      return 'Emergency contact must be a valid 10-digit number';
    }
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
    setError(null);
    setIsLoading(true);
    try {
      await registerDriver({
        name: form.name,
        email: form.email,
        phone: `+91${form.phone}`,
        password: form.password,
        license_number: form.license_number,
        ambulance_id: form.ambulance_id,
        emergency_contact: form.emergency_contact ? `+91${form.emergency_contact}` : undefined,
      });
      setSuccess(true);
      setTimeout(() => navigate('/driver/login'), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const strength = pwScore(form.password);

  if (success) {
    return (
      <Box sx={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `linear-gradient(155deg, ${C.purple} 0%, ${C.purpleMid} 50%, ${C.purpleLight} 100%)`,
        p: 3,
      }}>
        <Box sx={{
          p: { xs: 4, sm: 6 }, textAlign: 'center', borderRadius: '20px',
          maxWidth: 420, width: '100%',
          background: 'rgba(255,255,255,0.97)',
          boxShadow: '0 24px 60px rgba(45,10,78,0.3)',
          border: '1px solid rgba(192,57,91,0.1)',
        }}>
          <Box sx={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(192,57,91,0.12) 0%, rgba(45,10,78,0.08) 100%)',
            border: '2px solid rgba(192,57,91,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            mx: 'auto', mb: 2.5,
          }}>
            <CheckCircleOutline sx={{ fontSize: 36, color: C.rose }} />
          </Box>
          <Typography sx={{ fontSize: '1.35rem', fontWeight: 800, color: C.purple, mb: 1 }}>
            Registration Submitted
          </Typography>
          <Typography sx={{ color: C.textMid, fontSize: '0.9rem', lineHeight: 1.6, mb: 3 }}>
            Your driver profile has been submitted for approval. You will receive a confirmation email shortly.
          </Typography>
          <LinearProgress sx={{
            borderRadius: 4, height: 3,
            bgcolor: 'rgba(192,57,91,0.1)',
            '& .MuiLinearProgress-bar': { background: `linear-gradient(90deg, ${C.roseDark}, ${C.rose})` },
          }} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', fontFamily: '"Inter","Segoe UI",system-ui,sans-serif' }}>
      {/* LEFT SIDEBAR */}
      <Box sx={{
        width: 340,
        display: { xs: 'none', xl: 'flex' },
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: '44px 36px',
        background: `linear-gradient(160deg, ${C.purple} 0%, ${C.purpleMid} 50%, ${C.purpleLight} 100%)`,
        position: 'sticky', top: 0, height: '100vh', overflow: 'hidden',
        '&::before': {
          content: '""', position: 'absolute',
          top: '-80px', right: '-80px',
          width: 320, height: 320, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(192,57,91,0.2) 0%, transparent 65%)',
        },
      }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8, mb: 5 }}>
            <Box component="img" src={logo} alt="MaatriSahayak"
              sx={{ width: 54, height: 54, objectFit: 'contain', borderRadius: '12px',
                    filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.4))' }} />
            <Box>
              <Typography sx={{ fontSize: '1.35rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.3px', lineHeight: 1.1 }}>
                Maatri<Box component="span" sx={{ color: C.pink }}>Sahayak</Box>
              </Typography>
              <Typography sx={{ fontSize: '0.58rem', letterSpacing: '2.2px', color: C.pink, textTransform: 'uppercase', fontWeight: 700 }}>
                Driver Registration
              </Typography>
            </Box>
          </Box>

          <Typography sx={{ fontSize: '0.9rem', color: '#E9D5FF', lineHeight: 1.75, fontStyle: 'italic', mb: 5, opacity: 0.9 }}>
            "Your role saves lives. Register to receive verified assignments."
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.5 }}>
            <DirectionsCarOutlined sx={{ color: C.pink }} />
            <Typography sx={{ fontSize: '0.82rem', color: 'rgba(243,232,255,0.85)' }}>
              Verified driver access
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <LocalPhoneOutlined sx={{ color: C.pink }} />
            <Typography sx={{ fontSize: '0.82rem', color: 'rgba(243,232,255,0.85)' }}>
              Emergency contact on file
            </Typography>
          </Box>
        </Box>

        <Typography sx={{ fontSize: '0.7rem', color: 'rgba(249,168,212,0.5)', position: 'relative', zIndex: 1 }}>
          National Health Mission · Government of India
        </Typography>
      </Box>

      {/* RIGHT FORM PANEL */}
      <Box sx={{
        flex: 1, background: C.bgForm,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'flex-start',
        py: { xs: 4, sm: 6 }, px: { xs: 2, sm: 4, md: 6 },
        position: 'relative',
        '&::before': {
          content: '""', position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 70% 20%, rgba(107,47,160,0.06) 0%, transparent 55%)',
          pointerEvents: 'none',
        },
      }}>
        <Box sx={{ display: { xs: 'flex', xl: 'none' }, flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Box component="img" src={logo} alt="MaatriSahayak"
            sx={{ width: 60, height: 60, objectFit: 'contain', borderRadius: '14px', mb: 1.5,
                  filter: 'drop-shadow(0 4px 12px rgba(45,10,78,0.35))' }} />
          <Typography sx={{ fontWeight: 900, fontSize: '1.15rem', color: C.purple }}>
            Maatri<Box component="span" sx={{ color: C.rose }}>Sahayak</Box>
          </Typography>
          <Typography sx={{ fontSize: '0.58rem', letterSpacing: '2px', textTransform: 'uppercase', color: C.textMid, fontWeight: 600 }}>
            Driver Registration
          </Typography>
        </Box>

        <Box sx={{
          width: '100%', maxWidth: 560,
          background: C.cardBg,
          borderRadius: '20px',
          border: `1px solid ${C.border}`,
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07), 0 20px 50px rgba(45,10,78,0.1)',
          p: { xs: '28px 22px', sm: '40px 44px' },
          position: 'relative', zIndex: 1,
        }}>
          <Box sx={{ mb: 3.5 }}>
            <Typography sx={{ fontSize: { xs: '1.6rem', sm: '1.9rem' }, fontWeight: 800, color: C.textDark, letterSpacing: '-0.4px', lineHeight: 1.2, mb: 0.5 }}>
              Driver Registration
            </Typography>
            <Typography sx={{ fontSize: '0.9rem', color: C.textMid }}>
              Submit your details to get verified.
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px', fontSize: '0.88rem' }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <TextField fullWidth label="Full Name" value={form.name}
                onChange={set('name')} required disabled={isLoading}
                placeholder="e.g. Rajesh Kumar"
                InputProps={{ startAdornment: <InputAdornment position="start"><PersonOutlined sx={{ color: C.rose, fontSize: 19 }} /></InputAdornment> }}
                sx={fldSx} />

              <TextField fullWidth label="Email Address" type="email" value={form.email}
                onChange={set('email')} required disabled={isLoading}
                placeholder="driver@example.com"
                InputProps={{ startAdornment: <InputAdornment position="start"><EmailOutlined sx={{ color: C.rose, fontSize: 19 }} /></InputAdornment> }}
                sx={fldSx} />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField fullWidth label="Mobile Number" type="tel" value={form.phone}
                  onChange={set('phone')} required disabled={isLoading}
                  placeholder="10-digit number"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                          <PhoneOutlined sx={{ color: C.rose, fontSize: 19 }} />
                          <Typography sx={{ fontSize: '0.82rem', color: C.textMid, fontWeight: 600, borderRight: '1px solid #ddd', pr: 0.8 }}>+91</Typography>
                        </Box>
                      </InputAdornment>
                    ),
                  }}
                  sx={fldSx} />
                <TextField fullWidth label="Emergency Contact" type="tel" value={form.emergency_contact}
                  onChange={set('emergency_contact')} disabled={isLoading}
                  placeholder="Optional 10-digit"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                          <LocalPhoneOutlined sx={{ color: C.rose, fontSize: 19 }} />
                          <Typography sx={{ fontSize: '0.82rem', color: C.textMid, fontWeight: 600, borderRight: '1px solid #ddd', pr: 0.8 }}>+91</Typography>
                        </Box>
                      </InputAdornment>
                    ),
                  }}
                  sx={fldSx} />
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField fullWidth label="License Number" value={form.license_number}
                  onChange={set('license_number')} required disabled={isLoading}
                  placeholder="e.g. UP3220210012345"
                  InputProps={{ startAdornment: <InputAdornment position="start"><BadgeOutlined sx={{ color: C.rose, fontSize: 19 }} /></InputAdornment> }}
                  sx={fldSx} />
                <TextField fullWidth label="Ambulance ID" value={form.ambulance_id}
                  onChange={set('ambulance_id')} required disabled={isLoading}
                  placeholder="e.g. amb_12345"
                  InputProps={{ startAdornment: <InputAdornment position="start"><DirectionsCarOutlined sx={{ color: C.rose, fontSize: 19 }} /></InputAdornment> }}
                  sx={fldSx} />
              </Stack>

              <TextField fullWidth label="Password" type={showPw ? 'text' : 'password'}
                value={form.password} onChange={set('password')}
                required disabled={isLoading}
                placeholder="Min 8 chars, uppercase, number, symbol"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LockOutlined sx={{ color: C.rose, fontSize: 19 }} /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPw(p => !p)} edge="end" disabled={isLoading} size="small">
                        {showPw ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={fldSx} />

              {form.password && (
                <Box sx={{ mt: 0.5, px: 0.5 }}>
                  <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
                    {[1,2,3,4].map(n => (
                      <Box key={n} sx={{
                        flex: 1, height: 3, borderRadius: 2,
                        bgcolor: n <= strength ? SW_COLOR[strength] : 'rgba(0,0,0,0.08)',
                        transition: 'background-color 0.3s',
                      }} />
                    ))}
                  </Box>
                  <Typography sx={{ fontSize: '0.7rem', color: SW_COLOR[strength], fontWeight: 600 }}>
                    {SW_LABEL[strength]} password
                  </Typography>
                </Box>
              )}

              <TextField fullWidth label="Confirm Password" type={showCPw ? 'text' : 'password'}
                value={form.confirmPassword} onChange={set('confirmPassword')}
                required disabled={isLoading}
                placeholder="Re-enter your password"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LockOutlined sx={{ color: C.rose, fontSize: 19 }} /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowCPw(p => !p)} edge="end" disabled={isLoading} size="small">
                        {showCPw ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={fldSx} />

              <Button type="submit" fullWidth variant="contained" disabled={isLoading}
                sx={{
                  py: '13px', mt: 0.5,
                  fontSize: '0.95rem', fontWeight: 700,
                  borderRadius: '10px', textTransform: 'none', letterSpacing: 0.3,
                  background: `linear-gradient(135deg, ${C.roseDark} 0%, ${C.rose} 55%, ${C.roseLight} 100%)`,
                  boxShadow: `0 4px 14px rgba(192,57,91,0.4)`,
                  '&:hover': {
                    background: `linear-gradient(135deg, #881E3C 0%, ${C.roseDark} 100%)`,
                    boxShadow: `0 8px 22px rgba(192,57,91,0.5)`,
                    transform: 'translateY(-1px)',
                  },
                  '&:disabled': { background: '#E9E0F0', color: '#B0A0C0' },
                  transition: 'all 0.25s ease',
                }}>
                {isLoading
                  ? <><CircularProgress size={16} sx={{ color: '#fff', mr: 1 }} /> Creating Account...</>
                  : 'Create Driver Account'}
              </Button>
            </Stack>
          </form>

          <Divider sx={{ my: 3, '&::before,&::after': { borderColor: 'rgba(160,41,74,0.12)' } }}>
            <Typography sx={{ fontSize: '0.78rem', color: C.textLight, px: 1, fontWeight: 500 }}>Already have an account?</Typography>
          </Divider>

          <Button fullWidth variant="outlined"
            onClick={() => navigate('/driver/login')} disabled={isLoading}
            sx={{
              py: '12px', fontSize: '0.93rem', fontWeight: 600,
              borderRadius: '10px', textTransform: 'none',
              borderWidth: 1.5, borderColor: C.purple, color: C.purple,
              '&:hover': { borderColor: C.purpleLight, bgcolor: 'rgba(45,10,78,0.04)', transform: 'translateY(-1px)' },
              transition: 'all 0.25s ease',
            }}>
            Sign In as Driver
          </Button>

          <Button fullWidth variant="text"
            onClick={() => navigate('/role-select')}
            sx={{ mt: 2, textTransform: 'none', color: C.textMid }}>
            Back to role selection
          </Button>
        </Box>

        <Typography sx={{ mt: 3, fontSize: '0.7rem', color: C.textLight, position: 'relative', zIndex: 1 }}>
          © {new Date().getFullYear()} MaatriSahayak · All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default DriverRegister;
