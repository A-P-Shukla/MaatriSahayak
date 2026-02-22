import { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary component for catching and displaying React errors gracefully
 * 
 * @param children - Child components to wrap with error boundary
 * @param fallback - Optional custom fallback UI
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console (in production, this would go to a monitoring service like Sentry)
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            p: 3,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 4,
              maxWidth: '500px',
              width: '100%',
              textAlign: 'center',
              border: '1px solid',
              borderColor: 'error.light',
              borderRadius: 2,
              backgroundColor: 'error.50',
            }}
          >
            <ErrorIcon
              sx={{
                fontSize: 64,
                color: 'error.main',
                mb: 2,
              }}
            />
            
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                fontWeight: 600,
                color: 'error.main',
                mb: 1,
              }}
            >
              Something went wrong
            </Typography>
            
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                mb: 3,
              }}
            >
              We encountered an unexpected error. Please try reloading the page.
            </Typography>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  backgroundColor: 'grey.100',
                  borderRadius: 1,
                  textAlign: 'left',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  overflow: 'auto',
                  maxHeight: '200px',
                  mb: 3,
                }}
              >
                <Typography variant="caption" color="error.main">
                  Error: {this.state.error.toString()}
                </Typography>
                {this.state.errorInfo && (
                  <Typography variant="caption" color="text.secondary" component="div">
                    <div style={{ marginTop: '8px' }}>
                      Component Stack:
                    </div>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </Typography>
                )}
              </Box>
            )}

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
                onClick={this.handleReload}
                sx={{
                  minWidth: '120px',
                }}
              >
                Reload Page
              </Button>
              
              <Button
                variant="outlined"
                color="primary"
                onClick={this.handleGoHome}
                sx={{
                  minWidth: '120px',
                }}
              >
                Go to Dashboard
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;