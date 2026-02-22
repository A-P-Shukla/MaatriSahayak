import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';

// Mock console.error to avoid noise in test output
const originalError = console.error;
beforeAll(() => {
  console.error = vi.fn();
});

afterAll(() => {
  console.error = originalError;
});

// Test component that throws an error
const ThrowErrorComponent = () => {
  throw new Error('Test error');
};

// Test component that doesn't throw
const SafeComponent = () => <div>Safe content</div>;

// Custom fallback component for testing
const CustomFallback = () => <div>Custom fallback content</div>;

describe('ErrorBoundary Component', () => {
  it('should render children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <SafeComponent />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Safe content')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('should catch errors and display fallback UI', () => {
    render(
      <ErrorBoundary>
        <ThrowErrorComponent />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('We encountered an unexpected error. Please try reloading the page.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reload Page' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go to Dashboard' })).toBeInTheDocument();
  });

  it('should use custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<CustomFallback />}>
        <ThrowErrorComponent />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Custom fallback content')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('should show error details in development mode', () => {
    // Temporarily set NODE_ENV to development
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    render(
      <ErrorBoundary>
        <ThrowErrorComponent />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/Error: Test error/)).toBeInTheDocument();
    
    // Restore NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('should hide error details in production mode', () => {
    // Temporarily set NODE_ENV to production
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    render(
      <ErrorBoundary>
        <ThrowErrorComponent />
      </ErrorBoundary>
    );
    
    expect(screen.queryByText(/Error: Test error/)).not.toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    
    // Restore NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('should call window.location.reload when Reload button is clicked', () => {
    const mockReload = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true,
    });
    
    render(
      <ErrorBoundary>
        <ThrowErrorComponent />
      </ErrorBoundary>
    );
    
    const reloadButton = screen.getByRole('button', { name: 'Reload Page' });
    fireEvent.click(reloadButton);
    
    expect(mockReload).toHaveBeenCalledTimes(1);
  });

  it('should navigate to home when Go to Dashboard button is clicked', () => {
    const mockAssign = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { href: '', assign: mockAssign },
      writable: true,
    });
    
    render(
      <ErrorBoundary>
        <ThrowErrorComponent />
      </ErrorBoundary>
    );
    
    const homeButton = screen.getByRole('button', { name: 'Go to Dashboard' });
    fireEvent.click(homeButton);
    
    expect(window.location.href).toBe('/');
  });

  it('should match snapshot with error', () => {
    const { container } = render(
      <ErrorBoundary>
        <ThrowErrorComponent />
      </ErrorBoundary>
    );
    expect(container).toMatchSnapshot();
  });

  it('should match snapshot without error', () => {
    const { container } = render(
      <ErrorBoundary>
        <SafeComponent />
      </ErrorBoundary>
    );
    expect(container).toMatchSnapshot();
  });
});