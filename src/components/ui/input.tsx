import * as React from 'react';

import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  floating?: boolean;
  variant?: 'default' | 'glass' | 'minimal';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type, 
    label, 
    error, 
    leftIcon, 
    rightIcon, 
    floating = true,
    variant = 'glass',
    placeholder,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(ref, () => inputRef.current!);

    React.useEffect(() => {
      // Check value on mount and when props change
      if (props.value !== undefined) {
        setHasValue(!!props.value);
      } else if (props.defaultValue !== undefined) {
        setHasValue(!!props.defaultValue);
      } else if (inputRef.current) {
        setHasValue(!!inputRef.current.value);
      }
    }, [props.value, props.defaultValue]);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>): void => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>): void => {
      setIsFocused(false);
      setHasValue(!!e.target.value);
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
      setHasValue(!!e.target.value);
      props.onChange?.(e);
    };

    const baseClasses = cn(
      // Base styles - no color transitions to prevent text visibility issues
      'relative w-full transition-[border,background,transform,shadow] duration-300 ease-out',
      'text-base leading-6 text-left',
      'border border-solid outline-none',
      
      // Focus styles
      'focus:ring-4 focus:ring-opacity-20',
      
      // Disabled styles
      'disabled:opacity-50 disabled:cursor-not-allowed',
      
      // Autofill styles - prevent browser from overriding colors using CSS custom properties
      'autofill:shadow-[inset_0_0_0_1000px_hsl(var(--background))]',
      'autofill:[-webkit-text-fill-color:hsl(var(--foreground))!important]',
      
      // Variant styles
      {
        // Glass variant (default) - Fixed text visibility with strong contrast
        'bg-card/95 backdrop-blur-md border-border/30 text-foreground': variant === 'glass' && !error,
        'placeholder:text-muted-foreground/70': variant === 'glass' && !error,
        'focus:bg-card/98 focus:border-primary/50 focus:ring-primary/20': variant === 'glass' && !error,
        'dark:bg-card/95 dark:border-border/30': variant === 'glass' && !error,
        'dark:focus:bg-card/98 dark:focus:border-primary/50': variant === 'glass' && !error,
        
        // Default variant
        'bg-background border-border text-foreground placeholder:text-muted-foreground': variant === 'default' && !error,
        'focus:border-primary focus:ring-primary': variant === 'default' && !error,
        'dark:bg-background dark:border-border': variant === 'default' && !error,
        
        // Minimal variant
        'bg-transparent border-0 border-b-2 border-b-border rounded-none': variant === 'minimal' && !error,
        'placeholder:text-muted-foreground': variant === 'minimal' && !error,
        'focus:border-b-primary focus:ring-0': variant === 'minimal' && !error,
      },
      
      // Error styles - red text for better visibility
      {
        'border-red-500/50 focus:border-red-500 focus:ring-red-500/20': error,
        'bg-red-50/50 text-red-700 dark:bg-red-900/20 dark:text-red-300': error && variant !== 'minimal',
        'text-red-700 dark:text-red-300': error && variant === 'minimal',
      },
      
      // Spacing and sizing
      {
        'px-4 py-2.5 rounded-lg text-sm': variant !== 'minimal',
        'px-0 py-2.5': variant === 'minimal',
        'pl-8': leftIcon && variant !== 'minimal',
        'pr-12': rightIcon && variant !== 'minimal',
      }
    );

    const labelClasses = cn(
      'absolute transition-all duration-300 ease-out pointer-events-none z-10',
      {
        // Floating label behavior - when field is empty and not focused
        'left-4 top-1/2 -translate-y-1/2 text-base text-muted-foreground': floating && !isFocused && !hasValue && !error,
        // Floating label behavior - when field has value or is focused  
        'left-4 top-0 -translate-y-1/2 text-xs font-medium px-1': floating && (isFocused || hasValue),
        
        // Focused/filled label colors - different for light/dark mode
        'text-foreground': floating && (isFocused || hasValue) && !error,
        'bg-background': floating && (isFocused || hasValue) && (variant === 'glass' || variant === 'default'),
        
        // Error states
        'text-red-500 dark:text-red-400': error,
        
        // Minimal variant adjustments
        'left-0': variant === 'minimal',
        'bg-transparent': variant === 'minimal',
      }
    );

    return (
      <div className="relative">
        {/* Input container */}
        <div 
          className="relative"
          onClick={() => {
            // Focus the input when clicking anywhere in the container
            inputRef.current?.focus();
          }}
        >
          {/* Left icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          
          {/* Input field */}
          <input
            type={type}
            className={cn(baseClasses, className)}
            ref={inputRef}
            placeholder={floating ? '' : placeholder}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            aria-invalid={!!error}
            aria-describedby={error ? `${props.id}-error` : undefined}
            {...props}
          />
          
          {/* Floating label */}
          {floating && label && (
            <label className={labelClasses} htmlFor={props.id}>
              {label}
            </label>
          )}
          
          {/* Right icon */}
          {rightIcon && (
            <div 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10"
              onClick={(e) => {
                // If the rightIcon contains interactive elements (like buttons), 
                // don't interfere with them. Otherwise, focus the input.
                const target = e.target as HTMLElement;
                if (!target.closest('button')) {
                  inputRef.current?.focus();
                }
              }}
            >
              {rightIcon}
            </div>
          )}
        </div>
        
        {/* Non-floating label */}
        {!floating && label && (
          <label className="block text-sm font-medium text-foreground mb-2" htmlFor={props.id}>
            {label}
          </label>
        )}
        
        {/* Error message */}
        {error && (
          <p 
            id={`${props.id}-error`}
            className="mt-2 text-sm text-red-600 dark:text-red-400 animate-in slide-in-from-top-1 duration-300"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };