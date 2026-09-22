import { Box, CircularProgress, Typography } from '@mui/material';
import logo from '../../assets/logo/Gemini_Generated_Image_iv9z8tiv9z8tiv9z.png';

const Loading = ({ message = 'Loading...', fullPage = true }) => {
  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <img src={logo} alt="NexHire" style={{ height: '40px' }} />
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: '#0A66C2',
          }}
        >
          NexHire
        </Typography>
      </Box>

      <CircularProgress size={48} thickness={4} />

      <Typography variant="body1" sx={{ color: '#666666' }}>
        {message}
      </Typography>
    </Box>
  );

  if (fullPage) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F4F2EE',
          zIndex: 9999,
        }}
      >
        {content}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 300,
      }}
    >
      {content}
    </Box>
  );
};

export default Loading;
