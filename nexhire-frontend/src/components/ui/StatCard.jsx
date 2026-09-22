import { Card, CardContent, Box, Typography, Avatar } from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = '#0A66C2',
  trend,
}) => {
  const getTrendColor = () => {
    if (trend === 'up') return '#057642';
    if (trend === 'down') return '#CC1016';
    return '#666666';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUpIcon sx={{ fontSize: 16 }} />;
    if (trend === 'down') return <TrendingDownIcon sx={{ fontSize: 16 }} />;
    return null;
  };

  return (
    <Card
      sx={{
        borderRadius: 2,
        border: '1px solid #E0E0E0',
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Avatar
            sx={{
              backgroundColor: `${color}15`,
              color: color,
              width: 48,
              height: 48,
            }}
          >
            <Icon sx={{ fontSize: 24 }} />
          </Avatar>
        </Box>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: '#191919',
            mb: 0.5,
          }}
        >
          {value}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: '#666666',
            mb: subtitle ? 1 : 0,
          }}
        >
          {title}
        </Typography>

        {subtitle && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              color: getTrendColor(),
            }}
          >
            {getTrendIcon()}
            <Typography
              variant="caption"
              sx={{
                fontWeight: 500,
                color: getTrendColor(),
              }}
            >
              {subtitle}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
