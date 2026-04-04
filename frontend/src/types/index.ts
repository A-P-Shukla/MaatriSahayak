/**
 * Central export for all type definitions
 */

// Pregnancy types
export type {
  Pregnancy,
  VitalSigns,
  PregnancyFilters,
  PregnancyStats,
  RiskCategory,
  PregnancyStatus,
} from './pregnancy';

// Emergency types
export type {
  Emergency,
  EmergencyFilters,
  EmergencyStats,
  EmergencyStatus,
  SeverityLevel,
  Location,
} from './emergency';

// Ambulance types
export type {
  Ambulance,
  AmbulanceFilters,
  AmbulanceRoute,
  AmbulanceStats,
  AmbulanceStatus,
} from './ambulance';

// User types
export type {
  User,
  AuthTokens,
  LoginCredentials,
  AuthState,
  UserRole,
} from './user';

// Hospital types
export type {
  Hospital,
  HospitalFilters,
  HospitalStats,
  HospitalType,
} from './hospital';

// ASHA Worker types
export type {
  AshaWorker,
  AshaFilters,
  AshaStats,
} from './asha';

// Analytics types
export type {
  CloudAnalyticsData,
  ComputedAnalytics,
  AnalyticsFilters,
  DateRangePreset,
} from './analytics';

// Generic API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  totalPages?: number;
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: Record<string, unknown>;
}

// Import types for use in DashboardStats
import type { Pregnancy } from './pregnancy';
import type { Emergency } from './emergency';

// Dashboard stats type
export interface DashboardStats {
  total_pregnancies: number;
  high_risk_count: number;
  active_emergencies: number;
  available_ambulances: number;
  recent_emergencies: Emergency[];
  high_risk_pregnancies: Pregnancy[];
}
