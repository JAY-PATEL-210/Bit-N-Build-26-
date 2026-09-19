import { apiRequest } from './apiClient';
import { ApiResponse } from '../types/common';
import { NotificationItem } from '../types/notification';

export const notificationService = {
  getNotifications(): Promise<ApiResponse<NotificationItem[]>> {
    return apiRequest<ApiResponse<NotificationItem[]>>('/api/notifications');
  },

  markAsRead(id: string): Promise<ApiResponse<{ id: string; read: boolean }>> {
    return apiRequest<ApiResponse<{ id: string; read: boolean }>>(`/api/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },
};
