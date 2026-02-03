export interface Student {
  id: string;
  student_id: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  name: string; // Computed: first_name + " " + last_name
  email: string;
  phone?: string;
  department?: string;
  department_id?: number;
  department_name?: string;
  year_of_study?: number;
  enrollment_date?: string;
  max_books: number;
  current_books: number;
  total_borrowed: number;
  total_fines: number;
  unpaid_fines: number;
  status: StudentStatus;
  suspension_reason?: string;
  graduated_at?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export type StudentStatus = "active" | "suspended" | "graduated" | "inactive";

export interface StudentFormData {
  student_id: string;
  first_name: string;
  last_name: string;
  email?: string; // Optional
  phone?: string;
  department_id?: number;
  year_of_study?: number;
  max_books?: number;
  enrollment_date?: string;
  admin_notes?: string;
  password?: string;
}

export interface StudentSearchParams {
  query?: string;
  department?: string;
  year_of_study?: number;
  status?: StudentStatus;
  has_overdue?: boolean;
  has_fines?: boolean;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface StudentImportData {
  student_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  department?: string;
  year_of_study?: number;
}

export interface StudentImportResult {
  success: number;
  failed: number;
  errors: Array<{
    row: number;
    student_id: string;
    error: string;
  }>;
}

export interface StudentAnalytics {
  total_borrowed: number;
  books_on_hand: number;
  overdue_count: number;
  total_fines: number;
  unpaid_fines: number;
  favorite_categories: Array<{
    category: string;
    count: number;
  }>;
  borrowing_history: Array<{
    month: string;
    count: number;
  }>;
}

export interface SuspendStudentRequest {
  reason: string;
}

export interface GraduateStudentRequest {
  graduated_at?: string;
}

export interface UpdateAdminNotesRequest {
  admin_notes: string;
}

export const STUDENT_STATUSES: StudentStatus[] = [
  "active",
  "suspended",
  "graduated",
  "inactive",
];

export const getStatusColor = (status: StudentStatus): string => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "suspended":
      return "bg-red-100 text-red-800";
    case "graduated":
      return "bg-blue-100 text-blue-800";
    case "inactive":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Bulk operation types
export interface BulkStatusUpdateRequest {
  student_ids: number[];
  is_active: boolean;
}

export interface BulkStatusUpdateResponse {
  updated: number;
}

export interface BulkDepartmentUpdateRequest {
  student_ids: number[];
  department_id: number;
}

export interface BulkDepartmentUpdateResponse {
  updated: number;
  requested: number;
  department_id: number;
}
