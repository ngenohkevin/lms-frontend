import useSWR from "swr";
import { toast } from "sonner";
import { authorsApi } from "@/lib/api/authors";
import type { Author, AuthorWithBooks } from "@/lib/types/book";
import type { PaginatedResponse } from "@/lib/types";

const handleApiError = (error: Error, context: string) => {
  console.error(`${context}:`, error);
  if (!error.message.includes("Failed to fetch")) {
    toast.error(`Failed to ${context.toLowerCase()}`, {
      description: error.message || "An unexpected error occurred",
    });
  }
};

export function useAuthors(page: number = 1, limit: number = 20) {
  const key = ["/api/v1/authors", page, limit];

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Author>>(
    key,
    () => authorsApi.list(page, limit),
    {
      onError: (err) => handleApiError(err, "Load authors"),
      shouldRetryOnError: true,
      errorRetryCount: 2,
    }
  );

  return {
    authors: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useAuthorSearch(query: string, page: number = 1, limit: number = 10) {
  const key = query ? ["/api/v1/authors/search", query, page, limit] : null;

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Author>>(
    key,
    () => (query ? authorsApi.search(query, page, limit) : Promise.resolve({ data: [], pagination: {} as any })),
    {
      onError: (err) => handleApiError(err, "Search authors"),
      shouldRetryOnError: true,
      errorRetryCount: 2,
    }
  );

  return {
    authors: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useAuthor(id: number | null) {
  const key = id ? ["/api/v1/authors", id] : null;

  const { data, error, isLoading, mutate } = useSWR<Author>(
    key,
    () => (id ? authorsApi.get(id) : Promise.reject("Missing ID")),
    {
      onError: (err) => handleApiError(err, "Load author"),
      shouldRetryOnError: true,
      errorRetryCount: 2,
    }
  );

  return {
    author: data,
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useAuthorWithBooks(id: number | null) {
  const key = id ? ["/api/v1/authors/books", id] : null;

  const { data, error, isLoading, mutate } = useSWR<AuthorWithBooks>(
    key,
    () => (id ? authorsApi.getWithBooks(id) : Promise.reject("Missing ID")),
    {
      onError: (err) => handleApiError(err, "Load author with books"),
      shouldRetryOnError: true,
      errorRetryCount: 2,
    }
  );

  return {
    author: data,
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useBookAuthors(bookId: number | null) {
  const key = bookId ? ["/api/v1/books/authors", bookId] : null;

  const { data, error, isLoading, mutate } = useSWR<Author[]>(
    key,
    () => (bookId ? authorsApi.listBookAuthors(bookId) : Promise.resolve([])),
    {
      onError: (err) => handleApiError(err, "Load book authors"),
      shouldRetryOnError: true,
      errorRetryCount: 2,
    }
  );

  return {
    authors: data || [],
    isLoading,
    error,
    refresh: mutate,
  };
}
