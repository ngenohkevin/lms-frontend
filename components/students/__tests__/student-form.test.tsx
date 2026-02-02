import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StudentForm } from "../student-form";

// Mock the API and hooks
vi.mock("@/lib/api", () => ({
  studentsApi: {
    create: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("@/lib/hooks/use-departments", () => ({
  useDepartments: () => ({
    departments: [
      { id: 1, name: "Computer Science", code: "CS", is_active: true },
      { id: 2, name: "Engineering", code: "ENG", is_active: true },
      { id: 3, name: "Business", code: "BUS", is_active: true },
    ],
    isLoading: false,
    error: null,
  }),
}));

vi.mock("@/lib/hooks/use-academic-years", () => ({
  useAcademicYears: () => ({
    academicYears: [
      { id: 1, name: "Year 1", level: 1, is_active: true },
      { id: 2, name: "Year 2", level: 2, is_active: true },
      { id: 3, name: "Year 3", level: 3, is_active: true },
      { id: 4, name: "Year 4", level: 4, is_active: true },
    ],
    isLoading: false,
    error: null,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("StudentForm", () => {
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders first name and last name fields", () => {
    render(
      <StudentForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
    );

    // Check for labels containing the text
    expect(screen.getByText(/first name/i)).toBeInTheDocument();
    expect(screen.getByText(/last name/i)).toBeInTheDocument();
  });

  it("renders student ID field", () => {
    render(
      <StudentForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
    );

    expect(screen.getByText(/student id/i)).toBeInTheDocument();
  });

  it("renders email field with optional label", () => {
    render(
      <StudentForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
    );

    // Email label should indicate it's optional
    expect(screen.getByText(/email.*optional/i)).toBeInTheDocument();
  });

  it("renders department and year of study sections", () => {
    render(
      <StudentForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
    );

    // Just check that the form has rendered without errors and has the expected fields
    // The dropdowns might have multiple elements matching, so we use getAllByText
    const departmentLabels = screen.getAllByText(/department/i);
    expect(departmentLabels.length).toBeGreaterThan(0);

    const yearLabels = screen.getAllByText(/year/i);
    expect(yearLabels.length).toBeGreaterThan(0);
  });

  it("shows cancel button when onCancel is provided", () => {
    render(
      <StudentForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
    );

    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("calls onCancel when cancel button is clicked", async () => {
    render(
      <StudentForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
    );

    const user = userEvent.setup();
    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it("renders enrollment date field", () => {
    render(
      <StudentForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
    );

    expect(screen.getByText(/enrollment date/i)).toBeInTheDocument();
  });

  it("renders max books field", () => {
    render(
      <StudentForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
    );

    expect(screen.getByText(/max books/i)).toBeInTheDocument();
  });

  it("shows password field for new students", () => {
    render(
      <StudentForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
    );

    expect(screen.getByText(/password/i)).toBeInTheDocument();
  });

  it("shows 'Update Student' button when editing", () => {
    const existingStudent = {
      id: "1",
      student_id: "STU001",
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@example.com",
      status: "active" as const,
      is_active: true,
      max_books: 5,
      current_books: 0,
      year_of_study: 2,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };

    render(
      <StudentForm
        student={existingStudent}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByRole("button", { name: /update student/i })).toBeInTheDocument();
  });

  it("shows 'Create Student' button for new students", () => {
    render(
      <StudentForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
    );

    expect(screen.getByRole("button", { name: /create student/i })).toBeInTheDocument();
  });
});
