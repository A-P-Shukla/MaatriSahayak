/**
 * Ambulance-related type definitions
 */

import { Location } from './emergency';

export type AmbulanceStatus = 'available' | 'dispatched' | 'busy' | 'maintenance';

export interface Ambulance {
  ambulance_id: string;
  vehicle_number: string;
  driver_name: string;
  driver_phone: string;
  current_location: Location;
  status: AmbulanceStatus;
  last_updated: string; // ISO 8601 date string
  district: string;
  assigned_emergency_id?: string;
  battery_level?: number; // 0-100
  speed?: number; // km/h
  heading?: number; // degrees 0-360
  type?: string; // Ambulance type (e.g., 'BASIC', 'ADVANCED', 'ICU')
}

export interface AmbulanceFilters {
  status?: AmbulanceStatus;
  district?: string;
}

export interface AmbulanceRoute {
  ambulance_id: string;
  emergency_id: string;
  waypoints: Location[];
  estimated_duration: number; // in seconds
  distance: number; // in meters
}

export interface AmbulanceStats {
  total_ambulances: number;
  available: number;
  dispatched: number;
  busy: number;
  maintenance: number;
  utilization_rate: number; // percentage
}
