import useSWR from "swr";
import { booksApi } from "@/lib/api";
import type {
  Book,
  BookSearchParams,
  BookRating,
  PaginatedResponse,
} from "@/lib/types";

export function useBooks(params?: BookSearchParams) {
  const key = params ? ["/api/v1/books", params] : "/api/v1/books";

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Book>>(
    key,
    () => booksApi.list(params),
    { onError: () => {} }
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
    { onError: () => {} }
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
    { onError: () => {} }
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
    ? [`/api/v1/books/${bookId}/ratings`, params]
    : null;

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<BookRating>>(
    key,
    () => (bookId ? booksApi.getRatings(bookId, params) : Promise.resolve({ data: [], pagination: {} as never })),
    { onError: () => {} }
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
    { onError: () => {} }
  );

  return {
    categories: data || [],
    isLoading,
    error,
  };
}
