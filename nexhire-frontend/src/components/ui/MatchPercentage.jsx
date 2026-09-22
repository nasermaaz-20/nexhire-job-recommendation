import { Box, CircularProgress, Typography } from '@mui/material';

const MatchPercentage = ({
  value,
  size = 'medium',
  showLabel = false,
}) => {
  const getColor = () => {
    if (value >= 80) return '#057642';
    if (value >= 60) return '#E68523';
    return '#CC1016';
  };

  const getSizeValue = () => {
    if (size === 'small') return 40;
    if (size === 'large') return 80;
    return 60;
  };

  const sizeValue = getSizeValue();
  const color = getColor();

  return (
    <Box sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress
          variant="determinate"
          value={100}
          size={sizeValue}
          thickness={4}
          sx={{
            color: '#E0E0E0',
            position: 'absolute',
          }}
        />
        <CircularProgress
          variant="determinate"
          value={value}
          size={sizeValue}
          thickness={4}
          sx={{
            color: color,
          }}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant={size === 'small' ? 'caption' : 'body2'}
            sx={{
              fontWeight: 700,
              color: color,
              fontSize: size === 'small' ? '11px' : size === 'large' ? '18px' : '14px',
            }}
          >
            {value}%
          </Typography>
        </Box>
      </Box>
      {showLabel && (
        <Typography
          variant="caption"
          sx={{
            mt: 0.5,
            color: '#666666',
            fontWeight: 500,
          }}
        >
          Match
        </Typography>
      )}
    </Box>
  );
};

export default MatchPercentage;
