"use client";

import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import useSWR from "swr";
import { permissionsApi } from "@/lib/api";
import type { MyPermissionsResponse, StaffRole, PermissionCode } from "@/lib/types";
import { useAuth } from "./auth-provider";

interface PermissionContextType {
  permissions: string[];
  role: StaffRole | undefined;
  isLoading: boolean;
  error: Error | null;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  refreshPermissions: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export function PermissionProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();

  // Fetch permissions only when authenticated
  const { data, error, isLoading, mutate } = useSWR<MyPermissionsResponse>(
    isAuthenticated ? "/api/v1/permissions/me" : null,
    () => permissionsApi.getMyPermissions(),
    {
      revalidateOnFocus: true, // Refresh when user comes back to tab
      revalidateOnReconnect: true, // Refresh on network reconnect
      refreshInterval: 30000, // Refresh every 30 seconds for permission updates
      dedupingInterval: 5000, // 5 second deduping (reduced from 1 minute)
      shouldRetryOnError: true,
      errorRetryCount: 2,
    }
  );

  // Refresh permissions when user changes
  useEffect(() => {
    if (isAuthenticated) {
      mutate();
    }
  }, [isAuthenticated, user?.id, mutate]);

  const permissions = data?.permissions || [];
  const role = data?.role;

  const hasPermission = useCallback(
    (permission: string): boolean => {
      return permissions.includes(permission);
    },
    [permissions]
  );

  const hasAnyPermission = useCallback(
    (perms: string[]): boolean => {
      return perms.some((p) => permissions.includes(p));
    },
    [permissions]
  );

  const hasAllPermissions = useCallback(
    (perms: string[]): boolean => {
      return perms.every((p) => permissions.includes(p));
    },
    [permissions]
  );

  const refreshPermissions = useCallback(async (): Promise<void> => {
    await mutate();
  }, [mutate]);

  const value: PermissionContextType = {
    permissions,
    role,
    isLoading,
    error: error || null,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    refreshPermissions,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error("usePermissions must be used within a PermissionProvider");
  }
  return context;
}

// Convenience hook for checking a single permission
export function useHasPermission(permission: PermissionCode | string): boolean {
  const { hasPermission, isLoading } = usePermissions();
  return !isLoading && hasPermission(permission);
}

// Convenience hook for checking any of multiple permissions
export function useHasAnyPermission(permissions: (PermissionCode | string)[]): boolean {
  const { hasAnyPermission, isLoading } = usePermissions();
  return !isLoading && hasAnyPermission(permissions);
}

// Convenience hook for checking all permissions
export function useHasAllPermissions(permissions: (PermissionCode | string)[]): boolean {
  const { hasAllPermissions, isLoading } = usePermissions();
  return !isLoading && hasAllPermissions(permissions);
}
