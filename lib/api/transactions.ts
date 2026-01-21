import apiClient from "./client";
import type {
  Transaction,
  BorrowRequest,
  ReturnRequest,
  RenewRequest,
  TransactionSearchParams,
  Fine,
  FinePaymentRequest,
  OverdueTransaction,
  TransactionStats,
  PaginatedResponse,
} from "@/lib/types";

const TRANSACTIONS_PREFIX = "/api/v1/transactions";

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
  // Joined student fields
  first_name: string;
  last_name: string;
  student_id_2: string; // The student's ID string (like "STU001")
  // Joined book fields
  title: string;
  author: string;
  book_id_2: string; // The book's ID string (like "ISBN-123")
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

// Transform backend transaction to frontend format
function transformTransaction(tx: BackendTransactionRow): Transaction {
  return {
    id: String(tx.id),
    book_id: String(tx.book_id),
    student_id: String(tx.student_id),
    librarian_id: tx.librarian_id ? String(tx.librarian_id) : undefined,
    type: tx.transaction_type as "borrow" | "return" | "renew",
    status: mapTransactionStatus(tx.transaction_type, tx.returned_date),
    borrowed_at: tx.transaction_date,
    due_date: tx.due_date,
    returned_at: tx.returned_date,
    renewed_count: 0, // Not available in this query
    fine_amount: extractFineAmount(tx.fine_amount),
    fine_paid: extractFinePaid(tx.fine_paid),
    notes: tx.notes,
    book: {
      id: String(tx.book_id),
      title: tx.title || "Unknown",
      author: tx.author || "Unknown",
      isbn: tx.book_id_2 || "",
    },
    student: {
      id: String(tx.student_id),
      student_id: tx.student_id_2 || "",
      name: `${tx.first_name || ""} ${tx.last_name || ""}`.trim() || "Unknown",
      email: "", // Not available in this query
    },
    created_at: tx.created_at,
    updated_at: tx.updated_at,
  };
}

export const transactionsApi = {
  // List all transactions with pagination
  list: async (
    params?: TransactionSearchParams
  ): Promise<PaginatedResponse<Transaction>> => {
    // Map frontend params to backend params
    const backendParams: Record<string, string | number | boolean | undefined> = {
      page: params?.page,
      limit: params?.per_page,
    };
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
    const response = await apiClient.post<ApiResponse<Transaction>>(`${TRANSACTIONS_PREFIX}/borrow`, data);
    return response.data;
  },

  // Return a book
  return: async (data: ReturnRequest): Promise<Transaction> => {
    const response = await apiClient.post<ApiResponse<Transaction>>(`${TRANSACTIONS_PREFIX}/return`, data);
    return response.data;
  },

  // Renew a book
  renew: async (data: RenewRequest): Promise<Transaction> => {
    const response = await apiClient.post<ApiResponse<Transaction>>(`${TRANSACTIONS_PREFIX}/renew`, data);
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
      const response = await apiClient.get<ApiResponse<BackendPaginatedFines>>(
        `${TRANSACTIONS_PREFIX}/fines`,
        { params }
      );
      return {
        data: response.data?.fines || [],
        pagination: transformPagination(response.data?.pagination),
      };
    },

    // Get single fine
    get: async (id: string): Promise<Fine> => {
      const response = await apiClient.get<ApiResponse<Fine>>(`${TRANSACTIONS_PREFIX}/fines/${id}`);
      return response.data;
    },

    // Pay a fine
    pay: async (data: FinePaymentRequest): Promise<Fine> => {
      const response = await apiClient.post<ApiResponse<Fine>>(
        `${TRANSACTIONS_PREFIX}/fines/${data.fine_id}/pay`,
        data
      );
      return response.data;
    },

    // Waive a fine (admin only)
    waive: async (id: string, reason?: string): Promise<Fine> => {
      const response = await apiClient.post<ApiResponse<Fine>>(
        `${TRANSACTIONS_PREFIX}/fines/${id}/waive`,
        { reason }
      );
      return response.data;
    },

    // Get total unpaid fines for a student
    getStudentUnpaid: async (studentId: string): Promise<{ total: number }> => {
      const response = await apiClient.get<ApiResponse<{ total: number }>>(
        `${TRANSACTIONS_PREFIX}/fines/student/${studentId}/unpaid`
      );
      return response.data || { total: 0 };
    },
  },
};

export default transactionsApi;
