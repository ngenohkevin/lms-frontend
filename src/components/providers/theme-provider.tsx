'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import React from 'react'

interface ThemeProviderProps {
  children: React.ReactNode
  attribute?: string
  defaultTheme?: string
  themes?: string[]
  enableSystem?: boolean
  storageKey?: string
  disableTransitionOnChange?: boolean
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute={'data-theme'}
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
      themes={['light', 'dark', 'system']}
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}

// Hook for theme management
export { useTheme } from 'next-themes'