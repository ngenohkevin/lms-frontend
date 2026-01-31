import useSWR from "swr";
import { languagesApi, type Language } from "@/lib/api/languages";

export function useLanguages(includeInactive = false) {
  const key = includeInactive
    ? ["/api/v1/languages", { include_inactive: true }]
    : "/api/v1/languages";

  const { data, error, isLoading, mutate } = useSWR<Language[]>(
    key,
    () => languagesApi.list(includeInactive),
    {
      onError: () => {},
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 30000,
      dedupingInterval: 5000,
    }
  );

  return {
    languages: data || [],
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useLanguage(id: number | null) {
  const { data, error, isLoading, mutate } = useSWR<Language>(
    id ? `/api/v1/languages/${id}` : null,
    () => (id ? languagesApi.get(id) : Promise.resolve(null as unknown as Language)),
    { onError: () => {} }
  );

  return {
    language: data,
    isLoading,
    error,
    refresh: mutate,
  };
}
