import apiClient from "./client";
import type { BookCopy, BookCopyFormData } from "@/lib/types/book";

const BOOKS_PREFIX = "/api/v1/books";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const bookCopiesApi = {
  /**
   * List all copies of a book
   */
  async list(bookId: number): Promise<BookCopy[]> {
    const response = await apiClient.get<ApiResponse<BookCopy[]>>(
      `${BOOKS_PREFIX}/${bookId}/copies`
    );
    return response.data || [];
  },

  /**
   * Get a single book copy
   */
  async get(bookId: number, copyId: number): Promise<BookCopy> {
    const response = await apiClient.get<ApiResponse<BookCopy>>(
      `${BOOKS_PREFIX}/${bookId}/copies/${copyId}`
    );
    return response.data;
  },

  /**
   * Create a new book copy
   */
  async create(bookId: number, data: BookCopyFormData): Promise<BookCopy> {
    const response = await apiClient.post<ApiResponse<BookCopy>>(
      `${BOOKS_PREFIX}/${bookId}/copies`,
      data
    );
    return response.data;
  },

  /**
   * Update a book copy
   */
  async update(
    bookId: number,
    copyId: number,
    data: Partial<BookCopyFormData>
  ): Promise<BookCopy> {
    const response = await apiClient.put<ApiResponse<BookCopy>>(
      `${BOOKS_PREFIX}/${bookId}/copies/${copyId}`,
      data
    );
    return response.data;
  },

  /**
   * Delete a book copy
   */
  async delete(bookId: number, copyId: number): Promise<void> {
    await apiClient.delete(`${BOOKS_PREFIX}/${bookId}/copies/${copyId}`);
  },

  /**
   * Scan/lookup a copy by barcode
   */
  async scanBarcode(barcode: string): Promise<BookCopy> {
    const response = await apiClient.get<ApiResponse<BookCopy>>(
      `${BOOKS_PREFIX}/copies/scan`,
      { params: { barcode } }
    );
    return response.data;
  },
};

export default bookCopiesApi;
