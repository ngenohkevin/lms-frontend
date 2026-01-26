"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStudents } from "@/lib/hooks/use-students";
import { AuthGuard } from "@/components/auth/auth-guard";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus } from "lucide-react";
import type { Student, StudentSearchParams, StudentStatus } from "@/lib/types";
import { formatCurrency, getInitials } from "@/lib/utils/format";

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

  const { students, pagination, isLoading, refresh } = useStudents(params);

  const handleSearch = (query: string) => {
    setParams((prev) => ({ ...prev, query, page: 1 }));
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
      render: (student: Student) => (
        <span className="text-sm">{student.email}</span>
      ),
    },
    {
      key: "department",
      header: "Department",
      render: (student: Student) => (
        <span className="text-sm">{student.department || "-"}</span>
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
    <AuthGuard requiredRoles={["admin", "librarian"]}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Students</h1>
            <p className="text-muted-foreground">
              Manage library members and their accounts
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/students/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Student
              </Link>
            </Button>
          </div>
        </div>

        <DataTable
          data={students || []}
          columns={columns}
          pagination={pagination}
          onPageChange={handlePageChange}
          onSearch={handleSearch}
          searchPlaceholder="Search by name, email, or student ID..."
          isLoading={isLoading}
          emptyMessage="No students found."
          onRowClick={handleRowClick}
        />
      </div>
    </AuthGuard>
  );
}
