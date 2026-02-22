import { render, screen } from '@testing-library/react';
import Loading from './Loading';
import { describe, it, expect } from 'vitest';

describe('Loading Component', () => {
  it('should render with default message', () => {
    render(<Loading />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render with custom message', () => {
    const customMessage = 'Fetching data...';
    render(<Loading message={customMessage} />);
    
    expect(screen.getByText(customMessage)).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render full screen variant', () => {
    render(<Loading fullScreen />);
    
    const loadingContainer = screen.getByText('Loading...').closest('div');
    expect(loadingContainer).toHaveStyle({
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
    });
  });

  it('should render inline variant (default)', () => {
    render(<Loading fullScreen={false} />);
    
    const loadingContainer = screen.getByText('Loading...').closest('div');
    expect(loadingContainer).not.toHaveStyle({
      position: 'fixed',
    });
  });

  it('should have accessible progress indicator', () => {
    render(<Loading />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    // CircularProgress has role="progressbar" which is sufficient for accessibility
    expect(progressBar).toHaveAttribute('role', 'progressbar');
  });

  it('should match snapshot with default props', () => {
    const { container } = render(<Loading />);
    expect(container).toMatchSnapshot();
  });

  it('should match snapshot with full screen', () => {
    const { container } = render(<Loading fullScreen message="Please wait..." />);
    expect(container).toMatchSnapshot();
  });
});