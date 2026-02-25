/**
 * Analytics service - API calls for analytics and reporting
 */

import api from './api';
import type { AnalyticsData, AnalyticsFilters } from '../types/analytics';

/**
 * Get analytics data for a date range
 */
export const getAnalytics = async (filters: AnalyticsFilters): Promise<AnalyticsData> => {
  const response = await api.get<AnalyticsData>('/api/v1/analytics', {
    params: filters,
  });
  return response.data;
};

/**
 * Export analytics report
 */
export const exportReport = async (filters: AnalyticsFilters, format: 'pdf' | 'excel' = 'pdf'): Promise<Blob> => {
  const response = await api.post<Blob>(
    '/api/v1/analytics/export',
    { ...filters, format },
    {
      responseType: 'blob',
    }
  );
  return response.data;
};
