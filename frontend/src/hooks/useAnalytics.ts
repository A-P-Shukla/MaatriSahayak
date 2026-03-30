import { useQuery } from '@tanstack/react-query';
import { getCloudAnalytics, getComputedAnalytics } from '../services/analytics';
import type { AnalyticsFilters } from '../types/analytics';

export const useCloudAnalytics = () =>
  useQuery({
    queryKey: ['cloudAnalytics'],
    queryFn: getCloudAnalytics,
    staleTime: 60_000,
    retry: false,
  });

export const useComputedAnalytics = (filters: AnalyticsFilters) =>
  useQuery({
    queryKey: ['computedAnalytics', filters],
    queryFn: () => getComputedAnalytics(filters),
    staleTime: 60_000,
    retry: false,
  });
