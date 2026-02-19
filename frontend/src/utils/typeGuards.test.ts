import { describe, it, expect } from 'vitest';
import {
  isRiskCategory,
  isEmergencyStatus,
  isAmbulanceStatus,
  isPregnancy,
  isEmergency,
  isAmbulance,
  isUser,
  isHospital,
  isApiResponse,
  isPaginatedResponse,
} from './typeGuards';
import type { Pregnancy, Emergency, Ambulance, User, Hospital } from '../types';

describe('Type Guards', () => {
  describe('isRiskCategory', () => {
    it('should return true for valid risk categories', () => {
      expect(isRiskCategory('low')).toBe(true);
      expect(isRiskCategory('medium')).toBe(true);
      expect(isRiskCategory('high')).toBe(true);
      expect(isRiskCategory('critical')).toBe(true);
    });

    it('should return false for invalid risk categories', () => {
      expect(isRiskCategory('invalid')).toBe(false);
      expect(isRiskCategory('')).toBe(false);
      expect(isRiskCategory(123)).toBe(false);
      expect(isRiskCategory(null)).toBe(false);
      expect(isRiskCategory(undefined)).toBe(false);
    });
  });

  describe('isEmergencyStatus', () => {
    it('should return true for valid emergency statuses', () => {
      expect(isEmergencyStatus('initiated')).toBe(true);
      expect(isEmergencyStatus('dispatched')).toBe(true);
      expect(isEmergencyStatus('in_transit')).toBe(true);
      expect(isEmergencyStatus('arrived')).toBe(true);
      expect(isEmergencyStatus('completed')).toBe(true);
    });

    it('should return false for invalid emergency statuses', () => {
      expect(isEmergencyStatus('invalid')).toBe(false);
      expect(isEmergencyStatus('')).toBe(false);
      expect(isEmergencyStatus(123)).toBe(false);
      expect(isEmergencyStatus(null)).toBe(false);
    });
  });

  describe('isAmbulanceStatus', () => {
    it('should return true for valid ambulance statuses', () => {
      expect(isAmbulanceStatus('available')).toBe(true);
      expect(isAmbulanceStatus('dispatched')).toBe(true);
      expect(isAmbulanceStatus('busy')).toBe(true);
      expect(isAmbulanceStatus('maintenance')).toBe(true);
    });

    it('should return false for invalid ambulance statuses', () => {
      expect(isAmbulanceStatus('invalid')).toBe(false);
      expect(isAmbulanceStatus('')).toBe(false);
      expect(isAmbulanceStatus(123)).toBe(false);
      expect(isAmbulanceStatus(null)).toBe(false);
    });
  });

  describe('isPregnancy', () => {
    const validPregnancy: Pregnancy = {
      pregnancy_id: 'preg-001',
      patient_name: 'Test Patient',
      age: 25,
      phone: '+919876543210',
      district: 'Test District',
      village: 'Test Village',
      lmp_date: '2024-01-01',
      edd: '2024-10-08',
      blood_type: 'O+',
      asha_worker_id: 'asha-001',
      risk_score: 45,
      risk_category: 'medium',
      current_status: 'active',
      registration_date: '2024-01-15',
      last_updated: '2024-02-19',
    };

    it('should return true for valid pregnancy object', () => {
      expect(isPregnancy(validPregnancy)).toBe(true);
    });

    it('should return false for invalid pregnancy objects', () => {
      expect(isPregnancy(null)).toBe(false);
      expect(isPregnancy(undefined)).toBe(false);
      expect(isPregnancy({})).toBe(false);
      expect(isPregnancy('string')).toBe(false);
      expect(isPregnancy(123)).toBe(false);
    });

    it('should return false when required fields are missing', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { pregnancy_id, ...withoutId } = validPregnancy;
      expect(isPregnancy(withoutId)).toBe(false);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { patient_name, ...withoutName } = validPregnancy;
      expect(isPregnancy(withoutName)).toBe(false);
    });

    it('should return false when field types are incorrect', () => {
      const invalidAge = { ...validPregnancy, age: '25' };
      expect(isPregnancy(invalidAge)).toBe(false);

      const invalidRiskScore = { ...validPregnancy, risk_score: '45' };
      expect(isPregnancy(invalidRiskScore)).toBe(false);

      const invalidRiskCategory = { ...validPregnancy, risk_category: 'invalid' };
      expect(isPregnancy(invalidRiskCategory)).toBe(false);
    });
  });

  describe('isEmergency', () => {
    const validEmergency: Emergency = {
      event_id: 'event-001',
      pregnancy_id: 'preg-001',
      patient_name: 'Test Patient',
      trigger_timestamp: '2024-02-19T10:30:00Z',
      event_type: 'severe_preeclampsia',
      severity_level: 'high',
      status: 'dispatched',
      location: {
        latitude: 28.6139,
        longitude: 77.209,
      },
    };

    it('should return true for valid emergency object', () => {
      expect(isEmergency(validEmergency)).toBe(true);
    });

    it('should return false for invalid emergency objects', () => {
      expect(isEmergency(null)).toBe(false);
      expect(isEmergency(undefined)).toBe(false);
      expect(isEmergency({})).toBe(false);
    });

    it('should return false when location is invalid', () => {
      const invalidLocation = { ...validEmergency, location: {} };
      expect(isEmergency(invalidLocation)).toBe(false);

      const noLocation = { ...validEmergency, location: null };
      expect(isEmergency(noLocation)).toBe(false);
    });

    it('should return false when status is invalid', () => {
      const invalidStatus = { ...validEmergency, status: 'invalid' };
      expect(isEmergency(invalidStatus)).toBe(false);
    });
  });

  describe('isAmbulance', () => {
    const validAmbulance: Ambulance = {
      ambulance_id: 'amb-001',
      vehicle_number: 'UP-12-AB-1234',
      driver_name: 'Test Driver',
      driver_phone: '+919876543210',
      current_location: {
        latitude: 28.6139,
        longitude: 77.209,
      },
      status: 'available',
      last_updated: '2024-02-19T10:30:00Z',
      district: 'Test District',
    };

    it('should return true for valid ambulance object', () => {
      expect(isAmbulance(validAmbulance)).toBe(true);
    });

    it('should return false for invalid ambulance objects', () => {
      expect(isAmbulance(null)).toBe(false);
      expect(isAmbulance(undefined)).toBe(false);
      expect(isAmbulance({})).toBe(false);
    });

    it('should return false when location is invalid', () => {
      const invalidLocation = { ...validAmbulance, current_location: {} };
      expect(isAmbulance(invalidLocation)).toBe(false);
    });

    it('should return false when status is invalid', () => {
      const invalidStatus = { ...validAmbulance, status: 'invalid' };
      expect(isAmbulance(invalidStatus)).toBe(false);
    });
  });

  describe('isUser', () => {
    const validUser: User = {
      user_id: 'user-001',
      email: 'test@example.com',
      name: 'Test User',
      role: 'district_officer',
    };

    it('should return true for valid user object', () => {
      expect(isUser(validUser)).toBe(true);
    });

    it('should return false for invalid user objects', () => {
      expect(isUser(null)).toBe(false);
      expect(isUser(undefined)).toBe(false);
      expect(isUser({})).toBe(false);
    });

    it('should return false when required fields are missing', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { user_id, ...withoutId } = validUser;
      expect(isUser(withoutId)).toBe(false);
    });
  });

  describe('isHospital', () => {
    const validHospital: Hospital = {
      hospital_id: 'hosp-001',
      name: 'Test Hospital',
      type: 'District',
      location: {
        latitude: 28.6139,
        longitude: 77.209,
      },
      address: 'Test Address',
      district: 'Test District',
      available_beds: 10,
      total_beds: 50,
      maternity_ward_capacity: 20,
      contact_number: '+919876543210',
      facilities_available: ['ICU', 'NICU', 'Blood Bank'],
      last_updated: '2024-02-19T10:30:00Z',
    };

    it('should return true for valid hospital object', () => {
      expect(isHospital(validHospital)).toBe(true);
    });

    it('should return false for invalid hospital objects', () => {
      expect(isHospital(null)).toBe(false);
      expect(isHospital(undefined)).toBe(false);
      expect(isHospital({})).toBe(false);
    });

    it('should return false when facilities_available is not an array', () => {
      const invalidFacilities = { ...validHospital, facilities_available: 'not an array' };
      expect(isHospital(invalidFacilities)).toBe(false);
    });
  });

  describe('isApiResponse', () => {
    it('should return true for valid API response', () => {
      const response = { success: true, data: { test: 'data' } };
      expect(isApiResponse(response)).toBe(true);
    });

    it('should return true for error response', () => {
      const response = { success: false, error: 'Error message' };
      expect(isApiResponse(response)).toBe(true);
    });

    it('should return false for invalid response', () => {
      expect(isApiResponse(null)).toBe(false);
      expect(isApiResponse({})).toBe(false);
      expect(isApiResponse({ success: 'true' })).toBe(false);
    });

    it('should validate data with custom validator', () => {
      const response = { success: true, data: 'test' };
      const validator = (data: unknown): data is string => typeof data === 'string';
      expect(isApiResponse(response, validator)).toBe(true);

      const invalidResponse = { success: true, data: 123 };
      expect(isApiResponse(invalidResponse, validator)).toBe(false);
    });
  });

  describe('isPaginatedResponse', () => {
    it('should return true for valid paginated response', () => {
      const response = {
        items: [{ id: 1 }, { id: 2 }],
        total: 100,
        page: 1,
        limit: 20,
        hasMore: true,
      };
      expect(isPaginatedResponse(response)).toBe(true);
    });

    it('should return false for invalid paginated response', () => {
      expect(isPaginatedResponse(null)).toBe(false);
      expect(isPaginatedResponse({})).toBe(false);
      expect(isPaginatedResponse({ items: 'not an array' })).toBe(false);
    });

    it('should validate items with custom validator', () => {
      const response = {
        items: ['item1', 'item2'],
        total: 2,
        page: 1,
        limit: 20,
        hasMore: false,
      };
      const validator = (item: unknown): item is string => typeof item === 'string';
      expect(isPaginatedResponse(response, validator)).toBe(true);

      const invalidResponse = {
        items: [1, 2],
        total: 2,
        page: 1,
        limit: 20,
        hasMore: false,
      };
      expect(isPaginatedResponse(invalidResponse, validator)).toBe(false);
    });
  });
});
