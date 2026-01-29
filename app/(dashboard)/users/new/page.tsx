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
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/users">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">New User</h1>
            <p className="text-muted-foreground">
              Create a new staff account
            </p>
          </div>
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
