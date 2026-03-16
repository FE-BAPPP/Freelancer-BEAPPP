import { API_BASE_URL } from './api';
import { ApiResponse, Notification, PageResponse } from '../types/api';

const getAuthToken = (): string | null => {
  return localStorage.getItem('userToken') || localStorage.getItem('token');
};

const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

/**
 * Notification API Service
 * Endpoints for managing user notifications
 */
export const notificationApi = {
  /**
   * Get notifications
   * Retrieve paginated list of notifications for current user
   */
  getNotifications: async (page: number = 0, size: number = 20): Promise<ApiResponse<PageResponse<Notification>>> => {
    const response = await fetch(`${API_BASE_URL}/api/notifications?page=${page}&size=${size}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch notifications: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Mark notification as read
   * Update single notification read status
   */
  markAsRead: async (notificationId: string): Promise<ApiResponse<void>> => {
    const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to mark as read: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Mark all notifications as read
   * Bulk update all notifications to read status
   */
  markAllAsRead: async (): Promise<ApiResponse<void>> => {
    const response = await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to mark all as read: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Get unread notification count
   * Retrieve count of unread notifications
   */
  getUnreadCount: async (): Promise<ApiResponse<Record<string, number>>> => {
    const response = await fetch(`${API_BASE_URL}/api/notifications/unread-count`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch unread count: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },


};
