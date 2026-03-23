import React, { useState } from 'react';
import {
  Box, Typography, TextField, Button, Alert,
  InputAdornment, IconButton, Stack, Divider,
  LinearProgress, CircularProgress,
} from '@mui/material';
import {
  Visibility, VisibilityOff, EmailOutlined, LockOutlined,
  PersonOutlined, PhoneOutlined, BadgeOutlined, LocationOnOutlined,
  CheckCircleOutline, CelebrationOutlined,
  SecurityOutlined, VerifiedOutlined, AdminPanelSettingsOutlined,
  DashboardOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { registerOfficer } from '../services/auth';

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

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <Typography sx={{
    fontSize: '0.68rem', fontWeight: 700, letterSpacing: '1.8px',
    textTransform: 'uppercase', color: C.textMid, mt: 0.5,
  }}>{children}</Typography>
);

const FeatureRow = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.8 }}>
    <Box sx={{
      width: 34, height: 34, flexShrink: 0, borderRadius: '9px',
      background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: C.pink,
    }}>{icon}</Box>
    <Typography sx={{ fontSize: '0.83rem', color: 'rgba(243,232,255,0.88)', fontWeight: 400 }}>{text}</Typography>
  </Box>
);

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

const OfficerRegister: React.FC = () => {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', district: '',
    designation: '', employee_id: '', password: '', confirmPassword: '',
  });
  const [showPw, setShowPw]   = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [f]: e.target.value });
    setError(null);
  };

  const validate = () => {
    if (!form.name.trim())                                        return 'Full name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))          return 'Enter a valid email address';
    if (!/^\d{10}$/.test(form.phone))                            return 'Enter a valid 10-digit mobile number';
    if (!form.district.trim())                                    return 'District is required';
    if (!form.designation.trim())                                 return 'Designation is required';
    if (!form.employee_id.trim())                                 return 'Employee ID is required';
    if (form.password.length < 8)                                 return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(form.password))                            return 'Password must contain an uppercase letter';
    if (!/[0-9]/.test(form.password))                            return 'Password must contain a number';
    if (!/[^A-Za-z0-9]/.test(form.password))                     return 'Password must contain a special character';
    if (form.password !== form.confirmPassword)                   return 'Passwords do not match';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError(null);
    setIsLoading(true);
    try {
      await registerOfficer({
        name: form.name,
        email: form.email,
        phone: `+91${form.phone}`,
        district: form.district,
        designation: form.designation,
        employee_id: form.employee_id,
        password: form.password,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
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
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
            <Typography sx={{ fontSize: '1.35rem', fontWeight: 800, color: C.purple }}>Registration Successful!</Typography>
            <CelebrationOutlined sx={{ fontSize: '1.3rem', color: C.rose }} />
          </Box>
          <Typography sx={{ color: C.textMid, fontSize: '0.9rem', lineHeight: 1.6, mb: 3 }}>
            Account created! Check your email to verify, then log in.
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
                District Officer Portal
              </Typography>
            </Box>
          </Box>

          <Typography sx={{ fontSize: '0.9rem', color: '#E9D5FF', lineHeight: 1.75, fontStyle: 'italic', mb: 5, opacity: 0.9 }}>
            "Manage and approve ASHA workers and ambulance drivers across your district."
          </Typography>

          <Box sx={{
            display: 'inline-flex', alignItems: 'center', gap: 1,
            px: 1.5, py: 0.8, borderRadius: '8px', mb: 4,
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.14)',
          }}>
            <VerifiedOutlined sx={{ fontSize: 14, color: C.pink }} />
            <Typography sx={{ fontSize: '0.72rem', color: C.pink, fontWeight: 600 }}>Official Government Portal</Typography>
          </Box>

          <FeatureRow icon={<AdminPanelSettingsOutlined sx={{ fontSize: 18 }} />} text="Approve ASHA & Driver registrations" />
          <FeatureRow icon={<DashboardOutlined sx={{ fontSize: 18 }} />} text="District-level health dashboard" />
          <FeatureRow icon={<SecurityOutlined sx={{ fontSize: 18 }} />} text="Secure role-based access" />
          <FeatureRow icon={<VerifiedOutlined sx={{ fontSize: 18 }} />} text="NHM government platform" />
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
        {/* Mobile logo */}
        <Box sx={{ display: { xs: 'flex', xl: 'none' }, flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Box component="img" src={logo} alt="MaatriSahayak"
            sx={{ width: 60, height: 60, objectFit: 'contain', borderRadius: '14px', mb: 1.5,
                  filter: 'drop-shadow(0 4px 12px rgba(45,10,78,0.35))' }} />
          <Typography sx={{ fontWeight: 900, fontSize: '1.15rem', color: C.purple }}>
            Maatri<Box component="span" sx={{ color: C.rose }}>Sahayak</Box>
          </Typography>
          <Typography sx={{ fontSize: '0.58rem', letterSpacing: '2px', textTransform: 'uppercase', color: C.textMid, fontWeight: 600 }}>
            District Officer Portal
          </Typography>
        </Box>

        {/* Card */}
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
            <Box sx={{ display: { xs: 'none', xl: 'flex' }, alignItems: 'center', gap: 1.5, mb: 2.5 }}>
              <Box component="img" src={logo} alt="MaatriSahayak"
                sx={{ width: 32, height: 32, objectFit: 'contain', borderRadius: '7px',
                      filter: 'drop-shadow(0 2px 6px rgba(45,10,78,0.3))' }} />
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: C.purple }}>MaatriSahayak</Typography>
            </Box>

            <Typography sx={{ fontSize: { xs: '1.6rem', sm: '1.9rem' }, fontWeight: 800, color: C.textDark, letterSpacing: '-0.4px', lineHeight: 1.2, mb: 0.5 }}>
              Officer Registration
            </Typography>
            <Typography sx={{ fontSize: '0.9rem', color: C.textMid }}>
              Register as a <Box component="span" sx={{ color: C.rose, fontWeight: 600 }}>District Officer</Box> · National Health Mission
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px', fontSize: '0.88rem' }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Stack spacing={2.5}>

              <SectionLabel>Personal Information</SectionLabel>

              <TextField fullWidth label="Full Name" value={form.name}
                onChange={set('name')} required disabled={isLoading}
                placeholder="e.g. Rajesh Kumar Singh"
                InputProps={{ startAdornment: <InputAdornment position="start"><PersonOutlined sx={{ color: C.rose, fontSize: 19 }} /></InputAdornment> }}
                sx={fldSx} />

              <TextField fullWidth label="Email Address" type="email" value={form.email}
                onChange={set('email')} required disabled={isLoading}
                placeholder="officer@gov.in or name@gmail.com"
                InputProps={{ startAdornment: <InputAdornment position="start"><EmailOutlined sx={{ color: C.rose, fontSize: 19 }} /></InputAdornment> }}
                sx={fldSx} />

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

              <SectionLabel>Official Details</SectionLabel>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField fullWidth label="District" value={form.district}
                  onChange={set('district')} required disabled={isLoading}
                  placeholder="e.g. Lucknow"
                  InputProps={{ startAdornment: <InputAdornment position="start"><LocationOnOutlined sx={{ color: C.rose, fontSize: 19 }} /></InputAdornment> }}
                  sx={fldSx} />
                <TextField fullWidth label="Designation" value={form.designation}
                  onChange={set('designation')} required disabled={isLoading}
                  placeholder="e.g. District Health Officer"
                  InputProps={{ startAdornment: <InputAdornment position="start"><BadgeOutlined sx={{ color: C.rose, fontSize: 19 }} /></InputAdornment> }}
                  sx={fldSx} />
              </Stack>

              <TextField fullWidth label="Employee ID" value={form.employee_id}
                onChange={set('employee_id')} required disabled={isLoading}
                placeholder="e.g. UP-DHO-2024-001"
                InputProps={{ startAdornment: <InputAdornment position="start"><BadgeOutlined sx={{ color: C.rose, fontSize: 19 }} /></InputAdornment> }}
                sx={fldSx} />

              <SectionLabel>Account Security</SectionLabel>

              <Box>
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
                  <Box sx={{ mt: 1, px: 0.5 }}>
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
              </Box>

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
                  ? <><CircularProgress size={16} sx={{ color: '#fff', mr: 1 }} /> Creating Account…</>
                  : 'Create Officer Account →'}
              </Button>
            </Stack>
          </form>

          <Divider sx={{ my: 3, '&::before,&::after': { borderColor: 'rgba(160,41,74,0.12)' } }}>
            <Typography sx={{ fontSize: '0.78rem', color: C.textLight, px: 1, fontWeight: 500 }}>Already have an account?</Typography>
          </Divider>

          <Button fullWidth variant="outlined"
            onClick={() => navigate('/login')} disabled={isLoading}
            sx={{
              py: '12px', fontSize: '0.93rem', fontWeight: 600,
              borderRadius: '10px', textTransform: 'none',
              borderWidth: 1.5, borderColor: C.purple, color: C.purple,
              '&:hover': { borderColor: C.purpleLight, bgcolor: 'rgba(45,10,78,0.04)', transform: 'translateY(-1px)' },
              transition: 'all 0.25s ease',
            }}>
            Sign In to Your Account
          </Button>

          <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid rgba(160,41,74,0.08)', textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.7rem', color: C.textLight }}>
              National Health Mission · Government of India © {new Date().getFullYear()}
            </Typography>
          </Box>
        </Box>

        <Typography sx={{ mt: 3, fontSize: '0.7rem', color: C.textLight, position: 'relative', zIndex: 1 }}>
          © {new Date().getFullYear()} MaatriSahayak · All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default OfficerRegister;
