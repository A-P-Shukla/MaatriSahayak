import React, { useState } from 'react';
import { Box, Button, Grid, Paper, TextField, Typography } from '@mui/material';
import { EmailOutlined, PhoneOutlined, LocationOnOutlined } from '@mui/icons-material';
import PublicLayout, { usePublicTheme } from '../components/PublicLayout';

const ContactContent: React.FC = () => {
  const { palette } = usePublicTheme();
  const [form, setForm] = useState({ name: '', email: '', org: '', message: '' });

  const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [f]: e.target.value });
  };

  const fldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '10px',
      backgroundColor: palette.mode === 'light' ? '#FAFAFA' : '#221832',
      fontSize: '0.93rem',
      '& fieldset': { borderColor: palette.panelBorder, borderWidth: 1.5 },
      '&:hover fieldset': { borderColor: palette.accent },
      '&.Mui-focused fieldset': { borderColor: palette.accent, borderWidth: 2 },
    },
    '& .MuiInputLabel-root': { fontSize: '0.88rem', color: palette.textMuted },
    '& .MuiInputLabel-root.Mui-focused': { color: palette.accent },
  };

  return (
    <>
      <Box sx={{ px: { xs: 2.5, md: 6 }, pt: { xs: 4, md: 6 } }}>
        <Typography sx={{ fontSize: { xs: '2rem', md: '2.6rem' }, fontWeight: 900, color: palette.text }}>
          Contact us
        </Typography>
        <Typography sx={{ mt: 2, fontSize: '1rem', color: palette.textMuted, lineHeight: 1.8, maxWidth: 820 }}>
          Partnerships, district pilots, and program inquiries. We respond within 48 hours.
        </Typography>
      </Box>

      <Box sx={{ px: { xs: 2.5, md: 6 }, mt: 5 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Paper sx={{
              p: { xs: 3, md: 4 },
              borderRadius: '18px',
              background: palette.panel,
              border: `1px solid ${palette.panelBorder}`,
            }}>
              <Typography sx={{ fontWeight: 800, color: palette.text, mb: 2 }}>Send a message</Typography>
              <Box component="form" sx={{ display: 'grid', gap: 2 }}>
                <TextField label="Full Name" value={form.name} onChange={set('name')} sx={fldSx} fullWidth />
                <TextField label="Email Address" value={form.email} onChange={set('email')} sx={fldSx} fullWidth />
                <TextField label="Organization" value={form.org} onChange={set('org')} sx={fldSx} fullWidth />
                <TextField label="Message" value={form.message} onChange={set('message')} sx={fldSx} multiline rows={4} fullWidth />
                <Button
                  variant="contained"
                  sx={{
                    textTransform: 'none',
                    borderRadius: '10px',
                    fontWeight: 700,
                    background: `linear-gradient(135deg, ${palette.accentDeep} 0%, ${palette.accent} 55%, ${palette.accentSoft} 100%)`,
                  }}
                >
                  Send message
                </Button>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={5}>
            <Paper sx={{
              p: { xs: 3, md: 4 },
              borderRadius: '18px',
              background: palette.panel,
              border: `1px solid ${palette.panelBorder}`,
              height: '100%',
            }}>
              <Typography sx={{ fontWeight: 800, color: palette.text, mb: 2 }}>Reach us</Typography>
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <EmailOutlined sx={{ color: palette.accent }} />
                  <Typography sx={{ color: palette.textMuted }}>partnerships@maatrisahayak.in</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <PhoneOutlined sx={{ color: palette.accent }} />
                  <Typography sx={{ color: palette.textMuted }}>+91 80000 00000</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <LocationOnOutlined sx={{ color: palette.accent }} />
                  <Typography sx={{ color: palette.textMuted }}>
                    National Health Mission, New Delhi, India
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

const Contact: React.FC = () => (
  <PublicLayout>
    <ContactContent />
  </PublicLayout>
);

export default Contact;
