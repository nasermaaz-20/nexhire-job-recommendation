import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Skeleton,
} from '@mui/material';
import {
  Work as WorkIcon,
  People as PeopleIcon,
  Add as AddIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import { useAuthStore } from '../../store/authStore';
import { getCompanyJobs, getJobApplicants } from '../../api/companiesApi';
import { getCompanyProfile } from '../../api/companiesApi';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const STATUS_LABELS = { 1: 'Pending', 2: 'Reviewed', 3: 'Reviewed', 4: 'Rejected', 5: 'Accepted' };
const STATUS_COLORS = { 1: 'warning', 2: 'info', 3: 'info', 4: 'error', 5: 'success' };

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [stats, setStats] = useState({ activeJobs: 0, totalApplicants: 0 });
  const [recentApplications, setRecentApplications] = useState([]);
  const [activeJobs, setActiveJobs] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [jobsData, profileData] = await Promise.all([
        getCompanyJobs(),
        getCompanyProfile().catch(() => null),
      ]);
      const jobs = jobsData.data || [];
      const active = jobs.filter((j) => j.is_active);

      if (profileData?.data) setCompanyProfile(profileData.data);

      setActiveJobs(active.slice(0, 4));

      let totalApplicants = 0;
      let allApplications = [];

      for (const job of active) {
        try {
          const applicantsData = await getJobApplicants(job.id);
          const applicants = applicantsData.data || [];
          totalApplicants += applicants.length;
          allApplications = [
            ...allApplications,
            ...applicants.map((a) => ({ ...a, _job_title: job.title, _job_id: job.id })),
          ];
        } catch (err) {
          // skip failed job
        }
      }

      allApplications.sort((a, b) => dayjs(b.applied_at).diff(dayjs(a.applied_at)));
      setRecentApplications(allApplications.slice(0, 10));
      setStats({ activeJobs: active.length, totalApplicants });
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Skeleton variant="text" width={300} height={50} sx={{ mb: 3 }} />
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
            ))}
          </Box>
          <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
        </Container>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Company Dashboard
          </Typography>
          <Typography variant="h6" sx={{ color: '#666' }}>
            Welcome, {user?.name || 'Company'}!
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            gap: 2,
            mb: 3,
          }}
        >
          <StatCard title="Active Jobs" value={stats.activeJobs} icon={WorkIcon} color="#0A66C2" />
          <StatCard title="Total Applicants" value={stats.totalApplicants} icon={PeopleIcon} color="#057642" />
          {/* Company Info Card */}
          <Card sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <BusinessIcon sx={{ color: '#0A66C2' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Company Info</Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{companyProfile?.name || user?.name || '—'}</Typography>
              <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>ID: {companyProfile?.id || user?.id || '—'}</Typography>
              <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>{companyProfile?.email || user?.email || '—'}</Typography>
              <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>{companyProfile?.location_name || '—'}</Typography>
            </CardContent>
          </Card>
        </Box>

        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Recent Applications
              </Typography>
              <Button onClick={() => navigate('/company/my-jobs')}>View All</Button>
            </Box>

            {recentApplications.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" sx={{ color: '#666' }}>
                  No applications yet
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Candidate</TableCell>
                      <TableCell>Role / Job</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentApplications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell>
                          ({app.user?.id}) {app.user?.name || '—'}
                        </TableCell>
                        <TableCell>
                          ({app._job_id}) {app._job_title || '—'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={STATUS_LABELS[app.status] || app.status}
                            size="small"
                            color={STATUS_COLORS[app.status] || 'default'}
                          />
                        </TableCell>
                        <TableCell>{dayjs(app.applied_at).fromNow()}</TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            onClick={() => navigate(`/company/applicants/${app._job_id}`)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Your Active Jobs
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/company/post-job')}
                >
                  Post New Job
                </Button>
              </Box>

              {activeJobs.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" sx={{ color: '#666', mb: 2 }}>
                    No active jobs
                  </Typography>
                  <Button variant="contained" onClick={() => navigate('/company/post-job')}>
                    Post Your First Job
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {activeJobs.map((job) => (
                    <Card key={job.id} variant="outlined" sx={{ borderRadius: 1 }}>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                          {job.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                          <Typography variant="body2" sx={{ color: '#666' }}>
                            📄 {job.applications || 0} applicants
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#666' }}>
                            👁 {job.views || 0} views
                          </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ color: '#999' }}>
                          Posted {dayjs(job.created_at).fromNow()}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => navigate('/company/post-job')}
                >
                  Post a New Job
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/company/my-jobs')}
                >
                  View All Jobs
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/company/profile')}
                >
                  Edit Company Profile
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </DashboardLayout>
  );
};

export default CompanyDashboard;
