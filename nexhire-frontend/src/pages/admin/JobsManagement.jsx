import { useState, useEffect } from 'react';
import {
  Box, Container, Typography, TextField, Button, Card,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Chip, IconButton, FormControl, InputLabel,
  Select, MenuItem, InputAdornment, Dialog, DialogTitle,
  DialogContent, DialogActions, Divider,
} from '@mui/material';
import {
  Delete as DeleteIcon, Search as SearchIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { getAdminJobs, getAdminJobById, deleteJob } from '../../api/adminApi';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

const JOB_LEVEL_MAP = { 1: 'Junior', 2: 'Mid', 3: 'Senior', 4: 'Lead' };
const EMPLOYMENT_MAP = { 1: 'Full-time', 2: 'Part-time', 3: 'Freelance', 4: 'Contract' };
const REMOTE_MAP = { 0: 'On-site', 1: 'Hybrid', 2: 'Full Remote' };

const JobsManagement = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, job: null });
  const [detailsJob, setDetailsJob] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => { fetchJobs(); }, [page, rowsPerPage, statusFilter]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await getAdminJobs({
        page: page + 1, limit: rowsPerPage,
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setJobs(res.data || []);
      setTotal(res.pagination?.total || 0);
    } catch { toast.error('Failed to load jobs'); }
    finally { setLoading(false); }
  };

  const handleViewDetails = async (job) => {
    setDetailsOpen(true);
    setDetailsLoading(true);
    try {
      const res = await getAdminJobById(job.id);
      setDetailsJob(res.data);
    } catch { toast.error('Failed to load job details'); setDetailsOpen(false); }
    finally { setDetailsLoading(false); }
  };

  const handleDelete = async () => {
    try {
      await deleteJob(deleteDialog.job.id);
      toast.success('Job deleted');
      setDeleteDialog({ open: false, job: null });
      fetchJobs();
    } catch (err) {
      toast.error(err?.error?.message || 'Failed to delete job');
    }
  };

  return (
    <DashboardLayout>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>Manage Jobs</Typography>

        <Card sx={{ mb: 3, p: 2, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search by job title"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && fetchJobs()}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
              sx={{ flex: 1, minWidth: 200 }}
            />
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} label="Status" onChange={e => { setStatusFilter(e.target.value); setPage(0); }}>
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" onClick={() => { setPage(0); fetchJobs(); }}>Search</Button>
          </Box>
        </Card>

        <Card sx={{ borderRadius: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Field</TableCell>
                  <TableCell>Level</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Applications</TableCell>
                  <TableCell>Posted</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {jobs.map(job => (
                  <TableRow key={job.id}>
                    <TableCell>{job.id}</TableCell>
                    <TableCell>{job.title}</TableCell>
                    <TableCell>{job.company_name || '-'}</TableCell>
                    <TableCell>{job.field_name || '-'}</TableCell>
                    <TableCell>{JOB_LEVEL_MAP[job.job_level] || job.job_level}</TableCell>
                    <TableCell>{EMPLOYMENT_MAP[job.employment_type] || job.employment_type}</TableCell>
                    <TableCell>{job.applications_count ?? 0}</TableCell>
                    <TableCell>{dayjs(job.created_at).format('MMM DD, YYYY')}</TableCell>
                    <TableCell>
                      <Chip label={job.is_active ? 'Active' : 'Inactive'} size="small" color={job.is_active ? 'success' : 'default'} />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleViewDetails(job)}>
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => setDeleteDialog({ open: true, job })}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && jobs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 4, color: '#999' }}>No jobs found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div" count={total} page={page}
            onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage}
            onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          />
        </Card>

        {/* Job Details Dialog */}
        <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Job Details</DialogTitle>
          <DialogContent>
            {detailsLoading ? (
              <Typography sx={{ py: 2, color: '#666' }}>Loading...</Typography>
            ) : detailsJob && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 1 }}>
                {[
                  ['Job ID', detailsJob.id],
                  ['Title', detailsJob.title],
                  ['Company', `${detailsJob.company_name} (ID: ${detailsJob.company_id})`],
                  ['Field', detailsJob.field_name || '—'],
                  ['Location', detailsJob.location_name || '—'],
                  ['Job Level', JOB_LEVEL_MAP[detailsJob.job_level] || detailsJob.job_level],
                  ['Employment Type', EMPLOYMENT_MAP[detailsJob.employment_type] || detailsJob.employment_type],
                  ['Remote Option', REMOTE_MAP[detailsJob.remote_option] ?? detailsJob.remote_option],
                  ['Salary', detailsJob.salary_min != null ? `$${detailsJob.salary_min} – $${detailsJob.salary_max}` : '—'],
                  ['Experience', detailsJob.experience_min != null ? `${detailsJob.experience_min} – ${detailsJob.experience_max} yrs` : '—'],
                  ['Posted', dayjs(detailsJob.created_at).format('MMM DD, YYYY')],
                  ['Expires', detailsJob.expires_at ? dayjs(detailsJob.expires_at).format('MMM DD, YYYY') : '—'],
                ].map(([label, val]) => (
                  <Box key={label}>
                    <Typography variant="caption" sx={{ color: '#666' }}>{label}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{val}</Typography>
                  </Box>
                ))}
                <Box>
                  <Typography variant="caption" sx={{ color: '#666' }}>Status</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip label={detailsJob.is_active ? 'Active' : 'Inactive'} size="small" color={detailsJob.is_active ? 'success' : 'default'} />
                  </Box>
                </Box>
                {detailsJob.skills?.length > 0 && (
                  <>
                    <Divider />
                    <Typography variant="caption" sx={{ color: '#666' }}>Required Skills</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                      {detailsJob.skills.map((s, i) => (
                        <Chip key={i} label={`${s.name} (${s.importance}/5)`} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        <ConfirmDialog
          open={deleteDialog.open}
          title="Delete Job?"
          message={`Are you sure you want to delete "${deleteDialog.job?.title}"? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteDialog({ open: false, job: null })}
          severity="danger"
        />
      </Container>
    </DashboardLayout>
  );
};

export default JobsManagement;
