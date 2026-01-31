import useSWR from "swr";
import { categoriesApi, type Category } from "@/lib/api/categories";

export function useCategories(includeInactive = false) {
  const key = includeInactive
    ? ["/api/v1/categories", { include_inactive: true }]
    : "/api/v1/categories";

  const { data, error, isLoading, mutate } = useSWR<Category[]>(
    key,
    () => categoriesApi.list(includeInactive),
    {
      onError: () => {},
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 30000, // Refresh every 30 seconds
      dedupingInterval: 5000, // 5 second deduping
    }
  );

  return {
    categories: data || [],
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useCategory(id: number | null) {
  const { data, error, isLoading, mutate } = useSWR<Category>(
    id ? `/api/v1/categories/${id}` : null,
    () => (id ? categoriesApi.get(id) : Promise.resolve(null as unknown as Category)),
    { onError: () => {} }
  );

  return {
    category: data,
    isLoading,
    error,
    refresh: mutate,
  };
}
