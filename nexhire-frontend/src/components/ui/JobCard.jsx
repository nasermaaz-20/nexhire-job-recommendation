
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Avatar,
  IconButton,
  Chip,
  Button,
} from '@mui/material';
import {
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import MatchPercentage from './MatchPercentage';

dayjs.extend(relativeTime);

const JobCard = ({
  job,
  matchScore,
  matchDetails,
  onSave,
  onApply,
  onView,
  navigateState,
  isSaved = false,
  isApplied = false,
  variant = 'default',
}) => {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(isSaved);
  const [applied, setApplied] = useState(isApplied);

  const handleSave = (e) => {
    e.stopPropagation();
    setSaved(!saved);
    if (onSave) onSave(job.id, !saved);
  };

  const handleViewDetails = () => {
    if (onView) onView(job.id); // track interaction
    navigate(`/jobs/${job.id}`, navigateState ? { state: navigateState } : undefined);
  };

  const handleApply = (e) => {
    e.stopPropagation();
    if (onApply) {
      onApply(job.id);
      setApplied(true);
    }
  };

  const getEmploymentTypeLabel = (type) => {
    const types = {
      1: 'Full-time',
      2: 'Part-time',
      3: 'Freelance',
      4: 'Contract',
    };
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

  const formatSalary = () => {
    if (!job.salary_min && !job.salary_max) return null;
    if (job.salary_min && job.salary_max) {
      return `$${(job.salary_min / 1000).toFixed(0)}k - $${(job.salary_max / 1000).toFixed(0)}k`;
    }
    if (job.salary_min) return `From $${(job.salary_min / 1000).toFixed(0)}k`;
    return `Up to $${(job.salary_max / 1000).toFixed(0)}k`;
  };

  const isCompact = variant === 'compact';
  const isRecommendation = variant === 'recommendation';

  return (
    <Card
      sx={{
        borderRadius: 2,
        border: '1px solid #E0E0E0',
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        },
      }}
    >
      <CardContent sx={{ p: isCompact ? 2 : 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Avatar
            sx={{
              width: isCompact ? 40 : 56,
              height: isCompact ? 40 : 56,
              backgroundColor: '#0A66C2',
              fontSize: isCompact ? '16px' : '20px',
              fontWeight: 600,
            }}
          >
            {job.company_name?.charAt(0)?.toUpperCase() || 'C'}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant={isCompact ? 'body1' : 'h6'}
              sx={{
                fontWeight: 600,
                color: '#0A66C2',
                cursor: 'pointer',
                mb: 0.5,
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
              onClick={handleViewDetails}
            >
              {job.title}
            </Typography>
            <Typography variant="caption" sx={{ color: '#666666', display: 'block', mb: 0.5 }}>
              Job ID: {job.id}
            </Typography>
            <Typography variant="body2" sx={{ color: '#666666', mb: 0.25 }}>
              {job.company_name}
            </Typography>
            <Typography variant="caption" sx={{ color: '#666666', display: 'block', mb: 0.5 }}>
              Company ID: {job.company_id}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="body2" sx={{ color: '#666666' }}>
                  {job.location_name || `${job.location?.city}, ${job.location?.country}`}
              </Typography>
              {job.remote_option === 1 && (
                <Chip
                  label="Remote"
                  size="small"
                  sx={{
                    backgroundColor: '#E7F5EC',
                    color: '#057642',
                    fontWeight: 500,
                    height: 20,
                    fontSize: '11px',
                  }}
                />
              )}
              {job.remote_option === 2 && (
                <Chip
                  label="Hybrid"
                  size="small"
                  sx={{
                    backgroundColor: '#FFF4E6',
                    color: '#E68523',
                    fontWeight: 500,
                    height: 20,
                    fontSize: '11px',
                  }}
                />
              )}
            </Box>
          </Box>

          <IconButton onClick={handleSave} sx={{ alignSelf: 'flex-start' }}>
            {saved ? (
              <BookmarkIcon sx={{ color: '#0A66C2' }} />
            ) : (
              <BookmarkBorderIcon sx={{ color: '#666666' }} />
            )}
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          {job.employment_type && (
            <Chip
              label={getEmploymentTypeLabel(job.employment_type)}
              size="small"
              variant="outlined"
              sx={{ borderRadius: 1 }}
            />
          )}
          {job.job_level && (
            <Chip
              label={getJobLevelLabel(job.job_level)}
              size="small"
              variant="outlined"
              sx={{ borderRadius: 1 }}
            />
          )}
          {(job.field_name || job.field) && (
            <Chip
              label={job.field_name || job.field?.name || job.field}
              size="small"
              variant="outlined"
              sx={{ borderRadius: 1 }}
            />
          )}
        </Box>

        {!isCompact && (
          <Box sx={{ mb: 2 }}>
            {formatSalary() && (
              <Typography variant="body2" sx={{ color: '#191919', fontWeight: 500, mb: 0.5 }}>
                {formatSalary()}
              </Typography>
            )}
            <Typography variant="caption" sx={{ color: '#666666' }}>
              {dayjs(job.created_at).fromNow()}
            </Typography>
          </Box>
        )}

    {isRecommendation && matchScore && (
      <Box
        sx={{
          backgroundColor: '#F4F2EE',
          borderRadius: 2,
          p: 2,
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <MatchPercentage value={matchScore} size="small" />
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {matchScore}% Match
          </Typography>
        </Box>

        {matchDetails && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {matchDetails.skills_matched !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CheckCircleIcon sx={{ fontSize: 16, color: '#057642' }} />
                <Typography variant="caption" sx={{ color: '#057642' }}>
                  {matchDetails.skills_matched}/{matchDetails.skills_total} skills matched
                </Typography>
              </Box>
            )}
            {matchDetails.location_match && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CheckCircleIcon sx={{ fontSize: 16, color: '#057642' }} />
                <Typography variant="caption" sx={{ color: '#057642' }}>
                  Location matches
                </Typography>
              </Box>
            )}
            {matchDetails.experience_match && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CheckCircleIcon sx={{ fontSize: 16, color: '#057642' }} />
                <Typography variant="caption" sx={{ color: '#057642' }}>
                  Experience: {matchDetails.experience_match}
                </Typography>
              </Box>
            )}
            {matchDetails.skill_gaps && matchDetails.skill_gaps.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <WarningIcon sx={{ fontSize: 16, color: '#E68523' }} />
                <Typography variant="caption" sx={{ color: '#E68523' }}>
                  Skill gap: {matchDetails.skill_gaps.join(', ')}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>
    )}

        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button onClick={(e) => { e.stopPropagation(); handleViewDetails(); }} sx={{ textTransform: 'none' }}>
            View Details
          </Button>
          {onApply && (
            <Button
              variant="contained"
              onClick={handleApply}
              disabled={applied}
              sx={{ textTransform: 'none' }}
            >
              {applied ? 'Applied' : 'Apply Now'}
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default JobCard;
