'use client';

import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import React from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({
  error,
  reset,
}: GlobalErrorProps): React.ReactElement {
  React.useEffect(() => {
    // Log the error for debugging
    console.error('🚨 Global Error:', error);
    
    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error reporting service
      // reportError(error, { 
      //   digest: error.digest,
      //   context: 'global-error' 
      // });
    }
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
          <div className="w-full max-w-md text-center">
            <div className="mb-6">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-10 w-10 text-red-600" />
              </div>
              <h1 className="mb-2 text-2xl font-bold text-slate-900">
                Something went seriously wrong
              </h1>
              <p className="text-slate-600">
                We encountered a critical error. Please try refreshing the page
                or contact support if the problem persists.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={reset}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
              
              <button
                onClick={() => (window.location.href = '/')}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Home className="h-4 w-4" />
                Go to Homepage
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 rounded-lg bg-slate-100 p-4 text-left text-xs">
                <details>
                  <summary className="cursor-pointer font-medium text-slate-700">
                    Error Details (Development)
                  </summary>
                  <div className="mt-2 space-y-2">
                    <div>
                      <strong>Error:</strong> {error.name}
                    </div>
                    <div>
                      <strong>Message:</strong> {error.message}
                    </div>
                    {error.digest && (
                      <div>
                        <strong>Digest:</strong> {error.digest}
                      </div>
                    )}
                    {error.stack && (
                      <div>
                        <strong>Stack:</strong>
                        <pre className="mt-1 max-h-32 overflow-auto whitespace-pre-wrap bg-white p-2 text-xs">
                          {error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}