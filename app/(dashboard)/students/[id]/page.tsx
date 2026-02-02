"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { usePermissions } from "@/providers/permission-provider";
import { useStudent } from "@/lib/hooks/use-students";
import { studentsApi } from "@/lib/api";
import { AuthGuard } from "@/components/auth/auth-guard";
import { PermissionGuard } from "@/components/auth/permission-guard";
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
import { Separator } from "@/components/ui/separator";
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
  Building2,
  GraduationCap,
  BookOpen,
  AlertTriangle,
  Ban,
  CheckCircle,
  Calendar,
  Loader2,
} from "lucide-react";
import { formatDate, formatCurrency, getInitials } from "@/lib/utils/format";
import { toast } from "sonner";
import type { StudentStatus } from "@/lib/types";

const statusColors: Record<StudentStatus, string> = {
  active: "bg-green-500/10 text-green-700 border-green-500/20",
  suspended: "bg-red-500/10 text-red-700 border-red-500/20",
  graduated: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  inactive: "bg-gray-500/10 text-gray-700 border-gray-500/20",
};

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAdmin } = useAuth();
  const { hasPermission } = usePermissions();
  const studentId = params.id as string;

  const { student, isLoading, error, refresh } = useStudent(studentId);

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
            <Skeleton className="h-64 rounded-lg" />
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-24 w-full" />
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
            The student you&apos;re looking for doesn&apos;t exist or has been removed.
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

  return (
    <AuthGuard requiredRoles={["admin", "librarian"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" asChild>
            <Link href="/students">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Students
            </Link>
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/students/${student.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>

            {/* Status action buttons based on current status */}
            {student.status === "active" && (
              <>
                {canSuspend && (
                  <Button
                    variant="secondary"
                    onClick={() => setShowSuspendDialog(true)}
                  >
                    <Ban className="mr-2 h-4 w-4" />
                    Suspend
                  </Button>
                )}
                {canGraduate && (
                  <Button
                    variant="secondary"
                    onClick={() => setShowGraduateDialog(true)}
                  >
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Graduate
                  </Button>
                )}
              </>
            )}

            {(student.status === "suspended" || student.status === "inactive") && canSuspend && (
              <Button
                variant="default"
                onClick={handleReactivate}
                disabled={isReactivating}
              >
                {isReactivating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Reactivate
              </Button>
            )}

            {isAdmin && (
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        </div>

        {/* Suspension Alert */}
        {student.status === "suspended" && student.suspension_reason && (
          <Alert variant="destructive">
            <Ban className="h-4 w-4" />
            <AlertDescription>
              <strong>Suspension Reason:</strong> {student.suspension_reason}
            </AlertDescription>
          </Alert>
        )}

        {/* Graduated Alert */}
        {student.status === "graduated" && (
          <Alert>
            <GraduationCap className="h-4 w-4" />
            <AlertDescription>
              This student graduated on{" "}
              <strong>{formatDate(student.graduated_at || student.updated_at)}</strong>
            </AlertDescription>
          </Alert>
        )}

        {/* Student Details */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarFallback className="text-2xl">
                    {getInitials(student.name)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold">{student.name}</h2>
                <p className="text-muted-foreground">{student.student_id}</p>
                <Badge
                  variant="outline"
                  className={`mt-2 ${statusColors[student.status] || statusColors.inactive}`}
                >
                  {student.status}
                </Badge>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                {student.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{student.email}</p>
                    </div>
                  </div>
                )}

                {student.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{student.phone}</p>
                    </div>
                  </div>
                )}

                {(student.department || student.department_name) && (
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Department</p>
                      <p className="font-medium">{student.department_name || student.department}</p>
                    </div>
                  </div>
                )}

                {student.year_of_study && (
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Year of Study</p>
                      <p className="font-medium">Year {student.year_of_study}</p>
                    </div>
                  </div>
                )}

                {student.enrollment_date && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Enrolled</p>
                      <p className="font-medium">{formatDate(student.enrollment_date)}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Member Since</p>
                    <p className="font-medium">{formatDate(student.created_at)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats & Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Current Books</p>
                      <p className="text-2xl font-bold">
                        {student.current_books ?? 0} / {student.max_books ?? 5}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Borrowed</p>
                      <p className="text-2xl font-bold">{student.total_borrowed ?? 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Fines</p>
                      <p className="text-2xl font-bold">{formatCurrency(student.total_fines ?? 0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      (student.unpaid_fines ?? 0) > 0 ? "bg-red-500/10" : "bg-gray-500/10"
                    }`}>
                      <AlertTriangle className={`h-5 w-5 ${
                        (student.unpaid_fines ?? 0) > 0 ? "text-red-600" : "text-gray-600"
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Unpaid Fines</p>
                      <p className={`text-2xl font-bold ${
                        (student.unpaid_fines ?? 0) > 0 ? "text-red-600" : ""
                      }`}>
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
              <TabsList>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="activity">Recent Activity</TabsTrigger>
              </TabsList>
              <TabsContent value="analytics" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Borrowing Analytics</CardTitle>
                    <CardDescription>
                      Student borrowing patterns and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium mb-3">Summary</h4>
                        <div className="grid gap-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Books currently borrowed:</span>
                            <span className="font-medium">{student?.current_books ?? 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Max books allowed:</span>
                            <span className="font-medium">{student?.max_books ?? 5}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total books borrowed:</span>
                            <span className="font-medium">{student?.total_borrowed ?? 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total fines:</span>
                            <span className="font-medium">${(student?.total_fines ?? 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Unpaid fines:</span>
                            <span className={`font-medium ${(student?.unpaid_fines ?? 0) > 0 ? "text-red-600" : ""}`}>
                              ${(student?.unpaid_fines ?? 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="activity" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Latest borrowing and return transactions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center text-muted-foreground py-8">
                      Activity history coming soon
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/transactions/borrow?student_id=${student.id}`}>
                      <BookOpen className="mr-2 h-4 w-4" />
                      Borrow Book
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href={`/transactions?student_id=${student.id}`}>
                      View Transactions
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href={`/reservations?student_id=${student.id}`}>
                      View Reservations
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Delete Confirmation */}
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

        {/* Suspend Dialog */}
        <SuspendDialog
          student={student}
          open={showSuspendDialog}
          onOpenChange={setShowSuspendDialog}
          onSuccess={refresh}
        />

        {/* Graduate Dialog */}
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
