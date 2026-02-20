import apiClient, { ApiResponse, PaginatedResponse, handleApiError } from './api';
import type { Pregnancy, VitalSigns, PregnancyFilters, PregnancyStats } from '../types';

/**
 * Pregnancy Service
 * Handles all pregnancy-related API calls
 */

// Get paginated list of pregnancies with filters
export const getPregnancies = async (
  filters: PregnancyFilters = {}
): Promise<PaginatedResponse<Pregnancy>> => {
  try {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.risk_category) params.append('risk_level', filters.risk_category);
    if (filters.district) params.append('district', filters.district);
    if (filters.status) params.append('status', filters.status);
    if (filters.sort_field && filters.sort_order) {
      params.append('sort', `${filters.sort_field}:${filters.sort_order}`);
    }

    const response = await apiClient.get<ApiResponse<PaginatedResponse<Pregnancy>>>(
      `/pregnancies?${params.toString()}`
    );

    return response.data.data || {
      items: [],
      total: 0,
      page: filters.page || 1,
      limit: filters.limit || 20,
      hasMore: false,
    };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Get detailed information about a specific pregnancy
export const getPregnancyById = async (pregnancyId: string): Promise<Pregnancy> => {
  try {
    const response = await apiClient.get<ApiResponse<Pregnancy>>(
      `/pregnancies/${pregnancyId}`
    );

    if (!response.data.data) {
      throw new Error('Pregnancy not found');
    }

    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Register a new pregnancy
export const registerPregnancy = async (
  pregnancyData: Omit<Pregnancy, 'pregnancy_id' | 'registration_date' | 'last_updated'>
): Promise<Pregnancy> => {
  try {
    const response = await apiClient.post<ApiResponse<Pregnancy>>(
      '/pregnancies',
      pregnancyData
    );

    if (!response.data.data) {
      throw new Error('Failed to register pregnancy');
    }

    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Get vital signs for a pregnancy
export const getVitalsByPregnancyId = async (pregnancyId: string): Promise<VitalSigns[]> => {
  try {
    const response = await apiClient.get<ApiResponse<VitalSigns[]>>(
      `/vitals?pregnancy_id=${pregnancyId}`
    );

    return response.data.data || [];
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Record vital signs for a pregnancy
export const recordVitals = async (
  vitalsData: Omit<VitalSigns, 'vital_id' | 'timestamp'>
): Promise<VitalSigns> => {
  try {
    const response = await apiClient.post<ApiResponse<VitalSigns>>(
      '/vitals',
      vitalsData
    );

    if (!response.data.data) {
      throw new Error('Failed to record vital signs');
    }

    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Get pregnancy statistics
export const getPregnancyStats = async (): Promise<PregnancyStats> => {
  try {
    const response = await apiClient.get<ApiResponse<PregnancyStats>>(
      '/pregnancies/stats'
    );

    return response.data.data || {
      total_pregnancies: 0,
      high_risk_count: 0,
      by_risk_category: { low: 0, medium: 0, high: 0, critical: 0 },
      by_status: { active: 0, delivered: 0, terminated: 0 },
    };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
