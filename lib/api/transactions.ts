import apiClient from "./client";
import type {
  Transaction,
  BorrowRequest,
  BorrowByBarcodeRequest,
  ReturnByBarcodeRequest,
  BarcodeScanResult,
  ReturnRequest,
  RenewRequest,
  RenewalEligibility,
  TransactionSearchParams,
  Fine,
  FinePaymentRequest,
  OverdueTransaction,
  TransactionStats,
  PaginatedResponse,
  BulkPayFinesRequest,
  BulkPayFinesResponse,
  BulkWaiveFinesRequest,
  BulkWaiveFinesResponse,
} from "@/lib/types";

const TRANSACTIONS_PREFIX = "/api/v1/transactions";
const FINES_PREFIX = "/api/v1/fines";

// Backend response wrapper
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Backend pagination structure
interface BackendPagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

// Backend transaction row (flat structure from database)
interface BackendTransactionRow {
  id: number;
  student_id: number;
  book_id: number;
  transaction_type: string;
  transaction_date: string;
  due_date: string;
  returned_date?: string;
  librarian_id?: number;
  fine_amount?: { Int: { Int64: number }; Valid: boolean } | number | string;
  fine_paid?: { Bool: boolean; Valid: boolean } | boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  return_condition?: string;
  condition_notes?: string;
  // Joined student fields (from history endpoint)
  first_name?: string;
  last_name?: string;
  student_id_2?: string; // The student's ID string (like "STU001")
  // Joined book fields (from history endpoint)
  title?: string;
  author?: string;
  book_id_2?: string; // The book's ID string (like "ISBN-123")
  // Search endpoint returns different field names
  student_name?: string;
  student_code?: string;
  book_title?: string;
  book_author?: string;
  book_code?: string;
  status?: string;
  days_overdue?: number;
}

// Backend paginated response structures
interface BackendPaginatedTransactions {
  transactions: BackendTransactionRow[];
  pagination: BackendPagination;
}

interface BackendPaginatedOverdue {
  transactions: OverdueTransaction[];
  pagination: BackendPagination;
}

interface BackendPaginatedFines {
  fines: Fine[];
  pagination: BackendPagination;
}

// Transform backend pagination to frontend format
function transformPagination(bp?: BackendPagination): PaginatedResponse<Transaction>["pagination"] | undefined {
  if (!bp) return undefined;
  return {
    page: bp.page,
    per_page: bp.limit,
    total: bp.total,
    total_pages: bp.total_pages,
    has_next: bp.page < bp.total_pages,
    has_prev: bp.page > 1,
  };
}

// Helper to extract fine amount from various formats
function extractFineAmount(fineAmount: BackendTransactionRow["fine_amount"]): number {
  if (fineAmount === undefined || fineAmount === null) return 0;
  if (typeof fineAmount === "number") return fineAmount;
  if (typeof fineAmount === "string") return parseFloat(fineAmount) || 0;
  if (typeof fineAmount === "object" && "Int" in fineAmount && fineAmount.Valid) {
    return fineAmount.Int.Int64 / 100; // Assuming stored as cents
  }
  return 0;
}

// Helper to extract fine paid status
function extractFinePaid(finePaid: BackendTransactionRow["fine_paid"]): boolean {
  if (finePaid === undefined || finePaid === null) return false;
  if (typeof finePaid === "boolean") return finePaid;
  if (typeof finePaid === "object" && "Bool" in finePaid) {
    return finePaid.Valid && finePaid.Bool;
  }
  return false;
}

// Map transaction type to status
function mapTransactionStatus(type: string, returnedDate?: string): "active" | "returned" | "overdue" | "lost" {
  if (returnedDate) return "returned";
  if (type === "lost") return "lost";
  return "active"; // Default to active, overdue would need date check
}

// Backend transaction row with copy fields
interface BackendTransactionRowWithCopy extends BackendTransactionRow {
  copy_id?: number;
  copy_number?: string;
  copy_barcode?: string;
  copy_condition?: string;
  // Renewal tracking fields
  renewal_count?: number;
  last_renewed_at?: string;
  last_renewed_by?: number;
}

// Transform backend transaction to frontend format
function transformTransaction(tx: BackendTransactionRow | BackendTransactionRowWithCopy): Transaction {
  const txWithCopy = tx as BackendTransactionRowWithCopy;

  // Handle both field name formats from different endpoints
  // History endpoint: first_name, last_name, title, author, student_id_2, book_id_2
  // Search endpoint: student_name, student_code, book_title, book_author, book_code
  const bookTitle = tx.book_title || tx.title || "Unknown";
  const bookAuthor = tx.book_author || tx.author || "Unknown";
  const bookCode = tx.book_code || tx.book_id_2 || "";
  const studentName = tx.student_name ||
    `${tx.first_name || ""} ${tx.last_name || ""}`.trim() ||
    "Unknown";
  const studentCode = tx.student_code || tx.student_id_2 || "";

  // Use status from backend if available (search endpoint), otherwise compute it
  const status = (tx.status as "active" | "returned" | "overdue" | "lost") ||
    mapTransactionStatus(tx.transaction_type, tx.returned_date);

  return {
    id: String(tx.id),
    book_id: String(tx.book_id),
    student_id: String(tx.student_id),
    librarian_id: tx.librarian_id ? String(tx.librarian_id) : undefined,
    type: tx.transaction_type as "borrow" | "return" | "renew",
    status,
    borrowed_at: tx.transaction_date,
    due_date: tx.due_date,
    returned_at: tx.returned_date,
    renewed_count: 0, // Not available in this query
    fine_amount: extractFineAmount(tx.fine_amount),
    fine_paid: extractFinePaid(tx.fine_paid),
    notes: tx.notes,
    book: {
      id: String(tx.book_id),
      title: bookTitle,
      author: bookAuthor,
      isbn: bookCode,
    },
    student: {
      id: String(tx.student_id),
      student_id: studentCode,
      name: studentName,
      email: "", // Not available in this query
    },
    // Copy-level tracking fields
    copy_id: txWithCopy.copy_id,
    copy_number: txWithCopy.copy_number,
    copy_barcode: txWithCopy.copy_barcode,
    copy_condition: txWithCopy.copy_condition,
    // Renewal tracking fields
    renewal_count: txWithCopy.renewal_count ?? 0,
    last_renewed_at: txWithCopy.last_renewed_at,
    last_renewed_by: txWithCopy.last_renewed_by,
    created_at: tx.created_at,
    updated_at: tx.updated_at,
  };
}

export const transactionsApi = {
  // List all transactions with pagination and search/filter
  list: async (
    params?: TransactionSearchParams
  ): Promise<PaginatedResponse<Transaction>> => {
    // Map frontend params to backend params
    const backendParams: Record<string, string | number | boolean | undefined> = {
      page: params?.page,
      limit: params?.per_page,
      query: params?.query,
      student_id: params?.student_id ? parseInt(params.student_id, 10) : undefined,
      book_id: params?.book_id ? parseInt(params.book_id, 10) : undefined,
      type: params?.type,
      status: params?.status,
      from_date: params?.from_date,
      to_date: params?.to_date,
      sort_by: params?.sort_by,
      sort_order: params?.sort_order,
    };

    // Remove undefined values
    Object.keys(backendParams).forEach(key => {
      if (backendParams[key] === undefined) {
        delete backendParams[key];
      }
    });

    const response = await apiClient.get<ApiResponse<BackendPaginatedTransactions>>(TRANSACTIONS_PREFIX, {
      params: backendParams,
    });

    // Transform backend transactions to frontend format
    const transactions = (response.data?.transactions || []).map(transformTransaction);

    return {
      data: transactions,
      pagination: transformPagination(response.data?.pagination),
    };
  },

  // Get single transaction by ID
  get: async (id: string): Promise<Transaction> => {
    const response = await apiClient.get<ApiResponse<Transaction>>(`${TRANSACTIONS_PREFIX}/${id}`);
    return response.data;
  },

  // Borrow a book
  borrow: async (data: BorrowRequest): Promise<Transaction> => {
    // Convert string IDs to numbers for backend
    const backendData = {
      book_id: parseInt(data.book_id, 10),
      student_id: parseInt(data.student_id, 10),
      librarian_id: data.librarian_id,
      copy_id: data.copy_id,
      barcode: data.barcode,
      notes: data.notes || "",
    };
    const response = await apiClient.post<ApiResponse<Transaction>>(`${TRANSACTIONS_PREFIX}/borrow`, backendData);
    return response.data;
  },

  // Borrow a book by scanning barcode
  borrowByBarcode: async (data: BorrowByBarcodeRequest): Promise<Transaction> => {
    const backendData = {
      barcode: data.barcode,
      student_id: parseInt(data.student_id, 10),
      librarian_id: data.librarian_id,
      notes: data.notes || "",
    };
    const response = await apiClient.post<ApiResponse<Transaction>>(`${TRANSACTIONS_PREFIX}/borrow-by-barcode`, backendData);
    return response.data;
  },

  // Return a book by scanning barcode
  returnByBarcode: async (data: ReturnByBarcodeRequest): Promise<Transaction> => {
    const response = await apiClient.post<ApiResponse<Transaction>>(`${TRANSACTIONS_PREFIX}/return-by-barcode`, data);
    return response.data;
  },

  // Scan a barcode for transaction info
  scanBarcode: async (barcode: string): Promise<BarcodeScanResult> => {
    const response = await apiClient.get<ApiResponse<BarcodeScanResult>>(`${TRANSACTIONS_PREFIX}/scan`, {
      params: { barcode },
    });
    return response.data;
  },

  // Return a book by transaction ID
  return: async (id: string, data?: ReturnRequest): Promise<Transaction> => {
    const response = await apiClient.post<ApiResponse<Transaction>>(
      `${TRANSACTIONS_PREFIX}/${id}/return`,
      data || {}
    );
    return response.data;
  },

  // Check if a book can be renewed
  canRenew: async (id: string): Promise<RenewalEligibility> => {
    const response = await apiClient.get<ApiResponse<RenewalEligibility>>(
      `${TRANSACTIONS_PREFIX}/${id}/can-renew`
    );
    return response.data;
  },

  // Renew a book by transaction ID
  renew: async (id: string, data: RenewRequest): Promise<Transaction> => {
    const response = await apiClient.post<ApiResponse<Transaction>>(
      `${TRANSACTIONS_PREFIX}/${id}/renew`,
      data
    );
    return response.data;
  },

  // Cancel a transaction (within grace period)
  cancel: async (id: string, reason: string): Promise<Transaction> => {
    const response = await apiClient.post<ApiResponse<Transaction>>(
      `${TRANSACTIONS_PREFIX}/${id}/cancel`,
      { reason }
    );
    return response.data;
  },

  // Mark a transaction as lost (applies replacement fine)
  markAsLost: async (id: string, reason: string): Promise<Transaction> => {
    const response = await apiClient.post<ApiResponse<Transaction>>(
      `${TRANSACTIONS_PREFIX}/${id}/lost`,
      { reason }
    );
    return response.data;
  },

  // Get overdue transactions
  getOverdue: async (params?: {
    page?: number;
    per_page?: number;
    department?: string;
  }): Promise<PaginatedResponse<OverdueTransaction>> => {
    const response = await apiClient.get<ApiResponse<BackendPaginatedOverdue>>(
      `${TRANSACTIONS_PREFIX}/overdue`,
      { params }
    );
    return {
      data: response.data?.transactions || [],
      pagination: transformPagination(response.data?.pagination),
    };
  },

  // Get transaction stats
  getStats: async (): Promise<TransactionStats> => {
    const response = await apiClient.get<ApiResponse<TransactionStats>>(`${TRANSACTIONS_PREFIX}/stats`);
    return response.data || {
      total_active: 0,
      total_overdue: 0,
      total_borrowed_today: 0,
      total_unpaid_fines: 0,
    };
  },

  // Get transaction history for a student
  getHistory: async (studentId: string, params?: { page?: number; limit?: number }): Promise<Transaction[]> => {
    const response = await apiClient.get<ApiResponse<BackendTransactionRow[]>>(
      `${TRANSACTIONS_PREFIX}/history/${studentId}`,
      { params }
    );
    return (response.data || []).map(transformTransaction);
  },

  // Fines
  fines: {
    // List all fines
    list: async (params?: {
      student_id?: string;
      paid?: boolean;
      page?: number;
      per_page?: number;
    }): Promise<PaginatedResponse<Fine>> => {
      const backendParams: Record<string, string | number | boolean | undefined> = {
        page: params?.page,
        limit: params?.per_page,
        paid: params?.paid,
        student_id: params?.student_id,
      };
      const response = await apiClient.get<ApiResponse<BackendPaginatedFines>>(
        FINES_PREFIX,
        { params: backendParams }
      );
      return {
        data: response.data?.fines || [],
        pagination: transformPagination(response.data?.pagination),
      };
    },

    // Get single fine
    get: async (id: string): Promise<Fine> => {
      const response = await apiClient.get<ApiResponse<Fine>>(`${FINES_PREFIX}/${id}`);
      return response.data;
    },

    // Pay a fine
    pay: async (transactionId: string, data?: { payment_method?: string }): Promise<Fine> => {
      const response = await apiClient.post<ApiResponse<Fine>>(
        `${FINES_PREFIX}/${transactionId}/pay`,
        data || {}
      );
      return response.data;
    },

    // Waive a fine (admin only)
    // Note: reason is required by the backend
    waive: async (id: string, reason: string): Promise<Fine> => {
      if (!reason || !reason.trim()) {
        throw new Error("Reason is required to waive a fine");
      }
      const response = await apiClient.post<ApiResponse<Fine>>(
        `${FINES_PREFIX}/${id}/waive`,
        { reason: reason.trim() }
      );
      return response.data;
    },

    // Get total unpaid fines for a student
    getStudentUnpaid: async (studentId: string): Promise<{ total: number }> => {
      const response = await apiClient.get<ApiResponse<{ total: number }>>(
        `${FINES_PREFIX}/student/${studentId}/unpaid`
      );
      return response.data || { total: 0 };
    },

    // Get fine statistics
    getStatistics: async (): Promise<{ statistics: Record<string, number>; fine_per_day: number }> => {
      const response = await apiClient.get<ApiResponse<{ statistics: Record<string, number>; fine_per_day: number }>>(
        `${FINES_PREFIX}/statistics`
      );
      return response.data || { statistics: {}, fine_per_day: 0.5 };
    },

    // Bulk pay multiple fines
    bulkPay: async (data: BulkPayFinesRequest): Promise<BulkPayFinesResponse> => {
      const response = await apiClient.post<ApiResponse<BulkPayFinesResponse>>(
        `${FINES_PREFIX}/bulk-pay`,
        data
      );
      return response.data;
    },

    // Bulk waive multiple fines
    bulkWaive: async (data: BulkWaiveFinesRequest): Promise<BulkWaiveFinesResponse> => {
      const response = await apiClient.post<ApiResponse<BulkWaiveFinesResponse>>(
        `${FINES_PREFIX}/bulk-waive`,
        data
      );
      return response.data;
    },
  },
};

export default transactionsApi;
