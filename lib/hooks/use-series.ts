import useSWR from "swr";
import { toast } from "sonner";
import { seriesApi } from "@/lib/api/series";
import type { Series, SeriesWithBooks } from "@/lib/types/book";
import type { PaginatedResponse } from "@/lib/types";

const handleApiError = (error: Error, context: string) => {
  console.error(`${context}:`, error);
  if (!error.message.includes("Failed to fetch")) {
    toast.error(`Failed to ${context.toLowerCase()}`, {
      description: error.message || "An unexpected error occurred",
    });
  }
};

export function useSeries(page: number = 1, limit: number = 20) {
  const key = ["/api/v1/series", page, limit];

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Series>>(
    key,
    () => seriesApi.list(page, limit),
    {
      onError: (err) => handleApiError(err, "Load series"),
      shouldRetryOnError: true,
      errorRetryCount: 2,
    }
  );

  return {
    series: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useSeriesSearch(query: string, page: number = 1, limit: number = 10) {
  const key = query ? ["/api/v1/series/search", query, page, limit] : null;

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Series>>(
    key,
    () => (query ? seriesApi.search(query, page, limit) : Promise.resolve({ data: [], pagination: undefined })),
    {
      onError: (err) => handleApiError(err, "Search series"),
      shouldRetryOnError: true,
      errorRetryCount: 2,
    }
  );

  return {
    series: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useSeriesById(id: number | null) {
  const key = id ? ["/api/v1/series", id] : null;

  const { data, error, isLoading, mutate } = useSWR<Series>(
    key,
    () => (id ? seriesApi.get(id) : Promise.reject("Missing ID")),
    {
      onError: (err) => handleApiError(err, "Load series"),
      shouldRetryOnError: true,
      errorRetryCount: 2,
    }
  );

  return {
    series: data,
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useSeriesWithBooks(id: number | null) {
  const key = id ? ["/api/v1/series/books", id] : null;

  const { data, error, isLoading, mutate } = useSWR<SeriesWithBooks>(
    key,
    () => (id ? seriesApi.getWithBooks(id) : Promise.reject("Missing ID")),
    {
      onError: (err) => handleApiError(err, "Load series with books"),
      shouldRetryOnError: true,
      errorRetryCount: 2,
    }
  );

  return {
    series: data,
    isLoading,
    error,
    refresh: mutate,
  };
}
