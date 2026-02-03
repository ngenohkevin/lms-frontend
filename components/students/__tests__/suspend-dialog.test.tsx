import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SuspendDialog } from "../suspend-dialog";
import type { Student } from "@/lib/types";

// Mock the API
const mockSuspend = vi.fn();
vi.mock("@/lib/api", () => ({
  studentsApi: {
    suspend: (...args: unknown[]) => mockSuspend(...args),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("SuspendDialog", () => {
  const mockStudent: Student = {
    id: "1",
    student_id: "STU001",
    first_name: "John",
    last_name: "Doe",
    name: "John Doe",
    email: "john.doe@example.com",
    status: "active",
    max_books: 5,
    current_books: 2,
    total_borrowed: 15,
    total_fines: 10.00,
    unpaid_fines: 5.00,
    year_of_study: 2,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };

  const mockOnOpenChange = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders dialog when open", () => {
    render(
      <SuspendDialog
        student={mockStudent}
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    // Check for the dialog title using heading role
    expect(screen.getByRole("heading", { name: /suspend student/i })).toBeInTheDocument();
  });

  it("displays student name in dialog", () => {
    render(
      <SuspendDialog
        student={mockStudent}
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText(/john doe/i)).toBeInTheDocument();
  });

  it("shows reason textarea", () => {
    render(
      <SuspendDialog
        student={mockStudent}
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText(/reason for suspension/i)).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("submit button is disabled without reason", () => {
    render(
      <SuspendDialog
        student={mockStudent}
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    const submitButton = screen.getByRole("button", { name: /suspend student/i });
    expect(submitButton).toBeDisabled();
  });

  it("submit button is enabled with valid reason", async () => {
    render(
      <SuspendDialog
        student={mockStudent}
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    const user = userEvent.setup();
    const textarea = screen.getByRole("textbox");

    // Type a reason that meets minimum length (10 characters)
    await user.type(textarea, "Violated library rules multiple times");

    const submitButton = screen.getByRole("button", { name: /suspend student/i });
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it("calls API with reason when submitted", async () => {
    mockSuspend.mockResolvedValue({ ...mockStudent, status: "suspended" });

    render(
      <SuspendDialog
        student={mockStudent}
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    const user = userEvent.setup();
    const textarea = screen.getByRole("textbox");

    await user.type(textarea, "Multiple overdue books and unpaid fines");

    const submitButton = screen.getByRole("button", { name: /suspend student/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSuspend).toHaveBeenCalledWith(
        "1",
        "Multiple overdue books and unpaid fines"
      );
    });
  });

  it("calls onSuccess on successful suspension", async () => {
    mockSuspend.mockResolvedValue({
      ...mockStudent,
      status: "suspended",
      suspension_reason: "Multiple overdue books",
    });

    render(
      <SuspendDialog
        student={mockStudent}
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    const user = userEvent.setup();
    const textarea = screen.getByRole("textbox");

    await user.type(textarea, "Multiple overdue books");

    const submitButton = screen.getByRole("button", { name: /suspend student/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it("closes dialog on successful suspension", async () => {
    mockSuspend.mockResolvedValue({ ...mockStudent, status: "suspended" });

    render(
      <SuspendDialog
        student={mockStudent}
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    const user = userEvent.setup();
    const textarea = screen.getByRole("textbox");

    await user.type(textarea, "Violated library rules");

    const submitButton = screen.getByRole("button", { name: /suspend student/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("shows warning message about consequences", () => {
    render(
      <SuspendDialog
        student={mockStudent}
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    // Should show warning about not being able to borrow
    expect(screen.getByText(/cannot borrow books/i)).toBeInTheDocument();
  });

  it("has cancel button that closes dialog", async () => {
    render(
      <SuspendDialog
        student={mockStudent}
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    const user = userEvent.setup();
    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("does not render when open is false", () => {
    render(
      <SuspendDialog
        student={mockStudent}
        open={false}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.queryByText(/suspend student/i)).not.toBeInTheDocument();
  });
});
