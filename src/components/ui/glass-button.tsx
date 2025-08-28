import React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const glassButtonVariants = cva(
  // Base styles
  [
    'inline-flex items-center justify-center whitespace-nowrap rounded-button text-sm font-semibold ring-offset-background',
    'transition-all duration-200 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-98 hover:scale-[1.02]',
  ],
  {
    variants: {
      variant: {
        // Primary glass button with brand colors
        primary: [
          'bg-gradient-to-b from-accent to-accent-hover',
          'text-text-inverse shadow-button',
          'border border-black/10',
          'hover:shadow-button-hover hover:-translate-y-0.5',
          'active:shadow-button-active active:translate-y-0',
          'dark:border-white/10',
        ],
        // Secondary glass button
        secondary: [
          'glass-card text-text-primary',
          'border-glass-border',
          'hover:shadow-md hover:-translate-y-0.5',
          'hover:bg-surface-elevated',
          'active:translate-y-0',
        ],
        // Glass button with accent outline
        outline: [
          'glass-card text-accent border-accent/30',
          'hover:bg-accent-light hover:border-accent/50',
          'hover:shadow-md hover:-translate-y-0.5',
          'active:translate-y-0',
        ],
        // Ghost glass button
        ghost: [
          'text-text-secondary hover:text-text-primary',
          'hover:bg-glass-background hover:backdrop-blur-lg',
          'hover:shadow-sm hover:-translate-y-0.5',
          'active:translate-y-0',
        ],
        // Destructive glass button
        destructive: [
          'bg-gradient-to-b from-error to-error',
          'text-text-inverse shadow-button',
          'border border-black/10',
          'hover:shadow-button-hover hover:-translate-y-0.5',
          'hover:brightness-110',
          'active:shadow-button-active active:translate-y-0',
          'dark:border-white/10',
        ],
        // Success glass button
        success: [
          'bg-gradient-to-b from-success to-success',
          'text-text-inverse shadow-button',
          'border border-black/10',
          'hover:shadow-button-hover hover:-translate-y-0.5',
          'hover:brightness-110',
          'active:shadow-button-active active:translate-y-0',
          'dark:border-white/10',
        ],
        // Link style
        link: [
          'text-accent underline-offset-4',
          'hover:underline hover:text-accent-hover',
          'focus-visible:underline',
        ],
      },
      size: {
        xs: 'h-7 px-2 text-xs',
        sm: 'h-8 px-3 text-sm',
        default: 'h-10 px-6',
        lg: 'h-11 px-8 text-base',
        xl: 'h-12 px-10 text-lg',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-11 w-11',
      },
      // Loading state
      loading: {
        true: 'cursor-not-allowed opacity-70',
      },
      // Full width
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
)

export interface GlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof glassButtonVariants> {
  asChild?: boolean
  loading?: boolean
  fullWidth?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading,
      fullWidth,
      leftIcon,
      rightIcon,
      asChild = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button'

    return (
      <Comp
        className={cn(
          glassButtonVariants({ variant, size, loading, fullWidth }),
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && leftIcon && (
          <span className="mr-2 flex-shrink-0">{leftIcon}</span>
        )}
        {children}
        {rightIcon && <span className="ml-2 flex-shrink-0">{rightIcon}</span>}
      </Comp>
    )
  }
)
GlassButton.displayName = 'GlassButton'

export { GlassButton, glassButtonVariants }