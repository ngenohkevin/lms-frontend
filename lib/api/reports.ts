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

export const reportsApi = {
  // Dashboard metrics
  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    return apiClient.get<DashboardMetrics>(`${REPORTS_PREFIX}/dashboard`);
  },

  // Borrowing statistics
  getBorrowingStats: async (params?: ReportParams): Promise<BorrowingStats[]> => {
    return apiClient.get<BorrowingStats[]>(`${REPORTS_PREFIX}/borrowing-stats`, {
      params,
    });
  },

  // Borrowing trends over time
  getBorrowingTrends: async (params?: ReportParams): Promise<BorrowingTrend[]> => {
    return apiClient.get<BorrowingTrend[]>(`${REPORTS_PREFIX}/borrowing-trends`, {
      params,
    });
  },

  // Popular books
  getPopularBooks: async (params?: {
    limit?: number;
    from_date?: string;
    to_date?: string;
    category?: string;
  }): Promise<PopularBook[]> => {
    return apiClient.get<PopularBook[]>(`${REPORTS_PREFIX}/popular-books`, {
      params,
    });
  },

  // Category statistics
  getCategoryStats: async (): Promise<CategoryStats[]> => {
    return apiClient.get<CategoryStats[]>(`${REPORTS_PREFIX}/category-stats`);
  },

  // Student activity report
  getStudentActivity: async (params?: {
    limit?: number;
    department?: string;
    order_by?: string;
  }): Promise<StudentActivity[]> => {
    return apiClient.get<StudentActivity[]>(`${REPORTS_PREFIX}/student-activity`, {
      params,
    });
  },

  // Inventory report
  getInventoryReport: async (): Promise<InventoryReport> => {
    return apiClient.get<InventoryReport>(`${REPORTS_PREFIX}/inventory`);
  },

  // Overdue report
  getOverdueReport: async (params?: {
    department?: string;
  }): Promise<OverdueReport> => {
    return apiClient.get<OverdueReport>(`${REPORTS_PREFIX}/overdue`, { params });
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
    return apiClient.get(`${REPORTS_PREFIX}/fines`, { params });
  },

  // Generate and download report as PDF/CSV
  downloadReport: async (
    type: "borrowing" | "inventory" | "overdue" | "fines" | "students",
    format: "pdf" | "csv",
    params?: ReportParams
  ): Promise<Blob> => {
    const url = new URL(`${REPORTS_PREFIX}/${type}/download`);
    url.searchParams.append("format", format);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    const response = await fetch(url.toString(), {
      credentials: "include",
    });
    return response.blob();
  },
};

export default reportsApi;
