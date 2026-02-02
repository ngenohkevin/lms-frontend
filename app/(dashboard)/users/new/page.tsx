"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthGuard } from "@/components/auth/auth-guard";
import { UserForm } from "@/components/users";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import type { StaffUser } from "@/lib/types";

export default function NewUserPage() {
  const router = useRouter();

  const handleSuccess = (user: StaffUser) => {
    router.push(`/users/${user.id}`);
  };

  const handleCancel = () => {
    router.push("/users");
  };

  return (
    <AuthGuard requiredRoles={["admin"]}>
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

          <h1 className="text-3xl font-bold tracking-tight mt-2">New User</h1>
          <p className="text-muted-foreground">
            Create a new staff account
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Details</CardTitle>
            <CardDescription>
              Enter the information for the new user. They will receive login
              credentials after account creation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserForm onSuccess={handleSuccess} onCancel={handleCancel} />
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
