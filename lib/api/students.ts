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

// Backend response wrapper
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Backend pagination structure
interface BackendPagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

// Backend student structure (what the API actually returns)
interface BackendStudent {
  id: string;
  student_id: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department?: string;
  year_of_study?: number;
  max_books: number;
  current_books: number;
  total_borrowed: number;
  total_fines: number;
  unpaid_fines: number;
  status: string;
  created_at: string;
  updated_at: string;
}

// Backend paginated response structure
interface BackendPaginatedStudents {
  students: BackendStudent[];
  pagination: BackendPagination;
}

// Transform backend student to frontend format (combine first_name + last_name into name)
function transformStudent(student: BackendStudent): Student {
  return {
    ...student,
    name: `${student.first_name} ${student.last_name}`.trim(),
    status: student.status as Student["status"],
  };
}

function transformStudents(students: BackendStudent[]): Student[] {
  return students.map(transformStudent);
}

// Transform backend pagination to frontend format
function transformPagination(bp?: BackendPagination): PaginatedResponse<Student>["pagination"] | undefined {
  if (!bp) return undefined;
  return {
    page: bp.page,
    per_page: bp.limit,
    total: bp.total,
    total_pages: bp.total_pages,
    has_next: bp.page < bp.total_pages,
    has_prev: bp.page > 1,
  };
}

export const studentsApi = {
  // List all students with pagination
  list: async (
    params?: StudentSearchParams
  ): Promise<PaginatedResponse<Student>> => {
    const response = await apiClient.get<ApiResponse<BackendPaginatedStudents>>(STUDENTS_PREFIX, {
      params,
    });
    return {
      data: transformStudents(response.data?.students || []),
      pagination: transformPagination(response.data?.pagination),
    };
  },

  // Search students
  search: async (
    params: StudentSearchParams
  ): Promise<PaginatedResponse<Student>> => {
    const response = await apiClient.get<ApiResponse<BackendPaginatedStudents>>(
      `${STUDENTS_PREFIX}/search`,
      { params }
    );
    return {
      data: transformStudents(response.data?.students || []),
      pagination: transformPagination(response.data?.pagination),
    };
  },

  // Get single student by ID
  get: async (id: string): Promise<Student> => {
    const response = await apiClient.get<ApiResponse<BackendStudent>>(`${STUDENTS_PREFIX}/${id}`);
    return transformStudent(response.data);
  },

  // Get student by student_id (registration number)
  getByStudentId: async (studentId: string): Promise<Student> => {
    const response = await apiClient.get<ApiResponse<BackendStudent>>(`${STUDENTS_PREFIX}/by-student-id`, {
      params: { student_id: studentId },
    });
    return transformStudent(response.data);
  },

  // Create a new student
  create: async (data: StudentFormData): Promise<Student> => {
    // Transform frontend field names to backend field names
    // Split full name into first and last name
    const nameParts = data.name.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || nameParts[0] || ""; // Use first name as last if no last name

    const backendData = {
      student_id: data.student_id,
      first_name: firstName,
      last_name: lastName,
      email: data.email || undefined,
      phone: data.phone || undefined,
      year_of_study: data.year_of_study || 1,
      department: data.department || undefined,
      max_books: data.max_books || 5,
    };
    const response = await apiClient.post<ApiResponse<BackendStudent>>(STUDENTS_PREFIX, backendData);
    return transformStudent(response.data);
  },

  // Update a student
  update: async (
    id: string,
    data: Partial<StudentFormData>
  ): Promise<Student> => {
    // Transform frontend field names to backend field names
    const backendData: Record<string, unknown> = {};

    if (data.name !== undefined) {
      // Split full name into first and last name
      const nameParts = data.name.trim().split(/\s+/);
      backendData.first_name = nameParts[0] || "";
      backendData.last_name = nameParts.slice(1).join(" ") || nameParts[0] || "";
    }
    if (data.email !== undefined) backendData.email = data.email || undefined;
    if (data.phone !== undefined) backendData.phone = data.phone || undefined;
    if (data.year_of_study !== undefined) backendData.year_of_study = data.year_of_study;
    if (data.department !== undefined) backendData.department = data.department || undefined;
    if (data.max_books !== undefined) backendData.max_books = data.max_books;

    const response = await apiClient.put<ApiResponse<BackendStudent>>(`${STUDENTS_PREFIX}/${id}`, backendData);
    return transformStudent(response.data);
  },

  // Delete a student
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${STUDENTS_PREFIX}/${id}`);
  },

  // Suspend a student
  suspend: async (id: string, reason?: string): Promise<Student> => {
    const response = await apiClient.post<ApiResponse<BackendStudent>>(`${STUDENTS_PREFIX}/${id}/suspend`, {
      reason,
    });
    return transformStudent(response.data);
  },

  // Activate a student
  activate: async (id: string): Promise<Student> => {
    const response = await apiClient.post<ApiResponse<BackendStudent>>(`${STUDENTS_PREFIX}/${id}/activate`);
    return transformStudent(response.data);
  },

  // Get student analytics
  getAnalytics: async (id: string): Promise<StudentAnalytics> => {
    const response = await apiClient.get<ApiResponse<StudentAnalytics>>(
      `${STUDENTS_PREFIX}/${id}/analytics`
    );
    return response.data;
  },

  // Get student's current books
  getCurrentBooks: async (id: string): Promise<unknown[]> => {
    const response = await apiClient.get<ApiResponse<unknown[]>>(`${STUDENTS_PREFIX}/${id}/books`);
    return response.data || [];
  },

  // Get student's borrowing history
  getBorrowingHistory: async (
    id: string,
    params?: { page?: number; per_page?: number }
  ): Promise<PaginatedResponse<unknown>> => {
    const response = await apiClient.get<ApiResponse<{ history: unknown[]; pagination: BackendPagination }>>(
      `${STUDENTS_PREFIX}/${id}/history`,
      { params }
    );
    return {
      data: response.data?.history || [],
      pagination: transformPagination(response.data?.pagination),
    };
  },

  // Bulk import students
  import: async (file: File): Promise<StudentImportResult> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.upload<ApiResponse<StudentImportResult>>(
      `${STUDENTS_PREFIX}/import`,
      formData
    );
    return response.data;
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
    const response = await apiClient.get<ApiResponse<string[]>>(`${STUDENTS_PREFIX}/departments`);
    return response.data || [];
  },

  // Reset student password (admin only)
  resetPassword: async (
    id: string,
    newPassword: string
  ): Promise<{ message: string }> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      `${STUDENTS_PREFIX}/${id}/reset-password`,
      { password: newPassword }
    );
    return response.data;
  },
};

export default studentsApi;
