import useSWR from "swr";
import { toast } from "sonner";
import { permissionsApi } from "@/lib/api";
import type {
  MyPermissionsResponse,
  PermissionsListResponse,
  PermissionMatrixResponse,
  RolePermissionsResponse,
  UserEffectivePermissionsResponse,
  UserOverridesResponse,
  StaffRole,
} from "@/lib/types";

// Helper to handle API errors consistently
const handleApiError = (error: Error, context: string) => {
  // Don't log or show toast for permission errors - these are expected
  // when user doesn't have access and will be handled by AuthGuard
  const isPermissionError =
    error.message.includes("permission") ||
    error.message.includes("Forbidden") ||
    error.message.includes("INSUFFICIENT_PERMISSIONS");

  if (isPermissionError) {
    return; // Silently ignore - AuthGuard will show access denied
  }

  // Don't show toast for network errors (already logged by browser)
  if (error.message.includes("Failed to fetch")) {
    console.error(`${context}:`, error);
    return;
  }

  // Log and show toast for other errors
  console.error(`${context}:`, error);
  toast.error(`Failed to ${context.toLowerCase()}`, {
    description: error.message || "An unexpected error occurred",
  });
};

// Hook for current user's permissions
export function useMyPermissions() {
  const { data, error, isLoading, mutate } = useSWR<MyPermissionsResponse>(
    "/api/v1/permissions/me",
    () => permissionsApi.getMyPermissions(),
    {
      onError: (err) => handleApiError(err, "Load your permissions"),
      shouldRetryOnError: true,
      errorRetryCount: 2,
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  return {
    permissions: data?.permissions || [],
    role: data?.role,
    total: data?.total || 0,
    isLoading,
    error,
    refresh: mutate,
  };
}

// Hook for all permissions (admin only)
export function useAllPermissions() {
  const { data, error, isLoading, mutate } = useSWR<PermissionsListResponse>(
    "/api/v1/permissions",
    () => permissionsApi.listAll(),
    {
      onError: (err) => handleApiError(err, "Load permissions"),
      shouldRetryOnError: (err) => {
        const msg = err?.message || "";
        return !msg.includes("permission") && !msg.includes("Forbidden");
      },
      errorRetryCount: 2,
    }
  );

  return {
    categories: data?.categories || [],
    total: data?.total || 0,
    isLoading,
    error,
    refresh: mutate,
  };
}

// Hook for permission matrix (admin only)
export function usePermissionMatrix() {
  const { data, error, isLoading, mutate } = useSWR<PermissionMatrixResponse>(
    "/api/v1/permissions/matrix",
    () => permissionsApi.getMatrix(),
    {
      onError: (err) => handleApiError(err, "Load permission matrix"),
      shouldRetryOnError: (err) => {
        // Don't retry on permission errors
        const msg = err?.message || "";
        return !msg.includes("permission") && !msg.includes("Forbidden");
      },
      errorRetryCount: 2,
    }
  );

  return {
    categories: data?.categories || [],
    isLoading,
    error,
    refresh: mutate,
  };
}

// Hook for role permissions (admin only)
export function useRolePermissions(role: StaffRole | null) {
  const { data, error, isLoading, mutate } = useSWR<RolePermissionsResponse>(
    role ? `/api/v1/permissions/roles/${role}` : null,
    () => (role ? permissionsApi.getRolePermissions(role) : Promise.resolve(null as unknown as RolePermissionsResponse)),
    {
      onError: (err) => handleApiError(err, "Load role permissions"),
      shouldRetryOnError: (err) => {
        const msg = err?.message || "";
        return !msg.includes("permission") && !msg.includes("Forbidden");
      },
      errorRetryCount: 2,
    }
  );

  return {
    role: data?.role,
    permissions: data?.permissions || [],
    total: data?.total || 0,
    isLoading,
    error,
    refresh: mutate,
  };
}

// Hook for user effective permissions (admin only)
export function useUserPermissions(userId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<UserEffectivePermissionsResponse>(
    userId ? `/api/v1/permissions/users/${userId}` : null,
    () => (userId ? permissionsApi.getUserPermissions(userId) : Promise.resolve(null as unknown as UserEffectivePermissionsResponse)),
    {
      onError: (err) => handleApiError(err, "Load user permissions"),
      shouldRetryOnError: (err) => {
        const msg = err?.message || "";
        return !msg.includes("permission") && !msg.includes("Forbidden");
      },
      errorRetryCount: 2,
    }
  );

  return {
    userId: data?.user_id,
    username: data?.username,
    role: data?.role,
    permissions: data?.permissions || [],
    overrides: data?.overrides || [],
    total: data?.total || 0,
    isLoading,
    error,
    refresh: mutate,
  };
}

// Hook for user overrides (admin only)
export function useUserOverrides(userId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<UserOverridesResponse>(
    userId ? `/api/v1/permissions/users/${userId}/overrides` : null,
    () => (userId ? permissionsApi.getUserOverrides(userId) : Promise.resolve(null as unknown as UserOverridesResponse)),
    {
      onError: (err) => handleApiError(err, "Load user overrides"),
      shouldRetryOnError: (err) => {
        const msg = err?.message || "";
        return !msg.includes("permission") && !msg.includes("Forbidden");
      },
      errorRetryCount: 2,
    }
  );

  return {
    userId: data?.user_id,
    username: data?.username,
    overrides: data?.overrides || [],
    total: data?.total || 0,
    isLoading,
    error,
    refresh: mutate,
  };
}
