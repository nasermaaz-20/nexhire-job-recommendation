import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#F4F2EE',
        textAlign: 'center',
        p: 4,
      }}
    >
      <Typography variant="h1" sx={{ fontSize: '72px', fontWeight: 700, color: '#0A66C2' }}>
        404
      </Typography>
      <Typography variant="h2" sx={{ mb: 2 }}>
        Page Not Found
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, color: '#666666' }}>
        The page you're looking for doesn't exist.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/')}>
        Go Home
      </Button>
    </Box>
  );
};

export default NotFound;
