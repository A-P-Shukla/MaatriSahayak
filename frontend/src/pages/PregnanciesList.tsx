import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
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
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { usePregnancies } from '../hooks/usePregnancies';
import FilterBar from '../components/FilterBar';
import SearchInput from '../components/SearchInput';
import type { RiskCategory, PregnancyFilters, Pregnancy } from '../types';

/**
 * Pregnancies List page - Browse and manage registered pregnancies
 * Displays all pregnancies with filtering, search, and pagination
 */
const PregnanciesList: React.FC = () => {
  const navigate = useNavigate();

  // Filter state
  const [filters, setFilters] = useState<PregnancyFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  // Fetch pregnancies with filters
  const { data: pregnanciesData, isLoading, isError, error } = usePregnancies(filters);
  
  // Extract pregnancies array from paginated response
  const pregnancies = pregnanciesData?.items || [];

  // Filter pregnancies by search query (patient name)
  const filteredPregnancies = pregnancies.filter((pregnancy: Pregnancy) =>
    pregnancy.patient_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Paginate results
  const paginatedPregnancies = filteredPregnancies.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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

  // Handle page change
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({});
    setSearchQuery('');
    setPage(0);
  };

  return (
    <Box>
      {/* Page header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Registered Pregnancies
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Browse and manage all registered pregnancies in the system
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => alert('Register new pregnancy coming soon')}
        >
          Register New Pregnancy
        </Button>
      </Box>

      {/* Filters section */}
      <FilterBar onClear={handleClearFilters}>
        {/* Search */}
        <SearchInput
          value={searchQuery}
          onChange={(value) => {
            setSearchQuery(value);
            setPage(0);
          }}
          placeholder="Search by patient name..."
          fullWidth={false}
        />

        {/* Risk level filter */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Risk Level</InputLabel>
          <Select
            value={filters.risk_category || ''}
            label="Risk Level"
            onChange={(e) => {
              setFilters({ ...filters, risk_category: e.target.value as RiskCategory || undefined });
              setPage(0);
            }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="critical">Critical</MenuItem>
          </Select>
        </FormControl>

        {/* District filter */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>District</InputLabel>
          <Select
            value={filters.district || ''}
            label="District"
            onChange={(e) => {
              setFilters({ ...filters, district: e.target.value || undefined });
              setPage(0);
            }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Lucknow">Lucknow</MenuItem>
            <MenuItem value="Kanpur">Kanpur</MenuItem>
            <MenuItem value="Agra">Agra</MenuItem>
            <MenuItem value="Varanasi">Varanasi</MenuItem>
          </Select>
        </FormControl>
      </FilterBar>

      {/* Pregnancies table */}
      <Paper sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" fontWeight={600}>
            Pregnancy Registry ({filteredPregnancies.length})
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
              Failed to load pregnancies: {error instanceof Error ? error.message : 'Unknown error'}
            </Alert>
          </Box>
        )}

        {/* Empty state */}
        {!isLoading && !isError && filteredPregnancies.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              No pregnancies found
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {searchQuery || filters.risk_category || filters.district
                ? 'Try adjusting your filters'
                : 'No pregnancies registered yet'}
            </Typography>
          </Box>
        )}

        {/* Pregnancies table */}
        {!isLoading && !isError && paginatedPregnancies.length > 0 && (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Patient Name</TableCell>
                    <TableCell>Age</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Risk Level</TableCell>
                    <TableCell>Risk Score</TableCell>
                    <TableCell>Expected Delivery</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedPregnancies.map((pregnancy: Pregnancy) => (
                    <TableRow
                      key={pregnancy.pregnancy_id}
                      hover
                      sx={{
                        cursor: 'pointer',
                        '&:last-child td, &:last-child th': { border: 0 },
                      }}
                      onClick={() => navigate(`/pregnancies/${pregnancy.pregnancy_id}`)}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {pregnancy.patient_name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{pregnancy.age}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{pregnancy.village}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {pregnancy.district}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={pregnancy.risk_category.toUpperCase()}
                          color={getRiskColor(pregnancy.risk_category)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {pregnancy.risk_score}/100
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(pregnancy.edd)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{pregnancy.current_status}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View details">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/pregnancies/${pregnancy.pregnancy_id}`);
                            }}
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

            {/* Pagination */}
            <TablePagination
              rowsPerPageOptions={[10, 20, 50]}
              component="div"
              count={filteredPregnancies.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>
    </Box>
  );
};

export default PregnanciesList;