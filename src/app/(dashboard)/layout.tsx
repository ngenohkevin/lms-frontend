import React, { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }): React.JSX.Element {
  return (
    <div className='from-accent/5 via-background to-muted/10 min-h-screen bg-gradient-to-br'>
      <div className='flex h-screen'>
        {/* Sidebar placeholder */}
        <aside className='bg-card/50 w-64 border-r p-6 backdrop-blur-sm'>
          <div className='mb-8 text-lg font-semibold'>LMS Dashboard</div>
          <nav className='space-y-2'>
            <div className='hover:bg-accent/10 cursor-pointer rounded-lg px-3 py-2'>
              Dashboard
            </div>
            <div className='hover:bg-accent/10 cursor-pointer rounded-lg px-3 py-2'>
              Books
            </div>
            <div className='hover:bg-accent/10 cursor-pointer rounded-lg px-3 py-2'>
              Students
            </div>
            <div className='hover:bg-accent/10 cursor-pointer rounded-lg px-3 py-2'>
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
