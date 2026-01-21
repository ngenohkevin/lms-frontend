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

// Backend paginated response structures
interface BackendPaginatedTransactions {
  transactions: Transaction[];
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
    return {
      data: response.data?.transactions || [],
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
      total_transactions: 0,
    };
  },

  // Get active transactions for a student
  getStudentActive: async (studentId: string): Promise<Transaction[]> => {
    const response = await apiClient.get<ApiResponse<Transaction[]>>(
      `${TRANSACTIONS_PREFIX}/student/${studentId}/active`
    );
    return response.data || [];
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
