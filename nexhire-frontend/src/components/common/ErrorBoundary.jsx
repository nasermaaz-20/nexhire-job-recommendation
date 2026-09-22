import { Component } from 'react';
import { Box, Button, Typography, Container } from '@mui/material';
import { Refresh, Home } from '@mui/icons-material';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
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
              <Typography variant="h3" fontWeight="bold" sx={{ mb: 2, color: '#EF4444' }}>
                Something went wrong
              </Typography>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                We're working on fixing this. Please try refreshing the page or go back home.
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<Refresh />}
                  onClick={this.handleRefresh}
                  sx={{ px: 4 }}
                >
                  Refresh Page
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Home />}
                  onClick={this.handleGoHome}
                  sx={{ px: 4 }}
                >
                  Go Home
                </Button>
              </Box>
            </Box>
          </Container>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
