import { BookOpen, Users, Clock, TrendingUp } from 'lucide-react';
import React from 'react';

export default function DashboardPage(): React.JSX.Element {
  return (
    <div className='p-8'>
      <div className='mb-8'>
        <h1 className='mb-2 text-3xl font-bold'>Dashboard</h1>
        <p className='text-muted-foreground'>
          Welcome back! Here&apos;s an overview of your library.
        </p>
      </div>

      <div className='mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
        <div className='bg-card/50 rounded-2xl border p-6 backdrop-blur-sm'>
          <div className='mb-4 flex items-center justify-between'>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10'>
              <BookOpen className='h-5 w-5 text-blue-500' />
            </div>
            <span className='text-2xl font-bold'>2,847</span>
          </div>
          <div className='text-muted-foreground text-sm'>Total Books</div>
        </div>

        <div className='bg-card/50 rounded-2xl border p-6 backdrop-blur-sm'>
          <div className='mb-4 flex items-center justify-between'>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10'>
              <Users className='h-5 w-5 text-green-500' />
            </div>
            <span className='text-2xl font-bold'>1,234</span>
          </div>
          <div className='text-muted-foreground text-sm'>Active Students</div>
        </div>

        <div className='bg-card/50 rounded-2xl border p-6 backdrop-blur-sm'>
          <div className='mb-4 flex items-center justify-between'>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10'>
              <Clock className='h-5 w-5 text-orange-500' />
            </div>
            <span className='text-2xl font-bold'>156</span>
          </div>
          <div className='text-muted-foreground text-sm'>Books Borrowed</div>
        </div>

        <div className='bg-card/50 rounded-2xl border p-6 backdrop-blur-sm'>
          <div className='mb-4 flex items-center justify-between'>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10'>
              <TrendingUp className='h-5 w-5 text-purple-500' />
            </div>
            <span className='text-2xl font-bold'>+12%</span>
          </div>
          <div className='text-muted-foreground text-sm'>This Month</div>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        <div className='bg-card/50 rounded-2xl border p-6 backdrop-blur-sm'>
          <h3 className='mb-4 text-lg font-semibold'>Recent Activity</h3>
          <div className='space-y-3'>
            <div className='hover:bg-muted/20 flex items-center gap-3 rounded-lg p-3'>
              <div className='h-2 w-2 rounded-full bg-green-500'></div>
              <div className='flex-1'>
                <div className='text-sm font-medium'>Book returned</div>
                <div className='text-muted-foreground text-xs'>
                  &quot;The Great Gatsby&quot; by John Doe
                </div>
              </div>
              <div className='text-muted-foreground text-xs'>2 min ago</div>
            </div>
            <div className='hover:bg-muted/20 flex items-center gap-3 rounded-lg p-3'>
              <div className='h-2 w-2 rounded-full bg-blue-500'></div>
              <div className='flex-1'>
                <div className='text-sm font-medium'>New book added</div>
                <div className='text-muted-foreground text-xs'>
                  &quot;Learning React&quot; by Jane Smith
                </div>
              </div>
              <div className='text-muted-foreground text-xs'>15 min ago</div>
            </div>
            <div className='hover:bg-muted/20 flex items-center gap-3 rounded-lg p-3'>
              <div className='h-2 w-2 rounded-full bg-orange-500'></div>
              <div className='flex-1'>
                <div className='text-sm font-medium'>Overdue reminder sent</div>
                <div className='text-muted-foreground text-xs'>
                  To 3 students
                </div>
              </div>
              <div className='text-muted-foreground text-xs'>1 hour ago</div>
            </div>
          </div>
        </div>

        <div className='bg-card/50 rounded-2xl border p-6 backdrop-blur-sm'>
          <h3 className='mb-4 text-lg font-semibold'>Popular Books</h3>
          <div className='space-y-3'>
            <div className='hover:bg-muted/20 flex items-center gap-3 rounded-lg p-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-sm font-bold text-white'>
                1
              </div>
              <div className='flex-1'>
                <div className='text-sm font-medium'>The Great Gatsby</div>
                <div className='text-muted-foreground text-xs'>
                  Borrowed 24 times
                </div>
              </div>
            </div>
            <div className='hover:bg-muted/20 flex items-center gap-3 rounded-lg p-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-green-500 to-blue-500 text-sm font-bold text-white'>
                2
              </div>
              <div className='flex-1'>
                <div className='text-sm font-medium'>To Kill a Mockingbird</div>
                <div className='text-muted-foreground text-xs'>
                  Borrowed 18 times
                </div>
              </div>
            </div>
            <div className='hover:bg-muted/20 flex items-center gap-3 rounded-lg p-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-sm font-bold text-white'>
                3
              </div>
              <div className='flex-1'>
                <div className='text-sm font-medium'>1984</div>
                <div className='text-muted-foreground text-xs'>
                  Borrowed 15 times
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
