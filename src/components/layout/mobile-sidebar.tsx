'use client';

import { BookOpen, Users, Clock, TrendingUp, X, Home, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { cn } from '@/lib/utils';

const navigationItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    title: 'Books',
    href: '/books',
    icon: BookOpen,
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    title: 'Students',
    href: '/students',
    icon: Users,
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    title: 'Transactions',
    href: '/transactions',
    icon: Clock,
    gradient: 'from-orange-500 to-red-500',
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: TrendingUp,
    gradient: 'from-indigo-500 to-purple-500',
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    gradient: 'from-gray-500 to-slate-500',
  },
];

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps): React.JSX.Element {
  const pathname = usePathname();

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop with blur effect */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-md transition-all duration-500 ease-out lg:hidden",
          isOpen 
            ? "opacity-100 visible" 
            : "opacity-0 invisible pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Sidebar with sliding animation */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-72 max-w-[80vw] flex-col",
          "bg-gradient-to-b from-card via-card/95 to-card/90",
          "border-r border-border/50 shadow-2xl",
          "transform transition-all duration-500 ease-[cubic-bezier(0.77,0,0.175,1)]",
          "lg:hidden",
          isOpen 
            ? "translate-x-0" 
            : "-translate-x-full"
        )}
      >
        {/* Header with logo and close button */}
        <div className="relative flex items-center justify-between p-5 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center animate-pulse">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-foreground">LMS</div>
              <div className="text-xs text-muted-foreground">Library System</div>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg",
              "bg-muted/50 hover:bg-muted transition-all duration-200",
              "hover:rotate-90 active:scale-90"
            )}
            aria-label="Close navigation"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        
        {/* Navigation with stagger animation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-1">
            {navigationItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-4 py-3",
                    "text-sm font-medium transition-all duration-300",
                    "animate-in slide-in-from-left fill-mode-both",
                    isActive
                      ? "bg-gradient-to-r text-white shadow-lg"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:pl-5",
                    isActive && item.gradient
                  )}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animationDuration: '300ms'
                  }}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r opacity-90" 
                      style={{
                        backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
                      }}
                    />
                  )}
                  
                  <Icon className={cn(
                    "h-5 w-5 relative z-10 transition-transform duration-300",
                    !isActive && "group-hover:scale-110"
                  )} />
                  <span className="relative z-10">{item.title}</span>
                  
                  {/* Hover effect */}
                  {!isActive && (
                    <div 
                      className={cn(
                        "absolute inset-0 rounded-xl bg-gradient-to-r opacity-0",
                        "group-hover:opacity-10 transition-opacity duration-300",
                        item.gradient
                      )}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
        
        {/* Footer with profile and logout */}
        <div className="border-t border-border/50 p-4 space-y-3">
          {/* Profile section */}
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                <span className="text-xs font-bold text-white">AU</span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-card rounded-full animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">Admin User</div>
              <div className="text-xs text-muted-foreground">admin@library.edu</div>
            </div>
          </div>
          
          {/* Logout button */}
          <button className={cn(
            "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg",
            "text-sm font-medium text-muted-foreground",
            "bg-muted/30 hover:bg-destructive/10 hover:text-destructive",
            "transition-all duration-200"
          )}>
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}