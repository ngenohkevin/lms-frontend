import apiClient from "./client";
import type {
  StaffRole,
  PermissionsListResponse,
  RolePermissionsResponse,
  UserEffectivePermissionsResponse,
  MyPermissionsResponse,
  UserOverridesResponse,
  UserPermissionOverride,
  PermissionMatrixResponse,
  UpdateRolePermissionsRequest,
  CreateUserOverrideRequest,
} from "@/lib/types";

const PERMISSIONS_PREFIX = "/api/v1/permissions";

// Backend response wrapper
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const permissionsApi = {
  // Get current user's permissions
  getMyPermissions: async (): Promise<MyPermissionsResponse> => {
    const response = await apiClient.get<ApiResponse<MyPermissionsResponse>>(
      `${PERMISSIONS_PREFIX}/me`
    );
    return response.data;
  },

  // List all permissions (admin only)
  listAll: async (): Promise<PermissionsListResponse> => {
    const response = await apiClient.get<ApiResponse<PermissionsListResponse>>(
      PERMISSIONS_PREFIX
    );
    return response.data;
  },

  // Get permission matrix (admin only)
  getMatrix: async (): Promise<PermissionMatrixResponse> => {
    const response = await apiClient.get<ApiResponse<PermissionMatrixResponse>>(
      `${PERMISSIONS_PREFIX}/matrix`
    );
    return response.data;
  },

  // Get permissions for a specific role (admin only)
  getRolePermissions: async (
    role: StaffRole
  ): Promise<RolePermissionsResponse> => {
    const response = await apiClient.get<ApiResponse<RolePermissionsResponse>>(
      `${PERMISSIONS_PREFIX}/roles/${role}`
    );
    return response.data;
  },

  // Update permissions for a role (admin only)
  updateRolePermissions: async (
    role: StaffRole,
    data: UpdateRolePermissionsRequest
  ): Promise<void> => {
    await apiClient.put(`${PERMISSIONS_PREFIX}/roles/${role}`, data);
  },

  // Get effective permissions for a specific user (admin only)
  getUserPermissions: async (
    userId: string
  ): Promise<UserEffectivePermissionsResponse> => {
    const response = await apiClient.get<
      ApiResponse<UserEffectivePermissionsResponse>
    >(`${PERMISSIONS_PREFIX}/users/${userId}`);
    return response.data;
  },

  // Get user overrides (admin only)
  getUserOverrides: async (userId: string): Promise<UserOverridesResponse> => {
    const response = await apiClient.get<ApiResponse<UserOverridesResponse>>(
      `${PERMISSIONS_PREFIX}/users/${userId}/overrides`
    );
    return response.data;
  },

  // Create or update a user override (admin only)
  createUserOverride: async (
    userId: string,
    data: CreateUserOverrideRequest
  ): Promise<UserPermissionOverride> => {
    const response = await apiClient.post<ApiResponse<UserPermissionOverride>>(
      `${PERMISSIONS_PREFIX}/users/${userId}/overrides`,
      data
    );
    return response.data;
  },

  // Delete a user override (admin only)
  deleteUserOverride: async (
    userId: string,
    permissionCode: string
  ): Promise<void> => {
    await apiClient.delete(
      `${PERMISSIONS_PREFIX}/users/${userId}/overrides/${permissionCode}`
    );
  },
};

export default permissionsApi;
