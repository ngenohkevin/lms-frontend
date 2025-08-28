# Library Management System (LMS) - Project Plan

## Project Overview

This is a simple School Library Management System designed to be extensible with new features as needed. The system serves students who borrow books and librarians who manage the entire system, with students organized by year of study for better reporting and management.

### Core Features
- Book management (add, edit, delete, search) with cover image uploads
- Student management organized by year of study with bulk import
- Book borrowing and returning system with renewals
- **Book reservations** - Students can reserve unavailable books
- Year-based reporting (Year 1, Year 2, etc.)
- Overdue books tracking by year with automated fine calculation
- **Notification system** - Email/SMS alerts for due dates and overdue books
- **Fine management** - Automated fine calculation and payment tracking
- Authentication and authorization with role-based access control
- **Audit logging** - Complete activity tracking for compliance
- **Advanced search** - Full-text search with filters and sorting

### Access Control
- **Admin**: Full system access including user management and system configuration
- **Librarian**: Full access to books, students, transactions, and reports management
- **Staff**: Limited librarian access (cannot delete records or access sensitive reports)
- **Student**: Limited access (view available books, manage own profile, borrowing history, reservations)

### Authentication Methods
- **Librarians**: Username/email + password
- **Students**: Student ID + password (or email + password)
- **Session Management**: JWT with refresh token rotation
- **Password Requirements**: Minimum 8 characters, mixed case, numbers, special characters

## System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │     Backend      │    │    Database     │
│   (Next.js)     │◄──►│   (Go + Gin)     │◄──►│   (PostgreSQL)  │
│                 │    │                  │    │                 │
│ - Auth Pages    │    │ - REST API       │    │ - Users         │
│ - Book Mgmt     │    │ - Middleware     │    │ - Books         │
│ - Dashboard     │    │ - Services       │    │ - Transactions  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Database Design

### Users Table (Librarians)
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'librarian' CHECK (role IN ('librarian', 'admin', 'staff')),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
```

### Students Table
```sql
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(20) UNIQUE NOT NULL, -- e.g., STU2024001
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    year_of_study INTEGER NOT NULL CHECK (year_of_study > 0 AND year_of_study <= 8),
    department VARCHAR(100),
    enrollment_date DATE DEFAULT CURRENT_DATE,
    password_hash VARCHAR(255), -- For student authentication
    is_active BOOLEAN DEFAULT true,
    deleted_at TIMESTAMP, -- Soft delete
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_students_student_id ON students(student_id);
CREATE INDEX idx_students_year ON students(year_of_study);
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_name ON students(first_name, last_name);
CREATE INDEX idx_students_active ON students(is_active) WHERE deleted_at IS NULL;
```

### Books Table
```sql
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    book_id VARCHAR(50) UNIQUE NOT NULL, -- Custom librarian-defined ID (alphanumeric)
    isbn VARCHAR(20) UNIQUE,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    publisher VARCHAR(255),
    published_year INTEGER CHECK (published_year > 1000 AND published_year <= EXTRACT(YEAR FROM CURRENT_DATE)),
    genre VARCHAR(100),
    description TEXT,
    cover_image_url VARCHAR(500),
    total_copies INTEGER DEFAULT 1 CHECK (total_copies >= 0),
    available_copies INTEGER DEFAULT 1 CHECK (available_copies >= 0),
    shelf_location VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    deleted_at TIMESTAMP, -- Soft delete
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT chk_available_copies CHECK (available_copies <= total_copies)
);

-- Indexes for performance
CREATE INDEX idx_books_book_id ON books(book_id);
CREATE INDEX idx_books_isbn ON books(isbn);
CREATE INDEX idx_books_search ON books USING GIN(to_tsvector('english', title || ' ' || author));
CREATE INDEX idx_books_genre ON books(genre);
CREATE INDEX idx_books_available ON books(available_copies) WHERE available_copies > 0;
CREATE INDEX idx_books_active ON books(is_active) WHERE deleted_at IS NULL;
```

### Transactions Table
```sql
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('borrow', 'return', 'renew')),
    transaction_date TIMESTAMP DEFAULT NOW(),
    due_date TIMESTAMP,
    returned_date TIMESTAMP,
    librarian_id INTEGER REFERENCES users(id),
    fine_amount DECIMAL(10,2) DEFAULT 0.00 CHECK (fine_amount >= 0),
    fine_paid BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_transactions_student ON transactions(student_id);
CREATE INDEX idx_transactions_book ON transactions(book_id);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_overdue ON transactions(due_date, returned_date) WHERE returned_date IS NULL;
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
```

### Additional Tables

#### Reservations Table
```sql
CREATE TABLE reservations (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    reserved_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'fulfilled', 'cancelled', 'expired')),
    fulfilled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_reservations_student ON reservations(student_id);
CREATE INDEX idx_reservations_book ON reservations(book_id);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_expires ON reservations(expires_at) WHERE status = 'active';
```

#### Audit Logs Table
```sql
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    record_id INTEGER NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    user_id INTEGER REFERENCES users(id),
    user_type VARCHAR(20) DEFAULT 'librarian' CHECK (user_type IN ('librarian', 'student', 'system')),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_audit_logs_table ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_record ON audit_logs(record_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_date ON audit_logs(created_at);
```

#### Notifications Table
```sql
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    recipient_id INTEGER NOT NULL,
    recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('student', 'librarian')),
    type VARCHAR(50) NOT NULL CHECK (type IN ('overdue_reminder', 'due_soon', 'book_available', 'fine_notice')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, recipient_type);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_unread ON notifications(is_read) WHERE is_read = false;
```

## Repository Structure

The project uses **separate repositories** for frontend and backend to support independent deployment strategies.

### Backend Repository: `lms-backend`
**Deployment**: VPS (Virtual Private Server)

### Frontend Repository: `lms-frontend`
**Deployment**: Netlify

### Deployment Strategy
- **Backend**: Self-hosted on VPS with PostgreSQL database
- **Frontend**: Static hosting on Netlify
- **CI/CD**: GitHub Actions for both repositories
- **CORS**: Backend configured to allow frontend domain

### Advantages of Separate Repositories
- **Independent Deployments**: Deploy frontend and backend separately
- **Team Autonomy**: Different teams can work independently
- **Technology Flexibility**: Each repository can evolve its toolchain independently
- **Scalability**: Scale development teams and deployment strategies separately
- **CI/CD Optimization**: Tailored build pipelines for each technology stack

### Type Synchronization
For maintaining consistent types between frontend and backend:
1. **API Contracts**: Document API request/response types in both repositories
2. **Shared Types**: Manually maintain TypeScript types in frontend based on Go structs
3. **OpenAPI**: Consider generating OpenAPI spec from Go backend for frontend consumption
4. **Version Coordination**: Tag releases in both repositories to maintain compatibility

## Original Project Structure (for reference)

```
lms/
├── backend/
│   ├── cmd/
│   │   └── server/
│   │       └── main.go
│   ├── internal/
│   │   ├── config/
│   │   │   └── config.go
│   │   ├── handlers/
│   │   │   ├── auth.go
│   │   │   ├── books.go
│   │   │   └── transactions.go
│   │   ├── middleware/
│   │   │   ├── auth.go
│   │   │   └── cors.go
│   │   ├── models/
│   │   │   ├── user.go
│   │   │   ├── book.go
│   │   │   └── transaction.go
│   │   ├── services/
│   │   │   ├── auth.go
│   │   │   ├── book.go
│   │   │   └── transaction.go
│   │   └── database/
│   │       ├── connection.go
│   │       └── queries/
│   ├── migrations/
│   │   ├── 001_create_users.up.sql
│   │   ├── 001_create_users.down.sql
│   │   ├── 002_create_books.up.sql
│   │   ├── 002_create_books.down.sql
│   │   ├── 003_create_transactions.up.sql
│   │   └── 003_create_transactions.down.sql
│   ├── tests/
│   ├── go.mod
│   ├── go.sum
│   ├── sqlc.yaml
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/
│   │   │   │   └── page.tsx
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── books/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── transactions/
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   └── Modal.tsx
│   │   │   ├── BookCard.tsx
│   │   │   ├── BookForm.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── SearchBar.tsx
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   ├── auth.ts
│   │   │   └── utils.ts
│   │   └── types/
│   │       └── index.ts
│   ├── public/
│   ├── package.json
│   ├── tailwind.config.js
│   ├── next.config.js
│   └── Dockerfile
├── .github/
│   └── workflows/
│       ├── backend-ci.yml
│       └── frontend-ci.yml
├── docker-compose.yml
├── README.md
└── CLAUDE.md
```

## API Endpoints

### Standard Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Optional message",
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  },
  "meta": {}
}
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "message": "Invalid email format"
    }
  },
  "timestamp": "2024-01-01T00:00:00Z",
  "request_id": "req_123456"
}
```

### Authentication
- `POST /api/v1/auth/login` - User login (librarian/student)
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user info
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password with token
- `POST /api/v1/auth/change-password` - Change password (authenticated)

### Books
- `GET /api/v1/books` - Get all books (paginated)
    - Query params: `?page=1&limit=20&genre=fiction&available=true&search=title`
- `GET /api/v1/books/:id` - Get book by ID
- `POST /api/v1/books` - Create new book (Librarian only)
- `PUT /api/v1/books/:id` - Update book (Librarian only)
- `DELETE /api/v1/books/:id` - Soft delete book (Librarian only)
- `GET /api/v1/books/search` - Advanced book search
    - Query params: `?q=query&genre=fiction&author=name&year=2023&available=true`
- `POST /api/v1/books/:id/upload-cover` - Upload book cover image (Librarian only)

### Students
- `GET /api/v1/students` - Get all students (Librarian only, paginated)
    - Query params: `?page=1&limit=20&year=1&department=cs&active=true&search=name`
- `GET /api/v1/students/:id` - Get student by ID (Librarian only)
- `POST /api/v1/students` - Create new student (Librarian only)
- `POST /api/v1/students/bulk` - Bulk import students from CSV (Librarian only)
- `PUT /api/v1/students/:id` - Update student (Librarian only)
- `DELETE /api/v1/students/:id` - Soft delete student (Librarian only)
- `GET /api/v1/students/profile` - Get own profile (Student only)
- `PUT /api/v1/students/profile` - Update own profile (Student only)

### Transactions
- `GET /api/v1/transactions` - Get all transactions (Librarian only, paginated)
    - Query params: `?page=1&limit=20&student_id=123&book_id=456&type=borrow&overdue=true`
- `GET /api/v1/transactions/my-history` - Get own transaction history (Student only)
- `POST /api/v1/transactions/borrow` - Borrow a book
- `POST /api/v1/transactions/return` - Return a book
- `POST /api/v1/transactions/renew` - Renew a borrowed book
- `GET /api/v1/transactions/overdue` - Get overdue books (Librarian only)
- `PUT /api/v1/transactions/:id/fine` - Update fine amount (Librarian only)
- `POST /api/v1/transactions/:id/pay-fine` - Pay fine (Student/Librarian)

### Reservations
- `GET /api/v1/reservations` - Get all reservations (Librarian only, paginated)
- `GET /api/v1/reservations/my-reservations` - Get own reservations (Student only)
- `POST /api/v1/reservations` - Create book reservation (Student only)
- `DELETE /api/v1/reservations/:id` - Cancel reservation
- `POST /api/v1/reservations/:id/fulfill` - Fulfill reservation (Librarian only)

### Reports (Librarian only)
- `GET /api/v1/reports/statistics` - Get overall library statistics
- `GET /api/v1/reports/borrowing-trends` - Get borrowing trends by year/month
- `GET /api/v1/reports/popular-books` - Get popular books report
    - Query params: `?year=1&department=cs&period=month`
- `GET /api/v1/reports/overdue-books` - Get overdue books report
    - Query params: `?year=1&department=cs`
- `GET /api/v1/reports/student-activity` - Get student activity report
- `GET /api/v1/reports/inventory` - Get inventory report

### Notifications
- `GET /api/v1/notifications` - Get user notifications (paginated)
- `PUT /api/v1/notifications/:id/read` - Mark notification as read
- `PUT /api/v1/notifications/read-all` - Mark all notifications as read
- `DELETE /api/v1/notifications/:id` - Delete notification

### Admin (Admin/Super Librarian only)
- `GET /api/v1/admin/users` - Get all librarian users
- `POST /api/v1/admin/users` - Create new librarian user
- `PUT /api/v1/admin/users/:id` - Update librarian user
- `DELETE /api/v1/admin/users/:id` - Delete librarian user
- `GET /api/v1/admin/audit-logs` - Get audit logs (paginated)
- `GET /api/v1/admin/system-health` - Get system health status

## Technology Stack

### Backend
- **Go 1.21+** with Gin framework for REST API
- **PostgreSQL 14+** for database with connection pooling
- **SQLC** for type-safe SQL queries
- **golang-migrate** for database migrations
- **Docker** for containerization
- **Makefile** for build automation

#### Authentication & Security
- **JWT with RSA256** - Secure token-based authentication
- **Argon2** - Advanced password hashing (more secure than bcrypt)
- **Refresh Token Rotation** - Enhanced JWT security with automatic token refresh
- **Go Validator v10** - Input validation and sanitization
- **Rate Limiting** - API abuse prevention (Redis-based)
    - Authentication endpoints: 5 attempts per minute
    - General API: 100 requests per minute per user
    - Search endpoints: 30 requests per minute
- **Security Headers** - CORS, CSP, X-Frame-Options, HSTS
- **RBAC (Role-Based Access Control)** - Fine-grained permissions
- **Input Sanitization** - XSS prevention and SQL injection protection
- **API Key Management** - For third-party integrations
- **Session Security** - Secure session management with Redis TTL

#### Performance & Caching
- **Redis** - Session storage, rate limiting, and query caching
- **pgx** - High-performance PostgreSQL driver
- **Database Connection Pooling** - Optimized database connections
- **Gin Middleware** - Compression, recovery, and logging

#### Configuration & Environment
- **Viper** - Secure configuration management
- **Slog** - Structured logging (Go 1.21+)
- **Air** - Hot reloading for development

#### Testing & Quality
- **Testify** - Testing framework with assertions and mocks
- **golangci-lint** - Static analysis and linting
- **Test Coverage** - Comprehensive unit and integration tests

#### Monitoring & Observability
- **Prometheus** - Metrics collection and monitoring
- **Health Check Endpoints** - Application health monitoring
- **Request Logging** - Detailed request/response logging

### Frontend
- **Next.js 14+** with App Router - Modern React framework
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first styling framework

#### State Management & Data Fetching
- **TanStack Query (React Query)** - Server state management, caching, background refetching
- **Zustand** - Lightweight client state management (auth, UI state)

#### Forms & Validation
- **React Hook Form** - Performance-optimized forms with minimal re-renders
- **Zod** - TypeScript-first schema validation

#### UI Components & Design
- **Shadcn/ui** - High-quality, accessible components built on Radix UI
- **Lucide React** - Consistent icon library
- **React Hot Toast** - Toast notifications

#### HTTP Client & Utilities
- **Axios** - HTTP client with interceptors for authentication
- **Date-fns** - Date utility library for due dates and formatting
- **CSV Parser** - For bulk student imports functionality

### DevOps & CI/CD
- **GitHub Actions** - Automated CI/CD pipeline
- **Docker** - Multi-stage builds for production
- **docker-compose** - Local development environment
- **Makefile** - Build automation and task management
- **Dockerfile** - Optimized Go builds with scratch base image

## Development Phases

### Phase 1: Core Infrastructure Setup
- Set up Go backend with proper project structure
- Set up Next.js frontend with TypeScript
- Configure PostgreSQL database with migrations
- Set up Redis for caching and sessions
- Configure development environment (Docker, Makefile)
- Set up basic logging and monitoring

### Phase 2: Authentication & Authorization
- Implement JWT authentication with refresh tokens
- Create role-based access control (RBAC)
- Implement password hashing with Argon2
- Build login/logout functionality for both librarians and students
- Add password reset functionality
- Implement rate limiting

### Phase 3: Core Database Operations
- Create all database tables with proper indexes
- Implement SQLC for type-safe queries
- Set up database connection pooling
- Create audit logging system
- Implement soft delete functionality

### Phase 4: Book Management System
- Create book CRUD operations with validation
- Implement advanced search with full-text search
- Add book cover image upload functionality
- Create book categorization and filtering
- Build book management UI with proper pagination

### Phase 5: Student Management
- Implement student CRUD operations
- Add bulk student import from CSV
- Create student profile management
- Build student search and filtering
- Implement student dashboard

### Phase 6: Transaction & Reservation System
- Implement borrowing and returning logic
- Add book reservation functionality
- Create renewal system
- Implement automated fine calculation
- Build transaction history and management UI
- Add overdue book tracking

### Phase 7: Notification System
- Implement email/SMS notification service
- Create notification templates
- Set up automated reminders for due dates
- Add overdue book notifications
- Build notification management dashboard

### Phase 8: Reporting & Analytics
- Create year-based reporting system
- Implement popular books analytics
- Add student activity reports
- Create inventory management reports
- Build comprehensive dashboard with statistics

### Phase 9: Advanced Features
- Implement caching strategy
- Add API versioning
- Create backup and recovery procedures
- Implement advanced security features
- Add system health monitoring

### Phase 10: Testing & Deployment
- Write comprehensive unit tests
- Create integration tests
- Set up end-to-end testing
- Configure GitHub Actions CI/CD pipeline
- Set up production deployment with Docker
- Add monitoring and alerting
- Create documentation and user guides

## Environment Setup

### Required Tools
- Go 1.21+
- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- Docker & Docker Compose
- SQLC
- golang-migrate
- Air (for hot reloading)
- golangci-lint
- Testify (for testing)

### Environment Configuration
```bash
# Create environment files
cp .env.example .env.development
cp .env.example .env.staging
cp .env.example .env.production

# Required environment variables
PORT=8080
DATABASE_URL=postgres://user:pass@localhost:5432/lms_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
FILE_UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5MB
```

### Development Commands
```bash
# Backend
make run          # Start development server with hot reload
make test         # Run tests with coverage
make test-watch   # Run tests in watch mode
make lint         # Run linting and static analysis
make fmt          # Format code
make build        # Build production binary
make migrate-up   # Apply database migrations
make migrate-down # Rollback database migrations
make migrate-create NAME=migration_name # Create new migration
make docker-build # Build Docker image
make docker-run   # Run with Docker Compose
make docker-test  # Run tests in Docker

# Frontend
npm run dev       # Start development server
npm run build     # Build for production
npm run test      # Run tests
npm run test:watch # Run tests in watch mode
npm run lint      # Run ESLint
npm run lint:fix  # Fix linting errors
npm run type-check # Run TypeScript type checking

# Database
sqlc generate     # Generate Go code from SQL
make db-seed      # Seed database with test data
make db-reset     # Reset database (drop and recreate)
make db-backup    # Create database backup
make db-restore   # Restore database from backup

# Deployment
make deploy-staging   # Deploy to staging environment
make deploy-prod     # Deploy to production environment
```

### Pre-commit Hooks
```bash
# Install pre-commit hooks
pre-commit install

# Hooks configuration (.pre-commit-config.yaml)
- Backend: go fmt, go vet, golangci-lint, tests
- Frontend: ESLint, Prettier, TypeScript check
- Database: SQL formatting, migration validation
```

### Code Quality Standards
- **Go**: Follow Go standards, use gofmt, maintain >80% test coverage
- **TypeScript**: Strict TypeScript configuration, no any types
- **Database**: All queries through SQLC, proper indexes, foreign keys
- **API**: OpenAPI documentation, consistent response formats
- **Git**: Conventional commits, feature branches, PR reviews required

## Error Handling & Validation

### Error Codes
```go
const (
    ErrValidation     = "VALIDATION_ERROR"
    ErrAuthentication = "AUTHENTICATION_ERROR"
    ErrAuthorization  = "AUTHORIZATION_ERROR"
    ErrNotFound       = "NOT_FOUND"
    ErrConflict       = "CONFLICT_ERROR"
    ErrRateLimit      = "RATE_LIMIT_EXCEEDED"
    ErrInternal       = "INTERNAL_ERROR"
    ErrBookUnavailable = "BOOK_UNAVAILABLE"
    ErrOverdueBooks   = "OVERDUE_BOOKS_EXIST"
    ErrMaxBooksReached = "MAX_BOOKS_REACHED"
)
```

### Validation Rules
- **Books**: Title (required, 1-255 chars), Author (required, 1-255 chars), ISBN (optional, valid format)
- **Students**: Student ID (required, unique, alphanumeric), Email (valid format), Year (1-8)
- **Transactions**: Book must be available, Student must be active, No overdue books for new borrows
- **Reservations**: Book must be unavailable, Student active, Max 5 active reservations per student

### HTTP Status Codes
- `200 OK` - Successful GET requests
- `201 Created` - Successful POST requests
- `204 No Content` - Successful DELETE requests
- `400 Bad Request` - Validation errors
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (duplicate, constraints)
- `422 Unprocessable Entity` - Business logic errors
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server errors

## Performance & Scalability

### Database Optimization
- **Connection Pooling**: Max 25 connections, idle timeout 5 minutes
- **Query Optimization**: Use of proper indexes, avoid N+1 queries
- **Prepared Statements**: All queries use prepared statements via SQLC
- **Database Partitioning**: Consider partitioning transactions table by date

### Caching Strategy
- **Redis Caching**:
    - Book catalog (30 minutes TTL)
    - Student profiles (15 minutes TTL)
    - Popular books report (1 hour TTL)
    - Search results (5 minutes TTL)
- **Cache Invalidation**: Event-driven cache invalidation on data changes

### API Performance
- **Pagination**: Default 20 items per page, max 100
- **Response Compression**: Gzip compression for responses > 1KB
- **Request Timeout**: 30 seconds for API requests
- **Background Jobs**: Use Redis queues for heavy operations (bulk imports, notifications)

### Monitoring & Alerts
- **Metrics**: Response times, error rates, database connection pool usage
- **Alerts**:
    - API response time > 2 seconds
    - Error rate > 5%
    - Database connection pool > 80%
    - Disk space > 85%

## Security Considerations
- **Authentication**: JWT with RSA256 signing and refresh token rotation
- **Password Security**: Argon2 hashing with salt (more secure than bcrypt)
- **Authorization**: Role-based access control (RBAC) with middleware
- **Input Validation**: Comprehensive validation using Go validator v10
- **SQL Injection Prevention**: SQLC provides compile-time safety
- **Rate Limiting**: Redis-based rate limiting to prevent abuse
- **Security Headers**: CORS, CSP, X-Frame-Options, HSTS, and other security headers
- **Session Management**: Redis-based session storage with TTL
- **Environment Security**: Viper for secure configuration management
- **Static Analysis**: golangci-lint for detecting security vulnerabilities
- **Database Security**: Connection pooling with secure connection strings
- **File Upload Security**: Virus scanning, file type validation, size limits
- **API Security**: Request signing, IP whitelisting for admin endpoints
- **Data Privacy**: Personal data encryption at rest, GDPR compliance considerations
