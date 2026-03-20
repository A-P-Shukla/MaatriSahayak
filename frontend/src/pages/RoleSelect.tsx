import React from 'react';
import { Box, Typography, Card, CardContent, Stack, Button } from '@mui/material';
import {
  HealthAndSafety as AshaIcon,
  LocalShipping as DriverIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import logo from '../assets/logo.png';

const C = {
  purple:    '#2D0A4E',
  purpleMid: '#4A1272',
  rose:      '#C0395B',
  pink:      '#F9A8D4',
  green:     '#1B6B4A',
  teal:      '#0d9488',
};

const RoleSelect: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const roles = [
    {
      key: 'asha',
      icon: <AshaIcon sx={{ fontSize: 48 }} />,
      title: 'ASHA Worker',
      subtitle: 'Accredited Social Health Activist',
      desc: 'Monitor pregnancies, record vitals, manage ANC visits and trigger emergency alerts.',
      gradient: `linear-gradient(135deg, ${C.green} 0%, ${C.teal} 100%)`,
      shadow: 'rgba(27,107,74,0.35)',
      loginPath: '/login',
      dashPath: '/dashboard',
      registerPath: '/register',
      registerLabel: 'Register as ASHA',
    },
    {
      key: 'driver',
      icon: <DriverIcon sx={{ fontSize: 48 }} />,
      title: 'Ambulance Driver',
      subtitle: 'Emergency Response Personnel',
      desc: 'Accept emergency dispatches, navigate to patients and complete emergency rides.',
      gradient: `linear-gradient(135deg, ${C.purple} 0%, ${C.purpleMid} 100%)`,
      shadow: 'rgba(45,10,78,0.35)',
      loginPath: '/driver/login',
      dashPath: '/drivers',
      registerPath: '/drivers/register',
      registerLabel: 'Register as Driver',
    },
  ];

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(160deg, #0a1628 0%, #1a2a1a 50%, #0a1628 100%)',
      p: { xs: 3, sm: 5 },
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""', position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 20% 50%, rgba(27,107,74,0.15) 0%, transparent 55%), radial-gradient(ellipse at 80% 50%, rgba(45,10,78,0.2) 0%, transparent 55%)',
        pointerEvents: 'none',
      },
    }}>

      {/* Logo + Brand */}
      <Stack alignItems="center" spacing={1.5} sx={{ mb: 6, position: 'relative', zIndex: 1 }}>
        <Box sx={{
          width: 80, height: 80, borderRadius: '20px', bgcolor: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)', p: '8px',
        }}>
          <Box component="img" src={logo} alt="MaatriSahayak" sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ fontSize: { xs: '1.8rem', sm: '2.2rem' }, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
            Maatri<Box component="span" sx={{ color: C.pink }}>Sahayak</Box>
          </Typography>
          <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '2.5px', color: C.pink, textTransform: 'uppercase', mt: 0.5 }}>
            Maternal Health Monitoring
          </Typography>
        </Box>
        <Typography sx={{ fontSize: '1rem', color: 'rgba(255,255,255,0.65)', textAlign: 'center', maxWidth: 420, mt: 0.5 }}>
          Select your role to continue
        </Typography>
      </Stack>

      {/* Role Cards */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={3}
        sx={{ width: '100%', maxWidth: 760, position: 'relative', zIndex: 1 }}
      >
        {roles.map((role) => (
          <Card key={role.key} elevation={0} sx={{
            flex: 1,
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(16px)',
            transition: 'transform 0.25s ease, box-shadow 0.25s ease',
            '&:hover': {
              transform: 'translateY(-6px)',
              boxShadow: `0 20px 60px ${role.shadow}`,
              border: '1px solid rgba(255,255,255,0.2)',
            },
            cursor: 'default',
          }}>
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>

              {/* Icon */}
              <Box sx={{
                width: 80, height: 80, borderRadius: '18px',
                background: role.gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', mb: 3,
                boxShadow: `0 8px 24px ${role.shadow}`,
              }}>
                {role.icon}
              </Box>

              {/* Title */}
              <Typography sx={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', mb: 0.4 }}>
                {role.title}
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: 1.2, mb: 2 }}>
                {role.subtitle}
              </Typography>

              {/* Description */}
              <Typography sx={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, mb: 3.5 }}>
                {role.desc}
              </Typography>

              {/* Buttons */}
              <Stack spacing={1.5}>
                <Button
                  fullWidth variant="contained"
                  endIcon={<ArrowIcon />}
                  onClick={() => navigate(isAuthenticated ? role.dashPath : role.loginPath)}
                  sx={{
                    py: '12px', fontWeight: 700, borderRadius: '10px',
                    textTransform: 'none', fontSize: '0.95rem',
                    background: role.gradient,
                    boxShadow: `0 4px 14px ${role.shadow}`,
                    '&:hover': { opacity: 0.92, transform: 'translateY(-1px)', boxShadow: `0 8px 22px ${role.shadow}` },
                    transition: 'all 0.2s ease',
                  }}
                >
                  Sign In as {role.title.split(' ')[0]}
                </Button>
                <Button
                  fullWidth variant="outlined"
                  onClick={() => navigate(role.registerPath)}
                  sx={{
                    py: '11px', fontWeight: 600, borderRadius: '10px',
                    textTransform: 'none', fontSize: '0.88rem',
                    borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.75)',
                    '&:hover': { borderColor: 'rgba(255,255,255,0.5)', bgcolor: 'rgba(255,255,255,0.06)' },
                  }}
                >
                  {role.registerLabel}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Footer */}
      <Typography sx={{ mt: 5, fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', position: 'relative', zIndex: 1, textAlign: 'center' }}>
        National Health Mission · Government of India · © {new Date().getFullYear()} MaatriSahayak
      </Typography>
    </Box>
  );
};

export default RoleSelect;
