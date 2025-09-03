import React, { ReactNode } from 'react';

import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function DashboardLayout({ children }: { children: ReactNode }): React.JSX.Element {
  return (
    <div className='from-accent/5 via-background to-muted/10 min-h-screen bg-gradient-to-br relative'>
      {/* Theme Toggle - Fixed Position */}
      <div className='fixed top-6 right-6 z-50'>
        <ThemeToggle variant="button" size="default" />
      </div>
      
      <div className='flex h-screen'>
        {/* Sidebar placeholder */}
        <aside className='bg-card w-64 border-r border-border shadow-sm p-6'>
          <div className='mb-8 text-lg font-semibold text-foreground'>LMS Dashboard</div>
          <nav className='space-y-2'>
            <div className='hover:bg-accent/10 cursor-pointer rounded-lg px-3 py-2 text-foreground'>
              Dashboard
            </div>
            <div className='hover:bg-accent/10 cursor-pointer rounded-lg px-3 py-2 text-foreground'>
              Books
            </div>
            <div className='hover:bg-accent/10 cursor-pointer rounded-lg px-3 py-2 text-foreground'>
              Students
            </div>
            <div className='hover:bg-accent/10 cursor-pointer rounded-lg px-3 py-2 text-foreground'>
              Transactions
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className='flex-1 overflow-auto'>{children}</main>
      </div>
    </div>
  );
}
