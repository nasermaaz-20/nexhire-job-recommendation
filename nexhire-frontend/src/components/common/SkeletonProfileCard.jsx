import { Card, CardContent, Box, Skeleton } from '@mui/material';

const SkeletonProfileCard = () => {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
          <Skeleton variant="circular" width={80} height={80} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="60%" height={24} />
          <Skeleton variant="text" width="40%" height={20} />
        </Box>

        <Box sx={{ mt: 2 }}>
          <Skeleton variant="text" width="100%" height={20} />
          <Skeleton variant="text" width="80%" height={20} />
        </Box>

        <Box sx={{ mt: 2 }}>
          <Skeleton variant="rounded" width="100%" height={8} sx={{ borderRadius: 1 }} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default SkeletonProfileCard;
