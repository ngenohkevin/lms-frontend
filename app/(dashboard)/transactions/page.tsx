"use client";

import { useState } from "react";
import Link from "next/link";
import { useTransactions, useTransactionStats } from "@/lib/hooks/use-transactions";
import { useAuth } from "@/providers/auth-provider";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeftRight,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
} from "lucide-react";
import type { Transaction, TransactionSearchParams, TransactionStatus } from "@/lib/types";
import { formatDate, formatRelativeTime, isOverdue, formatCurrency } from "@/lib/utils/format";

const statusColors: Record<TransactionStatus, string> = {
  active: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  returned: "bg-green-500/10 text-green-700 border-green-500/20",
  overdue: "bg-red-500/10 text-red-700 border-red-500/20",
  lost: "bg-gray-500/10 text-gray-700 border-gray-500/20",
};

export default function TransactionsPage() {
  const { isLibrarian, user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [params, setParams] = useState<TransactionSearchParams>({
    page: 1,
    per_page: 20,
    student_id: !isLibrarian ? user?.student_id : undefined,
  });

  const { stats, isLoading: statsLoading } = useTransactionStats();
  const { transactions, pagination, isLoading, refresh } = useTransactions(params);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    let newParams: TransactionSearchParams = {
      page: 1,
      per_page: 20,
      student_id: !isLibrarian ? user?.student_id : undefined,
    };

    switch (tab) {
      case "active":
        newParams.status = "active";
        break;
      case "overdue":
        newParams.overdue = true;
        break;
      case "returned":
        newParams.status = "returned";
        break;
    }

    setParams(newParams);
  };

  const handleSearch = (query: string) => {
    setParams((prev) => ({ ...prev, query, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setParams((prev) => ({ ...prev, page }));
  };

  const columns = [
    {
      key: "book",
      header: "Book",
      render: (tx: Transaction) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-8 rounded bg-muted flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium line-clamp-1">{tx.book?.title || "Unknown"}</p>
            <p className="text-sm text-muted-foreground">{tx.book?.author}</p>
          </div>
        </div>
      ),
    },
    ...(isLibrarian
      ? [
          {
            key: "student",
            header: "Student",
            render: (tx: Transaction) => (
              <div>
                <p className="font-medium">{tx.student?.name || "Unknown"}</p>
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
            {isLibrarian
              ? "Manage book borrowing and returns"
              : "View your borrowing history"}
          </p>
        </div>
        {isLibrarian && (
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/transactions/borrow">
                <ArrowLeftRight className="mr-2 h-4 w-4" />
                New Transaction
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      {isLibrarian && (
        <div className="grid gap-4 md:grid-cols-4">
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

      {/* Transactions Table */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
          <TabsTrigger value="returned">Returned</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <DataTable
            data={transactions || []}
            columns={columns}
            pagination={pagination}
            onPageChange={handlePageChange}
            onSearch={isLibrarian ? handleSearch : undefined}
            searchPlaceholder="Search by book title or student..."
            isLoading={isLoading}
            emptyMessage="No transactions found."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
