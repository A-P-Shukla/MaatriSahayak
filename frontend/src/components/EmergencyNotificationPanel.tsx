import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Typography,
  Autocomplete,
  Stack,
} from '@mui/material';
import { Bell, AlertTriangle } from 'lucide-react';
import { sendNotificationToAsha } from '../services/notification';
import { useAshaWorkers } from '../hooks/useAsha';

const EmergencyNotificationPanel: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [selectedAsha, setSelectedAsha] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { data: ashaWorkers = [] } = useAshaWorkers({});

  const handleSend = async () => {
    if (!selectedAsha || !title.trim() || !message.trim()) {
      setError('Please select an ASHA worker and fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await sendNotificationToAsha({
        asha_worker_id: selectedAsha.asha_id,
        title: title.trim(),
        message: message.trim(),
        type: 'EMERGENCY',
      });

      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setTitle('');
        setMessage('');
        setSelectedAsha(null);
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  const approvedWorkers = ashaWorkers.filter(
    (w: any) => (w.verificationStatus || 'APPROVED') === 'APPROVED'
  );

  return (
    <>
      <Button
        variant="contained"
        startIcon={<Bell size={18} />}
        onClick={() => setOpen(true)}
        sx={{
          bgcolor: '#C62828',
          '&:hover': { bgcolor: '#B71C1C' },
          textTransform: 'none',
          fontWeight: 700,
          px: 3,
        }}
      >
        Send Emergency Alert
      </Button>

      <Dialog open={open} onClose={() => !loading && setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: '#FFEBEE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={24} color="#C62828" />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Emergency Alert
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Send urgent notification to ASHA worker
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Emergency alert sent successfully!
            </Alert>
          )}

          <Autocomplete
            options={approvedWorkers}
            getOptionLabel={(option: any) => `${option.name} - ${option.district}`}
            value={selectedAsha}
            onChange={(_, newValue) => setSelectedAsha(newValue)}
            disabled={loading || success}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select ASHA Worker"
                placeholder="Search by name or district..."
              />
            )}
            renderOption={(props, option: any) => (
              <li {...props}>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {option.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.village}, {option.district} • {option.assigned_patients_count} patients
                  </Typography>
                </Box>
              </li>
            )}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Alert Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading || success}
            sx={{ mb: 2 }}
            placeholder="e.g., Critical Patient Alert"
          />

          <TextField
            fullWidth
            label="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading || success}
            multiline
            rows={4}
            placeholder="Enter urgent message details..."
          />

          <Alert severity="warning" sx={{ mt: 2 }}>
            This will send a high-priority push notification to the ASHA worker's mobile app.
          </Alert>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={16} /> : <Bell size={16} />}
            onClick={handleSend}
            disabled={loading || success}
            sx={{
              bgcolor: '#C62828',
              '&:hover': { bgcolor: '#B71C1C' },
              textTransform: 'none',
              fontWeight: 700,
            }}
          >
            {loading ? 'Sending...' : 'Send Alert'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EmergencyNotificationPanel;
