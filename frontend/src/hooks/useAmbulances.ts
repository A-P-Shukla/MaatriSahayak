import { useQuery } from '@tanstack/react-query';
import { getAmbulances } from '../services/ambulance';
import { mockAmbulances } from '../data/mockAmbulances';
import type { AmbulanceFilters, Ambulance } from '../types';

// Check if we're using mock data (when API base URL is localhost:3000)
const USE_MOCK_DATA = import.meta.env.VITE_API_BASE_URL?.includes('localhost:3000');

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
        await new Promise((resolve) => setTimeout(resolve, 500));
        
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
      
      // Use real API in production
      return getAmbulances(filters);
    },
    refetchInterval: 30000, // Refetch every 30 seconds for live tracking
    staleTime: 20000, // Consider data stale after 20 seconds
  });
};
