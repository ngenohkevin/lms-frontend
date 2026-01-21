"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { ArrowLeft } from "lucide-react";
import type { Student } from "@/lib/types";

export default function NewStudentPage() {
  const router = useRouter();

  const handleSuccess = (student: Student) => {
    router.push(`/students/${student.id}`);
  };

  return (
    <AuthGuard requiredRoles={["admin", "librarian"]}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/students">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Add New Student</h1>
            <p className="text-muted-foreground">
              Register a new student in the library system
            </p>
          </div>
        </div>

        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>Student Details</CardTitle>
            <CardDescription>
              Enter the student information below. The student will be able to
              borrow books once their account is active.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StudentForm
              onSuccess={handleSuccess}
              onCancel={() => router.push("/students")}
            />
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
