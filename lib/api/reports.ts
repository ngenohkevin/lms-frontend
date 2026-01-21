import apiClient from "./client";
import type {
  DashboardMetrics,
  BorrowingStats,
  PopularBook,
  CategoryStats,
  StudentActivity,
  InventoryReport,
  BorrowingTrend,
  OverdueReport,
  ReportParams,
} from "@/lib/types";

const REPORTS_PREFIX = "/api/v1/reports";

// Backend response wrapper
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const reportsApi = {
  // Dashboard metrics - GET /api/v1/reports/dashboard-metrics
  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    const response = await apiClient.get<ApiResponse<DashboardMetrics>>(
      `${REPORTS_PREFIX}/dashboard-metrics`
    );
    return response.data;
  },

  // Library overview - GET /api/v1/reports/library-overview
  getLibraryOverview: async (): Promise<DashboardMetrics> => {
    const response = await apiClient.get<ApiResponse<DashboardMetrics>>(
      `${REPORTS_PREFIX}/library-overview`
    );
    return response.data;
  },

  // Borrowing statistics - POST /api/v1/reports/borrowing-statistics
  getBorrowingStats: async (params?: ReportParams): Promise<BorrowingStats[]> => {
    const response = await apiClient.post<ApiResponse<BorrowingStats[]>>(
      `${REPORTS_PREFIX}/borrowing-statistics`,
      params || {}
    );
    return response.data || [];
  },

  // Borrowing trends over time - POST /api/v1/reports/borrowing-trends
  getBorrowingTrends: async (params?: ReportParams): Promise<BorrowingTrend[]> => {
    const response = await apiClient.post<ApiResponse<BorrowingTrend[]>>(
      `${REPORTS_PREFIX}/borrowing-trends`,
      params || {}
    );
    return response.data || [];
  },

  // Popular books - POST /api/v1/reports/popular-books
  getPopularBooks: async (params?: {
    limit?: number;
    from_date?: string;
    to_date?: string;
    category?: string;
  }): Promise<PopularBook[]> => {
    const response = await apiClient.post<ApiResponse<PopularBook[]>>(
      `${REPORTS_PREFIX}/popular-books`,
      params || {}
    );
    return response.data || [];
  },

  // Category statistics (using library overview)
  getCategoryStats: async (): Promise<CategoryStats[]> => {
    const response = await apiClient.get<ApiResponse<CategoryStats[]>>(
      `${REPORTS_PREFIX}/library-overview`
    );
    return response.data || [];
  },

  // Student activity report - POST /api/v1/reports/student-activity
  getStudentActivity: async (params?: {
    limit?: number;
    department?: string;
    order_by?: string;
  }): Promise<StudentActivity[]> => {
    const response = await apiClient.post<ApiResponse<StudentActivity[]>>(
      `${REPORTS_PREFIX}/student-activity`,
      params || {}
    );
    return response.data || [];
  },

  // Inventory report - GET /api/v1/reports/inventory-status
  getInventoryReport: async (): Promise<InventoryReport> => {
    const response = await apiClient.get<ApiResponse<InventoryReport>>(
      `${REPORTS_PREFIX}/inventory-status`
    );
    return response.data;
  },

  // Overdue report - POST /api/v1/reports/overdue-books
  getOverdueReport: async (params?: {
    department?: string;
  }): Promise<OverdueReport> => {
    const response = await apiClient.post<ApiResponse<OverdueReport>>(
      `${REPORTS_PREFIX}/overdue-books`,
      params || {}
    );
    return response.data;
  },

  // Fine collection report
  getFineReport: async (params?: ReportParams): Promise<{
    total_fines: number;
    total_collected: number;
    total_pending: number;
    by_period: Array<{
      period: string;
      fines: number;
      collected: number;
    }>;
  }> => {
    const response = await apiClient.post<ApiResponse<{
      total_fines: number;
      total_collected: number;
      total_pending: number;
      by_period: Array<{
        period: string;
        fines: number;
        collected: number;
      }>;
    }>>(`${REPORTS_PREFIX}/borrowing-statistics`, params || {});
    return response.data;
  },

  // Export report - POST /api/v1/reports/export
  downloadReport: async (
    type: "borrowing" | "inventory" | "overdue" | "fines" | "students",
    format: "pdf" | "csv",
    params?: ReportParams
  ): Promise<Blob> => {
    const response = await fetch(`${REPORTS_PREFIX}/export`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        report_type: type,
        format,
        ...params,
      }),
      credentials: "include",
    });
    return response.blob();
  },
};

export default reportsApi;
