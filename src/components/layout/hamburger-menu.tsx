'use client';

import { cn } from '@/lib/utils';

interface HamburgerMenuProps {
  onClick: () => void;
  isOpen?: boolean;
  className?: string;
}

export function HamburgerMenu({ onClick, isOpen = false, className }: HamburgerMenuProps): React.JSX.Element {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center rounded-lg bg-card border border-border shadow-sm transition-all duration-300 hover:bg-accent/10 hover:shadow-md lg:hidden",
        isOpen && "bg-accent/20",
        className
      )}
      aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
      aria-expanded={isOpen}
    >
      <div className="flex h-5 w-5 flex-col items-center justify-center">
        {/* Top line */}
        <span
          className={cn(
            "absolute h-0.5 w-5 bg-foreground transition-all duration-300 ease-in-out",
            isOpen ? "rotate-45" : "-translate-y-1.5"
          )}
        />
        {/* Middle line */}
        <span
          className={cn(
            "absolute h-0.5 w-5 bg-foreground transition-all duration-300 ease-in-out",
            isOpen ? "opacity-0" : "opacity-100"
          )}
        />
        {/* Bottom line */}
        <span
          className={cn(
            "absolute h-0.5 w-5 bg-foreground transition-all duration-300 ease-in-out",
            isOpen ? "-rotate-45" : "translate-y-1.5"
          )}
        />
      </div>
    </button>
  );
}