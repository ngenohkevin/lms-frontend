'use client'

import React from 'react'
import { Sidebar } from '@/components/ui/sidebar'
import { useSidebar } from '@/lib/stores/ui-store'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const sidebar = useSidebar()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background">
      {/* Glass Header */}
      <header className="glass-header fixed top-0 left-0 right-0 z-40 border-b border-border/50">
        <div 
          className={cn(
            "flex h-16 items-center justify-between transition-all duration-300 ease-out",
            sidebar.isCollapsed ? "ml-sidebar-collapsed" : "ml-sidebar-expanded"
          )}
        >
          <div className="flex items-center gap-4 px-6">
            <h1 className="text-xl font-semibold text-gradient">
              Library Management System
            </h1>
          </div>
          
          <div className="flex items-center gap-2 px-6">
            {/* Header actions will be added here */}
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main 
        className={cn(
          "pt-16 transition-all duration-300 ease-out",
          sidebar.isCollapsed ? "ml-sidebar-collapsed" : "ml-sidebar-expanded"
        )}
      >
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}