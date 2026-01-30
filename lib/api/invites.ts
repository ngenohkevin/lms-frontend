import apiClient from "./client";
import type {
  UserInvite,
  CreateInviteRequest,
  InviteSearchParams,
  PaginatedResponse,
} from "@/lib/types";

const INVITES_PREFIX = "/api/v1/invites";

// Backend response wrapper
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Backend pagination structure
interface BackendPagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

// Backend invite structure
interface BackendInvite {
  id: number;
  email: string;
  name: string;
  role: string;
  status: string;
  invited_by: number;
  inviter_name: string;
  expires_at: string;
  accepted_at?: string;
  created_at: string;
}

// Backend paginated response structure
interface BackendPaginatedInvites {
  invites: BackendInvite[];
  pagination: BackendPagination;
}

// Transform backend invite to frontend format
function transformInvite(invite: BackendInvite): UserInvite {
  return {
    id: String(invite.id),
    email: invite.email,
    name: invite.name,
    role: invite.role as UserInvite["role"],
    status: invite.status as UserInvite["status"],
    invited_by: invite.invited_by,
    inviter_name: invite.inviter_name,
    expires_at: invite.expires_at,
    accepted_at: invite.accepted_at,
    created_at: invite.created_at,
  };
}

function transformInvites(invites: BackendInvite[]): UserInvite[] {
  return invites.map(transformInvite);
}

// Transform backend pagination to frontend format
function transformPagination(
  bp?: BackendPagination
): PaginatedResponse<UserInvite>["pagination"] | undefined {
  if (!bp) return undefined;
  return {
    page: bp.page,
    per_page: bp.limit,
    total: bp.total,
    total_pages: bp.total_pages,
    has_next: bp.page < bp.total_pages,
    has_prev: bp.page > 1,
  };
}

export const invitesApi = {
  // List all pending invites with pagination
  list: async (
    params?: InviteSearchParams
  ): Promise<PaginatedResponse<UserInvite>> => {
    const backendParams: Record<string, string | number | undefined> = {};
    if (params?.page) backendParams.page = params.page;
    if (params?.per_page) backendParams.limit = params.per_page;

    const response = await apiClient.get<ApiResponse<BackendPaginatedInvites>>(
      INVITES_PREFIX,
      { params: backendParams }
    );
    return {
      data: transformInvites(response.data?.invites || []),
      pagination: transformPagination(response.data?.pagination),
    };
  },

  // Get single invite by ID
  get: async (id: string): Promise<UserInvite> => {
    const response = await apiClient.get<ApiResponse<BackendInvite>>(
      `${INVITES_PREFIX}/${id}`
    );
    return transformInvite(response.data);
  },

  // Create a new invite
  create: async (data: CreateInviteRequest): Promise<{ invite: UserInvite; invite_url: string }> => {
    const response = await apiClient.post<ApiResponse<{ invite: BackendInvite; invite_url: string }>>(
      INVITES_PREFIX,
      data
    );
    return {
      invite: transformInvite(response.data.invite),
      invite_url: response.data.invite_url,
    };
  },

  // Delete/cancel an invite
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${INVITES_PREFIX}/${id}`);
  },

  // Resend an invite (generates new token)
  resend: async (id: string): Promise<{ invite: UserInvite; invite_url: string }> => {
    const response = await apiClient.post<ApiResponse<{ invite: BackendInvite; invite_url: string }>>(
      `${INVITES_PREFIX}/${id}/resend`
    );
    return {
      invite: transformInvite(response.data.invite),
      invite_url: response.data.invite_url,
    };
  },
};

export default invitesApi;
