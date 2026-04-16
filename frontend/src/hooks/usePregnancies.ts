import { useQuery } from '@tanstack/react-query';
import { getPregnancies, getPregnancyById, getVitalsByPregnancyId } from '../services/pregnancy';
import type { PregnancyFilters } from '../types';

/**
 * Custom hook to fetch paginated pregnancies with filters
 */
export const usePregnancies = (filters: PregnancyFilters = {}) => {
  return useQuery({
    queryKey: ['pregnancies', filters],
    queryFn: () => getPregnancies(filters),
    staleTime: 0, // Always consider data stale for real-time updates
    refetchInterval: 1000, // Auto-refresh every 1 second for real-time data
    gcTime: 0, // Don't cache results
    refetchOnMount: 'always', // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });
};

/**
 * Custom hook to fetch a single pregnancy by ID
 */
export const usePregnancy = (pregnancyId: string) => {
  return useQuery({
    queryKey: ['pregnancy', pregnancyId],
    queryFn: () => getPregnancyById(pregnancyId),
    enabled: !!pregnancyId, // Only fetch if pregnancyId is provided
    staleTime: 0, // Always consider data stale for real-time updates
    refetchInterval: 1000, // Auto-refresh every 1 second for real-time data
  });
};

/**
 * Custom hook to fetch vital signs for a pregnancy
 */
export const useVitals = (pregnancyId: string) => {
  const query = useQuery({
    queryKey: ['vitals', pregnancyId],
    queryFn: () => getVitalsByPregnancyId(pregnancyId),
    enabled: !!pregnancyId,
    refetchInterval: 1000, // Refetch every 1 second for real-time data
  });

  return query;
};
