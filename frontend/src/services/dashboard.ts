import apiClient, { ApiResponse, handleApiError } from './api';
import type { DashboardStats } from '../types';

/**
 * Dashboard Service
 * Handles dashboard-specific API calls
 */

// Get dashboard statistics
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await apiClient.get<ApiResponse<DashboardStats>>(
      '/dashboard/stats'
    );

    return response.data.data || {
      total_pregnancies: 0,
      high_risk_count: 0,
      active_emergencies: 0,
      available_ambulances: 0,
      recent_emergencies: [],
      high_risk_pregnancies: [],
    };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
