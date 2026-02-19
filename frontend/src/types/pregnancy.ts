/**
 * Pregnancy-related type definitions
 */

export type RiskCategory = 'low' | 'medium' | 'high' | 'critical';
export type PregnancyStatus = 'active' | 'delivered' | 'terminated';

export interface Pregnancy {
  pregnancy_id: string;
  patient_name: string;
  age: number;
  phone: string;
  district: string;
  village: string;
  lmp_date: string; // ISO 8601 date string
  edd: string; // Expected Delivery Date - ISO 8601 date string
  blood_type: string;
  asha_worker_id: string;
  risk_score: number; // 0-100
  risk_category: RiskCategory;
  current_status: PregnancyStatus;
  medical_history?: string;
  registration_date: string; // ISO 8601 date string
  last_updated: string; // ISO 8601 date string
}

export interface VitalSigns {
  vital_id: string;
  pregnancy_id: string;
  timestamp: string; // ISO 8601 date string
  bp_systolic: number;
  bp_diastolic: number;
  heart_rate: number;
  temperature: number;
  weight?: number;
  symptoms?: string;
  recorded_by: string;
}

export interface PregnancyFilters {
  page?: number;
  limit?: number;
  search?: string;
  risk_category?: RiskCategory;
  district?: string;
  status?: PregnancyStatus;
  sort_field?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PregnancyStats {
  total_pregnancies: number;
  high_risk_count: number;
  by_risk_category: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  by_status: {
    active: number;
    delivered: number;
    terminated: number;
  };
}
