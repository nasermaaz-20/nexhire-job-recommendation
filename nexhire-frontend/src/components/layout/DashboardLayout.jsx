import { Box } from '@mui/material';
import Navbar from './Navbar';

const DashboardLayout = ({ children }) => {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F4F2EE' }}>
      <Navbar />
      <Box
        component="main"
        sx={{
          pt: '52px',
          minHeight: 'calc(100vh - 52px)',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;
