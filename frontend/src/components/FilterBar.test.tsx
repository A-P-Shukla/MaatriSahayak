import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterBar from './FilterBar';

describe('FilterBar', () => {
  it('renders with default title', () => {
    render(
      <FilterBar>
        <div>Filter content</div>
      </FilterBar>
    );
    
    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  it('renders with custom title', () => {
    render(
      <FilterBar title="Advanced Filters">
        <div>Filter content</div>
      </FilterBar>
    );
    
    expect(screen.getByText('Advanced Filters')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(
      <FilterBar>
        <div>Custom filter content</div>
      </FilterBar>
    );
    
    expect(screen.getByText('Custom filter content')).toBeInTheDocument();
  });

  it('shows clear button when onClear is provided', () => {
    render(
      <FilterBar onClear={vi.fn()}>
        <div>Filter content</div>
      </FilterBar>
    );
    
    expect(screen.getByText('Clear All')).toBeInTheDocument();
  });

  it('hides clear button when showClearButton is false', () => {
    render(
      <FilterBar onClear={vi.fn()} showClearButton={false}>
        <div>Filter content</div>
      </FilterBar>
    );
    
    expect(screen.queryByText('Clear All')).not.toBeInTheDocument();
  });

  it('calls onClear when clear button is clicked', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    
    render(
      <FilterBar onClear={onClear}>
        <div>Filter content</div>
      </FilterBar>
    );
    
    await user.click(screen.getByText('Clear All'));
    
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('does not show clear button when onClear is not provided', () => {
    render(
      <FilterBar>
        <div>Filter content</div>
      </FilterBar>
    );
    
    expect(screen.queryByText('Clear All')).not.toBeInTheDocument();
  });
});
