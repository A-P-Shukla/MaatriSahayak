import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  AdminPanelSettingsOutlined,
  LocalHospitalOutlined,
  DirectionsCarOutlined,
} from '@mui/icons-material';
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

const RoleSelect: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', fontFamily: '"Inter","Segoe UI",system-ui,sans-serif' }}>
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
        <Box sx={{ position: 'relative', zIndex: 1 }}>
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
                Emergency Response Platform
              </Typography>
            </Box>
          </Box>

          <Typography sx={{ fontSize: '1.18rem', fontWeight: 400, color: '#E9D5FF', lineHeight: 1.75, mb: 5, maxWidth: 360 }}>
            Choose your portal to continue. Secure access for officers and drivers.
          </Typography>

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Paper sx={{
              flex: 1, p: 2, borderRadius: '14px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.14)',
              color: '#fff',
            }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, mb: 0.6 }}>Fast Response</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: 'rgba(243,232,255,0.85)' }}>
                Coordinate ambulances and hospitals in minutes.
              </Typography>
            </Paper>
            <Paper sx={{
              flex: 1, p: 2, borderRadius: '14px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.14)',
              color: '#fff',
            }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, mb: 0.6 }}>Trusted Access</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: 'rgba(243,232,255,0.85)' }}>
                Role-based access for secure operations.
              </Typography>
            </Paper>
          </Box>
        </Box>

        <Typography sx={{ fontSize: '0.72rem', color: 'rgba(249,168,212,0.55)', position: 'relative', zIndex: 1 }}>
          National Health Mission · Government of India
        </Typography>
      </Box>

      {/* RIGHT PANEL */}
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
        <Box sx={{
          width: '100%', maxWidth: 520,
          background: C.cardBg,
          borderRadius: '20px',
          border: `1px solid ${C.border}`,
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07), 0 20px 50px rgba(45,10,78,0.1)',
          p: { xs: '28px 24px', sm: '40px 44px' },
          zIndex: 1,
        }}>
          <Box sx={{ textAlign: 'center', mb: 3.5 }}>
            <Box component="img" src={logo} alt="MaatriSahayak"
              sx={{ width: 52, height: 52, objectFit: 'contain', borderRadius: '12px', mb: 1.5 }} />
            <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color: C.textDark }}>
              Choose Your Portal
            </Typography>
            <Typography sx={{ fontSize: '0.9rem', color: C.textMid }}>
              Select the role you want to sign in or register with.
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gap: 2 }}>
            <Paper sx={{
              p: 2.5, borderRadius: '14px', border: `1px solid ${C.border}`,
              background: '#FFF', display: 'flex', gap: 2, alignItems: 'center',
            }}>
              <AdminPanelSettingsOutlined sx={{ fontSize: 28, color: C.rose }} />
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 700, color: C.textDark }}>District Officer</Typography>
                <Typography sx={{ fontSize: '0.82rem', color: C.textMid }}>
                  Manage district operations, analytics, and approvals.
                </Typography>
              </Box>
              <Button
                variant="contained"
                onClick={() => navigate('/login')}
                sx={{
                  textTransform: 'none',
                  borderRadius: '10px',
                  background: `linear-gradient(135deg, ${C.roseDark} 0%, ${C.rose} 55%, ${C.roseLight} 100%)`,
                }}
              >
                Sign In
              </Button>
            </Paper>

            <Paper sx={{
              p: 2.5, borderRadius: '14px', border: `1px solid ${C.border}`,
              background: '#FFF', display: 'flex', gap: 2, alignItems: 'center',
            }}>
              <LocalHospitalOutlined sx={{ fontSize: 28, color: C.rose }} />
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 700, color: C.textDark }}>Officer Registration</Typography>
                <Typography sx={{ fontSize: '0.82rem', color: C.textMid }}>
                  New district officer? Create a verified account.
                </Typography>
              </Box>
              <Button
                variant="outlined"
                onClick={() => navigate('/register')}
                sx={{
                  textTransform: 'none',
                  borderRadius: '10px',
                  borderColor: C.purple,
                  color: C.purple,
                }}
              >
                Register
              </Button>
            </Paper>

            <Paper sx={{
              p: 2.5, borderRadius: '14px', border: `1px solid ${C.border}`,
              background: '#FFF', display: 'flex', gap: 2, alignItems: 'center',
            }}>
              <DirectionsCarOutlined sx={{ fontSize: 28, color: C.rose }} />
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 700, color: C.textDark }}>Ambulance Driver</Typography>
                <Typography sx={{ fontSize: '0.82rem', color: C.textMid }}>
                  Log in to view assignments and confirm emergencies.
                </Typography>
              </Box>
              <Button
                variant="contained"
                onClick={() => navigate('/driver/login')}
                sx={{
                  textTransform: 'none',
                  borderRadius: '10px',
                  background: `linear-gradient(135deg, ${C.roseDark} 0%, ${C.rose} 55%, ${C.roseLight} 100%)`,
                }}
              >
                Driver Login
              </Button>
            </Paper>

            <Paper sx={{
              p: 2.5, borderRadius: '14px', border: `1px solid ${C.border}`,
              background: '#FFF', display: 'flex', gap: 2, alignItems: 'center',
            }}>
              <DirectionsCarOutlined sx={{ fontSize: 26, color: C.purple }} />
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 700, color: C.textDark }}>Driver Registration</Typography>
                <Typography sx={{ fontSize: '0.82rem', color: C.textMid }}>
                  New driver? Submit your credentials for approval.
                </Typography>
              </Box>
              <Button
                variant="outlined"
                onClick={() => navigate('/drivers/register')}
                sx={{
                  textTransform: 'none',
                  borderRadius: '10px',
                  borderColor: C.purple,
                  color: C.purple,
                }}
              >
                Register
              </Button>
            </Paper>
          </Box>
        </Box>

        <Typography sx={{ mt: 3, fontSize: '0.71rem', color: C.textLight, position: 'relative', zIndex: 1 }}>
          © {new Date().getFullYear()} MaatriSahayak · All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default RoleSelect;
