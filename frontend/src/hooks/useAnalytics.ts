/**
 * Custom hook for analytics data
 */

import { useQuery } from '@tanstack/react-query';
import { getAnalytics } from '../services/analytics';
import type { AnalyticsFilters } from '../types/analytics';

/**
 * Hook to fetch analytics data
 */
export const useAnalytics = (filters: AnalyticsFilters) => {
  return useQuery({
    queryKey: ['analytics', filters],
    queryFn: () => getAnalytics(filters),
    staleTime: 60000, // 1 minute
    gcTime: 300000, // 5 minutes
    retry: false, // Don't retry on failure - use mock data instead
  });
};
