export type StaffRole = "admin" | "librarian" | "staff";

export interface StaffUser {
  id: string;
  username: string;
  email: string;
  role: StaffRole;
  is_active: boolean;
  last_login?: string | null;
  created_at: string;
  updated_at: string;
}

export interface StaffUserFormData {
  username: string;
  email: string;
  password?: string;
  role: StaffRole;
}

export interface StaffUserSearchParams {
  query?: string;
  role?: StaffRole;
  active?: boolean;
  page?: number;
  per_page?: number;
}

export interface UpdateUserStatusRequest {
  is_active: boolean;
  reason?: string;
}

export interface AdminResetPasswordRequest {
  password: string;
}

export interface RoleOption {
  value: StaffRole;
  label: string;
  description: string;
}
