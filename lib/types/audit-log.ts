export interface AuditLog {
  id: string;
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

export interface AuditLogFilters {
  table_name?: string;
  action?: string;
  user_id?: number;
  user_type?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  per_page?: number;
}
