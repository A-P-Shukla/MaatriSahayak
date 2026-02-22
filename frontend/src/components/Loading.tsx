import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

/**
 * Loading component with spinner and optional message
 * 
 * @param message - Optional message to display below the spinner
 * @param fullScreen - Whether to display as full screen overlay
 */
const Loading: React.FC<LoadingProps> = ({ message = 'Loading...', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          zIndex: 9999,
        }}
      >
        <CircularProgress 
          size={60} 
          thickness={4}
          sx={{ 
            color: 'primary.main',
            mb: 2 
          }} 
        />
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ 
            fontWeight: 500,
            color: 'text.primary'
          }}
        >
          {message}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <CircularProgress 
        size={40} 
        thickness={3}
        sx={{ 
          color: 'primary.main',
          mb: 1 
        }} 
      />
      <Typography 
        variant="body2" 
        color="text.secondary"
        sx={{ 
          fontWeight: 500 
        }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default Loading;