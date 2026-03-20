import apiClient, { handleApiError } from './api';

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  photo?: string;
  licenseNumber: string;
  ambulanceId: string;
  ambulance_details?: {
    id: string;
    vehicle_number: string;
    district: string;
    status: string;
    type: string;
  };
  status: 'AVAILABLE' | 'ON_RIDE' | 'OFFLINE';
  currentLocation?: { latitude: number; longitude: number; lastUpdated: string };
  rating: number;
  totalRides: number;
  emergencyContact?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterDriverPayload {
  name: string;
  phone: string;
  email: string;
  password: string;
  license_number: string;
  ambulance_id: string;
  emergency_contact?: string;
}

export const registerDriver = async (data: RegisterDriverPayload): Promise<Driver> => {
  try {
    const res = await apiClient.post<{ data: Driver }>('/driver/register', data);
    return res.data.data;
  } catch (e) {
    throw new Error(handleApiError(e));
  }
};

export const getDriverProfile = async (driverId: string): Promise<Driver> => {
  try {
    const res = await apiClient.get<{ data: Driver }>(`/driver/${driverId}`);
    return res.data.data;
  } catch (e) {
    throw new Error(handleApiError(e));
  }
};

export const updateDriverStatus = async (
  driverId: string,
  status: 'AVAILABLE' | 'ON_RIDE' | 'OFFLINE'
): Promise<{ driver_id: string; status: string; updated_at: string }> => {
  try {
    const res = await apiClient.put<{ data: { driver_id: string; status: string; updated_at: string } }>(
      '/driver/status',
      { driver_id: driverId, status }
    );
    return res.data.data;
  } catch (e) {
    throw new Error(handleApiError(e));
  }
};

export const getAssignedEmergencies = async (ambulanceId: string) => {
  try {
    const res = await apiClient.get<{ data: any }>(`/driver/emergencies?ambulance_id=${ambulanceId}`);
    return res.data.data;
  } catch (e) {
    throw new Error(handleApiError(e));
  }
};

export const acceptEmergency = async (emergencyId: string, driverId: string) => {
  try {
    const res = await apiClient.post<{ data: any }>(`/driver/emergency/${emergencyId}/accept`, {
      emergency_id: emergencyId,
      driver_id: driverId,
    });
    return res.data.data;
  } catch (e) {
    throw new Error(handleApiError(e));
  }
};

export const completeRide = async (
  emergencyId: string,
  driverId: string,
  outcome: 'COMPLETED' | 'CANCELLED' | 'REFERRED',
  notes?: string
) => {
  try {
    const res = await apiClient.post<{ data: any }>(`/driver/ride/${emergencyId}/complete`, {
      emergency_id: emergencyId,
      driver_id: driverId,
      outcome,
      notes: notes || '',
    });
    return res.data.data;
  } catch (e) {
    throw new Error(handleApiError(e));
  }
};
