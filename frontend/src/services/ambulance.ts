import apiClient, { ApiResponse, handleApiError } from './api';
import type { Ambulance, AmbulanceFilters, AmbulanceRoute, AmbulanceStats, Location, Emergency } from '../types';

/**
 * Ambulance Service
 * Handles all ambulance-related API calls
 */

// Get list of ambulances with filters
export const getAmbulances = async (
  filters: AmbulanceFilters = {}
): Promise<Ambulance[]> => {
  try {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.district) params.append('district', filters.district);

    const response = await apiClient.get<ApiResponse<Ambulance[]>>(
      `/dev/ambulances?${params.toString()}`
    );

    return response.data.data || [];
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Get a specific ambulance by ID
export const getAmbulanceById = async (ambulanceId: string): Promise<Ambulance> => {
  try {
    const response = await apiClient.get<ApiResponse<Ambulance>>(
      `/dev/ambulances/${ambulanceId}/status`
    );

    if (!response.data.data) {
      throw new Error('Ambulance not found');
    }

    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Find nearest available ambulance
export const findNearestAmbulance = async (location: Location): Promise<Ambulance> => {
  try {
    const response = await apiClient.post<ApiResponse<Ambulance>>(
      '/dev/ambulances/nearest',
      { location }
    );

    if (!response.data.data) {
      throw new Error('No available ambulance found');
    }

    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Update ambulance location
export const updateAmbulanceLocation = async (
  ambulanceId: string,
  location: Location,
  additionalData?: {
    speed?: number;
    heading?: number;
    battery_level?: number;
  }
): Promise<Ambulance> => {
  try {
    const response = await apiClient.put<ApiResponse<Ambulance>>(
      `/dev/ambulances/${ambulanceId}/location`,
      {
        location,
        ...additionalData,
      }
    );

    if (!response.data.data) {
      throw new Error('Failed to update ambulance location');
    }

    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Update ambulance status
export const updateAmbulanceStatus = async (
  ambulanceId: string,
  status: string
): Promise<Ambulance> => {
  try {
    const response = await apiClient.put<ApiResponse<Ambulance>>(
      `/dev/ambulances/${ambulanceId}/location`,
      { status }
    );

    if (!response.data.data) {
      throw new Error('Failed to update ambulance status');
    }

    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Get ambulance route for an emergency
export const getAmbulanceRoute = async (
  ambulanceId: string,
  emergencyId: string
): Promise<AmbulanceRoute> => {
  try {
    const response = await apiClient.post<ApiResponse<AmbulanceRoute>>(
      `/dev/ambulances/${ambulanceId}/route`,
      { emergency_id: emergencyId }
    );

    if (!response.data.data) {
      throw new Error('Route not found');
    }

    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Get emergency history for ambulance
export const getAmbulanceEmergencies = async (ambulanceId: string): Promise<Emergency[]> => {
  try {
    const response = await apiClient.get<ApiResponse<Emergency[]>>(
      `/dev/ambulances/${ambulanceId}/emergencies`
    );

    return response.data.data || [];
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Get ambulance statistics
export const getAmbulanceStats = async (): Promise<AmbulanceStats> => {
  try {
    const response = await apiClient.get<ApiResponse<AmbulanceStats>>(
      '/dev/analytics'
    );

    return response.data.data || {
      total_ambulances: 0,
      available: 0,
      dispatched: 0,
      busy: 0,
      maintenance: 0,
      utilization_rate: 0,
    };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Register a new ambulance
export const registerAmbulance = async (ambulanceData: {
  vehicle_number: string;
  driver_name: string;
  driver_phone: string;
  district: string;
  current_location: Location;
}): Promise<Ambulance> => {
  try {
    const response = await apiClient.post<ApiResponse<Ambulance>>(
      '/dev/ambulances',
      ambulanceData
    );

    if (!response.data.data) {
      throw new Error('Failed to register ambulance');
    }

    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
