import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Alert,
  CircularProgress,
  Typography,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { registerPregnancy } from '../services/pregnancy';

interface RegisterPregnancyModalProps {
  open: boolean;
  onClose: () => void;
}

interface PregnancyFormData {
  patient_name: string;
  age: string;
  phone: string;
  district: string;
  block: string;
  village: string;
  lmp_date: string;
  edd: string;
  blood_type: string;
  gravida: string;
  parity: string;
  asha_worker_id: string;
  asha_worker_name: string;
  asha_worker_phone: string;
}

const initialFormData: PregnancyFormData = {
  patient_name: '',
  age: '',
  phone: '',
  district: '',
  block: '',
  village: '',
  lmp_date: '',
  edd: '',
  blood_type: '',
  gravida: '1',
  parity: '0',
  asha_worker_id: '',
  asha_worker_name: '',
  asha_worker_phone: '',
};

const RegisterPregnancyModal: React.FC<RegisterPregnancyModalProps> = ({ open, onClose }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<PregnancyFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<PregnancyFormData>>({});

  const mutation = useMutation({
    mutationFn: registerPregnancy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pregnancies'] });
      setFormData(initialFormData);
      setErrors({});
      onClose();
    },
  });

  const handleChange = (field: keyof PregnancyFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, [field]: event.target.value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<PregnancyFormData> = {};

    if (!formData.patient_name.trim()) newErrors.patient_name = 'Patient name is required';
    if (!formData.age || parseInt(formData.age) < 15 || parseInt(formData.age) > 50) {
      newErrors.age = 'Age must be between 15 and 50';
    }
    if (!formData.phone.match(/^\d{10}$/)) {
      newErrors.phone = 'Phone must be 10 digits';
    }
    if (!formData.district.trim()) newErrors.district = 'District is required';
    if (!formData.village.trim()) newErrors.village = 'Village is required';
    if (!formData.lmp_date) newErrors.lmp_date = 'LMP date is required';
    if (!formData.edd) newErrors.edd = 'EDD is required';
    if (!formData.blood_type) newErrors.blood_type = 'Blood type is required';
    if (!formData.asha_worker_id.trim()) newErrors.asha_worker_id = 'ASHA worker ID is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const pregnancyData = {
      patient_name: formData.patient_name.trim(),
      age: parseInt(formData.age),
      phone: formData.phone,
      district: formData.district.trim(),
      block: formData.block.trim() || undefined,
      village: formData.village.trim(),
      lmp_date: formData.lmp_date,
      edd: formData.edd,
      blood_type: formData.blood_type,
      gravida: parseInt(formData.gravida) || 1,
      parity: parseInt(formData.parity) || 0,
      asha_worker_id: formData.asha_worker_id.trim(),
      asha_worker_name: formData.asha_worker_name.trim() || undefined,
      asha_worker_phone: formData.asha_worker_phone.trim() || undefined,
    };

    mutation.mutate(pregnancyData as any);
  };

  const handleClose = () => {
    if (!mutation.isPending) {
      setFormData(initialFormData);
      setErrors({});
      mutation.reset();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Register New Pregnancy</DialogTitle>

      <DialogContent dividers>
        {mutation.isError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {mutation.error instanceof Error ? mutation.error.message : 'Failed to register pregnancy'}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Patient Information */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Patient Information
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Patient Name"
              value={formData.patient_name}
              onChange={handleChange('patient_name')}
              error={!!errors.patient_name}
              helperText={errors.patient_name}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Age"
              type="number"
              value={formData.age}
              onChange={handleChange('age')}
              error={!!errors.age}
              helperText={errors.age}
              required
              inputProps={{ min: 15, max: 50 }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone Number"
              value={formData.phone}
              onChange={handleChange('phone')}
              error={!!errors.phone}
              helperText={errors.phone}
              required
              inputProps={{ maxLength: 10 }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Blood Type"
              value={formData.blood_type}
              onChange={handleChange('blood_type')}
              error={!!errors.blood_type}
              helperText={errors.blood_type}
              required
            >
              <MenuItem value="A+">A+</MenuItem>
              <MenuItem value="A-">A-</MenuItem>
              <MenuItem value="B+">B+</MenuItem>
              <MenuItem value="B-">B-</MenuItem>
              <MenuItem value="AB+">AB+</MenuItem>
              <MenuItem value="AB-">AB-</MenuItem>
              <MenuItem value="O+">O+</MenuItem>
              <MenuItem value="O-">O-</MenuItem>
            </TextField>
          </Grid>

          {/* Location Information */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
              Location Information
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="District"
              value={formData.district}
              onChange={handleChange('district')}
              error={!!errors.district}
              helperText={errors.district}
              required
            >
              <MenuItem value="Lucknow">Lucknow</MenuItem>
              <MenuItem value="Kanpur">Kanpur</MenuItem>
              <MenuItem value="Agra">Agra</MenuItem>
              <MenuItem value="Varanasi">Varanasi</MenuItem>
              <MenuItem value="Prayagraj">Prayagraj</MenuItem>
              <MenuItem value="Gorakhpur">Gorakhpur</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Block"
              value={formData.block}
              onChange={handleChange('block')}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Village"
              value={formData.village}
              onChange={handleChange('village')}
              error={!!errors.village}
              helperText={errors.village}
              required
            />
          </Grid>

          {/* Pregnancy Information */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
              Pregnancy Information
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Menstrual Period (LMP)"
              type="date"
              value={formData.lmp_date}
              onChange={handleChange('lmp_date')}
              error={!!errors.lmp_date}
              helperText={errors.lmp_date}
              required
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Expected Delivery Date (EDD)"
              type="date"
              value={formData.edd}
              onChange={handleChange('edd')}
              error={!!errors.edd}
              helperText={errors.edd}
              required
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Gravida (Total Pregnancies)"
              type="number"
              value={formData.gravida}
              onChange={handleChange('gravida')}
              inputProps={{ min: 1 }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Parity (Previous Births)"
              type="number"
              value={formData.parity}
              onChange={handleChange('parity')}
              inputProps={{ min: 0 }}
            />
          </Grid>

          {/* ASHA Worker Information */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
              ASHA Worker Information
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="ASHA Worker ID"
              value={formData.asha_worker_id}
              onChange={handleChange('asha_worker_id')}
              error={!!errors.asha_worker_id}
              helperText={errors.asha_worker_id}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="ASHA Worker Name"
              value={formData.asha_worker_name}
              onChange={handleChange('asha_worker_name')}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="ASHA Worker Phone"
              value={formData.asha_worker_phone}
              onChange={handleChange('asha_worker_phone')}
              inputProps={{ maxLength: 10 }}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={mutation.isPending}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={mutation.isPending}
          startIcon={mutation.isPending && <CircularProgress size={20} />}
        >
          {mutation.isPending ? 'Registering...' : 'Register Pregnancy'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RegisterPregnancyModal;
