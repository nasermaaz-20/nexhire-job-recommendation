import { useState } from 'react';
import { Navigate, Link as RouterLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  AppBar,
  Toolbar,
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  PersonAdd,
  AutoAwesome,
  WorkOutline,
  TrendingUp,
  Speed,
  LocationOn,
  Notifications,
  LinkedIn,
  Twitter,
  GitHub,
  CheckCircle,
} from '@mui/icons-material';
import logo from '../../assets/logo/logo.png';

const LandingPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user) {
    return <Navigate to="/dashboard" replace />;
  }

  const navItems = [
    { label: 'For Employers', path: '/employers' },
    { label: 'Sign in', path: '/login', variant: 'outlined' },
    { label: 'Join now', path: '/signup', variant: 'contained' },
  ];

  return (
    <Box>
      <AppBar position="fixed" sx={{ backgroundColor: '#FFFFFF', boxShadow: '0 0 0 1px rgba(0,0,0,0.08)' }}>
        <Toolbar>
          <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box
              component={RouterLink}
              to="/"
              sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', gap: 1 }}
            >
              <img src={logo} alt="NexHire" style={{ height: '40px' }} />
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: '#0A66C2', fontSize: '24px' }}
              >
                NexHire
              </Typography>
            </Box>

            {isMobile ? (
              <>
                <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: '#191919' }}>
                  <MenuIcon />
                </IconButton>
                <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                  <List sx={{ width: 250 }}>
                    {navItems.map((item) => (
                      <ListItem key={item.label} button component={RouterLink} to={item.path} onClick={() => setDrawerOpen(false)}>
                        <ListItemText primary={item.label} />
                      </ListItem>
                    ))}
                  </List>
                </Drawer>
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Button component={RouterLink} to="/employers" sx={{ color: '#191919', textTransform: 'none' }}>
                  For Employers
                </Button>
                <Button variant="outlined" component={RouterLink} to="/login">
                  Sign in
                </Button>
                <Button variant="contained" component={RouterLink} to="/signup">
                  Join now
                </Button>
              </Box>
            )}
          </Container>
        </Toolbar>
      </AppBar>

      <Box sx={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F0F7FF 100%)', pt: 12, pb: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h1" sx={{ fontSize: { xs: '32px', md: '48px' }, fontWeight: 700, mb: 2 }}>
                Find Your Next <br />
                <span style={{ color: '#0A66C2' }}>Career Move</span>
              </Typography>
              <Typography variant="body1" sx={{ fontSize: '18px', color: '#666666', mb: 4, maxWidth: 500 }}>
                AI-powered job recommendations that match your skills, experience, and career goals. Your dream job is closer than you think.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <Button variant="contained" size="large" component={RouterLink} to="/signup" sx={{ borderRadius: '24px', px: 4 }}>
                  Get Started - It&apos;s Free
                </Button>
                <Button variant="outlined" size="large" sx={{ borderRadius: '24px', px: 4 }}>
                  Learn More
                </Button>
              </Box>
              <Typography variant="body2" sx={{ color: '#666666' }}>
                Already have an account?{' '}
                <Button component={RouterLink} to="/login" sx={{ textTransform: 'none', p: 0, minWidth: 'auto' }}>
                  Sign in
                </Button>
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #0A66C2 0%, #00A0DC 100%)',
                  borderRadius: '16px',
                  p: 4,
                  position: 'relative',
                  minHeight: 400,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 20px 60px rgba(10, 102, 194, 0.3)',
                }}
              >
                <Box sx={{ position: 'relative', width: '100%' }}>
                  <Paper
                    sx={{
                      p: 3,
                      mb: 2,
                      transform: 'rotate(-2deg)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Senior Software Engineer</Typography>
                    <Typography variant="body2" sx={{ color: '#666666', mb: 2 }}>Google • San Francisco, CA</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle sx={{ color: '#057642', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#057642' }}>92% Match</Typography>
                    </Box>
                  </Paper>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', transform: 'rotate(1deg)' }}>
                    {['React', 'Node.js', 'AWS', 'TypeScript'].map((skill) => (
                      <Paper key={skill} sx={{ px: 2, py: 1, backgroundColor: '#FFFFFF' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{skill}</Typography>
                      </Paper>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box sx={{ backgroundColor: '#F4F2EE', py: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="body2" sx={{ textAlign: 'center', color: '#666666', mb: 3 }}>
            Trusted by professionals worldwide
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 4 }}>
            {['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple'].map((company) => (
              <Typography key={company} variant="h6" sx={{ color: '#999999', fontWeight: 600 }}>
                {company}
              </Typography>
            ))}
          </Box>
        </Container>
      </Box>

      <Box sx={{ py: 8, backgroundColor: '#FFFFFF' }}>
        <Container maxWidth="lg">
          <Typography variant="h2" sx={{ textAlign: 'center', mb: 1, fontWeight: 600 }}>
            How It Works
          </Typography>
          <Typography variant="body1" sx={{ textAlign: 'center', color: '#666666', mb: 6 }}>
            Get hired in 3 simple steps
          </Typography>

          <Grid container spacing={4}>
            {[
              { icon: PersonAdd, number: '01', title: 'Create Your Profile', desc: 'Add your skills, experience, and preferences. It only takes 2 minutes.' },
              { icon: AutoAwesome, number: '02', title: 'Get Smart Matches', desc: 'Our AI analyzes your profile and finds jobs that truly fit you.' },
              { icon: WorkOutline, number: '03', title: 'Apply & Get Hired', desc: 'Apply with confidence knowing each recommendation is tailored for you.' },
            ].map((step) => (
              <Grid size={{ xs: 12, md: 4 }} key={step.number}>
                <Paper
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    height: '100%',
                    transition: 'transform 0.3s',
                    '&:hover': { transform: 'translateY(-8px)' },
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      backgroundColor: '#F0F7FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                    }}
                  >
                    <step.icon sx={{ fontSize: 40, color: '#0A66C2' }} />
                  </Box>
                  <Typography variant="h6" sx={{ color: '#0A66C2', mb: 1, fontWeight: 700 }}>
                    {step.number}
                  </Typography>
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                    {step.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666666' }}>
                    {step.desc}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box sx={{ py: 8, backgroundColor: '#F4F2EE' }}>
        <Container maxWidth="lg">
          <Typography variant="h2" sx={{ textAlign: 'center', mb: 6, fontWeight: 600 }}>
            Why Choose NexHire?
          </Typography>

          <Grid container spacing={4}>
            {[
              { icon: TrendingUp, title: 'AI-Powered Matching', desc: 'Our hybrid recommendation engine combines content analysis with collaborative filtering for 95% accuracy.' },
              { icon: Speed, title: 'Skill-Based Ranking', desc: 'See exactly how your skills match each job. Know your fit before you apply.' },
              { icon: LocationOn, title: 'Smart Filters', desc: 'Filter by location, salary, experience level, remote options, and more.' },
              { icon: Notifications, title: 'Real-Time Updates', desc: 'Get notified instantly when new jobs match your profile.' },
            ].map((feature) => (
              <Grid size={{ xs: 12, sm: 6 }} key={feature.title}>
                <Paper sx={{ p: 4, height: '100%' }}>
                  <feature.icon sx={{ fontSize: 48, color: '#0A66C2', mb: 2 }} />
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666666' }}>
                    {feature.desc}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box sx={{ py: 8, backgroundColor: '#FFFFFF' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {[
              { number: '50,000+', label: 'Job Seekers' },
              { number: '10,000+', label: 'Active Jobs' },
              { number: '5,000+', label: 'Companies' },
              { number: '95%', label: 'Match Accuracy' },
            ].map((stat) => (
              <Grid size={{ xs: 6, md: 3 }} key={stat.label}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h2" sx={{ color: '#0A66C2', fontWeight: 700, mb: 1 }}>
                    {stat.number}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#666666' }}>
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box sx={{ background: 'linear-gradient(135deg, #0A66C2 0%, #004182 100%)', py: 8 }}>
        <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
          <Typography variant="h2" sx={{ color: '#FFFFFF', mb: 2, fontWeight: 600 }}>
            Looking to Hire Top Talent?
          </Typography>
          <Typography variant="body1" sx={{ color: '#FFFFFF', mb: 4, opacity: 0.9 }}>
            Post your jobs and let our AI connect you with the most qualified candidates.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="contained" size="large" sx={{ backgroundColor: '#FFFFFF', color: '#0A66C2', '&:hover': { backgroundColor: '#F4F2EE' } }}>
              Start Hiring
            </Button>
            <Button variant="outlined" size="large" sx={{ borderColor: '#FFFFFF', color: '#FFFFFF', '&:hover': { borderColor: '#FFFFFF', backgroundColor: 'rgba(255,255,255,0.1)' } }}>
              Learn More
            </Button>
          </Box>
        </Container>
      </Box>

      <Box sx={{ backgroundColor: '#191919', color: '#FFFFFF', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <img src={logo} alt="NexHire" style={{ height: '32px', filter: 'brightness(0) invert(1)' }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  NexHire
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#999999', mb: 2 }}>
                AI-powered job recommendations for the modern professional.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton sx={{ color: '#999999' }}><LinkedIn /></IconButton>
                <IconButton sx={{ color: '#999999' }}><Twitter /></IconButton>
                <IconButton sx={{ color: '#999999' }}><GitHub /></IconButton>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 4, md: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                For Job Seekers
              </Typography>
              {['Browse Jobs', 'Create Profile', 'Career Resources', 'Help Center'].map((item) => (
                <Typography key={item} variant="body2" sx={{ color: '#999999', mb: 1, cursor: 'pointer', '&:hover': { color: '#FFFFFF' } }}>
                  {item}
                </Typography>
              ))}
            </Grid>

            <Grid size={{ xs: 12, sm: 4, md: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                For Employers
              </Typography>
              {['Post a Job', 'Browse Candidates', 'Pricing', 'Enterprise'].map((item) => (
                <Typography key={item} variant="body2" sx={{ color: '#999999', mb: 1, cursor: 'pointer', '&:hover': { color: '#FFFFFF' } }}>
                  {item}
                </Typography>
              ))}
            </Grid>

            <Grid size={{ xs: 12, sm: 4, md: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Company
              </Typography>
              {['About Us', 'Contact', 'Privacy Policy', 'Terms of Service'].map((item) => (
                <Typography key={item} variant="body2" sx={{ color: '#999999', mb: 1, cursor: 'pointer', '&:hover': { color: '#FFFFFF' } }}>
                  {item}
                </Typography>
              ))}
            </Grid>
          </Grid>

          <Divider sx={{ my: 4, borderColor: '#333333' }} />

          <Typography variant="body2" sx={{ textAlign: 'center', color: '#999999' }}>
            © 2025 NexHire. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
