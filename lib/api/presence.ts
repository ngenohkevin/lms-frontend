import apiClient from "./client";
import type { OnlineUsersResponse } from "@/lib/types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const presenceApi = {
  getOnlineUsers: async (): Promise<OnlineUsersResponse> => {
    const response = await apiClient.get<ApiResponse<OnlineUsersResponse>>(
      "/api/v1/users/online"
    );
    return response.data || { users: [], total: 0 };
  },
};

export default presenceApi;
