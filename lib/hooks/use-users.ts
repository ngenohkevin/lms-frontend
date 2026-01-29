import useSWR from "swr";
import { toast } from "sonner";
import { usersApi } from "@/lib/api";
import type {
  StaffUser,
  StaffUserSearchParams,
  RoleOption,
  PaginatedResponse,
} from "@/lib/types";

// Helper to handle API errors consistently
const handleApiError = (error: Error, context: string) => {
  console.error(`${context}:`, error);
  if (!error.message.includes("Failed to fetch")) {
    toast.error(`Failed to ${context.toLowerCase()}`, {
      description: error.message || "An unexpected error occurred",
    });
  }
};

export function useUsers(params?: StaffUserSearchParams) {
  const key = params ? ["/api/v1/users", params] : "/api/v1/users";

  const { data, error, isLoading, mutate } = useSWR<
    PaginatedResponse<StaffUser>
  >(key, () => usersApi.list(params), {
    onError: (err) => handleApiError(err, "Load users"),
    shouldRetryOnError: true,
    errorRetryCount: 2,
  });

  return {
    users: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useUser(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<StaffUser>(
    id ? `/api/v1/users/${id}` : null,
    () => (id ? usersApi.get(id) : Promise.resolve(null as unknown as StaffUser)),
    {
      onError: (err) => handleApiError(err, "Load user details"),
      shouldRetryOnError: true,
      errorRetryCount: 2,
    }
  );

  return {
    user: data,
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useRoles() {
  const { data, error, isLoading } = useSWR<RoleOption[]>(
    "/api/v1/users/roles",
    () => usersApi.getRoles(),
    {
      onError: (err) => handleApiError(err, "Load roles"),
      shouldRetryOnError: true,
      errorRetryCount: 2,
    }
  );

  return {
    roles: data || [],
    isLoading,
    error,
  };
}
