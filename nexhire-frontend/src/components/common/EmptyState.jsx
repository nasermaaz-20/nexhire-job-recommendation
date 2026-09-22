import { Box, Typography, Button } from '@mui/material';
import { Inbox as InboxIcon } from '@mui/icons-material';

const EmptyState = ({
  icon: Icon = InboxIcon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 3,
        textAlign: 'center',
      }}
    >
      <Icon
        sx={{
          fontSize: 80,
          color: '#BDBDBD',
          mb: 2,
        }}
      />

      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          color: '#191919',
          mb: 1,
        }}
      >
        {title}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: '#666666',
          maxWidth: 400,
          mb: actionLabel ? 3 : 0,
        }}
      >
        {description}
      </Typography>

      {actionLabel && onAction && (
        <Button
          variant="contained"
          onClick={onAction}
          sx={{
            textTransform: 'none',
            fontWeight: 500,
          }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;
