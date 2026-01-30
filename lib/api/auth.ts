import apiClient from "./client";
import type {
  LoginCredentials,
  LoginResponse,
  User,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  SetupRequest,
  SetupCheckResponse,
  AcceptInviteRequest,
  ValidateInviteResponse,
  StaffUser,
} from "@/lib/types";

const AUTH_PREFIX = "/api/v1/auth";

// Backend response wrapper
interface ApiLoginResponse {
  success: boolean;
  data: {
    user: User;
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
  };
  message: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    // Backend expects 'username' field, but we use email for login
    const response = await apiClient.post<ApiLoginResponse>(
      `${AUTH_PREFIX}/login`,
      {
        username: credentials.email,
        password: credentials.password,
      },
      { skipAuthRedirect: true }
    );

    if (response.data?.access_token) {
      apiClient.setAccessToken(response.data.access_token);
      // Store tokens in cookies for middleware auth check and token refresh
      if (typeof document !== "undefined") {
        document.cookie = `access_token=${response.data.access_token}; path=/; max-age=${response.data.expires_in}; SameSite=Lax`;
        if (response.data.refresh_token) {
          // Refresh token lasts 7 days
          document.cookie = `refresh_token=${response.data.refresh_token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        }
      }
    }

    // Transform to expected LoginResponse format
    return {
      user: response.data.user as unknown as User,
      tokens: {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        expires_at: new Date(Date.now() + response.data.expires_in * 1000).toISOString(),
      },
    };
  },

  logout: async (): Promise<void> => {
    await apiClient.post(`${AUTH_PREFIX}/logout`);
    apiClient.setAccessToken(null);
    // Clear token cookies
    if (typeof document !== "undefined") {
      document.cookie = "access_token=; path=/; max-age=0";
      document.cookie = "refresh_token=; path=/; max-age=0";
    }
  },

  refresh: async (): Promise<{ access_token: string }> => {
    // Get refresh token from cookie
    let refreshToken = "";
    if (typeof document !== "undefined") {
      const cookies = document.cookie.split(";");
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split("=");
        if (name === "refresh_token") {
          refreshToken = value;
          break;
        }
      }
    }

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await apiClient.post<{
      success: boolean;
      data: {
        access_token: string;
        refresh_token: string;
        expires_in: number;
      };
    }>(`${AUTH_PREFIX}/refresh`, { refresh_token: refreshToken });

    if (response.data?.access_token) {
      apiClient.setAccessToken(response.data.access_token);
      // Update tokens in cookies
      if (typeof document !== "undefined") {
        document.cookie = `access_token=${response.data.access_token}; path=/; max-age=${response.data.expires_in}; SameSite=Lax`;
        if (response.data.refresh_token) {
          document.cookie = `refresh_token=${response.data.refresh_token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        }
      }
    }
    return { access_token: response.data.access_token };
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
    await apiClient.post(`${AUTH_PREFIX}/forgot-password`, data);
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    await apiClient.post(`${AUTH_PREFIX}/reset-password`, data);
  },

  me: async (): Promise<User> => {
    // API uses /profile endpoint, not /auth/me
    const response = await apiClient.get<{ success: boolean; data: User }>("/api/v1/profile");
    return response.data;
  },

  // Setup endpoints (public - no auth required)
  checkSetup: async (): Promise<SetupCheckResponse> => {
    const response = await apiClient.get<{ success: boolean; data: SetupCheckResponse }>(
      "/api/v1/setup/check",
      { skipAuthRedirect: true }
    );
    return response.data;
  },

  createFirstAdmin: async (data: SetupRequest): Promise<StaffUser> => {
    const response = await apiClient.post<{ success: boolean; data: StaffUser }>(
      "/api/v1/setup",
      data,
      { skipAuthRedirect: true }
    );
    return response.data;
  },

  // Invite validation and acceptance (public - no auth required)
  validateInvite: async (token: string): Promise<ValidateInviteResponse> => {
    const response = await apiClient.get<{ success: boolean; data: ValidateInviteResponse }>(
      `${AUTH_PREFIX}/invite/${token}`,
      { skipAuthRedirect: true }
    );
    return response.data;
  },

  acceptInvite: async (data: AcceptInviteRequest): Promise<StaffUser> => {
    const response = await apiClient.post<{ success: boolean; data: StaffUser }>(
      `${AUTH_PREFIX}/invite/accept`,
      data,
      { skipAuthRedirect: true }
    );
    return response.data;
  },
};

export default authApi;
