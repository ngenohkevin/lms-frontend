// Re-export all configuration modules
export * from './env';

// Configuration constants
export const APP_CONFIG = {
  // Navigation
  SIDEBAR_WIDTH: 280,
  HEADER_HEIGHT: 64,
  
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // Timeouts
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 5000,
  
  // Validation
  MIN_PASSWORD_LENGTH: 8,
  MAX_FILE_NAME_LENGTH: 255,
  
  // UI
  ANIMATION_DURATION: 200,
  MODAL_Z_INDEX: 1000,
} as const;

// Theme configuration
export const THEME_CONFIG = {
  // Breakpoints (matching Tailwind defaults)
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // Color scheme
  colors: {
    primary: 'hsl(var(--primary))',
    secondary: 'hsl(var(--secondary))',
    accent: 'hsl(var(--accent))',
    destructive: 'hsl(var(--destructive))',
    muted: 'hsl(var(--muted))',
    border: 'hsl(var(--border))',
    input: 'hsl(var(--input))',
    ring: 'hsl(var(--ring))',
    background: 'hsl(var(--background))',
    foreground: 'hsl(var(--foreground))',
  },
  
  // Typography
  fonts: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['Fira Code', 'Consolas', 'monospace'],
  },
} as const;

// API endpoints configuration
export const API_ENDPOINTS = {
  // Authentication
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    me: '/auth/me',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
  
  // Books
  books: {
    list: '/books',
    details: (id: string | number) => `/books/${id}`,
    create: '/books',
    update: (id: string | number) => `/books/${id}`,
    delete: (id: string | number) => `/books/${id}`,
    search: '/books/search',
    uploadCover: (id: string | number) => `/books/${id}/upload-cover`,
  },
  
  // Students
  students: {
    list: '/students',
    details: (id: string | number) => `/students/${id}`,
    create: '/students',
    update: (id: string | number) => `/students/${id}`,
    delete: (id: string | number) => `/students/${id}`,
    profile: '/students/profile',
    bulkImport: '/students/bulk',
  },
  
  // Transactions
  transactions: {
    list: '/transactions',
    borrow: '/transactions/borrow',
    return: '/transactions/return',
    renew: '/transactions/renew',
    history: '/transactions/my-history',
    overdue: '/transactions/overdue',
    payFine: (id: string | number) => `/transactions/${id}/pay-fine`,
  },
  
  // Reservations
  reservations: {
    list: '/reservations',
    create: '/reservations',
    cancel: (id: string | number) => `/reservations/${id}`,
    fulfill: (id: string | number) => `/reservations/${id}/fulfill`,
    myReservations: '/reservations/my-reservations',
  },
  
  // Reports
  reports: {
    statistics: '/reports/statistics',
    borrowingTrends: '/reports/borrowing-trends',
    popularBooks: '/reports/popular-books',
    overdueBooks: '/reports/overdue-books',
    studentActivity: '/reports/student-activity',
    inventory: '/reports/inventory',
  },
  
  // Notifications
  notifications: {
    list: '/notifications',
    markRead: (id: string | number) => `/notifications/${id}/read`,
    markAllRead: '/notifications/read-all',
    delete: (id: string | number) => `/notifications/${id}`,
  },
  
  // Admin
  admin: {
    users: '/admin/users',
    auditLogs: '/admin/audit-logs',
    systemHealth: '/admin/system-health',
  },
} as const;

// Route paths for the application
export const ROUTES = {
  // Public routes
  home: '/',
  login: '/login',
  
  // Dashboard
  dashboard: '/dashboard',
  
  // Books
  books: '/books',
  bookDetails: (id: string | number) => `/books/${id}`,
  addBook: '/books/add',
  editBook: (id: string | number) => `/books/${id}/edit`,
  
  // Students
  students: '/students',
  studentDetails: (id: string | number) => `/students/${id}`,
  addStudent: '/students/add',
  editStudent: (id: string | number) => `/students/${id}/edit`,
  profile: '/profile',
  
  // Transactions
  transactions: '/transactions',
  borrow: '/transactions/borrow',
  return: '/transactions/return',
  
  // Reservations
  reservations: '/reservations',
  
  // Reports
  reports: '/reports',
  
  // Settings
  settings: '/settings',
  
  // Admin
  admin: '/admin',
  adminUsers: '/admin/users',
  adminLogs: '/admin/logs',
} as const;

// Default configuration export
export default {
  APP_CONFIG,
  THEME_CONFIG,
  API_ENDPOINTS,
  ROUTES,
} as const;