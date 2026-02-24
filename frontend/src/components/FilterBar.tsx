import React from 'react';
import { Box, Paper, Typography, Button, Divider } from '@mui/material';
import { Clear as ClearIcon } from '@mui/icons-material';

interface FilterBarProps {
  title?: string;
  children: React.ReactNode;
  onClear?: () => void;
  showClearButton?: boolean;
  elevation?: number;
}

/**
 * FilterBar component - Reusable container for filters
 * Provides consistent styling and layout for filter sections
 */
const FilterBar: React.FC<FilterBarProps> = ({
  title = 'Filters',
  children,
  onClear,
  showClearButton = true,
  elevation = 0,
}) => {
  return (
    <Paper
      elevation={elevation}
      sx={{
        p: 3,
        mb: 3,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          {title}
        </Typography>
        {showClearButton && onClear && (
          <Button size="small" startIcon={<ClearIcon />} onClick={onClear}>
            Clear All
          </Button>
        )}
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Filter content */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {children}
      </Box>
    </Paper>
  );
};

export default FilterBar;
