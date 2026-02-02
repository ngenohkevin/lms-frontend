# Reservation & Transaction API Documentation

This document covers the reservation and transaction endpoints in the LMS API.

## Table of Contents

- [Reservation System](#reservation-system)
  - [Status Flow](#reservation-status-flow)
  - [Endpoints](#reservation-endpoints)
- [Transaction System](#transaction-system)
  - [Search Parameters](#transaction-search-parameters)
  - [Endpoints](#transaction-endpoints)
- [Error Handling](#error-handling)

---

## Reservation System

### Reservation Status Flow

```
┌─────────┐     Book        ┌─────────┐     Student      ┌───────────┐
│ active  │ ──returned────> │  ready  │ ──picks up────> │ fulfilled │
└─────────┘                 └─────────┘                  └───────────┘
    │                           │
    │ expired/cancelled         │ expired/cancelled
    ▼                           ▼
┌───────────────────────────────────────────────────────────────────┐
│                    cancelled / expired                             │
└───────────────────────────────────────────────────────────────────┘
```

**Status Definitions:**
- `active` - Student is waiting in queue for the book
- `ready` - Book is available; student has been notified to pick it up
- `fulfilled` - Student has borrowed the book
- `cancelled` - Reservation was cancelled by student or librarian
- `expired` - Reservation expired before being fulfilled

### Reservation Endpoints

#### List Reservations

```http
GET /api/v1/reservations
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | int | Page number (default: 1) |
| per_page | int | Items per page (default: 20) |
| status | string | Filter by status (active, ready, fulfilled, cancelled, expired) |
| student_id | int | Filter by student ID |
| book_id | int | Filter by book ID |
| query | string | Search by book title or student name |

**Response:**
```json
{
  "success": true,
  "data": {
    "reservations": [
      {
        "id": 1,
        "book_id": 123,
        "student_id": 456,
        "status": "active",
        "queue_position": 2,
        "reserved_at": "2024-01-15T10:00:00Z",
        "expires_at": "2024-01-22T10:00:00Z",
        "notified_at": null,
        "book": {
          "id": 123,
          "title": "Clean Code",
          "author": "Robert C. Martin",
          "isbn": "978-0-13-235088-4"
        },
        "student": {
          "id": 456,
          "student_id": "STU001",
          "name": "John Doe",
          "email": "john@example.com"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "total_pages": 1
    }
  }
}
```

#### Get Single Reservation

```http
GET /api/v1/reservations/:id
```

#### Create Reservation

```http
POST /api/v1/reservations
```

**Request Body:**
```json
{
  "book_id": 123,
  "student_id": 456
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "book_id": 123,
    "student_id": 456,
    "status": "active",
    "queue_position": 3,
    "reserved_at": "2024-01-15T10:00:00Z",
    "expires_at": "2024-01-22T10:00:00Z"
  },
  "message": "Book reserved successfully"
}
```

#### Cancel Reservation

```http
POST /api/v1/reservations/:id/cancel
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "cancelled",
    "cancelled_at": "2024-01-16T10:00:00Z"
  },
  "message": "Reservation cancelled"
}
```

#### Mark Reservation as Ready

```http
POST /api/v1/reservations/:id/ready
```

Marks a reservation as ready for pickup. This is typically called automatically when a book is returned and there's a waiting reservation.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "ready",
    "notified_at": "2024-01-17T10:00:00Z"
  },
  "message": "Reservation marked as ready"
}
```

#### Fulfill Reservation

```http
POST /api/v1/reservations/:id/fulfill
```

Converts a "ready" reservation into an active borrow transaction.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "fulfilled",
    "fulfilled_at": "2024-01-17T14:00:00Z",
    "transaction_id": 789
  },
  "message": "Reservation fulfilled"
}
```

#### Get Queue Position

```http
GET /api/v1/reservations/queue-position?book_id=123&student_id=456
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| book_id | int | Yes | Book ID to check |
| student_id | int | Yes | Student ID to check |

**Response:**
```json
{
  "success": true,
  "data": {
    "position": 2,
    "total_in_queue": 5,
    "has_reserved": true
  }
}
```

#### Get Reservations by Book

```http
GET /api/v1/reservations/book/:bookId
```

#### Get Reservations by Student

```http
GET /api/v1/reservations/student/:studentId
```

---

## Transaction System

### Transaction Search Parameters

The transaction list endpoint supports comprehensive filtering:

| Parameter | Type | Description |
|-----------|------|-------------|
| query | string | Text search (book title, student name, barcode) |
| page | int | Page number (default: 1) |
| per_page | int | Items per page (default: 20) |
| status | string | Filter: active, returned, overdue |
| type | string | Filter: borrow, return, renew |
| student_id | int | Filter by student ID |
| book_id | int | Filter by book ID |
| from_date | string | Start date (ISO 8601) |
| to_date | string | End date (ISO 8601) |
| has_fine | bool | Filter by fine status |
| sort_by | string | Sort field: date, due_date, student, book |
| sort_order | string | Sort order: asc, desc |

### Transaction Endpoints

#### List/Search Transactions

```http
GET /api/v1/transactions
```

**Example with filters:**
```http
GET /api/v1/transactions?query=Harry&status=active&from_date=2024-01-01&sort_by=due_date&sort_order=asc
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": 1,
        "book_id": 123,
        "student_id": 456,
        "librarian_id": 1,
        "type": "borrow",
        "status": "active",
        "borrowed_at": "2024-01-15T10:00:00Z",
        "due_date": "2024-01-29T10:00:00Z",
        "returned_at": null,
        "renewed_count": 0,
        "fine_amount": 0,
        "copy_id": 1,
        "copy_number": "Copy-1",
        "copy_barcode": "BC001",
        "book": {
          "id": 123,
          "title": "Clean Code",
          "author": "Robert C. Martin",
          "isbn": "978-0-13-235088-4"
        },
        "student": {
          "id": 456,
          "student_id": "STU001",
          "name": "John Doe"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "total_pages": 1
    }
  }
}
```

#### Borrow Book

```http
POST /api/v1/transactions/borrow
```

**Request Body:**
```json
{
  "book_id": 123,
  "student_id": 456,
  "copy_id": 1
}
```

#### Borrow by Barcode

```http
POST /api/v1/transactions/borrow-by-barcode
```

**Request Body:**
```json
{
  "barcode": "BC001",
  "student_id": 456
}
```

#### Return Book

```http
POST /api/v1/transactions/:id/return
```

#### Return by Barcode

```http
POST /api/v1/transactions/return-by-barcode
```

**Request Body:**
```json
{
  "barcode": "BC001"
}
```

#### Check Renewal Eligibility

```http
GET /api/v1/transactions/:id/can-renew
```

**Response:**
```json
{
  "success": true,
  "data": {
    "can_renew": true,
    "reason": "Eligible for renewal"
  }
}
```

Possible reasons for `can_renew: false`:
- "Maximum renewals reached"
- "Book has pending reservations"
- "Transaction is overdue"

#### Renew Transaction

```http
POST /api/v1/transactions/:id/renew
```

#### Scan Barcode

```http
GET /api/v1/transactions/scan?barcode=BC001
```

Returns information about a book copy and its current status.

**Response (available):**
```json
{
  "success": true,
  "data": {
    "copy_id": 1,
    "copy_number": "Copy-1",
    "barcode": "BC001",
    "condition": "good",
    "status": "available",
    "book_id": 123,
    "book_title": "Clean Code",
    "book_author": "Robert C. Martin",
    "is_borrowed": false,
    "can_borrow": true
  }
}
```

**Response (borrowed):**
```json
{
  "success": true,
  "data": {
    "copy_id": 1,
    "copy_number": "Copy-1",
    "barcode": "BC001",
    "status": "borrowed",
    "is_borrowed": true,
    "can_borrow": false,
    "current_borrower": {
      "transaction_id": 1,
      "student_name": "John Doe",
      "student_code": "STU001",
      "due_date": "2024-01-29T10:00:00Z"
    }
  }
}
```

#### Get Overdue Transactions

```http
GET /api/v1/transactions/overdue
```

---

## Error Handling

All endpoints return errors in a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Book ID is required"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Invalid request parameters |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Operation conflicts with current state |
| FORBIDDEN | 403 | User lacks permission |
| INTERNAL_ERROR | 500 | Server error |

### Reservation-Specific Errors

| Error Message | Cause |
|---------------|-------|
| "Student already has reservation for this book" | Duplicate reservation attempt |
| "Book is available for borrowing" | Trying to reserve available book |
| "Student has reached reservation limit" | Max reservations exceeded |
| "Reservation is not in ready status" | Trying to fulfill non-ready reservation |

### Transaction-Specific Errors

| Error Message | Cause |
|---------------|-------|
| "Student has unpaid fines" | Cannot borrow with outstanding fines |
| "Student has reached borrowing limit" | Max books exceeded |
| "Book copy is not available" | Copy already borrowed |
| "Transaction is overdue" | Cannot renew overdue transaction |
| "Maximum renewals reached" | No more renewals allowed |
