import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '../services/dashboard';
import type { DashboardStats } from '../types';

/**
 * Custom hook for fetching dashboard statistics
 * Implements auto-refresh every 30 seconds
 */
export const useDashboardStats = () => {
  return useQuery<DashboardStats, Error>({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
    staleTime: 0, // Always consider data stale for real-time updates
    refetchInterval: 1000, // Auto-refresh every 1 second for real-time data
    refetchOnWindowFocus: true, // Refetch when window regains focus
    retry: 3, // Retry failed requests 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};

export default useDashboardStats;
