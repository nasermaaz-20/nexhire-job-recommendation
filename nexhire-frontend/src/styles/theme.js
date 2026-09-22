import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#0A66C2',
    },
    secondary: {
      main: '#004182',
    },
    info: {
      main: '#00A0DC',
    },
    success: {
      main: '#057642',
    },
    warning: {
      main: '#F5C75D',
    },
    error: {
      main: '#CC1016',
    },
    background: {
      default: '#F4F2EE',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#191919',
      secondary: '#666666',
    },
    divider: '#E0E0E0',
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
    h1: {
      fontSize: '32px',
      fontWeight: 700,
    },
    h2: {
      fontSize: '24px',
      fontWeight: 600,
    },
    h3: {
      fontSize: '20px',
      fontWeight: 600,
    },
    h4: {
      fontSize: '18px',
      fontWeight: 600,
    },
    body1: {
      fontSize: '16px',
      fontWeight: 400,
    },
    body2: {
      fontSize: '14px',
      fontWeight: 400,
    },
    caption: {
      fontSize: '12px',
      fontWeight: 400,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '24px',
          textTransform: 'none',
          fontWeight: 600,
          padding: '8px 24px',
        },
        containedPrimary: {
          backgroundColor: '#0A66C2',
          '&:hover': {
            backgroundColor: '#004182',
          },
        },
        outlinedPrimary: {
          borderColor: '#0A66C2',
          color: '#0A66C2',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          boxShadow: '0 0 0 1px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.05)',
          border: '1px solid #E0E0E0',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '4px',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: '#0A66C2',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#191919',
          boxShadow: '0 0 0 1px rgba(0,0,0,0.08)',
        },
      },
    },
  },
});
