'use client'

import React from 'react'

import { ErrorBoundary, DevTools } from '@/components/dev'
import { Toaster } from '@/components/ui/sonner'

import { QueryProvider } from './query-provider'
import { ThemeProvider } from './theme-provider'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
          <Toaster 
            position="top-right"
            expand={true}
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
          <DevTools />
        </ThemeProvider>
      </QueryProvider>
    </ErrorBoundary>
  )
}