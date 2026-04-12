import React from 'react';
import { Box, Button, Grid, Paper, Typography, Chip } from '@mui/material';
import {
  ArrowRight,
  Users,
  TrendingUp,
  CheckCircle2,
  Clock,
  DollarSign,
  Target,
  Zap,
  Globe,
  Server,
  Smartphone,
  GraduationCap,
  Activity,
} from 'lucide-react';
import PublicLayout, { usePublicTheme } from '../components/PublicLayout';

const PhaseCard = ({
  phase,
  title,
  timeline,
  districts,
  ashaWorkers,
  population,
  status,
  children,
}: {
  phase: number;
  title: string;
  timeline: string;
  districts: string;
  ashaWorkers: string;
  population: string;
  status: 'completed' | 'in-progress' | 'planned';
  children: React.ReactNode;
}) => {
  const { palette } = usePublicTheme();
  
  const statusColors = {
    completed: { bg: '#ECFDF3', border: '#BBF7D0', text: '#16A34A', label: 'Completed' },
    'in-progress': { bg: '#FEF3C7', border: '#FDE68A', text: '#D97706', label: 'In Progress' },
    planned: { bg: '#EFF6FF', border: '#BFDBFE', text: '#2563EB', label: 'Planned' },
  };

  const statusColor = statusColors[status];

  return (
    <Paper sx={{
      p: 4,
      borderRadius: '20px',
      border: `2px solid ${palette.panelBorder}`,
      background: palette.panel,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '6px',
        background: `linear-gradient(90deg, ${palette.accentDeep}, ${palette.accent})`,
      }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Box sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${palette.accentDeep}, ${palette.accent})`,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem',
              fontWeight: 800,
            }}>
              {phase}
            </Box>
            <Box>
              <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: palette.text, lineHeight: 1.2 }}>
                {title}
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', color: palette.textMuted, mt: 0.3 }}>
                {timeline}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Chip
          label={statusColor.label}
          sx={{
            background: palette.mode === 'light' ? statusColor.bg : `${statusColor.text}22`,
            color: statusColor.text,
            border: `1px solid ${palette.mode === 'light' ? statusColor.border : statusColor.text}`,
            fontWeight: 700,
            fontSize: '0.75rem',
          }}
        />
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={4}>
          <Box sx={{ textAlign: 'center', p: 1.5, borderRadius: '10px', background: `${palette.accent}11` }}>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: palette.accent }}>{districts}</Typography>
            <Typography sx={{ fontSize: '0.75rem', color: palette.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Districts</Typography>
          </Box>
        </Grid>
        <Grid item xs={4}>
          <Box sx={{ textAlign: 'center', p: 1.5, borderRadius: '10px', background: `${palette.accent}11` }}>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: palette.accent }}>{ashaWorkers}</Typography>
            <Typography sx={{ fontSize: '0.75rem', color: palette.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>ASHAs</Typography>
          </Box>
        </Grid>
        <Grid item xs={4}>
          <Box sx={{ textAlign: 'center', p: 1.5, borderRadius: '10px', background: `${palette.accent}11` }}>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: palette.accent }}>{population}</Typography>
            <Typography sx={{ fontSize: '0.75rem', color: palette.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Population</Typography>
          </Box>
        </Grid>
      </Grid>

      {children}
    </Paper>
  );
};

const CostBreakdown = ({ items }: { items: { label: string; amount: string; icon: React.ReactNode }[] }) => {
  const { palette } = usePublicTheme();
  return (
    <Box sx={{ display: 'grid', gap: 1.5 }}>
      {items.map((item, i) => (
        <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ color: palette.accent, display: 'flex', alignItems: 'center' }}>
              {item.icon}
            </Box>
            <Typography sx={{ fontSize: '0.9rem', color: palette.textMuted }}>{item.label}</Typography>
          </Box>
          <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: palette.text }}>{item.amount}</Typography>
        </Box>
      ))}
    </Box>
  );
};

const Milestone = ({ text, completed }: { text: string; completed?: boolean }) => {
  const { palette } = usePublicTheme();
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
      <CheckCircle2 size={18} color={completed ? palette.accent : palette.textMuted} style={{ marginTop: 2, flexShrink: 0 }} />
      <Typography sx={{ fontSize: '0.9rem', color: completed ? palette.text : palette.textMuted, lineHeight: 1.6 }}>
        {text}
      </Typography>
    </Box>
  );
};

const RolloutContent: React.FC = () => {
  const { palette } = usePublicTheme();

  return (
    <>
      <Box sx={{ px: { xs: 2.5, md: 6 }, pt: { xs: 4, md: 6 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Target size={18} color={palette.accent} />
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: palette.accent, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Phased Rollout Strategy
          </Typography>
        </Box>
        <Typography sx={{ fontSize: { xs: '2.2rem', md: '3.2rem' }, fontWeight: 900, lineHeight: 1.1, color: palette.text }}>
          From pilot to national scale in 18 months.
        </Typography>
        <Typography sx={{ mt: 2, fontSize: '1rem', color: palette.textMuted, lineHeight: 1.8, maxWidth: 820 }}>
          A proven, risk-mitigated approach to scaling maternal emergency response across India. Each phase validates impact before expansion.
        </Typography>
      </Box>

      <Box sx={{ px: { xs: 2.5, md: 6 }, mt: 6 }}>
        <Paper sx={{
          p: 4,
          borderRadius: '20px',
          background: `linear-gradient(135deg, ${palette.accentDeep}22 0%, ${palette.accent}11 100%)`,
          border: `1px solid ${palette.panelBorder}`,
        }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: { xs: 'left', md: 'center' } }}>
                <Typography sx={{ fontSize: '2.5rem', fontWeight: 900, color: palette.accent }}>18</Typography>
                <Typography sx={{ fontSize: '0.85rem', color: palette.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Months to National
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: { xs: 'left', md: 'center' } }}>
                <Typography sx={{ fontSize: '2.5rem', fontWeight: 900, color: palette.accent }}>₹12.5Cr</Typography>
                <Typography sx={{ fontSize: '0.85rem', color: palette.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Total Investment
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: { xs: 'left', md: 'center' } }}>
                <Typography sx={{ fontSize: '2.5rem', fontWeight: 900, color: palette.accent }}>1M+</Typography>
                <Typography sx={{ fontSize: '0.85rem', color: palette.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  ASHA Workers Trained
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      <Box sx={{ px: { xs: 2.5, md: 6 }, mt: 6 }}>
        <PhaseCard
          phase={1}
          title="Pilot District"
          timeline="Months 1-6"
          districts="1"
          ashaWorkers="800"
          population="1.2M"
          status="in-progress"
        >
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontWeight: 700, color: palette.text, mb: 1.5 }}>Key Objectives</Typography>
            <Box sx={{ display: 'grid', gap: 1 }}>
              <Milestone text="Validate end-to-end emergency workflow in real conditions" completed />
              <Milestone text="Train 800 ASHA workers with cascaded model" completed />
              <Milestone text="Achieve < 30 min average response time" />
              <Milestone text="Collect baseline data for impact measurement" />
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontWeight: 700, color: palette.text, mb: 1.5 }}>Infrastructure</Typography>
            <CostBreakdown items={[
              { label: 'AWS infrastructure (Mumbai region)', amount: '₹8L/year', icon: <Server size={16} /> },
              { label: 'Mobile app deployment & updates', amount: '₹3L', icon: <Smartphone size={16} /> },
              { label: 'Training materials (Hindi + regional)', amount: '₹2L', icon: <GraduationCap size={16} /> },
              { label: 'District officer onboarding', amount: '₹1.5L', icon: <Users size={16} /> },
            ]} />
          </Box>

          <Box sx={{
            p: 2.5,
            borderRadius: '12px',
            background: palette.mode === 'light' ? '#F0FDF4' : '#193022',
            border: `1px solid ${palette.mode === 'light' ? '#BBF7D0' : '#2A4A36'}`,
          }}>
            <Typography sx={{ fontWeight: 800, color: palette.accent, mb: 0.5 }}>Phase 1 Total: ₹14.5L</Typography>
            <Typography sx={{ fontSize: '0.85rem', color: palette.textMuted }}>
              One-time setup + 6 months operational costs
            </Typography>
          </Box>
        </PhaseCard>
      </Box>

      <Box sx={{ px: { xs: 2.5, md: 6 }, mt: 4 }}>
        <PhaseCard
          phase={2}
          title="Regional Expansion"
          timeline="Months 7-12"
          districts="5"
          ashaWorkers="4,000"
          population="6M"
          status="planned"
        >
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontWeight: 700, color: palette.text, mb: 1.5 }}>Key Objectives</Typography>
            <Box sx={{ display: 'grid', gap: 1 }}>
              <Milestone text="Replicate pilot success across 5 districts" />
              <Milestone text="Optimize training model based on Phase 1 learnings" />
              <Milestone text="Integrate with state health department systems" />
              <Milestone text="Establish district-level support teams" />
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontWeight: 700, color: palette.text, mb: 1.5 }}>Infrastructure</Typography>
            <CostBreakdown items={[
              { label: 'AWS infrastructure scaling (5x)', amount: '₹35L/year', icon: <Server size={16} /> },
              { label: 'Training 4,000 ASHAs (cascaded)', amount: '₹8L', icon: <GraduationCap size={16} /> },
              { label: 'District coordination teams (5)', amount: '₹12L', icon: <Users size={16} /> },
              { label: 'Real-time monitoring dashboard', amount: '₹5L', icon: <Activity size={16} /> },
            ]} />
          </Box>

          <Box sx={{
            p: 2.5,
            borderRadius: '12px',
            background: palette.mode === 'light' ? '#EFF6FF' : '#1E3A5F',
            border: `1px solid ${palette.mode === 'light' ? '#BFDBFE' : '#2A4A6A'}`,
          }}>
            <Typography sx={{ fontWeight: 800, color: palette.mode === 'light' ? '#2563EB' : '#60A5FA', mb: 0.5 }}>
              Phase 2 Total: ₹60L
            </Typography>
            <Typography sx={{ fontSize: '0.85rem', color: palette.textMuted }}>
              6 months operational costs for 5 districts
            </Typography>
          </Box>
        </PhaseCard>
      </Box>

      <Box sx={{ px: { xs: 2.5, md: 6 }, mt: 4 }}>
        <PhaseCard
          phase={3}
          title="National Rollout"
          timeline="Months 13-18"
          districts="All"
          ashaWorkers="1M+"
          population="1.4B"
          status="planned"
        >
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontWeight: 700, color: palette.text, mb: 1.5 }}>Key Objectives</Typography>
            <Box sx={{ display: 'grid', gap: 1 }}>
              <Milestone text="Deploy across all 707 districts in India" />
              <Milestone text="Train 1M+ ASHA workers nationwide" />
              <Milestone text="Integrate with National Health Mission systems" />
              <Milestone text="Establish 24/7 national support center" />
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontWeight: 700, color: palette.text, mb: 1.5 }}>Infrastructure</Typography>
            <CostBreakdown items={[
              { label: 'AWS infrastructure (national scale)', amount: '₹4.5Cr/year', icon: <Server size={16} /> },
              { label: 'Training 1M ASHAs (cascaded)', amount: '₹3Cr', icon: <GraduationCap size={16} /> },
              { label: 'State coordination teams (28)', amount: '₹2.5Cr', icon: <Users size={16} /> },
              { label: 'National monitoring & analytics', amount: '₹1.5Cr', icon: <Globe size={16} /> },
            ]} />
          </Box>

          <Box sx={{
            p: 2.5,
            borderRadius: '12px',
            background: palette.mode === 'light' ? '#FEF3C7' : '#3A2A16',
            border: `1px solid ${palette.mode === 'light' ? '#FDE68A' : '#4A3A26'}`,
          }}>
            <Typography sx={{ fontWeight: 800, color: palette.mode === 'light' ? '#D97706' : '#FCD34D', mb: 0.5 }}>
              Phase 3 Total: ₹11.5Cr
            </Typography>
            <Typography sx={{ fontSize: '0.85rem', color: palette.textMuted }}>
              6 months operational costs for national deployment
            </Typography>
          </Box>
        </PhaseCard>
      </Box>

      <Box sx={{ px: { xs: 2.5, md: 6 }, mt: 6 }}>
        <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, mb: 3, color: palette.text }}>
          Cost Efficiency at Scale
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{
              p: 3,
              borderRadius: '16px',
              border: `1px solid ${palette.panelBorder}`,
              background: palette.panel,
              textAlign: 'center',
            }}>
              <DollarSign size={32} color={palette.accent} style={{ marginBottom: 12 }} />
              <Typography sx={{ fontSize: '2rem', fontWeight: 900, color: palette.accent }}>₹125</Typography>
              <Typography sx={{ fontSize: '0.85rem', color: palette.textMuted, mt: 0.5 }}>
                Cost per ASHA worker (annual)
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{
              p: 3,
              borderRadius: '16px',
              border: `1px solid ${palette.panelBorder}`,
              background: palette.panel,
              textAlign: 'center',
            }}>
              <Clock size={32} color={palette.accent} style={{ marginBottom: 12 }} />
              <Typography sx={{ fontSize: '2rem', fontWeight: 900, color: palette.accent }}>50%</Typography>
              <Typography sx={{ fontSize: '0.85rem', color: palette.textMuted, mt: 0.5 }}>
                Reduction in response time
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{
              p: 3,
              borderRadius: '16px',
              border: `1px solid ${palette.panelBorder}`,
              background: palette.panel,
              textAlign: 'center',
            }}>
              <TrendingUp size={32} color={palette.accent} style={{ marginBottom: 12 }} />
              <Typography sx={{ fontSize: '2rem', fontWeight: 900, color: palette.accent }}>30%</Typography>
              <Typography sx={{ fontSize: '0.85rem', color: palette.textMuted, mt: 0.5 }}>
                Improvement in maternal outcomes
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ px: { xs: 2.5, md: 6 }, mt: 6 }}>
        <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, mb: 3, color: palette.text }}>
          Risk Mitigation Strategy
        </Typography>
        <Grid container spacing={2.5}>
          <Grid item xs={12} md={6}>
            <Paper sx={{
              p: 3,
              borderRadius: '16px',
              border: `1px solid ${palette.panelBorder}`,
              background: palette.panel,
            }}>
              <Typography sx={{ fontWeight: 700, color: palette.text, mb: 1.5 }}>Technical Risks</Typography>
              <Box sx={{ display: 'grid', gap: 1.2 }}>
                <Box>
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: palette.text }}>
                    • Connectivity issues
                  </Typography>
                  <Typography sx={{ fontSize: '0.85rem', color: palette.textMuted, pl: 2 }}>
                    Offline-first architecture + SMS fallback
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: palette.text }}>
                    • System downtime
                  </Typography>
                  <Typography sx={{ fontSize: '0.85rem', color: palette.textMuted, pl: 2 }}>
                    Multi-AZ deployment with 99.9% uptime SLA
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: palette.text }}>
                    • Data security breaches
                  </Typography>
                  <Typography sx={{ fontSize: '0.85rem', color: palette.textMuted, pl: 2 }}>
                    End-to-end encryption + regular security audits
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{
              p: 3,
              borderRadius: '16px',
              border: `1px solid ${palette.panelBorder}`,
              background: palette.panel,
            }}>
              <Typography sx={{ fontWeight: 700, color: palette.text, mb: 1.5 }}>Operational Risks</Typography>
              <Box sx={{ display: 'grid', gap: 1.2 }}>
                <Box>
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: palette.text }}>
                    • Low ASHA adoption
                  </Typography>
                  <Typography sx={{ fontSize: '0.85rem', color: palette.textMuted, pl: 2 }}>
                    Incentive programs + supervisor-led training
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: palette.text }}>
                    • Ambulance coordination failures
                  </Typography>
                  <Typography sx={{ fontSize: '0.85rem', color: palette.textMuted, pl: 2 }}>
                    Manual override + 24/7 dispatch support
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: palette.text }}>
                    • Budget constraints
                  </Typography>
                  <Typography sx={{ fontSize: '0.85rem', color: palette.textMuted, pl: 2 }}>
                    Phased funding model + government partnerships
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ px: { xs: 2.5, md: 6 }, mt: 6 }}>
        <Paper sx={{
          p: 4,
          borderRadius: '20px',
          background: palette.panel,
          border: `1px solid ${palette.panelBorder}`,
        }}>
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, mb: 3, color: palette.text }}>
            Success Metrics by Phase
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box>
                <Typography sx={{ fontWeight: 700, color: palette.accent, mb: 1 }}>Phase 1 KPIs</Typography>
                <Box sx={{ display: 'grid', gap: 0.8 }}>
                  <Typography sx={{ fontSize: '0.85rem', color: palette.textMuted }}>• 80% ASHA adoption rate</Typography>
                  <Typography sx={{ fontSize: '0.85rem', color: palette.textMuted }}>• &lt; 30 min response time</Typography>
                  <Typography sx={{ fontSize: '0.85rem', color: palette.textMuted }}>• 95% emergency completion</Typography>
                  <Typography sx={{ fontSize: '0.85rem', color: palette.textMuted }}>• 90% user satisfaction</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box>
                <Typography sx={{ fontWeight: 700, color: palette.accent, mb: 1 }}>Phase 2 KPIs</Typography>
                <Box sx={{ display: 'grid', gap: 0.8 }}>
                  <Typography sx={{ fontSize: '0.85rem', color: palette.textMuted }}>• 85% ASHA adoption rate</Typography>
                  <Typography sx={{ fontSize: '0.85rem', color: palette.textMuted }}>• &lt; 28 min response time</Typography>
                  <Typography sx={{ fontSize: '0.85rem', color: palette.textMuted }}>• 20% reduction in MMR</Typography>
                  <Typography sx={{ fontSize: '0.85rem', color: palette.textMuted }}>• 5 districts operational</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box>
                <Typography sx={{ fontWeight: 700, color: palette.accent, mb: 1 }}>Phase 3 KPIs</Typography>
                <Box sx={{ display: 'grid', gap: 0.8 }}>
                  <Typography sx={{ fontSize: '0.85rem', color: palette.textMuted }}>• 90% ASHA adoption rate</Typography>
                  <Typography sx={{ fontSize: '0.85rem', color: palette.textMuted }}>• &lt; 25 min response time</Typography>
                  <Typography sx={{ fontSize: '0.85rem', color: palette.textMuted }}>• 30% reduction in MMR</Typography>
                  <Typography sx={{ fontSize: '0.85rem', color: palette.textMuted }}>• 707 districts operational</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      <Box sx={{ px: { xs: 2.5, md: 6 }, mt: 6 }}>
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
              <Zap size={18} />
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 800 }}>Ready to start Phase 1?</Typography>
            </Box>
            <Typography sx={{ fontSize: '0.95rem', opacity: 0.9 }}>
              Partner with us to pilot MaatriSahayak in your district.
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
              fontWeight: 700,
              '&:hover': {
                borderColor: '#fff',
                background: 'rgba(255,255,255,0.1)',
              },
            }}
          >
            Launch a Pilot District
          </Button>
        </Paper>
      </Box>
    </>
  );
};

const Rollout: React.FC = () => (
  <PublicLayout>
    <RolloutContent />
  </PublicLayout>
);

export default Rollout;
