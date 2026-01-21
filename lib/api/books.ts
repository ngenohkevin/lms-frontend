import apiClient from "./client";
import type {
  Book,
  BookFormData,
  BookSearchParams,
  BookRating,
  BookRatingFormData,
  ISBNLookupResult,
  BookImportResult,
  PaginatedResponse,
  ApiResponse,
} from "@/lib/types";

const BOOKS_PREFIX = "/api/v1/books";

export const booksApi = {
  // List all books with pagination
  list: async (
    params?: BookSearchParams
  ): Promise<PaginatedResponse<Book>> => {
    return apiClient.get<PaginatedResponse<Book>>(BOOKS_PREFIX, { params });
  },

  // Search books
  search: async (
    params: BookSearchParams
  ): Promise<PaginatedResponse<Book>> => {
    return apiClient.get<PaginatedResponse<Book>>(`${BOOKS_PREFIX}/search`, {
      params,
    });
  },

  // Get single book by ID
  get: async (id: string): Promise<Book> => {
    return apiClient.get<Book>(`${BOOKS_PREFIX}/${id}`);
  },

  // Create a new book
  create: async (data: BookFormData): Promise<Book> => {
    return apiClient.post<Book>(BOOKS_PREFIX, data);
  },

  // Update a book
  update: async (id: string, data: Partial<BookFormData>): Promise<Book> => {
    return apiClient.put<Book>(`${BOOKS_PREFIX}/${id}`, data);
  },

  // Delete a book
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BOOKS_PREFIX}/${id}`);
  },

  // Lookup book by ISBN
  lookupISBN: async (isbn: string): Promise<ISBNLookupResult> => {
    return apiClient.post<ISBNLookupResult>(`${BOOKS_PREFIX}/isbn/fetch`, {
      isbn,
    });
  },

  // Upload book cover
  uploadCover: async (id: string, file: File): Promise<Book> => {
    const formData = new FormData();
    formData.append("cover", file);
    return apiClient.upload<Book>(`${BOOKS_PREFIX}/${id}/cover`, formData);
  },

  // Delete book cover
  deleteCover: async (id: string): Promise<void> => {
    await apiClient.delete(`${BOOKS_PREFIX}/${id}/cover`);
  },

  // Get book ratings
  getRatings: async (
    bookId: string,
    params?: { page?: number; per_page?: number }
  ): Promise<PaginatedResponse<BookRating>> => {
    return apiClient.get<PaginatedResponse<BookRating>>(
      `${BOOKS_PREFIX}/${bookId}/ratings`,
      { params }
    );
  },

  // Add a rating
  addRating: async (
    bookId: string,
    data: BookRatingFormData
  ): Promise<BookRating> => {
    return apiClient.post<BookRating>(
      `${BOOKS_PREFIX}/${bookId}/ratings`,
      data
    );
  },

  // Update a rating
  updateRating: async (
    bookId: string,
    ratingId: string,
    data: BookRatingFormData
  ): Promise<BookRating> => {
    return apiClient.put<BookRating>(
      `${BOOKS_PREFIX}/${bookId}/ratings/${ratingId}`,
      data
    );
  },

  // Delete a rating
  deleteRating: async (bookId: string, ratingId: string): Promise<void> => {
    await apiClient.delete(`${BOOKS_PREFIX}/${bookId}/ratings/${ratingId}`);
  },

  // Bulk import books
  import: async (file: File): Promise<BookImportResult> => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.upload<BookImportResult>(
      `${BOOKS_PREFIX}/import`,
      formData
    );
  },

  // Export books to CSV
  export: async (params?: BookSearchParams): Promise<Blob> => {
    const url = new URL(`${BOOKS_PREFIX}/export`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    const response = await fetch(url.toString(), {
      credentials: "include",
    });
    return response.blob();
  },

  // Get categories
  getCategories: async (): Promise<string[]> => {
    return apiClient.get<string[]>(`${BOOKS_PREFIX}/categories`);
  },
};

export default booksApi;
