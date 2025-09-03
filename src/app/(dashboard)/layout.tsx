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
    <div className='min-h-screen bg-gradient-to-br from-accent/5 via-background to-muted/10'>
      {/* Mobile Navigation */}
      <MobileSidebar isOpen={isMobileNavOpen} onClose={closeMobileNav} />
      
      <div className='flex h-screen'>
        {/* Desktop Sidebar */}
        <DesktopSidebar />

        {/* Main Content */}
        <div className='flex flex-1 flex-col overflow-hidden'>
          {/* Top Bar - Mobile Only */}
          <header className='flex items-center justify-between border-b border-border bg-card/50 backdrop-blur-sm p-4 lg:hidden'>
            <div className='flex items-center gap-3'>
              <HamburgerMenu onClick={toggleMobileNav} isOpen={isMobileNavOpen} />
              <div className='text-lg font-semibold text-foreground'>LMS</div>
            </div>
            <ThemeToggle variant="button" size="sm" />
          </header>

          
          {/* Main Content Area */}
          <main className='flex-1 overflow-auto'>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
