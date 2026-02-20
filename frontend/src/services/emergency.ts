import apiClient, { ApiResponse, handleApiError } from './api';
import type { Emergency, EmergencyFilters, EmergencyStats } from '../types';

/**
 * Emergency Service
 * Handles all emergency-related API calls
 */

// Get list of emergencies with filters
export const getEmergencies = async (
  filters: EmergencyFilters = {}
): Promise<Emergency[]> => {
  try {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.severity_level) params.append('severity_level', filters.severity_level);
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    if (filters.district) params.append('district', filters.district);
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await apiClient.get<ApiResponse<Emergency[]>>(
      `/emergencies?${params.toString()}`
    );

    return response.data.data || [];
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Get a specific emergency by ID
export const getEmergencyById = async (emergencyId: string): Promise<Emergency> => {
  try {
    const response = await apiClient.get<ApiResponse<Emergency>>(
      `/emergencies/${emergencyId}`
    );

    if (!response.data.data) {
      throw new Error('Emergency not found');
    }

    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Get emergencies for a specific pregnancy
export const getEmergenciesByPregnancyId = async (
  pregnancyId: string
): Promise<Emergency[]> => {
  try {
    const response = await apiClient.get<ApiResponse<Emergency[]>>(
      `/emergencies?pregnancy_id=${pregnancyId}`
    );

    return response.data.data || [];
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Trigger a new emergency
export const triggerEmergency = async (emergencyData: {
  pregnancy_id: string;
  event_type: string;
  severity_level: string;
  location: {
    latitude: number;
    longitude: number;
  };
  symptoms?: string;
}): Promise<Emergency> => {
  try {
    const response = await apiClient.post<ApiResponse<Emergency>>(
      '/emergency',
      emergencyData
    );

    if (!response.data.data) {
      throw new Error('Failed to trigger emergency');
    }

    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Update emergency status
export const updateEmergencyStatus = async (
  emergencyId: string,
  status: string
): Promise<Emergency> => {
  try {
    const response = await apiClient.put<ApiResponse<Emergency>>(
      `/emergencies/${emergencyId}/status`,
      { status }
    );

    if (!response.data.data) {
      throw new Error('Failed to update emergency status');
    }

    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Get emergency statistics
export const getEmergencyStats = async (): Promise<EmergencyStats> => {
  try {
    const response = await apiClient.get<ApiResponse<EmergencyStats>>(
      '/emergencies/stats'
    );

    return response.data.data || {
      active_emergencies: 0,
      completed_today: 0,
      average_response_time: 0,
      by_status: {
        initiated: 0,
        dispatched: 0,
        in_transit: 0,
        arrived: 0,
        completed: 0,
      },
      by_severity: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
      },
    };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
