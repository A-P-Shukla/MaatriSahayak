import apiClient, { ApiResponse, handleApiError } from './api';
import type { DashboardStats } from '../types';

/**
 * Dashboard Service
 * Handles dashboard-specific API calls
 */

// Get dashboard statistics
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await apiClient.get<ApiResponse<{
      total_pregnancies: number;
      active_pregnancies: number;
      high_risk_count: number;
      emergency_count: number;
      active_emergencies: number;
      ambulance_stats: {
        total: number;
        busy: number;
        available: number;
        utilization_percentage: number;
      };
      hospital_capacity: {
        total_hospitals: number;
        total_maternity_beds: number;
        available_maternity_beds: number;
        occupancy_percentage: number;
      };
    }>>(
      '/dev/analytics'
    );

    const data = response.data.data;

    // Map backend response to frontend DashboardStats format
    return {
      total_pregnancies: data?.total_pregnancies || 0,
      high_risk_count: data?.high_risk_count || 0,
      active_emergencies: data?.active_emergencies || 0,
      available_ambulances: data?.ambulance_stats?.available || 0,
      recent_emergencies: [],
      high_risk_pregnancies: [],
    };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
