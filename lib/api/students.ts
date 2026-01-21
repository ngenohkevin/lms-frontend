import apiClient from "./client";
import type {
  Student,
  StudentFormData,
  StudentSearchParams,
  StudentImportResult,
  StudentAnalytics,
  PaginatedResponse,
} from "@/lib/types";

const STUDENTS_PREFIX = "/api/v1/students";

export const studentsApi = {
  // List all students with pagination
  list: async (
    params?: StudentSearchParams
  ): Promise<PaginatedResponse<Student>> => {
    return apiClient.get<PaginatedResponse<Student>>(STUDENTS_PREFIX, {
      params,
    });
  },

  // Search students
  search: async (
    params: StudentSearchParams
  ): Promise<PaginatedResponse<Student>> => {
    return apiClient.get<PaginatedResponse<Student>>(
      `${STUDENTS_PREFIX}/search`,
      { params }
    );
  },

  // Get single student by ID
  get: async (id: string): Promise<Student> => {
    return apiClient.get<Student>(`${STUDENTS_PREFIX}/${id}`);
  },

  // Get student by student_id (registration number)
  getByStudentId: async (studentId: string): Promise<Student> => {
    return apiClient.get<Student>(`${STUDENTS_PREFIX}/by-student-id`, {
      params: { student_id: studentId },
    });
  },

  // Create a new student
  create: async (data: StudentFormData): Promise<Student> => {
    return apiClient.post<Student>(STUDENTS_PREFIX, data);
  },

  // Update a student
  update: async (
    id: string,
    data: Partial<StudentFormData>
  ): Promise<Student> => {
    return apiClient.put<Student>(`${STUDENTS_PREFIX}/${id}`, data);
  },

  // Delete a student
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${STUDENTS_PREFIX}/${id}`);
  },

  // Suspend a student
  suspend: async (id: string, reason?: string): Promise<Student> => {
    return apiClient.post<Student>(`${STUDENTS_PREFIX}/${id}/suspend`, {
      reason,
    });
  },

  // Activate a student
  activate: async (id: string): Promise<Student> => {
    return apiClient.post<Student>(`${STUDENTS_PREFIX}/${id}/activate`);
  },

  // Get student analytics
  getAnalytics: async (id: string): Promise<StudentAnalytics> => {
    return apiClient.get<StudentAnalytics>(
      `${STUDENTS_PREFIX}/${id}/analytics`
    );
  },

  // Get student's current books
  getCurrentBooks: async (id: string): Promise<unknown[]> => {
    return apiClient.get<unknown[]>(`${STUDENTS_PREFIX}/${id}/books`);
  },

  // Get student's borrowing history
  getBorrowingHistory: async (
    id: string,
    params?: { page?: number; per_page?: number }
  ): Promise<PaginatedResponse<unknown>> => {
    return apiClient.get<PaginatedResponse<unknown>>(
      `${STUDENTS_PREFIX}/${id}/history`,
      { params }
    );
  },

  // Bulk import students
  import: async (file: File): Promise<StudentImportResult> => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.upload<StudentImportResult>(
      `${STUDENTS_PREFIX}/import`,
      formData
    );
  },

  // Export students to CSV
  export: async (params?: StudentSearchParams): Promise<Blob> => {
    const url = new URL(`${STUDENTS_PREFIX}/export`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    const response = await fetch(url.toString(), {
      credentials: "include",
    });
    return response.blob();
  },

  // Get departments
  getDepartments: async (): Promise<string[]> => {
    return apiClient.get<string[]>(`${STUDENTS_PREFIX}/departments`);
  },

  // Reset student password (admin only)
  resetPassword: async (
    id: string,
    newPassword: string
  ): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>(
      `${STUDENTS_PREFIX}/${id}/reset-password`,
      { password: newPassword }
    );
  },
};

export default studentsApi;
