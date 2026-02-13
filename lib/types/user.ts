export type StaffRole = "super_admin" | "admin" | "librarian" | "staff";

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

// Invite types
export type InviteStatus = "pending" | "accepted" | "expired";

export interface UserInvite {
  id: string;
  email: string;
  name: string;
  role: StaffRole;
  status: InviteStatus;
  invited_by: number;
  inviter_name: string;
  expires_at: string;
  accepted_at?: string;
  created_at: string;
}

export interface CreateInviteRequest {
  email: string;
  name: string;
  role: StaffRole;
}

export interface AcceptInviteRequest {
  token: string;
  username: string;
  password: string;
  confirm_password: string;
}

export interface ValidateInviteResponse {
  valid: boolean;
  email?: string;
  name?: string;
  role?: StaffRole;
  message?: string;
}

export interface SetupRequest {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface SetupCheckResponse {
  setup_required: boolean;
  message: string;
}

export interface InviteSearchParams {
  page?: number;
  per_page?: number;
}

// Online presence types
export interface OnlineUser {
  user_id: number;
  username: string;
  role: StaffRole;
  last_seen: string;
  ip_address?: string;
  path?: string;
}

export interface OnlineUsersResponse {
  users: OnlineUser[];
  total: number;
}
