import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, RenderOptions } from '@testing-library/react';
import React, { ReactElement } from 'react';

import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/sonner';

// Create a custom render function that includes providers
function AllTheProviders({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="data-theme"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
      >
        <div className="min-h-screen p-6 bg-background text-foreground">
          {children}
          <Toaster 
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              duration: 4000,
              classNames: {
                toast: 'glass-card border-border',
                title: 'text-foreground',
                description: 'text-muted-foreground',
                success: 'border-success/20 bg-success-light text-success',
                error: 'border-error/20 bg-error-light text-error',
                warning: 'border-warning/20 bg-warning-light text-warning',
                info: 'border-info/20 bg-info-light text-info',
              },
            }}
          />
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Mock data generators for the Library Management System
export const mockUser = (overrides = {}) => ({
  id: 1,
  username: 'librarian1',
  email: 'librarian@library.com',
  role: 'librarian',
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const mockStudent = (overrides = {}) => ({
  id: 1,
  student_id: 'STU2024001',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@school.edu',
  phone: '+1234567890',
  year_of_study: 1,
  department: 'Computer Science',
  enrollment_date: new Date().toISOString().split('T')[0],
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const mockBook = (overrides = {}) => ({
  id: 1,
  book_id: 'BK001',
  isbn: '978-0123456789',
  title: 'Introduction to Algorithms',
  author: 'Thomas H. Cormen',
  publisher: 'MIT Press',
  published_year: 2009,
  genre: 'Computer Science',
  description: 'A comprehensive introduction to algorithms and data structures.',
  cover_image_url: 'https://example.com/cover.jpg',
  total_copies: 5,
  available_copies: 3,
  shelf_location: 'CS-A-001',
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const mockTransaction = (overrides = {}) => ({
  id: 1,
  student_id: 1,
  book_id: 1,
  transaction_type: 'borrow',
  transaction_date: new Date().toISOString(),
  due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
  returned_date: null,
  librarian_id: 1,
  fine_amount: 0.00,
  fine_paid: false,
  notes: '',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const mockReservation = (overrides = {}) => ({
  id: 1,
  student_id: 1,
  book_id: 1,
  reserved_at: new Date().toISOString(),
  expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  status: 'active',
  fulfilled_at: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

// API response wrappers
export const mockApiResponse = function<T>(data: T, success = true) {
  return {
    success,
    data,
    message: success ? 'Operation successful' : 'Operation failed',
    timestamp: new Date().toISOString(),
  };
};

export const mockApiError = (message = 'An error occurred', code = 'UNKNOWN_ERROR') => ({
  success: false,
  error: {
    code,
    message,
    details: {},
  },
  timestamp: new Date().toISOString(),
});

export const mockPaginatedResponse = function<T>(data: T[], page = 1, limit = 20) {
  return {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total: data.length,
      pages: Math.ceil(data.length / limit),
    },
    timestamp: new Date().toISOString(),
  };
};

// Test utilities
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const createMockQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });