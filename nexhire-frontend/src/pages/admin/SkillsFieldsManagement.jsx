import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { toast } from 'react-toastify';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Loading from '../../components/common/Loading';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  getFields,
  createField,
  updateField,
  deleteField,
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation,
} from '../../api/adminApi';

const SkillsFieldsManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Skills
  const [skills, setSkills] = useState([]);
  const [skillDialog, setSkillDialog] = useState({ open: false, mode: 'add', data: null });
  const [skillName, setSkillName] = useState('');
  
  // Fields
  const [fields, setFields] = useState([]);
  const [fieldDialog, setFieldDialog] = useState({ open: false, mode: 'add', data: null });
  const [fieldName, setFieldName] = useState('');
  
  // Locations
  const [locations, setLocations] = useState([]);
  const [locationDialog, setLocationDialog] = useState({ open: false, mode: 'add', data: null });
  const [locationData, setLocationData] = useState({ city: '', country: '' });
  
  // Delete confirmation
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: '', id: null });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 0) {
        const data = await getSkills();
        setSkills(data.data || []);
      } else if (activeTab === 1) {
        const data = await getFields();
        setFields(data.data || []);
      } else {
        const data = await getLocations();
        setLocations(data.data || []);
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Skills handlers
  const handleSkillSubmit = async () => {
    if (!skillName.trim()) return;
    try {
      if (skillDialog.mode === 'add') {
        await createSkill(skillName);
        toast.success('Skill created');
      } else {
        await updateSkill(skillDialog.data.id, skillName);
        toast.success('Skill updated');
      }
      setSkillDialog({ open: false, mode: 'add', data: null });
      setSkillName('');
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Operation failed');
    }
  };

  const handleSkillDelete = async () => {
    try {
      await deleteSkill(deleteDialog.id);
      toast.success('Skill deleted');
      setDeleteDialog({ open: false, type: '', id: null });
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Delete failed');
    }
  };

  // Fields handlers
  const handleFieldSubmit = async () => {
    if (!fieldName.trim()) return;
    try {
      if (fieldDialog.mode === 'add') {
        await createField(fieldName);
        toast.success('Field created');
      } else {
        await updateField(fieldDialog.data.id, fieldName);
        toast.success('Field updated');
      }
      setFieldDialog({ open: false, mode: 'add', data: null });
      setFieldName('');
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Operation failed');
    }
  };

  const handleFieldDelete = async () => {
    try {
      await deleteField(deleteDialog.id);
      toast.success('Field deleted');
      setDeleteDialog({ open: false, type: '', id: null });
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Delete failed');
    }
  };

  // Locations handlers
  const handleLocationSubmit = async () => {
    if (!locationData.city.trim() || !locationData.country.trim()) return;
    try {
      if (locationDialog.mode === 'add') {
        await createLocation(locationData);
        toast.success('Location created');
      } else {
        await updateLocation(locationDialog.data.id, locationData);
        toast.success('Location updated');
      }
      setLocationDialog({ open: false, mode: 'add', data: null });
      setLocationData({ city: '', country: '' });
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Operation failed');
    }
  };

  const handleLocationDelete = async () => {
    try {
      await deleteLocation(deleteDialog.id);
      toast.success('Location deleted');
      setDeleteDialog({ open: false, type: '', id: null });
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Delete failed');
    }
  };

  const handleDelete = () => {
    if (deleteDialog.type === 'skill') handleSkillDelete();
    else if (deleteDialog.type === 'field') handleFieldDelete();
    else handleLocationDelete();
  };

  if (loading) return <Loading />;

  return (
    <DashboardLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight="bold">
            Skills & Fields Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              if (activeTab === 0) {
                setSkillDialog({ open: true, mode: 'add', data: null });
                setSkillName('');
              } else if (activeTab === 1) {
                setFieldDialog({ open: true, mode: 'add', data: null });
                setFieldName('');
              } else {
                setLocationDialog({ open: true, mode: 'add', data: null });
                setLocationData({ city: '', country: '' });
              }
            }}
          >
            Add {activeTab === 0 ? 'Skill' : activeTab === 1 ? 'Field' : 'Location'}
          </Button>
        </Box>

        <Paper sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
            <Tab label={`Skills (${skills.length})`} />
            <Tab label={`Fields (${fields.length})`} />
            <Tab label={`Locations (${locations.length})`} />
          </Tabs>
        </Paper>

        {/* Skills Table */}
        {activeTab === 0 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Skill Name</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {skills.map((skill) => (
                  <TableRow key={skill.id}>
                    <TableCell>{skill.id}</TableCell>
                    <TableCell>
                      <Chip label={skill.name} color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSkillDialog({ open: true, mode: 'edit', data: skill });
                          setSkillName(skill.name);
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteDialog({ open: true, type: 'skill', id: skill.id })}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Fields Table */}
        {activeTab === 1 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Field Name</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fields.map((field) => (
                  <TableRow key={field.id}>
                    <TableCell>{field.id}</TableCell>
                    <TableCell>
                      <Chip label={field.name} color="secondary" variant="outlined" />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setFieldDialog({ open: true, mode: 'edit', data: field });
                          setFieldName(field.name);
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteDialog({ open: true, type: 'field', id: field.id })}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Locations Table */}
        {activeTab === 2 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>City</TableCell>
                  <TableCell>Country</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {locations.map((location) => (
                  <TableRow key={location.id}>
                    <TableCell>{location.id}</TableCell>
                    <TableCell>{location.city}</TableCell>
                    <TableCell>{location.country}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setLocationDialog({ open: true, mode: 'edit', data: location });
                          setLocationData({ city: location.city, country: location.country });
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteDialog({ open: true, type: 'location', id: location.id })}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Skill Dialog */}
        <Dialog open={skillDialog.open} onClose={() => setSkillDialog({ open: false, mode: 'add', data: null })} maxWidth="sm" fullWidth>
          <DialogTitle>{skillDialog.mode === 'add' ? 'Add Skill' : 'Edit Skill'}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Skill Name"
              fullWidth
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSkillDialog({ open: false, mode: 'add', data: null })}>Cancel</Button>
            <Button onClick={handleSkillSubmit} variant="contained">
              {skillDialog.mode === 'add' ? 'Create' : 'Update'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Field Dialog */}
        <Dialog open={fieldDialog.open} onClose={() => setFieldDialog({ open: false, mode: 'add', data: null })} maxWidth="sm" fullWidth>
          <DialogTitle>{fieldDialog.mode === 'add' ? 'Add Field' : 'Edit Field'}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Field Name"
              fullWidth
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFieldDialog({ open: false, mode: 'add', data: null })}>Cancel</Button>
            <Button onClick={handleFieldSubmit} variant="contained">
              {fieldDialog.mode === 'add' ? 'Create' : 'Update'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Location Dialog */}
        <Dialog open={locationDialog.open} onClose={() => setLocationDialog({ open: false, mode: 'add', data: null })} maxWidth="sm" fullWidth>
          <DialogTitle>{locationDialog.mode === 'add' ? 'Add Location' : 'Edit Location'}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="City"
              fullWidth
              value={locationData.city}
              onChange={(e) => setLocationData({ ...locationData, city: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Country"
              fullWidth
              value={locationData.country}
              onChange={(e) => setLocationData({ ...locationData, country: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setLocationDialog({ open: false, mode: 'add', data: null })}>Cancel</Button>
            <Button onClick={handleLocationSubmit} variant="contained">
              {locationDialog.mode === 'add' ? 'Create' : 'Update'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={deleteDialog.open}
          title={`Delete ${deleteDialog.type}?`}
          message="This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setDeleteDialog({ open: false, type: '', id: null })}
          severity="error"
        />
      </Container>
    </DashboardLayout>
  );
};

export default SkillsFieldsManagement;
