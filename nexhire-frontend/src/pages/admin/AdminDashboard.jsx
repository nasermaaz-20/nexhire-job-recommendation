import { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Typography, Card, CardContent, Skeleton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem, Chip, Grid,
} from '@mui/material';
import {
  People as PeopleIcon, Business as BusinessIcon,
  Work as WorkIcon, Description as DescriptionIcon,
  PersonAdd as PersonAddIcon, CheckCircle as CheckCircleIcon,
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import {
  getDashboardStats,
  getLocations, createLocation, updateLocation, deleteLocation,
  getSkills, createSkill, updateSkill, deleteSkill,
  getFields, createField, updateField, deleteField,
} from '../../api/adminApi';
import { toast } from 'react-toastify';

// ── Generic CRUD Dialog ───────────────────────────────────────────────────────
const CrudDialog = ({ open, onClose, title, fields, values, onChange, onSubmit, submitting }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {fields.map(f =>
        f.type === 'select' ? (
          <FormControl key={f.name} fullWidth size="small">
            <InputLabel>{f.label}</InputLabel>
            <Select value={values[f.name] ?? ''} label={f.label} onChange={e => onChange(f.name, e.target.value)}>
              {f.options.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
            </Select>
          </FormControl>
        ) : (
          <TextField
            key={f.name} label={f.label} size="small" fullWidth
            value={values[f.name] ?? ''}
            onChange={e => onChange(f.name, e.target.value)}
          />
        )
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button variant="contained" onClick={onSubmit} disabled={submitting}>Save</Button>
    </DialogActions>
  </Dialog>
);

// ── Confirm Delete Dialog ─────────────────────────────────────────────────────
const ConfirmDelete = ({ open, onClose, onConfirm, label }) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle>Delete {label}?</DialogTitle>
    <DialogContent>
      <Typography variant="body2">This action cannot be undone.</Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button variant="contained" color="error" onClick={onConfirm}>Delete</Button>
    </DialogActions>
  </Dialog>
);

// ── Reusable Management Table ─────────────────────────────────────────────────
const ManagementTable = ({ title, columns, rows, onAdd, onEdit, onDelete, loading }) => (
  <Card sx={{ borderRadius: 2, height: '100%' }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>{title}</Typography>
        <Button variant="contained" startIcon={<AddIcon />} size="small" onClick={onAdd}>Add New</Button>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {[1, 2, 3].map(i => <Skeleton key={i} variant="rectangular" height={40} sx={{ borderRadius: 1 }} />)}
        </Box>
      ) : (
        <TableContainer sx={{ maxHeight: 400 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {columns.map(c => <TableCell key={c.key} sx={{ fontWeight: 600 }}>{c.label}</TableCell>)}
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} align="center" sx={{ color: '#999', py: 3 }}>
                    No records found
                  </TableCell>
                </TableRow>
              ) : rows.map(row => (
                <TableRow key={row.id} hover>
                  {columns.map(c => (
                    <TableCell key={c.key}>
                      {c.render ? c.render(row) : (row[c.key] ?? '—')}
                    </TableCell>
                  ))}
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton size="small" onClick={() => onEdit(row)}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => onDelete(row)}><DeleteIcon fontSize="small" /></IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </CardContent>
  </Card>
);

// ── Main Component ────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0, totalCompanies: 0, totalJobs: 0, totalApplications: 0, newUsersThisWeek: 0, activeJobs: 0 });

  // Data
  const [locations, setLocations] = useState([]);
  const [skills, setSkills] = useState([]);
  const [fields, setFields] = useState([]);
  const [loadingLoc, setLoadingLoc] = useState(true);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [loadingFields, setLoadingFields] = useState(true);

  // Dialog state
  const [dialog, setDialog] = useState({ open: false, type: null, entity: null, values: {} });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: null, row: null });
  const [submitting, setSubmitting] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      const data = await getDashboardStats();
      setStats({
        totalUsers: data.data?.total_users || 0,
        totalCompanies: data.data?.total_companies || 0,
        totalJobs: data.data?.total_jobs || 0,
        totalApplications: data.data?.total_applications || 0,
        newUsersThisWeek: data.data?.new_users_this_week || 0,
        activeJobs: data.data?.active_jobs || 0,
      });
    } catch { /* silent */ } finally { setStatsLoading(false); }
  }, []);

  const fetchLocations = useCallback(async () => {
    setLoadingLoc(true);
    try { const r = await getLocations(); setLocations(r.data || []); }
    catch { toast.error('Failed to load locations'); }
    finally { setLoadingLoc(false); }
  }, []);

  const fetchSkills = useCallback(async () => {
    setLoadingSkills(true);
    try { const r = await getSkills(); setSkills(r.data || []); }
    catch { toast.error('Failed to load skills'); }
    finally { setLoadingSkills(false); }
  }, []);

  const fetchFields = useCallback(async () => {
    setLoadingFields(true);
    try { const r = await getFields(); setFields(r.data || []); }
    catch { toast.error('Failed to load fields'); }
    finally { setLoadingFields(false); }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchLocations();
    fetchSkills();
    fetchFields();
  }, []);

  // ── Dialog helpers ─────────────────────────────────────────────────────────
  const openAdd = (type, defaults = {}) => setDialog({ open: true, type, entity: null, values: defaults });
  const openEdit = (type, row) => setDialog({ open: true, type, entity: row, values: { ...row } });
  const closeDialog = () => setDialog({ open: false, type: null, entity: null, values: {} });
  const handleChange = (name, value) => setDialog(d => ({ ...d, values: { ...d.values, [name]: value } }));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { type, entity, values } = dialog;
      if (type === 'location') {
        if (entity) await updateLocation(entity.id, { country: values.country, city: values.city });
        else await createLocation({ country: values.country, city: values.city });
        await fetchLocations();
      } else if (type === 'skill') {
        if (entity) await updateSkill(entity.id, { name: values.name, field_id: values.field_id || null });
        else await createSkill({ name: values.name, field_id: values.field_id || null });
        await fetchSkills();
      } else if (type === 'field') {
        if (entity) await updateField(entity.id, { name: values.name });
        else await createField({ name: values.name });
        await fetchFields();
      }
      toast.success(entity ? 'Updated successfully' : 'Created successfully');
      closeDialog();
    } catch (err) {
      toast.error(err?.error?.message || 'Operation failed');
    } finally { setSubmitting(false); }
  };

  const handleDeleteConfirm = async () => {
    const { type, row } = deleteDialog;
    try {
      if (type === 'location') { await deleteLocation(row.id); await fetchLocations(); }
      else if (type === 'skill') { await deleteSkill(row.id); await fetchSkills(); }
      else if (type === 'field') { await deleteField(row.id); await fetchFields(); }
      toast.success('Deleted successfully');
    } catch (err) {
      toast.error(err?.error?.message || 'Delete failed');
    } finally { setDeleteDialog({ open: false, type: null, row: null }); }
  };

  // ── Dialog field configs ───────────────────────────────────────────────────
  const dialogConfig = {
    location: {
      title: dialog.entity ? 'Edit Location' : 'Add Location',
      fields: [
        { name: 'country', label: 'Country', type: 'text' },
        { name: 'city', label: 'City', type: 'text' },
      ],
    },
    skill: {
      title: dialog.entity ? 'Edit Skill' : 'Add Skill',
      fields: [
        { name: 'name', label: 'Skill Name', type: 'text' },
        {
          name: 'field_id', label: 'Field', type: 'select',
          options: [{ value: '', label: 'None' }, ...fields.map(f => ({ value: f.id, label: f.name }))],
        },
      ],
    },
    field: {
      title: dialog.entity ? 'Edit Field' : 'Add Field',
      fields: [{ name: 'name', label: 'Field Name', type: 'text' }],
    },
  };

  const activeCfg = dialog.type ? dialogConfig[dialog.type] : null;

  return (
    <DashboardLayout>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>Admin Dashboard</Typography>
          <Typography variant="body1" sx={{ color: '#666' }}>Platform Overview</Typography>
        </Box>

        {/* Stats */}
        {statsLoading ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
            {[1,2,3,4,5,6].map(i => <Skeleton key={i} variant="rectangular" height={120} sx={{ borderRadius: 2 }} />)}
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
            <StatCard title="Total Users" value={stats.totalUsers} icon={PeopleIcon} color="#0A66C2" />
            <StatCard title="Total Companies" value={stats.totalCompanies} icon={BusinessIcon} color="#057642" />
            <StatCard title="Total Jobs" value={stats.totalJobs} icon={WorkIcon} color="#E68523" />
            <StatCard title="Total Applications" value={stats.totalApplications} icon={DescriptionIcon} color="#7C3AED" />
            <StatCard title="New Users This Week" value={stats.newUsersThisWeek} icon={PersonAddIcon} color="#00ACC1" />
            <StatCard title="Active Jobs" value={stats.activeJobs} icon={CheckCircleIcon} color="#057642" />
          </Box>
        )}

        {/* Management Tables — side by side on md+, stacked on mobile */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <ManagementTable
              title="Locations Management"
              loading={loadingLoc}
              rows={locations}
              columns={[
                { key: 'id', label: 'ID' },
                { key: 'country', label: 'Country' },
                { key: 'city', label: 'City' },
              ]}
              onAdd={() => openAdd('location', { country: '', city: '' })}
              onEdit={row => openEdit('location', row)}
              onDelete={row => setDeleteDialog({ open: true, type: 'location', row })}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <ManagementTable
              title="Skills Management"
              loading={loadingSkills}
              rows={skills}
              columns={[
                { key: 'id', label: 'ID' },
                { key: 'name', label: 'Name' },
                { key: 'field_name', label: 'Field', render: row => row.field_name ? <Chip label={row.field_name} size="small" /> : '—' },
              ]}
              onAdd={() => openAdd('skill', { name: '', field_id: '' })}
              onEdit={row => openEdit('skill', { ...row, field_id: row.field_id || '' })}
              onDelete={row => setDeleteDialog({ open: true, type: 'skill', row })}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <ManagementTable
              title="Fields (Specializations) Management"
              loading={loadingFields}
              rows={fields}
              columns={[
                { key: 'id', label: 'ID' },
                { key: 'name', label: 'Name' },
              ]}
              onAdd={() => openAdd('field', { name: '' })}
              onEdit={row => openEdit('field', row)}
              onDelete={row => setDeleteDialog({ open: true, type: 'field', row })}
            />
          </Grid>
        </Grid>

        {/* CRUD Dialog */}
        {activeCfg && (
          <CrudDialog
            open={dialog.open}
            onClose={closeDialog}
            title={activeCfg.title}
            fields={activeCfg.fields}
            values={dialog.values}
            onChange={handleChange}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        )}

        {/* Delete Confirm */}
        <ConfirmDelete
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, type: null, row: null })}
          onConfirm={handleDeleteConfirm}
          label={deleteDialog.row?.name || deleteDialog.row?.city || 'record'}
        />
      </Container>
    </DashboardLayout>
  );
};

export default AdminDashboard;
