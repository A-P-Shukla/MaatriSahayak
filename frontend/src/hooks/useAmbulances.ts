import { useQuery } from '@tanstack/react-query';
import { getAmbulances } from '../services/ambulance';
import { mockAmbulances } from '../data/mockAmbulances';
import type { AmbulanceFilters, Ambulance } from '../types';

// Check if we're using mock data (when API base URL is localhost:3000 or not set)
const USE_MOCK_DATA = !import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL?.includes('localhost:3000') ||
  import.meta.env.VITE_API_BASE_URL?.includes('localhost:5173');

/**
 * Hook to fetch ambulances with optional filters
 */
export const useAmbulances = (filters: AmbulanceFilters = {}) => {
  return useQuery({
    queryKey: ['ambulances', filters],
    queryFn: async (): Promise<Ambulance[]> => {
      // Use mock data in development
      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Apply filters to mock data
        let filtered = [...mockAmbulances];

        if (filters.status) {
          filtered = filtered.filter((amb) => amb.status === filters.status);
        }

        if (filters.district) {
          filtered = filtered.filter((amb) => amb.district === filters.district);
        }

        return filtered;
      }

      // Use real API in production - with error handling fallback to mock data
      try {
        return await getAmbulances(filters);
      } catch (error) {
        console.warn('Failed to fetch ambulances from API, using mock data:', error);
        // Fallback to mock data if API fails
        let filtered = [...mockAmbulances];

        if (filters.status) {
          filtered = filtered.filter((amb) => amb.status === filters.status);
        }

        if (filters.district) {
          filtered = filtered.filter((amb) => amb.district === filters.district);
        }

        return filtered;
      }
    },
    refetchInterval: 1000, // Refetch every 1 second for real-time tracking
    staleTime: 0, // Always consider data stale for real-time updates
  });
};
