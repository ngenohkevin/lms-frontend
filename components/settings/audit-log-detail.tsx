"use client";

import type { AuditLog } from "@/lib/types/audit-log";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AuditLogDetailProps {
  log: AuditLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

function formatJson(data: Record<string, unknown> | null) {
  if (!data) return null;
  return JSON.stringify(data, null, 2);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString();
}

export function AuditLogDetail({
  log,
  open,
  onOpenChange,
}: AuditLogDetailProps) {
  if (!log) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Audit Log #{log.id}
            <Badge className={actionColor(log.action)}>{log.action}</Badge>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-4 pr-4">
            {/* Metadata */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Resource</p>
                <p className="font-medium">{log.table_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Record ID</p>
                <p className="font-medium">
                  {log.record_id === 0 ? (
                    <span className="text-muted-foreground font-normal">N/A — no specific record</span>
                  ) : (
                    log.record_id
                  )}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">User ID</p>
                <p className="font-medium">{log.user_id ?? "System"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">User Type</p>
                <p className="font-medium capitalize">
                  {log.user_type ?? "N/A"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">IP Address</p>
                <p className="font-medium font-mono text-xs">
                  {log.ip_address ?? "N/A"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Timestamp</p>
                <p className="font-medium">{formatDate(log.created_at)}</p>
              </div>
            </div>

            {log.user_agent && (
              <div className="text-sm">
                <p className="text-muted-foreground">User Agent</p>
                <p className="font-mono text-xs break-all mt-1">
                  {log.user_agent}
                </p>
              </div>
            )}

            {/* Old Values */}
            {log.old_values && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Previous Values
                </p>
                <pre className="rounded-md border bg-muted/50 p-3 text-xs overflow-x-auto">
                  {formatJson(log.old_values)}
                </pre>
              </div>
            )}

            {/* New Values */}
            {log.new_values && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  New Values
                </p>
                <pre className="rounded-md border bg-muted/50 p-3 text-xs overflow-x-auto">
                  {formatJson(log.new_values)}
                </pre>
              </div>
            )}

            {!log.old_values && !log.new_values && (
              <p className="text-sm text-muted-foreground italic">
                No value changes recorded.
              </p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
