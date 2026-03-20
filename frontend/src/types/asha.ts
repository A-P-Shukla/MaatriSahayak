/**
 * ASHA Worker type definitions
 */

export interface AshaWorker {
  asha_id: string;
  name: string;
  email: string;
  phone: string;
  district: string;
  village: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  assigned_patients_count: number;
  active_pregnancies: number;
  high_risk_cases: number;
  total_emergencies_handled: number;
  status: 'active' | 'inactive' | 'on_leave';
  registration_date: string;
  last_active: string;
  performance_score?: number;
}

export interface AshaFilters {
  district?: string;
  village?: string;
  status?: 'active' | 'inactive' | 'on_leave';
  search?: string;
  page?: number;
  limit?: number;
}

export interface AshaStats {
  total_asha_workers: number;
  active_workers: number;
  total_patients_covered: number;
  average_patients_per_asha: number;
  by_district: {
    district: string;
    worker_count: number;
    patient_count: number;
  }[];
}
