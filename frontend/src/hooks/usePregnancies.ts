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
    staleTime: 60000, // Consider data stale after 1 minute
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
    refetchInterval: 30000, // Refetch every 30 seconds
  });
  
  return query;
};
