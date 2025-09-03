import { BookOpen, Users, BarChart3 } from 'lucide-react';
import React from 'react';

import { BundleDebug } from '@/components/dev/bundle-debug';
import { EnvDebug } from '@/components/dev/env-debug';
import { PerformanceDebug } from '@/components/dev/performance-debug';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function Home(): React.JSX.Element {
  return (
    <div className='from-accent/5 via-background to-muted/10 min-h-screen bg-gradient-to-br relative'>
      {/* Theme Toggle - Fixed Position */}
      <div className='fixed top-6 right-6 z-50'>
        <ThemeToggle variant="button" size="default" />
      </div>
      
      <main className='container mx-auto px-4 py-16'>
        <div className='mb-16 text-center'>
          <div className='bg-accent/10 border-accent/20 mb-8 inline-flex h-20 w-20 items-center justify-center rounded-2xl border backdrop-blur-sm'>
            <BookOpen className='text-accent h-10 w-10' />
          </div>
          <h1 className='from-foreground to-muted-foreground mb-6 bg-gradient-to-r bg-clip-text text-5xl font-bold text-transparent'>
            Library Management System
          </h1>
          <p className='text-muted-foreground mx-auto max-w-2xl text-xl leading-relaxed pb-2'>
            A premium, modern library management solution with macOS-inspired
            design and advanced features for students, librarians, and
            administrators.
          </p>
        </div>

        <div className='mx-auto grid max-w-6xl gap-8 md:grid-cols-2 lg:grid-cols-3'>
          <div className='group bg-card/50 hover:bg-card/70 rounded-2xl border p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1'>
            <div className='mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 transition-transform group-hover:scale-110'>
              <BookOpen className='h-6 w-6 text-blue-500' />
            </div>
            <h3 className='mb-3 text-xl font-semibold'>Book Management</h3>
            <p className='text-muted-foreground pb-1'>
              Advanced cataloging system with cover uploads, ISBN lookup, and
              smart search capabilities.
            </p>
          </div>

          <div className='group bg-card/50 hover:bg-card/70 rounded-2xl border p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1'>
            <div className='mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10 transition-transform group-hover:scale-110'>
              <Users className='h-6 w-6 text-green-500' />
            </div>
            <h3 className='mb-3 text-xl font-semibold'>Student Portal</h3>
            <p className='text-muted-foreground pb-1'>
              Comprehensive student management with borrowing history,
              reservations, and fine tracking.
            </p>
          </div>

          <div className='group bg-card/50 hover:bg-card/70 rounded-2xl border p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1'>
            <div className='mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 transition-transform group-hover:scale-110'>
              <BarChart3 className='h-6 w-6 text-purple-500' />
            </div>
            <h3 className='mb-3 text-xl font-semibold'>Analytics & Reports</h3>
            <p className='text-muted-foreground pb-1'>
              Detailed insights with year-based reporting, popular books
              analysis, and activity tracking.
            </p>
          </div>
        </div>

        <div className='mt-16 text-center'>
          <div className='bg-muted/50 text-muted-foreground inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm'>
            <div className='h-2 w-2 animate-pulse rounded-full bg-green-500'></div>
            System Status: Development in Progress
          </div>
        </div>
      </main>
      <EnvDebug />
      <PerformanceDebug />
      <BundleDebug />
    </div>
  );
}
