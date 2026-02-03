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

// Backend reservation row (flat structure from database)
interface BackendReservationRow {
  id: number;
  student_id: number;
  book_id: number;
  status: string;
  queue_position?: number;
  reserved_at: string;
  expires_at: string;
  fulfilled_at?: string;
  created_at: string;
  updated_at: string;
  // Flat fields for student info
  student_name?: string;
  student_id_code?: string;
  // Flat fields for book info
  book_title?: string;
  book_author?: string;
  book_id_code?: string;
}

// Backend paginated response structure
interface BackendPaginatedReservations {
  reservations: BackendReservationRow[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Transform backend reservation to frontend format
function transformReservation(r: BackendReservationRow): Reservation {
  return {
    id: String(r.id),
    book_id: String(r.book_id),
    student_id: String(r.student_id),
    status: r.status as Reservation["status"],
    queue_position: r.queue_position || 0,
    reserved_at: r.reserved_at,
    expires_at: r.expires_at,
    fulfilled_at: r.fulfilled_at,
    notified_at: r.fulfilled_at, // Backend uses fulfilled_at as notified_at for 'ready' status
    created_at: r.created_at,
    updated_at: r.updated_at,
    // Transform flat fields to nested objects
    book: r.book_title ? {
      id: String(r.book_id),
      title: r.book_title,
      author: r.book_author || "",
      isbn: r.book_id_code || "",
      available_copies: 0, // Not available from this endpoint
    } : undefined,
    student: r.student_name ? {
      id: String(r.student_id),
      student_id: r.student_id_code || "",
      name: r.student_name,
      email: "", // Not available from this endpoint
    } : undefined,
  };
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
    // Transform frontend params to backend params (offset-based)
    const backendParams: Record<string, string | number | undefined> = {
      limit: params?.per_page || 20,
      offset: params?.page ? (params.page - 1) * (params?.per_page || 20) : 0,
      status: params?.status,
      student_id: params?.student_id,
      book_id: params?.book_id,
    };

    // Remove undefined values
    Object.keys(backendParams).forEach(key => {
      if (backendParams[key] === undefined) {
        delete backendParams[key];
      }
    });

    const response = await apiClient.get<ApiResponse<BackendPaginatedReservations>>(RESERVATIONS_PREFIX, {
      params: backendParams,
    });

    // Transform backend reservations to frontend format
    const reservations = (response.data?.reservations || []).map(transformReservation);

    // Transform pagination
    const pagination = response.data ? {
      page: response.data.page || 1,
      per_page: response.data.limit || 20,
      total: response.data.total || 0,
      total_pages: response.data.total_pages || 1,
      has_next: (response.data.page || 1) < (response.data.total_pages || 1),
      has_prev: (response.data.page || 1) > 1,
    } : undefined;

    return {
      data: reservations,
      pagination,
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
