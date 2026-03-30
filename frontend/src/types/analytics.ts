/**
 * Analytics type definitions — aligned with real cloud API responses
 */

// Shape returned by GET /analytics (generate_analytics lambda)
export interface CloudAnalyticsData {
  total_pregnancies: number;
  active_pregnancies: number;
  high_risk_count: number;
  high_risk_percentage: number;
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
  district?: string;
}

// Computed from real emergency records (GET /emergencies)
export interface ComputedAnalytics {
  outcomes: {
    completed: number;
    active: number;
    total: number;
    completion_rate: number;
  };
  by_severity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  by_status: {
    initiated: number;
    dispatched: number;
    in_transit: number;
    arrived: number;
    completed: number;
  };
  avg_response_time_seconds: number;
  response_time_trend: { date: string; count: number; avg_response_min: number }[];
  volume_trend: { date: string; total: number; completed: number; active: number }[];
  by_district: { district: string; count: number; completed: number; completion_rate: number }[];
}

export interface AnalyticsFilters {
  start_date: string;
  end_date: string;
  district?: string;
}

export type DateRangePreset = 'last_7_days' | 'last_30_days' | 'last_90_days';
