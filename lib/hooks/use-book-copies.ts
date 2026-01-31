import useSWR from "swr";
import { toast } from "sonner";
import { bookCopiesApi } from "@/lib/api/book-copies";
import type { BookCopy } from "@/lib/types/book";

const handleApiError = (error: Error, context: string) => {
  console.error(`${context}:`, error);
  if (!error.message.includes("Failed to fetch")) {
    toast.error(`Failed to ${context.toLowerCase()}`, {
      description: error.message || "An unexpected error occurred",
    });
  }
};

export function useBookCopies(bookId: number | null, search?: string) {
  const key = bookId ? ["/api/v1/books/copies", bookId, search || ""] : null;

  const { data, error, isLoading, mutate } = useSWR<BookCopy[]>(
    key,
    () => (bookId ? bookCopiesApi.list(bookId, search) : Promise.resolve([])),
    {
      onError: (err) => handleApiError(err, "Load book copies"),
      shouldRetryOnError: true,
      errorRetryCount: 2,
    }
  );

  return {
    copies: data || [],
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useBookCopy(bookId: number | null, copyId: number | null) {
  const key = bookId && copyId ? ["/api/v1/books/copy", bookId, copyId] : null;

  const { data, error, isLoading, mutate } = useSWR<BookCopy>(
    key,
    () =>
      bookId && copyId
        ? bookCopiesApi.get(bookId, copyId)
        : Promise.reject("Missing IDs"),
    {
      onError: (err) => handleApiError(err, "Load book copy"),
      shouldRetryOnError: true,
      errorRetryCount: 2,
    }
  );

  return {
    copy: data,
    isLoading,
    error,
    refresh: mutate,
  };
}
