import useSWR from "swr";
import { studentsApi } from "@/lib/api";
import type {
  Student,
  StudentSearchParams,
  StudentAnalytics,
  PaginatedResponse,
} from "@/lib/types";

export function useStudents(params?: StudentSearchParams) {
  const key = params ? ["/api/v1/students", params] : "/api/v1/students";

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Student>>(
    key,
    () => studentsApi.list(params)
  );

  return {
    students: data?.data,
    pagination: data?.pagination,
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useStudent(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Student>(
    id ? `/api/v1/students/${id}` : null,
    () => (id ? studentsApi.get(id) : Promise.resolve(null as unknown as Student))
  );

  return {
    student: data,
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useStudentAnalytics(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<StudentAnalytics>(
    id ? `/api/v1/students/${id}/analytics` : null,
    () => (id ? studentsApi.getAnalytics(id) : Promise.resolve(null as unknown as StudentAnalytics))
  );

  return {
    analytics: data,
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useStudentDepartments() {
  const { data, error, isLoading } = useSWR<string[]>(
    "/api/v1/students/departments",
    () => studentsApi.getDepartments()
  );

  return {
    departments: data,
    isLoading,
    error,
  };
}
