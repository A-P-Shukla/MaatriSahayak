import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import { Bell, Send } from 'lucide-react';
import { sendNotificationToAsha } from '../services/notification';

interface SendNotificationButtonProps {
  ashaWorkerId: string;
  ashaWorkerName: string;
  variant?: 'button' | 'icon';
}

const SendNotificationButton: React.FC<SendNotificationButtonProps> = ({
  ashaWorkerId,
  ashaWorkerName,
  variant = 'button',
}) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      setError('Title and message are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await sendNotificationToAsha({
        asha_worker_id: ashaWorkerId,
        title: title.trim(),
        message: message.trim(),
        type: 'ALERT',
      });

      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setTitle('');
        setMessage('');
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {variant === 'icon' ? (
        <Button
          size="small"
          startIcon={<Bell size={16} />}
          onClick={() => setOpen(true)}
          sx={{ textTransform: 'none' }}
        >
          Notify
        </Button>
      ) : (
        <Button
          variant="contained"
          startIcon={<Bell size={18} />}
          onClick={() => setOpen(true)}
          sx={{
            bgcolor: '#0d9488',
            '&:hover': { bgcolor: '#0f766e' },
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Send Notification
        </Button>
      )}

      <Dialog open={open} onClose={() => !loading && setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Bell size={24} color="#0d9488" />
            <Typography variant="h6" fontWeight={700}>
              Send Notification
            </Typography>
          </Box>
          <Chip
            label={ashaWorkerName}
            size="small"
            sx={{ mt: 1, bgcolor: '#E8F5EE', color: '#1B6B4A', fontWeight: 600 }}
          />
        </DialogTitle>

        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              <Typography variant="body2" fontWeight={600}>
                {error}
              </Typography>
              {error.includes('not available') && (
                <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                  The notification service is currently unavailable. Please try again later or contact support.
                </Typography>
              )}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
              <Typography variant="body2" fontWeight={600}>
                ✓ Notification sent successfully to {ashaWorkerName}!
              </Typography>
            </Alert>
          )}

          <TextField
            fullWidth
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading || success}
            sx={{ mb: 2 }}
            placeholder="e.g., Emergency Alert"
            helperText="Keep it concise and clear"
          />

          <TextField
            fullWidth
            label="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading || success}
            multiline
            rows={4}
            placeholder="Enter your message here..."
            helperText="Provide important details for the ASHA worker"
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={16} /> : <Send size={16} />}
            onClick={handleSend}
            disabled={loading || success}
            sx={{
              bgcolor: '#0d9488',
              '&:hover': { bgcolor: '#0f766e' },
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            {loading ? 'Sending...' : 'Send'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SendNotificationButton;
