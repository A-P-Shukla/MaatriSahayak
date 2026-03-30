/**
 * Analytics service — fetches real data from AWS cloud APIs
 *
 * Primary:  GET /analytics  → CloudAnalyticsData (pregnancies, ambulances, hospitals)
 * Secondary: GET /emergencies → raw Emergency[] used to compute trends, district breakdown,
 *            outcomes, severity split, response time stats
 */

import apiClient, { ApiResponse, handleApiError } from './api';
import type { CloudAnalyticsData, ComputedAnalytics, AnalyticsFilters } from '../types/analytics';

const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export const getCloudAnalytics = async (): Promise<CloudAnalyticsData> => {
  try {
    const res = await apiClient.get<ApiResponse<CloudAnalyticsData>>('/analytics');
    return res.data.data!;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const getComputedAnalytics = async (
  filters: AnalyticsFilters
): Promise<ComputedAnalytics> => {
  try {
    const params = new URLSearchParams();
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    if (filters.district) params.append('district', filters.district);

    const res = await apiClient.get<ApiResponse<any>>(`/emergencies?${params.toString()}`);
    const raw = res.data.data;
    const emergencies: any[] = Array.isArray(raw)
      ? raw
      : raw?.emergencies ?? raw?.items ?? [];

    // Filter by date range
    const start = new Date(filters.start_date);
    const end = new Date(filters.end_date);
    end.setHours(23, 59, 59, 999);

    const inRange = emergencies.filter((e) => {
      const ts = new Date(e.trigger_timestamp || e.triggered_at || e.created_at);
      return ts >= start && ts <= end;
    });

    // Outcomes
    const completed = inRange.filter((e) => e.status === 'completed' || e.status === 'COMPLETED').length;
    const active = inRange.filter((e) => e.status !== 'completed' && e.status !== 'COMPLETED').length;
    const total = inRange.length;
    const completion_rate = total > 0 ? Math.round((completed / total) * 100 * 10) / 10 : 0;

    // Severity
    const by_severity = { critical: 0, high: 0, medium: 0, low: 0 };
    inRange.forEach((e) => {
      const s = (e.severity_level || 'low').toLowerCase() as keyof typeof by_severity;
      if (s in by_severity) by_severity[s]++;
    });

    // Status
    const by_status = { initiated: 0, dispatched: 0, in_transit: 0, arrived: 0, completed: 0 };
    inRange.forEach((e) => {
      const s = (e.status || '').toLowerCase().replace(' ', '_') as keyof typeof by_status;
      if (s in by_status) by_status[s]++;
    });

    // Avg response time
    const withRT = inRange.filter((e) => e.response_time_seconds && e.response_time_seconds > 0);
    const avg_response_time_seconds =
      withRT.length > 0
        ? Math.round(withRT.reduce((sum, e) => sum + e.response_time_seconds, 0) / withRT.length)
        : 0;

    // Build day buckets between start and end
    const days: string[] = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      days.push(cursor.toISOString().split('T')[0]);
      cursor.setDate(cursor.getDate() + 1);
    }

    // Trend maps keyed by YYYY-MM-DD
    const dayMap: Record<string, { count: number; completed: number; rt_sum: number; rt_count: number }> = {};
    days.forEach((d) => { dayMap[d] = { count: 0, completed: 0, rt_sum: 0, rt_count: 0 }; });

    inRange.forEach((e) => {
      const key = new Date(e.trigger_timestamp || e.triggered_at || e.created_at)
        .toISOString()
        .split('T')[0];
      if (!dayMap[key]) return;
      dayMap[key].count++;
      if (e.status === 'completed' || e.status === 'COMPLETED') dayMap[key].completed++;
      if (e.response_time_seconds > 0) {
        dayMap[key].rt_sum += e.response_time_seconds;
        dayMap[key].rt_count++;
      }
    });

    // Downsample for 90-day range to avoid chart clutter (weekly buckets)
    const totalDays = days.length;
    const step = totalDays > 60 ? 7 : totalDays > 14 ? 3 : 1;

    const response_time_trend: ComputedAnalytics['response_time_trend'] = [];
    const volume_trend: ComputedAnalytics['volume_trend'] = [];

    for (let i = 0; i < days.length; i += step) {
      const bucket = days.slice(i, i + step);
      const agg = bucket.reduce(
        (acc, d) => {
          const b = dayMap[d];
          acc.count += b.count;
          acc.completed += b.completed;
          acc.rt_sum += b.rt_sum;
          acc.rt_count += b.rt_count;
          return acc;
        },
        { count: 0, completed: 0, rt_sum: 0, rt_count: 0 }
      );

      const label = fmt(new Date(days[i]));
      const avg_response_min =
        agg.rt_count > 0 ? Math.round((agg.rt_sum / agg.rt_count / 60) * 10) / 10 : 0;

      response_time_trend.push({ date: label, count: agg.count, avg_response_min });
      volume_trend.push({ date: label, total: agg.count, completed: agg.completed, active: agg.count - agg.completed });
    }

    // District breakdown
    const districtMap: Record<string, { count: number; completed: number }> = {};
    inRange.forEach((e) => {
      const d = e.district || e.patient_village || 'Unknown';
      if (!districtMap[d]) districtMap[d] = { count: 0, completed: 0 };
      districtMap[d].count++;
      if (e.status === 'completed' || e.status === 'COMPLETED') districtMap[d].completed++;
    });

    const by_district = Object.entries(districtMap)
      .map(([district, v]) => ({
        district,
        count: v.count,
        completed: v.completed,
        completion_rate: v.count > 0 ? Math.round((v.completed / v.count) * 100 * 10) / 10 : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return {
      outcomes: { completed, active, total, completion_rate },
      by_severity,
      by_status,
      avg_response_time_seconds,
      response_time_trend,
      volume_trend,
      by_district,
    };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
