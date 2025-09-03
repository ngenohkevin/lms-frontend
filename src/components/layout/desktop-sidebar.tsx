'use client';

import { BookOpen, Users, Clock, TrendingUp, Home, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { ThemeToggle } from '@/components/ui/theme-toggle';
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
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function DesktopSidebar(): React.JSX.Element {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-card border-r border-border shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="text-xl font-bold text-foreground">LMS Dashboard</div>
        <div className="text-sm text-muted-foreground mt-1">Library Management</div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-6 py-4">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.title}
              </Link>
            );
          })}
        </div>
      </nav>
      
      {/* Footer */}
      <div className="border-t border-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-foreground truncate">Admin User</div>
            <div className="text-xs text-muted-foreground truncate">admin@library.edu</div>
          </div>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <span className="text-xs text-muted-foreground">Theme</span>
          <ThemeToggle variant="button" size="sm" />
        </div>
      </div>
    </aside>
  );
}