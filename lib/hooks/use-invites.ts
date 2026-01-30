import useSWR from "swr";
import { toast } from "sonner";
import { invitesApi } from "@/lib/api";
import type {
  UserInvite,
  InviteSearchParams,
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

export function useInvites(params?: InviteSearchParams) {
  const key = params ? ["/api/v1/invites", params] : "/api/v1/invites";

  const { data, error, isLoading, mutate } = useSWR<
    PaginatedResponse<UserInvite>
  >(key, () => invitesApi.list(params), {
    onError: (err) => handleApiError(err, "Load invites"),
    shouldRetryOnError: true,
    errorRetryCount: 2,
  });

  return {
    invites: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useInvite(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<UserInvite>(
    id ? `/api/v1/invites/${id}` : null,
    () => (id ? invitesApi.get(id) : Promise.resolve(null as unknown as UserInvite)),
    {
      onError: (err) => handleApiError(err, "Load invite details"),
      shouldRetryOnError: true,
      errorRetryCount: 2,
    }
  );

  return {
    invite: data,
    isLoading,
    error,
    refresh: mutate,
  };
}
