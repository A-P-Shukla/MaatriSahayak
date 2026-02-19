/**
 * Analytics and reporting type definitions
 */

export interface ResponseTimeMetrics {
  average: number; // in seconds
  median: number; // P50
  p95: number; // 95th percentile
  p99: number; // 99th percentile
  min: number;
  max: number;
}

export interface EmergencyVolumeData {
  date: string; // ISO 8601 date string
  count: number;
  successful: number;
  delayed: number;
  failed: number;
}

export interface ResponseTimeTrend {
  date: string; // ISO 8601 date string
  average_response_time: number; // in seconds
  emergency_count: number;
}

export interface OutcomeStats {
  successful: number;
  delayed: number;
  failed: number;
  total: number;
  success_rate: number; // percentage
}

export interface DistrictMetrics {
  district: string;
  emergency_count: number;
  average_response_time: number;
  success_rate: number;
}

export interface AnalyticsData {
  date_range: {
    start: string;
    end: string;
  };
  response_time_metrics: ResponseTimeMetrics;
  emergency_volume: EmergencyVolumeData[];
  response_time_trend: ResponseTimeTrend[];
  outcomes: OutcomeStats;
  by_district: DistrictMetrics[];
}

export interface AnalyticsFilters {
  start_date: string;
  end_date: string;
  district?: string;
  severity_level?: string;
}

export type DateRangePreset = 'last_7_days' | 'last_30_days' | 'last_90_days' | 'custom';
