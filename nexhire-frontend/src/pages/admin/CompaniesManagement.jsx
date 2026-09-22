import { useState, useEffect } from 'react';
import {
  Box, Container, Typography, TextField, Button, Card,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, InputAdornment, FormControl,
  InputLabel, Select, MenuItem, Switch, Tooltip,
} from '@mui/material';
import {
  Visibility as VisibilityIcon, Delete as DeleteIcon,
  Search as SearchIcon,
  VerifiedUser as VerifiedIcon, GppBad as UnverifiedIcon,
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { getCompanies, deleteCompany, updateCompanyVerification } from '../../api/adminApi';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

const INDUSTRY_MAP = { 1: 'IT', 2: 'Healthcare', 3: 'Education', 4: 'Finance', 5: 'Retail', 6: 'Manufacturing', 7: 'Other' };
const COMPANY_SIZE_MAP = { 1: '1-10 employees', 2: '11-50 employees', 3: '51-200 employees', 4: '201-1000 employees', 5: '1000+ employees' };

const CompaniesManagement = () => {
  const [companies, setCompanies] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [verifyFilter, setVerifyFilter] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, company: null });

  useEffect(() => { fetchCompanies(); }, [page, rowsPerPage]);

  const fetchCompanies = async () => {
    try {
      const res = await getCompanies({ page: page + 1, limit: rowsPerPage, search: searchQuery || undefined });
      setCompanies(res.data || []);
      setTotalCompanies(res.pagination?.total || 0);
    } catch { toast.error('Failed to load companies'); }
  };

  const handleToggleVerify = async (company) => {
    try {
      await updateCompanyVerification(company.id, company.is_verified ? 0 : 1);
      toast.success('Verification updated');
      fetchCompanies();
    } catch { toast.error('Failed to update verification'); }
  };

  const handleDelete = async () => {
    try {
      await deleteCompany(deleteDialog.company.id);
      toast.success('Company deleted');
      setDeleteDialog({ open: false, company: null });
      fetchCompanies();
    } catch { toast.error('Failed to delete company'); }
  };

  // Client-side filter for verification
  const filtered = companies.filter(c => {
    if (verifyFilter === 'verified') return c.is_verified === 1 || c.is_verified === true;
    if (verifyFilter === 'unverified') return !c.is_verified;
    return true;
  });

  return (
    <DashboardLayout>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>Manage Companies</Typography>

        <Card sx={{ mb: 3, p: 2, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search by company name"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && fetchCompanies()}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
              sx={{ flex: 1, minWidth: 200 }}
            />
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Verification</InputLabel>
              <Select value={verifyFilter} label="Verification" onChange={e => setVerifyFilter(e.target.value)}>
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="verified">Verified Only</MenuItem>
                <MenuItem value="unverified">Unverified Only</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" onClick={() => { setPage(0); fetchCompanies(); }}>Search</Button>
          </Box>
        </Card>

        <Card sx={{ borderRadius: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Company Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Jobs</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell>Verified</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map(company => (
                  <TableRow key={company.id}>
                    <TableCell>{company.id}</TableCell>
                    <TableCell>{company.name}</TableCell>
                    <TableCell>{company.email || '-'}</TableCell>
                    <TableCell>{company.jobs_count || 0}</TableCell>
                    <TableCell>{dayjs(company.created_at).format('MMM DD, YYYY')}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={company.is_verified ? 'Verified' : 'Unverified'}
                          size="small"
                          color={company.is_verified ? 'success' : 'error'}
                          icon={company.is_verified ? <VerifiedIcon /> : <UnverifiedIcon />}
                        />
                        <Tooltip title={company.is_verified ? 'Revoke verification' : 'Verify company'}>
                          <Switch
                            size="small"
                            checked={!!company.is_verified}
                            onChange={() => handleToggleVerify(company)}
                            color="success"
                          />
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => { setSelectedCompany(company); setDetailsOpen(true); }}>
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => setDeleteDialog({ open: true, company })}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4, color: '#999' }}>No companies found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div" count={totalCompanies} page={page}
            onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage}
            onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          />
        </Card>

        <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Company Details</DialogTitle>
          <DialogContent>
            {selectedCompany && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 1 }}>
                {[
                  ['Company Name', selectedCompany.name],
                  ['Email', selectedCompany.email],
                  ['Industry', INDUSTRY_MAP[selectedCompany.industry] || selectedCompany.industry || '—'],
                  ['Company Size', COMPANY_SIZE_MAP[selectedCompany.company_size] || selectedCompany.company_size || '—'],
                  ['Jobs Posted', selectedCompany.jobs_count ?? 0],
                  ['Total Applicants', selectedCompany.total_applicants ?? 0],
                  ['Joined', dayjs(selectedCompany.created_at).format('MMM DD, YYYY')],
                ].map(([label, val]) => (
                  <Box key={label}>
                    <Typography variant="caption" sx={{ color: '#666' }}>{label}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{val ?? '—'}</Typography>
                  </Box>
                ))}
                <Box>
                  <Typography variant="caption" sx={{ color: '#666' }}>Verification</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip label={selectedCompany.is_verified ? 'Verified' : 'Unverified'} size="small" color={selectedCompany.is_verified ? 'success' : 'error'} />
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        <ConfirmDialog
          open={deleteDialog.open}
          title="Delete Company?"
          message={`Are you sure you want to delete ${deleteDialog.company?.name}?`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteDialog({ open: false, company: null })}
          severity="danger"
        />
      </Container>
    </DashboardLayout>
  );
};

export default CompaniesManagement;
