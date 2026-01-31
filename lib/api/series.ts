import apiClient from "./client";
import type { Series, SeriesWithBooks, SeriesFormData } from "@/lib/types/book";
import type { PaginatedResponse } from "@/lib/types";

const SERIES_PREFIX = "/api/v1/series";

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

interface BackendSeriesList {
  series: Series[];
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

export const seriesApi = {
  /**
   * List all series with pagination
   */
  async list(
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Series>> {
    const response = await apiClient.get<ApiResponse<BackendSeriesList>>(
      SERIES_PREFIX,
      { params: { page, limit } }
    );
    const data = response.data;
    return {
      data: data.series || [],
      pagination: transformPagination(data.pagination),
    };
  },

  /**
   * Search series by name
   */
  async search(
    query: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Series>> {
    const response = await apiClient.get<ApiResponse<BackendSeriesList>>(
      SERIES_PREFIX,
      { params: { query, page, limit } }
    );
    const data = response.data;
    return {
      data: data.series || [],
      pagination: transformPagination(data.pagination),
    };
  },

  /**
   * Get a single series
   */
  async get(id: number): Promise<Series> {
    const response = await apiClient.get<ApiResponse<Series>>(
      `${SERIES_PREFIX}/${id}`
    );
    return response.data;
  },

  /**
   * Get series with its books
   */
  async getWithBooks(id: number): Promise<SeriesWithBooks> {
    const response = await apiClient.get<ApiResponse<SeriesWithBooks>>(
      `${SERIES_PREFIX}/${id}/books`
    );
    return response.data;
  },

  /**
   * Create a new series
   */
  async create(data: SeriesFormData): Promise<Series> {
    const response = await apiClient.post<ApiResponse<Series>>(
      SERIES_PREFIX,
      data
    );
    return response.data;
  },

  /**
   * Update a series
   */
  async update(id: number, data: Partial<SeriesFormData>): Promise<Series> {
    const response = await apiClient.put<ApiResponse<Series>>(
      `${SERIES_PREFIX}/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Delete a series
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`${SERIES_PREFIX}/${id}`);
  },
};

export default seriesApi;
