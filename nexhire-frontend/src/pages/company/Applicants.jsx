import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  Avatar,
  Button,
  Select,
  MenuItem,
  FormControl,
  Skeleton,
  Divider,
} from '@mui/material';
import { ArrowBack, Person } from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getJobApplicants, updateApplicantStatus } from '../../api/companiesApi';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const STATUS_COLORS = {
  pending: 'warning',
  reviewed: 'info',
  shortlisted: 'primary',
  rejected: 'error',
  hired: 'success',
};

const Applicants = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplicants();
  }, [jobId]);

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const res = await getJobApplicants(jobId);
      setApplicants(res.data || []);
    } catch (err) {
      toast.error('Failed to load applicants');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await updateApplicantStatus(applicationId, newStatus);
      setApplicants(prev =>
        prev.map(a => a.id === applicationId ? { ...a, status: newStatus } : a)
      );
      toast.success('Status updated');
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const getCareerLevelLabel = (level) => {
    const levels = { 1: 'Junior', 2: 'Mid-Level', 3: 'Senior', 4: 'Lead' };
    return levels[level] || 'N/A';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Skeleton variant="text" width={300} height={50} sx={{ mb: 3 }} />
          {[1, 2, 3].map(i => (
            <Skeleton key={i} variant="rectangular" height={120} sx={{ borderRadius: 2, mb: 2 }} />
          ))}
        </Container>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/company/my-jobs')}>
            Back to Jobs
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Applicants ({applicants.length})
          </Typography>
        </Box>

        {applicants.length === 0 ? (
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6">No applicants yet</Typography>
              <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                Applications will appear here once candidates apply.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {applicants.map(app => (
              <Card key={app.id} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: '#0A66C2', width: 48, height: 48 }}>
                        <Person />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {app.user?.name || 'Unknown'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          {app.user?.email || '—'}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                          {app.user?.field_name && (
                            <Chip label={app.user.field_name} size="small" />
                          )}
                          {app.user?.career_level && (
                            <Chip label={getCareerLevelLabel(app.user.career_level)} size="small" variant="outlined" />
                          )}
                          {app.user?.years_of_experience != null && (
                            <Chip label={`${app.user.years_of_experience} yrs exp`} size="small" variant="outlined" />
                          )}
                          {app.user?.location_name && (
                            <Chip label={app.user.location_name} size="small" variant="outlined" />
                          )}
                        </Box>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                      <FormControl size="small" sx={{ minWidth: 140 }}>
                        <Select
                          value={app.status || 'pending'}
                          onChange={e => handleStatusChange(app.id, e.target.value)}
                        >
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="reviewed">Reviewed</MenuItem>
                          <MenuItem value="shortlisted">Shortlisted</MenuItem>
                          <MenuItem value="rejected">Rejected</MenuItem>
                          <MenuItem value="hired">Hired</MenuItem>
                        </Select>
                      </FormControl>
                      <Chip
                        label={app.status || 'pending'}
                        size="small"
                        color={STATUS_COLORS[app.status] || 'default'}
                      />
                      <Typography variant="caption" sx={{ color: '#999' }}>
                        Applied {dayjs(app.applied_at).fromNow()}
                      </Typography>
                    </Box>
                  </Box>

                  {app.user?.skills?.length > 0 && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {app.user.skills.slice(0, 6).map((s, i) => (
                          <Chip key={i} label={s.skill_name} size="small" variant="outlined" />
                        ))}
                        {app.user.skills.length > 6 && (
                          <Chip label={`+${app.user.skills.length - 6} more`} size="small" />
                        )}
                      </Box>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Container>
    </DashboardLayout>
  );
};

export default Applicants;
