import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import dayjs from 'dayjs';
import {
  Container,
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Skeleton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  Send as SendIcon,
  Bookmark as BookmarkIcon,
  Visibility as VisibilityIcon,
  AutoAwesome as AutoAwesomeIcon,
  WorkOutline as WorkOutlineIcon,
  Description as DescriptionIcon,
  ArrowForward as ArrowForwardIcon,
  Lightbulb as LightbulbIcon,
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ProfileCard from '../../components/ui/ProfileCard';
import StatCard from '../../components/ui/StatCard';
import JobCard from '../../components/ui/JobCard';
import EmptyState from '../../components/common/EmptyState';
import { useAuthStore } from '../../store/authStore';
import { useDashboard } from '../../hooks/useDashboard';
import { saveJob, unsaveJob } from '../../api/jobsApi';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { loading, data } = useDashboard(user);
  const [savedJobIds, setSavedJobIds] = useState(new Set());

  const handleSave = async (jobId, isSaving) => {
    try {
      if (isSaving) {
        await saveJob(jobId);
        setSavedJobIds(prev => new Set([...prev, String(jobId)]));
        toast.success('Job saved!');
      } else {
        await unsaveJob(jobId);
        setSavedJobIds(prev => { const s = new Set(prev); s.delete(String(jobId)); return s; });
        toast.success('Job unsaved');
      }
    } catch (err) {
      toast.error('Failed to save job');
    }
  };

  const profile = data.profile;
  const skillsCount = profile?.skills?.length || 0;
  const fieldName = profile?.field_name || user?.field?.name || 'Your Field';

  const quickLinks = [
    { label: 'My Applications', count: data.applicationsCount, path: '/applications', icon: DescriptionIcon },
    { label: 'Saved Jobs', count: data.savedJobsCount, path: '/saved-jobs', icon: BookmarkIcon },
    { label: 'Recommendations', path: '/recommendations', icon: AutoAwesomeIcon },
  ];

  return (
    <DashboardLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={3}>

          {/* LEFT SIDEBAR */}
          <Grid size={{ xs: 12, lg: 3 }} sx={{ display: { xs: 'none', lg: 'block' } }}>
            <Box sx={{ position: 'sticky', top: 72 }}>
              <ProfileCard
                user={{
                  name: user?.name,
                  field: fieldName,
                  skills_count: skillsCount,
                }}
              />

              <Card sx={{ mt: 2, borderRadius: 2, border: '1px solid #E0E0E0' }}>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                    Quick Links
                  </Typography>
                  <List dense disablePadding>
                    {quickLinks.map((link) => (
                      <ListItem key={link.label} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                          onClick={() => navigate(link.path)}
                          sx={{ borderRadius: 1, '&:hover': { backgroundColor: '#F4F2EE' } }}
                        >
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <link.icon sx={{ fontSize: 20, color: '#666666' }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={link.label}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                          {link.count !== undefined && (
                            <Chip
                              label={loading ? '…' : link.count}
                              size="small"
                              sx={{ height: 20, fontSize: '12px', backgroundColor: '#0A66C2', color: '#fff' }}
                            />
                          )}
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Box>
          </Grid>

          {/* CENTER COLUMN */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
                Welcome back, {user?.name}! 👋
              </Typography>
              <Typography variant="body2" sx={{ color: '#666666' }}>
                {dayjs().format('dddd, MMMM D, YYYY')}
              </Typography>
            </Box>

            {/* Stats — 3 cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 6, sm: 4 }}>
                <StatCard
                  title="Applications"
                  value={loading ? '...' : data.applicationsCount}
                  icon={SendIcon}
                  color="#0A66C2"
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}>
                <StatCard
                  title="Saved Jobs"
                  value={loading ? '...' : data.savedJobsCount}
                  icon={BookmarkIcon}
                  color="#057642"
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}>
                <StatCard
                  title="Jobs Viewed"
                  value={loading ? '...' : data.viewedCount}
                  icon={VisibilityIcon}
                  color="#E68523"
                />
              </Grid>
            </Grid>

            {/* Latest Jobs */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Latest Jobs
                </Typography>
                <Button
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/jobs')}
                  sx={{ textTransform: 'none' }}
                >
                  View all
                </Button>
              </Box>

              {loading ? (
                [1, 2, 3].map((i) => (
                  <Skeleton key={i} variant="rectangular" height={180} sx={{ mb: 2, borderRadius: 2 }} />
                ))
              ) : data.recentJobs.length > 0 ? (
                data.recentJobs.map((job) => (
                  <Box key={job.id} sx={{ mb: 2 }}>
                    <JobCard
                      job={job}
                      isSaved={savedJobIds.has(String(job.id))}
                      onSave={handleSave}
                    />
                  </Box>
                ))
              ) : (
                <EmptyState
                  icon={WorkOutlineIcon}
                  title="No jobs yet"
                  description="Check back later for new opportunities."
                />
              )}
            </Box>
          </Grid>

          {/* RIGHT SIDEBAR */}
          <Grid size={{ xs: 12, lg: 3 }} sx={{ display: { xs: 'none', lg: 'block' } }}>
            <Box sx={{ position: 'sticky', top: 72 }}>

              {/* Profile nudge */}
              <Card sx={{ mb: 2, borderRadius: 2, border: '1px solid #E0E0E0' }}>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Keep Your Profile Updated
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 2 }}>
                    Add preferred locations, skills, and salary expectations to get better matches.
                  </Typography>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    onClick={() => navigate('/profile')}
                    sx={{ textTransform: 'none' }}
                  >
                    Go to Profile
                  </Button>
                </CardContent>
              </Card>

              {/* Tip */}
              <Card sx={{ borderRadius: 2, border: '1px solid #E0E0E0', backgroundColor: '#F0F7FF' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <LightbulbIcon sx={{ color: '#0A66C2', fontSize: 24 }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        NexHire Tip
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#666666' }}>
                        Profiles with 5+ skills get 3x more recommendations
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Grid>

        </Grid>
      </Container>
    </DashboardLayout>
  );
};

export default Dashboard;
