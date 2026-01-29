"use client";

import { useState } from "react";
import useSWR from "swr";
import { useAuth } from "@/providers/auth-provider";
import { finesApi } from "@/lib/api";
import type { FineStatistics, StudentWithHighFines } from "@/lib/api/fines";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  RefreshCw,
} from "lucide-react";
import type { Fine, PaginatedResponse } from "@/lib/types";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import { toast } from "sonner";

export default function FinesPage() {
  const { isLibrarian, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<"all" | "unpaid" | "paid">("unpaid");
  const [page, setPage] = useState(1);
  const [selectedFine, setSelectedFine] = useState<Fine | null>(null);
  const [actionType, setActionType] = useState<"pay" | "waive" | null>(null);
  const [waiveReason, setWaiveReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Get filter based on active tab
  const getPaidFilter = () => {
    if (activeTab === "unpaid") return false;
    if (activeTab === "paid") return true;
    return undefined;
  };

  // Fetch fines
  const { data: finesData, error: finesError, isLoading: finesLoading, mutate: refreshFines } = useSWR<PaginatedResponse<Fine>>(
    ["/api/v1/fines", { paid: getPaidFilter(), page, limit: 20 }],
    () => finesApi.list({ paid: getPaidFilter(), page, limit: 20 })
  );

  // Fetch statistics
  const { data: stats, mutate: refreshStats } = useSWR<FineStatistics>(
    "/api/v1/fines/statistics",
    () => finesApi.getStatistics()
  );

  // Fetch students with high fines
  const { data: highFineStudents } = useSWR<StudentWithHighFines[]>(
    "/api/v1/fines/high-fines",
    () => finesApi.getStudentsWithHighFines(50) // $50 threshold
  );

  const fines = finesData?.data || [];
  const pagination = finesData?.pagination;

  const handlePayFine = async () => {
    if (!selectedFine) return;
    setIsProcessing(true);
    try {
      await finesApi.pay(selectedFine.id);
      toast.success("Fine paid successfully");
      refreshFines();
      refreshStats();
      setSelectedFine(null);
      setActionType(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to pay fine");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWaiveFine = async () => {
    if (!selectedFine) return;
    setIsProcessing(true);
    try {
      await finesApi.waive(selectedFine.id, waiveReason);
      toast.success("Fine waived successfully");
      refreshFines();
      refreshStats();
      setSelectedFine(null);
      setActionType(null);
      setWaiveReason("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to waive fine");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCalculateFines = async () => {
    setIsProcessing(true);
    try {
      const result = await finesApi.calculateFines();
      toast.success(`Fine calculation complete. ${result.processed} transactions processed.`);
      refreshFines();
      refreshStats();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to calculate fines");
    } finally {
      setIsProcessing(false);
    }
  };

  const columns = [
    {
      key: "student",
      header: "Student",
      render: (fine: Fine) => (
        <div>
          <p className="font-medium">Student #{fine.student_id}</p>
        </div>
      ),
    },
    {
      key: "transaction",
      header: "Transaction",
      render: (fine: Fine) => (
        <span className="text-sm text-muted-foreground">#{fine.transaction_id}</span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (fine: Fine) => (
        <span className="font-semibold text-red-600">
          {formatCurrency(fine.amount)}
        </span>
      ),
    },
    {
      key: "reason",
      header: "Reason",
      render: (fine: Fine) => (
        <span className="text-sm">{fine.reason}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (fine: Fine) => (
        <Badge
          variant="outline"
          className={
            fine.paid
              ? "bg-green-500/10 text-green-700 border-green-500/20"
              : "bg-red-500/10 text-red-700 border-red-500/20"
          }
        >
          {fine.paid ? (
            <>
              <CheckCircle className="mr-1 h-3 w-3" />
              Paid
            </>
          ) : (
            <>
              <XCircle className="mr-1 h-3 w-3" />
              Unpaid
            </>
          )}
        </Badge>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (fine: Fine) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(fine.created_at)}
        </span>
      ),
    },
    ...(isLibrarian
      ? [
          {
            key: "actions",
            header: "Actions",
            render: (fine: Fine) => (
              <div className="flex gap-2">
                {!fine.paid && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedFine(fine);
                        setActionType("pay");
                      }}
                    >
                      Pay
                    </Button>
                    {isAdmin && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedFine(fine);
                          setActionType("waive");
                        }}
                      >
                        Waive
                      </Button>
                    )}
                  </>
                )}
              </div>
            ),
          },
        ]
      : []),
  ];

  if (!isLibrarian) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Access Restricted
            </CardTitle>
            <CardDescription>
              Fine management is only available to librarians and administrators.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fine Management</h1>
          <p className="text-muted-foreground">
            Manage library fines, payments, and waivers
          </p>
        </div>
        {isAdmin && (
          <Button onClick={handleCalculateFines} disabled={isProcessing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isProcessing ? "animate-spin" : ""}`} />
            Calculate Fines
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fines</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.total_fines_amount || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.total_fines_count || 0} fines total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unpaid</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats?.unpaid_fines_amount || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.unpaid_fines_count || 0} unpaid fines
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collected</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats?.paid_fines_amount || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.paid_fines_count || 0} paid fines
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.fine_per_day || 0)}
            </div>
            <p className="text-xs text-muted-foreground">per day overdue</p>
          </CardContent>
        </Card>
      </div>

      {/* Students with High Fines Alert */}
      {highFineStudents && highFineStudents.length > 0 && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <Users className="h-5 w-5" />
              Students with High Fines
            </CardTitle>
            <CardDescription>
              {highFineStudents.length} student(s) have unpaid fines exceeding $50
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-3">
              {highFineStudents.slice(0, 6).map((student) => (
                <div
                  key={student.student_id}
                  className="flex justify-between items-center p-2 rounded-md bg-background"
                >
                  <span className="font-medium">{student.student_name}</span>
                  <span className="text-red-600 font-semibold">
                    {formatCurrency(student.total_unpaid)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fines Table */}
      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as typeof activeTab); setPage(1); }}>
            <TabsList>
              <TabsTrigger value="unpaid">Unpaid</TabsTrigger>
              <TabsTrigger value="paid">Paid</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {finesError ? (
            <div className="text-center py-8 text-red-500">
              Error loading fines: {finesError.message}
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={fines}
              isLoading={finesLoading}
              pagination={pagination}
              onPageChange={setPage}
              emptyMessage="No fines found"
            />
          )}
        </CardContent>
      </Card>

      {/* Pay Fine Dialog */}
      <AlertDialog open={actionType === "pay"} onOpenChange={() => { setActionType(null); setSelectedFine(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Payment</AlertDialogTitle>
            <AlertDialogDescription>
              Mark this fine of {formatCurrency(selectedFine?.amount || 0)} as paid?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePayFine} disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Confirm Payment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Waive Fine Dialog */}
      <AlertDialog open={actionType === "waive"} onOpenChange={() => { setActionType(null); setSelectedFine(null); setWaiveReason(""); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Waive Fine</AlertDialogTitle>
            <AlertDialogDescription>
              Waive this fine of {formatCurrency(selectedFine?.amount || 0)}?
              This action requires a reason and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="reason">Reason for waiving</Label>
            <Input
              id="reason"
              placeholder="Enter reason..."
              value={waiveReason}
              onChange={(e) => setWaiveReason(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleWaiveFine}
              disabled={isProcessing || !waiveReason.trim()}
            >
              {isProcessing ? "Processing..." : "Waive Fine"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
