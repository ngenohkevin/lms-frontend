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
  year_of_study?: number;
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
  overdue_by_year_of_study: Array<{
    year_of_study: number;
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
  year_of_study?: number;
}

// ============================================
// Individual Student Report Types
// ============================================

export interface StudentProfile {
  id: number;
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  year_of_study: number;
  max_books: number;
  is_active: boolean;
  member_since: string;
}

export interface StudentTransactionStats {
  total_books_borrowed: number;
  currently_borrowed: number;
  overdue_count: number;
}

export interface StudentFinesSummary {
  outstanding_fines: string;
  total_fines_paid: string;
}

export interface ReadingStatsByGenre {
  genre: string;
  books_read: number;
  avg_days_held: string;
}

export interface MonthlyActivityData {
  month: string;
  borrowed: number;
  returned: number;
  fines_incurred: string;
}

export interface TransactionHistoryItem {
  transaction_id: number;
  transaction_type: string;
  book_code: string;
  book_title: string;
  book_author: string;
  genre: string;
  transaction_date: string;
  due_date: string;
  returned_date?: string;
  status: string;
  fine_amount: string;
  fine_paid: boolean;
  days_overdue: number;
  renewal_count: number;
}

export interface IndividualStudentReport {
  profile: StudentProfile;
  transaction_stats: StudentTransactionStats;
  fines_summary: StudentFinesSummary;
  reading_stats: ReadingStatsByGenre[];
  monthly_activity: MonthlyActivityData[];
  recent_history: TransactionHistoryItem[];
  generated_at: string;
}

export interface IndividualStudentReportRequest {
  limit?: number;
  start_date?: string;
  end_date?: string;
}

// ============================================
// Lost Books Report Types
// ============================================

export interface LostBookDetail {
  transaction_id: number;
  book_id: number;
  book_code: string;
  book_title: string;
  book_author: string;
  genre: string;
  student_id: number;
  student_code: string;
  student_name: string;
  year_of_study: number;
  lost_date: string;
  replacement_cost: string;
  fine_paid: boolean;
  notes: string;
}

export interface LostBooksSummary {
  total_lost: number;
  total_replacement_value: string;
  recovered_count: number;
  pending_payment_count: number;
  total_paid: string;
  total_outstanding: string;
}

export interface LostBooksTrendItem {
  period: string;
  lost_count: number;
  replacement_value: string;
  recovered: number;
}

export interface LostBooksByCategory {
  genre: string;
  lost_count: number;
  replacement_value: string;
  avg_replacement_cost: string;
}

export interface LostBooksByYearOfStudy {
  year_of_study: number;
  lost_count: number;
  replacement_value: string;
  students_affected: number;
}

export interface LostBooksReport {
  summary: LostBooksSummary;
  lost_books: LostBookDetail[];
  trends: LostBooksTrendItem[];
  by_category: LostBooksByCategory[];
  by_year_of_study: LostBooksByYearOfStudy[];
  generated_at: string;
}

export interface LostBooksReportRequest {
  start_date?: string;
  end_date?: string;
  year_of_study?: number;
  genre?: string;
  interval?: string;
}

// ============================================
// Fines Collection Report Types
// ============================================

export interface FinesCollectionSummary {
  total_fine_records: number;
  students_with_outstanding: number;
  total_fines_generated: string;
  total_collected: string;
  total_outstanding: string;
  total_waived: string;
  average_fine: string;
  collection_rate: string;
}

export interface FinesByYearItem {
  year_of_study: number;
  fine_count: number;
  students_affected: number;
  total_fines: string;
  paid_amount: string;
  outstanding_amount: string;
}


export interface FinesCollectionTrend {
  period: string;
  fine_count: number;
  generated: string;
  collected: string;
  outstanding: string;
}

export interface FineDefaulterItem {
  student_id: number;
  student_code: string;
  student_name: string;
  email: string;
  year_of_study: number;
  fine_count: number;
  total_fines: string;
  outstanding_fines: string;
}

export interface FinePaymentHistoryItem {
  transaction_id: number;
  fine_amount: string;
  fine_paid: boolean;
  fine_paid_at?: string;
  fine_waived: boolean;
  fine_waived_at?: string;
  fine_waived_reason: string;
  due_date: string;
  returned_date?: string;
  days_overdue: number;
  student_code: string;
  student_name: string;
  year_of_study: number;
  book_code: string;
  book_title: string;
}

export interface FinesCollectionReport {
  summary: FinesCollectionSummary;
  by_year_of_study: FinesByYearItem[];
  trends: FinesCollectionTrend[];
  top_defaulters: FineDefaulterItem[];
  recent_fines: FinePaymentHistoryItem[];
  generated_at: string;
}

export interface FinesCollectionReportRequest {
  start_date?: string;
  end_date?: string;
  interval?: string;
  paid_only?: boolean;
  limit?: number;
}
