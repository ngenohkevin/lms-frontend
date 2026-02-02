import apiClient from "./client";
import type { Department, DepartmentFormData, DepartmentListResponse } from "../types/department";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

const DEPARTMENTS_PREFIX = "/api/v1/departments";

export const departmentsApi = {
  list: async (includeInactive = false): Promise<Department[]> => {
    const response = await apiClient.get<ApiResponse<DepartmentListResponse>>(
      DEPARTMENTS_PREFIX,
      { params: { include_inactive: includeInactive ? "true" : undefined } }
    );
    return response.data.departments;
  },

  get: async (id: number): Promise<Department> => {
    const response = await apiClient.get<ApiResponse<Department>>(
      `${DEPARTMENTS_PREFIX}/${id}`
    );
    return response.data;
  },

  create: async (data: DepartmentFormData): Promise<Department> => {
    const response = await apiClient.post<ApiResponse<Department>>(
      DEPARTMENTS_PREFIX,
      data
    );
    return response.data;
  },

  update: async (id: number, data: DepartmentFormData): Promise<Department> => {
    const response = await apiClient.put<ApiResponse<Department>>(
      `${DEPARTMENTS_PREFIX}/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${DEPARTMENTS_PREFIX}/${id}`);
  },

  deactivate: async (id: number): Promise<void> => {
    await apiClient.post(`${DEPARTMENTS_PREFIX}/${id}/deactivate`);
  },

  activate: async (id: number): Promise<void> => {
    await apiClient.post(`${DEPARTMENTS_PREFIX}/${id}/activate`);
  },
};

export default departmentsApi;
