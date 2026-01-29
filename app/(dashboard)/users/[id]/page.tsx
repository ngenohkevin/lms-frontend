"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/lib/hooks/use-users";
import { usersApi } from "@/lib/api";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Shield,
  UserCog,
  User,
  CheckCircle,
  XCircle,
  Mail,
  Clock,
  Calendar,
  Loader2,
} from "lucide-react";
import { getInitials } from "@/lib/utils/format";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import type { StaffRole } from "@/lib/types";

const roleColors: Record<StaffRole, string> = {
  admin: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  librarian: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  staff: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
};

const roleIcons: Record<StaffRole, React.ComponentType<{ className?: string }>> = {
  admin: Shield,
  librarian: UserCog,
  staff: User,
};

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const { user, isLoading, refresh } = useUser(userId);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleDelete = async () => {
    if (!user) return;

    setIsDeleting(true);
    try {
      await usersApi.delete(user.id);
      toast.success("User deleted successfully");
      router.push("/users");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete user"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!user) return;

    setIsUpdatingStatus(true);
    try {
      await usersApi.updateStatus(user.id, { is_active: !user.is_active });
      toast.success(
        user.is_active
          ? "User deactivated successfully"
          : "User activated successfully"
      );
      refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update user status"
      );
    } finally {
      setIsUpdatingStatus(false);
    }
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
                <Skeleton className="h-20 w-20 rounded-full" />
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
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

  const RoleIcon = roleIcons[user.role];

  return (
    <AuthGuard requiredRoles={["admin"]}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/users">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {user.username}
              </h1>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/users/${user.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={handleToggleStatus}
              disabled={isUpdatingStatus}
            >
              {isUpdatingStatus ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : user.is_active ? (
                <XCircle className="mr-2 h-4 w-4" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              {user.is_active ? "Deactivate" : "Activate"}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {user.username}? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>User account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-2xl">
                    {getInitials(user.username)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`${roleColors[user.role]} capitalize`}
                    >
                      <RoleIcon className="mr-1 h-3 w-3" />
                      {user.role}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={
                        user.is_active
                          ? "bg-green-500/10 text-green-700 border-green-500/20"
                          : "bg-gray-500/10 text-gray-700 border-gray-500/20"
                      }
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Username</p>
                    <p className="font-medium">{user.username}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Last Login</p>
                    <p className="font-medium">
                      {user.last_login
                        ? `${formatDistanceToNow(new Date(user.last_login), {
                            addSuffix: true,
                          })} (${format(
                            new Date(user.last_login),
                            "PPpp"
                          )})`
                        : "Never"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="font-medium">
                      {format(new Date(user.created_at), "PPpp")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Permissions</CardTitle>
              <CardDescription>Role-based access levels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <RoleIcon className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium capitalize">{user.role}</p>
                    <p className="text-sm text-muted-foreground">
                      {user.role === "admin" &&
                        "Full access to all system features including user management"}
                      {user.role === "librarian" &&
                        "Access to library management features including books, students, and transactions"}
                      {user.role === "staff" &&
                        "Basic access to library operations"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Capabilities</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {user.role === "admin" && (
                    <>
                      <li>• Manage all users and roles</li>
                      <li>• Configure system settings</li>
                      <li>• Access all reports and analytics</li>
                      <li>• Manage books and categories</li>
                      <li>• Handle all transactions</li>
                    </>
                  )}
                  {user.role === "librarian" && (
                    <>
                      <li>• Manage books and categories</li>
                      <li>• Handle book transactions</li>
                      <li>• Manage student records</li>
                      <li>• Generate reports</li>
                    </>
                  )}
                  {user.role === "staff" && (
                    <>
                      <li>• View book catalog</li>
                      <li>• Process checkouts and returns</li>
                      <li>• View student information</li>
                    </>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
}
