import React, { useEffect, useState } from 'react';
import { Box, Button, Grid, Paper, TextField, Typography, Alert, Grow, ClickAwayListener, IconButton } from '@mui/material';
import { EmailOutlined, PhoneOutlined, LocationOnOutlined, CheckCircleOutline } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import PublicLayout, { usePublicTheme } from '../components/PublicLayout';

const ContactContent: React.FC = () => {
  const { palette } = usePublicTheme();
  const [form, setForm] = useState({ name: '', email: '', org: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [bannerOpen, setBannerOpen] = useState(false);

  useEffect(() => {
    if (!bannerOpen) return;
    const timer = setTimeout(() => setBannerOpen(false), 10000);
    return () => clearTimeout(timer);
  }, [bannerOpen]);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setBanner(null);
    setBannerOpen(false);

    try {
      const res = await fetch('https://formspree.io/f/mvzvyrrn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          organization: form.org,
          message: form.message,
        }),
      });

      if (!res.ok) {
        throw new Error('Submission failed');
      }

      setBanner({ type: 'success', message: 'Thank you! Your message has been sent.' });
      setBannerOpen(true);
      setForm({ name: '', email: '', org: '', message: '' });
    } catch {
      setBanner({ type: 'error', message: 'Sorry, we could not send your message. Please try again.' });
      setBannerOpen(true);
    } finally {
      setIsSubmitting(false);
    }
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
              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
                {banner && (
                  <ClickAwayListener onClickAway={() => setBannerOpen(false)}>
                    <Box>
                      <Grow in={bannerOpen} mountOnEnter unmountOnExit timeout={{ enter: 220, exit: 160 }}>
                        <Alert
                          severity={banner.type}
                          icon={banner.type === 'success' ? (
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                animation: 'tickPop 420ms ease-out',
                                '@keyframes tickPop': {
                                  '0%': { transform: 'scale(0.6) rotate(-10deg)', opacity: 0 },
                                  '60%': { transform: 'scale(1.12) rotate(2deg)', opacity: 1 },
                                  '100%': { transform: 'scale(1) rotate(0deg)', opacity: 1 },
                                },
                              }}
                            >
                              <CheckCircleOutline fontSize="small" />
                            </Box>
                          ) : undefined}
                          action={
                            <IconButton size="small" onClick={() => setBannerOpen(false)} aria-label="close">
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          }
                          sx={{
                            borderRadius: '10px',
                            fontSize: '0.9rem',
                            boxShadow: banner.type === 'success'
                              ? '0 8px 24px rgba(22, 163, 74, 0.25)'
                              : '0 8px 24px rgba(220, 38, 38, 0.22)',
                            transformOrigin: 'top center',
                            animation: 'popBounce 420ms cubic-bezier(0.2, 0.8, 0.2, 1)',
                            '@keyframes popBounce': {
                              '0%': { transform: 'scale(0.92)', opacity: 0 },
                              '70%': { transform: 'scale(1.03)', opacity: 1 },
                              '100%': { transform: 'scale(1)', opacity: 1 },
                            },
                            background: banner.type === 'success'
                              ? (palette.mode === 'light' ? '#ECFDF3' : '#193022')
                              : (palette.mode === 'light' ? '#FEF2F2' : '#3A1820'),
                            color: banner.type === 'success'
                              ? (palette.mode === 'light' ? '#14532D' : '#A7F3D0')
                              : (palette.mode === 'light' ? '#7F1D1D' : '#FCA5A5'),
                            border: `1px solid ${
                              banner.type === 'success'
                                ? (palette.mode === 'light' ? '#BBF7D0' : '#2A4A36')
                                : (palette.mode === 'light' ? '#FECACA' : '#5A2432')
                            }`,
                            '& .MuiAlert-icon': {
                              color: banner.type === 'success'
                                ? (palette.mode === 'light' ? '#16A34A' : '#86EFAC')
                                : (palette.mode === 'light' ? '#DC2626' : '#F87171'),
                            },
                          }}
                        >
                          {banner.message}
                        </Alert>
                      </Grow>
                    </Box>
                  </ClickAwayListener>
                )}
                <TextField label="Full Name" name="name" value={form.name} onChange={set('name')} sx={fldSx} fullWidth required />
                <TextField label="Email Address" name="email" type="email" value={form.email} onChange={set('email')} sx={fldSx} fullWidth required />
                <TextField label="Organization" name="organization" value={form.org} onChange={set('org')} sx={fldSx} fullWidth />
                <TextField label="Message" name="message" value={form.message} onChange={set('message')} sx={fldSx} multiline rows={4} fullWidth required />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  variant="contained"
                  sx={{
                    textTransform: 'none',
                    borderRadius: '10px',
                    fontWeight: 700,
                    background: `linear-gradient(135deg, ${palette.accentDeep} 0%, ${palette.accent} 55%, ${palette.accentSoft} 100%)`,
                  }}
                >
                  {isSubmitting ? 'Sending...' : 'Send message'}
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
