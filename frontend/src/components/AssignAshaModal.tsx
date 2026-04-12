import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { UserCheck } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/api';
import type { Pregnancy } from '../types';

interface AssignAshaModalProps {
  open: boolean;
  onClose: () => void;
  pregnancy: Pregnancy | null;
}

interface AshaWorker {
  asha_worker_id: string;
  name: string;
  phone: string;
  district: string;
  assigned_patients_count?: number;
}

const AssignAshaModal: React.FC<AssignAshaModalProps> = ({ open, onClose, pregnancy }) => {
  const [selectedAshaId, setSelectedAshaId] = useState<string>('');
  const [ashaWorkers, setAshaWorkers] = useState<AshaWorker[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const queryClient = useQueryClient();

  // Fetch ASHA workers for the patient's district
  useEffect(() => {
    if (open && pregnancy) {
      fetchAshaWorkers();
    }
  }, [open, pregnancy]);

  const fetchAshaWorkers = async () => {
    if (!pregnancy) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching ASHA workers for district:', pregnancy.district);
      const response = await apiClient.get(`/asha?district=${pregnancy.district}`);
      console.log('ASHA workers response:', response.data);
      
      const data = response.data.data;
      let workers = data?.workers || data?.asha_workers || data?.items || (Array.isArray(data) ? data : []);
      
      console.log('Extracted workers:', workers);
      
      // Map to ensure correct field names
      workers = workers.map((w: any) => ({
        asha_worker_id: w.asha_worker_id || w.asha_id || w.id,
        name: w.name,
        phone: w.phone,
        district: w.district,
        assigned_patients_count: w.assigned_patients_count || w.patient_count || 0,
      }));
      
      setAshaWorkers(workers);
      
      // Pre-select current ASHA if assigned
      if (pregnancy.asha_worker_id) {
        setSelectedAshaId(pregnancy.asha_worker_id);
      }
    } catch (err: any) {
      console.error('Error fetching ASHA workers:', err);
      setError(err.response?.data?.message || 'Failed to load ASHA workers');
    } finally {
      setLoading(false);
    }
  };

  const assignMutation = useMutation({
    mutationFn: async (ashaWorkerId: string) => {
      console.log('Assigning ASHA worker:', ashaWorkerId, 'to pregnancy:', pregnancy?.pregnancy_id);
      
      // Try the assignment endpoint
      try {
        const response = await apiClient.post(
          `/pregnancies/${pregnancy?.pregnancy_id}/assign-asha`,
          { asha_worker_id: ashaWorkerId }
        );
        return response.data;
      } catch (err: any) {
        console.log('Assignment endpoint failed, trying update endpoint');
        // Fallback to update endpoint
        const response = await apiClient.put(
          `/pregnancies/${pregnancy?.pregnancy_id}`,
          { asha_worker_id: ashaWorkerId }
        );
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pregnancies'] });
      queryClient.invalidateQueries({ queryKey: ['pregnancy', pregnancy?.pregnancy_id] });
      setError(null);
      onClose();
    },
    onError: (err: any) => {
      console.error('Assignment error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to assign ASHA worker';
      setError(errorMsg);
    },
  });

  const handleAssign = () => {
    if (!selectedAshaId) {
      setError('Please select an ASHA worker');
      return;
    }
    assignMutation.mutate(selectedAshaId);
  };

  const handleClose = () => {
    setSelectedAshaId('');
    setError(null);
    onClose();
  };

  if (!pregnancy) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <UserCheck size={24} color="#0d9488" />
          <Typography variant="h6" fontWeight={600}>
            Assign ASHA Worker
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        {/* Patient Info */}
        <Box sx={{ mb: 3, p: 2, bgcolor: '#f0fdfa', borderRadius: 2, border: '1px solid #99f6e4' }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Patient Information
          </Typography>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            {pregnancy.patient_name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip label={`Age: ${pregnancy.age}`} size="small" />
            <Chip label={pregnancy.district} size="small" color="primary" />
            <Chip label={pregnancy.village} size="small" variant="outlined" />
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : ashaWorkers.length === 0 ? (
          <Alert severity="warning">
            No ASHA workers found in {pregnancy.district} district. Please register ASHA workers first.
          </Alert>
        ) : (
          <>
            <FormControl fullWidth>
              <InputLabel>Select ASHA Worker</InputLabel>
              <Select
                value={selectedAshaId}
                label="Select ASHA Worker"
                onChange={(e) => setSelectedAshaId(e.target.value)}
              >
                {ashaWorkers.map((asha) => (
                  <MenuItem key={asha.asha_worker_id} value={asha.asha_worker_id}>
                    <Box sx={{ width: '100%' }}>
                      <Typography variant="body2" fontWeight={500}>
                        {asha.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {asha.phone} • {asha.district}
                        {asha.assigned_patients_count !== undefined && 
                          ` • ${asha.assigned_patients_count} patients assigned`}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {pregnancy.asha_worker_id && (
              <Alert severity="info" sx={{ mt: 2 }}>
                This patient is currently assigned to an ASHA worker. Selecting a new worker will reassign the patient.
              </Alert>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleAssign}
          variant="contained"
          disabled={!selectedAshaId || assignMutation.isPending || loading}
          sx={{ bgcolor: '#0d9488', '&:hover': { bgcolor: '#0f766e' } }}
        >
          {assignMutation.isPending ? <CircularProgress size={20} /> : 'Assign ASHA Worker'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignAshaModal;
