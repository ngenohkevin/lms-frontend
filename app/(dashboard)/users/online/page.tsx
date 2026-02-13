"use client";

import useSWR from "swr";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/auth-guard";
import { PermissionCodes } from "@/lib/types/permission";
import { presenceApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Shield, UserCog, User, Crown, Activity } from "lucide-react";
import { getInitials } from "@/lib/utils/format";
import { formatDistanceToNow } from "date-fns";
import type { StaffRole, OnlineUsersResponse } from "@/lib/types";

const roleColors: Record<StaffRole, string> = {
  super_admin: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  admin: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  librarian: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  staff: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
};

const roleIcons: Record<StaffRole, React.ComponentType<{ className?: string }>> = {
  super_admin: Crown,
  admin: Shield,
  librarian: UserCog,
  staff: User,
};

const roleLabels: Record<StaffRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  librarian: "Librarian",
  staff: "Staff",
};

export default function OnlineUsersPage() {
  const router = useRouter();

  const { data, isLoading } = useSWR<OnlineUsersResponse>(
    "/api/v1/users/online",
    () => presenceApi.getOnlineUsers(),
    {
      refreshInterval: 10000,
      shouldRetryOnError: true,
      errorRetryCount: 2,
    }
  );

  const users = data?.users || [];

  if (isLoading) {
    return (
      <AuthGuard requiredPermission={PermissionCodes.USERS_ONLINE}>
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
            <div className="mt-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64 mt-2" />
            </div>
          </div>
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requiredPermission={PermissionCodes.USERS_ONLINE}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Button
              variant="ghost"
              className="-ml-2"
              onClick={() => router.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <h1 className="text-3xl font-bold tracking-tight mt-2">
              Online Users
            </h1>
            <p className="text-muted-foreground">
              Currently active staff members (refreshes every 10 seconds)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2">
              <Activity className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">
                {users.length} online
              </span>
            </div>
          </div>
        </div>

        {users.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Activity className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h2 className="text-lg font-semibold">No users online</h2>
              <p className="text-sm text-muted-foreground mt-1">
                No staff members are currently active in the system.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Mobile: Card layout */}
            <div className="grid gap-4 md:hidden">
              {users.map((user) => {
                const RoleIcon = roleIcons[user.role];
                return (
                  <Card key={user.user_id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {getInitials(user.username)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{user.username}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="outline"
                              className={`${roleColors[user.role]} text-xs`}
                            >
                              <RoleIcon className="mr-1 h-3 w-3" />
                              {roleLabels[user.role]}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(user.last_seen), {
                            addSuffix: true,
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Desktop: Table layout */}
            <Card className="hidden md:block">
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>
                  Staff members currently using the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Last Activity</TableHead>
                        <TableHead>Current Page</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => {
                        const RoleIcon = roleIcons[user.role];
                        return (
                          <TableRow key={user.user_id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback>
                                      {getInitials(user.username)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background" />
                                </div>
                                <span className="font-medium">
                                  {user.username}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`${roleColors[user.role]} capitalize`}
                              >
                                <RoleIcon className="mr-1 h-3 w-3" />
                                {roleLabels[user.role]}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {formatDistanceToNow(new Date(user.last_seen), {
                                addSuffix: true,
                              })}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {user.path || "—"}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AuthGuard>
  );
}
