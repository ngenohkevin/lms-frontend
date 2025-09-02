'use client';

import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { isDevelopment, features } from '@/lib/config/env';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({
  error,
  reset,
}: ErrorPageProps): React.ReactElement {
  const isDev = isDevelopment;

  React.useEffect(() => {
    // Log error for debugging
    if (isDev && features.debug) {
      console.error('🚨 Next.js Error Page');
      console.error('Error:', error);
      console.error('Error Name:', error.name);
      console.error('Error Message:', error.message);
      if (error.digest) console.error('Error Digest:', error.digest);
      if (error.stack) console.error('Error Stack:', error.stack);
    }

    // In production, report to error monitoring service
    if (!isDev) {
      // Example: Send to error reporting service
      // reportError(error, { digest: error.digest });
    }
  }, [error, isDev]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg rounded-xl border border-destructive/20 bg-card p-8 shadow-lg">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 ring-8 ring-destructive/5">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">
            Oops! Something went wrong
          </h1>
          <p className="text-muted-foreground">
            We encountered an unexpected error while processing your request.
          </p>
        </div>

        {/* Error Details (Development Only) */}
        {isDev && (
          <div className="mb-6 rounded-lg bg-muted/50 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Bug className="h-4 w-4" />
              Development Error Details
            </div>
            
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-destructive">Error Type:</span>
                <span className="ml-2 font-mono text-foreground">
                  {error.name}
                </span>
              </div>
              
              <div>
                <span className="font-medium text-destructive">Message:</span>
                <div className="mt-1 rounded bg-background p-2 font-mono text-xs">
                  {error.message}
                </div>
              </div>

              {error.digest && (
                <div>
                  <span className="font-medium text-destructive">Digest:</span>
                  <span className="ml-2 font-mono text-xs text-muted-foreground">
                    {error.digest}
                  </span>
                </div>
              )}

              {error.stack && (
                <details className="group">
                  <summary className="cursor-pointer font-medium text-destructive hover:text-destructive/80">
                    Stack Trace
                    <span className="ml-1 text-xs text-muted-foreground">
                      (click to expand)
                    </span>
                  </summary>
                  <div className="mt-2 max-h-48 overflow-auto rounded bg-background p-3">
                    <pre className="text-xs leading-relaxed">
                      {error.stack}
                    </pre>
                  </div>
                </details>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={reset}
            className="flex items-center justify-center gap-2"
            size="lg"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          
          <Button
            variant="outline"
            onClick={() => (window.location.href = '/')}
            className="flex items-center justify-center gap-2"
            size="lg"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Button>
        </div>

        {/* Development Notice */}
        {isDev && (
          <div className="mt-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-950/30 dark:text-blue-200">
            <div className="flex items-start gap-2">
              <div className="mt-0.5 h-2 w-2 rounded-full bg-blue-500"></div>
              <div>
                <div className="font-medium">Development Mode</div>
                <div className="mt-1 text-xs opacity-90">
                  Detailed error information is shown because you&apos;re in
                  development mode. In production, users will see a simpler
                  error message without technical details.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}