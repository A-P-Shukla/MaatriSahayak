import apiClient, { ApiResponse, handleApiError } from './api';
import type { AshaWorker, AshaFilters, AshaStats } from '../types/asha';

/**
 * ASHA Worker Service
 * Handles all ASHA worker-related API calls
 */

// Get list of ASHA workers with filters
export const getAshaWorkers = async (filters: AshaFilters = {}): Promise<AshaWorker[]> => {
  try {
    const params = new URLSearchParams();
    
    if (filters.district) params.append('district', filters.district);
    if (filters.village) params.append('village', filters.village);
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await apiClient.get<ApiResponse<any>>(
      `/asha?${params.toString()}`
    );

    const rawData = response.data.data;
    
    // Handle different response formats
    let workersArray: any[] = [];
    if (Array.isArray(rawData)) {
      workersArray = rawData;
    } else if (rawData && Array.isArray(rawData.workers)) {
      workersArray = rawData.workers;
    } else if (rawData && Array.isArray(rawData.items)) {
      workersArray = rawData.items;
    }

    // Map to AshaWorker type
    return workersArray.map((item: any) => ({
      asha_id: item.asha_id || item.id,
      name: item.name,
      email: item.email,
      phone: item.phone,
      district: item.district,
      village: item.village,
      location: item.location,
      assigned_patients_count: item.assigned_patients_count || item.patient_count || 0,
      active_pregnancies: item.active_pregnancies || 0,
      high_risk_cases: item.high_risk_cases || 0,
      total_emergencies_handled: item.total_emergencies_handled || item.emergencies_handled || 0,
      status: item.status || 'active',
      registration_date: item.registration_date || item.created_at,
      last_active: item.last_active || item.updated_at,
      performance_score: item.performance_score,
    }));
  } catch (error) {
    console.error('Error fetching ASHA workers:', error);
    return [];
  }
};

// Get a specific ASHA worker by ID
export const getAshaWorkerById = async (ashaId: string): Promise<AshaWorker> => {
  try {
    const response = await apiClient.get<ApiResponse<any>>(
      `/asha/${ashaId}`
    );

    if (!response.data.data) {
      throw new Error('ASHA worker not found');
    }

    const item = response.data.data;

    return {
      asha_id: item.asha_id || item.id,
      name: item.name,
      email: item.email,
      phone: item.phone,
      district: item.district,
      village: item.village,
      location: item.location,
      assigned_patients_count: item.assigned_patients_count || item.patient_count || 0,
      active_pregnancies: item.active_pregnancies || 0,
      high_risk_cases: item.high_risk_cases || 0,
      total_emergencies_handled: item.total_emergencies_handled || item.emergencies_handled || 0,
      status: item.status || 'active',
      registration_date: item.registration_date || item.created_at,
      last_active: item.last_active || item.updated_at,
      performance_score: item.performance_score,
    };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Get pregnancies assigned to an ASHA worker
export const getAshaPregnancies = async (ashaId: string): Promise<any[]> => {
  try {
    const response = await apiClient.get<ApiResponse<any>>(
      `/asha/${ashaId}/pregnancies`
    );

    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching ASHA pregnancies:', error);
    return [];
  }
};

// Get ASHA worker statistics
export const getAshaStats = async (): Promise<AshaStats> => {
  try {
    const response = await apiClient.get<ApiResponse<any>>(
      '/analytics/asha'
    );

    const data = response.data.data || {};

    return {
      total_asha_workers: data.total_asha_workers || 0,
      active_workers: data.active_workers || 0,
      total_patients_covered: data.total_patients_covered || 0,
      average_patients_per_asha: data.average_patients_per_asha || 0,
      by_district: data.by_district || [],
    };
  } catch (error) {
    console.error('Error fetching ASHA stats:', error);
    return {
      total_asha_workers: 0,
      active_workers: 0,
      total_patients_covered: 0,
      average_patients_per_asha: 0,
      by_district: [],
    };
  }
};

// Update ASHA worker status
export const updateAshaStatus = async (
  ashaId: string,
  status: 'active' | 'inactive' | 'on_leave'
): Promise<AshaWorker> => {
  try {
    const response = await apiClient.put<ApiResponse<any>>(
      `/asha/${ashaId}`,
      { status }
    );

    if (!response.data.data) {
      throw new Error('Failed to update ASHA worker status');
    }

    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
