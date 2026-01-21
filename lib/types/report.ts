// Response from /api/v1/reports/dashboard-metrics
export interface DashboardMetricsResponse {
  today_borrows: number;
  today_returns: number;
  current_overdue: number;
  new_students: number;
  active_users: number;
  available_books: number;
  pending_reservations: number;
  system_alerts: number;
  last_updated: string;
}

// Response from /api/v1/reports/library-overview
export interface LibraryOverviewResponse {
  total_books: number;
  total_students: number;
  total_borrows: number;
  active_borrows: number;
  overdue_books: number;
  total_reservations: number;
  available_books: number;
  total_fines: string;
  generated_at: string;
}

// Combined dashboard metrics for frontend display
export interface DashboardMetrics {
  total_books: number;
  total_students: number;
  active_borrows: number;
  overdue_books: number;
  today_borrows: number;
  today_returns: number;
  pending_reservations: number;
  total_fines: number;
  available_books: number;
}

export interface BorrowingStats {
  period: string;
  total_borrowed: number;
  total_returned: number;
  total_overdue: number;
}

export interface PopularBook {
  book_id: string;
  title: string;
  author: string;
  isbn: string;
  cover_url?: string;
  borrow_count: number;
  average_rating?: number;
}

export interface CategoryStats {
  category: string;
  total_books: number;
  total_borrowed: number;
  available: number;
}

export interface StudentActivity {
  student_id: string;
  student_name: string;
  department?: string;
  total_borrowed: number;
  current_books: number;
  overdue_count: number;
  fine_amount: number;
}

export interface InventoryReport {
  total_books: number;
  total_copies: number;
  available_copies: number;
  checked_out: number;
  lost_books: number;
  categories: CategoryStats[];
}

export interface BorrowingTrend {
  date: string;
  borrowed: number;
  returned: number;
}

export interface OverdueReport {
  total_overdue: number;
  total_fine_amount: number;
  overdue_by_department: Array<{
    department: string;
    count: number;
    fine_amount: number;
  }>;
  overdue_by_days: Array<{
    range: string;
    count: number;
  }>;
}

export interface ReportDateRange {
  from_date: string;
  to_date: string;
}

export interface ReportParams extends ReportDateRange {
  group_by?: "day" | "week" | "month";
  category?: string;
  department?: string;
}
