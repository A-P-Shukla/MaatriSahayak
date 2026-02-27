import { render, screen } from '@testing-library/react';
import {  } from 'react-router-dom';
import { TestMemoryRouter } from '@test/testUtils';
import NotFound from './NotFound';
import { describe, it, expect } from 'vitest';

describe('NotFound Component', () => {
  it('should render 404 page with correct elements', () => {
    render(
      <TestMemoryRouter>
        <NotFound />
      </TestMemoryRouter>
    );

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
    expect(screen.getByText(/The page you are looking for might have been removed/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go to Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go Back' })).toBeInTheDocument();
    expect(screen.getByText('Contact Support')).toBeInTheDocument();
  });

  it('should have accessible buttons', () => {
    render(
      <TestMemoryRouter>
        <NotFound />
      </TestMemoryRouter>
    );

    const homeButton = screen.getByRole('button', { name: 'Go to Dashboard' });
    const backButton = screen.getByRole('button', { name: 'Go Back' });

    expect(homeButton).toBeEnabled();
    expect(backButton).toBeEnabled();
  });

  it('should display support information', () => {
    render(
      <TestMemoryRouter>
        <NotFound />
      </TestMemoryRouter>
    );

    expect(screen.getByText(/If you believe this is an error/)).toBeInTheDocument();
    expect(screen.getByText('Contact Support')).toBeInTheDocument();
  });

  it('should match snapshot', () => {
    const { container } = render(
      <TestMemoryRouter>
        <NotFound />
      </TestMemoryRouter>
    );

    expect(container).toMatchSnapshot();
  });
});
