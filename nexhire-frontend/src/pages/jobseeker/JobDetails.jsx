import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Chip,
  Avatar,
  Card,
  CardContent,
  IconButton,
  Skeleton,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Share as ShareIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Work as WorkIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Public as PublicIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import DashboardLayout from '../../components/layout/DashboardLayout';
import MatchPercentage from '../../components/ui/MatchPercentage';
import SkillBadge from '../../components/ui/SkillBadge';
import { getJobById, saveJob, unsaveJob, getSavedJobs } from '../../api/jobsApi';
import { applyToJob, getMyApplications } from '../../api/applicationsApi';
import { recordInteraction, getMyRecommendations } from '../../api/recommendationsApi';
import { getUserProfile } from '../../api/usersApi';
import { toast } from 'react-toastify';

dayjs.extend(relativeTime);

const EMPLOYMENT_LABELS = { 1: 'Full-time', 2: 'Part-time', 3: 'Freelance', 4: 'Contract' };
const JOB_LEVEL_LABELS = { 1: 'Junior', 2: 'Mid', 3: 'Senior', 4: 'Lead' };
const REMOTE_LABELS = { 0: 'On-site', 1: 'Remote', 2: 'Hybrid' };

// ── Match Analysis helpers ──────────────────────────────────────────────────

function computeMatch(job, user) {
  if (!job || !user) return null;

  const prefs = user.preferences || {};

  const fieldMatch = job.field_id && user.field_id
    ? String(job.field_id) === String(user.field_id)
    : null;

  const locationMatch = job.location_id && user.preferred_locations?.length
    ? user.preferred_locations.some(pl => String(pl.location_id) === String(job.location_id))
    : null;

  const levelMatch = job.job_level && user.career_level
    ? job.job_level === user.career_level
    : null;

  const exp = user.years_of_experience ?? null;
  let expMatch = null;
  if (exp !== null && job.experience_min !== null && job.experience_min !== undefined) {
    expMatch = exp >= job.experience_min;
  }

  const salaryMatch = job.salary_min !== null && job.salary_min !== undefined && user.desired_salary_min !== null && user.desired_salary_min !== undefined
    ? job.salary_min >= user.desired_salary_min
    : null;

  const empTypeMatch = job.employment_type && prefs.preferred_employment_type
    ? job.employment_type === prefs.preferred_employment_type
    : null;

  const remoteMatch = job.remote_option !== undefined && job.remote_option !== null && prefs.remote_preference !== undefined && prefs.remote_preference !== null
    ? job.remote_option === prefs.remote_preference
    : null;

  return { fieldMatch, locationMatch, levelMatch, expMatch, salaryMatch, empTypeMatch, remoteMatch };
}

// ── Criterion Row ───────────────────────────────────────────────────────────

function CriterionRow({ label, match, jobValue, userValue }) {
  if (match === null) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.75 }}>
        <CancelIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
        <Typography variant="body2" sx={{ color: 'text.disabled', flex: 1 }}>{label}</Typography>
        <Typography variant="caption" sx={{ color: 'text.disabled' }}>No data</Typography>
      </Box>
    );
  }
  return (
    <Box
      sx={{
        display: 'flex', alignItems: 'center', gap: 1, py: 0.75, px: 1.5, borderRadius: 1,
        bgcolor: match ? 'success.light' : 'error.light',
      }}
    >
      {match
        ? <CheckCircleIcon sx={{ fontSize: 18, color: 'success.dark' }} />
        : <CancelIcon sx={{ fontSize: 18, color: 'error.dark' }} />}
      <Typography variant="body2" sx={{ color: match ? 'success.dark' : 'error.dark', flex: 1, fontWeight: 500 }}>
        {label}
      </Typography>
      <Box sx={{ textAlign: 'right' }}>
        <Typography variant="caption" sx={{ color: match ? 'success.dark' : 'error.dark', display: 'block' }}>
          Job: {jobValue ?? '—'}
        </Typography>
        <Typography variant="caption" sx={{ color: match ? 'success.dark' : 'error.dark', display: 'block' }}>
          You: {userValue ?? '—'}
        </Typography>
      </Box>
    </Box>
  );
}

// ── Skill Stars ─────────────────────────────────────────────────────────────

function SkillStars({ skill, userSkills }) {
  const userSkill = userSkills?.find(us => String(us.skill_id) === String(skill.id));
  const U = userSkill?.level ?? 0;
  const J = skill.importance ?? 0;
  const hasSkill = !!userSkill;

  return (
    <Box
      sx={{
        display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 1, borderRadius: 1,
        bgcolor: hasSkill ? 'success.light' : 'error.light',
        mb: 1,
      }}
    >
      <Typography variant="body2" sx={{ color: hasSkill ? 'success.dark' : 'error.dark', fontWeight: 500, minWidth: 120 }}>
        {skill.name}
      </Typography>
      <Box sx={{ display: 'flex', gap: 0.25 }}>
        {[1, 2, 3, 4, 5].map(i => {
          let color;
          if (i <= U) color = '#F59E0B';           // gold — user has this level
          else if (i <= J) color = '#CC1016';       // red — required but missing
          else color = '#BDBDBD';                   // grey — not required
          return <StarIcon key={i} sx={{ fontSize: 18, color }} />;
        })}
      </Box>
      {!hasSkill && (
        <Typography variant="caption" sx={{ color: 'error.dark', ml: 'auto' }}>Missing</Typography>
      )}
    </Box>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const showAIAnalysis = location.state?.fromRecommendations || searchParams.get('source') === 'recommendations';

  const [job, setJob] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [jobScores, setJobScores] = useState(null);

  useEffect(() => {
    fetchJobDetails();
    checkApplicationStatus();
    checkSaveStatus();
    fetchSimilarJobs();
    fetchUserProfile();
    recordView();
  }, [id]);

  const fetchJobDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getJobById(id);
      setJob(data.data);
    } catch (err) {
      setError('Unable to load job details');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const data = await getUserProfile();
      setUserProfile(data.data?.user || null);
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
    }
  };

  const checkSaveStatus = async () => {
    try {
      const data = await getSavedJobs();
      const saved = data.data?.some(
        (i) => i.interactionType === 2 && String(i.jobId) === String(id)
      );
      setIsSaved(!!saved);
    } catch (err) {
      console.error('Failed to check save status:', err);
    }
  };

  const checkApplicationStatus = async () => {
    try {
      const data = await getMyApplications();
      const applied = data.data?.some((app) => String(app.job_id) === String(id));
      setHasApplied(!!applied);
    } catch (err) {
      console.error('Failed to check application status:', err);
    }
  };

  const fetchSimilarJobs = async () => {
    try {
      const data = await getMyRecommendations({ limit: 100 });

      // ✅ Extract recommendations array correctly
      const rawRecs = data?.data?.recommendations || [];

      // ✅ Find current job's scores
      const currentJobRec = rawRecs.find(
        (rec) => String(rec.job_id) === String(id)
      );

      if (currentJobRec) {
        setJobScores({
          content_score: Math.round((currentJobRec.content_score || 0) * 100),
          collab_score: Math.round((currentJobRec.collab_score || 0) * 100),
          hybrid_score: Math.round((currentJobRec.score || 0) * 100),
          alpha: currentJobRec.alpha || 0.5,
        });
      }

      // ✅ Similar jobs (exclude current job)
      const similar = rawRecs
        .filter((rec) => String(rec.job_id) !== String(id))
        .slice(0, 3)
        .map((rec) => ({
          ...rec,
          match_score: Math.round((rec.score || 0) * 100),
          job: {
            ...rec.job,
            company_name: rec.job?.company?.name || `Company #${rec.job?.company_id}`,
          },
        }));

      setSimilarJobs(similar);
    } catch (err) {
      console.error('Failed to fetch similar jobs:', err);
    }
  };

  const recordView = async () => {
    try {
      if (id && !isNaN(parseInt(id))) await recordInteraction(id, 'view');
    } catch (err) {
      console.error('Failed to record view:', err);
    }
  };

  const handleSave = async () => {
    try {
      if (isSaved) {
        await unsaveJob(id);
        setIsSaved(false);
        toast.success('Job unsaved');
      } else {
        await saveJob(id);
        setIsSaved(true);
        toast.success('Job saved!');
      }
    } catch (err) {
      toast.error('Failed to save job');
    }
  };

  const handleApply = async () => {
    try {
      await applyToJob(Number(id));
      await recordInteraction(id, 'apply');
      setHasApplied(true);
      setApplyDialogOpen(false);
      toast.success('Application submitted successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to apply');
    }
  };

  const handleWithdraw = async () => {
    try {
      const { withdrawApplication } = await import('../../api/applicationsApi');
      await withdrawApplication(Number(id));
      setHasApplied(false);
      toast.success('Application withdrawn');
    } catch (err) {
      toast.error(err.message || 'Failed to withdraw');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2, mb: 3 }} />
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 2 }} />
              <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
            </Box>
            <Box sx={{ width: 350 }}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
            </Box>
          </Box>
        </Container>
      </DashboardLayout>
    );
  }

  if (error || !job) {
    return (
      <DashboardLayout>
        <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ mb: 2 }}>{error || 'Job not found'}</Typography>
          <Button variant="contained" onClick={() => navigate('/jobs')}>Back to Jobs</Button>
        </Container>
      </DashboardLayout>
    );
  }

  const formatSalary = () => {
    if (!job.salary_min && !job.salary_max) return 'Not specified';
    if (job.salary_min && job.salary_max)
      return `${(job.salary_min / 1000).toFixed(0)}k - ${(job.salary_max / 1000).toFixed(0)}k`;
    if (job.salary_min) return `From ${(job.salary_min / 1000).toFixed(0)}k`;
    return `Up to ${(job.salary_max / 1000).toFixed(0)}k`;
  };

  const match = computeMatch(job, userProfile);
  const prefs = userProfile?.preferences || {};

  return (
    <DashboardLayout>
      <Container maxWidth="lg" sx={{ py: 3 }}>

        {/* ── Header Card ── */}
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
              <Avatar sx={{ width: 80, height: 80, backgroundColor: '#0A66C2', fontSize: '32px', fontWeight: 600 }}>
                {job.company_name?.charAt(0)?.toUpperCase() || 'C'}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.25 }}>{job.title}</Typography>
                <Typography variant="caption" sx={{ color: '#888', display: 'block', mb: 1 }}>
                  Job ID: {job.id}
                </Typography>
                <Typography variant="h6" sx={{ color: '#666', mb: 0.25 }}>{job.company_name}</Typography>
                <Typography variant="caption" sx={{ color: '#888', display: 'block', mb: 1 }}>
                  Company ID: {job.company_id}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Typography variant="body1" sx={{ color: '#666' }}>
                    {job.location_name || job.location}
                  </Typography>
                  {job.remote_option === 1 && (
                    <Chip label="Remote" size="small" sx={{ backgroundColor: '#E7F5EC', color: '#057642', fontWeight: 500 }} />
                  )}
                  {job.remote_option === 2 && (
                    <Chip label="Hybrid" size="small" sx={{ backgroundColor: '#FFF4E6', color: '#E68523', fontWeight: 500 }} />
                  )}
                  <Typography variant="body2" sx={{ color: '#999', ml: 2 }}>
                    Posted {dayjs(job.created_at).fromNow()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {job.employment_type && <Chip label={EMPLOYMENT_LABELS[job.employment_type] || job.employment_type} />}
                  {job.job_level && <Chip label={JOB_LEVEL_LABELS[job.job_level] || job.job_level} />}
                  {(job.field_name || job.field) && <Chip label={job.field_name || job.field} />}
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              {hasApplied ? (
                <Button
                  variant="outlined"
                  color="error"
                  size="large"
                  onClick={handleWithdraw}
                  sx={{ px: 4 }}
                >
                  Withdraw Application
                </Button>
              ) : (
                <Button
                  variant="contained" size="large"
                  onClick={() => setApplyDialogOpen(true)}
                  sx={{ px: 4 }}
                >
                  Apply Now
                </Button>
              )}
              <Button
                variant="outlined" size="large"
                startIcon={isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                onClick={handleSave}
              >
                {isSaved ? 'Saved' : 'Save'}
              </Button>
              <IconButton onClick={handleShare}><ShareIcon /></IconButton>
            </Box>
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* ── Left Column ── */}
          <Box sx={{ flex: 1 }}>

            {/* Job Overview */}
            <Card sx={{ mb: 3, borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Job Overview</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WorkIcon sx={{ color: '#666' }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: '#999' }}>Experience</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {job.experience_min ?? 0}-{job.experience_max ?? 5} years
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUpIcon sx={{ color: '#666' }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: '#999' }}>Level</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {JOB_LEVEL_LABELS[job.job_level] || 'Not specified'}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MoneyIcon sx={{ color: '#666' }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: '#999' }}>Salary</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{formatSalary()}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationIcon sx={{ color: '#666' }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: '#999' }}>Location</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {job.location_name || job.location}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BusinessIcon sx={{ color: '#666' }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: '#999' }}>Type</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {EMPLOYMENT_LABELS[job.employment_type] || 'Not specified'}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PublicIcon sx={{ color: '#666' }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: '#999' }}>Remote Option</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {REMOTE_LABELS[job.remote_option] ?? 'Not specified'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* ✅ Algorithm Scores - only shown when coming from recommendations */}
            {showAIAnalysis && (
            <Card sx={{ mb: 3, borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  AI Recommendation Analysis
                </Typography>

                {jobScores ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

                    {/* 1️⃣ Content-Based Score */}
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ fontSize: '20px' }}>📊</Typography>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              Content-Based Filtering
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#666' }}>
                              Based on your skills, experience, location & field
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#0A66C2' }}>
                          {jobScores.content_score}%
                        </Typography>
                      </Box>
                      <Box sx={{ width: '100%', height: 12, backgroundColor: '#E0E0E0', borderRadius: 6 }}>
                        <Box
                          sx={{
                            width: `${jobScores.content_score}%`,
                            height: '100%',
                            backgroundColor: '#0A66C2',
                            borderRadius: 6,
                            transition: 'width 0.8s ease',
                          }}
                        />
                      </Box>
                    </Box>

                    {/* 2️⃣ Collaborative Filtering Score */}
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ fontSize: '20px' }}>🤝</Typography>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              Collaborative Filtering
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#666' }}>
                              Based on similar users who applied to this job
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#057642' }}>
                          {jobScores.collab_score}%
                        </Typography>
                      </Box>
                      <Box sx={{ width: '100%', height: 12, backgroundColor: '#E0E0E0', borderRadius: 6 }}>
                        <Box
                          sx={{
                            width: `${jobScores.collab_score}%`,
                            height: '100%',
                            backgroundColor: '#057642',
                            borderRadius: 6,
                            transition: 'width 0.8s ease',
                          }}
                        />
                      </Box>
                    </Box>

                    {/* 3️⃣ Hybrid Score (Final) */}
                    <Box
                      sx={{
                        backgroundColor: '#F8F9FA',
                        borderRadius: 2,
                        p: 2,
                        border: '2px solid #E0E0E0',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ fontSize: '20px' }}>⚡</Typography>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 700 }}>
                              Hybrid Score (Final)
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#666' }}>
                              Combined score using both algorithms
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#B24020' }}>
                          {jobScores.hybrid_score}%
                        </Typography>
                      </Box>
                      <Box sx={{ width: '100%', height: 14, backgroundColor: '#E0E0E0', borderRadius: 7 }}>
                        <Box
                          sx={{
                            width: `${jobScores.hybrid_score}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #0A66C2, #057642)',
                            borderRadius: 7,
                            transition: 'width 0.8s ease',
                          }}
                        />
                      </Box>

                      {/* Alpha formula explanation */}
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          gap: 1,
                          mt: 2,
                          flexWrap: 'wrap',
                        }}
                      >
                        <Chip
                          label={`Content × ${Math.round(jobScores.alpha * 100)}%`}
                          size="small"
                          sx={{ backgroundColor: '#E3F2FD', color: '#0A66C2', fontWeight: 600 }}
                        />
                        <Typography variant="body2" sx={{ alignSelf: 'center', color: '#666' }}>+</Typography>
                        <Chip
                          label={`Collaborative × ${Math.round((1 - jobScores.alpha) * 100)}%`}
                          size="small"
                          sx={{ backgroundColor: '#E8F5E9', color: '#057642', fontWeight: 600 }}
                        />
                        <Typography variant="body2" sx={{ alignSelf: 'center', color: '#666' }}>=</Typography>
                        <Chip
                          label={`${jobScores.hybrid_score}% Match`}
                          size="small"
                          sx={{ backgroundColor: '#FBE9E7', color: '#B24020', fontWeight: 600 }}
                        />
                      </Box>
                    </Box>

                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="body1" sx={{ color: '#666' }}>
                      No recommendation scores available for this job.
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#999' }}>
                      This job may not be in your recommended list.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
            )}

            {/* ── Match Analysis ── */}
            {match && (
              <Card sx={{ mb: 3, borderRadius: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Profile vs Job Match</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <CriterionRow
                      label="Field / Specialization"
                      match={match.fieldMatch}
                      jobValue={job.field_name}
                      userValue={userProfile?.field_name}
                    />
                    <CriterionRow
                      label="Preferred Location"
                      match={match.locationMatch}
                      jobValue={job.location_name}
                      userValue={userProfile?.preferred_locations?.map(l => l.location_name).join(', ') || '—'}
                    />
                    <CriterionRow
                      label="Career Level"
                      match={match.levelMatch}
                      jobValue={JOB_LEVEL_LABELS[job.job_level]}
                      userValue={JOB_LEVEL_LABELS[userProfile?.career_level]}
                    />
                    <CriterionRow
                      label="Experience"
                      match={match.expMatch}
                      jobValue={`${job.experience_min ?? 0}–${job.experience_max ?? '∞'} yrs`}
                      userValue={`${userProfile?.years_of_experience ?? '?'} yrs`}
                    />
                    <CriterionRow
                      label="Salary Expectation"
                      match={match.salaryMatch}
                      jobValue={job.salary_min ? `From ${(job.salary_min / 1000).toFixed(0)}k` : null}
                      userValue={userProfile?.desired_salary_min ? `Min ${(userProfile.desired_salary_min / 1000).toFixed(0)}k` : null}
                    />
                    <CriterionRow
                      label="Employment Type"
                      match={match.empTypeMatch}
                      jobValue={EMPLOYMENT_LABELS[job.employment_type]}
                      userValue={EMPLOYMENT_LABELS[prefs.preferred_employment_type]}
                    />
                    <CriterionRow
                      label="Remote Preference"
                      match={match.remoteMatch}
                      jobValue={REMOTE_LABELS[job.remote_option]}
                      userValue={REMOTE_LABELS[prefs.remote_preference]}
                    />
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* ── Skills with Star Rating ── */}
            {job.skills && job.skills.length > 0 && (
              <Card sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Required Skills</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {job.skills.map((skill) => (
                      <SkillStars key={skill.id} skill={skill} userSkills={userProfile?.skills} />
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <StarIcon sx={{ fontSize: 14, color: '#F59E0B' }} />
                      <Typography variant="caption" sx={{ color: '#666' }}>Your level</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <StarIcon sx={{ fontSize: 14, color: '#CC1016' }} />
                      <Typography variant="caption" sx={{ color: '#666' }}>Required (missing)</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <StarIcon sx={{ fontSize: 14, color: '#BDBDBD' }} />
                      <Typography variant="caption" sx={{ color: '#666' }}>Not required</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>

          {/* ── Right Column ── */}
          <Box sx={{ width: 350 }}>
            <Card sx={{ mb: 3, borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Company Info</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ width: 60, height: 60, backgroundColor: '#0A66C2', fontSize: '24px' }}>
                    {job.company_name?.charAt(0)?.toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{job.company_name}</Typography>
                    <Typography variant="caption" sx={{ color: '#888', display: 'block' }}>
                      Company ID: {job.company_id}
                    </Typography>
                  </Box>
                </Box>
                {job.company?.email && (
                  <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                    Email: {job.company.email}
                  </Typography>
                )}
                {job.company?.founded_year && (
                  <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                    Founded: {job.company.founded_year}
                  </Typography>
                )}
                {job.company?.location_name && (
                  <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                    Location: {job.company.location_name}
                  </Typography>
                )}
              </CardContent>
            </Card>

            {showAIAnalysis && similarJobs.length > 0 && (
              <Card sx={{ mb: 3, borderRadius: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>You might also like</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {similarJobs.map((rec) => (
                      <Box
                        key={rec.job_id}
                        sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#F4F2EE' }, p: 1, borderRadius: 1 }}
                        onClick={() => navigate(`/jobs/${rec.job_id}`, { state: { fromRecommendations: true } })}
                      >
                        <Typography variant="body1" sx={{ fontWeight: 500, color: '#0A66C2' }}>
                          {rec.job?.title || 'Job Title'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          {rec.job?.company_name || 'Company'}
                        </Typography>
                        {rec.match_score && (
                          <Chip
                            label={`${rec.match_score}% match`}
                            size="small"
                            sx={{ mt: 0.5, backgroundColor: '#E7F5EC', color: '#057642' }}
                          />
                        )}
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            )}

            <Card sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Quick Stats</Typography>
                <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                  Posted {dayjs(job.created_at).fromNow()}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                  Total Views: {job.stats?.views ?? 0}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Total Applicants: {job.stats?.applicants ?? 0}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Apply Dialog */}
        <Dialog open={applyDialogOpen} onClose={() => setApplyDialogOpen(false)}>
          <DialogTitle>Apply to {job.title}?</DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              Your profile and skills will be shared with {job.company_name}.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setApplyDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleApply}>Confirm Application</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </DashboardLayout>
  );
};

export default JobDetails;
