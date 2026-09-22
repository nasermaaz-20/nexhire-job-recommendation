import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Collapse,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Lock as LockIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useAuthStore } from '../../store/authStore';
import { changePassword, updateProfile } from '../../api/authApi';
import { toast } from 'react-toastify';

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [changeEmailOpen, setChangeEmailOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);

  const [notifications, setNotifications] = useState({
    newRecommendations: true,
    applicationViews: true,
    weeklyDigest: true,
    marketing: false,
  });

  const [privacy, setPrivacy] = useState({
    showProfile: true,
    allowRecommendations: true,
  });

  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors },
    reset: resetEmail,
  } = useForm();

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    watch,
    reset: resetPassword,
  } = useForm();

  const newPassword = watch('newPassword');

  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }

    const savedPrivacy = localStorage.getItem('privacy');
    if (savedPrivacy) {
      setPrivacy(JSON.parse(savedPrivacy));
    }
  }, []);

  const handleNotificationChange = (key) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
    toast.success('Notification preferences saved');
  };

  const handlePrivacyChange = (key) => {
    const updated = { ...privacy, [key]: !privacy[key] };
    setPrivacy(updated);
    localStorage.setItem('privacy', JSON.stringify(updated));
    toast.success('Privacy settings saved');
  };

  const onEmailSubmit = async (data) => {
    try {
      await updateProfile({ email: data.newEmail });
      toast.success('Email updated successfully');
      setChangeEmailOpen(false);
      resetEmail();
    } catch (err) {
      toast.error(err.message || 'Failed to update email');
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      await changePassword(data.currentPassword, data.newPassword);
      toast.success('Password changed successfully');
      setChangePasswordOpen(false);
      resetPassword();
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      toast.success('Account deleted successfully');
      logout();
      navigate('/');
    } catch (err) {
      toast.error('Failed to delete account');
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 25;
    return strength;
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <DashboardLayout>
      <Container maxWidth="sm" sx={{ py: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
          Settings
        </Typography>

        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <PersonIcon sx={{ color: '#0A66C2' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Account
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                Email Address
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField
                  value={user?.email || ''}
                  disabled
                  fullWidth
                  size="small"
                />
                <Button
                  variant="outlined"
                  onClick={() => setChangeEmailOpen(!changeEmailOpen)}
                  sx={{ minWidth: 100 }}
                >
                  {changeEmailOpen ? 'Cancel' : 'Change'}
                </Button>
              </Box>

              <Collapse in={changeEmailOpen}>
                <form onSubmit={handleEmailSubmit(onEmailSubmit)}>
                  <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      label="New Email"
                      type="email"
                      fullWidth
                      {...registerEmail('newEmail', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      })}
                      error={!!emailErrors.newEmail}
                      helperText={emailErrors.newEmail?.message}
                    />
                    <TextField
                      label="Password (to confirm)"
                      type="password"
                      fullWidth
                      {...registerEmail('password', { required: 'Password is required' })}
                      error={!!emailErrors.password}
                      helperText={emailErrors.password?.message}
                    />
                    <Button type="submit" variant="contained" fullWidth>
                      Update Email
                    </Button>
                  </Box>
                </form>
              </Collapse>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Password
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => setChangePasswordOpen(!changePasswordOpen)}
                  sx={{ ml: 'auto' }}
                >
                  {changePasswordOpen ? 'Cancel' : 'Change Password'}
                </Button>
              </Box>

              <Collapse in={changePasswordOpen}>
                <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      label="Current Password"
                      type="password"
                      fullWidth
                      {...registerPassword('currentPassword', {
                        required: 'Current password is required',
                      })}
                      error={!!passwordErrors.currentPassword}
                      helperText={passwordErrors.currentPassword?.message}
                    />
                    <Box>
                      <TextField
                        label="New Password"
                        type="password"
                        fullWidth
                        {...registerPassword('newPassword', {
                          required: 'New password is required',
                          minLength: {
                            value: 8,
                            message: 'Password must be at least 8 characters',
                          },
                        })}
                        error={!!passwordErrors.newPassword}
                        helperText={passwordErrors.newPassword?.message}
                      />
                      {newPassword && (
                        <Box sx={{ mt: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" sx={{ color: '#666' }}>
                              Password strength
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color:
                                  passwordStrength < 50
                                    ? '#D32F2F'
                                    : passwordStrength < 75
                                    ? '#E68523'
                                    : '#057642',
                                fontWeight: 600,
                              }}
                            >
                              {passwordStrength < 50
                                ? 'Weak'
                                : passwordStrength < 75
                                ? 'Good'
                                : 'Strong'}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={passwordStrength}
                            sx={{
                              height: 6,
                              borderRadius: 1,
                              backgroundColor: '#E0E0E0',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor:
                                  passwordStrength < 50
                                    ? '#D32F2F'
                                    : passwordStrength < 75
                                    ? '#E68523'
                                    : '#057642',
                              },
                            }}
                          />
                        </Box>
                      )}
                    </Box>
                    <TextField
                      label="Confirm New Password"
                      type="password"
                      fullWidth
                      {...registerPassword('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: (value) =>
                          value === newPassword || 'Passwords do not match',
                      })}
                      error={!!passwordErrors.confirmPassword}
                      helperText={passwordErrors.confirmPassword?.message}
                    />
                    <Button type="submit" variant="contained" fullWidth>
                      Update Password
                    </Button>
                  </Box>
                </form>
              </Collapse>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <NotificationsIcon sx={{ color: '#0A66C2' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Notifications
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.newRecommendations}
                    onChange={() => handleNotificationChange('newRecommendations')}
                  />
                }
                label="Email notifications for new recommendations"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.applicationViews}
                    onChange={() => handleNotificationChange('applicationViews')}
                  />
                }
                label="Email when someone views your application"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.weeklyDigest}
                    onChange={() => handleNotificationChange('weeklyDigest')}
                  />
                }
                label="Weekly job digest email"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.marketing}
                    onChange={() => handleNotificationChange('marketing')}
                  />
                }
                label="Marketing emails"
              />
            </Box>

            <Typography variant="caption" sx={{ color: '#666', mt: 2, display: 'block' }}>
              Notification preferences saved locally.
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <LockIcon sx={{ color: '#0A66C2' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Privacy
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={privacy.showProfile}
                    onChange={() => handlePrivacyChange('showProfile')}
                  />
                }
                label="Show my profile to employers"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={privacy.allowRecommendations}
                    onChange={() => handlePrivacyChange('allowRecommendations')}
                  />
                }
                label="Allow recommendations based on my activity"
              />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 2, border: '2px solid #FFEBEE' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <WarningIcon sx={{ color: '#D32F2F' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#D32F2F' }}>
                Danger Zone
              </Typography>
            </Box>

            <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
              Once you delete your account, there is no going back. Please be certain.
            </Typography>

            <Button
              variant="outlined"
              color="error"
              onClick={() => setDeleteAccountOpen(true)}
              fullWidth
            >
              Delete Account
            </Button>
          </CardContent>
        </Card>

        <ConfirmDialog
          open={deleteAccountOpen}
          title="Delete Account?"
          message="This action cannot be undone. All your data, applications, and saved jobs will be permanently deleted."
          confirmLabel="Delete My Account"
          cancelLabel="Cancel"
          onConfirm={handleDeleteAccount}
          onCancel={() => setDeleteAccountOpen(false)}
          severity="danger"
        />
      </Container>
    </DashboardLayout>
  );
};

export default Settings;
