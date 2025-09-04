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
        "relative flex h-8 w-8 items-center justify-center rounded-md",
        "bg-transparent transition-all duration-300",
        "hover:bg-accent/10 focus:outline-none focus:ring-2 focus:ring-accent/50",
        "active:scale-95 lg:hidden",
        className
      )}
      aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
      aria-expanded={isOpen}
    >
      <div className="relative flex h-4 w-5 flex-col items-center justify-center">
        {/* Top line */}
        <span
          className={cn(
            "absolute block h-[2px] w-5 bg-current transform transition-all duration-300 ease-out",
            isOpen 
              ? "rotate-45 translate-y-0" 
              : "-translate-y-[6px] group-hover:w-4"
          )}
        />
        {/* Middle line */}
        <span
          className={cn(
            "absolute block h-[2px] bg-current transform transition-all duration-300 ease-out",
            isOpen 
              ? "w-0 opacity-0" 
              : "w-5 opacity-100 group-hover:w-3"
          )}
        />
        {/* Bottom line */}
        <span
          className={cn(
            "absolute block h-[2px] w-5 bg-current transform transition-all duration-300 ease-out",
            isOpen 
              ? "-rotate-45 translate-y-0" 
              : "translate-y-[6px] group-hover:w-4"
          )}
        />
      </div>
      
      {/* Ripple effect on click */}
      <span 
        className={cn(
          "absolute inset-0 rounded-md",
          "bg-gradient-to-r from-accent/20 to-accent/10",
          "opacity-0 scale-0",
          "transition-all duration-500",
          isOpen && "animate-ping opacity-100 scale-100"
        )}
        style={{ animationIterationCount: '1' }}
      />
    </button>
  );
}