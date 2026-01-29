import useSWR from "swr";
import { toast } from "sonner";
import { booksApi } from "@/lib/api";
import type {
  Book,
  BookSearchParams,
  BookRating,
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

export function useBooks(params?: BookSearchParams) {
  const key = params ? ["/api/v1/books", params] : "/api/v1/books";

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Book>>(
    key,
    () => booksApi.list(params),
    {
      onError: (err) => handleApiError(err, "Load books"),
      shouldRetryOnError: true,
      errorRetryCount: 2,
    }
  );

  return {
    books: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useBookSearch(params: BookSearchParams) {
  const key = params.query
    ? ["/api/v1/books/search", params]
    : null;

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Book>>(
    key,
    () => booksApi.search(params),
    {
      onError: (err) => handleApiError(err, "Search books"),
      shouldRetryOnError: true,
      errorRetryCount: 2,
    }
  );

  return {
    books: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useBook(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Book>(
    id ? `/api/v1/books/${id}` : null,
    () => (id ? booksApi.get(id) : Promise.resolve(null as unknown as Book)),
    {
      onError: (err) => handleApiError(err, "Load book details"),
      shouldRetryOnError: true,
      errorRetryCount: 2,
    }
  );

  return {
    book: data,
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useBookRatings(
  bookId: string | null,
  params?: { page?: number; per_page?: number }
) {
  const key = bookId
    ? [`/api/v1/ratings/book/${bookId}`, params]
    : null;

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<BookRating>>(
    key,
    () => (bookId ? booksApi.getRatings(bookId, params) : Promise.resolve({ data: [], pagination: {} as never })),
    {
      onError: (err) => handleApiError(err, "Load book ratings"),
      shouldRetryOnError: true,
      errorRetryCount: 2,
    }
  );

  return {
    ratings: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useBookCategories() {
  const { data, error, isLoading } = useSWR<string[]>(
    "/api/v1/books/categories",
    () => booksApi.getCategories(),
    {
      onError: (err) => handleApiError(err, "Load categories"),
      shouldRetryOnError: true,
      errorRetryCount: 2,
    }
  );

  return {
    categories: data || [],
    isLoading,
    error,
  };
}
