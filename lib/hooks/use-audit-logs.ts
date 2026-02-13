import useSWR from "swr";
import { toast } from "sonner";
import { auditLogsApi } from "@/lib/api/audit-logs";
import type { AuditLog, AuditLogFilters } from "@/lib/types/audit-log";
import type { PaginatedResponse } from "@/lib/types";

const handleApiError = (error: Error, context: string) => {
  console.error(`${context}:`, error);
  if (!error.message.includes("Failed to fetch")) {
    toast.error(`Failed to ${context.toLowerCase()}`, {
      description: error.message || "An unexpected error occurred",
    });
  }
};

export function useAuditLogs(filters?: AuditLogFilters) {
  const key = filters
    ? ["/api/v1/audit-logs", filters]
    : "/api/v1/audit-logs";

  const { data, error, isLoading, mutate } = useSWR<
    PaginatedResponse<AuditLog>
  >(key, () => auditLogsApi.list(filters), {
    onError: (err) => handleApiError(err, "Load audit logs"),
    shouldRetryOnError: true,
    errorRetryCount: 2,
  });

  return {
    auditLogs: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refresh: mutate,
  };
}
