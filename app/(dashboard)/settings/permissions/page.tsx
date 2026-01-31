"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/auth/auth-guard";
import { PermissionCodes } from "@/lib/types/permission";
import { usePermissionMatrix } from "@/lib/hooks/use-permissions";
import { permissionsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Check, X, Save, Shield, UserCog, User, ArrowLeft } from "lucide-react";
import type { StaffRole, PermissionMatrixEntry } from "@/lib/types";
import { PermissionCategoryNames } from "@/lib/types";

const roleIcons: Record<StaffRole, React.ComponentType<{ className?: string }>> = {
  admin: Shield,
  librarian: UserCog,
  staff: User,
};

const roleLabels: Record<StaffRole, string> = {
  admin: "Admin",
  librarian: "Librarian",
  staff: "Staff",
};

export default function PermissionsPage() {
  const { categories, isLoading, refresh } = usePermissionMatrix();
  const [editMode, setEditMode] = useState(false);
  const [changes, setChanges] = useState<Record<string, Record<StaffRole, boolean>>>({});
  const [saving, setSaving] = useState(false);

  const handleToggle = (code: string, role: StaffRole, currentValue: boolean) => {
    setChanges((prev) => ({
      ...prev,
      [code]: {
        ...(prev[code] || {}),
        [role]: !currentValue,
      },
    }));
  };

  const getEffectiveValue = (perm: PermissionMatrixEntry, role: StaffRole): boolean => {
    if (changes[perm.code]?.[role] !== undefined) {
      return changes[perm.code][role];
    }
    return perm[role];
  };

  const hasChanges = Object.keys(changes).length > 0;

  const handleSave = async () => {
    setSaving(true);
    try {
      // Group changes by role
      const roleChanges: Record<StaffRole, string[]> = {
        admin: [],
        librarian: [],
        staff: [],
      };

      // Build the new permission sets for each role
      for (const cat of categories) {
        for (const perm of cat.permissions) {
          for (const role of ["admin", "librarian", "staff"] as StaffRole[]) {
            const effectiveValue = getEffectiveValue(perm, role);
            if (effectiveValue) {
              roleChanges[role].push(perm.code);
            }
          }
        }
      }

      // Save each role's permissions
      for (const role of ["admin", "librarian", "staff"] as StaffRole[]) {
        await permissionsApi.updateRolePermissions(role, {
          permissions: roleChanges[role],
        });
      }

      toast.success("Permissions updated successfully");
      setChanges({});
      setEditMode(false);
      refresh();
    } catch (error) {
      console.error("Failed to save permissions:", error);
      toast.error("Failed to save permissions");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setChanges({});
    setEditMode(false);
  };

  if (isLoading) {
    return (
      <AuthGuard requiredPermission={PermissionCodes.PERMISSIONS_VIEW}>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/settings">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64 mt-2" />
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

  return (
    <AuthGuard requiredPermission={PermissionCodes.PERMISSIONS_VIEW}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/settings">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Permissions</h1>
              <p className="text-muted-foreground">
                Manage role-based permissions for the system
              </p>
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
            ) : (
              <Button onClick={() => setEditMode(true)}>Edit Permissions</Button>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Permission Matrix</CardTitle>
            <CardDescription>
              View and manage which permissions are assigned to each role.
              {editMode && " Click on checkboxes to toggle permissions."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Permission</TableHead>
                    {(["admin", "librarian", "staff"] as StaffRole[]).map((role) => {
                      const RoleIcon = roleIcons[role];
                      return (
                        <TableHead key={role} className="text-center w-[120px]">
                          <div className="flex flex-col items-center gap-1">
                            <RoleIcon className="h-4 w-4" />
                            <span>{roleLabels[role]}</span>
                          </div>
                        </TableHead>
                      );
                    })}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <>
                      <TableRow key={category.category} className="bg-muted/50">
                        <TableCell colSpan={4} className="font-semibold">
                          {PermissionCategoryNames[category.category] || category.category}
                        </TableCell>
                      </TableRow>
                      {category.permissions.map((perm) => (
                        <TableRow key={perm.code}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{perm.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {perm.code}
                              </p>
                            </div>
                          </TableCell>
                          {(["admin", "librarian", "staff"] as StaffRole[]).map(
                            (role) => {
                              const value = getEffectiveValue(perm, role);
                              const isChanged = changes[perm.code]?.[role] !== undefined;
                              return (
                                <TableCell key={role} className="text-center">
                                  {editMode ? (
                                    <Checkbox
                                      checked={value}
                                      onCheckedChange={() =>
                                        handleToggle(perm.code, role, value)
                                      }
                                      className={isChanged ? "ring-2 ring-primary" : ""}
                                    />
                                  ) : value ? (
                                    <Badge
                                      variant="outline"
                                      className="bg-green-500/10 text-green-700 border-green-500/20"
                                    >
                                      <Check className="h-3 w-3" />
                                    </Badge>
                                  ) : (
                                    <Badge
                                      variant="outline"
                                      className="bg-gray-500/10 text-gray-500 border-gray-500/20"
                                    >
                                      <X className="h-3 w-3" />
                                    </Badge>
                                  )}
                                </TableCell>
                              );
                            }
                          )}
                        </TableRow>
                      ))}
                    </>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Role Details</CardTitle>
            <CardDescription>
              Click on a role to view and edit its permissions individually.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {(["admin", "librarian", "staff"] as StaffRole[]).map((role) => {
                const RoleIcon = roleIcons[role];
                const permCount = categories.reduce(
                  (acc, cat) =>
                    acc +
                    cat.permissions.filter((p) => getEffectiveValue(p, role)).length,
                  0
                );
                const totalPerms = categories.reduce(
                  (acc, cat) => acc + cat.permissions.length,
                  0
                );
                return (
                  <Link
                    key={role}
                    href={`/settings/permissions/roles/${role}`}
                    className="block"
                  >
                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-primary/10 p-2">
                            <RoleIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{roleLabels[role]}</h3>
                            <p className="text-sm text-muted-foreground">
                              {permCount} of {totalPerms} permissions
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
