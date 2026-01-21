import apiClient from "./client";
import type {
  Notification,
  CreateNotificationRequest,
  BatchNotificationRequest,
  NotificationSearchParams,
  PaginatedResponse,
} from "@/lib/types";

const NOTIFICATIONS_PREFIX = "/api/v1/notifications";

export const notificationsApi = {
  // List user's notifications with pagination
  list: async (
    params?: NotificationSearchParams
  ): Promise<PaginatedResponse<Notification>> => {
    return apiClient.get<PaginatedResponse<Notification>>(
      NOTIFICATIONS_PREFIX,
      { params }
    );
  },

  // Get single notification by ID
  get: async (id: string): Promise<Notification> => {
    return apiClient.get<Notification>(`${NOTIFICATIONS_PREFIX}/${id}`);
  },

  // Create a notification (admin/librarian only)
  create: async (data: CreateNotificationRequest): Promise<Notification> => {
    return apiClient.post<Notification>(NOTIFICATIONS_PREFIX, data);
  },

  // Create batch notifications (admin/librarian only)
  createBatch: async (
    data: BatchNotificationRequest
  ): Promise<{ sent: number }> => {
    return apiClient.post<{ sent: number }>(
      `${NOTIFICATIONS_PREFIX}/batch`,
      data
    );
  },

  // Mark notification as read
  markRead: async (id: string): Promise<Notification> => {
    return apiClient.post<Notification>(`${NOTIFICATIONS_PREFIX}/${id}/read`);
  },

  // Mark all notifications as read
  markAllRead: async (): Promise<{ updated: number }> => {
    return apiClient.post<{ updated: number }>(
      `${NOTIFICATIONS_PREFIX}/read-all`
    );
  },

  // Delete a notification
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${NOTIFICATIONS_PREFIX}/${id}`);
  },

  // Get unread count
  getUnreadCount: async (): Promise<{ count: number }> => {
    return apiClient.get<{ count: number }>(
      `${NOTIFICATIONS_PREFIX}/unread-count`
    );
  },
};

export default notificationsApi;
