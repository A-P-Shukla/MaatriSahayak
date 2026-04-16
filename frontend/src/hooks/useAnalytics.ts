import { useQuery } from '@tanstack/react-query';
import { getCloudAnalytics, getComputedAnalytics } from '../services/analytics';
import type { AnalyticsFilters } from '../types/analytics';

export const useCloudAnalytics = () =>
  useQuery({
    queryKey: ['cloudAnalytics'],
    queryFn: getCloudAnalytics,
    staleTime: 0, // Always consider data stale for real-time updates
    refetchInterval: 1000, // Auto-refresh every 1 second for real-time data
    retry: false,
  });

export const useComputedAnalytics = (filters: AnalyticsFilters) =>
  useQuery({
    queryKey: ['computedAnalytics', filters],
    queryFn: () => getComputedAnalytics(filters),
    staleTime: 0, // Always consider data stale for real-time updates
    refetchInterval: 1000, // Auto-refresh every 1 second for real-time data
    retry: false,
  });
