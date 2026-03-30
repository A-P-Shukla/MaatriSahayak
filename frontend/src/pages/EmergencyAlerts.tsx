import React, { useState } from 'react';
import {
  Box, Typography, Paper, Chip, MenuItem, Select, FormControl, InputLabel,
  CircularProgress, Alert, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Tooltip, Card, CardContent,
  Stack, Grid, useTheme, useMediaQuery,
} from '@mui/material';
import { RefreshCw, Eye } from 'lucide-react';
import { useEmergencies } from '../hooks/useEmergencies';
import EmergencyDetailsModal from '../components/EmergencyDetailsModal';
import FilterBar from '../components/FilterBar';
import SearchInput from '../components/SearchInput';
import StatusFilter from '../components/StatusFilter';
import type { EmergencyStatus, SeverityLevel, EmergencyFilters } from '../types';

const EmergencyAlerts: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [filters, setFilters] = useState<EmergencyFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmergencyId, setSelectedEmergencyId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: emergencies = [], isLoading, isError, error, refetch } = useEmergencies(filters);

  const filteredEmergencies = emergencies.filter((e) =>
    e.patient_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = emergencies.filter((e) => e.status !== 'completed').length;

  const getStatusColor = (s: EmergencyStatus): 'default' | 'primary' | 'warning' | 'success' | 'error' => {
    if (s === 'initiated') return 'primary';
    if (s === 'dispatched' || s === 'in_transit') return 'warning';
    if (s === 'arrived') return 'success';
    if (s === 'completed') return 'default';
    return 'default';
  };

  const getSeverityColor = (s?: SeverityLevel): 'default' | 'info' | 'warning' | 'error' => {
    if (!s) return 'default';
    if (s === 'low') return 'info';
    if (s === 'medium' || s === 'high') return 'warning';
    if (s === 'critical') return 'error';
    return 'default';
  };

  const formatTimestamp = (ts: string) =>
    new Date(ts).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const formatResponseTime = (s?: number) => {
    if (!s) return 'N/A';
    return `${Math.floor(s / 60)}m ${s % 60}s`;
  };

  return (
    <Box sx={{ maxWidth: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
        mb: 3,
      }}>
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>
            Emergency Alerts
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Monitor active emergencies in real-time
          </Typography>
        </Box>
        <Tooltip title="Refresh">
          <IconButton onClick={() => refetch()} color="primary" sx={{ border: '1px solid', borderColor: 'divider' }}>
            <RefreshCw size={18} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Active count banner */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
          border: '1px solid',
          borderColor: activeCount > 0 ? 'error.main' : 'success.main',
          bgcolor: activeCount > 0 ? 'rgba(211,47,47,0.05)' : 'rgba(27,107,74,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700} color={activeCount > 0 ? 'error.main' : 'success.main'}>
            {activeCount > 0 ? `${activeCount} Active Emergency${activeCount > 1 ? 'ies' : ''}` : '✓ All Clear'}
          </Typography>
          <Typography variant="caption" color="text.secondary">Auto-refreshes every 10 seconds</Typography>
        </Box>
        <Chip
          label={activeCount > 0 ? `${activeCount} Active` : 'All Clear'}
          color={activeCount > 0 ? 'error' : 'success'}
        />
      </Paper>

      {/* Filters */}
      <FilterBar onClear={() => { setFilters({}); setSearchQuery(''); }}>
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search patient..."
          fullWidth={isMobile}
        />
        <StatusFilter
          label="Status"
          options={[
            { value: 'initiated', label: 'Initiated', color: 'primary' },
            { value: 'dispatched', label: 'Dispatched', color: 'warning' },
            { value: 'in_transit', label: 'In Transit', color: 'warning' },
            { value: 'arrived', label: 'Arrived', color: 'success' },
            { value: 'completed', label: 'Completed', color: 'default' },
          ]}
          selectedValue={filters.status || ''}
          onChange={(v) => setFilters({ ...filters, status: v as EmergencyStatus || undefined })}
        />
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Severity</InputLabel>
          <Select
            value={filters.severity_level || ''}
            label="Severity"
            onChange={(e) => setFilters({ ...filters, severity_level: e.target.value as SeverityLevel || undefined })}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="critical">Critical</MenuItem>
          </Select>
        </FormControl>
      </FilterBar>

      {/* Content */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={600}>Emergency Events</Typography>
          <Chip label={`${filteredEmergencies.length} records`} size="small" color="primary" variant="outlined" />
        </Box>

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
            <CircularProgress />
          </Box>
        )}

        {isError && (
          <Box sx={{ p: 3 }}>
            <Alert severity="error">
              {error instanceof Error ? error.message : 'Failed to load emergencies'}
            </Alert>
          </Box>
        )}

        {!isLoading && !isError && filteredEmergencies.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="body1" color="text.secondary">No emergencies found</Typography>
            <Typography variant="caption" color="text.secondary">
              {searchQuery || filters.status ? 'Try adjusting your filters' : 'All systems operating normally'}
            </Typography>
          </Box>
        )}

        {/* Mobile: Cards */}
        {!isLoading && !isError && filteredEmergencies.length > 0 && isMobile && (
          <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
              {filteredEmergencies.map((e) => (
                <Grid item xs={12} key={e.event_id}>
                  <Card
                    variant="outlined"
                    sx={{ cursor: 'pointer', '&:hover': { borderColor: 'error.main', boxShadow: 2 }, transition: 'all 0.2s' }}
                    onClick={() => { setSelectedEmergencyId(e.event_id); setModalOpen(true); }}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight={600}>{e.patient_name}</Typography>
                        <Chip label={e.severity_level?.toUpperCase() || 'N/A'} color={getSeverityColor(e.severity_level)} size="small" />
                      </Box>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                        <Chip label={e.status.replace('_', ' ').toUpperCase()} color={getStatusColor(e.status)} size="small" />
                        <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>{e.event_type}</Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {formatTimestamp(e.trigger_timestamp)} · Response: {formatResponseTime(e.response_time_seconds)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Desktop: Table */}
        {!isLoading && !isError && filteredEmergencies.length > 0 && !isMobile && (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 650 }}>
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
                {filteredEmergencies.map((e) => (
                  <TableRow key={e.event_id} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>{e.patient_name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={e.severity_level?.toUpperCase() || 'N/A'} color={getSeverityColor(e.severity_level)} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip label={e.status.replace('_', ' ').toUpperCase()} color={getStatusColor(e.status)} size="small" />
                    </TableCell>
                    <TableCell><Typography variant="body2">{e.event_type}</Typography></TableCell>
                    <TableCell><Typography variant="body2">{formatTimestamp(e.trigger_timestamp)}</Typography></TableCell>
                    <TableCell><Typography variant="body2">{formatResponseTime(e.response_time_seconds)}</Typography></TableCell>
                    <TableCell align="center">
                      <Tooltip title="View details">
                        <IconButton size="small" onClick={() => { setSelectedEmergencyId(e.event_id); setModalOpen(true); }}>
                          <Eye size={16} />
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

      <EmergencyDetailsModal
        emergencyId={selectedEmergencyId}
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedEmergencyId(null); }}
      />
    </Box>
  );
};

export default EmergencyAlerts;
