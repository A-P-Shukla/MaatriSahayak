import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StatusFilter from './StatusFilter';

const mockOptions = [
  { value: 'active', label: 'Active', color: 'success' as const },
  { value: 'pending', label: 'Pending', color: 'warning' as const },
  { value: 'completed', label: 'Completed', color: 'default' as const },
];

describe('StatusFilter', () => {
  it('renders all status options', () => {
    render(<StatusFilter options={mockOptions} selectedValue="" onChange={vi.fn()} />);
    
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(
      <StatusFilter
        options={mockOptions}
        selectedValue=""
        onChange={vi.fn()}
        label="Filter by Status"
      />
    );
    
    expect(screen.getByText('Filter by Status')).toBeInTheDocument();
  });

  it('highlights selected option', () => {
    const { container } = render(
      <StatusFilter options={mockOptions} selectedValue="active" onChange={vi.fn()} />
    );
    
    const activeChip = screen.getByText('Active').closest('.MuiChip-root');
    expect(activeChip).toHaveClass('MuiChip-filled');
  });

  it('calls onChange when option is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    
    render(<StatusFilter options={mockOptions} selectedValue="" onChange={onChange} />);
    
    await user.click(screen.getByText('Active'));
    
    expect(onChange).toHaveBeenCalledWith('active');
  });

  it('clears selection when clicking selected option', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    
    render(
      <StatusFilter
        options={mockOptions}
        selectedValue="active"
        onChange={onChange}
        allowClear={true}
      />
    );
    
    await user.click(screen.getByText('Active'));
    
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('does not clear when allowClear is false', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    
    render(
      <StatusFilter
        options={mockOptions}
        selectedValue="active"
        onChange={onChange}
        allowClear={false}
      />
    );
    
    await user.click(screen.getByText('Active'));
    
    expect(onChange).toHaveBeenCalledWith('active');
  });
});
