'use client'

import React from 'react'
import { Search, X, Loader2, Command } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Input } from './input'
import { GlassButton } from './glass-button'

const searchInputVariants = cva(
  [
    'relative flex items-center',
    'glass-card rounded-input',
    'transition-all duration-200 ease-out',
    'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
    'focus-within:shadow-md focus-within:border-accent-light',
  ],
  {
    variants: {
      size: {
        sm: 'h-8',
        default: 'h-10',
        lg: 'h-12',
      },
      variant: {
        default: 'bg-glass-background border-glass-border',
        solid: 'bg-surface border-border',
        outline: 'bg-transparent border-2 border-border',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
  }
)

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof searchInputVariants> {
  onClear?: () => void
  loading?: boolean
  showShortcut?: boolean
  shortcut?: string
  onSearch?: (query: string) => void
  debounceMs?: number
  suggestions?: string[]
  onSuggestionSelect?: (suggestion: string) => void
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      className,
      variant,
      size,
      value = '',
      onChange,
      onClear,
      loading,
      showShortcut = true,
      shortcut = '⌘K',
      onSearch,
      debounceMs = 300,
      suggestions = [],
      onSuggestionSelect,
      placeholder = 'Search...',
      disabled,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState(value as string)
    const [showSuggestions, setShowSuggestions] = React.useState(false)
    const [highlightedIndex, setHighlightedIndex] = React.useState(-1)
    const debounceRef = React.useRef<NodeJS.Timeout>()
    const inputRef = React.useRef<HTMLInputElement>(null)
    const suggestionsRef = React.useRef<HTMLDivElement>(null)

    // Combine refs
    React.useImperativeHandle(ref, () => inputRef.current!)

    // Update internal value when prop changes
    React.useEffect(() => {
      setInternalValue(value as string)
    }, [value])

    // Debounced search
    React.useEffect(() => {
      if (onSearch && debounceMs > 0) {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current)
        }
        
        debounceRef.current = setTimeout(() => {
          onSearch(internalValue)
        }, debounceMs)

        return () => {
          if (debounceRef.current) {
            clearTimeout(debounceRef.current)
          }
        }
      }
    }, [internalValue, onSearch, debounceMs])

    // Filter suggestions based on input
    const filteredSuggestions = React.useMemo(() => {
      if (!internalValue.trim()) return []
      return suggestions.filter((suggestion) =>
        suggestion.toLowerCase().includes(internalValue.toLowerCase())
      ).slice(0, 5) // Limit to 5 suggestions
    }, [suggestions, internalValue])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setInternalValue(newValue)
      onChange?.(e)
      setShowSuggestions(newValue.length > 0 && filteredSuggestions.length > 0)
      setHighlightedIndex(-1)
    }

    const handleClear = () => {
      setInternalValue('')
      onClear?.()
      setShowSuggestions(false)
      inputRef.current?.focus()
      
      // Trigger onChange with empty value
      const syntheticEvent = {
        target: { value: '' }
      } as React.ChangeEvent<HTMLInputElement>
      onChange?.(syntheticEvent)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!showSuggestions || filteredSuggestions.length === 0) {
        if (e.key === 'Enter' && onSearch) {
          onSearch(internalValue)
        }
        return
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setHighlightedIndex((prev) =>
            prev < filteredSuggestions.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredSuggestions.length - 1
          )
          break
        case 'Enter':
          e.preventDefault()
          if (highlightedIndex >= 0) {
            handleSuggestionClick(filteredSuggestions[highlightedIndex])
          } else {
            onSearch?.(internalValue)
            setShowSuggestions(false)
          }
          break
        case 'Escape':
          setShowSuggestions(false)
          setHighlightedIndex(-1)
          inputRef.current?.blur()
          break
      }
    }

    const handleSuggestionClick = (suggestion: string) => {
      setInternalValue(suggestion)
      onSuggestionSelect?.(suggestion)
      setShowSuggestions(false)
      setHighlightedIndex(-1)
      
      // Trigger onChange with suggestion value
      const syntheticEvent = {
        target: { value: suggestion }
      } as React.ChangeEvent<HTMLInputElement>
      onChange?.(syntheticEvent)
    }

    // Global keyboard shortcut
    React.useEffect(() => {
      const handleGlobalKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
          e.preventDefault()
          inputRef.current?.focus()
          inputRef.current?.select()
        }
      }

      document.addEventListener('keydown', handleGlobalKeyDown)
      return () => document.removeEventListener('keydown', handleGlobalKeyDown)
    }, [])

    // Click outside to close suggestions
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          suggestionsRef.current &&
          !suggestionsRef.current.contains(event.target as Node) &&
          !inputRef.current?.contains(event.target as Node)
        ) {
          setShowSuggestions(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
      <div className="relative">
        <div className={cn(searchInputVariants({ variant, size }), className)}>
          {/* Search Icon */}
          <div className="flex items-center justify-center pl-3">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-text-secondary" />
            ) : (
              <Search className="h-4 w-4 text-text-secondary" />
            )}
          </div>

          {/* Input */}
          <Input
            ref={inputRef}
            value={internalValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (internalValue.length > 0 && filteredSuggestions.length > 0) {
                setShowSuggestions(true)
              }
            }}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              'flex-1 border-0 bg-transparent px-3 py-0 shadow-none',
              'focus-visible:ring-0 focus-visible:ring-offset-0',
              'placeholder:text-text-tertiary'
            )}
            {...props}
          />

          {/* Clear Button */}
          {internalValue && !loading && (
            <GlassButton
              variant="ghost"
              size="icon-sm"
              onClick={handleClear}
              className="mr-1 h-6 w-6 hover:bg-error-light hover:text-error"
              tabIndex={-1}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Clear search</span>
            </GlassButton>
          )}

          {/* Keyboard Shortcut */}
          {showShortcut && !internalValue && (
            <div className="flex items-center pr-3">
              <div className="flex items-center gap-1 rounded border border-border px-1.5 py-0.5 text-xs text-text-tertiary">
                <Command className="h-3 w-3" />
                <span>K</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className={cn(
              'absolute top-full left-0 right-0 z-50 mt-1',
              'glass-card border-glass-border rounded-md shadow-lg',
              'max-h-60 overflow-auto'
            )}
          >
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                className={cn(
                  'w-full text-left px-3 py-2 text-sm',
                  'hover:bg-accent-light hover:text-accent',
                  'focus:bg-accent-light focus:text-accent focus:outline-none',
                  'transition-colors duration-150',
                  highlightedIndex === index && 'bg-accent-light text-accent'
                )}
              >
                <div className="flex items-center gap-2">
                  <Search className="h-3 w-3 opacity-50" />
                  {suggestion}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }
)
SearchInput.displayName = 'SearchInput'

export { SearchInput, searchInputVariants }