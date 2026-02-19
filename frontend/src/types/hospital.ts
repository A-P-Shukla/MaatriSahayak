/**
 * Hospital-related type definitions
 */

import { Location } from './emergency';

export type HospitalType = 'PHC' | 'CHC' | 'District' | 'Medical_College';

export interface Hospital {
  hospital_id: string;
  name: string;
  type: HospitalType;
  location: Location;
  address: string;
  district: string;
  available_beds: number;
  total_beds: number;
  maternity_ward_capacity: number;
  contact_number: string;
  facilities_available: string[];
  last_updated: string; // ISO 8601 date string
}

export interface HospitalFilters {
  district?: string;
  type?: HospitalType;
  has_available_beds?: boolean;
}

export interface HospitalStats {
  total_hospitals: number;
  by_type: {
    PHC: number;
    CHC: number;
    District: number;
    Medical_College: number;
  };
  total_beds: number;
  available_beds: number;
  occupancy_rate: number; // percentage
}
