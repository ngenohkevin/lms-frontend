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

export const transactionsApi = {
  // List all transactions with pagination
  list: async (
    params?: TransactionSearchParams
  ): Promise<PaginatedResponse<Transaction>> => {
    return apiClient.get<PaginatedResponse<Transaction>>(TRANSACTIONS_PREFIX, {
      params,
    });
  },

  // Get single transaction by ID
  get: async (id: string): Promise<Transaction> => {
    return apiClient.get<Transaction>(`${TRANSACTIONS_PREFIX}/${id}`);
  },

  // Borrow a book
  borrow: async (data: BorrowRequest): Promise<Transaction> => {
    return apiClient.post<Transaction>(`${TRANSACTIONS_PREFIX}/borrow`, data);
  },

  // Return a book
  return: async (data: ReturnRequest): Promise<Transaction> => {
    return apiClient.post<Transaction>(`${TRANSACTIONS_PREFIX}/return`, data);
  },

  // Renew a book
  renew: async (data: RenewRequest): Promise<Transaction> => {
    return apiClient.post<Transaction>(`${TRANSACTIONS_PREFIX}/renew`, data);
  },

  // Get overdue transactions
  getOverdue: async (params?: {
    page?: number;
    per_page?: number;
    department?: string;
  }): Promise<PaginatedResponse<OverdueTransaction>> => {
    return apiClient.get<PaginatedResponse<OverdueTransaction>>(
      `${TRANSACTIONS_PREFIX}/overdue`,
      { params }
    );
  },

  // Get transaction stats
  getStats: async (): Promise<TransactionStats> => {
    return apiClient.get<TransactionStats>(`${TRANSACTIONS_PREFIX}/stats`);
  },

  // Get active transactions for a student
  getStudentActive: async (studentId: string): Promise<Transaction[]> => {
    return apiClient.get<Transaction[]>(
      `${TRANSACTIONS_PREFIX}/student/${studentId}/active`
    );
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
      return apiClient.get<PaginatedResponse<Fine>>(
        `${TRANSACTIONS_PREFIX}/fines`,
        { params }
      );
    },

    // Get single fine
    get: async (id: string): Promise<Fine> => {
      return apiClient.get<Fine>(`${TRANSACTIONS_PREFIX}/fines/${id}`);
    },

    // Pay a fine
    pay: async (data: FinePaymentRequest): Promise<Fine> => {
      return apiClient.post<Fine>(
        `${TRANSACTIONS_PREFIX}/fines/${data.fine_id}/pay`,
        data
      );
    },

    // Waive a fine (admin only)
    waive: async (id: string, reason?: string): Promise<Fine> => {
      return apiClient.post<Fine>(
        `${TRANSACTIONS_PREFIX}/fines/${id}/waive`,
        { reason }
      );
    },

    // Get total unpaid fines for a student
    getStudentUnpaid: async (studentId: string): Promise<{ total: number }> => {
      return apiClient.get<{ total: number }>(
        `${TRANSACTIONS_PREFIX}/fines/student/${studentId}/unpaid`
      );
    },
  },
};

export default transactionsApi;
