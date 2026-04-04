import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Box, Button, IconButton, Typography } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { DarkModeOutlined, LightModeOutlined } from '@mui/icons-material';
import logo from '../assets/logo.png';

export type PublicMode = 'light' | 'dark';

export interface PublicPalette {
  mode: PublicMode;
  bg: string;
  panel: string;
  panelBorder: string;
  text: string;
  textMuted: string;
  accent: string;
  accentDeep: string;
  accentSoft: string;
}

const base = {
  purple: '#2D0A4E',
  purpleMid: '#4A1272',
  purpleLight: '#6B2FA0',
  roseDark: '#A0294A',
  rose: '#C0395B',
  roseLight: '#E05578',
  pink: '#F9A8D4',
  bgLight: '#F8F4FF',
  panelLight: '#FFFFFF',
  textDark: '#1A0A2E',
  textMid: '#5C3A7A',
  borderLight: 'rgba(160,41,74,0.14)',
  bgDark: '#140A21',
  panelDark: '#1B112A',
  textLight: '#F4E9FF',
  textMuted: 'rgba(244,233,255,0.72)',
  borderDark: 'rgba(249,168,212,0.18)',
};

const makePalette = (mode: PublicMode): PublicPalette => {
  if (mode === 'dark') {
    return {
      mode,
      bg: base.bgDark,
      panel: base.panelDark,
      panelBorder: base.borderDark,
      text: base.textLight,
      textMuted: base.textMuted,
      accent: base.rose,
      accentDeep: base.roseDark,
      accentSoft: base.pink,
    };
  }
  return {
    mode,
    bg: base.bgLight,
    panel: base.panelLight,
    panelBorder: base.borderLight,
    text: base.textDark,
    textMuted: base.textMid,
    accent: base.rose,
    accentDeep: base.roseDark,
    accentSoft: base.pink,
  };
};

const PublicThemeContext = createContext<{
  palette: PublicPalette;
  toggleMode: () => void;
} | null>(null);

export const usePublicTheme = () => {
  const ctx = useContext(PublicThemeContext);
  if (!ctx) {
    throw new Error('usePublicTheme must be used within PublicLayout');
  }
  return ctx;
};

const navLinkSx = (active: boolean, color: string, muted: string) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.9rem',
  color: active ? color : muted,
  '&:hover': { color },
});

const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [mode, setMode] = useState<PublicMode>(() => {
    const stored = localStorage.getItem('public_theme');
    return stored === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem('public_theme', mode);
  }, [mode]);

  const palette = useMemo(() => makePalette(mode), [mode]);
  const toggleMode = () => setMode((m) => (m === 'light' ? 'dark' : 'light'));

  return (
    <PublicThemeContext.Provider value={{ palette, toggleMode }}>
      <Box sx={{
        minHeight: '100vh',
        background: palette.mode === 'light'
          ? `radial-gradient(1200px 600px at 10% -10%, rgba(107,47,160,0.08), transparent 60%), ${palette.bg}`
          : `radial-gradient(1200px 600px at 10% -10%, rgba(249,168,212,0.08), transparent 60%), ${palette.bg}`,
        color: palette.text,
        fontFamily: '"Inter","Segoe UI",system-ui,sans-serif',
      }}>
        {/* Top Nav */}
        <Box sx={{
          px: { xs: 2.5, md: 6 },
          py: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.6 }}>
            <Box component="img" src={logo} alt="MaatriSahayak"
              sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: '#fff', p: '6px', boxShadow: '0 6px 18px rgba(0,0,0,0.15)' }} />
            <Box>
              <Typography sx={{ fontWeight: 900, fontSize: '1.15rem', letterSpacing: '-0.2px', color: palette.text }}>
                Maatri<Box component="span" sx={{ color: palette.accent }}>Sahayak</Box>
              </Typography>
              <Typography sx={{ fontSize: '0.62rem', letterSpacing: '2.2px', textTransform: 'uppercase', color: palette.textMuted, fontWeight: 700 }}>
                Public Portal
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1.5 }}>
            <Button component={RouterLink} to="/home" sx={navLinkSx(location.pathname === '/home', palette.text, palette.textMuted)}>Home</Button>
            <Button component={RouterLink} to="/about" sx={navLinkSx(location.pathname === '/about', palette.text, palette.textMuted)}>About</Button>
            <Button component={RouterLink} to="/contact" sx={navLinkSx(location.pathname === '/contact', palette.text, palette.textMuted)}>Contact</Button>
            <Button
              component={RouterLink}
              to="/role-select"
              variant="outlined"
              sx={{
                textTransform: 'none',
                borderRadius: '10px',
                borderColor: palette.accentDeep,
                color: palette.accentDeep,
                fontWeight: 700,
              }}
            >
              Portals
            </Button>
            <Button
              component={RouterLink}
              to="/login"
              variant="contained"
              sx={{
                textTransform: 'none',
                borderRadius: '10px',
                fontWeight: 700,
                background: `linear-gradient(135deg, ${palette.accentDeep} 0%, ${palette.accent} 55%, ${palette.accentSoft} 100%)`,
              }}
            >
              Officer Login
            </Button>
            <IconButton onClick={toggleMode} sx={{ ml: 0.5, color: palette.text }}>
              {palette.mode === 'light' ? <DarkModeOutlined /> : <LightModeOutlined />}
            </IconButton>
          </Box>

          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1 }}>
            <Button component={RouterLink} to="/role-select" variant="outlined" sx={{ textTransform: 'none', borderColor: palette.accentDeep, color: palette.accentDeep }}>
              Portals
            </Button>
            <IconButton onClick={toggleMode} sx={{ color: palette.text }}>
              {palette.mode === 'light' ? <DarkModeOutlined /> : <LightModeOutlined />}
            </IconButton>
          </Box>
        </Box>

        {children}

        {/* Footer */}
        <Box sx={{
          px: { xs: 2.5, md: 6 },
          py: 4,
          borderTop: `1px solid ${palette.panelBorder}`,
          mt: 6,
        }}>
          <Typography sx={{ fontSize: '0.78rem', color: palette.textMuted }}>
            National Health Mission · Government of India · © {new Date().getFullYear()} MaatriSahayak
          </Typography>
        </Box>
      </Box>
    </PublicThemeContext.Provider>
  );
};

export default PublicLayout;
