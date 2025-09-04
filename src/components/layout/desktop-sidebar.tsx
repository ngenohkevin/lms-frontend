'use client';

import { BookOpen, Users, Clock, TrendingUp, Home, Settings, HelpCircle, FileText } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

const navigationItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'Books',
    href: '/books',
    icon: BookOpen,
  },
  {
    title: 'Students',
    href: '/students',
    icon: Users,
  },
  {
    title: 'Transactions',
    href: '/transactions',
    icon: Clock,
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: TrendingUp,
  },
];

const bottomItems = [
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
  {
    title: 'Help & Support',
    href: '/help',
    icon: HelpCircle,
  },
  {
    title: 'Documentation',
    href: '/docs',
    icon: FileText,
  },
];

export function DesktopSidebar(): React.JSX.Element {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white dark:bg-card/50 backdrop-blur-sm border-r border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none transition-all duration-300 ease-in-out">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-lg font-bold text-foreground">LMS</div>
            <div className="text-xs text-muted-foreground">Library System</div>
          </div>
        </div>
      </div>
      
      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-4">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:pl-4"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  !isActive && "group-hover:scale-110"
                )} />
                {item.title}
              </Link>
            );
          })}
        </div>
      </nav>
      
      {/* Bottom Section */}
      <div className="border-t border-gray-100 dark:border-white/5 p-4">
        <div className="space-y-1">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs font-medium">{item.title}</span>
              </Link>
            );
          })}
        </div>
        
        {/* Version info */}
        <div className="mt-4 px-3 py-2">
          <p className="text-[10px] text-muted-foreground/60">
            LMS v1.0.0
          </p>
        </div>
      </div>
    </aside>
  );
}