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
    refetchInterval: 1000, // Auto-refresh every 1 second for real-time updates
    staleTime: 0, // Always consider data stale for real-time updates
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
    staleTime: 0, // Always consider data stale for real-time updates
    refetchInterval: 1000, // Auto-refresh every 1 second for real-time data
  });
};
