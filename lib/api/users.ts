import apiClient from "./client";
import type {
  StaffUser,
  StaffUserFormData,
  StaffUserSearchParams,
  UpdateUserStatusRequest,
  AdminResetPasswordRequest,
  RoleOption,
  PaginatedResponse,
} from "@/lib/types";

const USERS_PREFIX = "/api/v1/users";

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

// Backend user structure
interface BackendUser {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  last_login?: string | null;
  created_at: string;
  updated_at: string;
}

// Backend paginated response structure
interface BackendPaginatedUsers {
  users: BackendUser[];
  pagination: BackendPagination;
}

// Transform backend user to frontend format
function transformUser(user: BackendUser): StaffUser {
  return {
    id: String(user.id),
    username: user.username,
    email: user.email,
    role: user.role as StaffUser["role"],
    is_active: user.is_active,
    last_login: user.last_login,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

function transformUsers(users: BackendUser[]): StaffUser[] {
  return users.map(transformUser);
}

// Transform backend pagination to frontend format
function transformPagination(
  bp?: BackendPagination
): PaginatedResponse<StaffUser>["pagination"] | undefined {
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

export const usersApi = {
  // List all users with pagination and filters
  list: async (
    params?: StaffUserSearchParams
  ): Promise<PaginatedResponse<StaffUser>> => {
    const backendParams: Record<string, string | number | boolean | undefined> =
      {};
    if (params?.query) backendParams.q = params.query;
    if (params?.role) backendParams.role = params.role;
    if (params?.active !== undefined) backendParams.active = params.active;
    if (params?.page) backendParams.page = params.page;
    if (params?.per_page) backendParams.limit = params.per_page;

    const response = await apiClient.get<ApiResponse<BackendPaginatedUsers>>(
      USERS_PREFIX,
      {
        params: backendParams,
      }
    );
    return {
      data: transformUsers(response.data?.users || []),
      pagination: transformPagination(response.data?.pagination),
    };
  },

  // Get single user by ID
  get: async (id: string): Promise<StaffUser> => {
    const response = await apiClient.get<ApiResponse<BackendUser>>(
      `${USERS_PREFIX}/${id}`
    );
    return transformUser(response.data);
  },

  // Create a new user
  create: async (data: StaffUserFormData): Promise<StaffUser> => {
    const response = await apiClient.post<ApiResponse<BackendUser>>(
      USERS_PREFIX,
      data
    );
    return transformUser(response.data);
  },

  // Update a user
  update: async (
    id: string,
    data: Partial<StaffUserFormData>
  ): Promise<StaffUser> => {
    const response = await apiClient.put<ApiResponse<BackendUser>>(
      `${USERS_PREFIX}/${id}`,
      data
    );
    return transformUser(response.data);
  },

  // Delete a user (soft delete)
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${USERS_PREFIX}/${id}`);
  },

  // Update user status (activate/deactivate)
  updateStatus: async (
    id: string,
    data: UpdateUserStatusRequest
  ): Promise<StaffUser> => {
    const response = await apiClient.put<ApiResponse<BackendUser>>(
      `${USERS_PREFIX}/${id}/status`,
      data
    );
    return transformUser(response.data);
  },

  // Reset user password
  resetPassword: async (
    id: string,
    data: AdminResetPasswordRequest
  ): Promise<void> => {
    await apiClient.put(`${USERS_PREFIX}/${id}/password`, data);
  },

  // Get available roles
  getRoles: async (): Promise<RoleOption[]> => {
    const response = await apiClient.get<ApiResponse<RoleOption[]>>(
      `${USERS_PREFIX}/roles`
    );
    return response.data || [];
  },
};

export default usersApi;
