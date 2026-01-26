import apiClient from "./client";

export interface Category {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryListResponse {
  categories: Category[];
  total: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

const CATEGORIES_PREFIX = "/api/v1/categories";

export const categoriesApi = {
  list: async (includeInactive = false): Promise<Category[]> => {
    const response = await apiClient.get<ApiResponse<CategoryListResponse>>(
      CATEGORIES_PREFIX,
      { params: { include_inactive: includeInactive ? "true" : undefined } }
    );
    return response.data.categories;
  },

  get: async (id: number): Promise<Category> => {
    const response = await apiClient.get<ApiResponse<Category>>(
      `${CATEGORIES_PREFIX}/${id}`
    );
    return response.data;
  },

  create: async (data: { name: string; description?: string }): Promise<Category> => {
    const response = await apiClient.post<ApiResponse<Category>>(
      CATEGORIES_PREFIX,
      data
    );
    return response.data;
  },

  update: async (id: number, data: { name: string; description?: string }): Promise<Category> => {
    const response = await apiClient.put<ApiResponse<Category>>(
      `${CATEGORIES_PREFIX}/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${CATEGORIES_PREFIX}/${id}`);
  },

  deactivate: async (id: number): Promise<void> => {
    await apiClient.post(`${CATEGORIES_PREFIX}/${id}/deactivate`);
  },

  activate: async (id: number): Promise<void> => {
    await apiClient.post(`${CATEGORIES_PREFIX}/${id}/activate`);
  },
};

export default categoriesApi;
