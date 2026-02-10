import apiClient from "./client";
import type {
  Fine,
  FinePaymentRequest,
  PaginatedResponse,
} from "@/lib/types";

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

// Transform backend pagination to frontend format
function transformPagination(bp?: BackendPagination): PaginatedResponse<Fine>["pagination"] | undefined {
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

// Backend fine structure
interface BackendFine {
  id: number;
  transaction_id: number;
  student_id: number;
  student_name?: string;
  student_code?: string;
  book_title?: string;
  book_author?: string;
  book_cover_url?: string;
  amount: number;
  reason?: string;
  paid: boolean;
  waived: boolean;
  waived_by?: number;
  waived_at?: string;
  waive_reason?: string;
  paid_at?: string;
  created_at: string;
}

// Transform backend fine to frontend format
function transformFine(fine: BackendFine): Fine {
  return {
    id: String(fine.id),
    transaction_id: String(fine.transaction_id),
    student_id: String(fine.student_id),
    student_name: fine.student_name,
    student_code: fine.student_code,
    book_title: fine.book_title,
    book_author: fine.book_author,
    book_cover_url: fine.book_cover_url,
    amount: fine.amount,
    reason: fine.reason || "Overdue book",
    paid: fine.paid,
    paid_at: fine.paid_at,
    created_at: fine.created_at,
  };
}

interface BackendPaginatedFines {
  fines: BackendFine[];
  pagination: BackendPagination;
}

// Fine statistics type
export interface FineStatistics {
  total_fines_count: number;
  total_fines_amount: number;
  paid_fines_count: number;
  paid_fines_amount: number;
  unpaid_fines_count: number;
  unpaid_fines_amount: number;
  waived_fines_count: number;
  waived_fines_amount: number;
  fine_per_day: number;
  average_fine_amount: number;
}

// Student with high fines type
export interface StudentWithHighFines {
  student_id: number;
  student_name: string;
  total_unpaid: number;
  unpaid_count: number;
}

export const finesApi = {
  // List all fines with pagination and filters
  list: async (params?: {
    paid?: boolean;
    student_id?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Fine>> => {
    const response = await apiClient.get<ApiResponse<BackendPaginatedFines>>(FINES_PREFIX, { params });
    return {
      data: (response.data?.fines || []).map(transformFine),
      pagination: transformPagination(response.data?.pagination),
    };
  },

  // Get single fine by transaction ID
  get: async (id: string): Promise<Fine> => {
    const response = await apiClient.get<ApiResponse<BackendFine>>(`${FINES_PREFIX}/${id}`);
    return transformFine(response.data);
  },

  // Get unpaid fines for a student
  getUnpaidByStudent: async (studentId: string): Promise<Fine[]> => {
    const response = await apiClient.get<ApiResponse<BackendFine[]>>(
      `${FINES_PREFIX}/student/${studentId}/unpaid`
    );
    return (response.data || []).map(transformFine);
  },

  // Get total unpaid fines for a student
  getTotalUnpaid: async (studentId: string): Promise<number> => {
    const response = await apiClient.get<ApiResponse<{ total: number }>>(
      `${FINES_PREFIX}/student/${studentId}/total`
    );
    return response.data?.total || 0;
  },

  // Pay a fine
  pay: async (id: string, data?: FinePaymentRequest): Promise<Fine> => {
    const response = await apiClient.post<ApiResponse<BackendFine>>(
      `${FINES_PREFIX}/${id}/pay`,
      data
    );
    return transformFine(response.data);
  },

  // Waive a fine (admin/librarian only)
  // Note: reason is required by the backend
  waive: async (id: string, reason: string): Promise<Fine> => {
    if (!reason || !reason.trim()) {
      throw new Error("Reason is required to waive a fine");
    }
    const response = await apiClient.post<ApiResponse<BackendFine>>(
      `${FINES_PREFIX}/${id}/waive`,
      { reason: reason.trim() }
    );
    return transformFine(response.data);
  },

  // Get fine statistics
  getStatistics: async (): Promise<FineStatistics> => {
    const response = await apiClient.get<ApiResponse<FineStatistics>>(`${FINES_PREFIX}/statistics`);
    return response.data;
  },

  // Get students with high fines
  getStudentsWithHighFines: async (threshold?: number): Promise<StudentWithHighFines[]> => {
    const response = await apiClient.get<ApiResponse<StudentWithHighFines[]>>(
      `${FINES_PREFIX}/high-fines`,
      { params: { threshold } }
    );
    return response.data || [];
  },

  // Trigger fine calculation (admin only)
  calculateFines: async (): Promise<{ processed: number }> => {
    const response = await apiClient.post<ApiResponse<{ processed: number }>>(
      `${FINES_PREFIX}/calculate`
    );
    return response.data;
  },
};

export default finesApi;
