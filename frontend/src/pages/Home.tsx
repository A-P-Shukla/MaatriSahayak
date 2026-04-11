import React from 'react';
import { Box, Button, Grid, Paper, Typography } from '@mui/material';
import {
  ArrowRight,
  Zap,
  Activity,
  Hospital,
  ShieldCheck,
  Clock,
  Users,
  MapPin,
  CheckCircle2,
  HeartPulse,
  Ambulance,
  BrainCircuit,
  ChevronRight,
} from 'lucide-react';
import PublicLayout, { usePublicTheme } from '../components/PublicLayout';

const Stat = ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => {
  const { palette } = usePublicTheme();
  return (
    <Box sx={{ textAlign: 'left', display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
      <Box sx={{
        mt: 0.5,
        p: 1,
        borderRadius: '10px',
        background: `${palette.accent}22`,
        color: palette.accent,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {icon}
      </Box>
      <Box>
        <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: palette.text, lineHeight: 1.1 }}>{value}</Typography>
        <Typography sx={{ fontSize: '0.78rem', color: palette.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', mt: 0.3 }}>
          {label}
        </Typography>
      </Box>
    </Box>
  );
};

const FeatureCard = ({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) => {
  const { palette } = usePublicTheme();
  return (
    <Paper sx={{
      p: 3,
      borderRadius: '16px',
      border: `1px solid ${palette.panelBorder}`,
      background: palette.panel,
      minHeight: '160px',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: palette.mode === 'light' ? '0 12px 32px rgba(45,10,78,0.14)' : '0 12px 32px rgba(0,0,0,0.5)',
      },
    }}>
      <Box sx={{
        mb: 1.5,
        p: 1.2,
        borderRadius: '12px',
        background: `${palette.accent}18`,
        color: palette.accent,
        display: 'inline-flex',
      }}>
        {icon}
      </Box>
      <Typography sx={{ fontWeight: 700, color: palette.text, mb: 0.5 }}>{title}</Typography>
      <Typography sx={{ fontSize: '0.9rem', color: palette.textMuted, lineHeight: 1.6 }}>{text}</Typography>
    </Paper>
  );
};

const FlowStep = ({ step, label, icon }: { step: number; label: string; icon: React.ReactNode }) => {
  const { palette } = usePublicTheme();
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box sx={{
        width: 36, height: 36, borderRadius: '50%',
        background: `linear-gradient(135deg, ${palette.accentDeep}, ${palette.accent})`,
        color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
      }}>
        {step}
      </Box>
      <Box sx={{ color: palette.accent, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        {icon}
      </Box>
      <Typography sx={{ fontSize: '0.9rem', color: palette.textMuted }}>{label}</Typography>
    </Box>
  );
};

const HomeContent: React.FC = () => {
  const { palette } = usePublicTheme();

  return (
    <>
      {/* Hero */}
      <Box sx={{ px: { xs: 2.5, md: 6 }, pt: { xs: 4, md: 6 } }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <HeartPulse size={18} color={palette.accent} />
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: palette.accent, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Maternal Emergency Response
              </Typography>
            </Box>
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
                endIcon={<ChevronRight size={16} />}
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
              <Stat label="Avg Response Time" value="< 30 min" icon={<Clock size={16} />} />
              <Stat label="Lives Impacted" value="5,000+" icon={<Users size={16} />} />
              <Stat label="Districts" value="45+" icon={<MapPin size={16} />} />
            </Box>
          </Grid>

          {/* Emergency Flow Snapshot */}
          <Grid item xs={12} md={6}>
            <Paper sx={{
              p: 3.5,
              borderRadius: '20px',
              background: palette.panel,
              border: `1px solid ${palette.panelBorder}`,
              boxShadow: palette.mode === 'light' ? '0 16px 40px rgba(45,10,78,0.12)' : '0 16px 40px rgba(0,0,0,0.45)',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Activity size={18} color={palette.accent} />
                <Typography sx={{ fontWeight: 700, color: palette.text }}>Emergency Flow Snapshot</Typography>
              </Box>
              <Box sx={{ display: 'grid', gap: 1.5 }}>
                <FlowStep step={1} label="ASHA triggers emergency" icon={<HeartPulse size={15} />} />
                <FlowStep step={2} label="System assigns nearest ambulance" icon={<Ambulance size={15} />} />
                <FlowStep step={3} label="Hospital alerted with patient data" icon={<Hospital size={15} />} />
                <FlowStep step={4} label="Live tracking + ETA updates" icon={<MapPin size={15} />} />
                <FlowStep step={5} label="Outcome logged and analyzed" icon={<BrainCircuit size={15} />} />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Features */}
      <Box sx={{ px: { xs: 2.5, md: 6 }, mt: 7 }}>
        <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, mb: 2, color: palette.text }}>
          Built for real-world constraints
        </Typography>
        <Grid container spacing={2.5}>
          <Grid item xs={12} md={4}>
            <FeatureCard
              icon={<Zap size={20} />}
              title="Offline-first field workflows"
              text="Critical actions work without connectivity. Data syncs when networks return, keeping frontline workers productive."
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FeatureCard
              icon={<Activity size={20} />}
              title="Real-time ambulance tracking"
              text="Location updates every 30 seconds with ETA notifications for families, ASHA workers, and hospitals."
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FeatureCard
              icon={<Hospital size={20} />}
              title="Hospital readiness"
              text="Beds reserved in advance and patient context shared before arrival to reduce treatment delays."
            />
          </Grid>
        </Grid>
      </Box>

      {/* Trust bar */}
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
          <ShieldCheck size={20} color={palette.accent} />
          <Typography sx={{ fontWeight: 700, color: palette.text }}>Government-aligned workflows</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircle2 size={18} color={palette.accent} />
          <Typography sx={{ fontSize: '0.92rem', color: palette.textMuted }}>Audit-ready logs</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircle2 size={18} color={palette.accent} />
          <Typography sx={{ fontSize: '0.92rem', color: palette.textMuted }}>Role-based access</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircle2 size={18} color={palette.accent} />
          <Typography sx={{ fontSize: '0.92rem', color: palette.textMuted }}>Secure data handling</Typography>
        </Box>
      </Box>

      {/* CTA */}
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <MapPin size={18} />
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 800 }}>Ready to activate a district?</Typography>
            </Box>
            <Typography sx={{ fontSize: '0.95rem', opacity: 0.9 }}>
              Start with a pilot, onboard ASHAs, and see response times drop.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            href="/contact"
            endIcon={<ArrowRight size={16} />}
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
