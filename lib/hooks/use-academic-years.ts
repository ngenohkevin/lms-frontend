import useSWR from "swr";
import { academicYearsApi } from "@/lib/api/academic-years";
import type { AcademicYear } from "@/lib/types/academic-year";

export function useAcademicYears(includeInactive = false) {
  const key = includeInactive
    ? ["/api/v1/academic-years", { include_inactive: true }]
    : "/api/v1/academic-years";

  const { data, error, isLoading, mutate } = useSWR<AcademicYear[]>(
    key,
    () => academicYearsApi.list(includeInactive),
    {
      onError: () => {},
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 30000,
      dedupingInterval: 5000,
    }
  );

  return {
    academicYears: data || [],
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useAcademicYear(id: number | null) {
  const { data, error, isLoading, mutate } = useSWR<AcademicYear>(
    id ? `/api/v1/academic-years/${id}` : null,
    () => (id ? academicYearsApi.get(id) : Promise.resolve(null as unknown as AcademicYear)),
    { onError: () => {} }
  );

  return {
    academicYear: data,
    isLoading,
    error,
    refresh: mutate,
  };
}
