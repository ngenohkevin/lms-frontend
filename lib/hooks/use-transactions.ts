import useSWR from "swr";
import { transactionsApi } from "@/lib/api";
import type {
  Transaction,
  TransactionSearchParams,
  TransactionStats,
  OverdueTransaction,
  Fine,
  PaginatedResponse,
} from "@/lib/types";

export function useTransactions(params?: TransactionSearchParams) {
  const key = params
    ? ["/api/v1/transactions", params]
    : "/api/v1/transactions";

  const { data, error, isLoading, mutate } = useSWR<
    PaginatedResponse<Transaction>
  >(key, () => transactionsApi.list(params), { onError: () => {} });

  return {
    transactions: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useTransaction(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Transaction>(
    id ? `/api/v1/transactions/${id}` : null,
    () =>
      id
        ? transactionsApi.get(id)
        : Promise.resolve(null as unknown as Transaction),
    { onError: () => {} }
  );

  return {
    transaction: data,
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useTransactionStats() {
  const { data, error, isLoading, mutate } = useSWR<TransactionStats>(
    "/api/v1/transactions/stats",
    () => transactionsApi.getStats(),
    {
      refreshInterval: 60000,
      onError: () => {},
    }
  );

  return {
    stats: data,
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useOverdueTransactions(params?: {
  page?: number;
  per_page?: number;
  department?: string;
}) {
  const key = params
    ? ["/api/v1/transactions/overdue", params]
    : "/api/v1/transactions/overdue";

  const { data, error, isLoading, mutate } = useSWR<
    PaginatedResponse<OverdueTransaction>
  >(key, () => transactionsApi.getOverdue(params), { onError: () => {} });

  return {
    overdueTransactions: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useStudentActiveTransactions(studentId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Transaction[]>(
    studentId ? `/api/v1/transactions/history/${studentId}` : null,
    async () => {
      if (!studentId) return [];
      const transactions = await transactionsApi.getHistory(studentId);
      // Filter for active transactions (not returned)
      return transactions.filter(t => t.status === "active" || t.status === "overdue");
    },
    { onError: () => {} }
  );

  return {
    transactions: data || [],
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useFines(params?: {
  student_id?: string;
  paid?: boolean;
  page?: number;
  per_page?: number;
}) {
  const key = params
    ? ["/api/v1/transactions/fines", params]
    : "/api/v1/transactions/fines";

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Fine>>(
    key,
    () => transactionsApi.fines.list(params),
    { onError: () => {} }
  );

  return {
    fines: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refresh: mutate,
  };
}
