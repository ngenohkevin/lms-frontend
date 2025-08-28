'use client'

import React from 'react'

interface QueryProviderProps {
  children: React.ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  // Temporarily disabled React Query until Phase 1.2 is complete
  // Will be implemented in Phase 2 when we set up API integration
  return <>{children}</>
}