import { Box, Button, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Home, Search } from '@mui/icons-material';
import { useAuthStore } from '../../store/authStore';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  const handleGoHome = () => {
    if (isAuthenticated) {
      if (user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user?.role === 'company') {
        navigate('/company/dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      navigate('/');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F4F2EE',
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            sx={{
              fontSize: '120px',
              fontWeight: 700,
              color: '#E0E0E0',
              lineHeight: 1,
              mb: 2,
            }}
          >
            404
          </Typography>

          <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
            Page Not Found
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            The page you're looking for doesn't exist or has been moved.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<Home />}
              onClick={handleGoHome}
              sx={{ px: 4 }}
            >
              Go Home
            </Button>
            <Button
              variant="outlined"
              startIcon={<Search />}
              onClick={() => navigate('/jobs')}
              sx={{ px: 4 }}
            >
              Browse Jobs
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default NotFoundPage;
