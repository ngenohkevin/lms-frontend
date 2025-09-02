import { isDevelopment, features } from '@/lib/config/env';

// Error types for better categorization
export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  UNKNOWN = 'UNKNOWN',
}

// Enhanced error class with additional metadata
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly statusCode: number | undefined;
  public readonly digest?: string;
  public readonly context: Record<string, unknown> | undefined;
  public readonly timestamp: Date;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    statusCode?: number,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.statusCode = statusCode;
    this.context = context;
    this.timestamp = new Date();

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  toJSON(): object {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      statusCode: this.statusCode,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
    };
  }
}

// Error reporting service
class ErrorReportingService {
  private isEnabled = !isDevelopment;
  private reportQueue: AppError[] = [];
  private maxQueueSize = 10;

  // Report error to external service (e.g., Sentry, LogRocket, etc.)
  async reportError(
    error: Error | AppError,
    additionalContext?: Record<string, unknown>
  ): Promise<void> {
    const errorReport = {
      ...(error instanceof AppError ? error.toJSON() : this.normalizeError(error)),
      context: {
        ...additionalContext,
        ...(error instanceof AppError ? error.context : {}),
        url: typeof window !== 'undefined' ? window.location.href : '',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
        timestamp: new Date().toISOString(),
      } as Record<string, unknown>,
    };

    if (isDevelopment && features.debug) {
      console.error('🚨 Error Report');
      console.error('Error Details:', errorReport);
    }

    if (this.isEnabled) {
      // Add to queue for batch processing
      if (this.reportQueue.length < this.maxQueueSize) {
        this.reportQueue.push(error instanceof AppError ? error : new AppError(error.message));
      }

      // In a real application, you would send this to your error reporting service
      // Examples:
      // - Sentry.captureException(error, { extra: errorReport.context });
      // - LogRocket.captureException(error);
      // - Custom API endpoint for error collection
      
      await this.flushErrorQueue();
    }
  }

  // Normalize regular Error to AppError format
  private normalizeError(error: Error): object {
    return {
      name: error.name,
      message: error.message,
      type: this.inferErrorType(error),
      stack: error.stack,
      timestamp: new Date().toISOString(),
    };
  }

  // Infer error type from error message/name
  private inferErrorType(error: Error): ErrorType {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    if (name.includes('network') || message.includes('network') || message.includes('fetch')) {
      return ErrorType.NETWORK;
    }
    if (name.includes('validation') || message.includes('validation')) {
      return ErrorType.VALIDATION;
    }
    if (name.includes('auth') || message.includes('unauthorized')) {
      return ErrorType.AUTHENTICATION;
    }
    if (message.includes('forbidden') || message.includes('permission')) {
      return ErrorType.AUTHORIZATION;
    }
    if (message.includes('not found') || name.includes('notfound')) {
      return ErrorType.NOT_FOUND;
    }
    if (name.includes('server') || message.includes('server')) {
      return ErrorType.SERVER;
    }

    return ErrorType.UNKNOWN;
  }

  // Flush error queue (batch send errors)
  private flushErrorQueue(): Promise<void> {
    if (this.reportQueue.length === 0) return Promise.resolve();

    try {
      // In a real application, batch send errors to your service
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ errors: this.reportQueue })
      // });

      // Clear queue after successful send
      this.reportQueue = [];
      return Promise.resolve();
    } catch (err) {
      // If error reporting fails, log it but don't throw
      if (isDevelopment) {
        console.error('Failed to report errors:', err);
      }
      return Promise.resolve();
    }
  }

  // Enable/disable error reporting
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }
}

// Global error reporting service instance
export const errorReporter = new ErrorReportingService();

// Global error handler for unhandled errors
export function setupGlobalErrorHandling(): void {
  if (typeof window === 'undefined') return;

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = new AppError(
(event.reason as Error)?.message ?? 'Unhandled promise rejection',
      ErrorType.CLIENT,
      undefined,
      { reason: event.reason }
    );

    void errorReporter.reportError(error, {
      eventType: 'unhandledrejection',
      promise: event.promise,
    });

    if (isDevelopment && features.debug) {
      console.error('🚨 Unhandled Promise Rejection:', event.reason);
    }
  });

  // Handle global JavaScript errors
  window.addEventListener('error', (event) => {
    const error = new AppError(
      event.message || 'Global JavaScript error',
      ErrorType.CLIENT,
      undefined,
      {
        filename: event.filename ?? undefined,
        lineno: event.lineno ?? undefined,
        colno: event.colno ?? undefined,
      } as Record<string, unknown>
    );

    void errorReporter.reportError(error, {
      eventType: 'global-error',
      source: event.filename ?? 'unknown',
    });

    if (isDevelopment && features.debug) {
      console.error('🚨 Global Error:', event.error ?? event.message);
    }
  });
}

// Utility functions for creating specific error types
export const createNetworkError = (message: string, statusCode?: number): AppError =>
  new AppError(message, ErrorType.NETWORK, statusCode);

export const createValidationError = (message: string, context?: Record<string, unknown>): AppError =>
  new AppError(message, ErrorType.VALIDATION, 400, context);

export const createAuthError = (message: string): AppError =>
  new AppError(message, ErrorType.AUTHENTICATION, 401);

export const createForbiddenError = (message: string): AppError =>
  new AppError(message, ErrorType.AUTHORIZATION, 403);

export const createNotFoundError = (message: string): AppError =>
  new AppError(message, ErrorType.NOT_FOUND, 404);

export const createServerError = (message: string, statusCode = 500): AppError =>
  new AppError(message, ErrorType.SERVER, statusCode);

// Error boundary helper for React components
export function handleComponentError(
  error: Error,
  errorInfo: { componentStack: string },
  componentName?: string
): void {
  const appError = new AppError(
    `Component error in ${componentName ?? 'Unknown'}: ${error.message}`,
    ErrorType.CLIENT,
    undefined,
    {
      componentName,
      componentStack: errorInfo.componentStack,
      originalError: error.name,
    }
  );

  void errorReporter.reportError(appError);
}

// Initialize global error handling when this module loads
if (typeof window !== 'undefined') {
  setupGlobalErrorHandling();
}