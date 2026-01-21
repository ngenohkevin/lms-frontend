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

// Backend pagination structure
interface BackendPagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

// Backend paginated response structure
interface BackendPaginatedNotifications {
  notifications: Notification[];
  pagination: BackendPagination;
}

// Transform backend pagination to frontend format
function transformPagination(bp?: BackendPagination): PaginatedResponse<Notification>["pagination"] | undefined {
  if (!bp) return undefined;
  return {
    page: bp.page,
    per_page: bp.limit,
    total: bp.total,
    total_pages: bp.total_pages,
    has_next: bp.page < bp.total_pages,
    has_prev: bp.page > 1,
  };
}

export const notificationsApi = {
  // List user's notifications with pagination
  list: async (
    params?: NotificationSearchParams
  ): Promise<PaginatedResponse<Notification>> => {
    const response = await apiClient.get<ApiResponse<BackendPaginatedNotifications>>(
      NOTIFICATIONS_PREFIX,
      { params }
    );
    return {
      data: response.data?.notifications || [],
      pagination: transformPagination(response.data?.pagination),
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
