import api from './api';

export interface AdminStats {
  totalPregnancies: number;
  totalAshaWorkers: number;
  totalDrivers: number;
  totalOfficers: number;
  activeEmergencies: number;
  highRiskPregnancies: number;
  pendingApprovals: number;
  totalDistricts: number;
  districtBreakdown: {
    district: string;
    pregnancies: number;
    ashaWorkers: number;
    emergencies: number;
  }[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'ASHA' | 'DRIVER' | 'OFFICER';
  district: string;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  verificationStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  lastActive?: string;
  pregnanciesManaged?: number;
  emergenciesHandled?: number;
}

export interface PregnancyRecord {
  id: string;
  patientName: string;
  age: number;
  district: string;
  ashaWorkerName: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  gestationalAge: number;
  lastCheckup: string;
  status: 'ACTIVE' | 'DELIVERED' | 'TERMINATED';
}

export interface EmergencyRecord {
  id: string;
  patientName: string;
  district: string;
  ashaWorkerName: string;
  driverName?: string;
  status: 'INITIATED' | 'DISPATCHED' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  createdAt: string;
  resolvedAt?: string;
}

export interface AnalyticsData {
  timeSeriesData: {
    date: string;
    pregnancies: number;
    emergencies: number;
    highRisk: number;
  }[];
  districtPerformance: {
    district: string;
    totalPregnancies: number;
    highRiskPercentage: number;
    emergencyResponseTime: number;
    ashaWorkerCount: number;
  }[];
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  monthlyTrends: {
    month: string;
    registrations: number;
    deliveries: number;
    emergencies: number;
  }[];
}

/**
 * Get admin dashboard statistics
 */
export const getAdminStats = async (): Promise<AdminStats> => {
  const response = await api.get('/admin/stats');
  return response.data;
};

/**
 * Get all users with filters
 */
export const getAllUsers = async (params?: {
  role?: 'ASHA' | 'DRIVER' | 'OFFICER' | 'ALL';
  status?: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'ALL';
  district?: string;
  search?: string;
}): Promise<AdminUser[]> => {
  const response = await api.get('/admin/users', { params });
  return response.data;
};

/**
 * Get user details by ID
 */
export const getUserDetails = async (userId: string): Promise<AdminUser> => {
  const response = await api.get(`/admin/users/${userId}`);
  return response.data;
};

/**
 * Approve pending user
 */
export const approveUser = async (userId: string): Promise<void> => {
  await api.post(`/admin/users/${userId}/approve`);
};

/**
 * Reject pending user
 */
export const rejectUser = async (userId: string, reason: string): Promise<void> => {
  await api.post(`/admin/users/${userId}/reject`, { reason });
};

/**
 * Suspend active user
 */
export const suspendUser = async (userId: string, reason: string): Promise<void> => {
  await api.post(`/admin/users/${userId}/suspend`, { reason });
};

/**
 * Reactivate suspended user
 */
export const reactivateUser = async (userId: string): Promise<void> => {
  await api.post(`/admin/users/${userId}/reactivate`);
};

/**
 * Delete user
 */
export const deleteUser = async (userId: string): Promise<void> => {
  await api.delete(`/admin/users/${userId}`);
};

/**
 * Get all pregnancies with filters
 */
export const getAllPregnancies = async (params?: {
  district?: string;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'ALL';
  status?: 'ACTIVE' | 'DELIVERED' | 'TERMINATED' | 'ALL';
  search?: string;
}): Promise<PregnancyRecord[]> => {
  const response = await api.get('/admin/pregnancies', { params });
  return response.data;
};

/**
 * Get all emergencies with filters
 */
export const getAllEmergencies = async (params?: {
  district?: string;
  status?: 'INITIATED' | 'DISPATCHED' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED' | 'ALL';
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'ALL';
  dateFrom?: string;
  dateTo?: string;
}): Promise<EmergencyRecord[]> => {
  const response = await api.get('/admin/emergencies', { params });
  return response.data;
};

/**
 * Get analytics data
 */
export const getAnalyticsData = async (params?: {
  dateFrom?: string;
  dateTo?: string;
  district?: string;
}): Promise<AnalyticsData> => {
  const response = await api.get('/admin/analytics', { params });
  return response.data;
};

/**
 * Export data to CSV
 */
export const exportData = async (type: 'users' | 'pregnancies' | 'emergencies' | 'analytics'): Promise<Blob> => {
  const response = await api.get(`/admin/export/${type}`, {
    responseType: 'blob',
  });
  return response.data;
};

/**
 * Get pending approvals count
 */
export const getPendingApprovalsCount = async (): Promise<number> => {
  const response = await api.get('/admin/pending-approvals/count');
  return response.data.count;
};

/**
 * Bulk approve users
 */
export const bulkApproveUsers = async (userIds: string[]): Promise<void> => {
  await api.post('/admin/users/bulk-approve', { userIds });
};

/**
 * Bulk reject users
 */
export const bulkRejectUsers = async (userIds: string[], reason: string): Promise<void> => {
  await api.post('/admin/users/bulk-reject', { userIds, reason });
};

/**
 * Update user role
 */
export const updateUserRole = async (userId: string, role: 'ASHA' | 'DRIVER' | 'OFFICER'): Promise<void> => {
  await api.put(`/admin/users/${userId}/role`, { role });
};

/**
 * Update user district
 */
export const updateUserDistrict = async (userId: string, district: string): Promise<void> => {
  await api.put(`/admin/users/${userId}/district`, { district });
};

/**
 * Get system health metrics
 */
export const getSystemHealth = async (): Promise<{
  apiStatus: 'healthy' | 'degraded' | 'down';
  databaseStatus: 'healthy' | 'degraded' | 'down';
  lambdaStatus: 'healthy' | 'degraded' | 'down';
  lastUpdated: string;
}> => {
  const response = await api.get('/admin/system/health');
  return response.data;
};

/**
 * Get audit logs
 */
export const getAuditLogs = async (params?: {
  userId?: string;
  action?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}): Promise<{
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}[]> => {
  const response = await api.get('/admin/audit-logs', { params });
  return response.data;
};

export default {
  getAdminStats,
  getAllUsers,
  getUserDetails,
  approveUser,
  rejectUser,
  suspendUser,
  reactivateUser,
  deleteUser,
  getAllPregnancies,
  getAllEmergencies,
  getAnalyticsData,
  exportData,
  getPendingApprovalsCount,
  bulkApproveUsers,
  bulkRejectUsers,
  updateUserRole,
  updateUserDistrict,
  getSystemHealth,
  getAuditLogs,
};
