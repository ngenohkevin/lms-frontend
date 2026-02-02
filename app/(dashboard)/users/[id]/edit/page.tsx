"use client";

import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/lib/hooks/use-users";
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
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import type { StaffUser } from "@/lib/types";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const { user, isLoading } = useUser(userId);

  const handleSuccess = (updatedUser: StaffUser) => {
    router.push(`/users/${updatedUser.id}`);
  };

  const handleCancel = () => {
    router.push(`/users/${userId}`);
  };

  if (isLoading) {
    return (
      <AuthGuard requiredRoles={["admin"]}>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Card>
            <CardContent className="p-6">
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

  if (!user) {
    return (
      <AuthGuard requiredRoles={["admin"]}>
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="text-xl font-semibold">User not found</h2>
          <p className="text-muted-foreground">
            The user you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button asChild className="mt-4">
            <Link href="/users">Back to Users</Link>
          </Button>
        </div>
      </AuthGuard>
    );
  }

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

          <h1 className="text-3xl font-bold tracking-tight mt-2">Edit User</h1>
          <p className="text-muted-foreground">
            Update {user.username}&apos;s account details
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Details</CardTitle>
            <CardDescription>
              Update the user&apos;s information. Leave the password field
              empty to keep the current password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserForm
              user={user}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
