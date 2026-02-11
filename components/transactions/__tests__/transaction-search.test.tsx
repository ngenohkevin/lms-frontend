import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TransactionSearch } from "../transaction-search";
import type { TransactionSearchParams } from "@/lib/types";

describe("TransactionSearch", () => {
  const mockOnSearch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders search input correctly", () => {
    render(<TransactionSearch onSearch={mockOnSearch} />);

    expect(
      screen.getByPlaceholderText(/search books, students, barcodes/i)
    ).toBeInTheDocument();
  });

  it("renders status filter buttons", () => {
    render(<TransactionSearch onSearch={mockOnSearch} />);

    expect(screen.getByRole("button", { name: /all/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /active/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /overdue/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /returned/i })).toBeInTheDocument();
  });

  it("renders filters button", () => {
    render(<TransactionSearch onSearch={mockOnSearch} />);

    expect(
      screen.getByRole("button", { name: /filters/i })
    ).toBeInTheDocument();
  });

  it("triggers search on form submit", async () => {
    const user = userEvent.setup();
    render(<TransactionSearch onSearch={mockOnSearch} />);

    const searchInput = screen.getByPlaceholderText(/search books, students, barcodes/i);
    await user.type(searchInput, "Test Book{enter}");

    expect(mockOnSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        query: "Test Book",
        page: 1,
      })
    );
  });

  it("triggers search when status filter is clicked", async () => {
    const user = userEvent.setup();
    render(<TransactionSearch onSearch={mockOnSearch} />);

    const activeButton = screen.getByRole("button", { name: /active/i });
    await user.click(activeButton);

    expect(mockOnSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "active",
        page: 1,
      })
    );
  });

  it("opens filters sheet when clicking filters button", async () => {
    const user = userEvent.setup();
    render(<TransactionSearch onSearch={mockOnSearch} />);

    const filtersButton = screen.getByRole("button", { name: /filters/i });
    await user.click(filtersButton);

    await waitFor(() => {
      expect(screen.getByText(/filter transactions/i)).toBeInTheDocument();
    });
  });

  it("shows transaction type filter in sheet", async () => {
    const user = userEvent.setup();
    render(<TransactionSearch onSearch={mockOnSearch} />);

    const filtersButton = screen.getByRole("button", { name: /filters/i });
    await user.click(filtersButton);

    await waitFor(() => {
      expect(screen.getByText(/transaction type/i)).toBeInTheDocument();
    });
  });

  it("shows date range filters in sheet", async () => {
    const user = userEvent.setup();
    render(<TransactionSearch onSearch={mockOnSearch} />);

    const filtersButton = screen.getByRole("button", { name: /filters/i });
    await user.click(filtersButton);

    await waitFor(() => {
      expect(screen.getByText(/date range/i)).toBeInTheDocument();
    });
  });

  it("shows clear all button in sheet", async () => {
    const user = userEvent.setup();
    render(<TransactionSearch onSearch={mockOnSearch} />);

    const filtersButton = screen.getByRole("button", { name: /filters/i });
    await user.click(filtersButton);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /clear all/i })
      ).toBeInTheDocument();
    });
  });

  it("shows apply filters button in sheet", async () => {
    const user = userEvent.setup();
    render(<TransactionSearch onSearch={mockOnSearch} />);

    const filtersButton = screen.getByRole("button", { name: /filters/i });
    await user.click(filtersButton);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /apply filters/i })
      ).toBeInTheDocument();
    });
  });

  it("displays active filters when status is set", async () => {
    const user = userEvent.setup();
    render(<TransactionSearch onSearch={mockOnSearch} />);

    // Click active status
    const activeButton = screen.getByRole("button", { name: /active/i });
    await user.click(activeButton);

    // Should show active filters section
    await waitFor(() => {
      expect(screen.getByText(/active filters:/i)).toBeInTheDocument();
    });
  });

  it("uses initial params when provided", () => {
    const initialParams: TransactionSearchParams = {
      query: "Initial Query",
      status: "overdue",
      page: 1,
      per_page: 20,
    };

    render(
      <TransactionSearch onSearch={mockOnSearch} initialParams={initialParams} />
    );

    const searchInput = screen.getByPlaceholderText(/search books, students, barcodes/i);
    expect(searchInput).toHaveValue("Initial Query");
  });

  it("preserves student_id from initial params", async () => {
    const user = userEvent.setup();
    const initialParams: TransactionSearchParams = {
      student_id: "123",
      page: 1,
      per_page: 20,
    };

    render(
      <TransactionSearch onSearch={mockOnSearch} initialParams={initialParams} />
    );

    const searchButton = screen.getByRole("button", { name: /^search$/i });
    await user.click(searchButton);

    expect(mockOnSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        student_id: "123",
      })
    );
  });

  it("renders sort dropdown", () => {
    render(<TransactionSearch onSearch={mockOnSearch} />);

    // Find the combobox for sorting
    const sortTrigger = screen.getByRole("combobox");
    expect(sortTrigger).toBeInTheDocument();
  });
});
