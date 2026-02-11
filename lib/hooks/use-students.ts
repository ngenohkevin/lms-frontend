import useSWR from "swr";
import { toast } from "sonner";
import { studentsApi } from "@/lib/api";
import type {
  Student,
  StudentSearchParams,
  StudentAnalytics,
  PaginatedResponse,
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

export function useStudents(params?: StudentSearchParams) {
  const key = params ? ["/api/v1/students", params] : "/api/v1/students";

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Student>>(
    key,
    () => studentsApi.list(params),
    {
      onError: (err) => handleApiError(err, "Load students"),
      shouldRetryOnError: true,
      errorRetryCount: 2,
    }
  );

  return {
    students: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useStudent(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Student>(
    id ? `/api/v1/students/${id}` : null,
    () => (id ? studentsApi.get(id) : Promise.resolve(null as unknown as Student)),
    {
      onError: (err) => handleApiError(err, "Load student details"),
      shouldRetryOnError: true,
      errorRetryCount: 2,
    }
  );

  return {
    student: data,
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useStudentStats() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/v1/students/status/statistics",
    () => studentsApi.getStatusStatistics(),
    {
      onError: (err) => handleApiError(err, "Load student statistics"),
      shouldRetryOnError: true,
      errorRetryCount: 2,
    }
  );

  return {
    stats: data,
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useStudentAnalytics(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<StudentAnalytics>(
    id ? `/api/v1/students/${id}/analytics` : null,
    () => (id ? studentsApi.getAnalytics(id) : Promise.resolve(null as unknown as StudentAnalytics)),
    {
      onError: (err) => handleApiError(err, "Load student analytics"),
      shouldRetryOnError: true,
      errorRetryCount: 2,
    }
  );

  return {
    analytics: data,
    isLoading,
    error,
    refresh: mutate,
  };
}

