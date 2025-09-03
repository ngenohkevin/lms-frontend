// Core entity types based on backend database schema

// User types
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'librarian' | 'admin' | 'staff';
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

// Student types
export interface Student {
  id: number;
  student_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  year_of_study: number;
  department: string | null;
  enrollment_date: string;
  password_hash: string | null;
  is_active: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

// Book types
export interface Book {
  id: number;
  book_id: string;
  isbn: string | null;
  title: string;
  author: string;
  publisher: string | null;
  published_year: number | null;
  genre: string | null;
  description: string | null;
  cover_image_url: string | null;
  total_copies: number;
  available_copies: number;
  shelf_location: string | null;
  is_active: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

// Transaction types
export interface Transaction {
  id: number;
  student_id: number;
  book_id: number;
  transaction_type: 'borrow' | 'return' | 'renew';
  transaction_date: string;
  due_date: string | null;
  returned_date: string | null;
  librarian_id: number | null;
  fine_amount: number;
  fine_paid: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  student?: Student;
  book?: Book;
  librarian?: User;
}

// Reservation types
export interface Reservation {
  id: number;
  student_id: number;
  book_id: number;
  reserved_at: string;
  expires_at: string;
  status: 'active' | 'fulfilled' | 'cancelled' | 'expired';
  fulfilled_at: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  student?: Student;
  book?: Book;
}

// Notification types
export interface Notification {
  id: number;
  recipient_id: number;
  recipient_type: 'student' | 'librarian';
  type: 'overdue_reminder' | 'due_soon' | 'book_available' | 'fine_notice';
  title: string;
  message: string;
  is_read: boolean;
  sent_at: string | null;
  created_at: string;
}

// Audit log types
export interface AuditLog {
  id: number;
  table_name: string;
  record_id: number;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  user_id: number | null;
  user_type: 'librarian' | 'student' | 'system';
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// Form types
export interface LoginForm {
  username: string;
  password: string;
  remember_me?: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
  remember_me?: boolean;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_at: string;
}

export interface BookForm {
  book_id: string;
  isbn?: string;
  title: string;
  author: string;
  publisher?: string;
  published_year?: number;
  genre?: string;
  description?: string;
  total_copies: number;
  shelf_location?: string;
}

export interface StudentForm {
  student_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  year_of_study: number;
  department?: string;
  password?: string;
}

export interface TransactionForm {
  student_id: number;
  book_id: number;
  due_date?: string;
  notes?: string;
}

// API types
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface BooksParams extends PaginationParams {
  genre?: string;
  author?: string;
  available?: boolean;
  year?: number;
}

export interface StudentsParams extends PaginationParams {
  year_of_study?: number;
  department?: string;
  active?: boolean;
}

export interface TransactionsParams extends PaginationParams {
  student_id?: number;
  book_id?: number;
  type?: Transaction['transaction_type'];
  overdue?: boolean;
  date_from?: string;
  date_to?: string;
}

// Dashboard statistics types
export interface DashboardStats {
  total_books: number;
  active_students: number;
  books_borrowed: number;
  overdue_books: number;
  monthly_growth: number;
  popular_books: {
    book: Book;
    borrow_count: number;
  }[];
  recent_activities: {
    id: number;
    type: string;
    description: string;
    timestamp: string;
    user?: string;
  }[];
}

// Report types
export interface ReportParams {
  date_from: string;
  date_to: string;
  year_of_study?: number;
  department?: string;
  format?: 'json' | 'csv' | 'pdf';
}

export interface BorrowingTrendsReport {
  period: string;
  total_borrows: number;
  unique_students: number;
  popular_genres: {
    genre: string;
    count: number;
  }[];
}

export interface StudentActivityReport {
  student: Student;
  total_borrows: number;
  current_borrows: number;
  overdue_count: number;
  total_fines: number;
  last_activity: string;
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Component prop types
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, record: T) => React.ReactNode;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: {
    current: number;
    total: number;
    pageSize: number;
    onChange: (page: number, pageSize: number) => void;
  };
  onSort?: (field: keyof T, order: 'asc' | 'desc') => void;
}

// Theme types
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  'muted-foreground': string;
  card: string;
  'card-foreground': string;
  border: string;
  input: string;
  ring: string;
}

export type Theme = 'light' | 'dark' | 'system';

// Navigation types
export interface NavItem {
  title: string;
  href: string;
  icon?: React.ComponentType<Record<string, unknown>>;
  disabled?: boolean;
  external?: boolean;
  roles?: User['role'][];
  children?: NavItem[];
}

// Search types
export interface SearchResult<T> {
  items: T[];
  total: number;
  query: string;
  filters: Record<string, unknown>;
}

// File upload types
export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  type: string;
}
