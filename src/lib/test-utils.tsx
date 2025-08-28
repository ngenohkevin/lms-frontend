import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/providers/theme-provider';

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  // Create a new QueryClient for each test to ensure isolation
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Turn off retries for testing
        retry: false,
        // Turn off cache time for testing
        gcTime: 0,
      },
    },
    logger: {
      log: () => {},
      warn: () => {},
      error: process.env.NODE_ENV === 'test' ? () => {} : console.error,
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
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Custom testing utilities
export const createTestQueryClient = () => 
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
    logger: {
      log: () => {},
      warn: () => {},
      error: () => {},
    },
  });

// Mock data generators
export const mockBook = (overrides = {}) => ({
  id: 1,
  book_id: 'BK001',
  title: 'Test Book',
  author: 'Test Author',
  isbn: '9781234567890',
  publisher: 'Test Publisher',
  published_year: 2024,
  genre: 'Fiction',
  description: 'A test book description',
  total_copies: 5,
  available_copies: 3,
  cover_image_url: null,
  shelf_location: 'A1',
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const mockStudent = (overrides = {}) => ({
  id: 1,
  student_id: 'STU001',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  year_of_study: 1,
  department: 'Computer Science',
  enrollment_date: new Date().toISOString(),
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const mockTransaction = (overrides = {}) => ({
  id: 1,
  student_id: 1,
  book_id: 1,
  transaction_type: 'borrow' as const,
  transaction_date: new Date().toISOString(),
  due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  returned_date: null,
  fine_amount: 0,
  fine_paid: false,
  notes: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const mockUser = (overrides = {}) => ({
  id: 1,
  username: 'librarian1',
  email: 'librarian@example.com',
  role: 'librarian' as const,
  is_active: true,
  last_login: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

// API response wrappers
export const mockApiResponse = <T>(data: T, success = true) => ({
  success,
  data,
  message: success ? 'Operation successful' : 'Operation failed',
  timestamp: new Date().toISOString(),
});

export const mockApiError = (message = 'An error occurred', code = 'UNKNOWN_ERROR') => ({
  success: false,
  error: {
    code,
    message,
    details: {},
  },
  timestamp: new Date().toISOString(),
});

export const mockPaginatedResponse = <T>(items: T[], page = 1, limit = 20) => ({
  success: true,
  data: items,
  pagination: {
    page,
    limit,
    total: items.length,
    pages: Math.ceil(items.length / limit),
  },
  message: 'Data retrieved successfully',
  timestamp: new Date().toISOString(),
});

// Custom matchers for common assertions
export const expectToBeLoading = (element: HTMLElement) => {
  expect(element).toHaveAttribute('aria-busy', 'true');
};

export const expectToBeDisabled = (element: HTMLElement) => {
  expect(element).toBeDisabled();
};

export const expectToHaveErrorMessage = (container: HTMLElement, message: string) => {
  expect(container).toHaveTextContent(message);
};

// Wait utilities
export const waitForLoadingToFinish = () => 
  new Promise(resolve => setTimeout(resolve, 0));

// Mock localStorage
export const mockLocalStorage = () => {
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value.toString();
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
  })();

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  });

  return localStorageMock;
};

// Mock sessionStorage
export const mockSessionStorage = () => {
  const sessionStorageMock = (() => {
    let store: Record<string, string> = {};
    
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value.toString();
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
  })();

  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
  });

  return sessionStorageMock;
};