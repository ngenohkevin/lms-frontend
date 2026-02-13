"use client";

import { useState, useCallback } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { AuthGuard } from "@/components/auth/auth-guard";
import { PermissionCodes } from "@/lib/types/permission";
import { useAuditLogs } from "@/lib/hooks/use-audit-logs";
import { auditLogsApi } from "@/lib/api/audit-logs";
import { AuditLogDetail } from "@/components/settings/audit-log-detail";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Download,
  ScrollText,
  CalendarIcon,
  X,
} from "lucide-react";
import type { AuditLog, AuditLogFilters } from "@/lib/types/audit-log";
import type { DateRange } from "react-day-picker";

const TABLE_OPTIONS = [
  { value: "books", label: "Books" },
  { value: "book_copies", label: "Book Copies" },
  { value: "users", label: "Users" },
  { value: "students", label: "Students" },
  { value: "transactions", label: "Transactions" },
  { value: "reservations", label: "Reservations" },
  { value: "fines", label: "Fines" },
  { value: "categories", label: "Categories" },
  { value: "departments", label: "Departments" },
  { value: "academic_years", label: "Academic Years" },
  { value: "authors", label: "Authors" },
  { value: "languages", label: "Languages" },
  { value: "series", label: "Series" },
  { value: "settings", label: "Settings" },
  { value: "permissions", label: "Permissions" },
  { value: "invites", label: "Invites" },
  { value: "notifications", label: "Notifications" },
  { value: "auth", label: "Auth" },
];

const ACTION_OPTIONS = [
  { value: "CREATE", label: "Create" },
  { value: "UPDATE", label: "Update" },
  { value: "DELETE", label: "Delete" },
  { value: "LOGIN", label: "Login" },
  { value: "LOGIN_FAILED", label: "Login Failed" },
  { value: "LOGOUT", label: "Logout" },
  { value: "PASSWORD_CHANGE", label: "Password Change" },
  { value: "PASSWORD_RESET", label: "Password Reset" },
  { value: "STATUS_CHANGE", label: "Status Change" },
  { value: "IMPORT", label: "Import" },
  { value: "EXPORT", label: "Export" },
];

const USER_TYPE_OPTIONS = [
  { value: "super_admin", label: "Super Admin" },
  { value: "admin", label: "Admin" },
  { value: "librarian", label: "Librarian" },
  { value: "staff", label: "Staff" },
  { value: "system", label: "System" },
];

function actionColor(action: string) {
  switch (action) {
    case "CREATE":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "UPDATE":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "DELETE":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "LOGIN":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200";
    case "LOGIN_FAILED":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    case "LOGOUT":
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    default:
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
  }
}

export default function AuditLogsPage() {
  const [filters, setFilters] = useState<AuditLogFilters>({
    page: 1,
    per_page: 20,
  });
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const { auditLogs, pagination, isLoading } = useAuditLogs(filters);

  const handleFilterChange = useCallback(
    (key: keyof AuditLogFilters, value: string | undefined) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value || undefined,
        page: 1,
      }));
    },
    []
  );

  const handleDateRangeChange = useCallback((range: DateRange | undefined) => {
    setDateRange(range);
    setFilters((prev) => ({
      ...prev,
      start_date: range?.from ? format(range.from, "yyyy-MM-dd") : undefined,
      end_date: range?.to ? format(range.to, "yyyy-MM-dd") : undefined,
      page: 1,
    }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({ page: 1, per_page: 20 });
    setDateRange(undefined);
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      await auditLogsApi.exportCsv({
        table_name: filters.table_name,
        action: filters.action,
        user_id: filters.user_id,
        user_type: filters.user_type,
        start_date: filters.start_date,
        end_date: filters.end_date,
      });
      toast.success("Audit logs exported successfully");
    } catch {
      toast.error("Failed to export audit logs");
    } finally {
      setExporting(false);
    }
  };

  const handleRowClick = (log: AuditLog) => {
    setSelectedLog(log);
    setDetailOpen(true);
  };

  const hasActiveFilters =
    filters.table_name ||
    filters.action ||
    filters.user_type ||
    filters.start_date;

  const columns = [
    {
      key: "created_at",
      header: "Timestamp",
      render: (log: AuditLog) => (
        <span className="text-sm whitespace-nowrap">
          {new Date(log.created_at).toLocaleString()}
        </span>
      ),
    },
    {
      key: "action",
      header: "Action",
      render: (log: AuditLog) => (
        <Badge variant="secondary" className={actionColor(log.action)}>
          {log.action}
        </Badge>
      ),
    },
    {
      key: "table_name",
      header: "Resource",
      render: (log: AuditLog) => (
        <span className="capitalize">{log.table_name.replace(/_/g, " ")}</span>
      ),
    },
    {
      key: "record_id",
      header: "Record",
      render: (log: AuditLog) =>
        log.record_id === 0 ? (
          <span className="text-xs text-muted-foreground">N/A</span>
        ) : (
          <span className="font-mono text-sm">#{log.record_id}</span>
        ),
    },
    {
      key: "user_id",
      header: "User",
      render: (log: AuditLog) => (
        <div className="text-sm">
          <span>{log.user_id ?? "System"}</span>
          {log.user_type && (
            <span className="text-muted-foreground ml-1 capitalize">
              ({log.user_type})
            </span>
          )}
        </div>
      ),
    },
    {
      key: "ip_address",
      header: "IP",
      className: "hidden md:table-cell",
      render: (log: AuditLog) => (
        <span className="font-mono text-xs">{log.ip_address ?? "-"}</span>
      ),
    },
  ];

  return (
    <AuthGuard requiredPermission={PermissionCodes.AUDIT_LOGS_VIEW}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
              <ScrollText className="h-6 w-6 sm:h-7 sm:w-7" />
              Audit Logs
            </h1>
            <p className="text-sm text-muted-foreground">
              View system activity and changes
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={exporting}
          >
            <Download className="mr-2 h-4 w-4" />
            {exporting ? "Exporting..." : "Export CSV"}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 md:flex-row md:items-end md:flex-wrap">
          <div className="w-full space-y-1 md:w-40">
            <label className="text-sm font-medium">Resource</label>
            <Select
              value={filters.table_name || "all"}
              onValueChange={(v) =>
                handleFilterChange("table_name", v === "all" ? undefined : v)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All resources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All resources</SelectItem>
                {TABLE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full space-y-1 md:w-40">
            <label className="text-sm font-medium">Action</label>
            <Select
              value={filters.action || "all"}
              onValueChange={(v) =>
                handleFilterChange("action", v === "all" ? undefined : v)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actions</SelectItem>
                {ACTION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full space-y-1 md:w-36">
            <label className="text-sm font-medium">User Type</label>
            <Select
              value={filters.user_type || "all"}
              onValueChange={(v) =>
                handleFilterChange("user_type", v === "all" ? undefined : v)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {USER_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full space-y-1 md:w-auto">
            <label className="text-sm font-medium">Date Range</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal md:w-[260px]"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "MMM d, yyyy")} -{" "}
                        {format(dateRange.to, "MMM d, yyyy")}
                      </>
                    ) : (
                      format(dateRange.from, "MMM d, yyyy")
                    )
                  ) : (
                    <span className="text-muted-foreground">Pick dates</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={handleDateRangeChange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="gap-1"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>

        {/* Active filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Active filters:
            </span>
            {filters.table_name && (
              <Badge variant="secondary" className="gap-1 pr-1">
                {filters.table_name.replace(/_/g, " ")}
                <button
                  onClick={() => handleFilterChange("table_name", undefined)}
                  className="ml-1 hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.action && (
              <Badge variant="secondary" className="gap-1 pr-1">
                {filters.action}
                <button
                  onClick={() => handleFilterChange("action", undefined)}
                  className="ml-1 hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.user_type && (
              <Badge variant="secondary" className="gap-1 pr-1">
                {filters.user_type}
                <button
                  onClick={() => handleFilterChange("user_type", undefined)}
                  className="ml-1 hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.start_date && (
              <Badge variant="secondary" className="gap-1 pr-1">
                {filters.start_date}
                {filters.end_date ? ` - ${filters.end_date}` : ""}
                <button
                  onClick={() => {
                    setDateRange(undefined);
                    setFilters((prev) => ({
                      ...prev,
                      start_date: undefined,
                      end_date: undefined,
                      page: 1,
                    }));
                  }}
                  className="ml-1 hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}

        {/* Data Table */}
        <DataTable
          data={auditLogs}
          columns={columns}
          pagination={pagination}
          onPageChange={(page) =>
            setFilters((prev) => ({ ...prev, page }))
          }
          onPerPageChange={(per_page) =>
            setFilters((prev) => ({ ...prev, per_page, page: 1 }))
          }
          isLoading={isLoading}
          emptyMessage="No audit logs found."
          onRowClick={handleRowClick}
        />

        {/* Detail Dialog */}
        <AuditLogDetail
          log={selectedLog}
          open={detailOpen}
          onOpenChange={setDetailOpen}
        />
      </div>
    </AuthGuard>
  );
}
