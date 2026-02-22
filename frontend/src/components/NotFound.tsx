import React from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { Home as HomeIcon, SearchOff as SearchOffIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

/**
 * NotFound component for 404 pages
 */
const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 200px)',
        p: 3,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          maxWidth: '600px',
          width: '100%',
          textAlign: 'center',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          backgroundColor: 'background.paper',
        }}
      >
        <SearchOffIcon
          sx={{
            fontSize: 80,
            color: 'primary.main',
            mb: 3,
            opacity: 0.8,
          }}
        />
        
        <Typography
          variant="h3"
          gutterBottom
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            mb: 2,
          }}
        >
          404
        </Typography>
        
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            mb: 2,
          }}
        >
          Page Not Found
        </Typography>
        
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            mb: 4,
            maxWidth: '400px',
            mx: 'auto',
            lineHeight: 1.6,
          }}
        >
          The page you are looking for might have been removed, had its name changed, 
          or is temporarily unavailable.
        </Typography>

        <Box
          sx={{
            display: 'flex',
            gap: 2,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Button
            variant="contained"
            color="primary"
            startIcon={<HomeIcon />}
            onClick={handleGoHome}
            sx={{
              minWidth: '160px',
              py: 1.5,
            }}
          >
            Go to Dashboard
          </Button>
          
          <Button
            variant="outlined"
            color="primary"
            onClick={handleGoBack}
            sx={{
              minWidth: '160px',
              py: 1.5,
            }}
          >
            Go Back
          </Button>
        </Box>

        <Box
          sx={{
            mt: 4,
            pt: 3,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 1,
            }}
          >
            If you believe this is an error, please contact support.
          </Typography>
          <Button
            variant="text"
            color="primary"
            size="small"
            onClick={() => navigate('/contact')}
          >
            Contact Support
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default NotFound;