import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Checkbox,
  FormControlLabel,
  LinearProgress,
  Fade,
} from '@mui/material';
import { Visibility, VisibilityOff, PersonSearch, Business } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuthStore } from '../../store/authStore';
import { USER_ROLES } from '../../utils/constants';
import { getAllFields } from '../../api/usersApi';

const SignUpPage = () => {
  const navigate = useNavigate();
  const signup = useAuthStore((state) => state.signup);
  const [accountType, setAccountType] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fields, setFields] = useState([]);

  useEffect(() => {
    getAllFields().then(r => setFields(r.data || [])).catch(() => {});
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password', '');

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { strength: 0, label: '', color: '' };
    const hasUpper = /[A-Z]/.test(pwd);
    const hasDigit = /\d/.test(pwd);
    if (pwd.length < 8 || !hasUpper || !hasDigit) return { strength: 33, label: 'Weak', color: '#CC1016' };
    if (pwd.length < 10) return { strength: 66, label: 'Medium', color: '#F5C75D' };
    return { strength: 100, label: 'Strong', color: '#057642' };
  };

  const passwordStrength = getPasswordStrength(password);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');

    // Block reserved admin email
    if (data.email.toLowerCase() === 'admin@gmail.com') {
      toast.error('This email address is reserved and cannot be registered.');
      setIsLoading(false);
      return;
    }

    try {
      const userData = {
        email: data.email,
        password: data.password,
        accountType: accountType,
      };

      if (accountType === 'jobseeker') {
        userData.name = data.fullName;
        userData.career_level = parseInt(data.careerLevel);
        userData.years_of_experience = parseInt(data.yearsOfExperience) || 0;
        if (data.fieldId) {
          userData.field_id = parseInt(data.fieldId);
        }
      } else {
        userData.name = data.companyName;
        userData.industry = parseInt(data.industry);
        userData.company_size = parseInt(data.companySize);
      }

      const user = await signup(userData);

      if (accountType === 'jobseeker') {
        toast.success('Welcome to NexHire!');
        navigate('/dashboard');
      } else {
        // Company: pending verification — navigate to login with pre-filled credentials
        navigate('/login', {
          state: {
            prefillEmail: data.email,
            prefillPassword: data.password,
            accountType: 'company',
            message: 'Account created. Your company is pending verification — you will be notified once approved.',
          }
        });
      }
    } catch (err) {
      console.error('Registration error:', err);
      const msg = err?.message || 'Registration failed. Please try again.';
      setError(msg);
      toast.error(msg);
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
          maxWidth: 480,
          width: '100%',
          p: 4,
          boxShadow: '0 0 0 1px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.05)',
        }}
      >
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
          Join NexHire
        </Typography>
        <Typography variant="body2" sx={{ mb: 4, color: '#666666' }}>
          Make the most of your professional life
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!accountType ? (
          <Fade in timeout={500}>
            <Box>
              <Typography variant="body1" sx={{ mb: 2, fontWeight: 600 }}>
                Choose your account type
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <Card
                  onClick={() => setAccountType('jobseeker')}
                  sx={{
                    flex: 1,
                    p: 3,
                    cursor: 'pointer',
                    border: '2px solid transparent',
                    '&:hover': {
                      borderColor: '#0A66C2',
                      backgroundColor: '#F0F7FF',
                    },
                  }}
                >
                  <PersonSearch sx={{ fontSize: 48, color: '#0A66C2', mb: 2 }} />
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    I'm looking for a job
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666666' }}>
                    Find opportunities that match your skills
                  </Typography>
                </Card>

                <Card
                  onClick={() => setAccountType('company')}
                  sx={{
                    flex: 1,
                    p: 3,
                    cursor: 'pointer',
                    border: '2px solid transparent',
                    '&:hover': {
                      borderColor: '#0A66C2',
                      backgroundColor: '#F0F7FF',
                    },
                  }}
                >
                  <Business sx={{ fontSize: 48, color: '#0A66C2', mb: 2 }} />
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    I'm hiring talent
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666666' }}>
                    Post jobs and find the best candidates
                  </Typography>
                </Card>
              </Box>
            </Box>
          </Fade>
        ) : (
          <Fade in timeout={500}>
            <form onSubmit={handleSubmit(onSubmit)}>
              {accountType === 'jobseeker' ? (
                <>
                  <TextField
                    fullWidth
                    label="Full Name"
                    {...register('fullName', { required: 'Full name is required' })}
                    error={!!errors.fullName}
                    helperText={errors.fullName?.message}
                    sx={{ mb: 2 }}
                  />

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
                        value: 8,
                        message: 'Password must be at least 8 characters',
                      },
                      pattern: {
                        value: /^(?=.*[A-Z])(?=.*\d).+$/,
                        message: 'Must contain at least one uppercase letter and one number',
                      },
                    })}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 1 }}
                  />

                  {password && (
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <LinearProgress
                          variant="determinate"
                          value={passwordStrength.strength}
                          sx={{
                            flex: 1,
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: '#E0E0E0',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: passwordStrength.color,
                            },
                          }}
                        />
                        <Typography variant="caption" sx={{ color: passwordStrength.color }}>
                          {passwordStrength.label}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  <TextField
                    fullWidth
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) => value === password || 'Passwords do not match',
                    })}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2 }}
                  />

                  <FormControl fullWidth sx={{ mb: 2 }} error={!!errors.careerLevel}>
                    <InputLabel>Career Level</InputLabel>
                    <Select
                      label="Career Level"
                      defaultValue=""
                      {...register('careerLevel', { required: 'Career level is required' })}
                    >
                      <MenuItem value="1">Junior (0-2 years)</MenuItem>
                      <MenuItem value="2">Mid-Level (3-5 years)</MenuItem>
                      <MenuItem value="3">Senior (6-10 years)</MenuItem>
                      <MenuItem value="4">Lead (10+ years)</MenuItem>
                    </Select>
                    {errors.careerLevel && <FormHelperText>{errors.careerLevel.message}</FormHelperText>}
                  </FormControl>

                  <TextField
                    fullWidth
                    label="Years of Experience"
                    type="number"
                    {...register('yearsOfExperience', {
                      required: 'Years of experience is required',
                      min: { value: 0, message: 'Must be 0 or greater' },
                      max: { value: 50, message: 'Must be 50 or less' },
                    })}
                    error={!!errors.yearsOfExperience}
                    helperText={errors.yearsOfExperience?.message}
                    sx={{ mb: 2 }}
                  />

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Field (Optional)</InputLabel>
                    <Select
                      label="Field (Optional)"
                      defaultValue=""
                      {...register('fieldId')}
                    >
                      <MenuItem value="">None</MenuItem>
                      {fields.map(f => (
                        <MenuItem key={f.id} value={f.id}>{f.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </>
              ) : (
                <>
                  <TextField
                    fullWidth
                    label="Company Name"
                    {...register('companyName', { required: 'Company name is required' })}
                    error={!!errors.companyName}
                    helperText={errors.companyName?.message}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="Contact Email"
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
                        value: 8,
                        message: 'Password must be at least 8 characters',
                      },
                      pattern: {
                        value: /^(?=.*[A-Z])(?=.*\d).+$/,
                        message: 'Must contain at least one uppercase letter and one number',
                      },
                    })}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 1 }}
                  />

                  {password && (
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <LinearProgress
                          variant="determinate"
                          value={passwordStrength.strength}
                          sx={{
                            flex: 1,
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: '#E0E0E0',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: passwordStrength.color,
                            },
                          }}
                        />
                        <Typography variant="caption" sx={{ color: passwordStrength.color }}>
                          {passwordStrength.label}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  <TextField
                    fullWidth
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) => value === password || 'Passwords do not match',
                    })}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2 }}
                  />

                  <FormControl fullWidth sx={{ mb: 2 }} error={!!errors.industry}>
                    <InputLabel>Industry</InputLabel>
                    <Select
                      label="Industry"
                      defaultValue=""
                      {...register('industry', { required: 'Industry is required' })}
                    >
                      <MenuItem value="1">Technology</MenuItem>
                      <MenuItem value="2">Finance</MenuItem>
                      <MenuItem value="3">Healthcare</MenuItem>
                      <MenuItem value="4">E-Commerce</MenuItem>
                      <MenuItem value="5">Education</MenuItem>
                      <MenuItem value="6">Consulting</MenuItem>
                      <MenuItem value="7">Other</MenuItem>
                    </Select>
                    {errors.industry && <FormHelperText>{errors.industry.message}</FormHelperText>}
                  </FormControl>

                  <FormControl fullWidth sx={{ mb: 2 }} error={!!errors.companySize}>
                    <InputLabel>Company Size</InputLabel>
                    <Select
                      label="Company Size"
                      defaultValue=""
                      {...register('companySize', { required: 'Company size is required' })}
                    >
                      <MenuItem value="1">Startup (1-10)</MenuItem>
                      <MenuItem value="2">Small (11-50)</MenuItem>
                      <MenuItem value="3">Medium (51-200)</MenuItem>
                      <MenuItem value="4">Large (201-1000)</MenuItem>
                      <MenuItem value="5">Enterprise (1000+)</MenuItem>
                    </Select>
                    {errors.companySize && (
                      <FormHelperText>{errors.companySize.message}</FormHelperText>
                    )}
                  </FormControl>
                </>
              )}

              <FormControlLabel
                control={
                  <Checkbox
                    {...register('agreeToTerms', {
                      required: 'You must agree to the terms and conditions',
                    })}
                  />
                }
                label={
                  <Typography variant="body2">
                    I agree to the{' '}
                    <Link href="#" sx={{ color: '#0A66C2' }}>
                      Terms & Conditions
                    </Link>
                  </Typography>
                }
                sx={{ mb: 2 }}
              />
              {errors.agreeToTerms && (
                <Typography variant="caption" sx={{ color: '#CC1016', display: 'block', mb: 2 }}>
                  {errors.agreeToTerms.message}
                </Typography>
              )}

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isLoading}
                sx={{ mb: 2, py: 1.5 }}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: '#666666' }}>
                  Already on NexHire?{' '}
                  <Link component={RouterLink} to="/login" sx={{ color: '#0A66C2' }}>
                    Sign in
                  </Link>
                </Typography>
              </Box>

              <Button
                variant="text"
                onClick={() => setAccountType('')}
                sx={{ mt: 2, color: '#666666' }}
              >
                ← Back to account type
              </Button>
            </form>
          </Fade>
        )}
      </Card>
    </Box>
  );
};

export default SignUpPage;
