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

// Transform backend book response to add frontend convenience aliases
function transformBook(book: Book): Book {
  return {
    ...book,
    // Ensure id is always a string for consistent frontend usage
    id: String(book.id),
    // Add convenience aliases for frontend components
    publication_year: book.published_year,
    category: book.genre,
    cover_url: book.cover_image_url,
    location: book.shelf_location,
    // Map page_count to pages for form compatibility
    pages: book.page_count ?? book.pages,
  };
}

function transformBooks(books: Book[]): Book[] {
  return books.map(transformBook);
}

export const booksApi = {
  // List all books with pagination
  list: async (
    params?: BookSearchParams
  ): Promise<PaginatedResponse<Book>> => {
    const response = await apiClient.get<ApiResponse<BackendPaginatedBooks>>(BOOKS_PREFIX, { params });
    return {
      data: transformBooks(response.data?.books || []),
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
      data: transformBooks(response.data?.books || []),
      pagination: transformPagination(response.data?.pagination),
    };
  },

  // Get single book by ID (numeric) or book_id (string like "BK001")
  get: async (id: string): Promise<Book> => {
    // Check if the ID is numeric or a string book_id
    const isNumericId = /^\d+$/.test(id);
    const endpoint = isNumericId
      ? `${BOOKS_PREFIX}/${id}`
      : `${BOOKS_PREFIX}/book/${id}`;
    const response = await apiClient.get<ApiResponse<Book>>(endpoint);
    return transformBook(response.data);
  },

  // Create a new book
  create: async (data: BookFormData): Promise<Book> => {
    // Transform frontend field names to backend field names
    const backendData = {
      book_id: data.book_id,
      isbn: data.isbn || undefined,
      title: data.title,
      author: data.author,
      publisher: data.publisher || undefined,
      published_year: data.publication_year,
      genre: data.category || undefined,
      description: data.description || undefined,
      total_copies: data.total_copies,
      shelf_location: data.location || undefined,
      cover_image_url: data.cover_image_url || undefined,
      // Additional metadata fields
      category_id: data.category_id || undefined,
      series_id: data.series_id || undefined,
      series_number: data.series_number || undefined,
      language: data.language || undefined,
      page_count: data.pages || undefined,
      edition: data.edition || undefined,
      format: data.format || undefined,
    };
    const response = await apiClient.post<ApiResponse<Book>>(BOOKS_PREFIX, backendData);
    return transformBook(response.data);
  },

  // Update a book
  update: async (id: string, data: Partial<BookFormData>): Promise<Book> => {
    // Transform frontend field names to backend field names
    const backendData: Record<string, unknown> = {};
    if (data.book_id !== undefined) backendData.book_id = data.book_id;
    if (data.isbn !== undefined) backendData.isbn = data.isbn || undefined;
    if (data.title !== undefined) backendData.title = data.title;
    if (data.author !== undefined) backendData.author = data.author;
    if (data.publisher !== undefined) backendData.publisher = data.publisher || undefined;
    if (data.publication_year !== undefined) backendData.published_year = data.publication_year;
    if (data.category !== undefined) backendData.genre = data.category || undefined;
    if (data.description !== undefined) backendData.description = data.description || undefined;
    if (data.total_copies !== undefined) backendData.total_copies = data.total_copies;
    if (data.location !== undefined) backendData.shelf_location = data.location || undefined;
    if (data.cover_image_url !== undefined) backendData.cover_image_url = data.cover_image_url || undefined;
    // Additional metadata fields
    if (data.category_id !== undefined) backendData.category_id = data.category_id || undefined;
    if (data.series_id !== undefined) backendData.series_id = data.series_id || undefined;
    if (data.series_number !== undefined) backendData.series_number = data.series_number || undefined;
    if (data.language !== undefined) backendData.language = data.language || undefined;
    if (data.pages !== undefined) backendData.page_count = data.pages || undefined;
    if (data.edition !== undefined) backendData.edition = data.edition || undefined;
    if (data.format !== undefined) backendData.format = data.format || undefined;

    const response = await apiClient.put<ApiResponse<Book>>(`${BOOKS_PREFIX}/${id}`, backendData);
    return transformBook(response.data);
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
    return transformBook(response.data);
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
      `/api/v1/ratings/book/${bookId}`,
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
      `/api/v1/ratings`,
      { ...data, book_id: bookId }
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
      `/api/v1/ratings/${ratingId}`,
      data
    );
    return response.data;
  },

  // Delete a rating
  deleteRating: async (bookId: string, ratingId: string): Promise<void> => {
    await apiClient.delete(`/api/v1/ratings/${ratingId}`);
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

  // Export books to CSV (with authentication)
  export: async (params?: BookSearchParams): Promise<Blob> => {
    return apiClient.download(`${BOOKS_PREFIX}/export`, { params });
  },

  // Get categories
  getCategories: async (): Promise<string[]> => {
    const response = await apiClient.get<ApiResponse<string[]>>(`${BOOKS_PREFIX}/categories`);
    return response.data || [];
  },
};

export default booksApi;
