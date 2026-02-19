/**
 * Type guards and validators for runtime type checking
 */

import type {
  Pregnancy,
  Emergency,
  Ambulance,
  User,
  Hospital,
  RiskCategory,
  EmergencyStatus,
  AmbulanceStatus,
} from '../types';

// Risk category validator
export const isRiskCategory = (value: unknown): value is RiskCategory => {
  return (
    typeof value === 'string' &&
    ['low', 'medium', 'high', 'critical'].includes(value)
  );
};

// Emergency status validator
export const isEmergencyStatus = (value: unknown): value is EmergencyStatus => {
  return (
    typeof value === 'string' &&
    ['initiated', 'dispatched', 'in_transit', 'arrived', 'completed'].includes(value)
  );
};

// Ambulance status validator
export const isAmbulanceStatus = (value: unknown): value is AmbulanceStatus => {
  return (
    typeof value === 'string' &&
    ['available', 'dispatched', 'busy', 'maintenance'].includes(value)
  );
};

// Pregnancy type guard
export const isPregnancy = (value: unknown): value is Pregnancy => {
  if (typeof value !== 'object' || value === null) return false;
  
  const obj = value as Record<string, unknown>;
  
  return (
    typeof obj.pregnancy_id === 'string' &&
    typeof obj.patient_name === 'string' &&
    typeof obj.age === 'number' &&
    typeof obj.phone === 'string' &&
    typeof obj.district === 'string' &&
    typeof obj.village === 'string' &&
    typeof obj.lmp_date === 'string' &&
    typeof obj.edd === 'string' &&
    typeof obj.blood_type === 'string' &&
    typeof obj.asha_worker_id === 'string' &&
    typeof obj.risk_score === 'number' &&
    isRiskCategory(obj.risk_category) &&
    typeof obj.current_status === 'string' &&
    typeof obj.registration_date === 'string' &&
    typeof obj.last_updated === 'string'
  );
};

// Emergency type guard
export const isEmergency = (value: unknown): value is Emergency => {
  if (typeof value !== 'object' || value === null) return false;
  
  const obj = value as Record<string, unknown>;
  
  return (
    typeof obj.event_id === 'string' &&
    typeof obj.pregnancy_id === 'string' &&
    typeof obj.patient_name === 'string' &&
    typeof obj.trigger_timestamp === 'string' &&
    typeof obj.event_type === 'string' &&
    typeof obj.severity_level === 'string' &&
    isEmergencyStatus(obj.status) &&
    typeof obj.location === 'object' &&
    obj.location !== null &&
    typeof (obj.location as Record<string, unknown>).latitude === 'number' &&
    typeof (obj.location as Record<string, unknown>).longitude === 'number'
  );
};

// Ambulance type guard
export const isAmbulance = (value: unknown): value is Ambulance => {
  if (typeof value !== 'object' || value === null) return false;
  
  const obj = value as Record<string, unknown>;
  
  return (
    typeof obj.ambulance_id === 'string' &&
    typeof obj.vehicle_number === 'string' &&
    typeof obj.driver_name === 'string' &&
    typeof obj.driver_phone === 'string' &&
    typeof obj.current_location === 'object' &&
    obj.current_location !== null &&
    typeof (obj.current_location as Record<string, unknown>).latitude === 'number' &&
    typeof (obj.current_location as Record<string, unknown>).longitude === 'number' &&
    isAmbulanceStatus(obj.status) &&
    typeof obj.last_updated === 'string' &&
    typeof obj.district === 'string'
  );
};

// User type guard
export const isUser = (value: unknown): value is User => {
  if (typeof value !== 'object' || value === null) return false;
  
  const obj = value as Record<string, unknown>;
  
  return (
    typeof obj.user_id === 'string' &&
    typeof obj.email === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.role === 'string'
  );
};

// Hospital type guard
export const isHospital = (value: unknown): value is Hospital => {
  if (typeof value !== 'object' || value === null) return false;
  
  const obj = value as Record<string, unknown>;
  
  return (
    typeof obj.hospital_id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.type === 'string' &&
    typeof obj.location === 'object' &&
    obj.location !== null &&
    typeof (obj.location as Record<string, unknown>).latitude === 'number' &&
    typeof (obj.location as Record<string, unknown>).longitude === 'number' &&
    typeof obj.address === 'string' &&
    typeof obj.district === 'string' &&
    typeof obj.available_beds === 'number' &&
    typeof obj.total_beds === 'number' &&
    typeof obj.maternity_ward_capacity === 'number' &&
    typeof obj.contact_number === 'string' &&
    Array.isArray(obj.facilities_available) &&
    typeof obj.last_updated === 'string'
  );
};

// Validate API response structure
export const isApiResponse = <T>(
  value: unknown,
  dataValidator?: (data: unknown) => data is T
): value is { success: boolean; data?: T; error?: string; message?: string } => {
  if (typeof value !== 'object' || value === null) return false;
  
  const obj = value as Record<string, unknown>;
  
  if (typeof obj.success !== 'boolean') return false;
  
  if (dataValidator && obj.data !== undefined) {
    return dataValidator(obj.data);
  }
  
  return true;
};

// Validate paginated response structure
export const isPaginatedResponse = <T>(
  value: unknown,
  itemValidator?: (item: unknown) => item is T
): value is { items: T[]; total: number; page: number; limit: number; hasMore: boolean } => {
  if (typeof value !== 'object' || value === null) return false;
  
  const obj = value as Record<string, unknown>;
  
  if (
    !Array.isArray(obj.items) ||
    typeof obj.total !== 'number' ||
    typeof obj.page !== 'number' ||
    typeof obj.limit !== 'number' ||
    typeof obj.hasMore !== 'boolean'
  ) {
    return false;
  }
  
  if (itemValidator) {
    return obj.items.every(itemValidator);
  }
  
  return true;
};
