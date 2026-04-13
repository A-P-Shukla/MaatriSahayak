import apiClient, { ApiResponse, handleApiError } from './api';

export interface NotificationPayload {
  asha_worker_id: string;
  title: string;
  message: string;
  type?: 'EMERGENCY' | 'ALERT' | 'GENERAL';
  data?: Record<string, any>;
}

export const sendNotificationToAsha = async (payload: NotificationPayload): Promise<any> => {
  try {
    console.log('Sending notification:', payload);
    const response = await apiClient.post<ApiResponse<any>>(
      '/notifications',
      {
        notification_type: 'PUSH_NOTIFICATION',
        ...payload
      }
    );
    console.log('Notification response:', response.data);
    return response.data.data;
  } catch (error: any) {
    console.error('Notification error:', error);
    
    // Provide more specific error messages
    if (error.response?.status === 404) {
      throw new Error('Notification service is not available. Please contact support.');
    } else if (error.response?.status === 400) {
      throw new Error(error.response?.data?.message || 'Invalid notification data');
    } else if (error.code === 'ERR_NETWORK' || !error.response) {
      throw new Error('Unable to connect to server. Please check your internet connection.');
    }
    
    const errorMsg = error.response?.data?.message || error.message || 'Failed to send notification';
    throw new Error(errorMsg);
  }
};

export const broadcastEmergencyAlert = async (
  emergencyId: string,
  ashaWorkerIds: string[]
): Promise<any> => {
  try {
    const promises = ashaWorkerIds.map(id =>
      sendNotificationToAsha({
        asha_worker_id: id,
        title: '🚨 Emergency Alert',
        message: `Emergency ${emergencyId} requires immediate attention`,
        type: 'EMERGENCY',
        data: { emergency_id: emergencyId }
      })
    );
    const results = await Promise.allSettled(promises);
    return results;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
