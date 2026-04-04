import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { PublicOutlined, SecurityOutlined, EmojiObjectsOutlined, TimelineOutlined } from '@mui/icons-material';
import PublicLayout, { usePublicTheme } from '../components/PublicLayout';

const ValueCard = ({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) => {
  const { palette } = usePublicTheme();
  return (
    <Paper sx={{
      p: 3, borderRadius: '16px', border: `1px solid ${palette.panelBorder}`,
      background: palette.panel,
    }}>
      <Box sx={{ color: palette.accent, mb: 1 }}>{icon}</Box>
      <Typography sx={{ fontWeight: 700, color: palette.text, mb: 0.5 }}>{title}</Typography>
      <Typography sx={{ fontSize: '0.9rem', color: palette.textMuted, lineHeight: 1.6 }}>{text}</Typography>
    </Paper>
  );
};

const AboutContent: React.FC = () => {
  const { palette } = usePublicTheme();

  return (
    <>
      <Box sx={{ px: { xs: 2.5, md: 6 }, pt: { xs: 4, md: 6 } }}>
        <Typography sx={{ fontSize: { xs: '2rem', md: '2.6rem' }, fontWeight: 900, color: palette.text }}>
          Built for frontline realities.
        </Typography>
        <Typography sx={{ mt: 2, fontSize: '1rem', color: palette.textMuted, lineHeight: 1.8, maxWidth: 820 }}>
          MaatriSahayak is a public-good emergency response platform created to reduce maternal mortality by
          coordinating ASHA workers, ambulances, and hospitals with real-time intelligence and offline resilience.
        </Typography>
      </Box>

      <Box sx={{ px: { xs: 2.5, md: 6 }, mt: 6 }}>
        <Paper sx={{
          p: { xs: 3, md: 4 },
          borderRadius: '18px',
          background: palette.panel,
          border: `1px solid ${palette.panelBorder}`,
        }}>
          <Typography sx={{ fontWeight: 800, color: palette.text, mb: 1.5 }}>Our Mission</Typography>
          <Typography sx={{ color: palette.textMuted, lineHeight: 1.8 }}>
            Ensure every mother in rural India receives timely emergency care by shrinking the decision,
            travel, and treatment delays with trusted, interoperable systems.
          </Typography>
        </Paper>
      </Box>

      <Box sx={{ px: { xs: 2.5, md: 6 }, mt: 6 }}>
        <Typography sx={{ fontWeight: 800, color: palette.text, mb: 2 }}>What we believe</Typography>
        <Grid container spacing={2.5}>
          <Grid item xs={12} md={3}>
            <ValueCard
              icon={<PublicOutlined />}
              title="Public-first design"
              text="Aligned with national health priorities and built for scale across districts."
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <ValueCard
              icon={<SecurityOutlined />}
              title="Trust & security"
              text="Role-based access, audit trails, and secure data handling throughout."
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <ValueCard
              icon={<EmojiObjectsOutlined />}
              title="Intelligent care"
              text="AI-assisted risk triage and symptom analysis that support early intervention."
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <ValueCard
              icon={<TimelineOutlined />}
              title="Operational excellence"
              text="Real-time dispatching and analytics to continuously improve outcomes."
            />
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ px: { xs: 2.5, md: 6 }, mt: 6 }}>
        <Paper sx={{
          p: { xs: 3, md: 4 },
          borderRadius: '18px',
          background: palette.panel,
          border: `1px solid ${palette.panelBorder}`,
        }}>
          <Typography sx={{ fontWeight: 800, color: palette.text, mb: 1.5 }}>Timeline</Typography>
          <Box sx={{ display: 'grid', gap: 1.2 }}>
            {[
              'Prototype built and piloted with frontline workflows',
              'Backend and mobile workflows deployed for district pilots',
              'Real-time tracking and analytics integrated with dashboards',
              'Scaling strategy for multi-district rollout',
            ].map((item, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1.5 }}>
                <Typography sx={{ fontWeight: 700, color: palette.accent }}>{String(i + 1).padStart(2, '0')}</Typography>
                <Typography sx={{ color: palette.textMuted }}>{item}</Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>
    </>
  );
};

const About: React.FC = () => (
  <PublicLayout>
    <AboutContent />
  </PublicLayout>
);

export default About;
