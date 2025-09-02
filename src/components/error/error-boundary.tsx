'use client';

import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { isDevelopment, features } from '@/lib/config/env';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
}

export interface ErrorFallbackProps {
  error: Error | null;
  resetError: () => void;
  retry?: () => void;
}

class ErrorBoundaryClass extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({
      error,
      errorInfo,
    });

    // Log error in development
    if (isDevelopment && features.debug) {
      console.error('🚨 Error Boundary Caught Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
    }

    // In production, you might want to send this to an error reporting service
    if (!isDevelopment) {
      // Example: Send to error reporting service
      // reportError(error, errorInfo);
    }
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback ?? DefaultErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

// Default error fallback component
function DefaultErrorFallback({
  error,
  resetError,
}: ErrorFallbackProps): React.ReactElement {
  const isDev = isDevelopment;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-lg border border-destructive/20 bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              Something went wrong
            </h1>
            <p className="text-sm text-muted-foreground">
              An unexpected error occurred
            </p>
          </div>
        </div>

        {isDev && error && (
          <div className="mb-4 rounded-md bg-muted p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Bug className="h-4 w-4" />
              Debug Information
            </div>
            <div className="text-xs font-mono">
              <div className="mb-2 text-destructive">
                <strong>Error:</strong> {error.name}
              </div>
              <div className="break-all text-muted-foreground">
                {error.message}
              </div>
              {error.stack && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                    Stack trace
                  </summary>
                  <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap text-xs">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={resetError} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = '/')}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Go home
          </Button>
        </div>

        {isDev && (
          <div className="mt-4 rounded-md bg-blue-50 p-3 text-xs text-blue-800 dark:bg-blue-950 dark:text-blue-200">
            <strong>Development mode:</strong> This detailed error information is
            only shown in development. In production, users will see a generic
            error message.
          </div>
        )}
      </div>
    </div>
  );
}

// Async error boundary for handling promise rejections
export class AsyncErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidMount(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', this.handlePromiseRejection);
  }

  componentWillUnmount(): void {
    window.removeEventListener(
      'unhandledrejection',
      this.handlePromiseRejection
    );
  }

  handlePromiseRejection = (event: PromiseRejectionEvent): void => {
    const error = new Error(
      (event.reason as Error)?.message ?? 'Unhandled promise rejection'
    );
    error.name = 'UnhandledPromiseRejection';
    error.stack = (event.reason as Error)?.stack;

    this.setState({
      hasError: true,
      error,
      errorInfo: { componentStack: '' },
    });

    if (isDevelopment && features.debug) {
      console.error('🚨 Unhandled Promise Rejection:', event.reason);
    }
  };

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({
      error,
      errorInfo,
    });

    if (isDevelopment && features.debug) {
      console.error('🚨 Async Error Boundary Caught Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
    }
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback ?? DefaultErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

// Export the main ErrorBoundary component
export const ErrorBoundary = ErrorBoundaryClass;

// Helper hook for handling async errors
export function useAsyncError(): (error: Error) => void {
  const [, setError] = React.useState<Error>();
  
  return React.useCallback((error: Error) => {
    setError(() => {
      throw error;
    });
  }, []);
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<ErrorFallbackProps>
): React.ComponentType<P> {
  const WrappedComponent = (props: P): React.ReactElement => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName ?? Component.name
  })`;

  return WrappedComponent;
}