"use client";

import { useState, useCallback } from "react";
import { useSWRConfig } from "swr";
import { transactionsApi } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import { useRenewalEligibility } from "@/lib/hooks/use-transactions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  User,
  Calendar,
  RefreshCw,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Banknote,
  XCircle,
  AlertOctagon,
  Trash2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
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
  const { mutate: globalMutate } = useSWRConfig();
  const [isRenewing, setIsRenewing] = useState(false);
  const [renewalSuccess, setRenewalSuccess] = useState(false);
  const [newDueDate, setNewDueDate] = useState<string | null>(null);
  const [extensionDays, setExtensionDays] = useState<number | undefined>(undefined);
  const [appliedExtensionDays, setAppliedExtensionDays] = useState<number>(14);

  // Invalidate all transaction, book, and student caches to ensure data consistency
  const invalidateRelatedCaches = useCallback(async () => {
    await globalMutate(
      (key) =>
        typeof key === "string" &&
        (key.startsWith("/api/v1/transactions") ||
          key.startsWith("/api/v1/books") ||
          key.startsWith("/api/v1/students")),
      undefined,
      { revalidate: true }
    );
  }, [globalMutate]);

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  const [showLostDialog, setShowLostDialog] = useState(false);
  const [lostReason, setLostReason] = useState("");
  const [isMarkingLost, setIsMarkingLost] = useState(false);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showCancelRenewalDialog, setShowCancelRenewalDialog] = useState(false);
  const [cancelRenewalDate, setCancelRenewalDate] = useState("");
  const [isCancellingRenewal, setIsCancellingRenewal] = useState(false);

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

  const canCancel = () => {
    if (transaction.status !== "active") return false;
    const createdAt = new Date(transaction.created_at);
    const now = new Date();
    const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    return hoursSinceCreation <= 1;
  };

  const canMarkAsLost = () => {
    return transaction.status === "active" || transaction.status === "overdue";
  };

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
      const daysToExtend = extensionDays || 14;
      const result = await transactionsApi.renew(transaction.id, {
        librarian_id: user.id,
        extension_days: extensionDays,
      });
      // Store the actual new due date and extension days from the API response
      setNewDueDate(result.due_date);
      setAppliedExtensionDays(daysToExtend);
      setRenewalSuccess(true);
      toast.success("Book renewed successfully");
      refreshRenewalStatus();
      await invalidateRelatedCaches();
      onRefresh?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to renew book");
    } finally {
      setIsRenewing(false);
    }
  };

  const handleCancelRenewal = async () => {
    if (!transaction || !cancelRenewalDate) return;
    setIsCancellingRenewal(true);
    try {
      await transactionsApi.cancelRenewal(transaction.id, cancelRenewalDate);
      toast.success("Renewal cancelled successfully");
      setShowCancelRenewalDialog(false);
      setCancelRenewalDate("");
      setRenewalSuccess(false);
      setNewDueDate(null);
      setAppliedExtensionDays(14);
      await invalidateRelatedCaches();
      onRefresh?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel renewal");
    } finally {
      setIsCancellingRenewal(false);
    }
  };

  const handleCancel = async () => {
    if (!transaction || !cancelReason.trim()) return;
    setIsCancelling(true);
    try {
      await transactionsApi.cancel(transaction.id, cancelReason.trim());
      toast.success("Transaction cancelled successfully");
      setShowCancelDialog(false);
      setCancelReason("");
      await invalidateRelatedCaches();
      onRefresh?.();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel transaction");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleMarkAsLost = async () => {
    if (!transaction || !lostReason.trim()) return;
    setIsMarkingLost(true);
    try {
      await transactionsApi.markAsLost(transaction.id, lostReason.trim());
      toast.success("Transaction marked as lost");
      setShowLostDialog(false);
      setLostReason("");
      await invalidateRelatedCaches();
      onRefresh?.();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to mark as lost");
    } finally {
      setIsMarkingLost(false);
    }
  };

  const handleDelete = async () => {
    if (!transaction) return;
    setIsDeleting(true);
    try {
      await transactionsApi.delete(transaction.id);
      toast.success("Transaction deleted successfully");
      setShowDeleteDialog(false);
      await invalidateRelatedCaches();
      onRefresh?.();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete transaction");
    } finally {
      setIsDeleting(false);
    }
  };

  const getCancelTimeRemaining = () => {
    if (!transaction) return null;
    const createdAt = new Date(transaction.created_at);
    const deadline = new Date(createdAt.getTime() + 60 * 60 * 1000);
    const now = new Date();
    const remaining = deadline.getTime() - now.getTime();
    if (remaining <= 0) return null;
    const minutes = Math.floor(remaining / (1000 * 60));
    return `${minutes}m left`;
  };

  const getCancelExpiredMessage = () => {
    if (!transaction?.created_at) return "Cancel period expired";
    const createdAt = new Date(transaction.created_at);
    // Check for invalid date
    if (isNaN(createdAt.getTime())) return "Cancel period expired";
    const hoursAgo = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60));
    if (hoursAgo < 24) {
      return `Cancel period expired (${hoursAgo}h ago)`;
    }
    return `Cancel period expired (${Math.floor(hoursAgo / 24)}d ago)`;
  };

  const renewalCount = transaction.renewal_count ?? transaction.renewed_count ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              Transaction #{transaction.id}
              <Badge variant="outline" className={getStatusColor(transaction.status)}>
                {transaction.status}
              </Badge>
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          {/* Book & Student - Compact */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <BookOpen className="h-3.5 w-3.5" />
                <span className="text-xs">Book</span>
              </div>
              <p className="font-medium leading-tight line-clamp-2">
                {transaction.book?.title || "Unknown"}
              </p>
              <p className="text-xs text-muted-foreground">
                {transaction.book?.author}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <User className="h-3.5 w-3.5" />
                <span className="text-xs">Student</span>
              </div>
              <p className="font-medium leading-tight">
                {transaction.student?.name || "Unknown"}
              </p>
              <p className="text-xs text-muted-foreground">
                {transaction.student?.student_id}
              </p>
            </div>
          </div>

          <Separator />

          {/* Dates - Compact Row */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
                <Calendar className="h-3 w-3" />
                <span className="text-xs">Borrowed</span>
              </div>
              <p className="font-medium text-xs">
                {formatDate(transaction.borrowed_at)}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
                <Clock className="h-3 w-3" />
                <span className="text-xs">Due</span>
              </div>
              <p className={`font-medium text-xs ${isOverdue ? "text-destructive" : ""}`}>
                {formatDate(transaction.due_date)}
              </p>
            </div>
            {transaction.returned_at ? (
              <div>
                <div className="flex items-center gap-1 text-green-600 mb-0.5">
                  <CheckCircle className="h-3 w-3" />
                  <span className="text-xs">Returned</span>
                </div>
                <p className="font-medium text-xs text-green-600">
                  {formatDate(transaction.returned_at)}
                </p>
              </div>
            ) : isOverdue ? (
              <div>
                <div className="flex items-center gap-1 text-destructive mb-0.5">
                  <AlertTriangle className="h-3 w-3" />
                  <span className="text-xs">Overdue</span>
                </div>
                <p className="font-medium text-xs text-destructive">
                  {daysOverdue} days
                </p>
              </div>
            ) : renewalCount > 0 ? (
              <div>
                <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
                  <RefreshCw className="h-3 w-3" />
                  <span className="text-xs">Renewed</span>
                </div>
                <p className="font-medium text-xs">
                  {renewalCount}x
                </p>
              </div>
            ) : null}
          </div>

          {/* Fine Info - Compact */}
          {(transaction.fine_amount > 0 || (isOverdue && !transaction.returned_at)) && (
            <div className="flex items-center justify-between rounded-md bg-amber-50 dark:bg-amber-950 px-3 py-2">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                <Banknote className="h-4 w-4" />
                <span>Fine</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-amber-800 dark:text-amber-200">
                  {formatCurrency(transaction.fine_amount || estimatedFine)}
                </span>
                {transaction.fine_amount > 0 && (
                  <Badge variant={transaction.fine_paid ? "outline" : "destructive"} className="text-xs">
                    {transaction.fine_paid ? "Paid" : "Unpaid"}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Renewal Section - Only for active */}
          {isActiveTransaction && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium flex items-center gap-1.5">
                    <RefreshCw className="h-4 w-4" />
                    Renew Book
                  </h4>
                  {renewalCount > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground">
                          Renewed {renewalCount}x
                        </span>
                        {transaction.last_renewed_at && (
                          <p className="text-xs text-muted-foreground">
                            Last: {formatDate(transaction.last_renewed_at)}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCancelRenewalDialog(true)}
                        className="h-6 px-2 text-xs text-orange-600 hover:text-orange-700"
                      >
                        Undo
                      </Button>
                    </div>
                  )}
                </div>

                {isCheckingRenewal ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Checking eligibility...
                  </div>
                ) : renewalSuccess ? (
                  <Alert className="bg-green-50 dark:bg-green-950 border-green-200 py-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 dark:text-green-200 text-xs">
                      Renewed! Extended by {appliedExtensionDays} {appliedExtensionDays === 1 ? "day" : "days"}. New due: {newDueDate ? formatDate(newDueDate) : formatDate(calculateNewDueDate(transaction.due_date, extensionDays || 14))}
                    </AlertDescription>
                  </Alert>
                ) : canRenew ? (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 flex-1">
                      <Input
                        type="number"
                        min={1}
                        max={90}
                        placeholder="14"
                        value={extensionDays ?? ""}
                        onChange={(e) => setExtensionDays(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                        className="w-16 h-8 text-sm"
                      />
                      <span className="text-xs text-muted-foreground">days</span>
                      <span className="text-xs text-muted-foreground mx-1">→</span>
                      <span className="text-xs font-medium">
                        {formatDate(calculateNewDueDate(transaction.due_date, extensionDays || 14))}
                      </span>
                    </div>
                    <Button size="sm" onClick={handleRenew} disabled={isRenewing} className="h-8">
                      {isRenewing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Renew"}
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-destructive py-1">
                    {renewalReason || "Cannot renew this book"}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Notes - Compact */}
          {transaction.notes && (
            <>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Notes</p>
                <p className="text-xs">{transaction.notes}</p>
              </div>
            </>
          )}

          {/* Actions - Compact Row */}
          <Separator />
          <div className="flex items-center gap-2">
            {isActiveTransaction && (
              <>
                {canCancel() ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCancelDialog(true)}
                    className="h-8 text-orange-600 border-orange-200 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-800"
                  >
                    <XCircle className="mr-1.5 h-3.5 w-3.5" />
                    Cancel
                    <span className="ml-1 text-xs opacity-70">({getCancelTimeRemaining()})</span>
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {getCancelExpiredMessage()}
                  </span>
                )}
                {canMarkAsLost() && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowLostDialog(true)}
                    className="h-8 text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800"
                  >
                    <AlertOctagon className="mr-1.5 h-3.5 w-3.5" />
                    Mark Lost
                  </Button>
                )}
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="h-8 text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 ml-auto"
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Cancel Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-orange-500" />
              Cancel Transaction
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel the borrowing of &quot;{transaction.book?.title}&quot; and
              return the book to available status.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="cancel-reason">Reason *</Label>
            <Textarea
              id="cancel-reason"
              placeholder="Enter reason..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={2}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Keep</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={isCancelling || !cancelReason.trim()}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isCancelling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Cancel Transaction
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Lost Dialog */}
      <AlertDialog open={showLostDialog} onOpenChange={setShowLostDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertOctagon className="h-5 w-5 text-red-500" />
              Mark as Lost
            </AlertDialogTitle>
            <AlertDialogDescription>
              A replacement fine will be applied to the student&apos;s account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="lost-reason">Reason *</Label>
            <Textarea
              id="lost-reason"
              placeholder="Describe circumstances..."
              value={lostReason}
              onChange={(e) => setLostReason(e.target.value)}
              rows={2}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isMarkingLost}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleMarkAsLost}
              disabled={isMarkingLost || !lostReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {isMarkingLost ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Mark as Lost
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Delete Transaction
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
              {transaction.fine_amount > 0 && !transaction.fine_paid && (
                <span className="block mt-2 text-amber-600">
                  Note: This transaction has an unpaid fine of {formatCurrency(transaction.fine_amount)}.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Renewal Dialog */}
      <AlertDialog open={showCancelRenewalDialog} onOpenChange={setShowCancelRenewalDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-orange-500" />
              Cancel Renewal
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will undo the last renewal and set a new due date for &quot;{transaction.book?.title}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="new-due-date">New Due Date *</Label>
            <Input
              id="new-due-date"
              type="date"
              value={cancelRenewalDate}
              onChange={(e) => setCancelRenewalDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancellingRenewal}>Keep Renewal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelRenewal}
              disabled={isCancellingRenewal || !cancelRenewalDate}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isCancellingRenewal ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Cancel Renewal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}

export default TransactionDetailDialog;
