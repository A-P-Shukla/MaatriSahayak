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
  X,
  TrendingUp,
  HelpCircle,
  Wifi,
  GraduationCap,
  Lock,
  UserCheck,
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
                See the 30-Min Response
              </Button>
              <Button
                variant="outlined"
                href="/rollout"
                sx={{
                  textTransform: 'none',
                  borderRadius: '12px',
                  borderColor: palette.accentDeep,
                  color: palette.accentDeep,
                  fontWeight: 700,
                }}
              >
                View Rollout Plan
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
                Deploy in Your District
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

      {/* Competitor Comparison */}
      <Box id="competitor-comparison" sx={{ px: { xs: 2.5, md: 6 }, mt: 7 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <TrendingUp size={18} color={palette.accent} />
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: palette.text }}>
            Why MaatriSahayak?
          </Typography>
        </Box>
        <Typography sx={{ fontSize: '0.95rem', color: palette.textMuted, mb: 3, maxWidth: '800px' }}>
          Purpose-built for maternal emergencies in rural India with end-to-end coordination.
        </Typography>

        <Paper sx={{
          borderRadius: '16px',
          border: `1px solid ${palette.panelBorder}`,
          background: palette.panel,
          overflow: 'hidden',
        }}>
          <Box sx={{ overflowX: 'auto' }}>
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
              <Box component="thead">
                <Box component="tr" sx={{ borderBottom: `2px solid ${palette.panelBorder}` }}>
                  <Box component="th" sx={{ p: 2.5, textAlign: 'left', fontWeight: 700, color: palette.text, fontSize: '0.9rem' }}>
                    Feature
                  </Box>
                  <Box component="th" sx={{ p: 2.5, textAlign: 'center', fontWeight: 700, color: palette.accent, fontSize: '0.9rem' }}>
                    MaatriSahayak
                  </Box>
                  <Box component="th" sx={{ p: 2.5, textAlign: 'center', fontWeight: 600, color: palette.textMuted, fontSize: '0.85rem' }}>
                    ANMOL
                  </Box>
                  <Box component="th" sx={{ p: 2.5, textAlign: 'center', fontWeight: 600, color: palette.textMuted, fontSize: '0.85rem' }}>
                    PMSMA
                  </Box>
                  <Box component="th" sx={{ p: 2.5, textAlign: 'center', fontWeight: 600, color: palette.textMuted, fontSize: '0.85rem' }}>
                    108 Service
                  </Box>
                </Box>
              </Box>
              <Box component="tbody">
                <Box component="tr" sx={{ borderBottom: `1px solid ${palette.panelBorder}` }}>
                  <Box component="td" sx={{ p: 2.5, color: palette.text, fontSize: '0.88rem' }}>
                    Emergency ambulance dispatch
                  </Box>
                  <Box component="td" sx={{ p: 2.5, textAlign: 'center' }}>
                    <CheckCircle2 size={20} color={palette.accent} />
                  </Box>
                  <Box component="td" sx={{ p: 2.5, textAlign: 'center' }}>
                    <X size={20} color={palette.textMuted} opacity={0.4} />
                  </Box>
                  <Box component="td" sx={{ p: 2.5, textAlign: 'center' }}>
                    <X size={20} color={palette.textMuted} opacity={0.4} />
                  </Box>
                  <Box component="td" sx={{ p: 2.5, textAlign: 'center' }}>
                    <CheckCircle2 size={20} color={palette.accent} />
                  </Box>
                </Box>
                <Box component="tr" sx={{ borderBottom: `1px solid ${palette.panelBorder}` }}>
                  <Box component="td" sx={{ p: 2.5, color: palette.text, fontSize: '0.88rem' }}>
                    Offline-first workflows
                  </Box>
                  <Box component="td" sx={{ p: 2.5, textAlign: 'center' }}>
                    <CheckCircle2 size={20} color={palette.accent} />
                  </Box>
                  <Box component="td" sx={{ p: 2.5, textAlign: 'center' }}>
                    <X size={20} color={palette.textMuted} opacity={0.4} />
                  </Box>
                  <Box component="td" sx={{ p: 2.5, textAlign: 'center' }}>
                    <X size={20} color={palette.textMuted} opacity={0.4} />
                  </Box>
                  <Box component="td" sx={{ p: 2.5, textAlign: 'center' }}>
                    <X size={20} color={palette.textMuted} opacity={0.4} />
                  </Box>
                </Box>
                <Box component="tr" sx={{ borderBottom: `1px solid ${palette.panelBorder}` }}>
                  <Box component="td" sx={{ p: 2.5, color: palette.text, fontSize: '0.88rem' }}>
                    ASHA worker integration
                  </Box>
                  <Box component="td" sx={{ p: 2.5, textAlign: 'center' }}>
                    <CheckCircle2 size={20} color={palette.accent} />
                  </Box>
                  <Box component="td" sx={{ p: 2.5, textAlign: 'center' }}>
                    <CheckCircle2 size={20} color={palette.accent} />
                  </Box>
                  <Box component="td" sx={{ p: 2.5, textAlign: 'center' }}>
                    <CheckCircle2 size={20} color={palette.accent} />
                  </Box>
                  <Box component="td" sx={{ p: 2.5, textAlign: 'center' }}>
                    <X size={20} color={palette.textMuted} opacity={0.4} />
                  </Box>
                </Box>
                <Box component="tr" sx={{ borderBottom: `1px solid ${palette.panelBorder}` }}>
                  <Box component="td" sx={{ p: 2.5, color: palette.text, fontSize: '0.88rem' }}>
                    Real-time ambulance tracking
                  </Box>
                  <Box component="td" sx={{ p: 2.5, textAlign: 'center' }}>
                    <CheckCircle2 size={20} color={palette.accent} />
                  </Box>
                  <Box component="td" sx={{ p: 2.5, textAlign: 'center' }}>
                    <X size={20} color={palette.textMuted} opacity={0.4} />
                  </Box>
                  <Box component="td" sx={{ p: 2.5, textAlign: 'center' }}>
                    <X size={20} color={palette.textMuted} opacity={0.4} />
                  </Box>
                  <Box component="td" sx={{ p: 2.5, textAlign: 'center' }}>
                    <X size={20} color={palette.textMuted} opacity={0.4} />
                  </Box>
                </Box>
                <Box component="tr" sx={{ borderBottom: `1px solid ${palette.panelBorder}` }}>
                  <Box component="td" sx={{ p: 2.5, color: palette.text, fontSize: '0.88rem' }}>
                    Hospital pre-alerting
                  </Box>
                  <Box component="td" sx={{ p: 2.5, textAlign: 'center' }}>
                    <CheckCircle2 size={20} color={palette.accent} />
                  </Box>
                  <Box component="td" sx={{ p: 2.5, textAlign: 'center' }}>
                    <X size={20} color={palette.textMuted} opacity={0.4} />
                  </Box>
                  <Box component="td" sx={{ p: 2.5, textAlign: 'center' }}>
                    <X size={20} color={palette.textMuted} opacity={0.4} />
                  </Box>
                  <Box component="td" sx={{ p: 2.5, textAlign: 'center' }}>
                    <X size={20} color={palette.textMuted} opacity={0.4} />
                  </Box>
                </Box>
                <Box component="tr" sx={{ borderBottom: `1px solid ${palette.panelBorder}` }}>
                  <Box component="td" sx={{ p: 2.5, color: palette.text, fontSize: '0.88rem' }}>
                    Pregnancy tracking & ANC
                  </Box>
                  <Box component="td" sx={{ p: 2.5, textAlign: 'center' }}>
                    <CheckCircle2 size={20} color={palette.accent} />
                  </Box>
                  <Box component="td" sx={{ p: 2.5, textAlign: 'center' }}>
                    <CheckCircle2 size={20} color={palette.accent} />
                  </Box>
                  <Box component="td" sx={{ p: 2.5, textAlign: 'center' }}>
                    <CheckCircle2 size={20} color={palette.accent} />
                  </Box>
                  <Box component="td" sx={{ p: 2.5, textAlign: 'center' }}>
                    <X size={20} color={palette.textMuted} opacity={0.4} />
                  </Box>
                </Box>
                <Box component="tr" sx={{ borderBottom: `1px solid ${palette.panelBorder}` }}>
                  <Box component="td" sx={{ p: 2.5, color: palette.text, fontSize: '0.88rem' }}>
                    AI risk prediction
                  </Box>
                  <Box component="td" sx={{ p: 2.5, textAlign: 'center' }}>
                    <CheckCircle2 size={20} color={palette.accent} />
                  </Box>
                  <Box component="td" sx={{ p: 2.5, textAlign: 'center' }}>
                    <X size={20} color={palette.textMuted} opacity={0.4} />
                  </Box>
                  <Box component="td" sx={{ p: 2.5, textAlign: 'center' }}>
                    <X size={20} color={palette.textMuted} opacity={0.4} />
                  </Box>
                  <Box component="td" sx={{ p: 2.5, textAlign: 'center' }}>
                    <X size={20} color={palette.textMuted} opacity={0.4} />
                  </Box>
                </Box>
                <Box component="tr" sx={{ borderBottom: `1px solid ${palette.panelBorder}` }}>
                  <Box component="td" sx={{ p: 2.5, color: palette.text, fontSize: '0.88rem' }}>
                    End-to-end coordination
                  </Box>
                  <Box component="td" sx={{ p: 2.5, textAlign: 'center' }}>
                    <CheckCircle2 size={20} color={palette.accent} />
                  </Box>
                  <Box component="td" sx={{ p: 2.5, textAlign: 'center', color: palette.textMuted, fontSize: '0.75rem' }}>
                    Partial
                  </Box>
                  <Box component="td" sx={{ p: 2.5, textAlign: 'center', color: palette.textMuted, fontSize: '0.75rem' }}>
                    Partial
                  </Box>
                  <Box component="td" sx={{ p: 2.5, textAlign: 'center', color: palette.textMuted, fontSize: '0.75rem' }}>
                    Transport only
                  </Box>
                </Box>
                <Box component="tr">
                  <Box component="td" sx={{ p: 2.5, color: palette.text, fontSize: '0.88rem' }}>
                    Avg. response time
                  </Box>
                  <Box component="td" sx={{ p: 2.5, textAlign: 'center', fontWeight: 700, color: palette.accent, fontSize: '0.9rem' }}>
                    &lt; 30 min
                  </Box>
                  <Box component="td" sx={{ p: 2.5, textAlign: 'center', color: palette.textMuted, fontSize: '0.85rem' }}>
                    N/A
                  </Box>
                  <Box component="td" sx={{ p: 2.5, textAlign: 'center', color: palette.textMuted, fontSize: '0.85rem' }}>
                    N/A
                  </Box>
                  <Box component="td" sx={{ p: 2.5, textAlign: 'center', color: palette.textMuted, fontSize: '0.85rem' }}>
                    60+ min
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* FAQ Section */}
      <Box sx={{ px: { xs: 2.5, md: 6 }, mt: 7 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <HelpCircle size={18} color={palette.accent} />
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: palette.text }}>
            Frequently Asked Questions
          </Typography>
        </Box>
        <Typography sx={{ fontSize: '0.95rem', color: palette.textMuted, mb: 3, maxWidth: '800px' }}>
          Answers to what stakeholders are thinking.
        </Typography>

        <Grid container spacing={2.5}>
          <Grid item xs={12} md={6}>
            <Paper sx={{
              p: 3,
              borderRadius: '16px',
              border: `1px solid ${palette.panelBorder}`,
              background: palette.panel,
              minHeight: '180px',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
                <Wifi size={20} color={palette.accent} style={{ marginTop: 2, flexShrink: 0 }} />
                <Typography sx={{ fontWeight: 700, color: palette.text, fontSize: '1rem' }}>
                  What happens if there's no internet?
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.9rem', color: palette.textMuted, lineHeight: 1.6, pl: 4.5 }}>
                SMS fallback for critical alerts and offline SQLite storage. ASHA workers can record vitals, trigger emergencies, and track pregnancies without connectivity. Data syncs automatically when network returns.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{
              p: 3,
              borderRadius: '16px',
              border: `1px solid ${palette.panelBorder}`,
              background: palette.panel,
              minHeight: '180px',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
                <GraduationCap size={20} color={palette.accent} style={{ marginTop: 2, flexShrink: 0 }} />
                <Typography sx={{ fontWeight: 700, color: palette.text, fontSize: '1rem' }}>
                  How do you train 1M ASHA workers?
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.9rem', color: palette.textMuted, lineHeight: 1.6, pl: 4.5 }}>
                Cascaded training model: District officers train supervisors, supervisors train ASHAs. 2-hour onboarding with visual guides in Hindi. In-app tooltips and voice assistance for ongoing support.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{
              p: 3,
              borderRadius: '16px',
              border: `1px solid ${palette.panelBorder}`,
              background: palette.panel,
              minHeight: '180px',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
                <Lock size={20} color={palette.accent} style={{ marginTop: 2, flexShrink: 0 }} />
                <Typography sx={{ fontWeight: 700, color: palette.text, fontSize: '1rem' }}>
                  What about data privacy?
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.9rem', color: palette.textMuted, lineHeight: 1.6, pl: 4.5 }}>
                HIPAA-aligned encryption, role-based access control, and audit logs. Patient data is anonymized for analytics. Full compliance documentation available at{' '}
                <Box component="a" href="/about" sx={{ color: palette.accent, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                  our compliance page
                </Box>.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{
              p: 3,
              borderRadius: '16px',
              border: `1px solid ${palette.panelBorder}`,
              background: palette.panel,
              minHeight: '180px',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
                <UserCheck size={20} color={palette.accent} style={{ marginTop: 2, flexShrink: 0 }} />
                <Typography sx={{ fontWeight: 700, color: palette.text, fontSize: '1rem' }}>
                  Is this replacing doctors?
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.9rem', color: palette.textMuted, lineHeight: 1.6, pl: 4.5 }}>
                No. MaatriSahayak gives ASHA workers clinical intelligence to identify risks early and coordinate care faster. Doctors remain the decision-makers. We're augmenting frontline workers, not replacing medical professionals.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{
              p: 3,
              borderRadius: '16px',
              border: `1px solid ${palette.panelBorder}`,
              background: palette.panel,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
                <TrendingUp size={20} color={palette.accent} style={{ marginTop: 2, flexShrink: 0 }} />
                <Typography sx={{ fontWeight: 700, color: palette.text, fontSize: '1rem' }}>
                  What's the difference from government tools?
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.9rem', color: palette.textMuted, lineHeight: 1.6, pl: 4.5 }}>
                We integrate with existing systems (ANMOL, PMSMA) but add end-to-end emergency coordination that's missing. See the{' '}
                <Box component="a" href="#competitor-comparison" sx={{ color: palette.accent, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                  detailed comparison table above
                </Box>{' '}
                for feature-by-feature breakdown.
              </Typography>
            </Paper>
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
            Start a Pilot Program
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
