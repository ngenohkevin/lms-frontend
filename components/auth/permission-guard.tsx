"use client";

import type { ReactNode } from "react";
import { usePermissions } from "@/providers";
import type { PermissionCode } from "@/lib/types";
import { Loader2, ShieldAlert } from "lucide-react";

interface PermissionGuardProps {
  children: ReactNode;
  /** Single permission required */
  permission?: PermissionCode | string;
  /** Multiple permissions - check if user has ANY of these */
  permissions?: (PermissionCode | string)[];
  /** If true, user must have ALL permissions (default: false = any) */
  requireAll?: boolean;
  /** Fallback content to show when loading */
  loadingFallback?: ReactNode;
  /** Fallback content to show when permission denied */
  deniedFallback?: ReactNode;
  /** If true, render nothing when denied (default: false = show denied message) */
  hideWhenDenied?: boolean;
}

/**
 * PermissionGuard component for conditionally rendering content based on user permissions.
 *
 * @example Single permission
 * ```tsx
 * <PermissionGuard permission="books.create">
 *   <AddBookButton />
 * </PermissionGuard>
 * ```
 *
 * @example Any of multiple permissions
 * ```tsx
 * <PermissionGuard permissions={["books.create", "books.update"]}>
 *   <EditBookButton />
 * </PermissionGuard>
 * ```
 *
 * @example All permissions required
 * ```tsx
 * <PermissionGuard permissions={["reports.view", "reports.export"]} requireAll>
 *   <ExportReportButton />
 * </PermissionGuard>
 * ```
 *
 * @example Hide when denied (no fallback message)
 * ```tsx
 * <PermissionGuard permission="users.manage" hideWhenDenied>
 *   <AdminOnlyFeature />
 * </PermissionGuard>
 * ```
 */
export function PermissionGuard({
  children,
  permission,
  permissions,
  requireAll = false,
  loadingFallback,
  deniedFallback,
  hideWhenDenied = false,
}: PermissionGuardProps) {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isLoading,
  } = usePermissions();

  // Show loading state
  if (isLoading) {
    return (
      loadingFallback ?? (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )
    );
  }

  // Check permissions
  let hasAccess = false;

  if (permission) {
    // Single permission check
    hasAccess = hasPermission(permission);
  } else if (permissions && permissions.length > 0) {
    // Multiple permissions check
    hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  } else {
    // No permissions specified - allow access
    hasAccess = true;
  }

  // Render children if has access
  if (hasAccess) {
    return <>{children}</>;
  }

  // Hide when denied
  if (hideWhenDenied) {
    return null;
  }

  // Show denied fallback
  return (
    deniedFallback ?? (
      <div className="flex flex-col items-center justify-center gap-2 p-4 text-muted-foreground">
        <ShieldAlert className="h-5 w-5" />
        <span className="text-sm">Permission denied</span>
      </div>
    )
  );
}

/**
 * HOC version of PermissionGuard for wrapping entire components
 */
export function withPermission<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  permission: PermissionCode | string
) {
  return function PermissionWrapper(props: P) {
    return (
      <PermissionGuard permission={permission} hideWhenDenied>
        <WrappedComponent {...props} />
      </PermissionGuard>
    );
  };
}

/**
 * HOC version for multiple permissions
 */
export function withPermissions<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  permissions: (PermissionCode | string)[],
  requireAll = false
) {
  return function PermissionsWrapper(props: P) {
    return (
      <PermissionGuard permissions={permissions} requireAll={requireAll} hideWhenDenied>
        <WrappedComponent {...props} />
      </PermissionGuard>
    );
  };
}
