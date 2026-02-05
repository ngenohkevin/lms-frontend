import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Reservation } from "@/lib/types";

// Mock data
const mockPendingReservation: Reservation = {
  id: "1",
  book_id: "1",
  student_id: "1",
  status: "pending",
  queue_position: 1,
  reserved_at: "2024-01-15T10:00:00Z",
  expires_at: "2024-01-22T10:00:00Z",
  book: {
    id: "1",
    title: "Pending Book",
    author: "Test Author",
    isbn: "978-0-123456-78-9",
    available_copies: 0,
  },
  student: {
    id: "1",
    student_id: "STU001",
    name: "John Doe",
    email: "john.doe@test.com",
  },
  created_at: "2024-01-15T10:00:00Z",
  updated_at: "2024-01-15T10:00:00Z",
};

const mockReadyReservation: Reservation = {
  id: "2",
  book_id: "2",
  student_id: "1",
  status: "ready",
  queue_position: 1,
  reserved_at: "2024-01-14T10:00:00Z",
  notified_at: "2024-01-20T10:00:00Z",
  expires_at: "2024-01-23T10:00:00Z",
  book: {
    id: "2",
    title: "Ready for Pickup Book",
    author: "Another Author",
    isbn: "978-0-987654-32-1",
    available_copies: 1,
  },
  student: {
    id: "1",
    student_id: "STU001",
    name: "John Doe",
    email: "john.doe@test.com",
  },
  created_at: "2024-01-14T10:00:00Z",
  updated_at: "2024-01-20T10:00:00Z",
};

// Mock modules before importing component
vi.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({
    user: { id: 1, username: "admin", role: "admin" },
    isStudent: false,
    isAuthenticated: true,
  }),
}));

vi.mock("@/providers/permission-provider", () => ({
  usePermissions: () => ({
    hasPermission: () => true,
  }),
}));

vi.mock("@/lib/api", () => ({
  reservationsApi: {
    list: vi.fn(),
    cancel: vi.fn(),
    fulfill: vi.fn(),
  },
}));

// Variable to control mock data
let mockReservations: Reservation[] = [];

vi.mock("swr", () => ({
  default: () => ({
    data: {
      data: mockReservations,
      pagination: { page: 1, per_page: 20, total: mockReservations.length, total_pages: 1 },
    },
    error: undefined,
    isLoading: false,
    mutate: vi.fn(),
  }),
}));

// Import component after mocks are set up
import ReservationsPage from "../page";

describe("ReservationsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReservations = [];
  });

  it("renders page title", () => {
    render(<ReservationsPage />);
    expect(screen.getByText("Reservations")).toBeInTheDocument();
  });

  it("shows ready for pickup banner when there are ready reservations", () => {
    mockReservations = [mockPendingReservation, mockReadyReservation];
    render(<ReservationsPage />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Ready for Pickup!")).toBeInTheDocument();
  });

  it("shows book title in ready banner for single ready reservation", () => {
    mockReservations = [mockReadyReservation];
    render(<ReservationsPage />);

    expect(
      screen.getByText(/ready for pickup book.*is ready for pickup/i)
    ).toBeInTheDocument();
  });

  it("shows count in ready banner for multiple ready reservations", () => {
    const secondReadyReservation: Reservation = {
      ...mockReadyReservation,
      id: "4",
      book_id: "3",
      book: {
        id: "3",
        title: "Another Ready Book",
        author: "Third Author",
        isbn: "978-1-111111-11-1",
        available_copies: 1,
      },
    };

    mockReservations = [mockReadyReservation, secondReadyReservation];
    render(<ReservationsPage />);

    expect(screen.getByText(/2 books are ready for pickup/i)).toBeInTheDocument();
  });

  it("does not show ready banner when no ready reservations", () => {
    mockReservations = [mockPendingReservation];
    render(<ReservationsPage />);

    expect(screen.queryByText(/ready for pickup!/i)).not.toBeInTheDocument();
  });

  it("shows queue position for pending reservations", () => {
    mockReservations = [mockPendingReservation];
    render(<ReservationsPage />);

    expect(screen.getByText("#1")).toBeInTheDocument();
  });

  it("shows pending status badge", () => {
    mockReservations = [mockPendingReservation];
    render(<ReservationsPage />);

    expect(screen.getByText("pending")).toBeInTheDocument();
  });

  it("shows ready status badge", () => {
    mockReservations = [mockReadyReservation];
    render(<ReservationsPage />);

    expect(screen.getByText("ready")).toBeInTheDocument();
  });

  it("shows fulfill button for ready reservations", () => {
    mockReservations = [mockReadyReservation];
    render(<ReservationsPage />);

    expect(screen.getByRole("button", { name: /fulfill/i })).toBeInTheDocument();
  });

  it("shows cancel button for pending reservations", () => {
    mockReservations = [mockPendingReservation];
    render(<ReservationsPage />);

    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("displays book information correctly", () => {
    mockReservations = [mockPendingReservation];
    render(<ReservationsPage />);

    expect(screen.getByText("Pending Book")).toBeInTheDocument();
    expect(screen.getByText("Test Author")).toBeInTheDocument();
  });

  it("displays student information correctly", () => {
    mockReservations = [mockPendingReservation];
    render(<ReservationsPage />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("STU001")).toBeInTheDocument();
  });

  it("shows empty message when no reservations", () => {
    mockReservations = [];
    render(<ReservationsPage />);

    expect(screen.getByText(/no reservations found/i)).toBeInTheDocument();
  });
});
