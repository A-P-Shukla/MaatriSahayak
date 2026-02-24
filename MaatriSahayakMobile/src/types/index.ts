export interface User {
    id: string;
    username: string;
    name: string;
    role: 'asha' | 'admin';
    phone: string;
}

export interface Pregnancy {
    id: string;
    motherId: string;
    motherName: string;
    age: number;
    phone: string;
    address: string;
    lmp: string; // Last Menstrual Period
    edd: string; // Expected Delivery Date
    bloodGroup: string;
    riskLevel: 'low' | 'medium' | 'high';
    status: 'active' | 'delivered' | 'terminated';
    createdAt: string;
    updatedAt: string;
}

export interface VitalSigns {
    id: string;
    pregnancyId: string;
    bloodPressure: string;
    weight: number;
    hemoglobin: number;
    temperature: number;
    pulse: number;
    notes: string;
    recordedAt: string;
    recordedBy: string;
}

export interface Emergency {
    id: string;
    pregnancyId: string;
    patientName: string;
    symptoms: string;
    location: string;
    severity: 'high' | 'medium' | 'low';
    status: 'pending' | 'dispatched' | 'resolved';
    createdAt: string;
    resolvedAt?: string;
}

export interface SyncQueueItem {
    id: string;
    type: 'pregnancy' | 'vitals' | 'emergency';
    action: 'create' | 'update' | 'delete';
    data: any;
    timestamp: number;
    retryCount: number;
}
