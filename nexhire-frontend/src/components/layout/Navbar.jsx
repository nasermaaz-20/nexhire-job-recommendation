import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Box,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Divider,
} from '@mui/material';
import {
  Home as HomeIcon,
  Work as WorkIcon,
  AutoAwesome as AutoAwesomeIcon,
  Description as DescriptionIcon,
  Bookmark as BookmarkIcon,
  AddBox as AddBoxIcon,
  Business as BusinessIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { USER_ROLES } from '../../utils/constants';
import logo from '../../assets/logo/logo.png';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout, isJobSeeker, isCompany, isAdmin } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const jobSeekerNav = [
    { label: 'Home', icon: HomeIcon, path: '/dashboard' },
    { label: 'Jobs', icon: WorkIcon, path: '/jobs' },
    { label: 'Recommendations', icon: AutoAwesomeIcon, path: '/recommendations' },
    { label: 'Applications', icon: DescriptionIcon, path: '/applications' },
    { label: 'Saved', icon: BookmarkIcon, path: '/saved-jobs' },
  ];

  const companyNav = [
    { label: 'Dashboard', icon: HomeIcon, path: '/company/dashboard' },
    { label: 'Post Job', icon: AddBoxIcon, path: '/company/post-job' },
    { label: 'My Jobs', icon: WorkIcon, path: '/company/my-jobs' },
  ];

  const adminNav = [
    { label: 'Dashboard', icon: DashboardIcon, path: '/admin/dashboard' },
    { label: 'Users', icon: PeopleIcon, path: '/admin/users' },
    { label: 'Companies', icon: BusinessIcon, path: '/admin/companies' },
    { label: 'Jobs', icon: WorkIcon, path: '/admin/jobs' },
    { label: 'Analytics', icon: AnalyticsIcon, path: '/admin/analytics' },
  ];

  const getNavItems = () => {
    if (isJobSeeker) return jobSeekerNav;
    if (isCompany) return companyNav;
    if (isAdmin) return adminNav;
    return [];
  };

  const getDashboardPath = () => {
    if (isJobSeeker) return '/dashboard';
    if (isCompany) return '/company/dashboard';
    if (isAdmin) return '/admin/dashboard';
    return '/';
  };

  const navItems = getNavItems();

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: '#FFFFFF',
        boxShadow: 'none',
        borderBottom: '1px solid #E0E0E0',
        height: '52px',
        zIndex: 1100,
      }}
    >
      <Toolbar sx={{ minHeight: '52px !important', px: 2 }}>
        <Box
          sx={{
            maxWidth: 1128,
            width: '100%',
            mx: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          {/* Logo */}
          <Box
            onClick={() => navigate(getDashboardPath())}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              cursor: 'pointer',
              mr: 1,
            }}
          >
            <img src={logo} alt="NexHire" style={{ height: '32px' }} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: '#0A66C2',
                fontSize: '20px',
                display: { xs: 'none', sm: 'block' },
              }}
            >
              NexHire
            </Typography>
          </Box>

          {/* Navigation Items */}
          <Box sx={{ display: 'flex', gap: 0.5, ml: 'auto' }}>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                style={{ textDecoration: 'none' }}
              >
                {({ isActive }) => (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      px: 2,
                      py: 0.5,
                      cursor: 'pointer',
                      borderBottom: isActive ? '2px solid #0A66C2' : '2px solid transparent',
                      color: isActive ? '#191919' : '#666666',
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: '#F4F2EE',
                        color: '#191919',
                      },
                    }}
                  >
                    <item.icon sx={{ fontSize: 24 }} />
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: '12px',
                        fontWeight: isActive ? 600 : 400,
                        mt: 0.25,
                      }}
                    >
                      {item.label}
                    </Typography>
                  </Box>
                )}
              </NavLink>
            ))}
          </Box>

          {/* User Avatar */}
          <IconButton onClick={handleMenuOpen} sx={{ p: 0, ml: 1 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                backgroundColor: '#0A66C2',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
          </IconButton>

          {/* User Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 200,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {user?.name || user?.companyName || 'User'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#666666' }}>
                {user?.email}
              </Typography>
            </Box>
            <Divider />
            <MenuItem
              onClick={() => {
                handleMenuClose();
                navigate('/profile');
              }}
            >
              <SettingsIcon sx={{ mr: 1.5, fontSize: 20 }} />
              Settings
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1.5, fontSize: 20 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
