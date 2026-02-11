"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStudents, useStudentStats } from "@/lib/hooks/use-students";
import { AuthGuard } from "@/components/auth/auth-guard";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { PermissionCodes } from "@/lib/types/permission";
import { StudentSearch } from "@/components/students";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Upload, Download, Users, UserCheck, UserX, AlertTriangle } from "lucide-react";
import type { Student, StudentSearchParams, StudentStatus } from "@/lib/types";
import { studentsApi } from "@/lib/api";
import { formatCurrency, getInitials } from "@/lib/utils/format";
import { toast } from "sonner";

const statusColors: Record<StudentStatus, string> = {
  active: "bg-green-500/10 text-green-700 border-green-500/20",
  suspended: "bg-red-500/10 text-red-700 border-red-500/20",
  graduated: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  inactive: "bg-gray-500/10 text-gray-700 border-gray-500/20",
};

export default function StudentsPage() {
  const router = useRouter();
  const [params, setParams] = useState<StudentSearchParams>({
    page: 1,
    per_page: 20,
  });

  const { students, pagination, isLoading } = useStudents(params);
  const { stats, isLoading: statsLoading } = useStudentStats();

  const handleExport = async () => {
    try {
      const blob = await studentsApi.export(params);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "students.csv";
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Students exported successfully");
    } catch {
      toast.error("Failed to export students");
    }
  };

  const handleSearch = (searchParams: Record<string, string | boolean | number | undefined>) => {
    setParams((prev) => ({
      ...prev,
      query: searchParams.query as string | undefined,
      department: searchParams.department as string | undefined,
      year_of_study: searchParams.year_of_study as number | undefined,
      status: searchParams.status as StudentStatus | undefined,
      has_overdue: searchParams.has_overdue as boolean | undefined,
      has_fines: searchParams.has_fines as boolean | undefined,
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setParams((prev) => ({ ...prev, page }));
  };

  const handleRowClick = (student: Student) => {
    router.push(`/students/${student.id}`);
  };

  const columns = [
    {
      key: "name",
      header: "Student",
      render: (student: Student) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{student.name}</p>
            <p className="text-sm text-muted-foreground">{student.student_id}</p>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      className: "hidden md:table-cell",
      render: (student: Student) => (
        <span className="text-sm">{student.email}</span>
      ),
    },
    {
      key: "year_of_study",
      header: "Year",
      className: "hidden md:table-cell",
      render: (student: Student) => (
        <span className="text-sm">{student.year_of_study ? `Year ${student.year_of_study}` : "-"}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (student: Student) => (
        <Badge
          variant="outline"
          className={statusColors[student.status] || statusColors.inactive}
        >
          {student.status}
        </Badge>
      ),
    },
    {
      key: "current_books",
      header: "Books",
      render: (student: Student) => (
        <span className="text-sm">
          {student.current_books ?? 0} / {student.max_books ?? 5}
        </span>
      ),
    },
    {
      key: "unpaid_fines",
      header: "Fines",
      render: (student: Student) => (
        <span
          className={`text-sm ${
            (student.unpaid_fines ?? 0) > 0 ? "text-destructive font-medium" : ""
          }`}
        >
          {formatCurrency(student.unpaid_fines ?? 0)}
        </span>
      ),
    },
  ];

  return (
    <AuthGuard requiredPermission={PermissionCodes.STUDENTS_VIEW}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Students</h1>
            <p className="text-muted-foreground">
              Manage library members and their accounts
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <PermissionGuard permission={PermissionCodes.REPORTS_EXPORT} hideWhenDenied>
              <Button variant="outline" onClick={handleExport} className="flex-1 sm:flex-initial">
                <Download className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </PermissionGuard>
            <PermissionGuard permission={PermissionCodes.STUDENTS_CREATE} hideWhenDenied>
              <Button variant="outline" asChild className="flex-1 sm:flex-initial">
                <Link href="/students/import">
                  <Upload className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Import</span>
                </Link>
              </Button>
              <Button asChild className="flex-1 sm:flex-initial">
                <Link href="/students/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Student
                </Link>
              </Button>
            </PermissionGuard>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-16" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-12" />
                </CardContent>
              </Card>
            ))
          ) : stats ? (
            <>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold">{stats.total_students}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <UserCheck className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Active</p>
                      <p className="text-2xl font-bold text-green-600">{stats.active_students}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <UserX className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Suspended</p>
                      <p className="text-2xl font-bold text-red-600">{stats.suspended_students}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Inactive</p>
                      <p className="text-2xl font-bold">{stats.inactive_students}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>

        <StudentSearch onSearch={handleSearch} />

        <DataTable
          data={students || []}
          columns={columns}
          pagination={pagination}
          onPageChange={handlePageChange}
          isLoading={isLoading}
          emptyMessage="No students found."
          onRowClick={handleRowClick}
        />
      </div>
    </AuthGuard>
  );
}
