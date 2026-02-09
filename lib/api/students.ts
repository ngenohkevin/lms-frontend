import apiClient from "./client";
import type {
  Student,
  StudentFormData,
  StudentSearchParams,
  StudentImportResult,
  StudentAnalytics,
  PaginatedResponse,
  BulkStatusUpdateRequest,
  BulkStatusUpdateResponse,
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
  id: string | number;
  student_id: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  year_of_study?: number;
  max_books?: number;
  // These fields may or may not be present depending on the endpoint
  current_books?: number;
  total_borrowed?: number;
  total_fines?: number;
  unpaid_fines?: number;
  // Backend returns is_active boolean, not status string
  is_active?: boolean;
  status?: string;
  suspension_reason?: string;
  graduated_at?: string;
  admin_notes?: string;
  enrollment_date?: string;
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
  // Determine status from is_active boolean or status string
  let status: Student["status"] = "active";
  if (student.status) {
    status = student.status as Student["status"];
  } else if (student.is_active !== undefined) {
    status = student.is_active ? "active" : "suspended";
  }

  return {
    id: String(student.id),
    student_id: student.student_id,
    first_name: student.first_name,
    last_name: student.last_name,
    name: `${student.first_name} ${student.last_name}`.trim(),
    email: student.email || "",
    phone: student.phone,
    year_of_study: student.year_of_study,
    enrollment_date: student.enrollment_date,
    max_books: student.max_books ?? 5,
    current_books: student.current_books ?? 0,
    total_borrowed: student.total_borrowed ?? 0,
    total_fines: student.total_fines ?? 0,
    unpaid_fines: student.unpaid_fines ?? 0,
    status,
    suspension_reason: student.suspension_reason,
    graduated_at: student.graduated_at,
    admin_notes: student.admin_notes,
    created_at: student.created_at,
    updated_at: student.updated_at,
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
    // Transform frontend params to backend format
    const backendParams: Record<string, string | number | boolean | undefined> = {};
    if (params?.query) backendParams.q = params.query;
    if (params?.year_of_study) backendParams.year = params.year_of_study;
    if (params?.status) backendParams.active = params.status === "active";
    if (params?.page) backendParams.page = params.page;
    if (params?.per_page) backendParams.limit = params.per_page;
    // Note: has_overdue and has_fines are frontend-only filters for now
    // Backend would need to implement these

    const response = await apiClient.get<ApiResponse<BackendPaginatedStudents>>(STUDENTS_PREFIX, {
      params: backendParams,
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
    // Transform frontend params to backend format
    // Backend uses 'q' for query, 'limit' for per_page
    const backendParams: Record<string, string | number | boolean | undefined> = {};
    if (params.query) backendParams.q = params.query;
    if (params.year_of_study) backendParams.year = params.year_of_study;
    if (params.status) backendParams.active = params.status === "active";
    if (params.page) backendParams.page = params.page;
    if (params.per_page) backendParams.limit = params.per_page;

    const response = await apiClient.get<ApiResponse<BackendPaginatedStudents>>(
      `${STUDENTS_PREFIX}/search`,
      { params: backendParams }
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
    const backendData = {
      student_id: data.student_id,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email || undefined,
      phone: data.phone || undefined,
      year_of_study: data.year_of_study || 1,
      max_books: data.max_books || 5,
      enrollment_date: data.enrollment_date || undefined,
    };
    const response = await apiClient.post<ApiResponse<BackendStudent>>(STUDENTS_PREFIX, backendData);
    return transformStudent(response.data);
  },

  // Update a student
  update: async (
    id: string,
    data: Partial<StudentFormData>
  ): Promise<Student> => {
    const backendData: Record<string, unknown> = {};

    if (data.first_name !== undefined) backendData.first_name = data.first_name;
    if (data.last_name !== undefined) backendData.last_name = data.last_name;
    if (data.email !== undefined) backendData.email = data.email || undefined;
    if (data.phone !== undefined) backendData.phone = data.phone || undefined;
    if (data.year_of_study !== undefined) backendData.year_of_study = data.year_of_study;
    if (data.max_books !== undefined) backendData.max_books = data.max_books;
    if (data.enrollment_date !== undefined) backendData.enrollment_date = data.enrollment_date;

    const response = await apiClient.put<ApiResponse<BackendStudent>>(`${STUDENTS_PREFIX}/${id}`, backendData);
    return transformStudent(response.data);
  },

  // Delete a student
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${STUDENTS_PREFIX}/${id}`);
  },

  // Suspend a student (reason is required)
  suspend: async (id: string, reason: string): Promise<Student> => {
    const response = await apiClient.post<ApiResponse<BackendStudent>>(`${STUDENTS_PREFIX}/${id}/suspend`, {
      reason,
    });
    return transformStudent(response.data);
  },

  // Reactivate a suspended/inactive student
  reactivate: async (id: string): Promise<Student> => {
    const response = await apiClient.post<ApiResponse<BackendStudent>>(`${STUDENTS_PREFIX}/${id}/reactivate`);
    return transformStudent(response.data);
  },

  // Graduate a student
  graduate: async (id: string, graduatedAt?: string): Promise<Student> => {
    const response = await apiClient.post<ApiResponse<BackendStudent>>(`${STUDENTS_PREFIX}/${id}/graduate`, {
      graduated_at: graduatedAt,
    });
    return transformStudent(response.data);
  },

  // Update admin notes for a student
  updateAdminNotes: async (id: string, adminNotes: string): Promise<Student> => {
    const response = await apiClient.put<ApiResponse<BackendStudent>>(`${STUDENTS_PREFIX}/${id}/admin-notes`, {
      admin_notes: adminNotes,
    });
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
      `${STUDENTS_PREFIX}/bulk-import`,
      formData
    );
    return response.data;
  },

  // Export students to CSV (with authentication)
  export: async (params?: StudentSearchParams): Promise<Blob> => {
    return apiClient.download(`${STUDENTS_PREFIX}/export`, { params });
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

  // Bulk update student status
  bulkUpdateStatus: async (data: BulkStatusUpdateRequest): Promise<BulkStatusUpdateResponse> => {
    const response = await apiClient.put<ApiResponse<BulkStatusUpdateResponse>>(
      `${STUDENTS_PREFIX}/status/bulk`,
      data
    );
    return response.data;
  },
};

export default studentsApi;
