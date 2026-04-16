import { useQuery } from '@tanstack/react-query';
import { getAshaWorkers, getAshaWorkerById, getAshaPregnancies, getAshaStats } from '../services/asha';
import type { AshaFilters } from '../types/asha';

/**
 * Custom hook to fetch ASHA workers with filters
 */
export const useAshaWorkers = (filters: AshaFilters = {}) => {
  return useQuery({
    queryKey: ['asha-workers', filters],
    queryFn: () => getAshaWorkers(filters),
    staleTime: 0, // Always consider data stale for real-time updates
    refetchInterval: 1000, // Auto-refresh every 1 second for real-time data
  });
};

/**
 * Custom hook to fetch a single ASHA worker by ID
 */
export const useAshaWorker = (ashaId: string) => {
  return useQuery({
    queryKey: ['asha-worker', ashaId],
    queryFn: () => getAshaWorkerById(ashaId),
    enabled: !!ashaId,
    staleTime: 0, // Always consider data stale for real-time updates
    refetchInterval: 1000, // Auto-refresh every 1 second for real-time data
  });
};

/**
 * Custom hook to fetch pregnancies for an ASHA worker
 */
export const useAshaPregnancies = (ashaId: string) => {
  return useQuery({
    queryKey: ['asha-pregnancies', ashaId],
    queryFn: () => getAshaPregnancies(ashaId),
    enabled: !!ashaId,
    staleTime: 0, // Always consider data stale for real-time updates
    refetchInterval: 1000, // Auto-refresh every 1 second for real-time data
  });
};

/**
 * Custom hook to fetch ASHA statistics
 */
export const useAshaStats = () => {
  return useQuery({
    queryKey: ['asha-stats'],
    queryFn: getAshaStats,
    staleTime: 0, // Always consider data stale for real-time updates
    refetchInterval: 1000, // Auto-refresh every 1 second for real-time data
  });
};
