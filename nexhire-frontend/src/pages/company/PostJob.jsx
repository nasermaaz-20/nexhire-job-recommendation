import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  Autocomplete,
  Slider,
} from '@mui/material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import SkillBadge from '../../components/ui/SkillBadge';
import { createJob, addJobSkills, getJobById, updateJob } from '../../api/jobsApi';
import { getAllSkills, getAllLocations, getAllFields } from '../../api/usersApi';
import { toast } from 'react-toastify';

const PostJob = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editJobId = searchParams.get('edit');
  const isEditMode = !!editJobId;

  const { control, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      field_id: '',
      job_level: '',
      employment_type: '',
      min_experience: 0,
      max_experience: 5,
      location_id: '',
      remote_option: 0,
      salary_min: '',
      salary_max: '',
      expires_at: '',
    },
  });

  const [allSkills, setAllSkills] = useState([]);
  const [allLocations, setAllLocations] = useState([]);
  const [allFields, setAllFields] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  // Load existing job data in edit mode
  useEffect(() => {
    if (isEditMode && editJobId) {
      getJobById(editJobId)
        .then(res => {
          const job = res.data;
          reset({
            title: job.title || '',
            field_id: job.field_id ? Number(job.field_id) : '',
            job_level: job.job_level ?? '',
            employment_type: job.employment_type ?? '',
            min_experience: job.experience_min ?? 0,
            max_experience: job.experience_max ?? 5,
            location_id: job.location_id ? Number(job.location_id) : '',
            remote_option: job.remote_option ?? 0,
            salary_min: job.salary_min || '',
            salary_max: job.salary_max || '',
            expires_at: job.expires_at ? job.expires_at.slice(0, 10) : '',
          });
          if (job.skills?.length) {
            setSelectedSkills(job.skills.map(s => ({
              id: s.id,
              name: s.name,
              importance: s.importance ?? 3,
            })));
          }
        })
        .catch(() => toast.error('Failed to load job data'));
    }
  }, [isEditMode, editJobId]);

  const fetchData = async () => {
    try {
      const [skillsData, locationsData, fieldsData] = await Promise.all([
        getAllSkills(),
        getAllLocations(),
        getAllFields(),
      ]);
      setAllSkills(skillsData.data || []);
      setAllLocations(locationsData.data || []);
      setAllFields(fieldsData.data || []);
    } catch (err) {
      toast.error('Failed to load form data');
    }
  };

  const handleAddSkill = (skill) => {
    if (!selectedSkills.find((s) => s.id === skill.id)) {
      setSelectedSkills([...selectedSkills, { ...skill, importance: 3 }]);
    }
  };

  const handleRemoveSkill = (skillId) => {
    setSelectedSkills(selectedSkills.filter((s) => s.id !== skillId));
  };

  const handleSkillImportanceChange = (skillId, importance) => {
    setSelectedSkills(
      selectedSkills.map((s) => (s.id === skillId ? { ...s, importance } : s))
    );
  };

  const onSubmit = async (data) => {
    if (selectedSkills.length === 0) {
      toast.error('Please add at least one required skill');
      return;
    }

    const skills = selectedSkills.map((s) => ({
      skill_id: parseInt(s.id),
      importance: parseInt(s.importance),
      is_required: s.importance >= 4 ? 1 : 0,
    }));

    try {
      const jobData = {
        title: data.title,
        field_id: parseInt(data.field_id),
        job_level: parseInt(data.job_level),
        employment_type: parseInt(data.employment_type),
        location_id: parseInt(data.location_id),
        min_experience: parseInt(data.min_experience) || 0,
        max_experience: parseInt(data.max_experience) || 0,
        remote_option: parseInt(data.remote_option),
        salary_min: parseInt(data.salary_min) || null,
        salary_max: parseInt(data.salary_max) || null,
        expires_at: data.expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      if (isEditMode) {
        // Send skills inside updateJob so backend can sync deletions
        await updateJob(editJobId, { ...jobData, skills });
        toast.success('Job updated successfully!');
      } else {
        const response = await createJob(jobData);
        const jobId = response.data.id;
        await addJobSkills(jobId, skills);
        toast.success('Job posted successfully!');
      }

      navigate('/company/my-jobs');
    } catch (err) {
      toast.error(err.message || 'Failed to save job');
    }
  };

  const availableSkills = allSkills.filter(
    (skill) => !selectedSkills.find((s) => s.id === skill.id)
  );

  return (
    <DashboardLayout>
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          {isEditMode ? 'Edit Job' : 'Post a New Job'}
        </Typography>
        <Typography variant="body1" sx={{ color: '#666', mb: 3 }}>
          {isEditMode ? 'Update the job details below' : 'Fill in the details to find the right candidates'}
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Basic Info
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Controller
                  name="title"
                  control={control}
                  rules={{ required: 'Job title is required', maxLength: { value: 100, message: 'Max 100 characters' } }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Job Title"
                      fullWidth
                      error={!!errors.title}
                      helperText={errors.title?.message}
                    />
                  )}
                />

                <Controller
                  name="field_id"
                  control={control}
                  rules={{ required: 'Field is required' }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.field_id}>
                      <InputLabel>Field/Category</InputLabel>
                      <Select {...field} value={field.value ?? ''} label="Field/Category">
                        {allFields.map((f) => (
                          <MenuItem key={f.id} value={f.id}>
                            {f.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />

                <Controller
                  name="job_level"
                  control={control}
                  rules={{ required: 'Job level is required' }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.job_level}>
                      <InputLabel>Job Level</InputLabel>
                      <Select {...field} value={field.value ?? ''} label="Job Level">
                        <MenuItem value={1}>Junior</MenuItem>
                        <MenuItem value={2}>Mid</MenuItem>
                        <MenuItem value={3}>Senior</MenuItem>
                        <MenuItem value={4}>Lead</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />

                <Controller
                  name="employment_type"
                  control={control}
                  rules={{ required: 'Employment type is required' }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.employment_type}>
                      <InputLabel>Employment Type</InputLabel>
                      <Select {...field} value={field.value ?? ''} label="Employment Type">
                        <MenuItem value={1}>Full-time</MenuItem>
                        <MenuItem value={2}>Part-time</MenuItem>
                        <MenuItem value={3}>Freelance</MenuItem>
                        <MenuItem value={4}>Contract</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Requirements
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  Required Skills
                </Typography>
                <Autocomplete
                  options={availableSkills}
                  getOptionLabel={(option) => option.name}
                  onChange={(_, value) => value && handleAddSkill(value)}
                  renderInput={(params) => <TextField {...params} label="Search and add skills" />}
                />

                {selectedSkills.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    {selectedSkills.map((skill) => (
                      <Box key={skill.id} sx={{ mb: 2, p: 2, backgroundColor: '#F4F2EE', borderRadius: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <SkillBadge name={skill.name} />
                          <Button size="small" color="error" onClick={() => handleRemoveSkill(skill.id)}>
                            Remove
                          </Button>
                        </Box>
                        <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                          Importance: {skill.importance === 1 ? 'Nice to have' : skill.importance === 2 ? 'Helpful' : skill.importance === 3 ? 'Important' : skill.importance === 4 ? 'Very Important' : skill.importance === 5 ? 'Must have' : skill.importance}
                        </Typography>
                        <Slider
                          value={skill.importance}
                          onChange={(_, value) => handleSkillImportanceChange(skill.id, value)}
                          min={1}
                          max={5}
                          step={1}
                          marks
                          valueLabelDisplay="auto"
                        />
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Controller
                  name="min_experience"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} value={field.value ?? ''} label="Min Experience (years)" type="number" fullWidth />
                  )}
                />
                <Controller
                  name="max_experience"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} value={field.value ?? ''} label="Max Experience (years)" type="number" fullWidth />
                  )}
                />
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Location & Remote
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Controller
                  name="location_id"
                  control={control}
                  rules={{ required: 'Location is required' }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.location_id}>
                      <InputLabel>Job Location</InputLabel>
                      <Select {...field} value={field.value ?? ''} label="Job Location">
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
                  name="remote_option"
                  control={control}
                  rules={{ required: 'Remote option is required' }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.remote_option}>
                      <InputLabel>Remote Option</InputLabel>
                      <Select {...field} value={field.value ?? ''} label="Remote Option">
                        <MenuItem value={0}>On-site</MenuItem>
                        <MenuItem value={1}>Remote</MenuItem>
                        <MenuItem value={2}>Hybrid</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Compensation
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Controller
                  name="salary_min"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} value={field.value ?? ''} label="Min Salary ($)" type="number" fullWidth />
                  )}
                />
                <Controller
                  name="salary_max"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} value={field.value ?? ''} label="Max Salary ($)" type="number" fullWidth />
                  )}
                />
              </Box>
            </CardContent>
          </Card>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button onClick={() => navigate('/company/my-jobs')}>Cancel</Button>
            <Button type="submit" variant="contained">
              {isEditMode ? 'Save Changes' : 'Post Job'}
            </Button>
          </Box>
        </form>
      </Container>
    </DashboardLayout>
  );
};

export default PostJob;
