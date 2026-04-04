import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TestBrowserRouter } from '@test/testUtils';
import Analytics from './Analytics';
import * as useAnalyticsModule from '../hooks/useAnalytics';

// Mock the useAnalytics hooks
vi.mock('../hooks/useAnalytics');

const mockUseCloudAnalytics = vi.mocked(useAnalyticsModule.useCloudAnalytics);
const mockUseComputedAnalytics = vi.mocked(useAnalyticsModule.useComputedAnalytics);

// Helper to render with providers
const renderAnalytics = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <TestBrowserRouter>
        <Analytics />
      </TestBrowserRouter>
    </QueryClientProvider>
  );
};

describe('Analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set default mock return values
    mockUseCloudAnalytics.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    mockUseComputedAnalytics.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
    } as any);
  });

  it('should render analytics page', () => {
    renderAnalytics();
    expect(screen.getByText(/Analytics/i)).toBeInTheDocument();
  });
});
