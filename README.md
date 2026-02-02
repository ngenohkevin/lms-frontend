# LMS Frontend

A comprehensive Library Management System frontend built with Next.js 15, TypeScript, Tailwind CSS, and shadcn/ui.

## Features

- **Dashboard** - Metrics, charts, and quick actions
- **Book Management** - Catalog, search, filters, CRUD operations
- **Student Management** - Registration, borrowing history, fines
- **Transactions** - Borrow, return, renew books
- **Reservations** - Queue management for unavailable books
- **Reports** - Analytics, borrowing trends, inventory reports
- **Notifications** - Real-time alerts and reminders

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui v4
- SWR for data fetching
- react-hook-form + zod for forms
- Recharts for visualizations

## Getting Started

```bash
npm install
npm run dev
```

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Reservation System

The reservation system allows students to reserve books that are currently unavailable.

### Reservation Status Flow

```
active → ready → fulfilled
   ↓        ↓
cancelled/expired
```

1. **Active** - Student is in queue waiting for the book
2. **Ready** - Book is available, student has been notified
3. **Fulfilled** - Student has picked up the book
4. **Cancelled/Expired** - Reservation was cancelled or expired

### Features

- Queue position tracking for pending reservations
- Ready-for-pickup banner notification
- Automatic status transition when books are returned
- Cancel/fulfill actions for librarians

## Transaction Search

The transaction system includes comprehensive search and filtering:

- **Text Search** - Search by book title, student name, or barcode
- **Status Filter** - Filter by active, overdue, or returned
- **Type Filter** - Filter by borrow, return, or renew
- **Date Range** - Filter by transaction date range
- **Sorting** - Sort by date, due date, student, or book

## Testing

Run all tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm test -- --watch
```

Run specific test file:

```bash
npm test -- transaction-search.test.tsx
```

### Test Structure

- `components/**/__tests__/` - Component tests
- `app/**/__tests__/` - Page tests
- `tests/mocks/handlers.ts` - MSW API mock handlers
- `tests/mocks/server.ts` - MSW server setup

## API Documentation

See [docs/RESERVATION_TRANSACTION_API.md](docs/RESERVATION_TRANSACTION_API.md) for detailed API documentation.

## Deployment

The app includes a Dockerfile for containerized deployment via Dokploy.

