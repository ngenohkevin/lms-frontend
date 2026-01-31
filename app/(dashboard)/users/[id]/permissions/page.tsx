"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AuthGuard } from "@/components/auth/auth-guard";
import { PermissionCodes } from "@/lib/types/permission";
import { useUser } from "@/lib/hooks/use-users";
import { useUserPermissions, useUserOverrides, useAllPermissions } from "@/lib/hooks/use-permissions";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Check,
  X,
  Shield,
  ShieldOff,
  Clock,
  CalendarIcon,
} from "lucide-react";
import type { OverrideType, UserPermissionOverride, Permission } from "@/lib/types";
import { PermissionCategoryNames } from "@/lib/types";
import { formatDistanceToNow, format, addDays, addMonths } from "date-fns";
import { cn } from "@/lib/utils";

export default function UserPermissionsPage() {
  const params = useParams();
  const userId = params.id as string;

  const { user, isLoading: loadingUser } = useUser(userId);
  const { permissions: effectivePerms, role, isLoading: loadingPerms, refresh: refreshPerms } = useUserPermissions(userId);
  const { overrides, isLoading: loadingOverrides, refresh: refreshOverrides } = useUserOverrides(userId);
  const { categories } = useAllPermissions();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<string>("");
  const [overrideType, setOverrideType] = useState<OverrideType>("grant");
  const [reason, setReason] = useState("");
  const [hasExpiry, setHasExpiry] = useState(false);
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isLoading = loadingUser || loadingPerms || loadingOverrides;

  // Get all permissions as a flat list
  const allPermissions: Permission[] = categories.flatMap((c) => c.permissions);

  // Get permissions not already overridden
  const availablePermissions = allPermissions.filter(
    (p) => !overrides.some((o) => o.permission_code === p.code)
  );

  const handleAddOverride = async () => {
    if (!selectedPermission) {
      toast.error("Please select a permission");
      return;
    }

    setSaving(true);
    try {
      // Convert expiry date to ISO 8601 format if set
      let formattedExpiresAt: string | undefined;
      if (hasExpiry && expiryDate) {
        // Set to end of day for the selected date
        const endOfDay = new Date(expiryDate);
        endOfDay.setHours(23, 59, 59, 999);
        formattedExpiresAt = endOfDay.toISOString();
      }

      await permissionsApi.createUserOverride(userId, {
        permission_code: selectedPermission,
        override_type: overrideType,
        reason: reason || undefined,
        expires_at: formattedExpiresAt,
      });
      toast.success("Override added successfully");
      setIsAddDialogOpen(false);
      setSelectedPermission("");
      setOverrideType("grant");
      setReason("");
      setHasExpiry(false);
      setExpiryDate(undefined);
      refreshPerms();
      refreshOverrides();
    } catch (error) {
      console.error("Failed to add override:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add override");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOverride = async (override: UserPermissionOverride) => {
    setDeletingId(override.permission_code);
    try {
      await permissionsApi.deleteUserOverride(userId, override.permission_code);
      toast.success("Override removed successfully");
      refreshPerms();
      refreshOverrides();
    } catch (error) {
      console.error("Failed to delete override:", error);
      toast.error("Failed to delete override");
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <AuthGuard requiredPermission={PermissionCodes.PERMISSIONS_MANAGE}>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/users/${userId}`}>
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
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </AuthGuard>
    );
  }

  if (!user) {
    return (
      <AuthGuard requiredPermission={PermissionCodes.PERMISSIONS_MANAGE}>
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <h1 className="text-2xl font-bold">User Not Found</h1>
          <p className="text-muted-foreground">The user could not be found.</p>
          <Button asChild>
            <Link href="/users">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Link>
          </Button>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requiredPermission={PermissionCodes.PERMISSIONS_MANAGE}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/users/${userId}`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {user.username}&apos;s Permissions
              </h1>
              <p className="text-muted-foreground">
                Manage permission overrides for this user
              </p>
            </div>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Override
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Permission Override</DialogTitle>
                <DialogDescription>
                  Grant or deny a specific permission for {user.username}. This will
                  override their role-based permissions.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Permission</Label>
                  <Select value={selectedPermission} onValueChange={setSelectedPermission}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a permission" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <div key={category.category}>
                          <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                            {PermissionCategoryNames[category.category] || category.category}
                          </div>
                          {category.permissions
                            .filter((p) => availablePermissions.some((ap) => ap.code === p.code))
                            .map((perm) => (
                              <SelectItem key={perm.code} value={perm.code}>
                                {perm.name}
                              </SelectItem>
                            ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Override Type</Label>
                  <Select
                    value={overrideType}
                    onValueChange={(v) => setOverrideType(v as OverrideType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grant">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-green-500" />
                          <span>Grant - Allow this permission</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="deny">
                        <div className="flex items-center gap-2">
                          <ShieldOff className="h-4 w-4 text-red-500" />
                          <span>Deny - Block this permission</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Reason (optional)</Label>
                  <Textarea
                    placeholder="Why is this override needed?"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label>Set Expiry Date</Label>
                    <Switch
                      checked={hasExpiry}
                      onCheckedChange={(checked) => {
                        setHasExpiry(checked);
                        if (!checked) setExpiryDate(undefined);
                      }}
                    />
                  </div>
                  {hasExpiry && (
                    <>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "justify-start text-left font-normal",
                              !expiryDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {expiryDate ? format(expiryDate, "PPP") : "Pick an expiry date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={expiryDate}
                            onSelect={setExpiryDate}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setExpiryDate(addDays(new Date(), 7))}
                        >
                          1 Week
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setExpiryDate(addMonths(new Date(), 1))}
                        >
                          1 Month
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setExpiryDate(addMonths(new Date(), 3))}
                        >
                          3 Months
                        </Button>
                      </div>
                    </>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {hasExpiry ? "Override will expire at end of selected day" : "Override will be permanent"}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddOverride} disabled={saving || !selectedPermission}>
                  {saving ? "Adding..." : "Add Override"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{effectivePerms.length}</p>
                <p className="text-sm text-muted-foreground">Effective Permissions</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold capitalize">{role}</p>
                <p className="text-sm text-muted-foreground">Base Role</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{overrides.length}</p>
                <p className="text-sm text-muted-foreground">Active Overrides</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Permission Overrides</CardTitle>
            <CardDescription>
              {overrides.length === 0
                ? "No overrides configured. This user&apos;s permissions are based entirely on their role."
                : "Custom permission grants or denials for this user."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {overrides.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No permission overrides</p>
                <p className="text-sm">Click &quot;Add Override&quot; to customize this user&apos;s permissions</p>
              </div>
            ) : (
              <div className="space-y-4">
                {overrides.map((override) => (
                  <div
                    key={override.permission_code}
                    className={`flex items-start justify-between gap-4 rounded-lg border p-4 ${
                      override.override_type === "grant"
                        ? "bg-green-500/5 border-green-500/20"
                        : "bg-red-500/5 border-red-500/20"
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {override.override_type === "grant" ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                        <p className="font-medium">{override.permission_name}</p>
                        <Badge
                          variant="outline"
                          className={
                            override.override_type === "grant"
                              ? "bg-green-500/10 text-green-700 border-green-500/20"
                              : "bg-red-500/10 text-red-700 border-red-500/20"
                          }
                        >
                          {override.override_type === "grant" ? "Granted" : "Denied"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {PermissionCategoryNames[override.permission_category] || override.permission_category} - {override.permission_code}
                      </p>
                      {override.reason && (
                        <p className="text-sm mt-2">
                          <span className="font-medium">Reason:</span> {override.reason}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        {override.granted_by_username && (
                          <span>Added by {override.granted_by_username}</span>
                        )}
                        <span>
                          Created{" "}
                          {formatDistanceToNow(new Date(override.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                        {override.expires_at && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Expires {format(new Date(override.expires_at), "PPp")}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteOverride(override)}
                      disabled={deletingId === override.permission_code}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Effective Permissions</CardTitle>
            <CardDescription>
              All permissions this user currently has, combining their role and any overrides.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {effectivePerms.map((code) => {
                const perm = allPermissions.find((p) => p.code === code);
                const isOverride = overrides.some(
                  (o) => o.permission_code === code && o.override_type === "grant"
                );
                return (
                  <Badge
                    key={code}
                    variant="outline"
                    className={
                      isOverride
                        ? "bg-green-500/10 text-green-700 border-green-500/20"
                        : ""
                    }
                  >
                    {perm?.name || code}
                    {isOverride && " (override)"}
                  </Badge>
                );
              })}
              {effectivePerms.length === 0 && (
                <p className="text-muted-foreground">No permissions</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
