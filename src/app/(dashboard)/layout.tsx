'use client';

import React, { ReactNode } from 'react';

import { DesktopSidebar } from '@/components/layout/desktop-sidebar';
import { HamburgerMenu } from '@/components/layout/hamburger-menu';
import { MobileSidebar } from '@/components/layout/mobile-sidebar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useMobileNav } from '@/lib/hooks/use-mobile-nav';

export default function DashboardLayout({ children }: { children: ReactNode }): React.JSX.Element {
  const { isMobileNavOpen, toggleMobileNav, closeMobileNav } = useMobileNav();

  return (
    <div className='min-h-screen bg-gradient-to-br from-accent/5 via-background to-muted/10 transition-colors duration-300 ease-in-out'>
      {/* Mobile Navigation */}
      <MobileSidebar isOpen={isMobileNavOpen} onClose={closeMobileNav} />
      
      <div className='flex h-screen transition-all duration-300 ease-in-out'>
        {/* Desktop Sidebar */}
        <DesktopSidebar />

        {/* Main Content */}
        <div className='flex flex-1 flex-col overflow-hidden'>
          {/* Top Bar - Mobile and Desktop */}
          <header className='flex items-center justify-between border-b border-gray-200 dark:border-white/5 bg-white/80 dark:bg-card/30 backdrop-blur-xl p-4 sticky top-0 z-40 shadow-sm dark:shadow-none transition-all duration-300 ease-in-out'>
            <div className='flex items-center gap-3'>
              <HamburgerMenu onClick={toggleMobileNav} isOpen={isMobileNavOpen} />
              <div className='flex items-center gap-2'>
                <div className='hidden lg:block w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 animate-pulse' />
                <div className='text-lg font-semibold text-foreground'>
                  <span className='lg:hidden'>LMS</span>
                  <span className='hidden lg:inline'>Library Management System</span>
                </div>
              </div>
            </div>
            
            {/* Right side actions */}
            <div className='flex items-center gap-2 sm:gap-4'>
              {/* Search on desktop */}
              <div className='hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-muted/50 border border-gray-200 dark:border-transparent hover:bg-gray-200 dark:hover:bg-muted/70 transition-all duration-300 ease-in-out cursor-pointer min-w-[200px] lg:min-w-[300px]'>
                <svg className='w-4 h-4 text-gray-500 dark:text-muted-foreground' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                </svg>
                <span className='text-sm text-gray-500 dark:text-muted-foreground flex-1'>Search...</span>
                <kbd className='hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border border-gray-300 dark:border-border/50 bg-white dark:bg-muted/50 px-1.5 font-mono text-[10px] font-medium text-gray-600 dark:opacity-60'>
                  ⌘K
                </kbd>
              </div>
              
              {/* Theme Toggle */}
              <ThemeToggle variant="icon" size="sm" />
              
              {/* Profile Avatar on Desktop */}
              <div className='hidden lg:flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer'>
                <div className='w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-xs font-semibold text-white'>
                  AU
                </div>
              </div>
            </div>
          </header>

          
          {/* Main Content Area */}
          <main className='flex-1 overflow-auto bg-gradient-to-br from-background via-background to-muted/5 transition-all duration-300 ease-in-out'>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
