export interface Student {
  id: string;
  student_id: string;
  user_id?: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  year_of_study?: number;
  max_books: number;
  current_books: number;
  total_borrowed: number;
  total_fines: number;
  unpaid_fines: number;
  status: StudentStatus;
  created_at: string;
  updated_at: string;
}

export type StudentStatus = "active" | "suspended" | "graduated" | "inactive";

export interface StudentFormData {
  student_id: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  year_of_study?: number;
  max_books?: number;
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
  name: string;
  email: string;
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

export const DEPARTMENTS = [
  "Computer Science",
  "Engineering",
  "Business",
  "Arts",
  "Sciences",
  "Medicine",
  "Law",
  "Education",
  "Social Sciences",
  "Humanities",
  "Other",
] as const;

export type Department = (typeof DEPARTMENTS)[number];

export const STUDENT_STATUSES: StudentStatus[] = [
  "active",
  "suspended",
  "graduated",
  "inactive",
];
