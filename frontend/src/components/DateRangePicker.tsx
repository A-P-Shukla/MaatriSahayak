import React from 'react';
import { Box, TextField } from '@mui/material';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  size?: 'small' | 'medium';
}

/**
 * DateRangePicker component for selecting date ranges
 */
const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  size = 'small',
}) => {
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      <TextField
        type="date"
        label="Start Date"
        value={startDate}
        onChange={(e) => onStartDateChange(e.target.value)}
        size={size}
        InputLabelProps={{
          shrink: true,
        }}
        inputProps={{
          max: endDate || today,
        }}
        sx={{ minWidth: 150 }}
      />
      <Box sx={{ color: 'text.secondary' }}>to</Box>
      <TextField
        type="date"
        label="End Date"
        value={endDate}
        onChange={(e) => onEndDateChange(e.target.value)}
        size={size}
        InputLabelProps={{
          shrink: true,
        }}
        inputProps={{
          min: startDate,
          max: today,
        }}
        sx={{ minWidth: 150 }}
      />
    </Box>
  );
};

export default DateRangePicker;
