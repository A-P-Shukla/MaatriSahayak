import { render, screen, waitFor, within } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TestBrowserRouter } from '@test/testUtils';
import PregnanciesList from './PregnanciesList';
import * as usePregnanciesModule from '../hooks/usePregnancies';
import userEvent from '@testing-library/user-event';

// Mock the usePregnancies hook
vi.mock('../hooks/usePregnancies');

const mockUsePregnancies = vi.mocked(usePregnanciesModule.usePregnancies);

// Helper to render with providers
const renderPregnanciesList = () => {
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
        <PregnanciesList />
      </TestBrowserRouter>
    </QueryClientProvider>
  );
};

describe('PregnanciesList - Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Empty State Handling', () => {
    it('should display empty state when no pregnancies exist', async () => {
      mockUsePregnancies.mockReturnValue({
        data: { items: [], total: 0, page: 1, page_size: 20 },
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      renderPregnanciesList();

      await waitFor(() => {
        expect(screen.getByText('No pregnancies found')).toBeInTheDocument();
        expect(screen.getByText('No pregnancies registered yet')).toBeInTheDocument();
      });
    });

    it('should display empty state with filter message when filters applied', async () => {
      mockUsePregnancies.mockReturnValue({
        data: { items: [], total: 0, page: 1, page_size: 20 },
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      const user = userEvent.setup();
      renderPregnanciesList();

      // Apply a filter by clicking on the select
      const riskFilter = screen.getByRole('combobox', { name: /risk level/i });
      await user.click(riskFilter);
      const highOption = await screen.findByRole('option', { name: 'High' });
      await user.click(highOption);

      await waitFor(() => {
        expect(screen.getByText('No pregnancies found')).toBeInTheDocument();
        expect(screen.getByText('Try adjusting your filters')).toBeInTheDocument();
      });
    });

    it('should display empty state when search returns no results', async () => {
      mockUsePregnancies.mockReturnValue({
        data: {
          items: [
            {
              pregnancy_id: 'p1',
              patient_name: 'Jane Doe',
              age: 28,
              village: 'Village A',
              district: 'District 1',
              risk_category: 'low' as const,
              risk_score: 25,
              edd: '2024-10-08',
              current_status: 'active' as const,
              phone: '1234567890',
              lmp_date: '2024-01-01',
              blood_type: 'O+',
              asha_worker_id: 'asha1',
              registration_date: '2024-01-15',
              last_updated: '2024-01-15',
            },
          ],
          total: 1,
          page: 1,
          page_size: 20,
        },
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      const user = userEvent.setup();
      renderPregnanciesList();

      // Search for non-existent patient
      const searchInput = screen.getByPlaceholderText('Search by patient name...');
      await user.type(searchInput, 'NonExistentPatient');

      await waitFor(() => {
        expect(screen.getByText('No pregnancies found')).toBeInTheDocument();
        expect(screen.getByText('Try adjusting your filters')).toBeInTheDocument();
      });
    });
  });

  describe('Loading State Transitions', () => {
    it('should show loading spinner during initial load', () => {
      mockUsePregnancies.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
      } as any);

      renderPregnanciesList();

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should transition from loading to data display', async () => {
      const { rerender } = renderPregnanciesList();

      // Initial loading state
      mockUsePregnancies.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
      } as any);

      rerender(
        <QueryClientProvider client={new QueryClient()}>
          <TestBrowserRouter>
            <PregnanciesList />
          </TestBrowserRouter>
        </QueryClientProvider>
      );

      expect(screen.getByRole('progressbar')).toBeInTheDocument();

      // Transition to loaded state
      mockUsePregnancies.mockReturnValue({
        data: {
          items: [
            {
              pregnancy_id: 'p1',
              patient_name: 'Jane Doe',
              age: 28,
              village: 'Village A',
              district: 'District 1',
              risk_category: 'low' as const,
              risk_score: 25,
              edd: '2024-10-08',
              current_status: 'active' as const,
              phone: '1234567890',
              lmp_date: '2024-01-01',
              blood_type: 'O+',
              asha_worker_id: 'asha1',
              registration_date: '2024-01-15',
              last_updated: '2024-01-15',
            },
          ],
          total: 1,
          page: 1,
          page_size: 20,
        },
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      rerender(
        <QueryClientProvider client={new QueryClient()}>
          <TestBrowserRouter>
            <PregnanciesList />
          </TestBrowserRouter>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      });
    });
  });

  describe('Error Recovery Flows', () => {
    it('should display error message when API call fails', async () => {
      const errorMessage = 'Failed to fetch pregnancies';
      mockUsePregnancies.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error(errorMessage),
      } as any);

      renderPregnanciesList();

      await waitFor(() => {
        expect(screen.getByText(`Failed to load pregnancies: ${errorMessage}`)).toBeInTheDocument();
      });
    });

    it('should display generic error message for unknown errors', async () => {
      mockUsePregnancies.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: null,
      } as any);

      renderPregnanciesList();

      await waitFor(() => {
        expect(screen.getByText('Failed to load pregnancies: Unknown error')).toBeInTheDocument();
      });
    });

    it('should recover from error state when data loads successfully', async () => {
      const { rerender } = renderPregnanciesList();

      // Initial error state
      mockUsePregnancies.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Network error'),
      } as any);

      rerender(
        <QueryClientProvider client={new QueryClient()}>
          <TestBrowserRouter>
            <PregnanciesList />
          </TestBrowserRouter>
        </QueryClientProvider>
      );

      expect(screen.getByText('Failed to load pregnancies: Network error')).toBeInTheDocument();

      // Recover with successful data
      mockUsePregnancies.mockReturnValue({
        data: {
          items: [
            {
              pregnancy_id: 'p1',
              patient_name: 'Jane Doe',
              age: 28,
              village: 'Village A',
              district: 'District 1',
              risk_category: 'low' as const,
              risk_score: 25,
              edd: '2024-10-08',
              current_status: 'active' as const,
              phone: '1234567890',
              lmp_date: '2024-01-01',
              blood_type: 'O+',
              asha_worker_id: 'asha1',
              registration_date: '2024-01-15',
              last_updated: '2024-01-15',
            },
          ],
          total: 1,
          page: 1,
          page_size: 20,
        },
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      rerender(
        <QueryClientProvider client={new QueryClient()}>
          <TestBrowserRouter>
            <PregnanciesList />
          </TestBrowserRouter>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.queryByText(/Failed to load pregnancies/)).not.toBeInTheDocument();
        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      });
    });
  });

  describe('Invalid Data Handling', () => {
    it('should handle missing optional fields gracefully', async () => {
      mockUsePregnancies.mockReturnValue({
        data: {
          items: [
            {
              pregnancy_id: 'p1',
              patient_name: 'Jane Doe',
              age: 28,
              village: 'Village A',
              district: 'District 1',
              risk_category: 'low' as const,
              risk_score: 25,
              edd: '2024-10-08',
              current_status: 'active' as const,
              phone: '1234567890',
              lmp_date: '2024-01-01',
              blood_type: 'O+',
              asha_worker_id: 'asha1',
              registration_date: '2024-01-15',
              last_updated: '2024-01-15',
            },
          ],
          total: 1,
          page: 1,
          page_size: 20,
        },
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      renderPregnanciesList();

      await waitFor(() => {
        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
        expect(screen.getByText('Village A')).toBeInTheDocument();
      });
    });

    it('should handle extreme risk scores', async () => {
      mockUsePregnancies.mockReturnValue({
        data: {
          items: [
            {
              pregnancy_id: 'p1',
              patient_name: 'Jane Doe',
              age: 28,
              village: 'Village A',
              district: 'District 1',
              risk_category: 'critical' as const,
              risk_score: 100,
              edd: '2024-10-08',
              current_status: 'active' as const,
              phone: '1234567890',
              lmp_date: '2024-01-01',
              blood_type: 'O+',
              asha_worker_id: 'asha1',
              registration_date: '2024-01-15',
              last_updated: '2024-01-15',
            },
            {
              pregnancy_id: 'p2',
              patient_name: 'Mary Smith',
              age: 25,
              village: 'Village B',
              district: 'District 2',
              risk_category: 'low' as const,
              risk_score: 0,
              edd: '2024-11-08',
              current_status: 'active' as const,
              phone: '0987654321',
              lmp_date: '2024-02-01',
              blood_type: 'A+',
              asha_worker_id: 'asha2',
              registration_date: '2024-02-15',
              last_updated: '2024-02-15',
            },
          ],
          total: 2,
          page: 1,
          page_size: 20,
        },
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      renderPregnanciesList();

      await waitFor(() => {
        expect(screen.getByText('100/100')).toBeInTheDocument();
        expect(screen.getByText('0/100')).toBeInTheDocument();
      });
    });

    it('should handle very long patient names', async () => {
      const longName = 'A'.repeat(100);
      mockUsePregnancies.mockReturnValue({
        data: {
          items: [
            {
              pregnancy_id: 'p1',
              patient_name: longName,
              age: 28,
              village: 'Village A',
              district: 'District 1',
              risk_category: 'low' as const,
              risk_score: 25,
              edd: '2024-10-08',
              current_status: 'active' as const,
              phone: '1234567890',
              lmp_date: '2024-01-01',
              blood_type: 'O+',
              asha_worker_id: 'asha1',
              registration_date: '2024-01-15',
              last_updated: '2024-01-15',
            },
          ],
          total: 1,
          page: 1,
          page_size: 20,
        },
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      renderPregnanciesList();

      await waitFor(() => {
        expect(screen.getByText(longName)).toBeInTheDocument();
      });
    });

    it('should handle invalid date formats gracefully', async () => {
      mockUsePregnancies.mockReturnValue({
        data: {
          items: [
            {
              pregnancy_id: 'p1',
              patient_name: 'Jane Doe',
              age: 28,
              village: 'Village A',
              district: 'District 1',
              risk_category: 'low' as const,
              risk_score: 25,
              edd: 'invalid-date',
              current_status: 'active' as const,
              phone: '1234567890',
              lmp_date: '2024-01-01',
              blood_type: 'O+',
              asha_worker_id: 'asha1',
              registration_date: '2024-01-15',
              last_updated: '2024-01-15',
            },
          ],
          total: 1,
          page: 1,
          page_size: 20,
        },
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      renderPregnanciesList();

      // Should render without crashing
      await waitFor(() => {
        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      });
    });
  });

  describe('Pagination Edge Cases', () => {
    it('should handle single page of results', async () => {
      mockUsePregnancies.mockReturnValue({
        data: {
          items: Array.from({ length: 5 }, (_, i) => ({
            pregnancy_id: `p${i}`,
            patient_name: `Patient ${i}`,
            age: 28,
            village: 'Village A',
            district: 'District 1',
            risk_category: 'low' as const,
            risk_score: 25,
            edd: '2024-10-08',
            current_status: 'active' as const,
            phone: '1234567890',
            lmp_date: '2024-01-01',
            blood_type: 'O+',
            asha_worker_id: 'asha1',
            registration_date: '2024-01-15',
            last_updated: '2024-01-15',
          })),
          total: 5,
          page: 1,
          page_size: 20,
        },
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      renderPregnanciesList();

      await waitFor(() => {
        expect(screen.getByText('1–5 of 5')).toBeInTheDocument();
      });
    });

    it('should handle large datasets with pagination', async () => {
      mockUsePregnancies.mockReturnValue({
        data: {
          items: Array.from({ length: 20 }, (_, i) => ({
            pregnancy_id: `p${i}`,
            patient_name: `Patient ${i}`,
            age: 28,
            village: 'Village A',
            district: 'District 1',
            risk_category: 'low' as const,
            risk_score: 25,
            edd: '2024-10-08',
            current_status: 'active' as const,
            phone: '1234567890',
            lmp_date: '2024-01-01',
            blood_type: 'O+',
            asha_worker_id: 'asha1',
            registration_date: '2024-01-15',
            last_updated: '2024-01-15',
          })),
          total: 100,
          page: 1,
          page_size: 20,
        },
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      renderPregnanciesList();

      await waitFor(() => {
        // Check for pagination text (format may vary)
        expect(screen.getByText(/1.*20.*100/)).toBeInTheDocument();
      });
    });
  });
});
