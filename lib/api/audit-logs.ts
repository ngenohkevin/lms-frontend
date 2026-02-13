import apiClient from "./client";
import type { AuditLog, AuditLogFilters } from "@/lib/types/audit-log";
import type { PaginatedResponse, Pagination } from "@/lib/types";

const PREFIX = "/api/v1/audit-logs";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface BackendAuditLog {
  id: number;
  table_name: string;
  record_id: number;
  action: string;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  user_id: number | null;
  user_type: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

interface BackendPagination {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

interface BackendAuditLogResult {
  audit_logs: BackendAuditLog[];
  pagination: BackendPagination;
}

function transformAuditLog(log: BackendAuditLog): AuditLog {
  return {
    id: String(log.id),
    table_name: log.table_name,
    record_id: log.record_id,
    action: log.action,
    old_values: log.old_values,
    new_values: log.new_values,
    user_id: log.user_id,
    user_type: log.user_type,
    ip_address: log.ip_address,
    user_agent: log.user_agent,
    created_at: log.created_at,
  };
}

function transformPagination(bp: BackendPagination): Pagination {
  return {
    page: bp.page,
    per_page: bp.per_page,
    total: bp.total,
    total_pages: bp.total_pages,
    has_next: bp.page < bp.total_pages,
    has_prev: bp.page > 1,
  };
}

export const auditLogsApi = {
  list: async (
    filters?: AuditLogFilters
  ): Promise<PaginatedResponse<AuditLog>> => {
    const params: Record<string, string | number | undefined> = {};
    if (filters?.table_name) params.table_name = filters.table_name;
    if (filters?.action) params.action = filters.action;
    if (filters?.user_id) params.user_id = filters.user_id;
    if (filters?.user_type) params.user_type = filters.user_type;
    if (filters?.start_date) params.start_date = filters.start_date;
    if (filters?.end_date) params.end_date = filters.end_date;
    if (filters?.page) params.page = filters.page;
    if (filters?.per_page) params.per_page = filters.per_page;

    const response = await apiClient.get<ApiResponse<BackendAuditLogResult>>(
      PREFIX,
      { params }
    );

    return {
      data: (response.data?.audit_logs || []).map(transformAuditLog),
      pagination: response.data?.pagination
        ? transformPagination(response.data.pagination)
        : undefined,
    };
  },

  exportCsv: async (
    filters?: Omit<AuditLogFilters, "page" | "per_page">
  ): Promise<void> => {
    const params: Record<string, string | number | undefined> = {};
    if (filters?.table_name) params.table_name = filters.table_name;
    if (filters?.action) params.action = filters.action;
    if (filters?.user_id) params.user_id = filters.user_id;
    if (filters?.user_type) params.user_type = filters.user_type;
    if (filters?.start_date) params.start_date = filters.start_date;
    if (filters?.end_date) params.end_date = filters.end_date;

    const blob = await apiClient.download(`${PREFIX}/export`, { params });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },
};
