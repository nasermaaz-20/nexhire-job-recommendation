import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import SkillBadge from '../../components/ui/SkillBadge';
import { getUsers, getUserById, updateUserStatus, deleteUser } from '../../api/adminApi';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchQuery || undefined,
      };
      const res = await getUsers(params);
      console.log('Users API response:', res);
      setUsers(res.data || []);
      setTotalUsers(res.pagination?.total || 0);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(0);
    fetchUsers();
  };

  const handleViewDetails = async (user) => {
    try {
      const data = await getUserById(user.id);
      setSelectedUser(data.data);
      setDetailsOpen(true);
    } catch (err) {
      toast.error('Failed to load user details');
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      const newStatus = user.is_active ? 'inactive' : 'active';
      await updateUserStatus(user.id, newStatus);
      toast.success('User status updated');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser(deleteDialog.user.id);
      toast.success('User deleted');
      setDeleteDialog({ open: false, user: null });
      fetchUsers();
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  return (
    <DashboardLayout>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
          Manage Users
        </Typography>

        <Card sx={{ mb: 3, p: 2, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search by name or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 1, minWidth: 200 }}
            />
            <Button variant="contained" onClick={handleSearch}>
              Search
            </Button>
          </Box>
        </Card>

        <Card sx={{ borderRadius: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Field</TableCell>
                  <TableCell>Skills</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.field_name || '-'}</TableCell>
                    <TableCell>{user.skills_count ?? 0}</TableCell>
                    <TableCell>{user.created_at ? dayjs(user.created_at).format('MMM DD, YYYY') : '-'}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleViewDetails(user)}>
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteDialog({ open: true, user })}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4, color: '#999' }}>
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={totalUsers}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Card>

        <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>User Details</DialogTitle>
          <DialogContent>
            {selectedUser && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Name</Typography>
                  <Typography variant="body2">{selectedUser.name}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Email</Typography>
                  <Typography variant="body2">{selectedUser.email}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Field</Typography>
                  <Typography variant="body2">{selectedUser.field_name || 'N/A'}</Typography>
                </Box>
                {selectedUser.skills && selectedUser.skills.length > 0 && (
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Skills</Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {selectedUser.skills.map((skill, idx) => (
                        <SkillBadge key={idx} name={skill.name} level={skill.proficiency_level} />
                      ))}
                    </Box>
                  </Box>
                )}
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Activity</Typography>
                  <Typography variant="body2">
                    Applications: {selectedUser.applications_count || 0} | Saved Jobs: {selectedUser.saved_jobs_count || 0}
                  </Typography>
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
          title="Delete User?"
          message={`Are you sure you want to delete ${deleteDialog.user?.name}? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteDialog({ open: false, user: null })}
          severity="danger"
        />
      </Container>
    </DashboardLayout>
  );
};

export default UsersManagement;
