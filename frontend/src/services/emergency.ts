import apiClient, { ApiResponse, handleApiError } from './api';
import type { Emergency, EmergencyFilters, EmergencyStats } from '../types';

/**
 * Emergency Service
 * Handles all emergency-related API calls
 */

// Mock emergency data for development/testing
const MOCK_EMERGENCIES: Emergency[] = [
  {
    event_id: 'EMG-001',
    pregnancy_id: 'PREG-001',
    patient_name: 'Priya Sharma',
    patient_phone: '+91-9876543210',
    trigger_timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    event_type: 'SEVERE_BLEEDING',
    severity_level: 'critical',
    status: 'dispatched',
    response_time_seconds: 180,
    location: { latitude: 28.6139, longitude: 77.2090 },
    ambulance_id: 'AMB-001',
    patient_age: 28,
    patient_village: 'Sarita Vihar',
  },
  {
    event_id: 'EMG-002',
    pregnancy_id: 'PREG-002',
    patient_name: 'Anjali Verma',
    patient_phone: '+91-9876543211',
    trigger_timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    dispatch_timestamp: new Date(Date.now() - 6900000).toISOString(),
    event_type: 'PREMATURE_LABOR',
    severity_level: 'high',
    status: 'in_transit',
    response_time_seconds: 300,
    location: { latitude: 28.5355, longitude: 77.3910 },
    ambulance_id: 'AMB-002',
    hospital_id: 'HOSP-001',
    patient_age: 32,
    patient_village: 'Noida Sector 62',
  },
  {
    event_id: 'EMG-003',
    pregnancy_id: 'PREG-003',
    patient_name: 'Sunita Devi',
    patient_phone: '+91-9876543212',
    trigger_timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
    event_type: 'HIGH_BLOOD_PRESSURE',
    severity_level: 'medium',
    status: 'initiated',
    response_time_seconds: 120,
    location: { latitude: 28.7041, longitude: 77.1025 },
    patient_age: 25,
    patient_village: 'Rohini',
  },
];

// Get list of emergencies with filters
export const getEmergencies = async (
  filters: EmergencyFilters = {}
): Promise<Emergency[]> => {
  try {
    const params = new URLSearchParams();

    if (filters.status) params.append('status', filters.status);
    if (filters.severity_level) params.append('severity_level', filters.severity_level);
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    if (filters.district) params.append('district', filters.district);
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await apiClient.get<ApiResponse<any>>(
      `/emergencies?${params.toString()}`
    );

    console.log('Emergency API Response:', response.data);

    const d = response.data.data;
    const rawArray = (d?.emergencies ?? d?.items ?? (Array.isArray(d) ? d : []));

    console.log('Parsed emergencies array:', rawArray);

    // Map to ensure event_id field exists and normalize field names
    const mappedEmergencies = rawArray.map((item: any) => ({
      event_id: item.event_id || item.eventId || item.id || item.emergency_id,
      pregnancy_id: item.pregnancy_id || item.pregnancyId,
      patient_name: item.patient_name || item.patientName || 'Unknown Patient',
      patient_phone: item.patient_phone || item.patientPhone,
      trigger_timestamp: item.trigger_timestamp || item.triggered_at || item.timestamp || item.createdAt || new Date().toISOString(),
      dispatch_timestamp: item.dispatch_timestamp || item.dispatched_at || item.dispatchedAt,
      arrival_timestamp: item.arrival_timestamp || item.arrived_at || item.arrivedAt,
      completion_timestamp: item.completion_timestamp || item.completed_at || item.completedAt,
      event_type: item.event_type || item.eventType || 'EMERGENCY',
      severity_level: (item.severity_level || item.severity || 'medium').toLowerCase() as any,
      ambulance_id: item.ambulance_id || item.ambulanceId || item.assignedAmbulanceId,
      hospital_id: item.hospital_id || item.hospitalId || item.assignedHospitalId,
      status: (item.status || 'initiated').toLowerCase().replace('active', 'initiated') as any,
      response_time_seconds: item.response_time_seconds || item.responseTime || item.response_time,
      outcome: item.outcome,
      location: item.location || { latitude: 0, longitude: 0 },
      patient_age: item.patient_age || item.patientAge,
      patient_village: item.patient_village || item.patientVillage,
      estimated_arrival_time: item.estimated_arrival_time || item.estimatedArrivalTime,
    }));

    console.log('Mapped emergencies:', mappedEmergencies);

    // If no emergencies found and we're in development, return mock data
    if (mappedEmergencies.length === 0 && import.meta.env.DEV) {
      console.log('No emergencies from API, using mock data for development');
      return MOCK_EMERGENCIES;
    }

    return mappedEmergencies;
  } catch (error) {
    console.error('Error fetching emergencies:', error);

    // If we're in development and the API fails, return mock data
    if (import.meta.env.DEV) {
      console.log('API error in development, using mock data');
      return MOCK_EMERGENCIES;
    }

    throw new Error(handleApiError(error));
  }
};

// Get a specific emergency by ID
export const getEmergencyById = async (emergencyId: string): Promise<Emergency> => {
  try {
    // First try to get all emergencies and filter client-side
    const response = await apiClient.get<ApiResponse<any>>(
      `/emergencies`
    );

    const d = response.data.data;
    const emergencies = (d?.emergencies ?? d?.items ?? (Array.isArray(d) ? d : []));

    // Find the specific emergency by ID
    const emergency = emergencies.find((e: any) =>
      e.event_id === emergencyId ||
      e.id === emergencyId ||
      e.emergency_id === emergencyId
    );

    if (!emergency) {
      throw new Error('Emergency not found');
    }

    return {
      ...emergency,
      event_id: emergency.event_id || emergency.id || emergency.emergency_id,
      trigger_timestamp: emergency.trigger_timestamp || emergency.created_at || emergency.timestamp,
      dispatch_timestamp: emergency.dispatch_timestamp || emergency.dispatched_at,
      arrival_timestamp: emergency.arrival_timestamp || emergency.arrived_at,
      completion_timestamp: emergency.completion_timestamp || emergency.completed_at,
    };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Get emergencies for a specific pregnancy
export const getEmergenciesByPregnancyId = async (
  pregnancyId: string
): Promise<Emergency[]> => {
  try {
    const response = await apiClient.get<ApiResponse<any>>(
      `/pregnancies/${pregnancyId}/emergencies`
    );

    const rawData = response.data.data;

    // Handle different response formats
    let emergenciesArray: any[] = [];
    if (Array.isArray(rawData)) {
      emergenciesArray = rawData;
    } else if (rawData && Array.isArray(rawData.emergencies)) {
      emergenciesArray = rawData.emergencies;
    } else if (rawData && Array.isArray(rawData.items)) {
      emergenciesArray = rawData.items;
    }

    // Map to Emergency type with field name mapping
    return emergenciesArray.map((item: any) => ({
      event_id: item.event_id || item.id,
      pregnancy_id: item.pregnancy_id,
      patient_name: item.patient_name,
      event_type: item.event_type,
      severity_level: item.severity_level,
      status: item.status,
      trigger_timestamp: item.trigger_timestamp || item.created_at,
      response_time_seconds: item.response_time_seconds || item.response_time,
      location: item.location,
      symptoms: item.symptoms,
      ambulance_id: item.ambulance_id,
      hospital_id: item.hospital_id,
      asha_worker_id: item.asha_worker_id,
      notes: item.notes,
    }));
  } catch (error) {
    console.error('Error fetching emergencies for pregnancy:', error);
    return [];
  }
};

// Trigger a new emergency
export const triggerEmergency = async (emergencyData: {
  pregnancy_id: string;
  event_type: string;
  severity: string;
  latitude: number;
  longitude: number;
  symptoms?: string;
  triggered_by?: string;
}): Promise<Emergency> => {
  try {
    const response = await apiClient.post<ApiResponse<Emergency>>(
      '/emergency',
      emergencyData
    );

    if (!response.data.data) {
      throw new Error('Failed to trigger emergency');
    }

    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Complete/close emergency
export const completeEmergency = async (emergencyId: string): Promise<Emergency> => {
  try {
    const response = await apiClient.post<ApiResponse<Emergency>>(
      `/emergency/${emergencyId}/complete`,
      {}
    );

    if (!response.data.data) {
      throw new Error('Failed to complete emergency');
    }

    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Update emergency status (keeping for backward compatibility)
export const updateEmergencyStatus = async (
  emergencyId: string,
  status: string
): Promise<Emergency> => {
  try {
    // If status is 'completed', use the complete endpoint
    if (status === 'COMPLETED') {
      return completeEmergency(emergencyId);
    }

    const response = await apiClient.put<ApiResponse<Emergency>>(
      `/emergency/${emergencyId}/status`,
      { status }
    );

    if (!response.data.data) {
      throw new Error('Failed to update emergency status');
    }

    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Get emergency statistics
export const getEmergencyStats = async (): Promise<EmergencyStats> => {
  try {
    const response = await apiClient.get<ApiResponse<EmergencyStats>>(
      '/analytics'
    );

    return response.data.data || {
      active_emergencies: 0,
      completed_today: 0,
      average_response_time: 0,
      by_status: {
        initiated: 0,
        dispatched: 0,
        in_transit: 0,
        arrived: 0,
        completed: 0,
      },
      by_severity: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
      },
    };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
