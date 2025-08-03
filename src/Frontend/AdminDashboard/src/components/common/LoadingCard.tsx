import React from 'react';
import {
  Card,
  CardContent,
  Skeleton,
  Box,
} from '@mui/material';

interface LoadingCardProps {
  height?: number;
  lines?: number;
}

const LoadingCard: React.FC<LoadingCardProps> = ({ height = 200, lines = 3 }) => {
  return (
    <Card sx={{ height }}>
      <CardContent>
        <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton 
            key={index} 
            variant="text" 
            width={index === lines - 1 ? "40%" : "100%"} 
            height={20} 
            sx={{ mb: 1 }} 
          />
        ))}
        <Box sx={{ mt: 2 }}>
          <Skeleton variant="rectangular" width="100%" height={40} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default LoadingCard;