"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AuthGuard } from "@/components/auth/auth-guard";
import { PermissionCodes } from "@/lib/types/permission";
import { useRolePermissions, useAllPermissions } from "@/lib/hooks/use-permissions";
import { permissionsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, Save, Shield, UserCog, User, Crown } from "lucide-react";
import type { StaffRole } from "@/lib/types";
import { PermissionCategoryNames } from "@/lib/types";
import { usePermissions } from "@/providers/permission-provider";

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

const roleDescriptions: Record<StaffRole, string> = {
  super_admin: "Supreme authority over all users, settings, and system features.",
  admin: "Full system access with all permissions enabled by default.",
  librarian: "Library management access for day-to-day operations.",
  staff: "Basic read-only access for viewing library data.",
};

export default function RolePermissionsPage() {
  const params = useParams();
  const router = useRouter();
  const role = params.role as StaffRole;

  // Validate role
  const isValidRole = ["super_admin", "admin", "librarian", "staff"].includes(role);

  const { permissions: rolePermissions, isLoading: loadingRole, refresh } = useRolePermissions(isValidRole ? role : null);
  const { categories, isLoading: loadingAll } = useAllPermissions();
  const { hasPermission } = usePermissions();
  const canManage = hasPermission(PermissionCodes.PERMISSIONS_MANAGE);

  const [editMode, setEditMode] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  // Initialize selected permissions when data loads
  if (!loadingRole && rolePermissions.length > 0 && selectedPermissions.size === 0 && !editMode) {
    setSelectedPermissions(new Set(rolePermissions.map((p) => p.code)));
  }

  const handleToggle = (code: string) => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  };

  const handleSelectAll = (category: string) => {
    const categoryPerms = categories
      .find((c) => c.category === category)
      ?.permissions.map((p) => p.code) || [];

    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      categoryPerms.forEach((code) => next.add(code));
      return next;
    });
  };

  const handleDeselectAll = (category: string) => {
    const categoryPerms = categories
      .find((c) => c.category === category)
      ?.permissions.map((p) => p.code) || [];

    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      categoryPerms.forEach((code) => next.delete(code));
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await permissionsApi.updateRolePermissions(role, {
        permissions: Array.from(selectedPermissions),
      });
      toast.success(`${roleLabels[role]} permissions updated successfully`);
      setEditMode(false);
      refresh();
    } catch {
      toast.error("Failed to save permissions");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setSelectedPermissions(new Set(rolePermissions.map((p) => p.code)));
    setEditMode(false);
  };

  const handleStartEdit = () => {
    setSelectedPermissions(new Set(rolePermissions.map((p) => p.code)));
    setEditMode(true);
  };

  if (!isValidRole) {
    return (
      <AuthGuard requiredPermission={PermissionCodes.PERMISSIONS_MANAGE}>
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <h1 className="text-2xl font-bold">Invalid Role</h1>
          <p className="text-muted-foreground">The role &quot;{role}&quot; does not exist.</p>
          <Button asChild>
            <Link href="/settings/permissions">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Permissions
            </Link>
          </Button>
        </div>
      </AuthGuard>
    );
  }

  const RoleIcon = roleIcons[role];
  const isLoading = loadingRole || loadingAll;

  if (isLoading) {
    return (
      <AuthGuard requiredPermission={PermissionCodes.PERMISSIONS_MANAGE}>
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

            <div className="flex items-center gap-4 mt-2">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64 mt-2" />
              </div>
            </div>
          </div>
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-96 w-full" />
            </CardContent>
          </Card>
        </div>
      </AuthGuard>
    );
  }

  const originalCodes = new Set(rolePermissions.map((p) => p.code));
  const hasChanges = editMode && (
    selectedPermissions.size !== originalCodes.size ||
    Array.from(selectedPermissions).some((code) => !originalCodes.has(code))
  );

  return (
    <AuthGuard requiredPermission={PermissionCodes.PERMISSIONS_MANAGE}>
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

            <div className="flex items-center gap-4 mt-2">
              <div className="rounded-lg bg-primary/10 p-2.5">
                <RoleIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {roleLabels[role]} Permissions
                </h1>
                <p className="text-muted-foreground">{roleDescriptions[role]}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {editMode ? (
              <>
                <Button variant="outline" onClick={handleCancel} disabled={saving}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={!hasChanges || saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : canManage ? (
              <Button onClick={handleStartEdit}>Edit Permissions</Button>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{selectedPermissions.size}</p>
                <p className="text-sm text-muted-foreground">Active Permissions</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{categories.length}</p>
                <p className="text-sm text-muted-foreground">Categories</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold">
                  {categories.reduce((acc, c) => acc + c.permissions.length, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Permissions</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {categories.map((category) => {
          const categoryPermCodes = category.permissions.map((p) => p.code);
          const selectedInCategory = categoryPermCodes.filter((code) =>
            selectedPermissions.has(code)
          ).length;
          const allSelected = selectedInCategory === category.permissions.length;

          return (
            <Card key={category.category}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      {PermissionCategoryNames[category.category] || category.category}
                    </CardTitle>
                    <CardDescription>
                      {selectedInCategory} of {category.permissions.length} permissions
                      enabled
                    </CardDescription>
                  </div>
                  {editMode && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectAll(category.category)}
                        disabled={allSelected}
                      >
                        Select All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeselectAll(category.category)}
                        disabled={selectedInCategory === 0}
                      >
                        Deselect All
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {category.permissions.map((perm) => {
                    const isSelected = selectedPermissions.has(perm.code);
                    return (
                      <div
                        key={perm.code}
                        className={`flex items-start gap-3 rounded-lg border p-4 ${
                          editMode
                            ? "cursor-pointer hover:bg-muted/50"
                            : isSelected
                            ? "bg-green-500/5 border-green-500/20"
                            : "bg-muted/30"
                        }`}
                        onClick={editMode ? () => handleToggle(perm.code) : undefined}
                      >
                        {editMode && (
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleToggle(perm.code)}
                            className="mt-0.5"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{perm.name}</p>
                          {perm.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {perm.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1 font-mono">
                            {perm.code}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AuthGuard>
  );
}
