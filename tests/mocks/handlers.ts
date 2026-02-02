import { http, HttpResponse } from "msw";

const API_BASE = "http://localhost:8080/api/v1";

// Mock data
const mockTransaction = {
  id: "1",
  book_id: "1",
  student_id: "1",
  librarian_id: "1",
  type: "borrow",
  status: "active",
  borrowed_at: "2024-01-15T10:00:00Z",
  due_date: "2024-01-29T10:00:00Z",
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

const mockScanResult = {
  copy_id: 1,
  copy_number: "Copy-1",
  barcode: "BC001",
  condition: "good",
  status: "available",
  book_id: 1,
  book_title: "Test Book",
  book_author: "Test Author",
  book_code: "BK001",
  isbn: "978-0-123456-78-9",
  is_borrowed: false,
  can_borrow: true,
};

const mockScanResultBorrowed = {
  ...mockScanResult,
  status: "borrowed",
  is_borrowed: true,
  can_borrow: false,
  current_borrower: {
    transaction_id: 1,
    student_name: "John Doe",
    student_code: "STU001",
    due_date: "2024-01-29T10:00:00Z",
  },
};

const mockRenewalEligibility = {
  can_renew: true,
  reason: "Eligible for renewal",
};

export const handlers = [
  // Transaction endpoints
  http.get(`${API_BASE}/transactions`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        transactions: [mockTransaction],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          total_pages: 1,
        },
      },
    });
  }),

  http.get(`${API_BASE}/transactions/:id`, ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: { ...mockTransaction, id: params.id },
    });
  }),

  http.post(`${API_BASE}/transactions/borrow`, async ({ request }) => {
    const body = (await request.json()) as {
      book_id: string | number;
      student_id: string | number;
      copy_id?: number;
    };
    return HttpResponse.json(
      {
        success: true,
        data: {
          ...mockTransaction,
          id: "new-transaction",
          book_id: String(body.book_id),
          student_id: String(body.student_id),
          copy_id: body.copy_id,
        },
        message: "Book borrowed successfully",
      },
      { status: 201 }
    );
  }),

  http.post(`${API_BASE}/transactions/borrow-by-barcode`, async () => {
    return HttpResponse.json(
      {
        success: true,
        data: mockTransaction,
        message: "Book borrowed successfully",
      },
      { status: 201 }
    );
  }),

  http.post(`${API_BASE}/transactions/return-by-barcode`, async () => {
    return HttpResponse.json({
      success: true,
      data: {
        ...mockTransaction,
        status: "returned",
        returned_at: new Date().toISOString(),
      },
      message: "Book returned successfully",
    });
  }),

  http.post(`${API_BASE}/transactions/:id/return`, async () => {
    return HttpResponse.json({
      success: true,
      data: {
        ...mockTransaction,
        status: "returned",
        returned_at: new Date().toISOString(),
      },
      message: "Book returned successfully",
    });
  }),

  http.get(`${API_BASE}/transactions/:id/can-renew`, () => {
    return HttpResponse.json({
      success: true,
      data: mockRenewalEligibility,
      message: "Renewal eligibility checked successfully",
    });
  }),

  http.post(`${API_BASE}/transactions/:id/renew`, async () => {
    const newDueDate = new Date();
    newDueDate.setDate(newDueDate.getDate() + 14);
    return HttpResponse.json({
      success: true,
      data: {
        ...mockTransaction,
        due_date: newDueDate.toISOString(),
        renewed_count: mockTransaction.renewed_count + 1,
      },
      message: "Book renewed successfully",
    });
  }),

  http.get(`${API_BASE}/transactions/scan`, ({ request }) => {
    const url = new URL(request.url);
    const barcode = url.searchParams.get("barcode");

    if (barcode === "BORROWED") {
      return HttpResponse.json({
        success: true,
        data: mockScanResultBorrowed,
      });
    }

    return HttpResponse.json({
      success: true,
      data: mockScanResult,
    });
  }),

  http.get(`${API_BASE}/transactions/overdue`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        transactions: [
          {
            ...mockTransaction,
            status: "overdue",
            days_overdue: 5,
            calculated_fine: 2.5,
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          total_pages: 1,
        },
      },
    });
  }),

  http.get(`${API_BASE}/fines`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        fines: [
          {
            id: "1",
            transaction_id: "1",
            student_id: "1",
            amount: 2.5,
            reason: "Overdue return",
            paid: false,
            created_at: "2024-01-30T10:00:00Z",
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          total_pages: 1,
        },
      },
    });
  }),

  http.get(`${API_BASE}/fines/statistics`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        statistics: {
          total_fines: 10,
          total_paid: 5,
          total_unpaid: 5,
          total_amount: 25.0,
          paid_amount: 12.5,
          unpaid_amount: 12.5,
        },
        fine_per_day: 0.5,
      },
    });
  }),

  http.post(`${API_BASE}/fines/:id/pay`, async () => {
    return HttpResponse.json({
      success: true,
      data: {
        id: "1",
        transaction_id: "1",
        amount: 2.5,
        paid: true,
        paid_at: new Date().toISOString(),
      },
      message: "Fine paid successfully",
    });
  }),

  http.post(`${API_BASE}/fines/:id/waive`, async () => {
    return HttpResponse.json({
      success: true,
      data: {
        id: "1",
        transaction_id: "1",
        amount: 2.5,
        waived: true,
        waived_at: new Date().toISOString(),
      },
      message: "Fine waived successfully",
    });
  }),

  // Book copies endpoint
  http.get(`${API_BASE}/books/:bookId/copies`, () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: 1,
          book_id: 1,
          copy_number: "Copy-1",
          barcode: "BC001",
          condition: "excellent",
          status: "available",
        },
        {
          id: 2,
          book_id: 1,
          copy_number: "Copy-2",
          barcode: "BC002",
          condition: "good",
          status: "available",
        },
        {
          id: 3,
          book_id: 1,
          copy_number: "Copy-3",
          barcode: "BC003",
          condition: "fair",
          status: "borrowed",
        },
      ],
    });
  }),

  // Students search endpoint
  http.get(`${API_BASE}/students/search`, () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: "1",
          student_id: "STU001",
          name: "John Doe",
          email: "john.doe@test.com",
          status: "active",
          current_books: 2,
          max_books: 5,
          unpaid_fines: 0,
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        total_pages: 1,
      },
    });
  }),

  // Reservation endpoints
  http.get(`${API_BASE}/reservations`, ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");

    const mockReservations = [
      {
        id: "1",
        book_id: "1",
        student_id: "1",
        status: "pending",
        queue_position: 1,
        reserved_at: "2024-01-15T10:00:00Z",
        expires_at: "2024-01-22T10:00:00Z",
        book: {
          id: "1",
          title: "Test Book",
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
      },
      {
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
          title: "Ready Book",
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
      },
    ];

    const filtered = status
      ? mockReservations.filter(r => r.status === status)
      : mockReservations;

    return HttpResponse.json({
      success: true,
      data: {
        reservations: filtered,
        pagination: {
          page: 1,
          limit: 20,
          total: filtered.length,
          total_pages: 1,
        },
      },
    });
  }),

  http.get(`${API_BASE}/reservations/queue-position`, ({ request }) => {
    const url = new URL(request.url);
    const bookId = url.searchParams.get("book_id");
    const studentId = url.searchParams.get("student_id");

    return HttpResponse.json({
      success: true,
      data: {
        position: bookId && studentId ? 2 : 0,
        total_in_queue: 5,
        has_reserved: !!(bookId && studentId),
      },
    });
  }),

  http.post(`${API_BASE}/reservations`, async ({ request }) => {
    const body = (await request.json()) as { book_id: string; student_id?: string };
    return HttpResponse.json(
      {
        success: true,
        data: {
          id: "new-reservation",
          book_id: body.book_id,
          student_id: body.student_id || "1",
          status: "pending",
          queue_position: 3,
          reserved_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        message: "Book reserved successfully",
      },
      { status: 201 }
    );
  }),

  http.post(`${API_BASE}/reservations/:id/cancel`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        id: "1",
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
      },
      message: "Reservation cancelled",
    });
  }),

  http.post(`${API_BASE}/reservations/:id/fulfill`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        id: "1",
        status: "fulfilled",
        fulfilled_at: new Date().toISOString(),
      },
      message: "Reservation fulfilled",
    });
  }),

  http.post(`${API_BASE}/reservations/:id/ready`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        id: "1",
        status: "ready",
        notified_at: new Date().toISOString(),
      },
      message: "Reservation marked as ready",
    });
  }),

  http.get(`${API_BASE}/reservations/book/:bookId`, () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: "1",
          book_id: "1",
          student_id: "1",
          status: "pending",
          queue_position: 1,
          reserved_at: "2024-01-15T10:00:00Z",
          student: {
            id: "1",
            student_id: "STU001",
            name: "John Doe",
            email: "john.doe@test.com",
          },
        },
      ],
    });
  }),

  http.get(`${API_BASE}/reservations/student/:studentId`, () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: "1",
          book_id: "1",
          student_id: "1",
          status: "pending",
          queue_position: 1,
          reserved_at: "2024-01-15T10:00:00Z",
          book: {
            id: "1",
            title: "Test Book",
            author: "Test Author",
          },
        },
      ],
    });
  }),
];
