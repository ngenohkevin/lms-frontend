import apiClient from "./client";
import type {
  Reservation,
  CreateReservationRequest,
  ReservationSearchParams,
  PaginatedResponse,
} from "@/lib/types";

const RESERVATIONS_PREFIX = "/api/v1/reservations";

export const reservationsApi = {
  // List all reservations with pagination
  list: async (
    params?: ReservationSearchParams
  ): Promise<PaginatedResponse<Reservation>> => {
    return apiClient.get<PaginatedResponse<Reservation>>(RESERVATIONS_PREFIX, {
      params,
    });
  },

  // Get single reservation by ID
  get: async (id: string): Promise<Reservation> => {
    return apiClient.get<Reservation>(`${RESERVATIONS_PREFIX}/${id}`);
  },

  // Create a new reservation
  create: async (data: CreateReservationRequest): Promise<Reservation> => {
    return apiClient.post<Reservation>(RESERVATIONS_PREFIX, data);
  },

  // Cancel a reservation
  cancel: async (id: string): Promise<Reservation> => {
    return apiClient.post<Reservation>(`${RESERVATIONS_PREFIX}/${id}/cancel`);
  },

  // Fulfill a reservation (convert to borrow)
  fulfill: async (id: string): Promise<Reservation> => {
    return apiClient.post<Reservation>(`${RESERVATIONS_PREFIX}/${id}/fulfill`);
  },

  // Get reservations for a book
  getByBook: async (
    bookId: string,
    params?: { status?: string }
  ): Promise<Reservation[]> => {
    return apiClient.get<Reservation[]>(
      `${RESERVATIONS_PREFIX}/book/${bookId}`,
      { params }
    );
  },

  // Get reservations for a student
  getByStudent: async (
    studentId: string,
    params?: { status?: string }
  ): Promise<Reservation[]> => {
    return apiClient.get<Reservation[]>(
      `${RESERVATIONS_PREFIX}/student/${studentId}`,
      { params }
    );
  },

  // Get queue position
  getQueuePosition: async (
    bookId: string,
    studentId: string
  ): Promise<{ position: number }> => {
    return apiClient.get<{ position: number }>(
      `${RESERVATIONS_PREFIX}/queue-position`,
      { params: { book_id: bookId, student_id: studentId } }
    );
  },
};

export default reservationsApi;
