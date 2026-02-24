/**
 * Emergency-related type definitions
 */

export type EmergencyStatus =
  | 'initiated'
  | 'dispatched'
  | 'in_transit'
  | 'arrived'
  | 'completed';

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Location {
  latitude: number;
  longitude: number;
}

export interface Emergency {
  event_id: string;
  pregnancy_id: string;
  patient_name: string;
  patient_phone?: string;
  trigger_timestamp: string; // ISO 8601 date string
  dispatch_timestamp?: string; // ISO 8601 date string
  arrival_timestamp?: string; // ISO 8601 date string
  completion_timestamp?: string; // ISO 8601 date string
  event_type: string;
  severity_level: SeverityLevel;
  ambulance_id?: string;
  hospital_id?: string;
  status: EmergencyStatus;
  response_time_seconds?: number;
  outcome?: string;
  location: Location;
  patient_age?: number;
  patient_village?: string;
  estimated_arrival_time?: string; // ISO 8601 date string
}

export interface EmergencyFilters {
  status?: EmergencyStatus;
  severity_level?: SeverityLevel;
  start_date?: string;
  end_date?: string;
  district?: string;
  limit?: number;
}

export interface EmergencyStats {
  active_emergencies: number;
  completed_today: number;
  average_response_time: number; // in seconds
  by_status: {
    initiated: number;
    dispatched: number;
    in_transit: number;
    arrived: number;
    completed: number;
  };
  by_severity: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}
