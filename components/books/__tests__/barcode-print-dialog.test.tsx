import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BarcodePrintDialog } from "../barcode-print-dialog";
import type { BookCopy } from "@/lib/types/book";

// Mock jsbarcode
vi.mock("jsbarcode", () => ({
  default: vi.fn(),
}));

// Mock the API
vi.mock("@/lib/api/book-copies", () => ({
  bookCopiesApi: {
    markBarcodePrinted: vi.fn().mockResolvedValue([]),
  },
}));

const mockCopies: BookCopy[] = [
  {
    id: 1,
    book_id: 1,
    barcode: "BC001",
    condition: "good",
    status: "available",
    barcode_printed_at: undefined,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    book_id: 1,
    barcode: "BC002",
    condition: "excellent",
    status: "available",
    barcode_printed_at: undefined,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

describe("BarcodePrintDialog", () => {
  const onOpenChange = vi.fn();
  const onPrinted = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with correct copy count", () => {
    render(
      <BarcodePrintDialog
        open={true}
        onOpenChange={onOpenChange}
        copies={mockCopies}
        bookTitle="Test Book"
        onPrinted={onPrinted}
      />
    );

    expect(screen.getByText(/2 labels ready to print/)).toBeInTheDocument();
    expect(screen.getByText(/Print 2 Labels/)).toBeInTheDocument();
  });

  it("shows singular label text for single copy", () => {
    render(
      <BarcodePrintDialog
        open={true}
        onOpenChange={onOpenChange}
        copies={[mockCopies[0]]}
        bookTitle="Test Book"
        onPrinted={onPrinted}
      />
    );

    expect(screen.getByText(/1 label ready to print/)).toBeInTheDocument();
    expect(screen.getByText(/Print 1 Label/)).toBeInTheDocument();
  });

  it("cancel closes dialog", async () => {
    const user = userEvent.setup();
    render(
      <BarcodePrintDialog
        open={true}
        onOpenChange={onOpenChange}
        copies={mockCopies}
        bookTitle="Test Book"
        onPrinted={onPrinted}
      />
    );

    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    await user.click(cancelButton);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("print button is disabled when no copies", () => {
    render(
      <BarcodePrintDialog
        open={true}
        onOpenChange={onOpenChange}
        copies={[]}
        bookTitle="Test Book"
        onPrinted={onPrinted}
      />
    );

    const printButton = screen.getByRole("button", { name: /Print 0 Labels/ });
    expect(printButton).toBeDisabled();
  });
});
