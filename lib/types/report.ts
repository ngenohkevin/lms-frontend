export interface DashboardMetrics {
  total_books: number;
  total_students: number;
  active_transactions: number;
  overdue_transactions: number;
  books_borrowed_today: number;
  books_returned_today: number;
  pending_reservations: number;
  total_unpaid_fines: number;
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
