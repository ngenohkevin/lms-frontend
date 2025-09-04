import { BookOpen, Users, Clock, TrendingUp, AlertCircle, Plus } from 'lucide-react';
import React from 'react';

import { cn } from '@/lib/utils';

const stats = [
  {
    title: 'Total Books',
    value: '2,847',
    icon: BookOpen,
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    change: '+5.2%',
    changeType: 'positive' as const,
  },
  {
    title: 'Active Students',
    value: '1,234',
    icon: Users,
    iconColor: 'text-green-500',
    bgColor: 'bg-green-500/10',
    change: '+12%',
    changeType: 'positive' as const,
  },
  {
    title: 'Books Borrowed',
    value: '156',
    icon: Clock,
    iconColor: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    change: '-2.1%',
    changeType: 'negative' as const,
  },
  {
    title: 'Overdue Books',
    value: '23',
    icon: AlertCircle,
    iconColor: 'text-red-500',
    bgColor: 'bg-red-500/10',
    change: '+8%',
    changeType: 'negative' as const,
  },
];

const recentActivities = [
  {
    id: 1,
    type: 'return',
    title: 'Book returned',
    description: '"The Great Gatsby" by John Doe',
    time: '2 min ago',
    color: 'bg-green-500',
  },
  {
    id: 2,
    type: 'add',
    title: 'New book added',
    description: '"Learning React" by Jane Smith',
    time: '15 min ago',
    color: 'bg-blue-500',
  },
  {
    id: 3,
    type: 'reminder',
    title: 'Overdue reminder sent',
    description: 'To 3 students',
    time: '1 hour ago',
    color: 'bg-orange-500',
  },
  {
    id: 4,
    type: 'borrow',
    title: 'Book borrowed',
    description: '"To Kill a Mockingbird" by Sarah Wilson',
    time: '2 hours ago',
    color: 'bg-purple-500',
  },
];

const popularBooks = [
  {
    id: 1,
    title: 'The Great Gatsby',
    borrowCount: 24,
    rank: 1,
  },
  {
    id: 2,
    title: 'To Kill a Mockingbird',
    borrowCount: 18,
    rank: 2,
  },
  {
    id: 3,
    title: '1984',
    borrowCount: 15,
    rank: 3,
  },
  {
    id: 4,
    title: 'Pride and Prejudice',
    borrowCount: 12,
    rank: 4,
  },
];

export default function DashboardPage(): React.JSX.Element {
  return (
    <div className='flex-1 space-y-4 sm:space-y-6 p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500'>
      {/* Header */}
      <div className='space-y-2 animate-in slide-in-from-top duration-500'>
        <h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight'>
          Dashboard
        </h1>
        <p className='text-sm sm:text-base text-muted-foreground'>
          Welcome back! Here&apos;s an overview of your library management system.
        </p>
      </div>

      {/* Stats Grid - Mobile First Responsive */}
      <div className='grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-in slide-in-from-bottom duration-500 delay-100'>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className={cn(
                'group relative overflow-hidden rounded-xl',
                'bg-white dark:bg-card/50',
                'border border-gray-200 dark:border-white/10',
                'p-3 sm:p-4',
                'shadow-sm',
                'transition-all duration-300 ease-out',
                'hover:shadow-lg hover:scale-[1.02] hover:border-gray-300 dark:hover:border-white/20',
                'dark:shadow-md dark:shadow-black/10 dark:hover:shadow-xl'
              )}
            >
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div className={cn(
                    'flex items-center justify-center rounded-md shrink-0',
                    'h-8 w-8 sm:h-9 sm:w-9',
                    stat.bgColor
                  )}>
                    <Icon className={cn('h-4 w-4 sm:h-5 sm:w-5', stat.iconColor)} />
                  </div>
                  <div className='flex flex-col space-y-0.5'>
                    <p className='text-xs text-gray-500 dark:text-muted-foreground font-medium'>
                      {stat.title}
                    </p>
                    <p className='text-lg sm:text-xl font-bold text-gray-900 dark:text-foreground'>
                      {stat.value}
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    'inline-flex items-center text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 rounded-md',
                    stat.changeType === 'positive'
                      ? 'text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-900/20'
                      : 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-900/20'
                  )}
                >
                  {stat.changeType === 'positive' ? '↗' : '↘'} {stat.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content Grid - Mobile First Responsive */}
      <div className='grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-3 animate-in slide-in-from-bottom duration-500 delay-200'>
        {/* Recent Activity - Takes full width on mobile, 2/3 on xl */}
        <div className='xl:col-span-2'>
          <div className='rounded-xl bg-white dark:bg-card/50 backdrop-blur-sm border border-gray-200 dark:border-white/10 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300 dark:hover:border-white/20 dark:shadow-lg dark:shadow-black/20'>
            <div className='flex items-center justify-between border-b border-gray-100 dark:border-white/10 p-4 sm:p-5'>
              <div>
                <h3 className='text-base sm:text-lg font-semibold text-foreground'>Recent Activity</h3>
                <p className='text-xs sm:text-sm text-muted-foreground mt-1'>Latest library transactions</p>
              </div>
              <button className='flex h-7 w-7 items-center justify-center rounded-md bg-muted/50 text-muted-foreground transition-colors hover:bg-muted'>
                <Plus className='h-3.5 w-3.5' />
              </button>
            </div>
            <div className='p-3 sm:p-4'>
              <div className='space-y-3'>
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className='group flex items-start gap-3 rounded-md p-2.5 transition-all duration-200 hover:bg-muted/30 hover:pl-3'
                  >
                    <div className={cn('h-2 w-2 mt-1.5 rounded-full', activity.color)} />
                    <div className='min-w-0 flex-1 space-y-1'>
                      <div className='flex items-center justify-between'>
                        <p className='text-sm font-medium text-foreground'>{activity.title}</p>
                        <span className='text-xs text-muted-foreground whitespace-nowrap'>
                          {activity.time}
                        </span>
                      </div>
                      <p className='text-xs text-muted-foreground'>{activity.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Popular Books - Takes full width on mobile, 1/3 on xl */}
        <div className='xl:col-span-1'>
          <div className='rounded-xl bg-white dark:bg-card/50 backdrop-blur-sm border border-gray-200 dark:border-white/10 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300 dark:hover:border-white/20 dark:shadow-lg dark:shadow-black/20'>
            <div className='border-b border-border/20 p-4 sm:p-5'>
              <h3 className='text-base sm:text-lg font-semibold text-foreground'>Popular Books</h3>
              <p className='text-xs sm:text-sm text-muted-foreground mt-1'>Most borrowed this month</p>
            </div>
            <div className='p-3 sm:p-4'>
              <div className='space-y-3'>
                {popularBooks.map((book, index) => (
                  <div
                    key={book.id}
                    className='group flex items-center gap-3 rounded-md p-2.5 transition-all duration-200 hover:bg-muted/30 hover:pl-3'
                  >
                    <div className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white',
                      index === 0 && 'bg-gradient-to-r from-yellow-400 to-orange-500',
                      index === 1 && 'bg-gradient-to-r from-gray-400 to-gray-600', 
                      index === 2 && 'bg-gradient-to-r from-orange-400 to-red-500',
                      index >= 3 && 'bg-gradient-to-r from-blue-500 to-purple-600'
                    )}>
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index >= 3 && book.rank}
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='text-sm font-medium text-foreground line-clamp-1'>
                        {book.title}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {book.borrowCount} borrows
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions - Mobile First Responsive */}
      <div className='grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4 animate-in slide-in-from-bottom duration-500 delay-300'>
        {[
          { 
            title: 'Add Book', 
            icon: BookOpen, 
            color: 'from-blue-500 via-blue-600 to-cyan-500',
            description: 'Add new book to library'
          },
          { 
            title: 'New Student', 
            icon: Users, 
            color: 'from-green-500 via-green-600 to-emerald-500',
            description: 'Register new student'
          },
          { 
            title: 'Borrow Book', 
            icon: Clock, 
            color: 'from-orange-500 via-orange-600 to-yellow-500',
            description: 'Process book loan'
          },
          { 
            title: 'Reports', 
            icon: TrendingUp, 
            color: 'from-purple-500 via-purple-600 to-pink-500',
            description: 'View analytics'
          },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.title}
              className={cn(
                'group relative overflow-hidden rounded-xl text-center',
                'bg-white dark:bg-card/50',
                'border border-gray-200 dark:border-white/10',
                'p-4 sm:p-5',
                'shadow-sm',
                'transition-all duration-300 ease-out',
                'hover:shadow-lg hover:scale-[1.02] hover:border-gray-300 dark:hover:border-white/20',
                'dark:shadow-lg dark:shadow-black/20 dark:hover:shadow-2xl',
                'active:scale-[0.98]'
              )}
            >
              <div className='flex flex-col items-center gap-2 sm:gap-3'>
                <div className={cn(
                  'flex items-center justify-center rounded-md bg-gradient-to-r',
                  'h-8 w-8 sm:h-10 sm:w-10',
                  action.color
                )}>
                  <Icon className='h-4 w-4 sm:h-5 sm:w-5 text-white' />
                </div>
                <div className='space-y-0.5'>
                  <span className='text-xs sm:text-sm font-semibold text-foreground'>
                    {action.title}
                  </span>
                  <p className='text-xs text-muted-foreground'>
                    {action.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
