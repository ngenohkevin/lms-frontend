"use client";

import { useState } from "react";
import Link from "next/link";
import { useFines } from "@/lib/hooks/use-transactions";
import { transactionsApi } from "@/lib/api";
import { AuthGuard } from "@/components/auth/auth-guard";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  ArrowLeft,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Loader2,
  User,
  CreditCard,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import type { Fine } from "@/lib/types";
import { formatDate, formatCurrency } from "@/lib/utils/format";

export default function FinesPage() {
  const [activeTab, setActiveTab] = useState<"all" | "unpaid" | "paid">("all");
  const [page, setPage] = useState(1);
  const [actionFine, setActionFine] = useState<Fine | null>(null);
  const [actionType, setActionType] = useState<"pay" | "waive" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { fines, pagination, isLoading, refresh } = useFines({
    page,
    per_page: 20,
    paid: activeTab === "paid" ? true : activeTab === "unpaid" ? false : undefined,
  });

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as "all" | "unpaid" | "paid");
    setPage(1);
  };

  const handlePayFine = async () => {
    if (!actionFine) return;

    setIsProcessing(true);
    try {
      await transactionsApi.fines.pay(actionFine.transaction_id);
      toast.success("Fine marked as paid");
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to process payment");
    } finally {
      setIsProcessing(false);
      setActionFine(null);
      setActionType(null);
    }
  };

  const handleWaiveFine = async () => {
    if (!actionFine) return;

    setIsProcessing(true);
    try {
      await transactionsApi.fines.waive(actionFine.id);
      toast.success("Fine waived successfully");
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to waive fine");
    } finally {
      setIsProcessing(false);
      setActionFine(null);
      setActionType(null);
    }
  };

  // Calculate summary stats from current page (ideally from API totals)
  const unpaidFines = fines.filter((f) => !f.paid);
  const paidFines = fines.filter((f) => f.paid);
  const totalUnpaid = unpaidFines.reduce((sum, f) => sum + f.amount, 0);
  const totalPaid = paidFines.reduce((sum, f) => sum + f.amount, 0);

  const columns = [
    {
      key: "status",
      header: "Status",
      render: (fine: Fine) => (
        <Badge
          variant={fine.paid ? "outline" : "destructive"}
          className={fine.paid ? "bg-green-50 text-green-700 border-green-200" : ""}
        >
          {fine.paid ? (
            <>
              <CheckCircle className="h-3 w-3 mr-1" />
              Paid
            </>
          ) : (
            <>
              <AlertTriangle className="h-3 w-3 mr-1" />
              Unpaid
            </>
          )}
        </Badge>
      ),
    },
    {
      key: "student",
      header: "Student",
      render: (fine: Fine) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">Student #{fine.student_id}</p>
            <p className="text-xs text-muted-foreground">
              Transaction #{fine.transaction_id}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (fine: Fine) => (
        <span className={`font-bold ${fine.paid ? "text-green-600" : "text-destructive"}`}>
          {formatCurrency(fine.amount)}
        </span>
      ),
    },
    {
      key: "reason",
      header: "Reason",
      render: (fine: Fine) => (
        <span className="text-sm text-muted-foreground line-clamp-1">
          {fine.reason || "Overdue return"}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Created",
      render: (fine: Fine) => (
        <span className="text-sm">{formatDate(fine.created_at)}</span>
      ),
    },
    {
      key: "paid_at",
      header: "Paid At",
      render: (fine: Fine) =>
        fine.paid_at ? (
          <span className="text-sm text-green-600">{formatDate(fine.paid_at)}</span>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        ),
    },
    {
      key: "actions",
      header: "",
      render: (fine: Fine) =>
        !fine.paid && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setActionFine(fine);
                setActionType("pay");
              }}
            >
              <CreditCard className="h-4 w-4 mr-1" />
              Pay
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setActionFine(fine);
                setActionType("waive");
              }}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Waive
            </Button>
          </div>
        ),
    },
  ];

  return (
    <AuthGuard requiredRoles={["admin", "librarian"]}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/transactions">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <DollarSign className="h-8 w-8 text-amber-600" />
              Fine Management
            </h1>
            <p className="text-muted-foreground">
              Track and manage library fines
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
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
                  <CardTitle className="text-sm font-medium">
                    Total Fines
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {pagination?.total || fines.length}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-amber-500/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Outstanding
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600">
                    {formatCurrency(totalUnpaid)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {unpaidFines.length} unpaid fines
                  </p>
                </CardContent>
              </Card>
              <Card className="border-green-500/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Collected
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(totalPaid)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {paidFines.length} paid fines
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Fines Table */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="all">All Fines</TabsTrigger>
            <TabsTrigger value="unpaid">Unpaid</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <DataTable
              data={fines}
              columns={columns}
              pagination={pagination}
              onPageChange={setPage}
              isLoading={isLoading}
              emptyMessage="No fines found."
            />
          </TabsContent>
        </Tabs>

        {/* Confirmation Dialogs */}
        <AlertDialog
          open={actionType === "pay" && !!actionFine}
          onOpenChange={(open) => {
            if (!open) {
              setActionFine(null);
              setActionType(null);
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Mark Fine as Paid</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to mark this fine of{" "}
                <strong>{actionFine && formatCurrency(actionFine.amount)}</strong> as
                paid?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handlePayFine} disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm Payment"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog
          open={actionType === "waive" && !!actionFine}
          onOpenChange={(open) => {
            if (!open) {
              setActionFine(null);
              setActionType(null);
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Waive Fine</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to waive this fine of{" "}
                <strong>{actionFine && formatCurrency(actionFine.amount)}</strong>?
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleWaiveFine}
                disabled={isProcessing}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Waive Fine"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AuthGuard>
  );
}
