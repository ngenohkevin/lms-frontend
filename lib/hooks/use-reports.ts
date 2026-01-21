import useSWR from "swr";
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
} from "@/lib/types";

export function useDashboardMetrics() {
  const { data, error, isLoading, mutate } = useSWR<DashboardMetrics>(
    "/api/v1/reports/dashboard",
    () => reportsApi.getDashboardMetrics(),
    {
      refreshInterval: 60000, // Refresh every minute
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
    ? ["/api/v1/reports/borrowing-stats", params]
    : "/api/v1/reports/borrowing-stats";

  const { data, error, isLoading, mutate } = useSWR<BorrowingStats[]>(
    key,
    () => reportsApi.getBorrowingStats(params)
  );

  return {
    stats: data,
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
    () => reportsApi.getBorrowingTrends(params)
  );

  return {
    trends: data,
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

  const { data, error, isLoading, mutate } = useSWR<PopularBook[]>(key, () =>
    reportsApi.getPopularBooks(params)
  );

  return {
    books: data,
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useCategoryStats() {
  const { data, error, isLoading, mutate } = useSWR<CategoryStats[]>(
    "/api/v1/reports/category-stats",
    () => reportsApi.getCategoryStats()
  );

  return {
    stats: data,
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useInventoryReport() {
  const { data, error, isLoading, mutate } = useSWR<InventoryReport>(
    "/api/v1/reports/inventory",
    () => reportsApi.getInventoryReport()
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
    ? ["/api/v1/reports/overdue", params]
    : "/api/v1/reports/overdue";

  const { data, error, isLoading, mutate } = useSWR<OverdueReport>(key, () =>
    reportsApi.getOverdueReport(params)
  );

  return {
    report: data,
    isLoading,
    error,
    refresh: mutate,
  };
}
