import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Skeleton,
} from '@mui/material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getCompanyProfile, updateCompanyProfile } from '../../api/companiesApi';
import { getAllLocations } from '../../api/usersApi';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-toastify';

const CompanyProfile = () => {
  const { updateUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [allLocations, setAllLocations] = useState([]);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      industry: '',
      company_size: '',
      location_id: '',
      founded_year: '',
      website: '',
    },
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileData, locationsData] = await Promise.all([
        getCompanyProfile(),
        getAllLocations(),
      ]);

      setAllLocations(locationsData.data || []);

      reset({
        name: profileData.data.name,
        industry: profileData.data.industry,
        company_size: profileData.data.company_size,
        location_id: profileData.data.location_id,
        founded_year: profileData.data.founded_year,
        website: profileData.data.website,
      });
    } catch (err) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      await updateCompanyProfile(data);
      updateUser(data);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Container maxWidth="md" sx={{ py: 3 }}>
          <Skeleton variant="text" width={300} height={50} sx={{ mb: 3 }} />
          <Skeleton variant="rectangular" height={600} sx={{ borderRadius: 2 }} />
        </Container>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
          Company Profile
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Company Info
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: 'Company name is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      value={field.value ?? ''}
                      label="Company Name"
                      fullWidth
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  )}
                />

                <Controller
                  name="industry"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Industry</InputLabel>
                      <Select {...field} value={field.value ?? ''} label="Industry">
                        <MenuItem value={1}>Technology</MenuItem>
                        <MenuItem value={2}>Finance</MenuItem>
                        <MenuItem value={3}>Healthcare</MenuItem>
                        <MenuItem value={4}>Ecommerce</MenuItem>
                        <MenuItem value={5}>Education</MenuItem>
                        <MenuItem value={6}>Consulting</MenuItem>
                        <MenuItem value={7}>Other</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />

                <Controller
                  name="company_size"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Company Size</InputLabel>
                      <Select {...field} value={field.value ?? ''} label="Company Size">
                        <MenuItem value={1}>Startup (1-10 employees)</MenuItem>
                        <MenuItem value={2}>Small (11-50 employees)</MenuItem>
                        <MenuItem value={3}>Medium (51-200 employees)</MenuItem>
                        <MenuItem value={4}>Large (201-1000 employees)</MenuItem>
                        <MenuItem value={5}>Enterprise (1000+ employees)</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />

                <Controller
                  name="location_id"
                  control={control}
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

                <Controller
                  name="founded_year"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} value={field.value ?? ''} label="Founded Year" type="number" fullWidth />
                  )}
                />

                <Controller
                  name="website"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} value={field.value ?? ''} label="Website URL" type="url" fullWidth />
                  )}
                />
              </Box>
            </CardContent>
          </Card>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" variant="contained" size="large">
              Save Changes
            </Button>
          </Box>
        </form>
      </Container>
    </DashboardLayout>
  );
};

export default CompanyProfile;
