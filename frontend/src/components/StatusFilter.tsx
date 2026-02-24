import React from 'react';
import { Box, Chip, Typography } from '@mui/material';

interface StatusOption {
  value: string;
  label: string;
  color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}

interface StatusFilterProps {
  options: StatusOption[];
  selectedValue: string;
  onChange: (value: string) => void;
  label?: string;
  allowClear?: boolean;
}

/**
 * StatusFilter component using chips/buttons for status selection
 */
const StatusFilter: React.FC<StatusFilterProps> = ({
  options,
  selectedValue,
  onChange,
  label,
  allowClear = true,
}) => {
  const handleClick = (value: string) => {
    // If clicking the same value and clear is allowed, clear the filter
    if (value === selectedValue && allowClear) {
      onChange('');
    } else {
      onChange(value);
    }
  };

  return (
    <Box>
      {label && (
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
          {label}
        </Typography>
      )}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {options.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            onClick={() => handleClick(option.value)}
            color={selectedValue === option.value ? option.color || 'primary' : 'default'}
            variant={selectedValue === option.value ? 'filled' : 'outlined'}
            clickable
            sx={{
              cursor: 'pointer',
              '&:hover': {
                opacity: 0.8,
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default StatusFilter;
