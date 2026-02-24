import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useEmergencies } from '../hooks/useEmergencies';
import type { EmergencyStatus, SeverityLevel, EmergencyFilters } from '../types';

/**
 * Emergency Alerts page - Real-time monitoring of emergencies
 * Auto-refreshes every 10 seconds
 */
const EmergencyAlerts: React.FC = () => {
  // Filter state
  const [filters, setFilters] = useState<EmergencyFilters>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch emergencies with auto-refresh
  const { data: emergencies = [], isLoading, isError, error, refetch } = useEmergencies(filters);

  // Filter emergencies by search query (patient name)
  const filteredEmergencies = emergencies.filter((emergency) =>
    emergency.patient_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Count active emergencies
  const activeCount = emergencies.filter(
    (e) => e.status !== 'completed'
  ).length;

  // Get status color
  const getStatusColor = (status: EmergencyStatus): 'default' | 'primary' | 'warning' | 'success' | 'error' => {
    switch (status) {
      case 'initiated':
        return 'primary';
      case 'dispatched':
        return 'warning';
      case 'in_transit':
        return 'warning';
      case 'arrived':
        return 'success';
      case 'completed':
        return 'default';
      default:
        return 'default';
    }
  };

  // Get severity color
  const getSeverityColor = (severity: SeverityLevel): 'default' | 'info' | 'warning' | 'error' => {
    switch (severity) {
      case 'low':
        return 'info';
      case 'medium':
        return 'warning';
      case 'high':
        return 'warning';
      case 'critical':
        return 'error';
      default:
        return 'default';
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format response time
  const formatResponseTime = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <Box>
      {/* Page header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Emergency Alerts
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor active emergencies and review emergency history in real-time
          </Typography>
        </Box>
        <Tooltip title="Refresh data">
          <IconButton onClick={() => refetch()} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Active emergencies count */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          border: '1px solid',
          borderColor: activeCount > 0 ? 'error.main' : 'success.main',
          borderRadius: 2,
          bgcolor: activeCount > 0 ? 'error.lighter' : 'success.lighter',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight={600}>
            Active Emergencies: {activeCount}
          </Typography>
          <Chip
            label={activeCount > 0 ? `${activeCount} Active` : 'All Clear'}
            color={activeCount > 0 ? 'error' : 'success'}
            size="medium"
          />
        </Box>
      </Paper>

      {/* Filters section */}
      <Paper sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Filters
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
          {/* Search */}
          <TextField
            placeholder="Search by patient name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{ minWidth: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          {/* Status filter */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status || ''}
              label="Status"
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value as EmergencyStatus || undefined })
              }
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="initiated">Initiated</MenuItem>
              <MenuItem value="dispatched">Dispatched</MenuItem>
              <MenuItem value="in_transit">In Transit</MenuItem>
              <MenuItem value="arrived">Arrived</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>

          {/* Severity filter */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Severity</InputLabel>
            <Select
              value={filters.severity_level || ''}
              label="Severity"
              onChange={(e) =>
                setFilters({ ...filters, severity_level: e.target.value as SeverityLevel || undefined })
              }
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Emergency list */}
      <Paper sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" fontWeight={600}>
            Emergency Events ({filteredEmergencies.length})
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Auto-refreshes every 10 seconds
          </Typography>
        </Box>

        {/* Loading state */}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Error state */}
        {isError && (
          <Box sx={{ p: 3 }}>
            <Alert severity="error">
              Failed to load emergencies: {error instanceof Error ? error.message : 'Unknown error'}
            </Alert>
          </Box>
        )}

        {/* Empty state */}
        {!isLoading && !isError && filteredEmergencies.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              No emergencies found
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {searchQuery || filters.status || filters.severity_level
                ? 'Try adjusting your filters'
                : 'All systems are operating normally'}
            </Typography>
          </Box>
        )}

        {/* Emergency table */}
        {!isLoading && !isError && filteredEmergencies.length > 0 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Patient</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Event Type</TableCell>
                  <TableCell>Triggered</TableCell>
                  <TableCell>Response Time</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEmergencies.map((emergency) => (
                  <TableRow
                    key={emergency.event_id}
                    hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {emergency.patient_name}
                      </Typography>
                      {emergency.patient_village && (
                        <Typography variant="caption" color="text.secondary">
                          {emergency.patient_village}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={emergency.severity_level.toUpperCase()}
                        color={getSeverityColor(emergency.severity_level)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={emergency.status.replace('_', ' ').toUpperCase()}
                        color={getStatusColor(emergency.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{emergency.event_type}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatTimestamp(emergency.trigger_timestamp)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatResponseTime(emergency.response_time_seconds)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View details">
                        <IconButton
                          size="small"
                          onClick={() => alert(`Emergency details for ${emergency.event_id} - Full modal coming soon`)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default EmergencyAlerts;