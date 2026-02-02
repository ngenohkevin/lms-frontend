"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useStudent } from "@/lib/hooks/use-students";
import { AuthGuard } from "@/components/auth/auth-guard";
import { StudentForm } from "@/components/students";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import type { Student } from "@/lib/types";

export default function EditStudentPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const { student, isLoading, error } = useStudent(studentId);

  const handleSuccess = (updatedStudent: Student) => {
    router.push(`/students/${updatedStudent.id}`);
  };

  if (isLoading) {
    return (
      <AuthGuard requiredRoles={["admin", "librarian"]}>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Card className="max-w-3xl">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
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
        <div>
          <Button
            variant="ghost"
            className="-ml-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <h1 className="text-3xl font-bold tracking-tight mt-2">Edit Student</h1>
          <p className="text-muted-foreground">
            Update {student.name}&apos;s information
          </p>
        </div>

        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>Student Details</CardTitle>
            <CardDescription>
              Make changes to the student&apos;s profile below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StudentForm
              student={student}
              onSuccess={handleSuccess}
              onCancel={() => router.push(`/students/${student.id}`)}
            />
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
