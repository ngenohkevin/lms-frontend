import apiClient from "./client";
import type {
  LoginCredentials,
  LoginResponse,
  User,
  ForgotPasswordRequest,
  ResetPasswordRequest,
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
      }
    );

    if (response.data?.access_token) {
      apiClient.setAccessToken(response.data.access_token);
      // Store token in cookie for middleware auth check
      if (typeof document !== "undefined") {
        document.cookie = `access_token=${response.data.access_token}; path=/; max-age=${response.data.expires_in}; SameSite=Lax`;
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
    // Clear token cookie
    if (typeof document !== "undefined") {
      document.cookie = "access_token=; path=/; max-age=0";
    }
  },

  refresh: async (): Promise<{ access_token: string }> => {
    const response = await apiClient.post<{ access_token: string }>(
      `${AUTH_PREFIX}/refresh`
    );
    if (response.access_token) {
      apiClient.setAccessToken(response.access_token);
    }
    return response;
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
};

export default authApi;
