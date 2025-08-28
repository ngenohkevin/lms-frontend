"use client";

import { Component, ErrorInfo, ReactNode } from "react";

import { isDevelopment } from "@/lib/env";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('Uncaught error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // In development, you might want to send to an error reporting service
    if (isDevelopment()) {
      // Log detailed error info for development
      // eslint-disable-next-line no-console
      console.group('🚨 React Error Boundary');
      // eslint-disable-next-line no-console
      console.error('Error:', error);
      // eslint-disable-next-line no-console
      console.error('Error Info:', errorInfo);
      // eslint-disable-next-line no-console
      console.error('Component Stack:', errorInfo.componentStack);
      // eslint-disable-next-line no-console
      console.groupEnd();
    }
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Development error overlay
      if (isDevelopment() && this.state.error && this.state.errorInfo) {
        return (
          <div className="fixed inset-0 bg-red-50 dark:bg-red-950/20 z-50 overflow-auto">
            <div className="min-h-full p-6">
              <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-900 shadow-lg rounded-lg border border-red-200 dark:border-red-800">
                  <div className="bg-red-500 text-white px-6 py-4 rounded-t-lg">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                      🚨 Application Error
                    </h1>
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Error Message:
                      </h2>
                      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded font-mono text-sm">
                        {this.state.error.message}
                      </div>
                    </div>

                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Stack Trace:
                      </h2>
                      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-xs overflow-auto max-h-60 text-gray-700 dark:text-gray-300">
                        {this.state.error.stack}
                      </pre>
                    </div>

                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Component Stack:
                      </h2>
                      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-xs overflow-auto max-h-60 text-gray-700 dark:text-gray-300">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={this.handleReset}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
                      >
                        Try Again
                      </button>
                      <button
                        onClick={() => window.location.reload()}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                      >
                        Reload Page
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      // Production error fallback
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Oops! Something went wrong
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We&apos;re sorry for the inconvenience. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}