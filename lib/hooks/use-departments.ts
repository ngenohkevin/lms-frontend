import useSWR from "swr";
import { departmentsApi } from "@/lib/api/departments";
import type { Department } from "@/lib/types/department";

export function useDepartments(includeInactive = false) {
  const key = includeInactive
    ? ["/api/v1/departments", { include_inactive: true }]
    : "/api/v1/departments";

  const { data, error, isLoading, mutate } = useSWR<Department[]>(
    key,
    () => departmentsApi.list(includeInactive),
    {
      onError: () => {},
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 30000,
      dedupingInterval: 5000,
    }
  );

  return {
    departments: data || [],
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useDepartment(id: number | null) {
  const { data, error, isLoading, mutate } = useSWR<Department>(
    id ? `/api/v1/departments/${id}` : null,
    () => (id ? departmentsApi.get(id) : Promise.resolve(null as unknown as Department)),
    { onError: () => {} }
  );

  return {
    department: data,
    isLoading,
    error,
    refresh: mutate,
  };
}
