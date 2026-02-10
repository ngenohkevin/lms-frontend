"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useOverdueTransactions } from "@/lib/hooks/use-transactions";
import { AuthGuard } from "@/components/auth/auth-guard";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  AlertTriangle,
  User,
  DollarSign,
  Clock,
  Mail,
} from "lucide-react";
import { BookCoverImage } from "@/components/books/book-cover-image";
import type { OverdueTransaction } from "@/lib/types";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import { TransactionDetailDialog } from "@/components/transactions/transaction-detail-dialog";

function getSeverityColor(daysOverdue: number): string {
  if (daysOverdue >= 30) {
    return "bg-red-600 text-white";
  } else if (daysOverdue >= 14) {
    return "bg-red-500/80 text-white";
  } else if (daysOverdue >= 7) {
    return "bg-orange-500 text-white";
  } else {
    return "bg-yellow-500 text-yellow-950";
  }
}

function getSeverityLabel(daysOverdue: number): string {
  if (daysOverdue >= 30) {
    return "Critical";
  } else if (daysOverdue >= 14) {
    return "High";
  } else if (daysOverdue >= 7) {
    return "Medium";
  } else {
    return "Low";
  }
}

export default function OverdueTransactionsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState<OverdueTransaction | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const { overdueTransactions, pagination, isLoading, refresh } =
    useOverdueTransactions({
      page,
      per_page: 20,
    });

  const handleRowClick = (transaction: OverdueTransaction) => {
    setSelectedTransaction(transaction);
    setDetailDialogOpen(true);
  };

  // Calculate summary stats
  const totalOverdue = pagination?.total || overdueTransactions.length;
  const totalEstimatedFines = overdueTransactions.reduce(
    (sum, tx) => sum + (tx.calculated_fine || tx.days_overdue * 50),
    0
  );
  const criticalCount = overdueTransactions.filter(
    (tx) => tx.days_overdue >= 30
  ).length;
  const avgDaysOverdue =
    overdueTransactions.length > 0
      ? Math.round(
          overdueTransactions.reduce((sum, tx) => sum + tx.days_overdue, 0) /
            overdueTransactions.length
        )
      : 0;

  const columns = [
    {
      key: "severity",
      header: "Severity",
      render: (tx: OverdueTransaction) => (
        <Badge className={getSeverityColor(tx.days_overdue)}>
          {getSeverityLabel(tx.days_overdue)}
        </Badge>
      ),
    },
    {
      key: "book",
      header: "Book",
      render: (tx: OverdueTransaction) => (
        <div className="flex items-center gap-3">
          <BookCoverImage src={tx.book?.cover_url} alt={tx.book?.title || "Book"} />
          <div>
            <p className="font-medium line-clamp-1">{tx.book?.title || "Unknown"}</p>
            <p className="text-sm text-muted-foreground">{tx.book?.author}</p>
          </div>
        </div>
      ),
    },
    {
      key: "student",
      header: "Student",
      render: (tx: OverdueTransaction) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-medium">{tx.student?.name || "Unknown"}</p>
              {tx.student?.is_deleted && (
                <Badge className="text-[10px] px-1 py-0 h-4 bg-red-500/10 text-red-600 border-red-500/20" title={tx.student.deleted_by_name ? `Removed by ${tx.student.deleted_by_name}` : undefined}>
                  Removed
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {tx.student?.student_id}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "due_date",
      header: "Due Date",
      render: (tx: OverdueTransaction) => (
        <span className="text-sm text-destructive font-medium">
          {formatDate(tx.due_date)}
        </span>
      ),
    },
    {
      key: "days_overdue",
      header: "Days Overdue",
      render: (tx: OverdueTransaction) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-destructive" />
          <span className="font-bold text-destructive">{tx.days_overdue}</span>
        </div>
      ),
    },
    {
      key: "fine",
      header: "Est. Fine",
      render: (tx: OverdueTransaction) => (
        <span className="font-medium text-amber-600 dark:text-amber-400">
          {formatCurrency(tx.calculated_fine || tx.days_overdue * 50)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (tx: OverdueTransaction) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            asChild
            onClick={(e) => e.stopPropagation()}
          >
            <Link href={`mailto:${tx.student?.email}?subject=Overdue Book: ${tx.book?.title}`}>
              <Mail className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AuthGuard requiredRoles={["admin", "librarian"]}>
      <div className="space-y-6">
        <Button
          variant="ghost"
          className="-ml-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            Overdue Books
          </h1>
          <p className="text-muted-foreground">
            Monitor and manage overdue transactions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          {isLoading ? (
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
              <Card className="border-destructive/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Overdue
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">
                    {totalOverdue}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Critical (30+ days)
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {criticalCount}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Est. Total Fines
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-amber-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600">
                    {formatCurrency(totalEstimatedFines)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Avg. Days Overdue
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{avgDaysOverdue}</div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Overdue Table */}
        <DataTable
          data={overdueTransactions}
          columns={columns}
          pagination={pagination}
          onPageChange={setPage}
          onRowClick={handleRowClick}
          isLoading={isLoading}
          emptyMessage="No overdue books found."
        />

        {/* Transaction Detail Dialog */}
        <TransactionDetailDialog
          transaction={selectedTransaction}
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          onRefresh={refresh}
        />
      </div>
    </AuthGuard>
  );
}
