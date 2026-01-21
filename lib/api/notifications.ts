import apiClient from "./client";
import type {
  Notification,
  CreateNotificationRequest,
  BatchNotificationRequest,
  NotificationSearchParams,
  PaginatedResponse,
} from "@/lib/types";

const NOTIFICATIONS_PREFIX = "/api/v1/notifications";

// Backend response wrapper
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Backend uses ListResponse with Meta structure
interface BackendListMeta {
  page: number;
  limit: number;
  total: number;
}

// Backend list response structure
interface BackendListResponse {
  success: boolean;
  data: Notification[];
  meta?: BackendListMeta;
}

// Transform backend meta to frontend pagination format
function transformMeta(meta?: BackendListMeta, dataLength?: number): PaginatedResponse<Notification>["pagination"] | undefined {
  if (!meta) return undefined;
  const total = meta.total || dataLength || 0;
  const totalPages = Math.ceil(total / meta.limit);
  return {
    page: meta.page,
    per_page: meta.limit,
    total: total,
    total_pages: totalPages,
    has_next: meta.page < totalPages,
    has_prev: meta.page > 1,
  };
}

export const notificationsApi = {
  // List user's notifications with pagination
  list: async (
    params?: NotificationSearchParams
  ): Promise<PaginatedResponse<Notification>> => {
    const response = await apiClient.get<BackendListResponse>(
      NOTIFICATIONS_PREFIX,
      { params }
    );
    const notifications = response.data || [];
    return {
      data: notifications,
      pagination: transformMeta(response.meta, notifications.length),
    };
  },

  // Get single notification by ID
  get: async (id: string): Promise<Notification> => {
    const response = await apiClient.get<ApiResponse<Notification>>(`${NOTIFICATIONS_PREFIX}/${id}`);
    return response.data;
  },

  // Create a notification (admin/librarian only)
  create: async (data: CreateNotificationRequest): Promise<Notification> => {
    const response = await apiClient.post<ApiResponse<Notification>>(NOTIFICATIONS_PREFIX, data);
    return response.data;
  },

  // Create batch notifications (admin/librarian only)
  createBatch: async (
    data: BatchNotificationRequest
  ): Promise<{ sent: number }> => {
    const response = await apiClient.post<ApiResponse<{ sent: number }>>(
      `${NOTIFICATIONS_PREFIX}/batch`,
      data
    );
    return response.data;
  },

  // Mark notification as read - Backend uses PUT
  markRead: async (id: string): Promise<Notification> => {
    const response = await apiClient.put<ApiResponse<Notification>>(`${NOTIFICATIONS_PREFIX}/${id}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllRead: async (): Promise<{ updated: number }> => {
    const response = await apiClient.put<ApiResponse<{ updated: number }>>(
      `${NOTIFICATIONS_PREFIX}/read-all`
    );
    return response.data;
  },

  // Delete a notification
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${NOTIFICATIONS_PREFIX}/${id}`);
  },

  // Get notification stats (includes unread count) - Backend uses /stats not /unread-count
  getUnreadCount: async (): Promise<{ count: number }> => {
    const response = await apiClient.get<ApiResponse<{ unread_count: number; total_count: number }>>(
      `${NOTIFICATIONS_PREFIX}/stats`
    );
    return { count: response.data?.unread_count || 0 };
  },

  // Get full notification stats
  getStats: async (): Promise<{ unread_count: number; total_count: number }> => {
    const response = await apiClient.get<ApiResponse<{ unread_count: number; total_count: number }>>(
      `${NOTIFICATIONS_PREFIX}/stats`
    );
    return response.data;
  },
};

export default notificationsApi;
