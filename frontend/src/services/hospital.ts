import apiClient, { ApiResponse, handleApiError } from './api';

/**
 * Hospital Service
 * Handles all hospital-related API calls
 */

export interface Hospital {
  id: string;
  name: string;
  district: string;
  type: string;
  maternity_beds: number;
  available_maternity_beds: number;
  location: {
    latitude: number;
    longitude: number;
  };
  contact_number: string;
  facilities: string[];
  // Optional alternative field names for capacity
  total_maternity_beds?: number;
  capacity?: number;
  total_beds?: number;
}

export interface HospitalFilters {
  district?: string;
  type?: string;
  latitude?: number;
  longitude?: number;
}

// Register a new hospital
export const registerHospital = async (hospitalData: {
  name: string;
  district: string;
  type: string;
  maternity_beds: number;
  location: {
    latitude: number;
    longitude: number;
  };
  contact_number: string;
  facilities?: string[];
}): Promise<Hospital> => {
  try {
    const response = await apiClient.post<ApiResponse<Hospital>>(
      '/hospitals',
      hospitalData
    );

    if (!response.data.data) {
      throw new Error('Failed to register hospital');
    }

    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Get list of hospitals with filters
export const getHospitals = async (
  filters: HospitalFilters = {}
): Promise<Hospital[]> => {
  try {
    const params = new URLSearchParams();

    if (filters.district) params.append('district', filters.district);
    if (filters.type) params.append('type', filters.type);
    if (filters.latitude != null) params.append('latitude', String(filters.latitude));
    if (filters.longitude != null) params.append('longitude', String(filters.longitude));

    const response = await apiClient.get<ApiResponse<Hospital[]>>(
      `/hospitals?${params.toString()}`
    );

    const data = response.data.data as any;
    return (Array.isArray(data) ? data : data?.hospitals) || [];
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Update hospital bed capacity
export const updateHospitalCapacity = async (
  hospitalId: string,
  capacityData: {
    available_maternity_beds: number;
  }
): Promise<Hospital> => {
  try {
    // Validate input
    if (!hospitalId) {
      throw new Error('Hospital ID is required');
    }

    if (capacityData.available_maternity_beds < 0) {
      throw new Error('Available beds cannot be negative');
    }

    const response = await apiClient.put<ApiResponse<Hospital>>(
      `/hospitals/${hospitalId}/capacity`,
      capacityData
    );

    if (!response.data.data) {
      throw new Error('Failed to update hospital capacity');
    }

    return response.data.data;
  } catch (error) {
    const errorMessage = handleApiError(error);
    console.error('Update hospital capacity error:', {
      hospitalId,
      capacityData,
      error: errorMessage,
      fullError: error
    });
    throw new Error(errorMessage);
  }
};

// Check hospital bed availability
export const getHospitalCapacity = async (): Promise<any> => {
  try {
    const response = await apiClient.get<ApiResponse<any>>(
      '/hospitals/capacity'
    );

    return response.data.data || null;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
