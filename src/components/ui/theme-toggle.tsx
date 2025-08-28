'use client'

import React from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'
import { GlassButton } from './glass-button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  variant?: 'icon' | 'full'
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

export function ThemeToggle({ 
  variant = 'icon', 
  size = 'default',
  className 
}: ThemeToggleProps) {
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <GlassButton
        variant="ghost"
        size={variant === 'icon' ? 'icon' : size}
        className={cn('animate-pulse', className)}
        disabled
      >
        <Sun className="h-4 w-4" />
        <span className="sr-only">Loading theme...</span>
      </GlassButton>
    )
  }

  const getCurrentTheme = () => {
    if (theme === 'system') {
      return systemTheme === 'dark' ? 'dark' : 'light'
    }
    return theme
  }

  const currentTheme = getCurrentTheme()

  if (variant === 'full') {
    return (
      <div className={cn('flex items-center gap-1 p-1 glass-card rounded-full', className)}>
        <GlassButton
          variant={theme === 'light' ? 'secondary' : 'ghost'}
          size="icon-sm"
          onClick={() => setTheme('light')}
          className={cn(
            'transition-all duration-200',
            theme === 'light' && 'shadow-sm'
          )}
        >
          <Sun className="h-3.5 w-3.5" />
          <span className="sr-only">Light mode</span>
        </GlassButton>
        
        <GlassButton
          variant={theme === 'system' ? 'secondary' : 'ghost'}
          size="icon-sm"
          onClick={() => setTheme('system')}
          className={cn(
            'transition-all duration-200',
            theme === 'system' && 'shadow-sm'
          )}
        >
          <Monitor className="h-3.5 w-3.5" />
          <span className="sr-only">System mode</span>
        </GlassButton>
        
        <GlassButton
          variant={theme === 'dark' ? 'secondary' : 'ghost'}
          size="icon-sm"
          onClick={() => setTheme('dark')}
          className={cn(
            'transition-all duration-200',
            theme === 'dark' && 'shadow-sm'
          )}
        >
          <Moon className="h-3.5 w-3.5" />
          <span className="sr-only">Dark mode</span>
        </GlassButton>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <GlassButton
          variant="ghost"
          size={variant === 'icon' ? 'icon' : size}
          className={cn('relative overflow-hidden', className)}
        >
          <Sun className={cn(
            'h-4 w-4 transition-all duration-300 absolute',
            currentTheme === 'dark' ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
          )} />
          <Moon className={cn(
            'h-4 w-4 transition-all duration-300 absolute',
            currentTheme === 'light' ? '-rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
          )} />
          <span className="sr-only">Toggle theme</span>
        </GlassButton>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="glass-card border-glass-border min-w-[140px]"
      >
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className={cn(
            'cursor-pointer flex items-center gap-2',
            theme === 'light' && 'bg-accent-light text-accent'
          )}
        >
          <Sun className="h-4 w-4" />
          Light
          {theme === 'light' && (
            <div className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className={cn(
            'cursor-pointer flex items-center gap-2',
            theme === 'dark' && 'bg-accent-light text-accent'
          )}
        >
          <Moon className="h-4 w-4" />
          Dark
          {theme === 'dark' && (
            <div className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className={cn(
            'cursor-pointer flex items-center gap-2',
            theme === 'system' && 'bg-accent-light text-accent'
          )}
        >
          <Monitor className="h-4 w-4" />
          System
          {theme === 'system' && (
            <div className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}