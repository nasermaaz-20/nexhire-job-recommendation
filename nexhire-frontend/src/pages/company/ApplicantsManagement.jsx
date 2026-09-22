import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  LinearProgress,
  Chip,
  Divider,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Star as StarIcon, StarBorder as StarBorderIcon } from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import SkillBadge from '../../components/ui/SkillBadge';
import EmptyState from '../../components/common/EmptyState';
import { getJobApplicants, updateApplicantStatus } from '../../api/companiesApi';
import { getJobById } from '../../api/jobsApi';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

// Status integer → label/color
const STATUS_COLORS = { 1: 'default', 2: 'info', 3: 'info', 4: 'error', 5: 'success' };

// Star rating component (1-5 stars)
const StarRating = ({ value, max = 5, met = true }) => (
  <Box sx={{ display: 'flex', gap: 0.25 }}>
    {Array.from({ length: max }).map((_, i) => {
      const filled = i < value;
      const color = filled ? (met ? '#F5C75D' : '#CC1016') : '#e0e0e0';
      return filled
        ? <StarIcon key={i} sx={{ fontSize: 14, color }} />
        : <StarBorderIcon key={i} sx={{ fontSize: 14, color: '#e0e0e0' }} />;
    })}
  </Box>
);

const ApplicantsManagement = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('match');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidateDialogOpen, setCandidateDialogOpen] = useState(false);
  useEffect(() => {
    fetchData();
  }, [jobId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [jobData, applicantsData] = await Promise.all([
        getJobById(jobId),
        getJobApplicants(jobId),
      ]);
      setJob(jobData.data);
      setApplicants(applicantsData.data || []);
    } catch (err) {
      toast.error('Failed to load applicants');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await updateApplicantStatus(applicationId, newStatus);
      setApplicants(prev => prev.map(a => a.id === applicationId ? { ...a, status: newStatus } : a));
      toast.success('Status updated');
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleViewProfile = (applicant) => {
    setSelectedCandidate(applicant);
    setCandidateDialogOpen(true);
  };

  const filteredApplicants = applicants
    .filter((app) => statusFilter === 'all' || app.status === statusFilter)
    .sort((a, b) => {
      if (sortBy === 'match') return (b.match_percentage || 0) - (a.match_percentage || 0);
      if (sortBy === 'newest') return dayjs(b.applied_at).diff(dayjs(a.applied_at));
      if (sortBy === 'experience') return (b.user?.years_of_experience || 0) - (a.user?.years_of_experience || 0);
      return 0;
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
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/company/my-jobs')}
          sx={{ mb: 2 }}
        >
          Back to My Jobs
        </Button>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Applicants for: {job?.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Typography variant="body2" sx={{ color: '#666' }}>
              {job?.job_level}
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              • {job?.field_name}
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              • {job?.location_name}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <Tabs value={statusFilter} onChange={(_, v) => setStatusFilter(v)}>
            <Tab label="All" value="all" />
            <Tab label="Unreviewed" value={1} />
            <Tab label="Reviewed" value={2} />
            <Tab label="Rejected" value={4} />
            <Tab label="Accepted" value={5} />
          </Tabs>

          <FormControl size="small" sx={{ minWidth: 150, ml: 'auto' }}>
            <InputLabel>Sort by</InputLabel>
            <Select value={sortBy} label="Sort by" onChange={(e) => setSortBy(e.target.value)}>
              <MenuItem value="match">Best Match</MenuItem>
              <MenuItem value="newest">Newest</MenuItem>
              <MenuItem value="experience">Experience</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {filteredApplicants.length === 0 ? (
          <EmptyState
            title="No applicants yet"
            description="Share your job posting to attract candidates."
          />
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filteredApplicants.map((applicant) => (
              <Card key={applicant.id} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', gap: 3 }}>
                    <Avatar sx={{ width: 56, height: 56, backgroundColor: '#0A66C2', fontSize: 22, fontWeight: 600 }}>
                      {applicant.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </Avatar>

                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.25 }}>
                        {applicant.user?.name || 'Candidate'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#999', display: 'block', mb: 0.5 }}>
                        User ID: {applicant.user?.id}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                        {applicant.user?.field_name} • {applicant.user?.years_of_experience || 0} yrs exp
                        {applicant.user?.location_name ? ` • ${applicant.user.location_name}` : ''}
                      </Typography>

                      {applicant.user?.all_skills?.length > 0 && (
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                          {applicant.user.all_skills.slice(0, 5).map((skill, idx) => (
                            <SkillBadge key={idx} name={skill.skill_name} size="small" />
                          ))}
                        </Box>
                      )}

                      <Typography variant="caption" sx={{ color: '#999' }}>
                        Applied {dayjs(applicant.applied_at).fromNow()}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1.5, minWidth: 160 }}>
                      {/* Match percentage */}
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: applicant.match_percentage >= 70 ? '#057642' : applicant.match_percentage >= 40 ? '#E68523' : '#CC1016' }}>
                          {applicant.match_percentage ?? 0}%
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666' }}>Match</Typography>
                        <LinearProgress
                          variant="determinate"
                          value={applicant.match_percentage ?? 0}
                          sx={{
                            height: 4, borderRadius: 2, mt: 0.5,
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: applicant.match_percentage >= 70 ? '#057642' : applicant.match_percentage >= 40 ? '#E68523' : '#CC1016'
                            }
                          }}
                        />
                      </Box>

                      {/* Status dropdown */}
                      <FormControl size="small" sx={{ minWidth: 140 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={applicant.status === 3 ? 2 : (applicant.status ?? 1)}
                          label="Status"
                          onChange={(e) => handleStatusChange(applicant.id, e.target.value)}
                        >
                          <MenuItem value={1}>Unreviewed</MenuItem>
                          <MenuItem value={2}>Reviewed</MenuItem>
                          <MenuItem value={4}>Rejected</MenuItem>
                          <MenuItem value={5}>Accepted</MenuItem>
                        </Select>
                      </FormControl>

                      <Button variant="outlined" size="small" onClick={() => handleViewProfile(applicant)}>
                        View Profile
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        <Dialog open={candidateDialogOpen} onClose={() => setCandidateDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{selectedCandidate?.user?.name}</Typography>
                <Typography variant="caption" sx={{ color: '#999' }}>User ID: {selectedCandidate?.user?.id}</Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: (selectedCandidate?.match_percentage ?? 0) >= 70 ? '#057642' : (selectedCandidate?.match_percentage ?? 0) >= 40 ? '#E68523' : '#CC1016' }}>
                  {selectedCandidate?.match_percentage ?? 0}%
                </Typography>
                <Typography variant="caption" sx={{ color: '#666' }}>Overall Match</Typography>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            {selectedCandidate && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>Match Criteria</Typography>

                {/* Criteria rows */}
                {selectedCandidate.match_criteria?.map((c, i) => (
                  <Box key={i} sx={{
                    p: 1.5, borderRadius: 1,
                    backgroundColor: c.met ? '#F0FFF4' : '#FFF5F5',
                    border: `1px solid ${c.met ? '#C6F6D5' : '#FED7D7'}`
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{c.label}</Typography>
                      <Chip label={c.met ? '✓ Met' : '✗ Not Met'} size="small" color={c.met ? 'success' : 'error'} />
                    </Box>
                  </Box>
                ))}

                {/* Skills breakdown */}
                {selectedCandidate.user?.skills?.length > 0 && (
                  <>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Skills Breakdown</Typography>
                    {selectedCandidate.user.skills.map((s, i) => (
                      <Box key={i} sx={{
                        p: 1.5, borderRadius: 1,
                        backgroundColor: s.met ? '#F0FFF4' : '#FFF5F5',
                        border: `1px solid ${s.met ? '#C6F6D5' : '#FED7D7'}`
                      }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>{s.skill_name}</Typography>
                            <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                              <Box>
                                <Typography variant="caption" sx={{ color: '#666' }}>Required</Typography>
                                <StarRating value={s.importance} met={s.met} />
                              </Box>
                              <Box>
                                <Typography variant="caption" sx={{ color: '#666' }}>Candidate</Typography>
                                <StarRating value={s.user_level} met={s.met} />
                              </Box>
                            </Box>
                          </Box>
                          <Chip
                            label={s.met ? '✓ Met' : '✗ Not Met'}
                            size="small"
                            color={s.met ? 'success' : 'error'}
                          />
                        </Box>
                      </Box>
                    ))}
                  </>
                )}

                {/* Basic info */}
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Chip label={`Email: ${selectedCandidate.user?.email}`} size="small" variant="outlined" />
                  <Chip label={`${selectedCandidate.user?.years_of_experience ?? 0} yrs exp`} size="small" variant="outlined" />
                  {selectedCandidate.user?.field_name && <Chip label={selectedCandidate.user.field_name} size="small" />}
                  {selectedCandidate.user?.location_name && <Chip label={selectedCandidate.user.location_name} size="small" variant="outlined" />}
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCandidateDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </DashboardLayout>
  );
};

export default ApplicantsManagement;
