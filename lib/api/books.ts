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
} from "@/lib/types";

const BOOKS_PREFIX = "/api/v1/books";

// Backend response wrapper
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Backend pagination structure
interface BackendPagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

// Backend paginated response structure
interface BackendPaginatedBooks {
  books: Book[];
  pagination: BackendPagination;
}

// Transform backend pagination to frontend format
function transformPagination(bp?: BackendPagination): PaginatedResponse<Book>["pagination"] | undefined {
  if (!bp) return undefined;
  return {
    page: bp.page,
    per_page: bp.limit,
    total: bp.total,
    total_pages: bp.total_pages,
    has_next: bp.page < bp.total_pages,
    has_prev: bp.page > 1,
  };
}

export const booksApi = {
  // List all books with pagination
  list: async (
    params?: BookSearchParams
  ): Promise<PaginatedResponse<Book>> => {
    const response = await apiClient.get<ApiResponse<BackendPaginatedBooks>>(BOOKS_PREFIX, { params });
    return {
      data: response.data?.books || [],
      pagination: transformPagination(response.data?.pagination),
    };
  },

  // Search books
  search: async (
    params: BookSearchParams
  ): Promise<PaginatedResponse<Book>> => {
    const response = await apiClient.get<ApiResponse<BackendPaginatedBooks>>(`${BOOKS_PREFIX}/search`, {
      params,
    });
    return {
      data: response.data?.books || [],
      pagination: transformPagination(response.data?.pagination),
    };
  },

  // Get single book by ID
  get: async (id: string): Promise<Book> => {
    const response = await apiClient.get<ApiResponse<Book>>(`${BOOKS_PREFIX}/${id}`);
    return response.data;
  },

  // Create a new book
  create: async (data: BookFormData): Promise<Book> => {
    const response = await apiClient.post<ApiResponse<Book>>(BOOKS_PREFIX, data);
    return response.data;
  },

  // Update a book
  update: async (id: string, data: Partial<BookFormData>): Promise<Book> => {
    const response = await apiClient.put<ApiResponse<Book>>(`${BOOKS_PREFIX}/${id}`, data);
    return response.data;
  },

  // Delete a book
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BOOKS_PREFIX}/${id}`);
  },

  // Lookup book by ISBN
  lookupISBN: async (isbn: string): Promise<ISBNLookupResult> => {
    const response = await apiClient.post<ApiResponse<ISBNLookupResult>>(`${BOOKS_PREFIX}/isbn/fetch`, {
      isbn,
    });
    return response.data;
  },

  // Upload book cover
  uploadCover: async (id: string, file: File): Promise<Book> => {
    const formData = new FormData();
    formData.append("cover", file);
    const response = await apiClient.upload<ApiResponse<Book>>(`${BOOKS_PREFIX}/${id}/cover`, formData);
    return response.data;
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
    const response = await apiClient.get<ApiResponse<{ ratings: BookRating[]; pagination: BackendPagination }>>(
      `${BOOKS_PREFIX}/${bookId}/ratings`,
      { params }
    );
    return {
      data: response.data?.ratings || [],
      pagination: transformPagination(response.data?.pagination),
    };
  },

  // Add a rating
  addRating: async (
    bookId: string,
    data: BookRatingFormData
  ): Promise<BookRating> => {
    const response = await apiClient.post<ApiResponse<BookRating>>(
      `${BOOKS_PREFIX}/${bookId}/ratings`,
      data
    );
    return response.data;
  },

  // Update a rating
  updateRating: async (
    bookId: string,
    ratingId: string,
    data: BookRatingFormData
  ): Promise<BookRating> => {
    const response = await apiClient.put<ApiResponse<BookRating>>(
      `${BOOKS_PREFIX}/${bookId}/ratings/${ratingId}`,
      data
    );
    return response.data;
  },

  // Delete a rating
  deleteRating: async (bookId: string, ratingId: string): Promise<void> => {
    await apiClient.delete(`${BOOKS_PREFIX}/${bookId}/ratings/${ratingId}`);
  },

  // Bulk import books
  import: async (file: File): Promise<BookImportResult> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.upload<ApiResponse<BookImportResult>>(
      `${BOOKS_PREFIX}/import`,
      formData
    );
    return response.data;
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
    const response = await apiClient.get<ApiResponse<string[]>>(`${BOOKS_PREFIX}/categories`);
    return response.data || [];
  },
};

export default booksApi;
