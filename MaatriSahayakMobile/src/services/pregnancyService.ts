import api from './api';
import { ENDPOINTS } from '../config/api';

export interface Pregnancy {
    id: string;
    patient_name: string;
    age: number;
    phone: string;
    district: string;
    village: string;
    lmp_date: string;
    edd: string;
    blood_type: string;
    gravida?: number;
    risk_level: string;
    risk_score: number;
    status: string;
    asha_worker_id: string;
}

export interface RegisterPregnancyPayload {
    patient_name: string;
    age: number;
    phone: string;
    district: string;
    village: string;
    lmp_date: string;
    edd: string;
    blood_type: string;
    gravida?: number;
    asha_worker_id: string;
}

export interface VitalsPayload {
    pregnancy_id: string;
    bp_systolic?: number;
    bp_diastolic?: number;
    heart_rate?: number;
    temperature?: number;
    oxygen_saturation?: number;
    weight?: number;
    hemoglobin?: number;
    notes?: string;
    recorded_by: string;
}

export interface EmergencyPayload {
    pregnancy_id: string;
    event_type: string;
    severity: string;
    description: string;
    latitude: number;
    longitude: number;
    triggered_by: string;
}

export const PregnancyService = {
    async list(): Promise<Pregnancy[]> {
        const { data } = await api.get(ENDPOINTS.PREGNANCIES);
        const result = data.data;
        if (Array.isArray(result)) return result;
        if (result && Array.isArray(result.pregnancies)) return result.pregnancies;
        return [];
    },

    async getById(id: string): Promise<Pregnancy> {
        const { data } = await api.get(ENDPOINTS.PREGNANCY_DETAILS(id));
        return data.data;
    },

    async register(payload: RegisterPregnancyPayload): Promise<Pregnancy> {
        const { data } = await api.post(ENDPOINTS.PREGNANCIES, payload);
        return data.data;
    },

    async recordVitals(payload: VitalsPayload): Promise<void> {
        await api.post(ENDPOINTS.RECORD_VITALS, payload);
    },

    async getVitalsHistory(pregnancyId: string): Promise<any[]> {
        const { data } = await api.get(ENDPOINTS.VITALS_HISTORY(pregnancyId));
        return data.data || [];
    },

    async triggerEmergency(payload: EmergencyPayload): Promise<any> {
        const { data } = await api.post(ENDPOINTS.TRIGGER_EMERGENCY, payload);
        return data.data;
    },

    async getEmergencies(): Promise<any[]> {
        const { data } = await api.get(ENDPOINTS.EMERGENCIES);
        return data.data || [];
    },

    async processAncCard(pregnancyId: string, imageBase64: string, autoUpdate = false): Promise<any> {
        const { data } = await api.post(ENDPOINTS.PROCESS_ANC_CARD, {
            pregnancy_id: pregnancyId,
            image_data: imageBase64,
            auto_update: autoUpdate,
        });
        return data.data;
    },

    async getEmergencyStatus(emergencyId: string): Promise<any> {
        const { data } = await api.get(ENDPOINTS.EMERGENCY_STATUS(emergencyId));
        return data.data;
    },

    async getNearbyHospitals(district?: string, latitude?: number, longitude?: number): Promise<any[]> {
        const params = new URLSearchParams();
        if (district)  params.append('district',  district);
        if (latitude != null)  params.append('latitude',  String(latitude));
        if (longitude != null) params.append('longitude', String(longitude));
        const qs = params.toString();
        const { data } = await api.get(`${ENDPOINTS.HOSPITALS}${qs ? '?' + qs : ''}`);
        const result = data.data;
        if (Array.isArray(result)) return result;
        if (result && Array.isArray(result.hospitals)) return result.hospitals;
        return [];
    },
};
