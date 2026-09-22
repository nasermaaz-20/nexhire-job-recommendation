import { Card, CardContent, Box, Skeleton } from '@mui/material';

const SkeletonJobCard = () => {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Skeleton variant="circular" width={56} height={56} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="70%" height={28} />
            <Skeleton variant="text" width="50%" height={20} />
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Skeleton variant="text" width="40%" height={20} />
          <Skeleton variant="text" width="30%" height={20} />
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rounded" width={90} height={24} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rounded" width={70} height={24} sx={{ borderRadius: 2 }} />
        </Box>

        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Skeleton variant="rounded" width={100} height={36} />
          <Skeleton variant="rounded" width={80} height={36} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default SkeletonJobCard;
