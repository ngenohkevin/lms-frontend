import apiClient from "./client";

export interface Language {
  id: number;
  code: string;
  name: string;
  native_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LanguageListResponse {
  languages: Language[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

const LANGUAGES_PREFIX = "/api/v1/languages";

export const languagesApi = {
  list: async (includeInactive = false, page = 1, limit = 100): Promise<Language[]> => {
    const response = await apiClient.get<ApiResponse<LanguageListResponse>>(
      LANGUAGES_PREFIX,
      { params: { include_inactive: includeInactive ? "true" : undefined, page, limit } }
    );
    return response.data.languages;
  },

  get: async (id: number): Promise<Language> => {
    const response = await apiClient.get<ApiResponse<Language>>(
      `${LANGUAGES_PREFIX}/${id}`
    );
    return response.data;
  },

  create: async (data: { code: string; name: string; native_name?: string }): Promise<Language> => {
    const response = await apiClient.post<ApiResponse<Language>>(
      LANGUAGES_PREFIX,
      data
    );
    return response.data;
  },

  update: async (id: number, data: { code?: string; name?: string; native_name?: string; is_active?: boolean }): Promise<Language> => {
    const response = await apiClient.put<ApiResponse<Language>>(
      `${LANGUAGES_PREFIX}/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${LANGUAGES_PREFIX}/${id}`);
  },

  deactivate: async (id: number): Promise<void> => {
    await apiClient.post(`${LANGUAGES_PREFIX}/${id}/deactivate`);
  },

  activate: async (id: number): Promise<void> => {
    await apiClient.post(`${LANGUAGES_PREFIX}/${id}/activate`);
  },
};

export default languagesApi;
