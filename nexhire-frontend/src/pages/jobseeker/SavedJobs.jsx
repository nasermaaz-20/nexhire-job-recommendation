import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Skeleton,
} from '@mui/material';
import {
  Bookmark as BookmarkIcon,
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import JobCard from '../../components/ui/JobCard';
import EmptyState from '../../components/common/EmptyState';
import { getSavedJobs, unsaveJob } from '../../api/jobsApi';
import { toast } from 'react-toastify';

const SavedJobs = () => {
  const navigate = useNavigate();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    setLoading(true);
    try {
      const data = await getSavedJobs();
      // getSavedJobs returns interactions, not jobs directly
      // Each interaction has: { id, userId, jobId, interactionType, job: {...} }
      // We need to extract the job object and ensure job.id is the actual job ID
      const interactions = data.data || [];
      // Deduplicate by jobId - a user may have multiple interactions (view + save) for the same job
      const uniqueJobs = new Map();
      interactions
        .filter((interaction) => interaction.interactionType === 2) // Only SAVE interactions
        .forEach((interaction) => {
          const jobId = interaction.job?.id || interaction.jobId;
          if (!uniqueJobs.has(jobId)) {
            const job = interaction.job || {};
            uniqueJobs.set(jobId, {
              ...job,
              id: jobId,
              interactionId: interaction.id,
            });
          }
        });
      setSavedJobs(Array.from(uniqueJobs.values()));
    } catch (err) {
      toast.error('Failed to load saved jobs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (jobId) => {
    try {
      await unsaveJob(jobId);
      setSavedJobs(prev => prev.filter(job => job.id !== jobId && job.jobId !== jobId));
      toast.success('Job removed from saved list');
    } catch (err) {
      toast.error('Failed to unsave job');
    }
  };

  return (
    <DashboardLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Saved Jobs
        </Typography>
        <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
          Your saved job listings ({savedJobs.length})
        </Typography>

        {loading ? (
          <Box>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rectangular" height={200} sx={{ mb: 2, borderRadius: 2 }} />
            ))}
          </Box>
        ) : savedJobs.length === 0 ? (
          <EmptyState
            icon={BookmarkIcon}
            title="No saved jobs yet"
            description="Save jobs you're interested in to review them later"
            action={
              <Button variant="contained" onClick={() => navigate('/jobs')}>
                Browse Jobs
              </Button>
            }
          />
        ) : (
          <Box>
            {savedJobs.map((job) => (
              <Box key={job.id} sx={{ mb: 2 }}>
                <JobCard
                  job={job}
                  isSaved={true}
                  onSave={() => handleUnsave(job.id)}
                  onView={() => navigate(`/jobs/${job.id}`)}
                />
              </Box>
            ))}
          </Box>
        )}
      </Container>
    </DashboardLayout>
  );
};

export default SavedJobs;
