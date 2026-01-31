"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { usePermissions } from "@/providers/permission-provider";
import type { UserRole, PermissionCode } from "@/lib/types";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  /** Role-based access control (legacy, prefer permissions) */
  requiredRoles?: UserRole[];
  /** Single permission required */
  requiredPermission?: PermissionCode | string;
  /** Multiple permissions - check if user has ANY (or ALL if requireAll=true) */
  requiredPermissions?: (PermissionCode | string)[];
  /** If true with requiredPermissions, user must have ALL permissions */
  requireAll?: boolean;
  fallback?: React.ReactNode;
}

export function AuthGuard({
  children,
  requiredRoles,
  requiredPermission,
  requiredPermissions,
  requireAll = false,
  fallback,
}: AuthGuardProps) {
  const { user, isLoading, isAuthenticated, setupRequired } = useAuth();
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isLoading: permissionsLoading,
  } = usePermissions();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect to login if setup is required (will redirect to /setup instead)
    if (!isLoading && !isAuthenticated && !setupRequired) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, setupRequired, router]);

  // Show loading state
  if (isLoading || permissionsLoading) {
    return (
      fallback || (
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )
    );
  }

  // Setup required - don't render anything, will redirect to /setup
  if (setupRequired) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Check permissions first (preferred over roles)
  if (requiredPermission || (requiredPermissions && requiredPermissions.length > 0)) {
    let hasAccess = false;

    if (requiredPermission) {
      hasAccess = hasPermission(requiredPermission);
    } else if (requiredPermissions && requiredPermissions.length > 0) {
      hasAccess = requireAll
        ? hasAllPermissions(requiredPermissions)
        : hasAnyPermission(requiredPermissions);
    }

    if (!hasAccess) {
      return (
        <div className="flex h-screen flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">
            You don&apos;t have permission to access this page.
          </p>
          <button
            onClick={() => router.push("/")}
            className="text-primary underline underline-offset-4"
          >
            Go to Dashboard
          </button>
        </div>
      );
    }
  }

  // Fallback to role check if no permissions specified (legacy support)
  if (requiredRoles && requiredRoles.length > 0 && user) {
    if (!requiredRoles.includes(user.role)) {
      return (
        <div className="flex h-screen flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">
            You don&apos;t have permission to access this page.
          </p>
          <button
            onClick={() => router.push("/")}
            className="text-primary underline underline-offset-4"
          >
            Go to Dashboard
          </button>
        </div>
      );
    }
  }

  return <>{children}</>;
}
