import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Warning as WarningIcon,
  LocalHospital as HospitalIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { usePregnancy, useVitals } from '../hooks/usePregnancies';
import { getEmergenciesByPregnancyId } from '../services/emergency';
import type { RiskCategory } from '../types';

/**
 * Pregnancy Details page - Detailed view of a specific pregnancy
 */
const PregnancyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch pregnancy data
  const {
    data: pregnancy,
    isLoading: isLoadingPregnancy,
    isError: isErrorPregnancy,
    error: errorPregnancy,
  } = usePregnancy(id || '');

  // Fetch vitals data
  const {
    data: vitals = [],
    isLoading: isLoadingVitals,
  } = useVitals(id || '');

  // Fetch emergency history
  const {
    data: emergencies = [],
    isLoading: isLoadingEmergencies,
  } = useQuery({
    queryKey: ['emergencies', 'pregnancy', id],
    queryFn: () => getEmergenciesByPregnancyId(id || ''),
    enabled: !!id,
  });

  // Get risk category color
  const getRiskColor = (risk: RiskCategory): 'success' | 'warning' | 'error' => {
    switch (risk) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
      case 'critical':
        return 'error';
      default:
        return 'success';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format vitals data for chart
  const vitalsChartData = vitals.map((vital) => ({
    date: new Date(vital.timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    systolic: vital.bp_systolic,
    diastolic: vital.bp_diastolic,
    heartRate: vital.heart_rate,
    temperature: vital.temperature,
    weight: vital.weight || 0,
  }));

  // Calculate risk score trend (mock data for now - would come from API)
  const riskScoreTrend = vitals.map((vital, index) => ({
    date: new Date(vital.timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    riskScore: pregnancy ? pregnancy.risk_score - (vitals.length - index) * 2 : 0,
  }));

  // Loading state
  if (isLoadingPregnancy) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (isErrorPregnancy || !pregnancy) {
    return (
      <Box>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/pregnancies')} sx={{ mb: 3 }}>
          Back to List
        </Button>
        <Alert severity="error">
          Failed to load pregnancy details:{' '}
          {errorPregnancy instanceof Error ? errorPregnancy.message : 'Unknown error'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header with back button */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button startIcon={<BackIcon />} onClick={() => navigate('/pregnancies')} sx={{ mr: 2 }}>
            Back to List
          </Button>
          <Box>
            <Typography variant="h4" fontWeight={600}>
              {pregnancy.patient_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pregnancy ID: {pregnancy.pregnancy_id}
            </Typography>
          </Box>
        </Box>
        <Chip
          label={`${pregnancy.risk_category.toUpperCase()} RISK`}
          color={getRiskColor(pregnancy.risk_category)}
          size="medium"
          icon={<WarningIcon />}
        />
      </Box>

      {/* Patient Information */}
      <Paper sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Patient Information
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Age
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {pregnancy.age} years
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Blood Type
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {pregnancy.blood_type}
              </Typography>
            </Box>
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Phone
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {pregnancy.phone}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <LocationIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Location
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {pregnancy.village}, {pregnancy.district}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Expected Delivery Date
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {formatDate(pregnancy.edd)}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Risk Score
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {pregnancy.risk_score}/100
              </Typography>
            </Box>
          </Grid>
          {pregnancy.medical_history && (
            <Grid item xs={12}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Medical History
                </Typography>
                <Typography variant="body1">{pregnancy.medical_history}</Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Vitals History Chart */}
      <Paper sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Vital Signs History
        </Typography>
        <Divider sx={{ mb: 3 }} />
        {isLoadingVitals ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : vitalsChartData.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No vital signs recorded yet
            </Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={vitalsChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="systolic" stroke="#dc2626" name="BP Systolic" />
              <Line type="monotone" dataKey="diastolic" stroke="#f59e0b" name="BP Diastolic" />
              <Line type="monotone" dataKey="heartRate" stroke="#10b981" name="Heart Rate" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Paper>

      {/* Risk Score Trend */}
      <Paper sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Risk Score Trend
        </Typography>
        <Divider sx={{ mb: 3 }} />
        {riskScoreTrend.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No risk score history available
            </Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={riskScoreTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="riskScore"
                stroke="#dc2626"
                fill="#fecaca"
                name="Risk Score"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Paper>

      {/* Emergency History */}
      <Paper sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Emergency History
        </Typography>
        <Divider sx={{ mb: 3 }} />
        {isLoadingEmergencies ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : emergencies.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No emergency events recorded
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Event Type</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Response Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {emergencies.map((emergency) => (
                  <TableRow key={emergency.event_id}>
                    <TableCell>{formatDate(emergency.trigger_timestamp)}</TableCell>
                    <TableCell>{emergency.event_type}</TableCell>
                    <TableCell>
                      <Chip
                        label={emergency.severity_level.toUpperCase()}
                        size="small"
                        color={
                          emergency.severity_level === 'critical'
                            ? 'error'
                            : emergency.severity_level === 'high'
                            ? 'warning'
                            : 'default'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Chip label={emergency.status.toUpperCase()} size="small" />
                    </TableCell>
                    <TableCell>
                      {emergency.response_time_seconds
                        ? `${Math.floor(emergency.response_time_seconds / 60)}m`
                        : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="outlined" startIcon={<HospitalIcon />} onClick={() => alert('Record vitals coming soon')}>
          Record Vitals
        </Button>
        {(pregnancy.risk_category === 'high' || pregnancy.risk_category === 'critical') && (
          <Button
            variant="contained"
            color="error"
            startIcon={<WarningIcon />}
            onClick={() => alert('Trigger emergency coming soon')}
          >
            Trigger Emergency
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default PregnancyDetails;