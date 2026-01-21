"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { notificationsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Bell,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  DollarSign,
  BookOpen,
  Megaphone,
  User,
  Check,
  CheckCheck,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils/format";
import { toast } from "sonner";
import type { Notification, NotificationType, PaginatedResponse } from "@/lib/types";

const notificationIcons: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  due_reminder: Clock,
  overdue_notice: AlertTriangle,
  reservation_ready: CheckCircle,
  reservation_expired: XCircle,
  fine_notice: DollarSign,
  book_available: BookOpen,
  system_announcement: Megaphone,
  account_notice: User,
};

const notificationColors: Record<NotificationType, string> = {
  due_reminder: "bg-yellow-500/10 text-yellow-700",
  overdue_notice: "bg-red-500/10 text-red-700",
  reservation_ready: "bg-green-500/10 text-green-700",
  reservation_expired: "bg-gray-500/10 text-gray-700",
  fine_notice: "bg-orange-500/10 text-orange-700",
  book_available: "bg-blue-500/10 text-blue-700",
  system_announcement: "bg-purple-500/10 text-purple-700",
  account_notice: "bg-indigo-500/10 text-indigo-700",
};

export default function NotificationsPage() {
  const [page, setPage] = useState(1);

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Notification>>(
    ["/api/v1/notifications", { page, per_page: 20 }],
    () => notificationsApi.list({ page, per_page: 20 })
  );

  const notifications = data?.data;
  const pagination = data?.pagination;

  const handleMarkRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id);
      mutate();
    } catch (err) {
      toast.error("Failed to mark notification as read");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      mutate();
      toast.success("All notifications marked as read");
    } catch (err) {
      toast.error("Failed to mark all as read");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationsApi.delete(id);
      mutate();
      toast.success("Notification deleted");
    } catch (err) {
      toast.error("Failed to delete notification");
    }
  };

  const unreadCount = notifications?.filter((n) => !n.read).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with your library activity
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAllRead}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark All as Read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : notifications && notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((notification) => {
            const Icon = notificationIcons[notification.type] || Bell;
            const colorClass = notificationColors[notification.type] || "bg-muted";

            return (
              <Card
                key={notification.id}
                className={`transition-colors ${
                  !notification.read ? "border-primary/50 bg-primary/5" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${colorClass}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-medium">{notification.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatRelativeTime(notification.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <Badge variant="secondary" className="text-xs">
                              New
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              !notification.read
                                ? handleMarkRead(notification.id)
                                : handleDelete(notification.id)
                            }
                          >
                            {!notification.read ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {pagination && pagination.total_pages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!pagination.has_prev}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.total_pages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={!pagination.has_next}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You're all caught up! We'll notify you when there's something new."
        />
      )}
    </div>
  );
}
