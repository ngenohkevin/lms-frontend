'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import * as React from 'react';

import { Button } from './button';

interface ThemeToggleProps {
  variant?: 'button' | 'icon';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function ThemeToggle({ variant = 'icon', size = 'icon' }: ThemeToggleProps): React.JSX.Element {
  const { theme, setTheme } = useTheme() as { theme: string | undefined; setTheme: (theme: string) => void };
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size={size} disabled className="bg-transparent text-foreground p-2 border-none focus:ring-0 focus:outline-none focus-visible:ring-0">
        <Monitor className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    );
  }

  const toggleTheme = (): void => {
    // Add transition class before theme change
    document.documentElement.classList.add('theme-transition');
    
    if (theme === 'system') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('system');
    }
    
    // Remove transition class after animation
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 500);
  };

  const getIcon = (): React.ReactElement => {
    if (theme === 'system') {
      return <Monitor className="h-[1.2rem] w-[1.2rem]" />;
    } else if (theme === 'light') {
      return <Sun className="h-[1.2rem] w-[1.2rem]" />;
    } else {
      return <Moon className="h-[1.2rem] w-[1.2rem]" />;
    }
  };

  const getLabel = (): string => {
    if (theme === 'system') return 'System';
    if (theme === 'light') return 'Light';
    return 'Dark';
  };

  if (variant === 'button') {
    return (
      <Button
        variant="ghost"
        size={size}
        onClick={toggleTheme}
        className="bg-transparent hover:bg-transparent text-foreground p-2 border-none focus:ring-0 focus:outline-none focus-visible:ring-0"
        title={`Current theme: ${getLabel()}. Click to toggle.`}
      >
        {getIcon()}
        <span className="sr-only">Toggle theme (current: {getLabel()})</span>
      </Button>
    );
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      className="bg-transparent hover:bg-transparent text-foreground p-2 border-none focus:ring-0 focus:outline-none focus-visible:ring-0"
      title={`Current theme: ${getLabel()}. Click to toggle.`}
    >
      {getIcon()}
      <span className="sr-only">Toggle theme (current: {getLabel()})</span>
    </Button>
  );
}