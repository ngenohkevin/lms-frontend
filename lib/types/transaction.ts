export interface Transaction {
  id: string;
  book_id: string;
  student_id: string;
  librarian_id?: string;
  type: TransactionType;
  status: TransactionStatus;
  borrowed_at: string;
  due_date: string;
  returned_at?: string;
  renewed_count: number;
  fine_amount: number;
  fine_paid: boolean;
  notes?: string;
  book?: {
    id: string;
    title: string;
    author: string;
    isbn: string;
    cover_url?: string;
  };
  student?: {
    id: string;
    student_id: string;
    name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
}

export type TransactionType = "borrow" | "return" | "renew";
export type TransactionStatus = "active" | "returned" | "overdue" | "lost";

export interface BorrowRequest {
  book_id: string;
  student_id: string;
  librarian_id: number;
  due_days?: number;
  notes?: string;
}

export interface ReturnRequest {
  transaction_id: string;
  condition?: BookCondition;
  notes?: string;
}

export type BookCondition = "good" | "fair" | "damaged" | "lost";

export interface RenewRequest {
  transaction_id: string;
  days?: number;
}

export interface TransactionSearchParams {
  student_id?: string;
  book_id?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  overdue?: boolean;
  from_date?: string;
  to_date?: string;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface Fine {
  id: string;
  transaction_id: string;
  student_id: string;
  amount: number;
  reason: string;
  paid: boolean;
  paid_at?: string;
  created_at: string;
}

export interface FinePaymentRequest {
  fine_id: string;
  amount: number;
  payment_method?: string;
}

export interface OverdueTransaction extends Transaction {
  days_overdue: number;
  calculated_fine: number;
}

export interface TransactionStats {
  total_active: number;
  total_overdue: number;
  total_returned_today: number;
  total_borrowed_today: number;
  total_unpaid_fines: number;
}
