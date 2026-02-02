import apiClient from "./client";
import type {
  Reservation,
  CreateReservationRequest,
  ReservationSearchParams,
  PaginatedResponse,
} from "@/lib/types";

const RESERVATIONS_PREFIX = "/api/v1/reservations";

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
interface BackendPaginatedReservations {
  reservations: Reservation[];
  pagination: BackendPagination;
}

// Transform backend pagination to frontend format
function transformPagination(bp?: BackendPagination): PaginatedResponse<Reservation>["pagination"] | undefined {
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

export const reservationsApi = {
  // List all reservations with pagination
  list: async (
    params?: ReservationSearchParams
  ): Promise<PaginatedResponse<Reservation>> => {
    const response = await apiClient.get<ApiResponse<BackendPaginatedReservations>>(RESERVATIONS_PREFIX, {
      params,
    });
    return {
      data: response.data?.reservations || [],
      pagination: transformPagination(response.data?.pagination),
    };
  },

  // Get single reservation by ID
  get: async (id: string): Promise<Reservation> => {
    const response = await apiClient.get<ApiResponse<Reservation>>(`${RESERVATIONS_PREFIX}/${id}`);
    return response.data;
  },

  // Create a new reservation
  create: async (data: CreateReservationRequest): Promise<Reservation> => {
    const response = await apiClient.post<ApiResponse<Reservation>>(RESERVATIONS_PREFIX, data);
    return response.data;
  },

  // Cancel a reservation
  cancel: async (id: string): Promise<Reservation> => {
    const response = await apiClient.post<ApiResponse<Reservation>>(`${RESERVATIONS_PREFIX}/${id}/cancel`);
    return response.data;
  },

  // Fulfill a reservation (convert to borrow)
  fulfill: async (id: string): Promise<Reservation> => {
    const response = await apiClient.post<ApiResponse<Reservation>>(`${RESERVATIONS_PREFIX}/${id}/fulfill`);
    return response.data;
  },

  // Get reservations for a book
  getByBook: async (
    bookId: string,
    params?: { status?: string }
  ): Promise<Reservation[]> => {
    const response = await apiClient.get<ApiResponse<Reservation[]>>(
      `${RESERVATIONS_PREFIX}/book/${bookId}`,
      { params }
    );
    return response.data || [];
  },

  // Get reservations for a student
  getByStudent: async (
    studentId: string,
    params?: { status?: string }
  ): Promise<Reservation[]> => {
    const response = await apiClient.get<ApiResponse<Reservation[]>>(
      `${RESERVATIONS_PREFIX}/student/${studentId}`,
      { params }
    );
    return response.data || [];
  },

  // Get queue position
  getQueuePosition: async (
    bookId: string,
    studentId: string
  ): Promise<{ position: number; total_in_queue: number; has_reserved: boolean }> => {
    const response = await apiClient.get<ApiResponse<{ position: number; total_in_queue: number; has_reserved: boolean }>>(
      `${RESERVATIONS_PREFIX}/queue-position`,
      { params: { book_id: bookId, student_id: studentId } }
    );
    return response.data || { position: 0, total_in_queue: 0, has_reserved: false };
  },

  // Mark reservation as ready (book is available for pickup)
  markReady: async (id: string): Promise<Reservation> => {
    const response = await apiClient.post<ApiResponse<Reservation>>(`${RESERVATIONS_PREFIX}/${id}/ready`);
    return response.data;
  },
};

export default reservationsApi;
