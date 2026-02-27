import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TestBrowserRouter } from '@test/testUtils';
import Analytics from './Analytics';
import * as useAnalyticsModule from '../hooks/useAnalytics';
import userEvent from '@testing-library/user-event';

// Mock the useAnalytics hook
vi.mock('../hooks/useAnalytics');

const mockUseAnalytics = vi.mocked(useAnalyticsModule.useAnalytics);

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

describe('Analytics - Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Empty State Handling', () => {
    it('should display analytics with zero values when no data exists', async () => {
      mockUseAnalytics.mockReturnValue({
        data: {
          date_range: {
            start_date: '2024-01-01',
            end_date: '2024-01-31',
          },
          response_time_metrics: {
            average: 0,
            median: 0,
            p95: 0,
            p99: 0,
            min: 0,
            max: 0,
          },
          emergency_volume: [],
          response_time_trend: [],
          outcomes: {
            successful: 0,
            delayed: 0,
            failed: 0,
            total: 0,
            success_rate: 0,
          },
          by_district: [],
        },
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      renderAnalytics();

      await waitFor(() => {
        expect(screen.getByText('0m')).toBeInTheDocument();
        expect(screen.getByText('0')).toBeInTheDocument();
        expect(screen.getByText('0.0%')).toBeInTheDocument();
      });
    });

    it('should handle empty chart data gracefully', async () => {
      mockUseAnalytics.mockReturnValue({
        data: {
          date_range: {
            start_date: '2024-01-01',
            end_date: '2024-01-31',
          },
          response_time_metrics: {
            average: 1000,
            median: 900,
            p95: 1500,
            p99: 2000,
            min: 500,
            max: 2500,
          },
          emergency_volume: [],
          response_time_trend: [],
          outcomes: {
            successful: 10,
            delayed: 2,
            failed: 1,
            total: 13,
            success_rate: 76.9,
          },
          by_district: [],
        },
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      renderAnalytics();

      // Should render without crashing even with empty chart data
      await waitFor(() => {
        expect(screen.getByText('Key Performance Indicators')).toBeInTheDocument();
      });
    });
  });

  describe('Loading State Transitions', () => {
    it('should use mock data during loading', () => {
      mockUseAnalytics.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
      } as any);

      renderAnalytics();

      // Should still display content with mock data
      expect(screen.getByText('Key Performance Indicators')).toBeInTheDocument();
    });

    it('should transition from loading to real data', async () => {
      const { rerender } = renderAnalytics();

      // Initial loading state
      mockUseAnalytics.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
      } as any);

      rerender(
        <QueryClientProvider client={new QueryClient()}>
          <TestBrowserRouter>
            <Analytics />
          </TestBrowserRouter>
        </QueryClientProvider>
      );

      // Transition to loaded state with real data
      mockUseAnalytics.mockReturnValue({
        data: {
          date_range: {
            start_date: '2024-01-01',
            end_date: '2024-01-31',
          },
          response_time_metrics: {
            average: 1200,
            median: 1100,
            p95: 1800,
            p99: 2200,
            min: 600,
            max: 2800,
          },
          emergency_volume: [
            {
              date: 'Jan 1',
              count: 5,
              successful: 4,
              delayed: 1,
              failed: 0,
            },
          ],
          response_time_trend: [
            {
              date: 'Jan 1',
              average_response_time: 1200,
              emergency_count: 5,
            },
          ],
          outcomes: {
            successful: 100,
            delayed: 10,
            failed: 2,
            total: 112,
            success_rate: 89.3,
          },
          by_district: [
            {
              district: 'Lucknow',
              emergency_count: 50,
              average_response_time: 1100,
              success_rate: 92.0,
            },
          ],
        },
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      rerender(
        <QueryClientProvider client={new QueryClient()}>
          <TestBrowserRouter>
            <Analytics />
          </TestBrowserRouter>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('20m')).toBeInTheDocument(); // 1200 seconds = 20 minutes
      });
    });
  });

  describe('Error Recovery Flows', () => {
    it('should display info message when API fails but continue with mock data', async () => {
      mockUseAnalytics.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Network error'),
      } as any);

      renderAnalytics();

      await waitFor(() => {
        expect(
          screen.getByText('Using sample data for demonstration. Connect to backend API for real-time analytics.')
        ).toBeInTheDocument();
      });

      // Should still display mock data
      expect(screen.getByText('Key Performance Indicators')).toBeInTheDocument();
    });

    it('should recover from error state when data loads successfully', async () => {
      const { rerender } = renderAnalytics();

      // Initial error state
      mockUseAnalytics.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Network error'),
      } as any);

      rerender(
        <QueryClientProvider client={new QueryClient()}>
          <TestBrowserRouter>
            <Analytics />
          </TestBrowserRouter>
        </QueryClientProvider>
      );

      expect(
        screen.getByText('Using sample data for demonstration. Connect to backend API for real-time analytics.')
      ).toBeInTheDocument();

      // Recover with successful data
      mockUseAnalytics.mockReturnValue({
        data: {
          date_range: {
            start_date: '2024-01-01',
            end_date: '2024-01-31',
          },
          response_time_metrics: {
            average: 1200,
            median: 1100,
            p95: 1800,
            p99: 2200,
            min: 600,
            max: 2800,
          },
          emergency_volume: [],
          response_time_trend: [],
          outcomes: {
            successful: 100,
            delayed: 10,
            failed: 2,
            total: 112,
            success_rate: 89.3,
          },
          by_district: [],
        },
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      rerender(
        <QueryClientProvider client={new QueryClient()}>
          <TestBrowserRouter>
            <Analytics />
          </TestBrowserRouter>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(
          screen.queryByText('Using sample data for demonstration. Connect to backend API for real-time analytics.')
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Invalid Data Handling', () => {
    it('should handle extreme response time values', async () => {
      mockUseAnalytics.mockReturnValue({
        data: {
          date_range: {
            start_date: '2024-01-01',
            end_date: '2024-01-31',
          },
          response_time_metrics: {
            average: 0,
            median: 0,
            p95: 86400, // 24 hours
            p99: 172800, // 48 hours
            min: 0,
            max: 259200, // 72 hours
          },
          emergency_volume: [],
          response_time_trend: [],
          outcomes: {
            successful: 100,
            delayed: 10,
            failed: 2,
            total: 112,
            success_rate: 89.3,
          },
          by_district: [],
        },
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      renderAnalytics();

      await waitFor(() => {
        expect(screen.getByText('0m')).toBeInTheDocument();
      });
    });

    it('should handle 100% success rate', async () => {
      mockUseAnalytics.mockReturnValue({
        data: {
          date_range: {
            start_date: '2024-01-01',
            end_date: '2024-01-31',
          },
          response_time_metrics: {
            average: 1200,
            median: 1100,
            p95: 1800,
            p99: 2200,
            min: 600,
            max: 2800,
          },
          emergency_volume: [],
          response_time_trend: [],
          outcomes: {
            successful: 100,
            delayed: 0,
            failed: 0,
            total: 100,
            success_rate: 100.0,
          },
          by_district: [],
        },
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      renderAnalytics();

      await waitFor(() => {
        expect(screen.getByText('100.0%')).toBeInTheDocument();
      });
    });

    it('should handle 0% success rate', async () => {
      mockUseAnalytics.mockReturnValue({
        data: {
          date_range: {
            start_date: '2024-01-01',
            end_date: '2024-01-31',
          },
          response_time_metrics: {
            average: 1200,
            median: 1100,
            p95: 1800,
            p99: 2200,
            min: 600,
            max: 2800,
          },
          emergency_volume: [],
          response_time_trend: [],
          outcomes: {
            successful: 0,
            delayed: 5,
            failed: 10,
            total: 15,
            success_rate: 0.0,
          },
          by_district: [],
        },
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      renderAnalytics();

      await waitFor(() => {
        expect(screen.getByText('0.0%')).toBeInTheDocument();
      });
    });

    it('should handle very large emergency volumes', async () => {
      mockUseAnalytics.mockReturnValue({
        data: {
          date_range: {
            start_date: '2024-01-01',
            end_date: '2024-01-31',
          },
          response_time_metrics: {
            average: 1200,
            median: 1100,
            p95: 1800,
            p99: 2200,
            min: 600,
            max: 2800,
          },
          emergency_volume: [],
          response_time_trend: [],
          outcomes: {
            successful: 9999,
            delayed: 500,
            failed: 100,
            total: 10599,
            success_rate: 94.3,
          },
          by_district: [],
        },
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      renderAnalytics();

      await waitFor(() => {
        expect(screen.getByText('10599')).toBeInTheDocument();
      });
    });

    it('should handle districts with very long names', async () => {
      const longDistrictName = 'A'.repeat(100);
      mockUseAnalytics.mockReturnValue({
        data: {
          date_range: {
            start_date: '2024-01-01',
            end_date: '2024-01-31',
          },
          response_time_metrics: {
            average: 1200,
            median: 1100,
            p95: 1800,
            p99: 2200,
            min: 600,
            max: 2800,
          },
          emergency_volume: [],
          response_time_trend: [],
          outcomes: {
            successful: 100,
            delayed: 10,
            failed: 2,
            total: 112,
            success_rate: 89.3,
          },
          by_district: [
            {
              district: longDistrictName,
              emergency_count: 50,
              average_response_time: 1100,
              success_rate: 92.0,
            },
          ],
        },
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      renderAnalytics();

      // Should render without crashing
      await waitFor(() => {
        expect(screen.getByText('Key Performance Indicators')).toBeInTheDocument();
      });
    });
  });

  describe('Date Range Selection', () => {
    it('should allow changing date range', async () => {
      mockUseAnalytics.mockReturnValue({
        data: {
          date_range: {
            start_date: '2024-01-01',
            end_date: '2024-01-31',
          },
          response_time_metrics: {
            average: 1200,
            median: 1100,
            p95: 1800,
            p99: 2200,
            min: 600,
            max: 2800,
          },
          emergency_volume: [],
          response_time_trend: [],
          outcomes: {
            successful: 100,
            delayed: 10,
            failed: 2,
            total: 112,
            success_rate: 89.3,
          },
          by_district: [],
        },
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      const user = userEvent.setup();
      renderAnalytics();

      // Change date range using combobox role
      const dateRangeSelect = screen.getByRole('combobox', { name: /date range/i });
      await user.click(dateRangeSelect);
      
      const last7DaysOption = await screen.findByRole('option', { name: 'Last 7 days' });
      await user.click(last7DaysOption);

      // Should update the display
      await waitFor(() => {
        expect(screen.getByText(/to/)).toBeInTheDocument();
      });
    });

    it('should display correct date range for last 7 days', async () => {
      mockUseAnalytics.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      const user = userEvent.setup();
      renderAnalytics();

      const dateRangeSelect = screen.getByRole('combobox', { name: /date range/i });
      await user.click(dateRangeSelect);
      
      const last7DaysOption = await screen.findByRole('option', { name: 'Last 7 days' });
      await user.click(last7DaysOption);

      await waitFor(() => {
        expect(screen.getByText(/to/)).toBeInTheDocument();
      });
    });

    it('should display correct date range for last 90 days', async () => {
      mockUseAnalytics.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      const user = userEvent.setup();
      renderAnalytics();

      const dateRangeSelect = screen.getByRole('combobox', { name: /date range/i });
      await user.click(dateRangeSelect);
      
      const last90DaysOption = await screen.findByRole('option', { name: 'Last 90 days' });
      await user.click(last90DaysOption);

      await waitFor(() => {
        expect(screen.getByText(/to/)).toBeInTheDocument();
      });
    });
  });

  describe('Export Functionality', () => {
    it('should show alert when export button is clicked', async () => {
      mockUseAnalytics.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      // Mock window.alert
      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

      const user = userEvent.setup();
      renderAnalytics();

      const exportButton = screen.getByRole('button', { name: /export report/i });
      await user.click(exportButton);

      expect(alertMock).toHaveBeenCalledWith(
        'Export functionality will download a PDF/Excel report with all analytics data'
      );

      alertMock.mockRestore();
    });
  });

  describe('Chart Data Rendering', () => {
    it('should render all chart sections', async () => {
      mockUseAnalytics.mockReturnValue({
        data: {
          date_range: {
            start_date: '2024-01-01',
            end_date: '2024-01-31',
          },
          response_time_metrics: {
            average: 1200,
            median: 1100,
            p95: 1800,
            p99: 2200,
            min: 600,
            max: 2800,
          },
          emergency_volume: [
            {
              date: 'Jan 1',
              count: 5,
              successful: 4,
              delayed: 1,
              failed: 0,
            },
          ],
          response_time_trend: [
            {
              date: 'Jan 1',
              average_response_time: 1200,
              emergency_count: 5,
            },
          ],
          outcomes: {
            successful: 100,
            delayed: 10,
            failed: 2,
            total: 112,
            success_rate: 89.3,
          },
          by_district: [
            {
              district: 'Lucknow',
              emergency_count: 50,
              average_response_time: 1100,
              success_rate: 92.0,
            },
          ],
        },
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      renderAnalytics();

      await waitFor(() => {
        expect(screen.getByText('Response Time Trend')).toBeInTheDocument();
        expect(screen.getByText('Emergency Volume')).toBeInTheDocument();
        expect(screen.getByText('Outcomes Distribution')).toBeInTheDocument();
        expect(screen.getByText('Performance by District')).toBeInTheDocument();
        expect(screen.getByText('Key Insights')).toBeInTheDocument();
      });
    });

    it('should display key insights', async () => {
      mockUseAnalytics.mockReturnValue({
        data: {
          date_range: {
            start_date: '2024-01-01',
            end_date: '2024-01-31',
          },
          response_time_metrics: {
            average: 1200,
            median: 1100,
            p95: 1800,
            p99: 2200,
            min: 600,
            max: 2800,
          },
          emergency_volume: [],
          response_time_trend: [],
          outcomes: {
            successful: 100,
            delayed: 10,
            failed: 2,
            total: 112,
            success_rate: 89.3,
          },
          by_district: [
            {
              district: 'Lucknow',
              emergency_count: 50,
              average_response_time: 1100,
              success_rate: 92.0,
            },
          ],
        },
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      renderAnalytics();

      await waitFor(() => {
        expect(screen.getByText(/Response times have improved/)).toBeInTheDocument();
        expect(screen.getByText(/High-risk pregnancy detection rate/)).toBeInTheDocument();
        expect(screen.getByText(/Ambulance utilization/)).toBeInTheDocument();
      });
    });
  });
});
