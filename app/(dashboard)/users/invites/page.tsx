"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useInvites } from "@/lib/hooks/use-invites";
import { invitesApi } from "@/lib/api";
import { AuthGuard } from "@/components/auth/auth-guard";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  RefreshCw,
  Trash2,
  Copy,
  Shield,
  UserCog,
  User,
  Crown,
} from "lucide-react";
import type { UserInvite, InviteSearchParams, InviteStatus, StaffRole } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

const statusConfig: Record<InviteStatus, { label: string; icon: React.ComponentType<{ className?: string }>; className: string }> = {
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  },
  accepted: {
    label: "Accepted",
    icon: CheckCircle,
    className: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  },
  expired: {
    label: "Expired",
    icon: XCircle,
    className: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
  },
};

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

export default function InvitesPage() {
  const [params, setParams] = useState<InviteSearchParams>({
    page: 1,
    per_page: 20,
  });
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isResending, setIsResending] = useState<string | null>(null);

  const { invites, pagination, isLoading, refresh } = useInvites(params);

  const handlePageChange = (page: number) => {
    setParams((prev) => ({ ...prev, page }));
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      await invitesApi.delete(id);
      toast.success("Invitation cancelled");
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel invitation");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleResend = async (id: string) => {
    setIsResending(id);
    try {
      const result = await invitesApi.resend(id);
      toast.success("Invitation resent", {
        description: "A new invite link has been generated",
        action: {
          label: "Copy Link",
          onClick: () => {
            navigator.clipboard.writeText(result.invite_url);
            toast.success("Link copied!");
          },
        },
      });
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to resend invitation");
    } finally {
      setIsResending(null);
    }
  };

  const handleCopyLink = async (invite: UserInvite) => {
    // For pending invites, we need to get the link first
    try {
      const result = await invitesApi.resend(invite.id);
      await navigator.clipboard.writeText(result.invite_url);
      toast.success("Link copied to clipboard!");
      refresh();
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const columns = [
    {
      key: "user",
      header: "Invited User",
      render: (invite: UserInvite) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium">{invite.name}</p>
            <p className="text-sm text-muted-foreground">{invite.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (invite: UserInvite) => {
        const RoleIcon = roleIcons[invite.role];
        return (
          <Badge variant="outline" className={`${roleColors[invite.role]} capitalize`}>
            <RoleIcon className="mr-1 h-3 w-3" />
            {invite.role === "super_admin" ? "Super Admin" : invite.role}
          </Badge>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (invite: UserInvite) => {
        const status = statusConfig[invite.status];
        const StatusIcon = status.icon;
        return (
          <Badge variant="outline" className={status.className}>
            <StatusIcon className="mr-1 h-3 w-3" />
            {status.label}
          </Badge>
        );
      },
    },
    {
      key: "invited_by",
      header: "Invited By",
      render: (invite: UserInvite) => (
        <span className="text-sm text-muted-foreground">{invite.inviter_name}</span>
      ),
    },
    {
      key: "expires_at",
      header: "Expires",
      render: (invite: UserInvite) => (
        <span className="text-sm text-muted-foreground">
          {invite.status === "pending"
            ? formatDistanceToNow(new Date(invite.expires_at), { addSuffix: true })
            : "-"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (invite: UserInvite) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {invite.status === "pending" && (
              <>
                <DropdownMenuItem onClick={() => handleCopyLink(invite)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Link
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleResend(invite.id)}
                  disabled={isResending === invite.id}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isResending === invite.id ? "animate-spin" : ""}`} />
                  Resend
                </DropdownMenuItem>
              </>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {invite.status === "pending" ? "Cancel" : "Delete"}
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {invite.status === "pending" ? "Cancel Invitation?" : "Delete Invitation?"}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {invite.status === "pending"
                      ? `This will cancel the invitation for ${invite.email}. They won't be able to use the invite link.`
                      : `This will permanently delete the invitation record for ${invite.email}.`}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(invite.id)}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    {isDeleting === invite.id ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <AuthGuard requiredRoles={["admin"]}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pending Invitations</h1>
            <p className="text-muted-foreground">
              Manage user invitations and access requests
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/users">View Users</Link>
            </Button>
            <Button asChild>
              <Link href="/users/invites/new">
                <Plus className="mr-2 h-4 w-4" />
                Send Invite
              </Link>
            </Button>
          </div>
        </div>

        <DataTable
          data={invites || []}
          columns={columns}
          pagination={pagination}
          onPageChange={handlePageChange}
          isLoading={isLoading}
          emptyMessage="No invitations found."
        />
      </div>
    </AuthGuard>
  );
}
