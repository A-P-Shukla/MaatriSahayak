import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DateRangePicker from './DateRangePicker';

describe('DateRangePicker', () => {
  it('renders start and end date inputs', () => {
    render(
      <DateRangePicker
        startDate=""
        endDate=""
        onStartDateChange={vi.fn()}
        onEndDateChange={vi.fn()}
      />
    );
    
    expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
    expect(screen.getByLabelText('End Date')).toBeInTheDocument();
  });

  it('displays current values', () => {
    render(
      <DateRangePicker
        startDate="2024-01-01"
        endDate="2024-01-31"
        onStartDateChange={vi.fn()}
        onEndDateChange={vi.fn()}
      />
    );
    
    expect(screen.getByDisplayValue('2024-01-01')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-01-31')).toBeInTheDocument();
  });

  it('calls onStartDateChange when start date changes', async () => {
    const user = userEvent.setup();
    const onStartDateChange = vi.fn();
    
    render(
      <DateRangePicker
        startDate=""
        endDate=""
        onStartDateChange={onStartDateChange}
        onEndDateChange={vi.fn()}
      />
    );
    
    const startInput = screen.getByLabelText('Start Date');
    await user.type(startInput, '2024-01-01');
    
    expect(onStartDateChange).toHaveBeenCalled();
  });

  it('calls onEndDateChange when end date changes', async () => {
    const user = userEvent.setup();
    const onEndDateChange = vi.fn();
    
    render(
      <DateRangePicker
        startDate=""
        endDate=""
        onStartDateChange={vi.fn()}
        onEndDateChange={onEndDateChange}
      />
    );
    
    const endInput = screen.getByLabelText('End Date');
    await user.type(endInput, '2024-01-31');
    
    expect(onEndDateChange).toHaveBeenCalled();
  });

  it('renders with custom size', () => {
    const { container } = render(
      <DateRangePicker
        startDate=""
        endDate=""
        onStartDateChange={vi.fn()}
        onEndDateChange={vi.fn()}
        size="medium"
      />
    );
    
    expect(container.querySelector('.MuiInputBase-sizeSmall')).not.toBeInTheDocument();
  });
});
