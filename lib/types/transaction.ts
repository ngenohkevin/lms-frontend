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
  // Copy-level tracking fields
  copy_id?: number;
  copy_number?: string;
  copy_barcode?: string;
  copy_condition?: string;
  created_at: string;
  updated_at: string;
}

export type TransactionType = "borrow" | "return" | "renew";
export type TransactionStatus = "active" | "returned" | "overdue" | "lost";

export interface BorrowRequest {
  book_id: string;
  student_id: string;
  librarian_id: number;
  copy_id?: number;
  barcode?: string;
  due_days?: number;
  notes?: string;
}

export interface BorrowByBarcodeRequest {
  barcode: string;
  student_id: string;
  librarian_id: number;
  notes?: string;
}

export interface ReturnByBarcodeRequest {
  barcode: string;
  return_condition?: BookCondition;
  condition_notes?: string;
}

export interface BarcodeScanResult {
  copy_id: number;
  copy_number: string;
  barcode: string;
  condition: string;
  status: string;
  book_id: number;
  book_title: string;
  book_author: string;
  book_code: string;
  isbn?: string;
  is_borrowed: boolean;
  can_borrow: boolean;
  current_borrower?: {
    transaction_id: number;
    student_name: string;
    student_code: string;
    due_date: string;
  };
}

export interface ReturnRequest {
  condition?: BookCondition;
  condition_notes?: string;
}

export type BookCondition = "excellent" | "good" | "fair" | "poor" | "damaged";

export interface RenewRequest {
  librarian_id: number;
  days?: number;
}

export interface RenewalEligibility {
  can_renew: boolean;
  reason: string;
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
