import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Skeleton,
  Pagination,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import { IconButton } from '@mui/material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import JobCard from '../../components/ui/JobCard';
import EmptyState from '../../components/common/EmptyState';
import { useRecommendations } from '../../hooks/useRecommendations';

dayjs.extend(relativeTime);

const Recommendations = () => {
  const navigate = useNavigate();

  const {
    recommendations,
    loading,
    error,
    pagination,
    lastUpdated,
    changePage,
    refresh,
    trackView,
    handleSave,
  } = useRecommendations();

  const [viewMode, setViewMode] = useState('list');
  const [savedJobs, setSavedJobs] = useState(new Set());

  const handlePageChange = (event, value) => {
    changePage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSaveJob = async (jobId) => {
    const isSaved = savedJobs.has(jobId);
    const newSavedState = await handleSave(jobId, isSaved);
    if (newSavedState) {
      setSavedJobs(prev => new Set([...prev, jobId]));
    } else {
      setSavedJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  return (
    <DashboardLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
              Recommended for You
            </Typography>
            <Typography variant="body2" sx={{ color: '#666666' }}>
              AI-powered matches based on your skills, experience, and preferences
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{ color: '#666666' }}>
              Updated {dayjs(lastUpdated).fromNow()}
            </Typography>
            <IconButton onClick={refresh} size="small" disabled={loading}>
              <RefreshIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setViewMode('list')}
              sx={{ color: viewMode === 'list' ? '#0A66C2' : '#666666' }}
            >
              <ViewListIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setViewMode('grid')}
              sx={{ color: viewMode === 'grid' ? '#0A66C2' : '#666666' }}
            >
              <ViewModuleIcon />
            </IconButton>
          </Box>
        </Box>

        <Typography variant="body2" sx={{ color: '#666666', mb: 2 }}>
          {loading ? '...' : `Showing ${recommendations.length} recommendations`}
        </Typography>

        {/* Loading State */}
        {loading && (
          <Box>
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} variant="rectangular" height={180} sx={{ mb: 2, borderRadius: 2 }} />
            ))}
          </Box>
        )}

        {/* Error State */}
        {error && !loading && (
          <Box sx={{ p: 4, textAlign: 'center', border: '1px solid #E0E0E0', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#CC1016' }}>
              Unable to load recommendations
            </Typography>
            <Typography variant="body2" sx={{ color: '#666666', mb: 3 }}>
              {error}
            </Typography>
            <Button variant="contained" onClick={refresh}>
              Try Again
            </Button>
          </Box>
        )}

        {/* Empty State */}
        {!loading && !error && recommendations.length === 0 && (
          <EmptyState
            icon={AutoAwesomeIcon}
            title="No Recommendations Yet"
            description="Complete your profile and add skills to get personalized job recommendations."
            action={
              <Button variant="contained" onClick={() => navigate('/profile')}>
                Complete Profile
              </Button>
            }
          />
        )}

        {/* Results */}
        {!loading && !error && recommendations.length > 0 && (
          <>
            {viewMode === 'list' ? (
              <Box>
                {recommendations.map((rec) => (
                  <Box key={rec.job_id} sx={{ mb: 2 }} onMouseEnter={() => trackView(rec.job_id)}>
                    <JobCard
                      job={rec.job}
                      variant="recommendation"
                      matchScore={rec.match_score}
                      matchDetails={rec.match_details}
                      isSaved={savedJobs.has(rec.job_id)}
                      onSave={() => onSaveJob(rec.job_id)}
                      onView={() => trackView(rec.job_id)}
                      navigateState={{ fromRecommendations: true }}
                    />
                  </Box>
                ))}
              </Box>
            ) : (
              <Grid container spacing={2}>
                {recommendations.map((rec) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={rec.job_id} onMouseEnter={() => trackView(rec.job_id)}>
                    <JobCard
                      job={rec.job}
                      variant="recommendation"
                      matchScore={rec.match_score}
                      matchDetails={rec.match_details}
                      isSaved={savedJobs.has(rec.job_id)}
                      onSave={() => onSaveJob(rec.job_id)}
                      onView={() => trackView(rec.job_id)}
                      navigateState={{ fromRecommendations: true }}
                    />
                  </Grid>
                ))}
              </Grid>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 4, gap: 2 }}>
                <Typography variant="body2" sx={{ color: '#666666' }}>
                  Showing {(pagination.page - 1) * pagination.limit + 1}-
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                </Typography>
                <Pagination
                  count={pagination.totalPages}
                  page={pagination.page}
                  onChange={handlePageChange}
                  color="primary"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </DashboardLayout>
  );
};

export default Recommendations;
