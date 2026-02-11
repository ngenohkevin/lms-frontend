"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { usePermissions } from "@/providers/permission-provider";
import { useStudent } from "@/lib/hooks/use-students";
import { useStudentTransactionHistory } from "@/lib/hooks/use-transactions";
import { useIndividualStudentReport } from "@/lib/hooks/use-reports";
import { studentsApi } from "@/lib/api";
import { AuthGuard } from "@/components/auth/auth-guard";
import { PermissionCodes } from "@/lib/types/permission";
import { SuspendDialog } from "@/components/students/suspend-dialog";
import { GraduateDialog } from "@/components/students/graduate-dialog";
import { AdminNotes } from "@/components/students/admin-notes";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Mail,
  Phone,
  GraduationCap,
  BookOpen,
  AlertTriangle,
  Ban,
  CheckCircle,
  Calendar,
  Loader2,
  Clock,
  RefreshCw,
  XCircle,
  RotateCcw,
  FileText,
  TrendingUp,
  Activity,
  BookMarked,
  DollarSign,
} from "lucide-react";
import { formatDate, formatCurrency, formatKsh, getInitials } from "@/lib/utils/format";
import { toast } from "sonner";
import type { StudentStatus } from "@/lib/types";

const statusConfig: Record<
  StudentStatus,
  { color: string; bg: string; dot: string }
> = {
  active: {
    color: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  suspended: {
    color: "text-red-700 dark:text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
    dot: "bg-red-500",
  },
  graduated: {
    color: "text-blue-700 dark:text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    dot: "bg-blue-500",
  },
  inactive: {
    color: "text-gray-700 dark:text-gray-400",
    bg: "bg-gray-500/10 border-gray-500/20",
    dot: "bg-gray-500",
  },
};

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAdmin } = useAuth();
  const { hasPermission } = usePermissions();
  const studentId = params.id as string;

  const { student, isLoading, error, refresh } = useStudent(studentId);
  const { transactions: transactionHistory, isLoading: isLoadingHistory } =
    useStudentTransactionHistory(studentId);
  const { report: studentReport, isLoading: isLoadingReport } =
    useIndividualStudentReport(studentId ? parseInt(studentId) : null);

  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showGraduateDialog, setShowGraduateDialog] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);

  const canSuspend = hasPermission(PermissionCodes.STUDENTS_SUSPEND);
  const canGraduate = hasPermission(PermissionCodes.STUDENTS_GRADUATE);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await studentsApi.delete(studentId);
      toast.success("Student deleted successfully");
      router.push("/students");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete student"
      );
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleReactivate = async () => {
    setIsReactivating(true);
    try {
      await studentsApi.reactivate(studentId);
      toast.success("Student reactivated successfully");
      refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to reactivate student"
      );
    } finally {
      setIsReactivating(false);
    }
  };

  if (isLoading) {
    return (
      <AuthGuard requiredRoles={["admin", "librarian"]}>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-80 rounded-xl" />
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Skeleton className="h-28 rounded-xl" />
                <Skeleton className="h-28 rounded-xl" />
                <Skeleton className="h-28 rounded-xl" />
                <Skeleton className="h-28 rounded-xl" />
              </div>
              <Skeleton className="h-40 rounded-xl" />
              <Skeleton className="h-64 rounded-xl" />
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (error || !student) {
    return (
      <AuthGuard requiredRoles={["admin", "librarian"]}>
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="text-xl font-semibold">Student not found</h2>
          <p className="text-muted-foreground mt-2">
            The student you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Button asChild className="mt-4">
            <Link href="/students">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Students
            </Link>
          </Button>
        </div>
      </AuthGuard>
    );
  }

  const status = statusConfig[student.status] || statusConfig.inactive;

  return (
    <AuthGuard requiredRoles={["admin", "librarian"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/students">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Students
            </Link>
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/students/${student.id}/report`}>
                <FileText className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Report</span>
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/students/${student.id}/edit`}>
                <Edit className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Edit</span>
              </Link>
            </Button>

            {student.status === "active" && (
              <>
                {canSuspend && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowSuspendDialog(true)}
                  >
                    <Ban className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Suspend</span>
                  </Button>
                )}
                {canGraduate && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowGraduateDialog(true)}
                  >
                    <GraduationCap className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Graduate</span>
                  </Button>
                )}
              </>
            )}

            {(student.status === "suspended" ||
              student.status === "inactive") &&
              canSuspend && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleReactivate}
                  disabled={isReactivating}
                >
                  {isReactivating ? (
                    <Loader2 className="h-4 w-4 sm:mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 sm:mr-2" />
                  )}
                  <span className="hidden sm:inline">Reactivate</span>
                </Button>
              )}

            {isAdmin && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            )}
          </div>
        </div>

        {/* Alerts */}
        {student.status === "suspended" && student.suspension_reason && (
          <Alert variant="destructive">
            <Ban className="h-4 w-4" />
            <AlertDescription>
              <strong>Suspension Reason:</strong> {student.suspension_reason}
            </AlertDescription>
          </Alert>
        )}
        {student.status === "graduated" && (
          <Alert>
            <GraduationCap className="h-4 w-4" />
            <AlertDescription>
              This student graduated on{" "}
              <strong>
                {formatDate(student.graduated_at || student.updated_at)}
              </strong>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Card */}
          <div className="space-y-6">
            <Card className="overflow-hidden">
              {/* Gradient header */}
              <div className="h-24 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />
              <CardContent className="pt-0 -mt-12">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
                    <AvatarFallback className="text-xl font-semibold bg-primary/10 text-primary">
                      {getInitials(student.name)}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="mt-3 text-xl font-bold leading-tight">
                    {student.name}
                  </h2>
                  <p className="text-sm text-muted-foreground font-mono">
                    {student.student_id}
                  </p>
                  <Badge
                    variant="outline"
                    className={`mt-2 ${status.bg} ${status.color}`}
                  >
                    <span
                      className={`mr-1.5 h-1.5 w-1.5 rounded-full inline-block ${status.dot}`}
                    />
                    {student.status}
                  </Badge>
                </div>

                <div className="mt-6 space-y-3">
                  {student.email && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                          Email
                        </p>
                        <p className="font-medium truncate">{student.email}</p>
                      </div>
                    </div>
                  )}

                  {student.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                          Phone
                        </p>
                        <p className="font-medium">{student.phone}</p>
                      </div>
                    </div>
                  )}

                  {student.year_of_study && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                          Year of Study
                        </p>
                        <p className="font-medium">
                          Year {student.year_of_study}
                        </p>
                      </div>
                    </div>
                  )}

                  {student.enrollment_date && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                          Enrolled
                        </p>
                        <p className="font-medium">
                          {formatDate(student.enrollment_date)}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        Member Since
                      </p>
                      <p className="font-medium">
                        {formatDate(student.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                  asChild
                >
                  <Link href={`/transactions/borrow?student_id=${student.id}`}>
                    <BookOpen className="mr-2 h-4 w-4 text-primary" />
                    Borrow Book
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                  asChild
                >
                  <Link href={`/transactions?student_id=${student.id}`}>
                    <Activity className="mr-2 h-4 w-4 text-muted-foreground" />
                    View Transactions
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                  asChild
                >
                  <Link href={`/reservations?student_id=${student.id}`}>
                    <BookMarked className="mr-2 h-4 w-4 text-muted-foreground" />
                    View Reservations
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Grid */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              <Card className="relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-1 bg-blue-500" />
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                      <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">
                        Current
                      </p>
                      <p className="text-2xl font-bold tabular-nums">
                        {student.current_books ?? 0}
                        <span className="text-sm font-normal text-muted-foreground">
                          /{student.max_books ?? 5}
                        </span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-1 bg-emerald-500" />
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                      <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">
                        Total Borrowed
                      </p>
                      <p className="text-2xl font-bold tabular-nums">
                        {student.total_borrowed ?? 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-1 bg-amber-500" />
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
                      <DollarSign className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">
                        Total Fines
                      </p>
                      <p className="text-2xl font-bold tabular-nums">
                        {formatCurrency(student.total_fines ?? 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <div
                  className={`absolute inset-x-0 top-0 h-1 ${(student.unpaid_fines ?? 0) > 0 ? "bg-red-500" : "bg-gray-300 dark:bg-gray-700"}`}
                />
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${(student.unpaid_fines ?? 0) > 0 ? "bg-red-500/10" : "bg-muted"}`}
                    >
                      <AlertTriangle
                        className={`h-5 w-5 ${(student.unpaid_fines ?? 0) > 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}
                      />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">
                        Unpaid Fines
                      </p>
                      <p
                        className={`text-2xl font-bold tabular-nums ${(student.unpaid_fines ?? 0) > 0 ? "text-red-600 dark:text-red-400" : ""}`}
                      >
                        {formatCurrency(student.unpaid_fines ?? 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Admin Notes */}
            <AdminNotes student={student} onUpdate={() => refresh()} />

            {/* Tabs */}
            <Tabs defaultValue="analytics">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="activity">Recent Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="analytics" className="mt-4 space-y-4">
                {/* Borrowing Summary */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      Borrowing Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {[
                        {
                          label: "Books currently borrowed",
                          value: student?.current_books ?? 0,
                        },
                        {
                          label: "Max books allowed",
                          value: student?.max_books ?? 5,
                        },
                        {
                          label: "Total books borrowed",
                          value: student?.total_borrowed ?? 0,
                        },
                        {
                          label: "Total fines",
                          value: formatCurrency(student?.total_fines ?? 0),
                        },
                        {
                          label: "Unpaid fines",
                          value: formatCurrency(student?.unpaid_fines ?? 0),
                          highlight: (student?.unpaid_fines ?? 0) > 0,
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center justify-between py-1.5 border-b last:border-0 border-border/50"
                        >
                          <span className="text-sm text-muted-foreground">
                            {item.label}
                          </span>
                          <span
                            className={`text-sm font-semibold tabular-nums ${item.highlight ? "text-red-600 dark:text-red-400" : ""}`}
                          >
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Reading Preferences */}
                {isLoadingReport ? (
                  <Skeleton className="h-48 rounded-xl" />
                ) : studentReport?.reading_stats &&
                  studentReport.reading_stats.length > 0 ? (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">
                        Reading Preferences
                      </CardTitle>
                      <CardDescription>Books read by genre</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {studentReport.reading_stats.map((stat) => {
                          const maxBooks = Math.max(
                            ...studentReport.reading_stats.map(
                              (s) => s.books_read
                            )
                          );
                          const percentage =
                            maxBooks > 0
                              ? (stat.books_read / maxBooks) * 100
                              : 0;
                          return (
                            <div key={stat.genre} className="space-y-1.5">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">
                                  {stat.genre}
                                </span>
                                <span className="text-xs text-muted-foreground tabular-nums">
                                  {stat.books_read} books &middot; avg{" "}
                                  {stat.avg_days_held} days
                                </span>
                              </div>
                              <div className="h-2 rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-500"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ) : null}

                {/* Monthly Activity */}
                {!isLoadingReport &&
                studentReport?.monthly_activity &&
                studentReport.monthly_activity.length > 0 ? (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">
                        Monthly Activity
                      </CardTitle>
                      <CardDescription>
                        Borrowing and return activity over time
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        {studentReport.monthly_activity.map((month) => (
                          <div
                            key={month.month}
                            className="flex items-center justify-between py-2.5 border-b last:border-0 border-border/50"
                          >
                            <span className="text-sm font-medium">
                              {month.month}
                            </span>
                            <div className="flex items-center gap-3 text-xs">
                              <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-blue-700 dark:text-blue-400">
                                {month.borrowed} borrowed
                              </span>
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-700 dark:text-emerald-400">
                                {month.returned} returned
                              </span>
                              {parseFloat(month.fines_incurred) > 0 && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-red-700 dark:text-red-400">
                                  {formatKsh(month.fines_incurred)}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : null}
              </TabsContent>

              <TabsContent value="activity" className="mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      Transaction History
                    </CardTitle>
                    <CardDescription>
                      All borrowing, returns, and renewals
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingHistory ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : transactionHistory.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                          <BookOpen className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          No transactions found for this student
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {[
                            {
                              label: "Currently Borrowed",
                              value: transactionHistory.filter(
                                (t) =>
                                  t.status === "active" ||
                                  t.status === "overdue"
                              ).length,
                              color: "text-foreground",
                            },
                            {
                              label: "Returned",
                              value: transactionHistory.filter(
                                (t) => t.status === "returned"
                              ).length,
                              color: "text-foreground",
                            },
                            {
                              label: "Overdue",
                              value: transactionHistory.filter(
                                (t) => t.status === "overdue"
                              ).length,
                              color: "text-amber-600 dark:text-amber-400",
                            },
                            {
                              label: "With Fines",
                              value: transactionHistory.filter(
                                (t) => t.fine_amount > 0
                              ).length,
                              color: "text-red-600 dark:text-red-400",
                            },
                          ].map((stat) => (
                            <div
                              key={stat.label}
                              className="rounded-lg bg-muted/50 p-3 text-center"
                            >
                              <div
                                className={`text-xl font-bold tabular-nums ${stat.color}`}
                              >
                                {stat.value}
                              </div>
                              <div className="text-[11px] text-muted-foreground mt-0.5">
                                {stat.label}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Transaction List */}
                        <div className="space-y-2">
                          {transactionHistory.slice(0, 20).map((tx) => {
                            const txStatusConfig: Record<
                              string,
                              {
                                color: string;
                                icon: typeof BookOpen;
                                badge: string;
                              }
                            > = {
                              active: {
                                color: "bg-blue-500/10 text-blue-600",
                                icon: BookOpen,
                                badge:
                                  "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
                              },
                              returned: {
                                color: "bg-emerald-500/10 text-emerald-600",
                                icon: CheckCircle,
                                badge:
                                  "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
                              },
                              overdue: {
                                color: "bg-red-500/10 text-red-600",
                                icon: AlertTriangle,
                                badge:
                                  "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
                              },
                              lost: {
                                color: "bg-gray-500/10 text-gray-600",
                                icon: XCircle,
                                badge:
                                  "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
                              },
                              cancelled: {
                                color: "bg-orange-500/10 text-orange-600",
                                icon: XCircle,
                                badge:
                                  "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
                              },
                            };
                            const config =
                              txStatusConfig[tx.status] ??
                              txStatusConfig.active;
                            const StatusIcon = config.icon;
                            const wasLateReturn =
                              tx.status === "returned" && tx.fine_amount > 0;

                            return (
                              <div
                                key={tx.id}
                                className="group flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:border-border hover:bg-muted/30 transition-colors"
                              >
                                <div
                                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${config.color}`}
                                >
                                  <StatusIcon className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                      <p className="font-medium text-sm truncate">
                                        {tx.book?.title || "Unknown Book"}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {tx.book?.author}
                                      </p>
                                      {tx.copy_barcode && (
                                        <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                                          {tx.copy_barcode}
                                        </p>
                                      )}
                                    </div>
                                    <Badge
                                      variant="outline"
                                      className={`text-[11px] shrink-0 ${config.badge}`}
                                    >
                                      {tx.status}
                                    </Badge>
                                  </div>
                                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[11px] text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      Borrowed: {formatDate(tx.borrowed_at)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      Due: {formatDate(tx.due_date)}
                                    </span>
                                    {tx.returned_at && (
                                      <span className="flex items-center gap-1">
                                        <RotateCcw className="h-3 w-3" />
                                        Returned: {formatDate(tx.returned_at)}
                                      </span>
                                    )}
                                    {(tx.renewal_count ?? 0) > 0 && (
                                      <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                        <RefreshCw className="h-3 w-3" />
                                        Renewed {tx.renewal_count}x
                                      </span>
                                    )}
                                  </div>
                                  {tx.fine_amount > 0 && (
                                    <div className="mt-2 flex items-center gap-2">
                                      <span
                                        className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${tx.fine_paid ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-red-500/10 text-red-700 dark:text-red-400"}`}
                                      >
                                        Fine:{" "}
                                        {formatCurrency(tx.fine_amount)}{" "}
                                        {tx.fine_paid ? "(Paid)" : "(Unpaid)"}
                                      </span>
                                      {wasLateReturn && (
                                        <span className="text-[11px] text-amber-600 dark:text-amber-400">
                                          Late return
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {transactionHistory.length > 20 && (
                          <div className="text-center pt-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link
                                href={`/transactions?student_id=${student?.id}`}
                              >
                                View All {transactionHistory.length}{" "}
                                Transactions
                              </Link>
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Dialogs */}
        <ConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title="Delete Student"
          description={`Are you sure you want to delete "${student.name}"? This will also remove all their borrowing history and cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          isDestructive
          isLoading={isDeleting}
        />
        <SuspendDialog
          student={student}
          open={showSuspendDialog}
          onOpenChange={setShowSuspendDialog}
          onSuccess={refresh}
        />
        <GraduateDialog
          student={student}
          open={showGraduateDialog}
          onOpenChange={setShowGraduateDialog}
          onSuccess={refresh}
        />
      </div>
    </AuthGuard>
  );
}
