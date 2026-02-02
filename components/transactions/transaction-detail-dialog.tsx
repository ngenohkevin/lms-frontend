"use client";

import { useState } from "react";
import { transactionsApi } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import { useRenewalEligibility } from "@/lib/hooks/use-transactions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  BookOpen,
  User,
  Calendar,
  RefreshCw,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Hash,
  ScanLine,
} from "lucide-react";
import { toast } from "sonner";
import type { Transaction } from "@/lib/types";

interface TransactionDetailDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh?: () => void;
}

function getStatusColor(status: string): string {
  switch (status) {
    case "active":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "overdue":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "returned":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "lost":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
}

function getConditionColor(condition: string): string {
  switch (condition) {
    case "excellent":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "good":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "fair":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "poor":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    case "damaged":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function calculateDaysOverdue(dueDate: string): number {
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

function calculateNewDueDate(currentDueDate: string, days: number = 14): string {
  const due = new Date(currentDueDate);
  const today = new Date();
  // If already overdue, calculate from today instead
  const baseDate = due > today ? due : today;
  const newDue = new Date(baseDate);
  newDue.setDate(newDue.getDate() + days);
  return newDue.toISOString();
}

export function TransactionDetailDialog({
  transaction,
  open,
  onOpenChange,
  onRefresh,
}: TransactionDetailDialogProps) {
  const { user } = useAuth();
  const [isRenewing, setIsRenewing] = useState(false);
  const [renewalSuccess, setRenewalSuccess] = useState(false);

  // Only check renewal eligibility for active transactions
  const isActiveTransaction =
    transaction?.status === "active" || transaction?.status === "overdue";
  const {
    canRenew,
    reason: renewalReason,
    isLoading: isCheckingRenewal,
    refresh: refreshRenewalStatus,
  } = useRenewalEligibility(
    isActiveTransaction && transaction ? transaction.id : null
  );

  if (!transaction) return null;

  const daysOverdue =
    !transaction.returned_at && transaction.due_date
      ? calculateDaysOverdue(transaction.due_date)
      : 0;
  const isOverdue = daysOverdue > 0;
  const estimatedFine = daysOverdue * 0.5;

  const handleRenew = async () => {
    if (!transaction || !user) return;

    setIsRenewing(true);
    try {
      await transactionsApi.renew(transaction.id, {
        librarian_id: user.id,
      });

      setRenewalSuccess(true);
      toast.success("Book renewed successfully");
      refreshRenewalStatus();
      onRefresh?.();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to renew book"
      );
    } finally {
      setIsRenewing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Transaction Details
            <Badge variant="outline" className={getStatusColor(transaction.status)}>
              {transaction.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Transaction #{transaction.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Book Info */}
          <div className="rounded-lg border p-4">
            <div className="flex items-start gap-4">
              <div className="h-14 w-11 rounded bg-muted flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">{transaction.book?.title || "Unknown Book"}</p>
                <p className="text-sm text-muted-foreground">
                  {transaction.book?.author || "Unknown Author"}
                </p>
                {transaction.book?.isbn && (
                  <p className="text-xs text-muted-foreground font-mono mt-1">
                    ISBN: {transaction.book.isbn}
                  </p>
                )}
              </div>
            </div>

            {/* Copy Details */}
            {(transaction.copy_id || transaction.copy_barcode) && (
              <div className="mt-3 pt-3 border-t">
                <div className="flex items-center gap-4 text-sm">
                  {transaction.copy_number && (
                    <div className="flex items-center gap-1">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <span>Copy {transaction.copy_number}</span>
                    </div>
                  )}
                  {transaction.copy_barcode && (
                    <div className="flex items-center gap-1">
                      <ScanLine className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono">{transaction.copy_barcode}</span>
                    </div>
                  )}
                  {transaction.copy_condition && (
                    <Badge
                      variant="outline"
                      className={getConditionColor(transaction.copy_condition)}
                    >
                      {transaction.copy_condition}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Student Info */}
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium">
                  {transaction.student?.name || "Unknown Student"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {transaction.student?.student_id}
                  {transaction.student?.email && ` • ${transaction.student.email}`}
                </p>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                Borrowed
              </div>
              <p className="font-medium text-sm">
                {formatDateTime(transaction.borrowed_at)}
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Clock className="h-4 w-4" />
                Due Date
              </div>
              <p className={`font-medium text-sm ${isOverdue ? "text-destructive" : ""}`}>
                {formatDate(transaction.due_date)}
                {isOverdue && (
                  <span className="block text-xs mt-1">
                    {daysOverdue} days overdue
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Return Info (if returned) */}
          {transaction.returned_at && (
            <div className="rounded-lg border p-3 bg-green-50 dark:bg-green-950">
              <div className="flex items-center gap-2 text-sm text-green-800 dark:text-green-200 mb-1">
                <CheckCircle className="h-4 w-4" />
                Returned
              </div>
              <p className="font-medium text-sm text-green-800 dark:text-green-200">
                {formatDateTime(transaction.returned_at)}
              </p>
            </div>
          )}

          {/* Fine Info */}
          {(transaction.fine_amount > 0 || (isOverdue && !transaction.returned_at)) && (
            <div className="rounded-lg border p-3 bg-amber-50 dark:bg-amber-950">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-200">
                  <DollarSign className="h-4 w-4" />
                  Fine
                </div>
                <div className="text-right">
                  {transaction.fine_amount > 0 ? (
                    <>
                      <p className="font-medium text-amber-800 dark:text-amber-200">
                        ${transaction.fine_amount.toFixed(2)}
                      </p>
                      <Badge
                        variant={transaction.fine_paid ? "outline" : "destructive"}
                        className="mt-1"
                      >
                        {transaction.fine_paid ? "Paid" : "Unpaid"}
                      </Badge>
                    </>
                  ) : (
                    <p className="font-medium text-amber-800 dark:text-amber-200">
                      Est. ${estimatedFine.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Renewal Section (only for active transactions) */}
          {isActiveTransaction && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Renewal
                </h4>

                {isCheckingRenewal ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Checking renewal eligibility...
                  </div>
                ) : renewalSuccess ? (
                  <Alert className="bg-green-50 dark:bg-green-950 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      Renewal successful! New due date:{" "}
                      {formatDate(calculateNewDueDate(transaction.due_date))}
                    </AlertDescription>
                  </Alert>
                ) : canRenew ? (
                  <div className="space-y-3">
                    <div className="rounded-lg border p-3 bg-muted/30">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">New Due Date:</span>
                        <span className="font-medium">
                          {formatDate(calculateNewDueDate(transaction.due_date))}
                        </span>
                      </div>
                      {transaction.renewed_count > 0 && (
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-muted-foreground">
                            Times Renewed:
                          </span>
                          <span>{transaction.renewed_count}</span>
                        </div>
                      )}
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleRenew}
                      disabled={isRenewing}
                    >
                      {isRenewing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Renewing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Renew Book
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{renewalReason || "Cannot renew"}</AlertDescription>
                  </Alert>
                )}
              </div>
            </>
          )}

          {/* Notes */}
          {transaction.notes && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Notes</p>
                <p className="text-sm">{transaction.notes}</p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default TransactionDetailDialog;
