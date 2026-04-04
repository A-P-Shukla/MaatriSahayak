import React from 'react';
import { Box, Button, Grid, Paper, Typography } from '@mui/material';
import { ArrowForwardOutlined, LocalHospitalOutlined, OfflineBoltOutlined, TimelineOutlined, VerifiedOutlined } from '@mui/icons-material';
import PublicLayout, { usePublicTheme } from '../components/PublicLayout';

const Stat = ({ label, value }: { label: string; value: string }) => {
  const { palette } = usePublicTheme();
  return (
    <Box sx={{ textAlign: 'left' }}>
      <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: palette.text }}>{value}</Typography>
      <Typography sx={{ fontSize: '0.78rem', color: palette.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        {label}
      </Typography>
    </Box>
  );
};

const FeatureCard = ({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) => {
  const { palette } = usePublicTheme();
  return (
    <Paper sx={{
      p: 3, borderRadius: '16px', border: `1px solid ${palette.panelBorder}`,
      background: palette.panel, minHeight: '160px',
    }}>
      <Box sx={{ color: palette.accent, mb: 1 }}>{icon}</Box>
      <Typography sx={{ fontWeight: 700, color: palette.text, mb: 0.5 }}>{title}</Typography>
      <Typography sx={{ fontSize: '0.9rem', color: palette.textMuted, lineHeight: 1.6 }}>{text}</Typography>
    </Paper>
  );
};

const HomeContent: React.FC = () => {
  const { palette } = usePublicTheme();

  return (
    <>
      <Box sx={{ px: { xs: 2.5, md: 6 }, pt: { xs: 4, md: 6 } }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography sx={{ fontSize: { xs: '2.2rem', md: '3.2rem' }, fontWeight: 900, lineHeight: 1.1, color: palette.text }}>
              Turning smartphones into life-saving maternal infrastructure.
            </Typography>
            <Typography sx={{ mt: 2, fontSize: '1rem', color: palette.textMuted, lineHeight: 1.8 }}>
              MaatriSahayak is a public-good platform that coordinates ASHA workers, ambulances, and hospitals to cut response time
              and prevent maternal deaths in rural India.
            </Typography>
            <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                href="/role-select"
                sx={{
                  textTransform: 'none',
                  borderRadius: '12px',
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${palette.accentDeep} 0%, ${palette.accent} 55%, ${palette.accentSoft} 100%)`,
                }}
              >
                Enter Portal
              </Button>
              <Button
                variant="outlined"
                href="/contact"
                sx={{
                  textTransform: 'none',
                  borderRadius: '12px',
                  borderColor: palette.accentDeep,
                  color: palette.accentDeep,
                  fontWeight: 700,
                }}
              >
                Partner with Us
              </Button>
            </Box>
            <Box sx={{ mt: 4, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <Stat label="Avg Response Time" value="< 30 min" />
              <Stat label="Lives Impacted" value="5,000+" />
              <Stat label="Districts" value="45+" />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{
              p: 3.5,
              borderRadius: '20px',
              background: palette.panel,
              border: `1px solid ${palette.panelBorder}`,
              boxShadow: palette.mode === 'light' ? '0 16px 40px rgba(45,10,78,0.12)' : '0 16px 40px rgba(0,0,0,0.45)',
            }}>
              <Typography sx={{ fontWeight: 700, mb: 1, color: palette.text }}>Emergency Flow Snapshot</Typography>
              <Box sx={{ display: 'grid', gap: 1.2 }}>
                {[
                  'ASHA triggers emergency',
                  'System assigns nearest ambulance',
                  'Hospital alerted with patient data',
                  'Live tracking + ETA updates',
                  'Outcome logged and analyzed',
                ].map((item, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{
                      width: 20, height: 20, borderRadius: '50%',
                      background: palette.accent, color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', fontWeight: 700,
                    }}>
                      {i + 1}
                    </Box>
                    <Typography sx={{ fontSize: '0.9rem', color: palette.textMuted }}>{item}</Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ px: { xs: 2.5, md: 6 }, mt: 7 }}>
        <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, mb: 2, color: palette.text }}>
          Built for real-world constraints
        </Typography>
        <Grid container spacing={2.5}>
          <Grid item xs={12} md={4}>
            <FeatureCard
              icon={<OfflineBoltOutlined />}
              title="Offline-first field workflows"
              text="Critical actions work without connectivity. Data syncs when networks return, keeping frontline workers productive."
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FeatureCard
              icon={<TimelineOutlined />}
              title="Real-time ambulance tracking"
              text="Location updates every 30 seconds with ETA notifications for families, ASHA workers, and hospitals."
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FeatureCard
              icon={<LocalHospitalOutlined />}
              title="Hospital readiness"
              text="Beds reserved in advance and patient context shared before arrival to reduce treatment delays."
            />
          </Grid>
        </Grid>
      </Box>

      <Box sx={{
        px: { xs: 2.5, md: 6 },
        mt: 7,
        py: 4,
        borderTop: `1px solid ${palette.panelBorder}`,
        borderBottom: `1px solid ${palette.panelBorder}`,
        display: 'flex',
        gap: 4,
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <VerifiedOutlined sx={{ color: palette.accent }} />
          <Typography sx={{ fontWeight: 700, color: palette.text }}>Government-aligned workflows</Typography>
        </Box>
        <Typography sx={{ fontSize: '0.92rem', color: palette.textMuted, maxWidth: 540 }}>
          Designed to meet public health standards with audit-ready logs, role-based access, and secure data handling.
        </Typography>
      </Box>

      <Box sx={{ px: { xs: 2.5, md: 6 }, mt: 7 }}>
        <Paper sx={{
          p: { xs: 3, md: 5 },
          borderRadius: '20px',
          background: `linear-gradient(135deg, ${palette.accentDeep} 0%, ${palette.accent} 55%, ${palette.accentSoft} 100%)`,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}>
          <Box>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 800 }}>Ready to activate a district?</Typography>
            <Typography sx={{ fontSize: '0.95rem', opacity: 0.9 }}>
              Start with a pilot, onboard ASHAs, and see response times drop.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            href="/contact"
            endIcon={<ArrowForwardOutlined />}
            sx={{
              textTransform: 'none',
              borderRadius: '12px',
              color: '#fff',
              borderColor: 'rgba(255,255,255,0.6)',
            }}
          >
            Talk to our team
          </Button>
        </Paper>
      </Box>
    </>
  );
};

const Home: React.FC = () => (
  <PublicLayout>
    <HomeContent />
  </PublicLayout>
);

export default Home;
