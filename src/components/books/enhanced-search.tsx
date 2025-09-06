'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  X,
  Command
} from 'lucide-react';
import { useState, useRef, useCallback, useEffect, forwardRef } from 'react';

import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SearchSuggestion {
  id: string;
  type: 'recent' | 'suggestion' | 'category';
  text: string;
  category?: string;
  count?: number;
}

interface EnhancedSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  suggestions?: SearchSuggestion[];
  recentSearches?: string[];
  className?: string;
  disabled?: boolean;
}

export const EnhancedSearch = forwardRef<HTMLInputElement, EnhancedSearchProps>(({
  value,
  onChange,
  onSubmit,
  onFocus,
  onBlur,
  placeholder = "Search books, authors, or ISBN... (⌘K)",
  suggestions = [],
  recentSearches = [],
  className,
  disabled = false,
}, ref) => {
  const [focused, setFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const internalRef = useRef<HTMLInputElement>(null);
  const searchRef = ref ?? internalRef;
  
  // Keyboard navigation handler
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't interfere with typing in the input
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }
    
    // Global shortcut: Cmd/Ctrl + K to focus search
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      if ('current' in searchRef && searchRef.current) {
        searchRef.current.focus();
      }
      return;
    }
  }, [searchRef]);

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    const totalSuggestions = suggestions.length + recentSearches.length;
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedSuggestion(prev => 
          prev < totalSuggestions - 1 ? prev + 1 : -1
        );
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        setSelectedSuggestion(prev => 
          prev > -1 ? prev - 1 : totalSuggestions - 1
        );
        break;
        
      case 'Enter':
        event.preventDefault();
        if (selectedSuggestion >= 0) {
          const allItems = [...recentSearches, ...suggestions.map(s => s.text)];
          onChange(allItems[selectedSuggestion] ?? value);
          setShowSuggestions(false);
          setSelectedSuggestion(-1);
        } else if (value && onSubmit) {
          // If there's a search value and no suggestion selected, trigger submit
          onSubmit();
          setShowSuggestions(false);
          // Blur the input to exit search mode after submitting
          if ('current' in searchRef && searchRef.current) {
            searchRef.current.blur();
          }
        }
        break;
        
      case 'Escape':
        if (showSuggestions) {
          event.preventDefault();
          event.stopPropagation();
          setShowSuggestions(false);
          setSelectedSuggestion(-1);
        }
        // Don't clear the input or blur on Escape - just close suggestions
        // Let the event propagate if no suggestions are shown
        break;
    }
  };

  // Setup global keyboard handlers
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleFocus = (): void => {
    setFocused(true);
    setShowSuggestions(true);
    onFocus?.();
  };

  const handleBlur = (_event: React.FocusEvent<HTMLInputElement>): void => {
    // Delay to allow clicking on suggestions
    setTimeout(() => {
      setFocused(false);
      setShowSuggestions(false);
      setSelectedSuggestion(-1);
      onBlur?.();
    }, 200);
  };

  const handleSuggestionClick = (suggestion: string): void => {
    onChange(suggestion);
    setShowSuggestions(false);
    if ('current' in searchRef && searchRef.current) {
      searchRef.current.focus();
    }
  };

  const clearSearch = (): void => {
    onChange('');
    if ('current' in searchRef && searchRef.current) {
      searchRef.current.focus();
    }
  };


  return (
    <div className={cn("relative", className)}>
      {/* Main Search Input */}
      <div className={cn(
        "relative group",
        "transition-all duration-300 ease-out",
        focused && "scale-[1.02] z-50"
      )}>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/0 to-primary/20 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className={cn(
          "relative",
          "bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-lg",
          "transition-all duration-300 ease-out",
          "hover:bg-slate-200 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-500 hover:shadow-md",
          focused && [
            "bg-white dark:bg-slate-900 border-2 border-primary shadow-xl shadow-primary/20",
            "ring-2 ring-primary/20"
          ]
        )}>
          <Search className={cn(
            "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors duration-200",
            focused 
              ? "text-primary" 
              : "text-muted-foreground group-hover:text-foreground"
          )} />
          
          <Input
            ref={searchRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleInputKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            floating={false}
            className={cn(
              "pl-9 pr-16 h-9 border-0 bg-transparent text-sm",
              "text-foreground placeholder:text-muted-foreground",
              "focus-visible:ring-0 focus-visible:ring-offset-0"
            )}
          />
          
          {/* Right side controls */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {/* Clear/Exit button */}
            <AnimatePresence mode="wait">
              {(value || focused) && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => {
                    if (value) {
                      clearSearch();
                    } else if ('current' in searchRef && searchRef.current) {
                      searchRef.current.blur();
                      setShowSuggestions(false);
                    }
                  }}
                  aria-label={value ? "Clear search" : "Exit search"}
                  className={cn(
                    "p-1 rounded-md transition-colors",
                    "hover:bg-accent text-muted-foreground hover:text-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-primary/20"
                  )}
                >
                  <X className="h-3 w-3" />
                </motion.button>
              )}
            </AnimatePresence>
            
            {/* Escape hint when focused */}
            <AnimatePresence mode="wait">
              {focused && !value && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "hidden sm:flex items-center gap-1 px-2 py-1 rounded-md",
                    "bg-slate-100 dark:bg-slate-700 text-xs text-slate-600 dark:text-slate-400 font-mono"
                  )}
                >
                  <span>ESC</span>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Keyboard shortcut hint */}
            <AnimatePresence mode="wait">
              {!focused && !value && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "hidden sm:flex items-center gap-1 px-2 py-1 rounded-md",
                    "bg-accent/50 text-xs text-muted-foreground font-mono"
                  )}
                >
                  <Command className="h-3 w-3" />
                  <span>K</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Search Suggestions Panel */}
      <AnimatePresence>
        {showSuggestions && value.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            transition={{ 
              duration: 0.2,
              ease: [0.19, 1, 0.22, 1]
            }}
            className={cn(
              "absolute top-full mt-1 w-full z-50",
              "bg-white dark:bg-slate-800 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg",
              "p-2 max-h-32 overflow-y-auto"
            )}
          >
            {/* Dynamic Suggestions */}
            {suggestions.length > 0 && value && (
              <div className="space-y-1">
                {suggestions.slice(0, 3).map((suggestion, index) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion.text)}
                    className={cn(
                      "w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded text-left text-sm",
                      "text-slate-700 dark:text-slate-300",
                      "transition-colors duration-150",
                      "hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100",
                      selectedSuggestion === index && "bg-primary/10 text-primary"
                    )}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Search className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="truncate">{suggestion.text}</span>
                      {suggestion.category && (
                        <Badge variant="secondary" className="text-[10px] px-1 py-0">
                          {suggestion.category}
                        </Badge>
                      )}
                    </div>
                    {suggestion.count !== undefined && (
                      <span className="text-xs text-muted-foreground">
                        {suggestion.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

EnhancedSearch.displayName = 'EnhancedSearch';