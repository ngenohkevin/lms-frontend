import apiClient from "./client";
import type {
  DashboardMetrics,
  DashboardMetricsResponse,
  LibraryOverviewResponse,
  BorrowingStats,
  PopularBook,
  CategoryStats,
  StudentActivity,
  InventoryReport,
  BorrowingTrend,
  OverdueReport,
  ReportParams,
  IndividualStudentReport,
  IndividualStudentReportRequest,
  LostBooksReport,
  LostBooksReportRequest,
  FinesCollectionReport,
  FinesCollectionReportRequest,
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

// Helper to safely parse number, returning 0 for NaN/null/undefined
function safeNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  if (typeof value === "number") {
    return isNaN(value) ? 0 : value;
  }
  return 0;
}

export const reportsApi = {
  // Dashboard metrics - combines dashboard-metrics and library-overview
  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    // Fetch both endpoints for complete data
    const [dashboardResponse, overviewResponse] = await Promise.all([
      apiClient.get<ApiResponse<DashboardMetricsResponse>>(
        `${REPORTS_PREFIX}/dashboard-metrics`
      ),
      apiClient.get<ApiResponse<LibraryOverviewResponse>>(
        `${REPORTS_PREFIX}/library-overview`
      ),
    ]);

    const dashboard = dashboardResponse.data;
    const overview = overviewResponse.data;

    // Combine and transform the data
    return {
      total_books: safeNumber(overview?.total_books),
      total_students: safeNumber(overview?.total_students),
      active_borrows: safeNumber(overview?.active_borrows),
      overdue_books: safeNumber(overview?.overdue_books),
      today_borrows: safeNumber(dashboard?.today_borrows),
      today_returns: safeNumber(dashboard?.today_returns),
      pending_reservations: safeNumber(overview?.total_reservations ?? dashboard?.pending_reservations),
      total_fines: safeNumber(overview?.total_fines),
      available_books: safeNumber(overview?.available_books ?? dashboard?.available_books),
    };
  },

  // Library overview - GET /api/v1/reports/library-overview
  getLibraryOverview: async (): Promise<LibraryOverviewResponse> => {
    const response = await apiClient.get<ApiResponse<LibraryOverviewResponse>>(
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
        year_of_study: params?.year,
      }
    );
    return response.data || [];
  },

  // Inventory status - GET /api/v1/reports/inventory-status
  // Backend returns { genres[], summary{} } — transform to frontend InventoryReport shape
  getInventoryReport: async (params?: {
    low_stock?: boolean;
    genre?: string;
    condition?: string;
    location?: string;
    category?: string;
  }): Promise<InventoryReport> => {
    interface BackendGenre {
      genre: string;
      total_books: number;
      available_books: number;
      borrowed_books: number;
      reserved_books: number;
      utilization_rate: string;
    }
    interface BackendInventory {
      genres: BackendGenre[];
      summary: {
        total_books: number;
        available_books: number;
        overall_utilization: string;
      };
    }
    const response = await apiClient.get<ApiResponse<BackendInventory>>(
      `${REPORTS_PREFIX}/inventory-status`,
      { params }
    );
    const raw = response.data;
    const genres = raw?.genres || [];
    const summary = raw?.summary || { total_books: 0, available_books: 0, overall_utilization: "0" };

    const availableCopies = safeNumber(summary.available_books);
    const totalBorrowed = genres.reduce((sum, g) => sum + safeNumber(g.borrowed_books), 0);

    return {
      total_books: safeNumber(summary.total_books),
      total_copies: availableCopies + totalBorrowed,
      available_copies: availableCopies,
      checked_out: totalBorrowed,
      lost_books: 0,
      categories: genres.map((g) => ({
        category: g.genre,
        total_books: safeNumber(g.total_books),
        total_borrowed: safeNumber(g.borrowed_books),
        available: safeNumber(g.available_books),
      })),
    };
  },

  // Overdue report - POST /api/v1/reports/overdue-books
  // No required fields
  getOverdueReport: async (params?: {
    year?: number;
    days_overdue?: number;
  }): Promise<OverdueReport> => {
    const response = await apiClient.post<ApiResponse<OverdueReport>>(
      `${REPORTS_PREFIX}/overdue-books`,
      {
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

  // ============================================
  // New Report Endpoints
  // ============================================

  // Individual Student Report - GET /api/v1/reports/individual-student/:id
  getIndividualStudentReport: async (
    studentId: number,
    params?: IndividualStudentReportRequest
  ): Promise<IndividualStudentReport> => {
    const queryParams = new URLSearchParams();
    if (params?.limit) {
      queryParams.append("limit", String(params.limit));
    }
    if (params?.start_date) {
      queryParams.append("start_date", params.start_date);
    }
    if (params?.end_date) {
      queryParams.append("end_date", params.end_date);
    }
    const queryString = queryParams.toString();
    const url = `${REPORTS_PREFIX}/individual-student/${studentId}${queryString ? `?${queryString}` : ""}`;
    const response = await apiClient.get<ApiResponse<IndividualStudentReport>>(url);
    return response.data;
  },

  // Lost Books Report - POST /api/v1/reports/lost-books
  getLostBooksReport: async (
    params?: LostBooksReportRequest
  ): Promise<LostBooksReport> => {
    const defaultDates = getDefaultDateRange();
    const response = await apiClient.post<ApiResponse<LostBooksReport>>(
      `${REPORTS_PREFIX}/lost-books`,
      {
        start_date: params?.start_date || defaultDates.start_date,
        end_date: params?.end_date || defaultDates.end_date,
        year_of_study: params?.year_of_study,
        genre: params?.genre,
        interval: params?.interval || "month",
      }
    );
    return response.data;
  },

  // Fines Collection Report - POST /api/v1/reports/fines-collection
  getFinesCollectionReport: async (
    params?: FinesCollectionReportRequest
  ): Promise<FinesCollectionReport> => {
    const defaultDates = getDefaultDateRange();
    const response = await apiClient.post<ApiResponse<FinesCollectionReport>>(
      `${REPORTS_PREFIX}/fines-collection`,
      {
        start_date: params?.start_date || defaultDates.start_date,
        end_date: params?.end_date || defaultDates.end_date,
        interval: params?.interval || "month",
        paid_only: params?.paid_only,
        limit: params?.limit || 50,
      }
    );
    return response.data;
  },
};

export default reportsApi;
