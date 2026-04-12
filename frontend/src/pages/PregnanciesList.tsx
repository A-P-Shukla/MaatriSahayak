import React, { useState } from 'react';
import {
  Box, Typography, Paper, Button, MenuItem, Select, FormControl, InputLabel,
  CircularProgress, Alert, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, Chip, IconButton, Tooltip,
  Card, CardContent, Stack, useTheme, useMediaQuery, Grid,
} from '@mui/material';
import { Plus, Eye, RefreshCw, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePregnancies } from '../hooks/usePregnancies';
import FilterBar from '../components/FilterBar';
import SearchInput from '../components/SearchInput';
import RegisterPregnancyModal from '../components/RegisterPregnancyModal';
import AssignAshaModal from '../components/AssignAshaModal';
import type { RiskCategory, PregnancyFilters, Pregnancy } from '../types';

const DRAWER_WIDTH = 270;

const PregnanciesList: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [filters, setFilters] = useState<PregnancyFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedPregnancy, setSelectedPregnancy] = useState<Pregnancy | null>(null);

  const { data: pregnanciesData, isLoading, isError, error } = usePregnancies(filters);
  const pregnancies = pregnanciesData?.items || [];

  const filteredPregnancies = pregnancies.filter((p: Pregnancy) =>
    p.patient_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedPregnancies = filteredPregnancies.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getRiskColor = (risk: RiskCategory): 'success' | 'warning' | 'error' => {
    if (risk === 'low') return 'success';
    if (risk === 'medium') return 'warning';
    return 'error';
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <Box sx={{
      position: 'absolute',
      top: { xs: 56, md: 64 },
      left: { xs: 0, md: DRAWER_WIDTH },
      right: 0,
      bottom: 0,
      bgcolor: '#f5f7fa',
      overflow: 'auto'
    }}>
      {/* Header Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
          pt: 4,
          pb: 4,
          px: 3,
        }}
      >
        <Box maxWidth={1400} mx="auto">
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box>
              <Typography variant="h4" fontWeight={700} color="white" mb={0.5}>
                Registered Pregnancies
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                Browse and manage all registered pregnancies
              </Typography>
            </Box>
            <Stack direction="row" spacing={1.5}>
              <Button
                variant="contained"
                startIcon={<RefreshCw size={18} />}
                onClick={() => window.location.reload()}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                }}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<Plus size={18} />}
                onClick={() => setRegisterModalOpen(true)}
                sx={{
                  bgcolor: 'white',
                  color: '#0d9488',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  '&:hover': { bgcolor: '#f0fdfa' },
                }}
              >
                {isMobile ? 'Register' : 'Register New'}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Box>

      {/* Main Content */}
      <Box maxWidth={1400} mx="auto" px={3} sx={{ mt: 3, pb: 4 }}>
        {/* Filters */}
        <Box sx={{ mb: 3 }}>
          <FilterBar onClear={() => { setFilters({}); setSearchQuery(''); setPage(0); }}>
            <SearchInput
              value={searchQuery}
              onChange={(v) => { setSearchQuery(v); setPage(0); }}
              placeholder="Search patient..."
              fullWidth={isMobile}
            />
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel>Risk Level</InputLabel>
              <Select
                value={filters.risk_category || ''}
                label="Risk Level"
                onChange={(e) => { setFilters({ ...filters, risk_category: e.target.value as RiskCategory || undefined }); setPage(0); }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel>District</InputLabel>
              <Select
                value={filters.district || ''}
                label="District"
                onChange={(e) => { setFilters({ ...filters, district: e.target.value || undefined }); setPage(0); }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Lucknow">Lucknow</MenuItem>
                <MenuItem value="Kanpur">Kanpur</MenuItem>
                <MenuItem value="Varanasi">Varanasi</MenuItem>
                <MenuItem value="Agra">Agra</MenuItem>
              </Select>
            </FormControl>
          </FilterBar>
        </Box>

        {/* Content */}
        <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #e5e7eb', bgcolor: 'white' }}>
          <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={600}>
              Pregnancy Registry
            </Typography>
            <Chip label={`${filteredPregnancies.length} records`} size="small" color="primary" variant="outlined" />
          </Box>

          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
              <CircularProgress />
            </Box>
          )}

          {isError && (
            <Box sx={{ p: 3 }}>
              <Alert severity="error">
                {error instanceof Error ? error.message : 'Failed to load pregnancies'}
              </Alert>
            </Box>
          )}

          {!isLoading && !isError && filteredPregnancies.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="body1" color="text.secondary">No pregnancies found</Typography>
              <Typography variant="caption" color="text.secondary">
                {searchQuery || filters.risk_category ? 'Try adjusting your filters' : 'No pregnancies registered yet'}
              </Typography>
            </Box>
          )}

          {/* Mobile: Cards */}
          {!isLoading && !isError && paginatedPregnancies.length > 0 && isMobile && (
            <Box sx={{ p: 2 }}>
              <Grid container spacing={2}>
                {paginatedPregnancies.map((p: Pregnancy) => (
                  <Grid item xs={12} key={p.pregnancy_id}>
                    <Card
                      variant="outlined"
                      sx={{ cursor: 'pointer', '&:hover': { borderColor: 'primary.main', boxShadow: 2 }, transition: 'all 0.2s' }}
                      onClick={() => navigate(`/pregnancies/${p.pregnancy_id}`)}
                    >
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="subtitle1" fontWeight={600}>{p.patient_name}</Typography>
                          <Chip label={p.risk_category.toUpperCase()} color={getRiskColor(p.risk_category)} size="small" />
                        </Box>
                        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                          <Typography variant="caption" color="text.secondary">Age: <b>{p.age}</b></Typography>
                          <Typography variant="caption" color="text.secondary">EDD: <b>{formatDate(p.edd)}</b></Typography>
                          <Typography variant="caption" color="text.secondary">Risk: <b>{p.risk_score}/100</b></Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                          {p.village}, {p.district}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Desktop: Table */}
          {!isLoading && !isError && paginatedPregnancies.length > 0 && !isMobile && (
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Patient Name</TableCell>
                    <TableCell>Age</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>ASHA Worker</TableCell>
                    <TableCell>Risk Level</TableCell>
                    <TableCell>Risk Score</TableCell>
                    <TableCell>Expected Delivery</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedPregnancies.map((p: Pregnancy) => (
                    <TableRow
                      key={p.pregnancy_id}
                      hover
                      sx={{ cursor: 'pointer', '&:last-child td': { border: 0 } }}
                      onClick={() => navigate(`/pregnancies/${p.pregnancy_id}`)}
                    >
                      <TableCell><Typography variant="body2" fontWeight={500}>{p.patient_name}</Typography></TableCell>
                      <TableCell><Typography variant="body2">{p.age}</Typography></TableCell>
                      <TableCell>
                        <Typography variant="body2">{p.village}</Typography>
                        <Typography variant="caption" color="text.secondary">{p.district}</Typography>
                      </TableCell>
                      <TableCell>
                        {p.asha_worker_id ? (
                          <Chip label="Assigned" color="success" size="small" variant="outlined" />
                        ) : (
                          <Chip label="Unassigned" color="warning" size="small" variant="outlined" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip label={p.risk_category.toUpperCase()} color={getRiskColor(p.risk_category)} size="small" />
                      </TableCell>
                      <TableCell><Typography variant="body2" fontWeight={500}>{p.risk_score}/100</Typography></TableCell>
                      <TableCell><Typography variant="body2">{formatDate(p.edd)}</Typography></TableCell>
                      <TableCell>
                        <Chip label={p.current_status} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <Tooltip title="View details">
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/pregnancies/${p.pregnancy_id}`); }}>
                              <Eye size={16} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Assign ASHA Worker">
                            <IconButton 
                              size="small" 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                setSelectedPregnancy(p);
                                setAssignModalOpen(true);
                              }}
                              color={p.asha_worker_id ? 'success' : 'default'}
                            >
                              <UserPlus size={16} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {!isLoading && !isError && filteredPregnancies.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[10, 20, 50]}
              component="div"
              count={filteredPregnancies.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            />
          )}
        </Paper>
      </Box>

      <RegisterPregnancyModal open={registerModalOpen} onClose={() => setRegisterModalOpen(false)} />
      <AssignAshaModal 
        open={assignModalOpen} 
        onClose={() => {
          setAssignModalOpen(false);
          setSelectedPregnancy(null);
        }} 
        pregnancy={selectedPregnancy}
      />
    </Box>
  );
};

export default PregnanciesList;
