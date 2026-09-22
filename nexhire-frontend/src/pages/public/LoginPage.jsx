import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Link,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { Visibility, VisibilityOff, Person, Business } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuthStore } from '../../store/authStore';
import { USER_ROLES, TOKEN_KEY, USER_KEY } from '../../utils/constants';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [accountType, setAccountType] = useState('user');

  // Pre-fill from company signup redirect
  const locationState = location.state || {};

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (locationState.prefillEmail) setValue('email', locationState.prefillEmail);
    if (locationState.prefillPassword) setValue('password', locationState.prefillPassword);
    if (locationState.accountType) setAccountType(locationState.accountType);
  }, []);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');

    // Hardcoded admin login — no backend call
    if (data.email === 'admin@gmail.com' && data.password === 'Password123') {
      const adminUser = { id: 'admin', role: 'admin', type: 'admin', email: 'admin@gmail.com', name: 'System Admin' };
      const mockToken = 'mock-admin-token';
      localStorage.setItem(TOKEN_KEY, mockToken);
      localStorage.setItem(USER_KEY, JSON.stringify(adminUser));
      useAuthStore.setState({ user: adminUser, token: mockToken, isAuthenticated: true });
      toast.success('Welcome, Admin!');
      setIsLoading(false);
      navigate('/admin/dashboard');
      return;
    }

    try {
      const user = await login(data.email, data.password, accountType);
      toast.success('Welcome back!');

      if (user.role === USER_ROLES.JOB_SEEKER) {
        navigate('/dashboard');
      } else if (user.role === USER_ROLES.COMPANY) {
        navigate('/company/dashboard');
      } else if (user.role === USER_ROLES.ADMIN) {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      const status = err?.status;
      const errorMessage = err?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      if (status === 403) {
        toast.warning(errorMessage);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#F4F2EE',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 8,
        px: 2,
      }}
    >
      <Box sx={{ maxWidth: 1128, width: '100%', textAlign: 'center', mb: 4 }}>
        <Typography
          variant="h1"
          sx={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#0A66C2',
            mb: 1,
          }}
        >
          NexHire
        </Typography>
        <Typography variant="body1" sx={{ color: '#666666' }}>
          Find your next career move
        </Typography>
      </Box>

      <Card
        sx={{
          maxWidth: 400,
          width: '100%',
          p: 4,
          boxShadow: '0 0 0 1px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.05)',
        }}
      >
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          Sign in
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {locationState.message && !error && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {locationState.message}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              I am a:
            </Typography>
            <ToggleButtonGroup
              value={accountType}
              exclusive
              onChange={(e, value) => value && setAccountType(value)}
              fullWidth
              sx={{ mb: 2 }}
            >
              <ToggleButton value="user" sx={{ py: 1.5 }}>
                <Person sx={{ mr: 1 }} />
                Job Seeker
              </ToggleButton>
              <ToggleButton value="company" sx={{ py: 1.5 }}>
                <Business sx={{ mr: 1 }} />
                Company
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <TextField
            fullWidth
            label="Email"
            type="email"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
            error={!!errors.email}
            helperText={errors.email?.message}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters',
              },
            })}
            error={!!errors.password}
            helperText={errors.password?.message}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 1 }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <Link
              component={RouterLink}
              to="/forgot-password"
              sx={{
                fontSize: '14px',
                textDecoration: 'none',
                color: '#0A66C2',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Forgot password?
            </Link>
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isLoading}
            sx={{ mb: 2, py: 1.5 }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign in'}
          </Button>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" sx={{ color: '#666666', px: 2 }}>
              or
            </Typography>
          </Divider>

          <Button
            variant="outlined"
            fullWidth
            component={RouterLink}
            to="/signup"
            sx={{ py: 1.5 }}
          >
            New to NexHire? Join now
          </Button>
        </form>
      </Card>
    </Box>
  );
};

export default LoginPage;
