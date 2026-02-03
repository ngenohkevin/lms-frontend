import type { StaffRole } from "./user";

// Permission override types
export type OverrideType = "grant" | "deny";

// Permission response from the API
export interface Permission {
  code: string;
  name: string;
  description?: string;
  category: string;
  is_system: boolean;
}

// Permission category with permissions
export interface PermissionCategory {
  category: string;
  permissions: Permission[];
}

// All permissions grouped by category
export interface PermissionsListResponse {
  categories: PermissionCategory[];
  total: number;
}

// Role permissions response
export interface RolePermissionsResponse {
  role: StaffRole;
  permissions: Permission[];
  total: number;
}

// User permission override
export interface UserPermissionOverride {
  id: number;
  permission_code: string;
  permission_name: string;
  permission_category: string;
  override_type: OverrideType;
  reason?: string;
  granted_by_username?: string;
  expires_at?: string;
  created_at: string;
}

// User effective permissions response
export interface UserEffectivePermissionsResponse {
  user_id: number;
  username: string;
  role: StaffRole;
  permissions: string[];
  overrides: UserPermissionOverride[];
  total: number;
}

// Current user's permissions
export interface MyPermissionsResponse {
  permissions: string[];
  role: StaffRole;
  total: number;
}

// User overrides list response
export interface UserOverridesResponse {
  user_id: number;
  username: string;
  overrides: UserPermissionOverride[];
  total: number;
}

// Permission matrix types for UI display
export interface PermissionMatrixEntry {
  code: string;
  name: string;
  admin: boolean;
  librarian: boolean;
  staff: boolean;
}

export interface PermissionMatrixCategory {
  category: string;
  permissions: PermissionMatrixEntry[];
}

export interface PermissionMatrixResponse {
  categories: PermissionMatrixCategory[];
}

// Request types
export interface UpdateRolePermissionsRequest {
  permissions: string[];
}

export interface CreateUserOverrideRequest {
  permission_code: string;
  override_type: OverrideType;
  reason?: string;
  expires_at?: string;
}

// Standard permission codes
export const PermissionCodes = {
  // Books
  BOOKS_VIEW: "books.view",
  BOOKS_CREATE: "books.create",
  BOOKS_UPDATE: "books.update",
  BOOKS_DELETE: "books.delete",

  // Students
  STUDENTS_VIEW: "students.view",
  STUDENTS_CREATE: "students.create",
  STUDENTS_UPDATE: "students.update",
  STUDENTS_DELETE: "students.delete",
  STUDENTS_SUSPEND: "students.suspend",
  STUDENTS_GRADUATE: "students.graduate",
  STUDENTS_ADMIN_NOTES: "students.admin_notes",

  // Transactions
  TRANSACTIONS_VIEW: "transactions.view",
  TRANSACTIONS_BORROW: "transactions.borrow",
  TRANSACTIONS_RETURN: "transactions.return",

  // Reservations
  RESERVATIONS_VIEW: "reservations.view",
  RESERVATIONS_MANAGE: "reservations.manage",

  // Reports
  REPORTS_VIEW: "reports.view",
  REPORTS_EXPORT: "reports.export",

  // Users
  USERS_VIEW: "users.view",
  USERS_MANAGE: "users.manage",

  // Invites
  INVITES_MANAGE: "invites.manage",

  // Permissions
  PERMISSIONS_VIEW: "permissions.view",
  PERMISSIONS_MANAGE: "permissions.manage",

  // Fines
  FINES_VIEW: "fines.view",
  FINES_MANAGE: "fines.manage",

  // Notifications
  NOTIFICATIONS_SEND: "notifications.send",

  // Categories
  CATEGORIES_MANAGE: "categories.manage",

  // Departments
  DEPARTMENTS_VIEW: "departments.view",
  DEPARTMENTS_MANAGE: "departments.manage",

  // Academic Years
  ACADEMIC_YEARS_VIEW: "academic_years.view",
  ACADEMIC_YEARS_MANAGE: "academic_years.manage",

  // Authors
  AUTHORS_VIEW: "authors.view",
  AUTHORS_CREATE: "authors.create",
  AUTHORS_UPDATE: "authors.update",
  AUTHORS_DELETE: "authors.delete",

  // Languages
  LANGUAGES_VIEW: "languages.view",
  LANGUAGES_CREATE: "languages.create",
  LANGUAGES_UPDATE: "languages.update",
  LANGUAGES_DELETE: "languages.delete",

  // Series
  SERIES_VIEW: "series.view",
  SERIES_CREATE: "series.create",
  SERIES_UPDATE: "series.update",
  SERIES_DELETE: "series.delete",

  // Settings
  SETTINGS_VIEW: "settings.view",
  SETTINGS_FINES: "settings.fines",
} as const;

export type PermissionCode = (typeof PermissionCodes)[keyof typeof PermissionCodes];

// Permission category display names
export const PermissionCategoryNames: Record<string, string> = {
  books: "Books",
  students: "Students",
  transactions: "Transactions",
  reservations: "Reservations",
  reports: "Reports",
  users: "Users",
  invites: "Invitations",
  permissions: "Permissions",
  fines: "Fines",
  notifications: "Notifications",
  categories: "Categories",
  departments: "Departments",
  academic_years: "Academic Years",
  authors: "Authors",
  languages: "Languages",
  series: "Series",
  settings: "Settings",
};
