"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUsers } from "@/lib/hooks/use-users";
import { AuthGuard } from "@/components/auth/auth-guard";
import { UserSearch } from "@/components/users";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Shield, UserCog, User } from "lucide-react";
import type { StaffUser, StaffUserSearchParams, StaffRole } from "@/lib/types";
import { getInitials } from "@/lib/utils/format";
import { formatDistanceToNow } from "date-fns";

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

const statusColors = {
  active: "bg-green-500/10 text-green-700 border-green-500/20",
  inactive: "bg-gray-500/10 text-gray-700 border-gray-500/20",
};

export default function UsersPage() {
  const router = useRouter();
  const [params, setParams] = useState<StaffUserSearchParams>({
    page: 1,
    per_page: 20,
  });

  const { users, pagination, isLoading } = useUsers(params);

  const handleSearch = (searchParams: {
    query?: string;
    role?: StaffRole;
    active?: boolean;
  }) => {
    setParams((prev) => ({
      ...prev,
      query: searchParams.query,
      role: searchParams.role,
      active: searchParams.active,
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setParams((prev) => ({ ...prev, page }));
  };

  const handleRowClick = (user: StaffUser) => {
    router.push(`/users/${user.id}`);
  };

  const columns = [
    {
      key: "username",
      header: "User",
      render: (user: StaffUser) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user.username}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (user: StaffUser) => {
        const RoleIcon = roleIcons[user.role];
        return (
          <Badge
            variant="outline"
            className={`${roleColors[user.role]} capitalize`}
          >
            <RoleIcon className="mr-1 h-3 w-3" />
            {user.role}
          </Badge>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (user: StaffUser) => (
        <Badge
          variant="outline"
          className={user.is_active ? statusColors.active : statusColors.inactive}
        >
          {user.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "last_login",
      header: "Last Login",
      render: (user: StaffUser) => (
        <span className="text-sm text-muted-foreground">
          {user.last_login
            ? formatDistanceToNow(new Date(user.last_login), { addSuffix: true })
            : "Never"}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Created",
      render: (user: StaffUser) => (
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
        </span>
      ),
    },
  ];

  return (
    <AuthGuard requiredRoles={["admin"]}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Users</h1>
            <p className="text-muted-foreground">
              Manage staff accounts and permissions
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/users/invites">View Invites</Link>
            </Button>
            <Button asChild>
              <Link href="/users/invites/new">
                <Plus className="mr-2 h-4 w-4" />
                Invite User
              </Link>
            </Button>
          </div>
        </div>

        <UserSearch onSearch={handleSearch} />

        <DataTable
          data={users || []}
          columns={columns}
          pagination={pagination}
          onPageChange={handlePageChange}
          isLoading={isLoading}
          emptyMessage="No users found."
          onRowClick={handleRowClick}
        />
      </div>
    </AuthGuard>
  );
}
