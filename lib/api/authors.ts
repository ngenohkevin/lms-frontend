import apiClient from "./client";
import type { Author, AuthorWithBooks, AuthorFormData } from "@/lib/types/book";
import type { PaginatedResponse } from "@/lib/types";

const AUTHORS_PREFIX = "/api/v1/authors";
const BOOKS_PREFIX = "/api/v1/books";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface BackendPagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

interface BackendAuthorList {
  authors: Author[];
  pagination: BackendPagination;
}

function transformPagination(bp: BackendPagination) {
  return {
    page: bp.page,
    per_page: bp.limit,
    total: bp.total,
    total_pages: bp.total_pages,
    has_next: bp.page < bp.total_pages,
    has_prev: bp.page > 1,
  };
}

export const authorsApi = {
  /**
   * List all authors with pagination
   */
  async list(
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Author>> {
    const response = await apiClient.get<ApiResponse<BackendAuthorList>>(
      AUTHORS_PREFIX,
      { params: { page, limit } }
    );
    const data = response.data;
    return {
      data: data.authors || [],
      pagination: transformPagination(data.pagination),
    };
  },

  /**
   * Search authors by name
   */
  async search(
    query: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Author>> {
    const response = await apiClient.get<ApiResponse<BackendAuthorList>>(
      `${AUTHORS_PREFIX}`,
      { params: { query, page, limit } }
    );
    const data = response.data;
    return {
      data: data.authors || [],
      pagination: transformPagination(data.pagination),
    };
  },

  /**
   * Get a single author
   */
  async get(id: number): Promise<Author> {
    const response = await apiClient.get<ApiResponse<Author>>(
      `${AUTHORS_PREFIX}/${id}`
    );
    return response.data;
  },

  /**
   * Get author with their books
   */
  async getWithBooks(id: number): Promise<AuthorWithBooks> {
    const response = await apiClient.get<ApiResponse<AuthorWithBooks>>(
      `${AUTHORS_PREFIX}/${id}/books`
    );
    return response.data;
  },

  /**
   * Create a new author
   */
  async create(data: AuthorFormData): Promise<Author> {
    const response = await apiClient.post<ApiResponse<Author>>(
      AUTHORS_PREFIX,
      data
    );
    return response.data;
  },

  /**
   * Update an author
   */
  async update(id: number, data: Partial<AuthorFormData>): Promise<Author> {
    const response = await apiClient.put<ApiResponse<Author>>(
      `${AUTHORS_PREFIX}/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Delete an author
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`${AUTHORS_PREFIX}/${id}`);
  },

  /**
   * List authors for a specific book
   */
  async listBookAuthors(bookId: number): Promise<Author[]> {
    const response = await apiClient.get<ApiResponse<Author[]>>(
      `${BOOKS_PREFIX}/${bookId}/authors`
    );
    return response.data || [];
  },

  /**
   * Add an author to a book
   */
  async addBookAuthor(
    bookId: number,
    authorId: number,
    order: number = 1
  ): Promise<void> {
    await apiClient.post(`${BOOKS_PREFIX}/${bookId}/authors`, {
      author_id: authorId,
      order,
    });
  },

  /**
   * Remove an author from a book
   */
  async removeBookAuthor(bookId: number, authorId: number): Promise<void> {
    await apiClient.delete(`${BOOKS_PREFIX}/${bookId}/authors/${authorId}`);
  },
};

export default authorsApi;
