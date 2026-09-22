import { Chip, Box } from '@mui/material';
import { Star as StarIcon } from '@mui/icons-material';

const SkillBadge = ({
  name,
  level,
  matched = false,
  size = 'medium',
  onDelete,
  onClick,
}) => {
  const renderLevel = () => {
    if (!level) return null;
    return (
      <Box sx={{ display: 'flex', gap: 0.25, ml: 0.5 }}>
        {[...Array(5)].map((_, i) => (
          <StarIcon
            key={i}
            sx={{
              fontSize: size === 'small' ? 10 : 12,
              color: i < level ? '#FFC107' : '#E0E0E0',
            }}
          />
        ))}
      </Box>
    );
  };

  return (
    <Chip
      label={
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {name}
          {renderLevel()}
        </Box>
      }
      size={size}
      variant="outlined"
      onDelete={onDelete}
      onClick={onClick}
      sx={{
        borderRadius: 2,
        ...(matched && {
          backgroundColor: '#E7F5EC',
          borderColor: '#057642',
          color: '#057642',
          fontWeight: 500,
        }),
        ...(onClick && {
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: matched ? '#D4EFE0' : '#F4F2EE',
          },
        }),
      }}
    />
  );
};

export default SkillBadge;
