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

## Deployment

The app includes a Dockerfile for containerized deployment via Dokploy.

