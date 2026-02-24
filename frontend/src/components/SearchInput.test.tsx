import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchInput from './SearchInput';

describe('SearchInput', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders with placeholder', () => {
    render(<SearchInput value="" onChange={vi.fn()} placeholder="Search items..." />);
    expect(screen.getByPlaceholderText('Search items...')).toBeInTheDocument();
  });

  it('displays the current value', () => {
    render(<SearchInput value="test query" onChange={vi.fn()} />);
    expect(screen.getByDisplayValue('test query')).toBeInTheDocument();
  });

  it('debounces onChange callback', async () => {
    const user = userEvent.setup({ delay: null });
    const onChange = vi.fn();
    
    render(<SearchInput value="" onChange={onChange} debounceMs={300} />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'test');
    
    // Should not call onChange immediately
    expect(onChange).not.toHaveBeenCalled();
    
    // Fast-forward time
    vi.advanceTimersByTime(300);
    
    // Should call onChange after debounce
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('test');
    });
  });

  it('shows clear button when value is present', () => {
    render(<SearchInput value="test" onChange={vi.fn()} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('clears value when clear button is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    
    render(<SearchInput value="test" onChange={onChange} />);
    
    const clearButton = screen.getByRole('button');
    await user.click(clearButton);
    
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('renders with custom size', () => {
    const { container } = render(<SearchInput value="" onChange={vi.fn()} size="medium" />);
    expect(container.querySelector('.MuiInputBase-sizeSmall')).not.toBeInTheDocument();
  });

  it('renders full width when specified', () => {
    const { container } = render(<SearchInput value="" onChange={vi.fn()} fullWidth />);
    expect(container.querySelector('.MuiFormControl-fullWidth')).toBeInTheDocument();
  });
});
