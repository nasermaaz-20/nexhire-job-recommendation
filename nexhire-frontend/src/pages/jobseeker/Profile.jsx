import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  Chip,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Autocomplete,
  Rating,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Skeleton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  CameraAlt as CameraIcon,
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import SkillBadge from '../../components/ui/SkillBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useAuthStore } from '../../store/authStore';
import {
  getUserProfile,
  updateUserProfile,
  addUserSkills,
  deleteUserSkill,
  updateUserPreferences,
  addUserPreferredLocations,
  getAllSkills,
  getAllLocations,
  getAllFields,
} from '../../api/usersApi';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

const Profile = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, updateUser } = useAuthStore();

  const [profile, setProfile] = useState(null);
  const [userSkills, setUserSkills] = useState([]);
  const [preferences, setPreferences] = useState(null);
  const [preferredLocations, setPreferredLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [allSkills, setAllSkills] = useState([]);
  const [allLocations, setAllLocations] = useState([]);
  const [allFields, setAllFields] = useState([]);

  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editPreferencesOpen, setEditPreferencesOpen] = useState(false);
  const [addSkillOpen, setAddSkillOpen] = useState(false);
  const [deleteSkillDialog, setDeleteSkillDialog] = useState({ open: false, skill: null });

  const [selectedSkill, setSelectedSkill] = useState(null);
  const [skillLevel, setSkillLevel] = useState(3);

  const getCareerLevelLabel = (level) => {
    const levels = {
      1: 'Junior',
      2: 'Mid',
      3: 'Senior',
      4: 'Lead',
    };
    return levels[level] || 'Entry';
  };

  const getEmploymentTypeLabel = (type) => {
    const types = {
      1: 'Full-time',
      2: 'Part-time',
      3: 'Freelance',
      4: 'Contract',
    };
    return types[type] || 'Not specified';
  };

  const { control: profileControl, handleSubmit: handleProfileSubmit, reset: resetProfile } = useForm({
    defaultValues: {
      name: '',
      field_id: '',
      years_of_experience: '',
      career_level: '',
      current_location_id: '',
    }
  });
  const { control: preferencesControl, handleSubmit: handlePreferencesSubmit, reset: resetPreferences } = useForm({
    defaultValues: {
      preferred_employment_type: '',
      remote_preference: '',
      min_salary: '',
      max_salary: '',
      preferred_location_ids: [],
    }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileData, skillsData, locationsData, fieldsData] = await Promise.all([
        getUserProfile(),
        getAllSkills(),
        getAllLocations(),
        getAllFields(),
      ]);

      const userData = profileData.data.user;
      setProfile(userData);
      setUserSkills(userData.skills || []);
      setPreferences(userData.preferences || null);
      setPreferredLocations(userData.preferred_locations || []);

      setAllSkills(skillsData.data || []);
      setAllLocations(locationsData.data || []);
      setAllFields(fieldsData.data || []);

      resetProfile({
        name: profileData.data.user.name,
        field_id: profileData.data.user.field_id,
        years_of_experience: profileData.data.user.years_of_experience,
        career_level: profileData.data.user.career_level,
        current_location_id: profileData.data.user.current_location_id,
      });

      if (userData.preferences) {
        resetPreferences({
          preferred_employment_type: userData.preferences?.preferred_employment_type || '',
          min_salary: userData.preferences?.min_salary || userData.desired_salary_min || '',
          max_salary: userData.desired_salary_max || '',
          remote_preference: userData.preferences?.remote_preference,
          preferred_location_ids: userData.preferred_locations?.map(l => l.location_id) || [],
        });
      } else {
        resetPreferences({
          preferred_employment_type: '',
          min_salary: userData.desired_salary_min || '',
          max_salary: userData.desired_salary_max || '',
          remote_preference: '',
          preferred_location_ids: userData.preferred_locations?.map(l => l.location_id) || [],
        });
      }
    } catch (err) {
      toast.error('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateCompletion = () => {
    let completed = 1;
    let total = 4;

    if (userSkills.length > 0) completed++;
    if (preferences) completed++;
    if (profile?.current_location_id) completed++;

    return Math.round((completed / total) * 100);
  };

  const onProfileSubmit = async (data) => {
    try {
      await updateUserProfile(data);
      setProfile({ ...profile, ...data });
      updateUser(data);
      setEditProfileOpen(false);
      toast.success('Profile updated! Your recommendations will improve.');
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    }
  };

  const onPreferencesSubmit = async (data) => {
    try {
      // Build preferences payload — only include fields with valid integer values
      // Joi .optional() rejects null/NaN, so we must omit keys entirely if empty
      const prefPayload = {};

      if (data.preferred_employment_type) {
        prefPayload.preferred_employment_type = parseInt(data.preferred_employment_type);
      }

      // remote_preference can be 0 (falsy) so check explicitly for non-empty string
      if (data.remote_preference !== undefined && data.remote_preference !== '') {
        const remoteInt = parseInt(data.remote_preference);
        if (!isNaN(remoteInt)) prefPayload.remote_preference = remoteInt;
      }

      if (data.min_salary) {
        const minInt = parseInt(data.min_salary);
        if (!isNaN(minInt)) prefPayload.min_salary = minInt;
      }

      await updateUserPreferences(prefPayload);

      // desired_salary_min/max live in the users table — send together so Joi ref resolves
      const minSalaryInt = data.min_salary ? parseInt(data.min_salary) : null;
      const maxSalaryInt = data.max_salary ? parseInt(data.max_salary) : null;

      if (minSalaryInt !== null || maxSalaryInt !== null) {
        const profileSalaryPayload = {};
        if (minSalaryInt !== null && !isNaN(minSalaryInt)) profileSalaryPayload.desired_salary_min = minSalaryInt;
        if (maxSalaryInt !== null && !isNaN(maxSalaryInt)) profileSalaryPayload.desired_salary_max = maxSalaryInt;
        if (Object.keys(profileSalaryPayload).length > 0) {
          await updateUserProfile(profileSalaryPayload);
        }
      }

      // Save preferred locations separately
      if (data.preferred_location_ids?.length > 0) {
        const locationsPayload = data.preferred_location_ids.map(id => ({
          location_id: parseInt(id),
          priority: 2,
        }));
        await addUserPreferredLocations(locationsPayload);
      }

      setEditPreferencesOpen(false);
      toast.success('Preferences updated! Your recommendations will improve.');
      fetchData();
    } catch (err) {
      console.error('Preferences error:', err);
      toast.error(err.message || 'Failed to update preferences');
    }
  };

  const handleAddSkill = async () => {
    if (!selectedSkill) {
      toast.error('Please select a skill');
      return;
    }

    try {
      await addUserSkills([{ skill_id: selectedSkill.id, level: skillLevel }]);
      toast.success('Skill added! Your recommendations will improve.');
      setSelectedSkill(null);
      setSkillLevel(3);
      setAddSkillOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to add skill');
    }
  };

  const handleDeleteSkill = async () => {
    try {
      await deleteUserSkill(deleteSkillDialog.skill.skill_id);
      toast.success('Skill removed');
      setDeleteSkillDialog({ open: false, skill: null });
      fetchData();
    } catch (err) {
      toast.error('Failed to remove skill');
    }
  };

  const availableSkills = allSkills.filter(
    (skill) => !userSkills.some((us) => us.skill_id === skill.id)
  );

  const completion = calculateCompletion();

  if (loading) {
    return (
      <DashboardLayout>
        <Container maxWidth="md" sx={{ py: 3 }}>
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 3 }} />
          <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2, mb: 3 }} />
          <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
        </Container>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Card sx={{ mb: 3, borderRadius: 2, overflow: 'visible' }}>
          <Box
            sx={{
              height: isMobile ? 120 : 200,
              background: 'linear-gradient(135deg, #0A66C2 0%, #004182 100%)',
              position: 'relative',
            }}
          />
          <Box sx={{ position: 'relative', px: 3, pb: 3 }}>
            <Box sx={{ position: 'relative', display: 'inline-block', mt: -8 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  fontSize: 48,
                  fontWeight: 600,
                  backgroundColor: '#0A66C2',
                  border: '4px solid white',
                }}
              >
                {profile?.name?.charAt(0)?.toUpperCase()}
              </Avatar>
              <IconButton
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: 'white',
                  boxShadow: 1,
                  '&:hover': { backgroundColor: '#F4F2EE' },
                }}
                size="small"
              >
                <CameraIcon fontSize="small" />
              </IconButton>
            </Box>

            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setEditProfileOpen(true)}
              sx={{ position: 'absolute', top: 16, right: 16 }}
            >
              Edit Profile
            </Button>

            <Box sx={{ mt: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
                {profile?.name}
              </Typography>
              <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>
                {profile?.field_name || 'No field specified'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                {profile?.career_level && (
                  <Chip label={getCareerLevelLabel(profile.career_level)} color="primary" size="small" />
                )}
                {profile?.years_of_experience && (
                  <Chip label={`${profile.years_of_experience} years exp`} size="small" />
                )}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#666' }}>
                <LocationIcon fontSize="small" />
                <Typography variant="body2">{profile?.location_name || 'No location set'}</Typography>
              </Box>
            </Box>
          </Box>
        </Card>

        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Profile Strength
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {completion}% Complete
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: completion < 40 ? '#D32F2F' : completion < 70 ? '#E68523' : '#057642',
                    fontWeight: 600,
                  }}
                >
                  {completion < 40 ? 'Weak' : completion < 70 ? 'Good' : 'Strong'}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={completion}
                sx={{
                  height: 10,
                  borderRadius: 1,
                  backgroundColor: '#E0E0E0',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: completion < 40 ? '#D32F2F' : completion < 70 ? '#E68523' : '#057642',
                  },
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon sx={{ color: '#057642', fontSize: 20 }} />
                <Typography variant="body2">Basic info added</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {userSkills.length > 0 ? (
                  <CheckCircleIcon sx={{ color: '#057642', fontSize: 20 }} />
                ) : (
                  <UncheckedIcon sx={{ color: '#999', fontSize: 20 }} />
                )}
                <Typography variant="body2" sx={{ color: userSkills.length > 0 ? '#191919' : '#999' }}>
                  Skills added {userSkills.length === 0 && '- Add skills to improve recommendations'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {preferences ? (
                  <CheckCircleIcon sx={{ color: '#057642', fontSize: 20 }} />
                ) : (
                  <UncheckedIcon sx={{ color: '#999', fontSize: 20 }} />
                )}
                <Typography variant="body2" sx={{ color: preferences ? '#191919' : '#999' }}>
                  Preferences set {!preferences && '- Set preferences to get better matches'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {profile?.current_location_id ? (
                  <CheckCircleIcon sx={{ color: '#057642', fontSize: 20 }} />
                ) : (
                  <UncheckedIcon sx={{ color: '#999', fontSize: 20 }} />
                )}
                <Typography variant="body2" sx={{ color: profile?.current_location_id ? '#191919' : '#999' }}>
                  Location set {!profile?.current_location_id && '- Add location for local job matches'}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Skills ({userSkills.length})
              </Typography>
              <IconButton color="primary" onClick={() => setAddSkillOpen(true)}>
                <AddIcon />
              </IconButton>
            </Box>

            {userSkills.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" sx={{ color: '#666', mb: 2 }}>
                  No skills added yet
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddSkillOpen(true)}>
                  Add Your First Skill
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {userSkills.map((userSkill) => (
                  <SkillBadge
                    key={userSkill.skill_id}
                    name={userSkill.skill_name}
                    level={userSkill.level}
                    onDelete={() => setDeleteSkillDialog({ open: true, skill: userSkill })}
                  />
                ))}
              </Box>
            )}
          </CardContent>
        </Card>

        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Job Preferences
              </Typography>
              <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setEditPreferencesOpen(true)}>
                Edit
              </Button>
            </Box>

            {!preferences ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" sx={{ color: '#666', mb: 2 }}>
                  No preferences set
                </Typography>
                <Button variant="contained" onClick={() => setEditPreferencesOpen(true)}>
                  Set Preferences
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                    Preferred Locations
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {preferredLocations.length > 0 ? (
                      preferredLocations.map((loc) => (
                        <Chip key={loc.location_id} label={loc.location_name} size="small" />
                      ))
                    ) : (
                      <Typography variant="body2">Not specified</Typography>
                    )}
                  </Box>
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                    Preferred Employment Type
                  </Typography>
                  <Chip label={getEmploymentTypeLabel(preferences.preferred_employment_type)} size="small" />
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                    Salary Expectations
                  </Typography>
                  <Typography variant="body2">
                    {preferences.min_salary || profile?.desired_salary_min
                      ? `$${((preferences.min_salary || profile?.desired_salary_min) / 1000).toFixed(0)}k${profile?.desired_salary_max ? ` - $${(profile.desired_salary_max / 1000).toFixed(0)}k` : '+'}`
                      : 'Not specified'}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                    Remote Preference
                  </Typography>
                  <Typography variant="body2">
                    {preferences.remote_preference === 0
                      ? 'Office only'
                      : preferences.remote_preference === 1
                      ? 'Remote'
                      : preferences.remote_preference === 2
                      ? 'Hybrid '
                      : 'Hybrid '}
                  </Typography>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Account Info
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Email
                </Typography>
                <Typography variant="body1">{profile?.email}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Member since
                </Typography>
                <Typography variant="body1">
                  {dayjs(profile?.created_at).format('MMMM YYYY')}
                </Typography>
              </Box>
              <Button variant="text" sx={{ alignSelf: 'flex-start', mt: 1 }} href="/settings">
                Go to Settings
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Dialog
          open={editProfileOpen}
          onClose={() => setEditProfileOpen(false)}
          maxWidth="sm"
          fullWidth
          fullScreen={isMobile}
        >
          <DialogTitle>Edit Profile</DialogTitle>
          <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Controller
                  name="name"
                  control={profileControl}
                  rules={{ required: 'Name is required' }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Full Name"
                      fullWidth
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />

                <Controller
                  name="field_id"
                  control={profileControl}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Field</InputLabel>
                      <Select {...field} value={field.value ?? ''} label="Field">
                        {allFields.map((field) => (
                          <MenuItem key={field.id} value={field.id}>
                            {field.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />

                <Controller
                  name="years_of_experience"
                  control={profileControl}
                  render={({ field }) => (
                    <TextField {...field} value={field.value ?? ''} label="Years of Experience" type="number" fullWidth />
                  )}
                />

                <Controller
                  name="career_level"
                  control={profileControl}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Career Level</InputLabel>
                      <Select {...field} value={field.value ?? ''} label="Career Level">
                        <MenuItem value={1}>Junior</MenuItem>
                        <MenuItem value={2}>Mid</MenuItem>
                        <MenuItem value={3}>Senior</MenuItem>
                        <MenuItem value={4}>Lead</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />

                <Controller
                  name="current_location_id"
                  control={profileControl}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Location</InputLabel>
                      <Select {...field} value={field.value ?? ''} label="Location">
                        {allLocations.map((loc) => (
                          <MenuItem key={loc.id} value={loc.id}>
                            {loc.city}, {loc.country}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditProfileOpen(false)}>Cancel</Button>
              <Button type="submit" variant="contained">
                Save
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        <Dialog
          open={editPreferencesOpen}
          onClose={() => setEditPreferencesOpen(false)}
          maxWidth="sm"
          fullWidth
          fullScreen={isMobile}
        >
          <DialogTitle>Edit Job Preferences</DialogTitle>
          <form onSubmit={handlePreferencesSubmit(onPreferencesSubmit)}>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Controller
                  name="preferred_location_ids"
                  control={preferencesControl}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      multiple
                      options={allLocations}
                      getOptionLabel={(option) => `${option.city}, ${option.country}`}
                      value={allLocations.filter((loc) => field.value?.includes(loc.id) || field.value?.map(String).includes(loc.id?.toString()))}
                      onChange={(_, newValue) => field.onChange(newValue.map((v) => v.id))}
                      renderInput={(params) => <TextField {...params} label="Preferred Locations" />}
                    />
                  )}
                />

                <Controller
                  name="preferred_employment_type"
                  control={preferencesControl}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Preferred Employment Type</InputLabel>
                      <Select {...field} value={field.value ?? ''} label="Preferred Employment Type">
                        <MenuItem value={1}>Full-time</MenuItem>
                        <MenuItem value={2}>Part-time</MenuItem>
                        <MenuItem value={3}>Freelance</MenuItem>
                        <MenuItem value={4}>Contract</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Controller
                    name="min_salary"
                    control={preferencesControl}
                    render={({ field }) => (
                      <TextField {...field} value={field.value ?? ''} label="Min Salary" type="number" fullWidth />
                    )}
                  />
                  <Controller
                    name="max_salary"
                    control={preferencesControl}
                    render={({ field }) => (
                      <TextField {...field} value={field.value ?? ''} label="Max Salary" type="number" fullWidth />
                    )}
                  />
                </Box>

                <Controller
                  name="remote_preference"
                  control={preferencesControl}
                  render={({ field }) => (
                    <FormControl>
                      <FormLabel>Remote Preference</FormLabel>
                      <RadioGroup {...field} value={field.value ?? ''}>
                        <FormControlLabel value={0} control={<Radio />} label="Office only" />
                        <FormControlLabel value={1} control={<Radio />} label="Remote preferred" />
                        <FormControlLabel value={2} control={<Radio />} label="Hybrid/Flexible" />
                      </RadioGroup>
                    </FormControl>
                  )}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditPreferencesOpen(false)}>Cancel</Button>
              <Button type="submit" variant="contained">
                Save
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        <Dialog
          open={addSkillOpen}
          onClose={() => setAddSkillOpen(false)}
          maxWidth="sm"
          fullWidth
          fullScreen={isMobile}
        >
          <DialogTitle>Add Skill</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
              <Autocomplete
                options={availableSkills}
                getOptionLabel={(option) => option.name}
                value={selectedSkill}
                onChange={(_, newValue) => setSelectedSkill(newValue)}
                renderInput={(params) => <TextField {...params} label="Search Skills" />}
              />

              {selectedSkill && (
                <Box>
                  <FormLabel sx={{ mb: 1, display: 'block' }}>Proficiency Level</FormLabel>
                  <Rating
                    value={skillLevel}
                    onChange={(_, newValue) => setSkillLevel(newValue)}
                    max={5}
                    size="large"
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      Beginner
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      Expert
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddSkillOpen(false)}>Cancel</Button>
            <Button onClick={handleAddSkill} variant="contained" disabled={!selectedSkill}>
              Add Skill
            </Button>
          </DialogActions>
        </Dialog>

        <ConfirmDialog
          open={deleteSkillDialog.open}
          title="Remove Skill"
          message={`Are you sure you want to remove "${deleteSkillDialog.skill?.skill_name}"?`}
          onConfirm={handleDeleteSkill}
          onCancel={() => setDeleteSkillDialog({ open: false, skill: null })}
          severity="warning"
        />
      </Container>
    </DashboardLayout>
  );
};

export default Profile;
