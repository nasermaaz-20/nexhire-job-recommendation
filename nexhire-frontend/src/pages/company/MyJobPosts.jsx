import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Tabs,
  Tab,
  IconButton,
  Skeleton,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import SkillBadge from '../../components/ui/SkillBadge';
import { getCompanyJobs, deleteJob, toggleJobActive } from '../../api/companiesApi';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const MyJobPosts = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, job: null });

  const getEmploymentTypeLabel = (type) => {
    const types = { 1: 'Full-time', 2: 'Part-time', 3: 'Freelance', 4: 'Contract' };
    return types[type] || type;
  };

  const getJobLevelLabel = (level) => {
    const levels = {
      1: 'Junior',
      2: 'Mid',
      3: 'Senior',
      4: 'Lead',
    };
    return levels[level] || level;
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await getCompanyJobs();
      setJobs(data.data || []);
    } catch (err) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (job) => {
    try {
      await toggleJobActive(job.id, job.is_active);
      toast.success('Job status updated');
      fetchJobs();
    } catch (err) {
      toast.error('Failed to update job status');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteJob(deleteDialog.job.id);
      toast.success('Job deleted');
      setDeleteDialog({ open: false, job: null });
      fetchJobs();
    } catch (err) {
      toast.error('Failed to delete job');
    }
  };

  const filteredJobs = jobs.filter((job) => {
    if (filter === 'active') return job.is_active;
    if (filter === 'inactive') return !job.is_active;
    return true;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Skeleton variant="text" width={300} height={50} sx={{ mb: 3 }} />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rectangular" height={150} sx={{ borderRadius: 2, mb: 2 }} />
          ))}
        </Container>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            My Job Posts
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/company/post-job')}
          >
            Post New Job
          </Button>
        </Box>

        <Tabs value={filter} onChange={(_, v) => setFilter(v)} sx={{ mb: 3 }}>
          <Tab label="All" value="all" />
          <Tab label="Active" value="active" />
          <Tab label="Inactive" value="inactive" />
        </Tabs>

        {filteredJobs.length === 0 ? (
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                No jobs posted yet
              </Typography>
              <Button variant="contained" onClick={() => navigate('/company/post-job')}>
                Post Your First Job
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filteredJobs.map((job) => (
              <Card key={job.id} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {job.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#999', display: 'block', mb: 1 }}>
                        Job ID: {job.id}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <Chip
                          label={job.is_active ? 'Active' : 'Inactive'}
                          size="small"
                          color={job.is_active ? 'success' : 'default'}
                        />
                        {job.employment_type && <Chip label={getEmploymentTypeLabel(job.employment_type)} size="small" />}
                        {job.job_level && <Chip label={getJobLevelLabel(job.job_level)} size="small" />}
                      </Box>
                      <Typography variant="caption" sx={{ color: '#999' }}>
                        Posted {dayjs(job.created_at).fromNow()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleToggleActive(job)}
                        title={job.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {job.is_active ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                      <IconButton size="small" onClick={() => navigate(`/company/post-job?edit=${job.id}`)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteDialog({ open: true, job })}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      👁 Views: {job.views || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      📄 Applications: {job.applications || 0}
                    </Typography>
                  </Box>

                  {job.skills && job.skills.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      {job.skills.slice(0, 5).map((skill, idx) => (
                        <SkillBadge key={idx} name={skill.name || skill} size="small" />
                      ))}
                      {job.skills.length > 5 && (
                        <Chip label={`+${job.skills.length - 5} more`} size="small" />
                      )}
                    </Box>
                  )}

                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => navigate(`/company/applicants/${job.id}`)}
                  >
                    View Applicants
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        <ConfirmDialog
          open={deleteDialog.open}
          title="Delete Job?"
          message={`Are you sure you want to delete "${deleteDialog.job?.title}"? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteDialog({ open: false, job: null })}
          severity="danger"
        />
      </Container>
    </DashboardLayout>
  );
};

export default MyJobPosts;
