import useSWR from "swr";
import { toast } from "sonner";
import { reportsApi } from "@/lib/api";
import type {
  DashboardMetrics,
  BorrowingStats,
  PopularBook,
  CategoryStats,
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

// Helper to handle API errors consistently
const handleApiError = (error: Error, context: string) => {
  console.error(`${context}:`, error);
  // Only show toast for non-network errors (avoid spamming on connection issues)
  if (!error.message.includes("Failed to fetch")) {
    toast.error(`Failed to ${context.toLowerCase()}`, {
      description: error.message || "An unexpected error occurred",
    });
  }
};

export function useDashboardMetrics() {
  const { data, error, isLoading, mutate } = useSWR<DashboardMetrics>(
    "/api/v1/reports/dashboard-metrics",
    () => reportsApi.getDashboardMetrics(),
    {
      refreshInterval: 60000, // Refresh every minute
      onError: (err) => handleApiError(err, "Load dashboard metrics"),
      shouldRetryOnError: true,
      errorRetryCount: 2,
    }
  );

  return {
    metrics: data,
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useBorrowingStats(params?: ReportParams) {
  const key = params
    ? ["/api/v1/reports/borrowing-statistics", params]
    : "/api/v1/reports/borrowing-statistics";

  const { data, error, isLoading, mutate } = useSWR<BorrowingStats[]>(
    key,
    () => reportsApi.getBorrowingStats(params),
    {
      onError: (err) => handleApiError(err, "Load borrowing statistics"),
      shouldRetryOnError: true,
      errorRetryCount: 2,
    }
  );

  return {
    stats: data || [],
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useBorrowingTrends(params?: ReportParams) {
  const key = params
    ? ["/api/v1/reports/borrowing-trends", params]
    : "/api/v1/reports/borrowing-trends";

  const { data, error, isLoading, mutate } = useSWR<BorrowingTrend[]>(
    key,
    () => reportsApi.getBorrowingTrends(params),
    {
      onError: (err) => handleApiError(err, "Load borrowing trends"),
      shouldRetryOnError: true,
      errorRetryCount: 2,
    }
  );

  return {
    trends: data || [],
    isLoading,
    error,
    refresh: mutate,
  };
}

export function usePopularBooks(params?: {
  limit?: number;
  from_date?: string;
  to_date?: string;
  category?: string;
}) {
  const key = params
    ? ["/api/v1/reports/popular-books", params]
    : "/api/v1/reports/popular-books";

  const { data, error, isLoading, mutate } = useSWR<PopularBook[]>(
    key,
    () => reportsApi.getPopularBooks(params),
    {
      onError: (err) => handleApiError(err, "Load popular books"),
      shouldRetryOnError: true,
      errorRetryCount: 2,
    }
  );

  return {
    books: data || [],
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useCategoryStats() {
  const { data, error, isLoading, mutate } = useSWR<CategoryStats[]>(
    "/api/v1/reports/library-overview",
    () => reportsApi.getCategoryStats(),
    {
      onError: (err) => handleApiError(err, "Load category statistics"),
      shouldRetryOnError: true,
      errorRetryCount: 2,
    }
  );

  return {
    stats: data || [],
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useInventoryReport() {
  const { data, error, isLoading, mutate } = useSWR<InventoryReport>(
    "/api/v1/reports/inventory-status",
    () => reportsApi.getInventoryReport(),
    {
      onError: (err) => handleApiError(err, "Load inventory report"),
      shouldRetryOnError: true,
      errorRetryCount: 2,
    }
  );

  return {
    report: data,
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useOverdueReport(params?: { department?: string }) {
  const key = params
    ? ["/api/v1/reports/overdue-books", params]
    : "/api/v1/reports/overdue-books";

  const { data, error, isLoading, mutate } = useSWR<OverdueReport>(
    key,
    () => reportsApi.getOverdueReport(params),
    {
      onError: (err) => handleApiError(err, "Load overdue report"),
      shouldRetryOnError: true,
      errorRetryCount: 2,
    }
  );

  return {
    report: data,
    isLoading,
    error,
    refresh: mutate,
  };
}

// ============================================
// New Report Hooks
// ============================================

export function useIndividualStudentReport(
  studentId: number | null,
  params?: IndividualStudentReportRequest
) {
  const key = studentId
    ? ["/api/v1/reports/individual-student", studentId, params]
    : null;

  const { data, error, isLoading, mutate } = useSWR<IndividualStudentReport>(
    key,
    () => (studentId ? reportsApi.getIndividualStudentReport(studentId, params) : Promise.reject()),
    {
      onError: (err) => handleApiError(err, "Load student report"),
      shouldRetryOnError: true,
      errorRetryCount: 2,
    }
  );

  return {
    report: data,
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useLostBooksReport(params?: LostBooksReportRequest) {
  const key = params
    ? ["/api/v1/reports/lost-books", params]
    : "/api/v1/reports/lost-books";

  const { data, error, isLoading, mutate } = useSWR<LostBooksReport>(
    key,
    () => reportsApi.getLostBooksReport(params),
    {
      onError: (err) => handleApiError(err, "Load lost books report"),
      shouldRetryOnError: true,
      errorRetryCount: 2,
    }
  );

  return {
    report: data,
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useFinesCollectionReport(params?: FinesCollectionReportRequest) {
  const key = params
    ? ["/api/v1/reports/fines-collection", params]
    : "/api/v1/reports/fines-collection";

  const { data, error, isLoading, mutate } = useSWR<FinesCollectionReport>(
    key,
    () => reportsApi.getFinesCollectionReport(params),
    {
      onError: (err) => handleApiError(err, "Load fines collection report"),
      shouldRetryOnError: true,
      errorRetryCount: 2,
    }
  );

  return {
    report: data,
    isLoading,
    error,
    refresh: mutate,
  };
}
