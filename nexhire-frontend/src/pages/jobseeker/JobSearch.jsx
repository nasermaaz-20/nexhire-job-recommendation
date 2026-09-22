import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
  Checkbox,
  FormGroup,
  Drawer,
  IconButton,
  Pagination,
  Typography,
  Skeleton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import JobCard from '../../components/ui/JobCard';
import EmptyState from '../../components/common/EmptyState';
import { getAllJobs, saveJob, unsaveJob } from '../../api/jobsApi';
import { applyToJob, getMyApplications } from '../../api/applicationsApi';
import { recordInteraction } from '../../api/recommendationsApi';
import { getAllFields, getAllLocations } from '../../api/usersApi';
import { toast } from 'react-toastify';

const JobSearch = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const [searchId, setSearchId] = useState('');
  const [searchType, setSearchType] = useState('job');
  const [activeCompanyId, setActiveCompanyId] = useState(null); // tracks current company filter
  const [jobs, setJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const [fields, setFields] = useState([]);
  const [locations, setLocations] = useState([]);

  const [filters, setFilters] = useState({
    field_ids: [],
    job_levels: [],
    employment_types: [],
    date_posted: 'any',
  });

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const limit = 30;

  const quickFilters = [];

  useEffect(() => {
    fetchFields();
    fetchLocations();
    fetchAppliedJobs();
  }, []);

  useEffect(() => {
    fetchJobs(activeCompanyId);
  }, [page, filters, activeCompanyId]);

  const fetchAppliedJobs = async () => {
    try {
      const data = await getMyApplications();
      const ids = new Set((data.data || []).map(app => String(app.job_id)));
      setAppliedJobIds(ids);
    } catch (err) {
      console.error('Failed to fetch applied jobs:', err);
    }
  };

  const fetchFields = async () => {
    try {
      const data = await getAllFields();
      setFields(data.data || []);
    } catch (err) {
      console.error('Failed to fetch fields:', err);
    }
  };

  const fetchLocations = async () => {
    try {
      const data = await getAllLocations();
      setLocations(data.data || []);
    } catch (err) {
      console.error('Failed to fetch locations:', err);
    }
  };

  const fetchJobs = async (companyId) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        limit,
        field_id: filters.field_ids.length === 1 ? filters.field_ids[0] : undefined,
        job_level: filters.job_levels.length === 1 ? filters.job_levels[0] : undefined,
      };

      if (companyId) params.company_id = companyId;

      const data = await getAllJobs(params);
      let jobs = data.data || [];

      // Filter by multiple job_levels / employment_types on frontend (backend only supports single values)
      if (filters.job_levels.length > 1) {
        jobs = jobs.filter(j => filters.job_levels.includes(j.job_level));
      }
      if (filters.employment_types.length > 0) {
        jobs = jobs.filter(j => filters.employment_types.includes(j.employment_type));
      }

      // Date posted filter
      if (filters.date_posted !== 'any') {
        const now = new Date();
        const cutoff = new Date();
        if (filters.date_posted === '24h') cutoff.setHours(now.getHours() - 24);
        else if (filters.date_posted === 'week') cutoff.setDate(now.getDate() - 7);
        else if (filters.date_posted === 'month') cutoff.setMonth(now.getMonth() - 1);
        jobs = jobs.filter(j => new Date(j.created_at) >= cutoff);
      }

      // Enforce 30-item limit
      jobs = jobs.slice(0, 30);

      setJobs(jobs);
      setTotalJobs(jobs.length);
      setTotalPages(1);
    } catch (err) {
      setError('Unable to load jobs. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const id = searchId.trim();
    if (!id) {
      toast.error('Please enter an ID');
      return;
    }
    if (isNaN(id)) {
      toast.error('ID must be a number');
      return;
    }
    if (searchType === 'job') {
      navigate('/jobs/' + id);
    } else {
      setActiveCompanyId(id);
      setPage(1);
      // Call directly to avoid race condition between setPage and setActiveCompanyId
      fetchJobs(id);
    }
  };

  const handleQuickFilter = () => {};

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleApplyFilters = () => {
    setPage(1);
    fetchJobs(null);
    setFilterDrawerOpen(false);
  };

  const handleClearFilters = () => {
    setFilters({
      field_ids: [],
      job_levels: [],
      employment_types: [],
      date_posted: 'any',
    });
  };

  const handleSave = async (jobId, isSaving) => {
    try {
      if (isSaving) {
        await saveJob(jobId);
        toast.success('Job saved!');
      } else {
        await unsaveJob(jobId);
        toast.success('Job unsaved');
      }
    } catch (err) {
      toast.error('Failed to save job');
    }
  };

  const handleApply = async (jobId) => {
    try {
      await applyToJob(jobId);
      await recordInteraction(jobId, 'apply');
      setAppliedJobIds(prev => new Set([...prev, String(jobId)]));
      toast.success('Application submitted!');
    } catch (err) {
      toast.error(err.message || 'Failed to apply');
    }
  };

  const handleView = async (jobId) => {
    try {
      await recordInteraction(jobId, 'view');
    } catch (err) {
      console.error('Failed to record view:', err);
    }
  };

  const FilterSidebar = () => (
    <Box sx={{ width: isMobile ? '100%' : 280, p: 3, backgroundColor: '#fff', borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Filters
        </Typography>
        {isMobile && (
          <IconButton onClick={() => setFilterDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      {/* Field / Specialization */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Field / Category
        </Typography>
        <FormGroup>
          {fields.map((field) => (
            <FormControlLabel
              key={field.id}
              control={
                <Checkbox
                  checked={filters.field_ids.includes(field.id)}
                  onChange={(e) => {
                    const updated = e.target.checked
                      ? [...filters.field_ids, field.id]
                      : filters.field_ids.filter((id) => id !== field.id);
                    handleFilterChange('field_ids', updated);
                  }}
                />
              }
              label={field.name}
            />
          ))}
        </FormGroup>
      </Box>

      {/* Job Level — integers 1-4 only */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Job Level
        </Typography>
        <FormGroup>
          {[{ value: 1, label: 'Junior' }, { value: 2, label: 'Mid' }, { value: 3, label: 'Senior' }, { value: 4, label: 'Lead' }].map(({ value, label }) => (
            <FormControlLabel
              key={value}
              control={
                <Checkbox
                  checked={filters.job_levels.includes(value)}
                  onChange={(e) => {
                    const updated = e.target.checked
                      ? [...filters.job_levels, value]
                      : filters.job_levels.filter((l) => l !== value);
                    handleFilterChange('job_levels', updated);
                  }}
                />
              }
              label={label}
            />
          ))}
        </FormGroup>
      </Box>

      {/* Employment Type — integers 1-4 only */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Employment Type
        </Typography>
        <FormGroup>
          {[{ value: 1, label: 'Full-time' }, { value: 2, label: 'Part-time' }, { value: 3, label: 'Freelance' }, { value: 4, label: 'Contract' }].map(({ value, label }) => (
            <FormControlLabel
              key={value}
              control={
                <Checkbox
                  checked={filters.employment_types.includes(value)}
                  onChange={(e) => {
                    const updated = e.target.checked
                      ? [...filters.employment_types, value]
                      : filters.employment_types.filter((t) => t !== value);
                    handleFilterChange('employment_types', updated);
                  }}
                />
              }
              label={label}
            />
          ))}
        </FormGroup>
      </Box>

      {/* Date Posted */}
      <Box sx={{ mb: 3 }}>
        <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>
          Date Posted
        </FormLabel>
        <RadioGroup
          value={filters.date_posted}
          onChange={(e) => handleFilterChange('date_posted', e.target.value)}
        >
          <FormControlLabel value="any" control={<Radio />} label="Any time" />
          <FormControlLabel value="24h" control={<Radio />} label="Past 24 hours" />
          <FormControlLabel value="week" control={<Radio />} label="Past week" />
          <FormControlLabel value="month" control={<Radio />} label="Past month" />
        </RadioGroup>
      </Box>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button variant="text" onClick={handleClearFilters} fullWidth>
          Clear all
        </Button>
        <Button variant="contained" onClick={handleApplyFilters} fullWidth>
          Apply
        </Button>
      </Box>
    </Box>
  );

  return (
    <DashboardLayout>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box
          sx={{
            backgroundColor: '#fff',
            borderRadius: 2,
            p: 3,
            mb: 3,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <FormControl size="medium" sx={{ minWidth: 200 }}>
              <InputLabel>Search Type</InputLabel>
              <Select
                value={searchType}
                label="Search Type"
                onChange={(e) => setSearchType(e.target.value)}
              >
                <MenuItem value="job">Search by Job ID</MenuItem>
                <MenuItem value="company">Search by Company ID</MenuItem>
              </Select>
            </FormControl>
            <TextField
              placeholder="Enter ID"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value.replace(/\D/g, ''))}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              inputProps={{ inputMode: 'numeric' }}
              sx={{ flex: 1, minWidth: 160 }}
            />
            <Button variant="contained" onClick={handleSearch} sx={{ px: 4, height: 56 }}>
              Search
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 3 }}>
          {!isMobile && <FilterSidebar />}

          <Box sx={{ flex: 1 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography variant="body1" sx={{ color: '#666' }}>
                {totalJobs} jobs found
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                {isMobile && (
                  <Button
                    startIcon={<FilterIcon />}
                    onClick={() => setFilterDrawerOpen(true)}
                  >
                    Filters
                  </Button>
                )}
              </Box>
            </Box>

            {loading && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
                ))}
              </Box>
            )}

            {error && (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 8,
                  backgroundColor: '#fff',
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {error}
                </Typography>
                <Button variant="contained" onClick={fetchJobs}>
                  Try again
                </Button>
              </Box>
            )}

            {!loading && !error && jobs.length === 0 && (
              <EmptyState
                icon={SearchIcon}
                title="No jobs match your search"
                description="Try different filters or search terms."
              />
            )}

            {!loading && !error && jobs.length > 0 && (
              <>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                  {jobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onSave={handleSave}
                      onView={handleView}
                      isApplied={appliedJobIds.has(String(job.id))}
                    />
                  ))}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    Showing {(page - 1) * limit + 1}-{Math.min(page * limit, totalJobs)} of {totalJobs}
                  </Typography>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                    color="primary"
                  />
                </Box>
              </>
            )}
          </Box>
        </Box>

        <Drawer
          anchor="left"
          open={filterDrawerOpen}
          onClose={() => setFilterDrawerOpen(false)}
        >
          <FilterSidebar />
        </Drawer>
      </Container>
    </DashboardLayout>
  );
};

export default JobSearch;
