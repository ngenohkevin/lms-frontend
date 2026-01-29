"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { useAuth } from "@/providers/auth-provider";
import { reservationsApi } from "@/lib/api";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import type { Reservation, ReservationSearchParams, ReservationStatus, PaginatedResponse } from "@/lib/types";
import { formatDate, formatRelativeTime } from "@/lib/utils/format";
import { toast } from "sonner";

const statusColors: Record<ReservationStatus, string> = {
  pending: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  ready: "bg-green-500/10 text-green-700 border-green-500/20",
  fulfilled: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  expired: "bg-gray-500/10 text-gray-700 border-gray-500/20",
  cancelled: "bg-red-500/10 text-red-700 border-red-500/20",
};

const statusIcons: Record<ReservationStatus, React.ComponentType<{ className?: string }>> = {
  pending: Clock,
  ready: CheckCircle,
  fulfilled: CheckCircle,
  expired: AlertTriangle,
  cancelled: XCircle,
};

export default function ReservationsPage() {
  const { isLibrarian, isStudent, user } = useAuth();
  const [params, setParams] = useState<ReservationSearchParams>({
    page: 1,
    per_page: 20,
    student_id: !isLibrarian && isStudent ? String(user?.id) : undefined,
  });

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Reservation>>(
    ["/api/v1/reservations", params],
    () => reservationsApi.list(params)
  );

  const reservations = data?.data;
  const pagination = data?.pagination;

  const handleCancel = async (id: string) => {
    try {
      await reservationsApi.cancel(id);
      mutate();
      toast.success("Reservation cancelled");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel reservation");
    }
  };

  const handleFulfill = async (id: string) => {
    try {
      await reservationsApi.fulfill(id);
      mutate();
      toast.success("Reservation fulfilled - book checked out");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to fulfill reservation");
    }
  };

  const handlePageChange = (page: number) => {
    setParams((prev) => ({ ...prev, page }));
  };

  const handleSearch = (query: string) => {
    setParams((prev) => ({ ...prev, query, page: 1 }));
  };

  const columns = [
    {
      key: "book",
      header: "Book",
      render: (res: Reservation) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-8 rounded bg-muted flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium line-clamp-1">{res.book?.title || "Unknown"}</p>
            <p className="text-sm text-muted-foreground">{res.book?.author}</p>
          </div>
        </div>
      ),
    },
    ...(isLibrarian
      ? [
          {
            key: "student",
            header: "Student",
            render: (res: Reservation) => (
              <div>
                <p className="font-medium">{res.student?.name || "Unknown"}</p>
                <p className="text-sm text-muted-foreground">
                  {res.student?.student_id}
                </p>
              </div>
            ),
          },
        ]
      : []),
    {
      key: "queue_position",
      header: "Queue",
      render: (res: Reservation) => (
        <span className="text-sm">
          {/* Show queue position for all active reservations (pending and ready) */}
          {(res.status === "pending" || res.status === "ready") && res.queue_position
            ? `#${res.queue_position}`
            : "-"}
        </span>
      ),
    },
    {
      key: "reserved_at",
      header: "Reserved",
      render: (res: Reservation) => (
        <span className="text-sm">{formatDate(res.reserved_at)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (res: Reservation) => {
        const StatusIcon = statusIcons[res.status];
        return (
          <Badge
            variant="outline"
            className={`gap-1 ${statusColors[res.status]}`}
          >
            <StatusIcon className="h-3 w-3" />
            {res.status}
          </Badge>
        );
      },
    },
    {
      key: "expires_at",
      header: "Expires",
      render: (res: Reservation) => (
        <span className="text-sm">
          {res.expires_at ? formatRelativeTime(res.expires_at) : "-"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (res: Reservation) => (
        <div className="flex justify-end gap-2">
          {res.status === "ready" && isLibrarian && (
            <Button
              size="sm"
              variant="default"
              onClick={(e) => {
                e.stopPropagation();
                handleFulfill(res.id);
              }}
            >
              Fulfill
            </Button>
          )}
          {(res.status === "pending" || res.status === "ready") && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                handleCancel(res.id);
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reservations</h1>
          <p className="text-muted-foreground">
            {isLibrarian
              ? "Manage book reservations"
              : "View your book reservations"}
          </p>
        </div>
      </div>

      <DataTable
        data={reservations || []}
        columns={columns}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={isLibrarian ? handleSearch : undefined}
        searchPlaceholder="Search by book title or student..."
        isLoading={isLoading}
        emptyMessage="No reservations found."
      />
    </div>
  );
}
