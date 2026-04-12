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

    const response = await apiClient.get<ApiResponse<any>>(
      `/pregnancies?${params.toString()}`
    );

    // Handle both array and nested object response formats
    let rawItems: any[] = [];
    const data = response.data.data;
    
    if (Array.isArray(data)) {
      rawItems = data;
    } else if (data && Array.isArray(data.pregnancies)) {
      rawItems = data.pregnancies;
    } else if (data && data.items) {
      rawItems = data.items;
    }

    // Map backend field names to frontend field names
    const items: Pregnancy[] = rawItems.map((item: any) => ({
      pregnancy_id: item.id || item.pregnancy_id,
      patient_name: item.patient_name,
      age: item.age,
      phone: item.phone,
      district: item.district,
      village: item.village,
      lmp_date: item.lmp_date,
      edd: item.edd,
      blood_type: item.blood_type,
      asha_worker_id: item.asha_worker_id,
      risk_score: item.risk_score || 0,
      risk_category: (item.risk_level || item.risk_category || 'low').toLowerCase() as any,
      current_status: (item.status || item.current_status || 'active').toLowerCase() as any,
      medical_history: item.medical_history,
      registration_date: item.created_at || item.registration_date,
      last_updated: item.updated_at || item.last_updated,
    }));

    return {
      items,
      total: items.length,
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
    const response = await apiClient.get<ApiResponse<any>>(
      `/pregnancies/${pregnancyId}`
    );

    console.log('Pregnancy API Response:', response.data);

    if (!response.data.data) {
      throw new Error('Pregnancy not found');
    }

    const rawData = response.data.data;
    console.log('Raw pregnancy item:', rawData);

    // The API returns data nested in a 'pregnancy' object
    const item = rawData.pregnancy || rawData;
    console.log('Extracted pregnancy data:', item);

    // Map backend field names to frontend field names
    const pregnancy: Pregnancy = {
      pregnancy_id: item.pregnancy_id || item.id,
      patient_name: item.patient_name || item.name,
      age: item.age,
      phone: item.phone || item.patient_phone,
      district: item.district,
      village: item.village,
      lmp_date: item.lmp_date,
      edd: item.edd || item.expected_delivery_date,
      blood_type: item.blood_type || item.blood_group,
      asha_worker_id: item.asha_worker_id,
      risk_score: item.risk_score || 0,
      risk_category: (item.risk_level || item.risk_category || 'low').toLowerCase() as any,
      current_status: (item.status || item.current_status || 'active').toLowerCase() as any,
      medical_history: item.medical_history,
      registration_date: item.created_at || item.registration_date,
      last_updated: item.updated_at || item.last_updated,
    };

    console.log('Mapped pregnancy:', pregnancy);
    return pregnancy;
  } catch (error) {
    console.error('Error fetching pregnancy:', error);
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
    const response = await apiClient.get<ApiResponse<any>>(
      `/pregnancies/${pregnancyId}/vitals-history`
    );

    const rawData = response.data.data;
    
    // Handle different response formats
    let vitalsArray: any[] = [];
    if (Array.isArray(rawData)) {
      vitalsArray = rawData;
    } else if (rawData && Array.isArray(rawData.vitals)) {
      vitalsArray = rawData.vitals;
    } else if (rawData && Array.isArray(rawData.items)) {
      vitalsArray = rawData.items;
    }

    // Map to VitalSigns type
    return vitalsArray.map((item: any) => ({
      vital_id: item.vital_id || item.id,
      pregnancy_id: item.pregnancy_id,
      bp_systolic: item.bp_systolic || item.systolic,
      bp_diastolic: item.bp_diastolic || item.diastolic,
      heart_rate: item.heart_rate,
      temperature: item.temperature,
      weight: item.weight,
      hemoglobin: item.hemoglobin,
      blood_sugar: item.blood_sugar,
      notes: item.notes,
      recorded_by: item.recorded_by || item.asha_worker_id,
      timestamp: item.timestamp || item.recorded_at || item.created_at,
    }));
  } catch (error) {
    console.error('Error fetching vitals:', error);
    return [];
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
      '/analytics'
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

// Get ANC visit history for a pregnancy
export const getANCHistory = async (pregnancyId: string): Promise<any[]> => {
  try {
    const response = await apiClient.get<ApiResponse<any[]>>(
      `/pregnancies/${pregnancyId}/anc-history`
    );

    return response.data.data || [];
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Get risk trends for a pregnancy
export const getRiskTrends = async (pregnancyId: string): Promise<any> => {
  try {
    const response = await apiClient.get<ApiResponse<any>>(
      `/pregnancies/${pregnancyId}/risk-trends`
    );

    return response.data.data || null;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Record ANC visit
export const recordANCVisit = async (visitData: any): Promise<any> => {
  try {
    const response = await apiClient.post<ApiResponse<any>>(
      '/anc/visits',
      visitData
    );

    if (!response.data.data) {
      throw new Error('Failed to record ANC visit');
    }

    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Update pregnancy information
export const updatePregnancy = async (
  pregnancyId: string,
  updateData: Partial<Pregnancy>
): Promise<Pregnancy> => {
  try {
    const response = await apiClient.put<ApiResponse<Pregnancy>>(
      `/pregnancies/${pregnancyId}`,
      updateData
    );

    if (!response.data.data) {
      throw new Error('Failed to update pregnancy');
    }

    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
