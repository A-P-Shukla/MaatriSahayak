import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { PublicOutlined, SecurityOutlined, EmojiObjectsOutlined, TimelineOutlined } from '@mui/icons-material';
import PublicLayout, { usePublicTheme } from '../components/PublicLayout';
import krishnaTripathiImg from '../assets/krishna.jpg';
import akhandPratapImg from '../assets/akhand.jpg';
import rishiTiwariImg from '../assets/rishi.jpg';
import arpitUttamImg from '../assets/arpit.jpg';
import awsLogo from '../assets/aws-logo.png';
import psitLogo from '../assets/psit-logo.png';

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

  const team = [
    { name: 'Krishna Tripathi', role: 'Mobile App Development & Backend', img: krishnaTripathiImg },
    { name: 'Akhand Pratap Shukla', role: 'Backend & System Architecture', img: akhandPratapImg },
    { name: 'Rishi Tiwari', role: 'UI/UX & Frontend', img: rishiTiwariImg },
    { name: 'Arpit Uttam', role: 'Machine Learning & CyberSecurity', img: arpitUttamImg },
  ];

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

      <Box sx={{ px: { xs: 2.5, md: 6 }, mt: 6 }}>
        <Paper sx={{
          p: { xs: 3, md: 4 },
          borderRadius: '18px',
          background: palette.panel,
          border: `1px solid ${palette.panelBorder}`,
        }}>
          <Typography sx={{ fontWeight: 800, color: palette.text, mb: 1.5 }}>Acknowledgements</Typography>
          <Typography sx={{ color: palette.textMuted, lineHeight: 1.8, mb: 2 }}>
            This platform exists because of the dedication of our developers, healthcare partners, and supporters
            who believe every mother deserves timely care.
          </Typography>
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2.5, borderRadius: '14px', background: palette.mode === 'light' ? '#FFF' : '#241736', border: `1px solid ${palette.panelBorder}` }}>
                <Typography sx={{ fontWeight: 700, color: palette.text, mb: 1.5 }}>Core Development Team</Typography>
                <Grid container spacing={2}>
                  {team.map((member) => (
                    <Grid key={member.name} item xs={12} sm={6} md={3}>
                      <Box sx={{
                        p: 2, borderRadius: '12px', border: `1px solid ${palette.panelBorder}`,
                        background: palette.mode === 'light' ? '#FCFAFF' : '#20152F',
                        height: '100%',
                      }}>
                        <Box
                          component="img"
                          src={member.img}
                          alt={member.name}
                          draggable={false}
                          onContextMenu={(e) => e.preventDefault()}
                          onDragStart={(e) => e.preventDefault()}
                          sx={{
                            width: '100%',
                            aspectRatio: '1 / 1',
                            objectFit: 'cover',
                            borderRadius: '10px',
                            border: `1px solid ${palette.panelBorder}`,
                            mb: 1.2,
                            userSelect: 'none',
                          }}
                        />
                        <Typography sx={{ fontWeight: 700, color: palette.text, fontSize: '0.95rem' }}>{member.name}</Typography>
                        <Typography sx={{ color: palette.textMuted, fontSize: '0.8rem' }}>{member.role}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2.5, borderRadius: '14px', background: palette.mode === 'light' ? '#FFF' : '#241736', border: `1px solid ${palette.panelBorder}` }}>
                <Typography sx={{ fontWeight: 700, color: palette.text, mb: 0.5 }}>Healthcare Partners</Typography>
                <Typography sx={{ fontSize: '0.9rem', color: palette.textMuted }}>
                  ASHA workers, ANMs, and district officers who validated workflows and impact.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2.5, borderRadius: '14px', background: palette.mode === 'light' ? '#FFF' : '#241736', border: `1px solid ${palette.panelBorder}` }}>
                <Typography sx={{ fontWeight: 700, color: palette.text, mb: 0.5 }}>Supporters & Allies</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, mt: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                    <Box
                      component="img"
                      src={awsLogo}
                      alt="Amazon Web Services"
                      sx={{ height: 28, width: 'auto', filter: palette.mode === 'dark' ? 'brightness(1.1)' : 'none' }}
                    />
                    <Typography sx={{ fontSize: '0.9rem', color: palette.textMuted }}>Amazon Web Services</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                    <Box
                      component="img"
                      src={psitLogo}
                      alt="PSIT Kanpur"
                      sx={{ height: 28, width: 'auto', filter: palette.mode === 'dark' ? 'brightness(1.2)' : 'none' }}
                    />
                    <Typography sx={{ fontSize: '0.9rem', color: palette.textMuted }}>
                      Dr. Nand Kishore Sharma Sir (HOD-CSE, PSIT Kanpur) ·{' '}
                      <Box
                        component="a"
                        href="https://www.psit.ac.in/"
                        target="_blank"
                        rel="noreferrer"
                        sx={{ color: palette.accent, fontWeight: 600, textDecoration: 'none' }}
                      >
                        psit.ac.in
                      </Box>
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
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
