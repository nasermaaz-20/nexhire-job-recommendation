import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Button,
  Skeleton,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as PendingIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import DashboardLayout from '../../components/layout/DashboardLayout';
import EmptyState from '../../components/common/EmptyState';
import { getMyApplications, withdrawApplication } from '../../api/applicationsApi';
import { toast } from 'react-toastify';

dayjs.extend(relativeTime);

const MyApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const getEmploymentTypeLabel = (type) => {
    const types = {
      1: 'Full-time',
      2: 'Part-time',
      3: 'Freelance',
      4: 'Contract',
    };
    return types[type] || type;
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const data = await getMyApplications();
      setApplications(data.data || []);
    } catch (err) {
      toast.error('Failed to load applications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e, jobId) => {
    e.stopPropagation();
    try {
      await withdrawApplication(jobId);
      setApplications(prev => prev.filter(app => app.job_id !== jobId));
      toast.success('Application withdrawn');
    } catch (err) {
      toast.error('Failed to withdraw application');
    }
  };

  const getStatusColor = (status) => {
    const statusMap = {
      1: { color: '#E68523', label: 'Unreviewed' },
      2: { color: '#0A66C2', label: 'Reviewed' },
      3: { color: '#0A66C2', label: 'Reviewed' },
      4: { color: '#CC1016', label: 'Rejected' },
      5: { color: '#057642', label: 'Accepted' },
    };
    return statusMap[status] || { color: '#666', label: 'Unknown' };
  };

  const filteredApplications = applications.filter((app) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return app.status === 1;
    if (filter === 'reviewed') return app.status === 2 || app.status === 3;
    if (filter === 'closed') return app.status === 4 || app.status === 5;
    return true;
  });

  return (
    <DashboardLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          My Applications
        </Typography>
        <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
          Track your job applications and their status
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={filter} onChange={(e, newValue) => setFilter(newValue)}>
            <Tab label={`All (${applications.length})`} value="all" />
            <Tab
              label={`Pending (${applications.filter((a) => a.status === 1).length})`}
              value="pending"
            />
            <Tab
              label={`Reviewed (${applications.filter((a) => a.status === 2 || a.status === 3).length})`}
              value="reviewed"
            />
            <Tab
              label={`Closed (${applications.filter((a) => a.status === 4 || a.status === 5).length})`}
              value="closed"
            />
          </Tabs>
        </Box>

        {loading ? (
          <Box>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rectangular" height={150} sx={{ mb: 2, borderRadius: 2 }} />
            ))}
          </Box>
        ) : filteredApplications.length === 0 ? (
          <EmptyState
            icon={DescriptionIcon}
            title="No applications yet"
            description="Start applying to jobs to see them here"
            action={
              <Button variant="contained" onClick={() => navigate('/jobs')}>
                Browse Jobs
              </Button>
            }
          />
        ) : (
          <Box>
            {filteredApplications.map((app) => {
              const statusInfo = getStatusColor(app.status);
              return (
                <Card
                  key={app.id}
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    border: '1px solid #E0E0E0',
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 2 },
                  }}
                  onClick={() => navigate(`/jobs/${app.job_id}`)}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {app.job?.title || 'Job Title'}
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#666', mb: 0.5 }}>
                          {app.job?.company_name || 'Company'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#999', display: 'block', mb: 0.5 }}>
                          Job ID: {app.job_id} · Company ID: {app.job?.company_id}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {app.job?.location_name && (
                            <Chip label={app.job.location_name} size="small" />
                          )}
                          {app.job?.employment_type && (
                            <Chip label={getEmploymentTypeLabel(app.job.employment_type)} size="small" />
                          )}
                          {app.job?.remote_option === 1 && (
                            <Chip
                              label="Remote"
                              size="small"
                              sx={{ backgroundColor: '#E7F5EC', color: '#057642' }}
                            />
                          )}
                          {app.job?.remote_option === 2 && (
                            <Chip
                              label="Hybrid"
                              size="small"
                              sx={{ backgroundColor: '#FFF4E6', color: '#E68523' }}
                            />
                          )}
                        </Box>
                      </Box>
                      <Chip
                        label={statusInfo.label}
                        sx={{
                          backgroundColor: `${statusInfo.color}15`,
                          color: statusInfo.color,
                          fontWeight: 600,
                        }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: '#999' }}>
                        Applied {dayjs(app.applied_at).fromNow()}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        {app.job?.salary_min && app.job?.salary_max && (
                          <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                            ${(app.job.salary_min / 1000).toFixed(0)}k - ${(app.job.salary_max / 1000).toFixed(0)}k
                          </Typography>
                        )}
                        <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            onClick={(e) => handleWithdraw(e, app.job_id)}
                            sx={{ textTransform: 'none' }}
                          >
                            Withdraw
                          </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}
      </Container>
    </DashboardLayout>
  );
};

export default MyApplications;
