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
   * @param bookId - The book ID
   * @param search - Optional search query (searches copy number, barcode, notes)
   */
  async list(bookId: number, search?: string): Promise<BookCopy[]> {
    const params = search ? { q: search } : undefined;
    const response = await apiClient.get<ApiResponse<BookCopy[]>>(
      `${BOOKS_PREFIX}/${bookId}/copies`,
      { params }
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

  /**
   * Generate multiple copies for a book
   */
  async generateCopies(
    bookId: number,
    count: number,
    bookCode: string
  ): Promise<BookCopy[]> {
    const response = await apiClient.post<ApiResponse<BookCopy[]>>(
      `${BOOKS_PREFIX}/${bookId}/copies/generate`,
      { count, book_code: bookCode }
    );
    return response.data || [];
  },
};

export default bookCopiesApi;
