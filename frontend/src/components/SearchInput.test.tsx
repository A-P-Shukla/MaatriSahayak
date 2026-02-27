import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
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
    vi.useRealTimers(); // Use real timers for this test
    const onChange = vi.fn();
    
    render(<SearchInput value="" onChange={onChange} debounceMs={100} />);
    
    const input = screen.getByRole('textbox');
    
    // Simulate typing
    const user = userEvent.setup();
    await user.type(input, 'test');
    
    // Should not call onChange immediately
    expect(onChange).not.toHaveBeenCalled();
    
    // Wait for debounce
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('test');
    }, { timeout: 500 });
    
    vi.useFakeTimers(); // Restore fake timers for other tests
  });

  it('shows clear button when value is present', () => {
    render(<SearchInput value="test" onChange={vi.fn()} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('clears value when clear button is clicked', async () => {
    const onChange = vi.fn();
    
    render(<SearchInput value="test" onChange={onChange} />);
    
    const clearButton = screen.getByRole('button');
    
    // Click the button
    act(() => {
      clearButton.click();
    });
    
    // Should call onChange immediately with empty string
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
