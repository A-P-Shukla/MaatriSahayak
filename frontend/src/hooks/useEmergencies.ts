import { useQuery } from '@tanstack/react-query';
import { getEmergencies, getEmergencyById } from '../services/emergency';
import type { EmergencyFilters } from '../types';

/**
 * Custom hook to fetch emergencies with filters
 * Auto-refreshes every 10 seconds for real-time updates
 */
export const useEmergencies = (filters: EmergencyFilters = {}) => {
  return useQuery({
    queryKey: ['emergencies', filters],
    queryFn: () => getEmergencies(filters),
    refetchInterval: 10000, // Auto-refresh every 10 seconds
    staleTime: 5000, // Consider data stale after 5 seconds
  });
};

/**
 * Custom hook to fetch a single emergency by ID
 */
export const useEmergency = (emergencyId: string) => {
  return useQuery({
    queryKey: ['emergency', emergencyId],
    queryFn: () => getEmergencyById(emergencyId),
    enabled: !!emergencyId, // Only fetch if emergencyId is provided
  });
};
