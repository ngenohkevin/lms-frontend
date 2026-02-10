"use client";

import { useState } from "react";
import Link from "next/link";
import { useTransactions, useTransactionStats } from "@/lib/hooks/use-transactions";
import { useAuth } from "@/providers/auth-provider";
import { usePermissions } from "@/providers/permission-provider";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { PermissionCodes } from "@/lib/types/permission";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeftRight,
  BookOpen,
  AlertTriangle,
  Clock,
  DollarSign,
} from "lucide-react";
import { BookCoverImage } from "@/components/books/book-cover-image";
import type { Transaction, TransactionSearchParams, TransactionStatus } from "@/lib/types";
import { formatDate, formatRelativeTime, isOverdue, formatCurrency } from "@/lib/utils/format";
import { TransactionDetailDialog } from "@/components/transactions/transaction-detail-dialog";
import { TransactionSearch } from "@/components/transactions/transaction-search";

const statusColors: Record<TransactionStatus, string> = {
  active: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  returned: "bg-green-500/10 text-green-700 border-green-500/20",
  overdue: "bg-red-500/10 text-red-700 border-red-500/20",
  lost: "bg-gray-500/10 text-gray-700 border-gray-500/20",
  cancelled: "bg-orange-500/10 text-orange-700 border-orange-500/20",
};

export default function TransactionsPage() {
  const { isStudent, user } = useAuth();
  const { hasPermission } = usePermissions();
  const canViewAll = hasPermission(PermissionCodes.STUDENTS_VIEW); // Can see all students' transactions
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [params, setParams] = useState<TransactionSearchParams>({
    page: 1,
    per_page: 20,
    student_id: !canViewAll && isStudent ? String(user?.id) : undefined,
  });

  const { stats, isLoading: statsLoading } = useTransactionStats();
  const { transactions, pagination, isLoading, refresh } = useTransactions(params);

  const handleSearch = (newParams: TransactionSearchParams) => {
    setParams({
      ...newParams,
      student_id: !canViewAll && isStudent ? String(user?.id) : newParams.student_id,
    });
  };

  const handlePageChange = (page: number) => {
    setParams((prev) => ({ ...prev, page }));
  };

  const handleRowClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDetailDialogOpen(true);
  };

  const columns = [
    {
      key: "book",
      header: "Book",
      render: (tx: Transaction) => (
        <div className="flex items-center gap-3">
          <BookCoverImage src={tx.book?.cover_url} alt={tx.book?.title || "Book"} />
          <div>
            <p className="font-medium line-clamp-1">{tx.book?.title || "Unknown"}</p>
            <p className="text-sm text-muted-foreground">{tx.book?.author}</p>
          </div>
        </div>
      ),
    },
    ...(canViewAll
      ? [
          {
            key: "student",
            header: "Student",
            render: (tx: Transaction) => (
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="font-medium">{tx.student?.name || "Unknown"}</p>
                  {tx.student?.is_deleted && (
                    <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-red-500/10 text-red-600 border-red-500/20" title={tx.student.deleted_by_name ? `Removed by ${tx.student.deleted_by_name}` : undefined}>
                      Removed
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {tx.student?.student_id}
                </p>
              </div>
            ),
          },
        ]
      : []),
    {
      key: "borrowed_at",
      header: "Borrowed",
      render: (tx: Transaction) => (
        <span className="text-sm">{formatDate(tx.borrowed_at)}</span>
      ),
    },
    {
      key: "due_date",
      header: "Due Date",
      render: (tx: Transaction) => {
        const overdue = tx.status === "active" && isOverdue(tx.due_date);
        return (
          <div>
            <span className={`text-sm ${overdue ? "text-destructive font-medium" : ""}`}>
              {formatDate(tx.due_date)}
            </span>
            {overdue && (
              <p className="text-xs text-destructive">
                {formatRelativeTime(tx.due_date)}
              </p>
            )}
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (tx: Transaction) => (
        <Badge
          variant="outline"
          className={statusColors[tx.status] || statusColors.active}
        >
          {tx.status}
        </Badge>
      ),
    },
    {
      key: "fine",
      header: "Fine",
      render: (tx: Transaction) => (
        <span
          className={`text-sm ${
            tx.fine_amount > 0 && !tx.fine_paid
              ? "text-destructive font-medium"
              : ""
          }`}
        >
          {tx.fine_amount > 0 ? formatCurrency(tx.fine_amount) : "-"}
          {tx.fine_amount > 0 && tx.fine_paid && (
            <span className="ml-1 text-green-600">(Paid)</span>
          )}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            {canViewAll
              ? "Manage book borrowing and returns"
              : "View your borrowing history"}
          </p>
        </div>
        <PermissionGuard permission={PermissionCodes.TRANSACTIONS_BORROW} hideWhenDenied>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button asChild className="flex-1 sm:flex-initial">
              <Link href="/transactions/borrow">
                <ArrowLeftRight className="mr-2 h-4 w-4" />
                New Transaction
              </Link>
            </Button>
          </div>
        </PermissionGuard>
      </div>

      {/* Stats Cards */}
      {canViewAll && (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.total_active || 0}
                  </div>
                </CardContent>
              </Card>
              <Card className={stats?.total_overdue && stats.total_overdue > 0 ? "border-destructive/50" : ""}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${stats?.total_overdue && stats.total_overdue > 0 ? "text-destructive" : ""}`}>
                    {stats?.total_overdue || 0}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Borrowed Today
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.total_borrowed_today || 0}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Unpaid Fines
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(stats?.total_unpaid_fines || 0)}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* Search and Filters */}
      {canViewAll && (
        <TransactionSearch
          onSearch={handleSearch}
          initialParams={params}
        />
      )}

      {/* Transactions Table */}
      <DataTable
        data={transactions || []}
        columns={columns}
        pagination={pagination}
        onPageChange={handlePageChange}
        onRowClick={handleRowClick}
        isLoading={isLoading}
        emptyMessage="No transactions found."
      />

      {/* Transaction Detail Dialog */}
      <TransactionDetailDialog
        transaction={selectedTransaction}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        onRefresh={refresh}
      />
    </div>
  );
}
