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

// Helper to get default date range (last 30 days)
function getDefaultDateRange() {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  return {
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
  };
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

  // Borrowing trends - POST /api/v1/reports/borrowing-trends
  // Requires: start_date, end_date, interval
  getBorrowingTrends: async (params?: ReportParams): Promise<BorrowingTrend[]> => {
    const defaultDates = getDefaultDateRange();
    const response = await apiClient.post<ApiResponse<BorrowingTrend[]>>(
      `${REPORTS_PREFIX}/borrowing-trends`,
      {
        start_date: params?.from_date || defaultDates.start_date,
        end_date: params?.to_date || defaultDates.end_date,
        interval: params?.group_by || "day",
      }
    );
    return response.data || [];
  },

  // Popular books - POST /api/v1/reports/popular-books
  // Requires: start_date, end_date
  getPopularBooks: async (params?: {
    limit?: number;
    from_date?: string;
    to_date?: string;
    category?: string;
    year?: number;
    department?: string;
    period?: string;
  }): Promise<PopularBook[]> => {
    const defaultDates = getDefaultDateRange();
    const response = await apiClient.post<ApiResponse<PopularBook[]>>(
      `${REPORTS_PREFIX}/popular-books`,
      {
        start_date: params?.from_date || defaultDates.start_date,
        end_date: params?.to_date || defaultDates.end_date,
        limit: params?.limit || 10,
        year_of_study: params?.year,
      }
    );
    return response.data || [];
  },

  // Borrowing statistics - POST /api/v1/reports/borrowing-statistics
  // Requires: start_date, end_date
  getBorrowingStats: async (params?: ReportParams & { year?: number }): Promise<BorrowingStats[]> => {
    const defaultDates = getDefaultDateRange();
    const response = await apiClient.post<ApiResponse<BorrowingStats[]>>(
      `${REPORTS_PREFIX}/borrowing-statistics`,
      {
        start_date: params?.from_date || defaultDates.start_date,
        end_date: params?.to_date || defaultDates.end_date,
        year_of_study: params?.year,
      }
    );
    return response.data || [];
  },

  // Category statistics - GET /api/v1/reports/library-overview
  getCategoryStats: async (): Promise<CategoryStats[]> => {
    const response = await apiClient.get<ApiResponse<CategoryStats[]>>(
      `${REPORTS_PREFIX}/library-overview`
    );
    return response.data || [];
  },

  // Student activity report - POST /api/v1/reports/student-activity
  // Requires: start_date, end_date
  getStudentActivity: async (params?: {
    limit?: number;
    department?: string;
    year?: number;
    active_only?: boolean;
    period?: string;
  }): Promise<StudentActivity[]> => {
    const defaultDates = getDefaultDateRange();
    const response = await apiClient.post<ApiResponse<StudentActivity[]>>(
      `${REPORTS_PREFIX}/student-activity`,
      {
        start_date: defaultDates.start_date,
        end_date: defaultDates.end_date,
        department: params?.department,
        year_of_study: params?.year,
      }
    );
    return response.data || [];
  },

  // Inventory status - GET /api/v1/reports/inventory-status
  getInventoryReport: async (params?: {
    low_stock?: boolean;
    genre?: string;
    condition?: string;
    location?: string;
    category?: string;
  }): Promise<InventoryReport> => {
    const response = await apiClient.get<ApiResponse<InventoryReport>>(
      `${REPORTS_PREFIX}/inventory-status`,
      { params }
    );
    return response.data;
  },

  // Overdue report - POST /api/v1/reports/overdue-books
  // No required fields
  getOverdueReport: async (params?: {
    department?: string;
    year?: number;
    days_overdue?: number;
  }): Promise<OverdueReport> => {
    const response = await apiClient.post<ApiResponse<OverdueReport>>(
      `${REPORTS_PREFIX}/overdue-books`,
      {
        department: params?.department,
        year_of_study: params?.year,
      }
    );
    return response.data;
  },

  // Fine collection report - POST /api/v1/reports/borrowing-statistics
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
    const defaultDates = getDefaultDateRange();
    const response = await apiClient.post<ApiResponse<{
      total_fines: number;
      total_collected: number;
      total_pending: number;
      by_period: Array<{
        period: string;
        fines: number;
        collected: number;
      }>;
    }>>(`${REPORTS_PREFIX}/borrowing-statistics`, {
      start_date: params?.from_date || defaultDates.start_date,
      end_date: params?.to_date || defaultDates.end_date,
    });
    return response.data;
  },

  // Export report - POST /api/v1/reports/export
  downloadReport: async (
    type: "borrowing" | "inventory" | "overdue" | "fines" | "students",
    format: "pdf" | "csv",
    params?: ReportParams
  ): Promise<Blob> => {
    const queryParams = new URLSearchParams();
    queryParams.append("format", format);
    queryParams.append("type", type);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(`${REPORTS_PREFIX}/export?${queryParams.toString()}`, {
      method: "POST",
      credentials: "include",
    });
    return response.blob();
  },
};

export default reportsApi;
