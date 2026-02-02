import apiClient from "./client";
import type { AcademicYear, AcademicYearFormData, AcademicYearListResponse } from "../types/academic-year";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

const ACADEMIC_YEARS_PREFIX = "/api/v1/academic-years";

export const academicYearsApi = {
  list: async (includeInactive = false): Promise<AcademicYear[]> => {
    const response = await apiClient.get<ApiResponse<AcademicYearListResponse>>(
      ACADEMIC_YEARS_PREFIX,
      { params: { include_inactive: includeInactive ? "true" : undefined } }
    );
    return response.data.academic_years;
  },

  get: async (id: number): Promise<AcademicYear> => {
    const response = await apiClient.get<ApiResponse<AcademicYear>>(
      `${ACADEMIC_YEARS_PREFIX}/${id}`
    );
    return response.data;
  },

  create: async (data: AcademicYearFormData): Promise<AcademicYear> => {
    const response = await apiClient.post<ApiResponse<AcademicYear>>(
      ACADEMIC_YEARS_PREFIX,
      data
    );
    return response.data;
  },

  update: async (id: number, data: AcademicYearFormData): Promise<AcademicYear> => {
    const response = await apiClient.put<ApiResponse<AcademicYear>>(
      `${ACADEMIC_YEARS_PREFIX}/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${ACADEMIC_YEARS_PREFIX}/${id}`);
  },

  deactivate: async (id: number): Promise<void> => {
    await apiClient.post(`${ACADEMIC_YEARS_PREFIX}/${id}/deactivate`);
  },

  activate: async (id: number): Promise<void> => {
    await apiClient.post(`${ACADEMIC_YEARS_PREFIX}/${id}/activate`);
  },
};

export default academicYearsApi;
