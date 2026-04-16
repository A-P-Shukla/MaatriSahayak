import apiClient, { ApiResponse, handleApiError } from './api';
import type { DashboardStats } from '../types';

/**
 * Dashboard Service
 * Handles dashboard-specific API calls
 */

// Get dashboard statistics
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await apiClient.get<ApiResponse<any>>('/analytics');
    const rawData = response.data.data;

    // Map high_risk_pregnancies to ensure pregnancy_id is set correctly
    const high_risk_pregnancies = (rawData?.high_risk_pregnancies || []).map((p: any) => ({
      ...p,
      pregnancy_id: p.pregnancy_id || p.id, // Ensure pregnancy_id is set
    }));

    return {
      total_pregnancies: rawData?.total_pregnancies || 0,
      high_risk_count: rawData?.high_risk_count || 0,
      active_emergencies: rawData?.active_emergencies || 0,
      available_ambulances: rawData?.available_ambulances || 0,
      recent_emergencies: rawData?.recent_emergencies || [],
      high_risk_pregnancies,
    };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
