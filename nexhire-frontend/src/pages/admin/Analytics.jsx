import { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Paper, Grid, TextField, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip,
} from '@mui/material';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Loading from '../../components/common/Loading';
import { getAnalytics } from '../../api/adminApi';

const STATUS_COLORS = {
  Unreviewed: '#F59E0B',
  Reviewed:   '#0A66C2',
  Rejected:   '#EF4444',
  Accepted:   '#10B981',
};
const FIELD_COLORS = ['#0A66C2', '#00A0DC', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#EC4899', '#14B8A6'];

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => { fetchAnalytics(); }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const data = await getAnalytics({ days: dateRange });
      setAnalytics(data.data);
    } catch {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <DashboardLayout><Loading /></DashboardLayout>;
  if (!analytics) return <DashboardLayout><Container sx={{ py: 4 }}><Typography>No data available.</Typography></Container></DashboardLayout>;

  return (
    <DashboardLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight="bold">Platform Analytics</Typography>
          <TextField
            select size="small" value={dateRange}
            onChange={e => setDateRange(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="7">Last 7 days</MenuItem>
            <MenuItem value="30">Last 30 days</MenuItem>
            <MenuItem value="90">Last 90 days</MenuItem>
          </TextField>
        </Box>

        <Grid container spacing={3}>

          {/* User & Company Growth */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>User & Company Growth</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="users" stroke="#0A66C2" strokeWidth={2} name="Users" />
                  <Line type="monotone" dataKey="companies" stroke="#10B981" strokeWidth={2} name="Companies" />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Applications by Status — Pie */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Applications by Status</Typography>
              {analytics.applicationsByStatus.length === 0 ? (
                <Typography variant="body2" sx={{ color: '#999', py: 4, textAlign: 'center' }}>No application data</Typography>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={analytics.applicationsByStatus}
                        cx="50%" cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {analytics.applicationsByStatus.map((entry) => (
                          <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#8B5CF6'} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val, name) => [val, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Legend */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1, justifyContent: 'center' }}>
                    {analytics.applicationsByStatus.map(entry => (
                      <Chip
                        key={entry.name}
                        label={`${entry.name}: ${entry.value}`}
                        size="small"
                        sx={{ backgroundColor: STATUS_COLORS[entry.name] || '#8B5CF6', color: '#fff', fontWeight: 600 }}
                      />
                    ))}
                  </Box>
                </>
              )}
            </Paper>
          </Grid>

          {/* Jobs by Field */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Jobs by Field</Typography>
              {analytics.jobsByField.length === 0 ? (
                <Typography variant="body2" sx={{ color: '#999', py: 4, textAlign: 'center' }}>No data</Typography>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.jobsByField} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="field" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="count" name="Jobs">
                      {analytics.jobsByField.map((_, i) => (
                        <Cell key={i} fill={FIELD_COLORS[i % FIELD_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Paper>
          </Grid>

          {/* Top Skills in Demand */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Top Skills in Demand</Typography>
              {analytics.topSkills.length === 0 ? (
                <Typography variant="body2" sx={{ color: '#999', py: 4, textAlign: 'center' }}>No data</Typography>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.topSkills} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="skill" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="demand" fill="#10B981" name="Job Postings" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Paper>
          </Grid>

          {/* Top Companies */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Top Companies by Activity</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Company</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Jobs</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Applications</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analytics.companyEngagement.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} align="center" sx={{ color: '#999' }}>No data</TableCell>
                      </TableRow>
                    ) : analytics.companyEngagement.map((c, i) => (
                      <TableRow key={i} hover>
                        <TableCell>{c.company}</TableCell>
                        <TableCell align="right">{c.jobs}</TableCell>
                        <TableCell align="right">{c.applications}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Conversion Funnel */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Application Funnel</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.conversionFunnel}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stage" />
                  <YAxis />
                  <Tooltip formatter={(val) => [val.toLocaleString(), 'Count']} />
                  <Bar dataKey="count" name="Count">
                    {analytics.conversionFunnel.map((entry) => {
                      const color = entry.stage === 'Accepted' ? '#10B981'
                        : entry.stage === 'Rejected' ? '#EF4444'
                        : entry.stage === 'Applications' ? '#F59E0B'
                        : '#0A66C2';
                      return <Cell key={entry.stage} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

        </Grid>
      </Container>
    </DashboardLayout>
  );
};

export default Analytics;
