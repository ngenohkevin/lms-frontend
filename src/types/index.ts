// Global types for the Library Management System

// User Management
export interface User {
  id: string
  username: string
  email: string
  role: 'admin' | 'librarian' | 'staff'
  isActive: boolean
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Student {
  id: string
  studentId: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  yearOfStudy: number
  department?: string
  enrollmentDate: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Book Management
export interface Book {
  id: string
  bookId: string
  isbn?: string
  title: string
  author: string
  publisher?: string
  publishedYear?: number
  genre?: string
  description?: string
  coverImageUrl?: string
  totalCopies: number
  availableCopies: number
  shelfLocation?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Transactions
export interface Transaction {
  id: string
  studentId: string
  bookId: string
  transactionType: 'borrow' | 'return' | 'renew'
  transactionDate: Date
  dueDate?: Date
  returnedDate?: Date
  librarianId?: string
  fineAmount: number
  finePaid: boolean
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// Reservations
export interface Reservation {
  id: string
  studentId: string
  bookId: string
  reservedAt: Date
  expiresAt: Date
  status: 'active' | 'fulfilled' | 'cancelled' | 'expired'
  fulfilledAt?: Date
  createdAt: Date
  updatedAt: Date
}

// Notifications
export interface Notification {
  id: string
  recipientId: string
  recipientType: 'student' | 'librarian'
  type: 'overdue_reminder' | 'due_soon' | 'book_available' | 'fine_notice'
  title: string
  message: string
  isRead: boolean
  sentAt?: Date
  createdAt: Date
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: {
    code: string
    message: string
    details?: any
  }
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
  meta?: any
}

// Form State Types
export interface FormState {
  message?: string
  errors?: Record<string, string[]>
  isSubmitting?: boolean
}

// Authentication Types
export interface LoginCredentials {
  email: string
  password: string
}

export interface Session {
  user: {
    id: string
    email: string
    role: string
  }
  userId: string
  expiresAt: Date
}

// UI State Types
export interface Theme {
  mode: 'light' | 'dark' | 'system'
}

export interface SidebarState {
  isCollapsed: boolean
  isMobile: boolean
}

// Search and Filter Types
export interface BookFilters {
  genre?: string
  author?: string
  publishedYear?: number
  available?: boolean
  search?: string
}

export interface StudentFilters {
  yearOfStudy?: number
  department?: string
  isActive?: boolean
  search?: string
}

export interface TransactionFilters {
  studentId?: string
  bookId?: string
  type?: 'borrow' | 'return' | 'renew'
  overdue?: boolean
  dateRange?: {
    start: Date
    end: Date
  }
}

// Statistics and Reports
export interface Statistics {
  totalBooks: number
  availableBooks: number
  totalStudents: number
  activeStudents: number
  totalTransactions: number
  overdueBooks: number
  totalFines: number
  unpaidFines: number
}

export interface ReportData {
  title: string
  data: any[]
  generatedAt: Date
  filters?: any
}

// Component Props Types
export interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export interface SearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  onSubmit?: () => void
}

export interface TableColumn<T = any> {
  key: keyof T
  title: string
  sortable?: boolean
  render?: (value: any, record: T) => React.ReactNode
}

// Error Types
export interface AppError {
  code: string
  message: string
  details?: any
  timestamp: Date
}

// Configuration Types
export interface AppConfig {
  apiUrl: string
  theme: Theme
  features: {
    notifications: boolean
    reports: boolean
    reservations: boolean
  }
  limits: {
    booksPerStudent: number
    borrowingPeriodDays: number
    renewalLimit: number
    reservationExpiryHours: number
  }
}