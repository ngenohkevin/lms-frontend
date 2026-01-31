import useSWR from "swr";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { bookCopiesApi } from "@/lib/api/book-copies";
import { transactionsApi } from "@/lib/api/transactions";
import type { BookCopy } from "@/lib/types/book";
import type { BarcodeScanResult } from "@/lib/types/transaction";

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

/**
 * Hook for barcode scanning with transaction context
 */
export function useBarcodeScan() {
  const [scanResult, setScanResult] = useState<BarcodeScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scan = useCallback(async (barcode: string): Promise<BarcodeScanResult | null> => {
    setIsScanning(true);
    setError(null);

    try {
      const result = await transactionsApi.scanBarcode(barcode);
      setScanResult(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to scan barcode";
      setError(errorMessage);
      setScanResult(null);
      return null;
    } finally {
      setIsScanning(false);
    }
  }, []);

  const clear = useCallback(() => {
    setScanResult(null);
    setError(null);
  }, []);

  return {
    scanResult,
    isScanning,
    error,
    scan,
    clear,
  };
}
