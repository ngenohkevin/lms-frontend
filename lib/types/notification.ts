export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  read_at?: string;
  data?: Record<string, unknown>;
  created_at: string;
}

export type NotificationType =
  | "due_reminder"
  | "overdue_notice"
  | "reservation_ready"
  | "reservation_expired"
  | "fine_notice"
  | "book_available"
  | "system_announcement"
  | "account_notice";

export interface CreateNotificationRequest {
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

export interface BatchNotificationRequest {
  user_ids: string[];
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

export interface NotificationSearchParams {
  type?: NotificationType;
  read?: boolean;
  page?: number;
  per_page?: number;
}

export const NOTIFICATION_TYPES: NotificationType[] = [
  "due_reminder",
  "overdue_notice",
  "reservation_ready",
  "reservation_expired",
  "fine_notice",
  "book_available",
  "system_announcement",
  "account_notice",
];

export function getNotificationIcon(type: NotificationType): string {
  const icons: Record<NotificationType, string> = {
    due_reminder: "clock",
    overdue_notice: "alert-triangle",
    reservation_ready: "check-circle",
    reservation_expired: "x-circle",
    fine_notice: "dollar-sign",
    book_available: "book-open",
    system_announcement: "megaphone",
    account_notice: "user",
  };
  return icons[type];
}
