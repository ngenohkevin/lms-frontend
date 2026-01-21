export interface Reservation {
  id: string;
  book_id: string;
  student_id: string;
  status: ReservationStatus;
  queue_position: number;
  reserved_at: string;
  notified_at?: string;
  expires_at?: string;
  fulfilled_at?: string;
  cancelled_at?: string;
  book?: {
    id: string;
    title: string;
    author: string;
    isbn: string;
    cover_url?: string;
    available_copies: number;
  };
  student?: {
    id: string;
    student_id: string;
    name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
}

export type ReservationStatus =
  | "pending"
  | "ready"
  | "fulfilled"
  | "expired"
  | "cancelled";

export interface CreateReservationRequest {
  book_id: string;
  student_id?: string; // For librarians reserving on behalf of students
}

export interface ReservationSearchParams {
  student_id?: string;
  book_id?: string;
  status?: ReservationStatus;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export const RESERVATION_STATUSES: ReservationStatus[] = [
  "pending",
  "ready",
  "fulfilled",
  "expired",
  "cancelled",
];
