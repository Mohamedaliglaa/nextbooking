import { apiClient } from './client';
import { Notification, PaginatedResponse } from '@/types/api';

export const notificationService = {
  async getNotifications(params?: {
    page?: number;
    per_page?: number;
    unread_only?: boolean;
  }): Promise<PaginatedResponse<Notification>> {
    const response = await apiClient.get<PaginatedResponse<Notification>>('/notifications', params);
    return response.data!;
  },

  async markAsRead(notificationId: number): Promise<Notification> {
    const response = await apiClient.patch<Notification>(`/notifications/${notificationId}/read`);
    return response.data!;
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.patch('/notifications/mark-all-read');
  },

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<{ count: number }>('/notifications/unread-count');
    return response.data!.count;
  },
};

