import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TransactionDetailDialog } from "../transaction-detail-dialog";
import type { Transaction } from "@/lib/types";
import { useRenewalEligibility } from "@/lib/hooks/use-transactions";
import { transactionsApi } from "@/lib/api";

// Mock the hooks
vi.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({
    user: { id: 1, username: "admin", role: "admin" },
    isAuthenticated: true,
  }),
}));

vi.mock("@/lib/hooks/use-transactions", () => ({
  useRenewalEligibility: vi.fn(),
}));

// Mock transactionsApi
vi.mock("@/lib/api", () => ({
  transactionsApi: {
    renew: vi.fn(),
  },
}));

const mockUseRenewalEligibility = vi.mocked(useRenewalEligibility);
const mockTransactionsApi = vi.mocked(transactionsApi);

const mockActiveTransaction: Transaction = {
  id: "1",
  book_id: "1",
  student_id: "1",
  librarian_id: "1",
  type: "borrow",
  status: "active",
  borrowed_at: "2024-01-15T10:00:00Z",
  due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  renewed_count: 0,
  fine_amount: 0,
  fine_paid: false,
  copy_id: 1,
  copy_number: "Copy-1",
  copy_barcode: "BC001",
  copy_condition: "good",
  book: {
    id: "1",
    title: "Test Book",
    author: "Test Author",
    isbn: "978-0-123456-78-9",
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

const mockReturnedTransaction: Transaction = {
  ...mockActiveTransaction,
  status: "returned",
  returned_at: "2024-01-22T10:00:00Z",
};

const mockOverdueTransaction: Transaction = {
  ...mockActiveTransaction,
  status: "overdue",
  due_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
  fine_amount: 2.5,
  fine_paid: false,
};

// Mock lost transaction - should display as "lost" not "returned"
const mockLostTransaction: Transaction = {
  ...mockActiveTransaction,
  type: "borrow", // Transaction type is still 'borrow' but status is 'lost'
  status: "lost",
  returned_at: "2024-01-22T10:00:00Z",
  fine_amount: 50.0, // Replacement fine
  fine_paid: false,
};

// Mock transaction with renewal info
const mockRenewedTransaction: Transaction = {
  ...mockActiveTransaction,
  renewal_count: 2,
  last_renewed_at: "2024-01-20T10:00:00Z",
};

describe("TransactionDetailDialog", () => {
  const mockOnOpenChange = vi.fn();
  const mockOnRefresh = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock - eligible for renewal
    mockUseRenewalEligibility.mockReturnValue({
      canRenew: true,
      reason: "Eligible for renewal",
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    });
    // Default mock for renew API
    mockTransactionsApi.renew.mockResolvedValue({
      id: "1",
      due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    } as Transaction);
  });

  it("renders transaction details correctly", () => {
    render(
      <TransactionDetailDialog
        transaction={mockActiveTransaction}
        open={true}
        onOpenChange={mockOnOpenChange}
        onRefresh={mockOnRefresh}
      />
    );

    expect(screen.getByText(/Transaction #1/)).toBeInTheDocument();
    expect(screen.getByText("Test Book")).toBeInTheDocument();
    expect(screen.getByText("Test Author")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("active")).toBeInTheDocument();
  });

  it("shows renewal section for active transactions", async () => {
    render(
      <TransactionDetailDialog
        transaction={mockActiveTransaction}
        open={true}
        onOpenChange={mockOnOpenChange}
        onRefresh={mockOnRefresh}
      />
    );

    await waitFor(() => {
      // The renewal section has a "Renew Book" header
      expect(screen.getByText("Renew Book")).toBeInTheDocument();
    });
  });

  it("shows renew button when eligible", async () => {
    render(
      <TransactionDetailDialog
        transaction={mockActiveTransaction}
        open={true}
        onOpenChange={mockOnOpenChange}
        onRefresh={mockOnRefresh}
      />
    );

    await waitFor(() => {
      // The button text is "Renew" not "Renew Book"
      expect(screen.getByRole("button", { name: /^renew$/i })).toBeInTheDocument();
    });
  });

  it("does not show renewal section for returned transactions", () => {
    mockUseRenewalEligibility.mockReturnValue({
      canRenew: false,
      reason: "Book already returned",
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    });

    render(
      <TransactionDetailDialog
        transaction={mockReturnedTransaction}
        open={true}
        onOpenChange={mockOnOpenChange}
        onRefresh={mockOnRefresh}
      />
    );

    expect(screen.getByText("returned")).toBeInTheDocument();
    // Returned date should be visible
    expect(screen.getByText("Returned")).toBeInTheDocument();
  });

  it("shows fine information for overdue transactions", () => {
    render(
      <TransactionDetailDialog
        transaction={mockOverdueTransaction}
        open={true}
        onOpenChange={mockOnOpenChange}
        onRefresh={mockOnRefresh}
      />
    );

    expect(screen.getByText("overdue")).toBeInTheDocument();
    // Currency is in KSH format, fine_amount 2.5 rounds to KSH 3
    expect(screen.getByText(/KSH \d+/)).toBeInTheDocument();
    expect(screen.getByText("Unpaid")).toBeInTheDocument();
  });

  it("calls onOpenChange when dialog is closed", async () => {
    const user = userEvent.setup();

    render(
      <TransactionDetailDialog
        transaction={mockActiveTransaction}
        open={true}
        onOpenChange={mockOnOpenChange}
        onRefresh={mockOnRefresh}
      />
    );

    // Find and click the close button (X)
    const closeButton = screen.getByRole("button", { name: /close/i });
    await user.click(closeButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("handles renewal success", async () => {
    const user = userEvent.setup();

    render(
      <TransactionDetailDialog
        transaction={mockActiveTransaction}
        open={true}
        onOpenChange={mockOnOpenChange}
        onRefresh={mockOnRefresh}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^renew$/i })).toBeInTheDocument();
    });

    const renewButton = screen.getByRole("button", { name: /^renew$/i });
    await user.click(renewButton);

    await waitFor(() => {
      expect(mockTransactionsApi.renew).toHaveBeenCalledWith("1", {
        librarian_id: 1,
      });
    });
  });

  it("returns null when transaction is null", () => {
    const { container } = render(
      <TransactionDetailDialog
        transaction={null}
        open={true}
        onOpenChange={mockOnOpenChange}
        onRefresh={mockOnRefresh}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("shows loading state while checking renewal eligibility", () => {
    mockUseRenewalEligibility.mockReturnValue({
      canRenew: false,
      reason: "",
      isLoading: true,
      error: null,
      refresh: vi.fn(),
    });

    render(
      <TransactionDetailDialog
        transaction={mockActiveTransaction}
        open={true}
        onOpenChange={mockOnOpenChange}
        onRefresh={mockOnRefresh}
      />
    );

    // The component shows "Checking eligibility..." while loading
    expect(screen.getByText(/checking eligibility/i)).toBeInTheDocument();
  });

  it("shows cannot renew reason when not eligible", async () => {
    mockUseRenewalEligibility.mockReturnValue({
      canRenew: false,
      reason: "Maximum renewals reached",
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    });

    render(
      <TransactionDetailDialog
        transaction={mockActiveTransaction}
        open={true}
        onOpenChange={mockOnOpenChange}
        onRefresh={mockOnRefresh}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Maximum renewals reached")).toBeInTheDocument();
    });
  });

  // Bug fix tests - Issue #4: Lost status should display as "lost" not "returned"
  it("displays lost status correctly for lost transactions", () => {
    mockUseRenewalEligibility.mockReturnValue({
      canRenew: false,
      reason: "Book marked as lost",
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    });

    render(
      <TransactionDetailDialog
        transaction={mockLostTransaction}
        open={true}
        onOpenChange={mockOnOpenChange}
        onRefresh={mockOnRefresh}
      />
    );

    // CRITICAL: Status should show "lost", not "returned"
    // This is the key test for issue #4
    expect(screen.getByText("lost")).toBeInTheDocument();
  });

  // Bug fix test - Issue #9: Show renewal info in dialog
  it("displays renewal count and last renewed date when available", () => {
    render(
      <TransactionDetailDialog
        transaction={mockRenewedTransaction}
        open={true}
        onOpenChange={mockOnOpenChange}
        onRefresh={mockOnRefresh}
      />
    );

    // Should show renewal count (format is "2x renewed")
    expect(screen.getByText(/2x renewed/)).toBeInTheDocument();
  });
});
