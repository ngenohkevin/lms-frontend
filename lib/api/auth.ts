import apiClient from "./client";
import type {
  LoginCredentials,
  LoginResponse,
  User,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from "@/lib/types";

const AUTH_PREFIX = "/api/v1/auth";

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(
      `${AUTH_PREFIX}/login`,
      credentials
    );
    if (response.tokens?.access_token) {
      apiClient.setAccessToken(response.tokens.access_token);
    }
    return response;
  },

  logout: async (): Promise<void> => {
    await apiClient.post(`${AUTH_PREFIX}/logout`);
    apiClient.setAccessToken(null);
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
    return apiClient.get<User>(`${AUTH_PREFIX}/me`);
  },
};

export default authApi;
