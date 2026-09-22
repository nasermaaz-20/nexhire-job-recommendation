import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Box,
  Avatar,
  Typography,
  Divider,
  Button,
} from '@mui/material';

const ProfileCard = ({ user }) => {
  const navigate = useNavigate();

  return (
    <Card sx={{ borderRadius: 2, border: '1px solid #E0E0E0', overflow: 'hidden' }}>
      <Box sx={{ height: 60, background: 'linear-gradient(135deg, #0A66C2 0%, #004182 100%)' }} />
      <CardContent sx={{ textAlign: 'center', pt: 0 }}>
        <Avatar
          sx={{
            width: 80, height: 80,
            margin: '-40px auto 16px',
            border: '4px solid white',
            backgroundColor: '#0A66C2',
            fontSize: '32px', fontWeight: 600,
          }}
        >
          {user.name?.charAt(0)?.toUpperCase() || 'U'}
        </Avatar>

        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
          {user.name}
        </Typography>
        <Typography variant="body2" sx={{ color: '#666666', mb: 2 }}>
          {user.field || 'Job Seeker'}
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#0A66C2' }}>
              {user.skills_count || 0}
            </Typography>
            <Typography variant="caption" sx={{ color: '#666666' }}>
              Skills
            </Typography>
          </Box>
        </Box>

        <Button fullWidth onClick={() => navigate('/profile')} sx={{ textTransform: 'none', fontWeight: 500 }}>
          View Profile
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
