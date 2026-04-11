import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Alert, CircularProgress, Box, Typography,
  RadioGroup, FormControlLabel, Radio, FormLabel,
} from '@mui/material';
import { Wrench } from 'lucide-react';
import api from '../services/api';

interface Props {
  open: boolean;
  onClose: () => void;
  ashaId: string;
  currentEmail: string;
  phone: string;
}

const SyncUserDialog: React.FC<Props> = ({ open, onClose, ashaId, currentEmail, phone }) => {
  const [action, setAction] = useState<'create_cognito' | 'update_dynamodb'>('update_dynamodb');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSync = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const payload: any = { asha_id: ashaId, action };
      if (action === 'create_cognito') {
        if (!password || password.length < 8) {
          setError('Password must be at least 8 characters');
          setLoading(false);
          return;
        }
        payload.password = password;
      }

      const response = await api.post('/admin/sync-user', payload);
      setSuccess(response.data.message || 'User synced successfully');
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to sync user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
        <Wrench size={24} color="#0d9488" />
        Fix User Data Mismatch
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            <strong>ASHA ID:</strong> {ashaId}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            <strong>DynamoDB Email:</strong> {currentEmail}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Phone:</strong> {phone}
          </Typography>
        </Box>

        <Alert severity="warning" sx={{ mb: 3 }}>
          This user has a mismatch between DynamoDB and Cognito. Choose an action to fix it.
        </Alert>

        <FormLabel component="legend" sx={{ fontWeight: 700, mb: 1 }}>
          Fix Action
        </FormLabel>
        <RadioGroup value={action} onChange={(e) => setAction(e.target.value as any)}>
          <FormControlLabel
            value="update_dynamodb"
            control={<Radio />}
            label={
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  Update DynamoDB Email
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Find Cognito user by phone and update DynamoDB with correct email
                </Typography>
              </Box>
            }
          />
          <FormControlLabel
            value="create_cognito"
            control={<Radio />}
            label={
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  Create Cognito User
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Create new Cognito user with email from DynamoDB
                </Typography>
              </Box>
            }
          />
        </RadioGroup>

        {action === 'create_cognito' && (
          <TextField
            fullWidth
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 8 characters"
            sx={{ mt: 2 }}
            helperText="User will use this password to login"
          />
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSync}
          disabled={loading}
          sx={{
            bgcolor: '#0d9488',
            '&:hover': { bgcolor: '#0f766e' },
            textTransform: 'none',
            fontWeight: 700,
          }}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : 'Fix Now'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SyncUserDialog;
