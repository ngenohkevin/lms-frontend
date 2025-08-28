import { cva, type VariantProps } from 'class-variance-authority'
import React from 'react'

import { cn } from '@/lib/utils'

const glassCardVariants = cva(
  [
    // Base glass morphism styles
    'glass-card rounded-card',
    'transition-all duration-300 ease-out',
    'overflow-hidden',
  ],
  {
    variants: {
      variant: {
        // Default glass card
        default: [
          'bg-glass-background backdrop-blur-glass',
          'border border-glass-border',
          'shadow-sm',
        ],
        // Elevated glass card with more prominence
        elevated: [
          'bg-glass-background backdrop-blur-glass',
          'border border-glass-border',
          'shadow-lg',
        ],
        // Solid card with glass-like aesthetics
        solid: [
          'bg-surface border-border',
          'shadow-md',
        ],
        // Strong glass effect
        strong: [
          'glass-strong backdrop-blur-glass',
          'border border-white/20',
          'shadow-xl',
        ],
        // Outline variant
        outline: [
          'bg-transparent border-2 border-border',
          'hover:bg-glass-background hover:backdrop-blur-glass',
        ],
        // Gradient variant
        gradient: [
          'bg-gradient-to-br from-glass-background to-surface-elevated',
          'backdrop-blur-glass border border-glass-border',
          'shadow-lg',
        ],
      },
      size: {
        sm: 'p-4',
        default: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
      },
      // Interactive states
      interactive: {
        true: [
          'hover:shadow-md hover:-translate-y-0.5',
          'hover:border-accent-light',
          'cursor-pointer transition-transform',
          'active:translate-y-0 active:shadow-sm',
        ],
      },
      // Full height
      fullHeight: {
        true: 'h-full',
      },
      // Loading state
      loading: {
        true: 'animate-pulse',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {
  asChild?: boolean
  loading?: boolean
  fullHeight?: boolean
  interactive?: boolean
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      className,
      variant,
      size,
      interactive,
      fullHeight,
      loading,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          glassCardVariants({ variant, size, interactive, fullHeight, loading }),
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
GlassCard.displayName = 'GlassCard'

// Card Header Component
const GlassCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex flex-col space-y-1.5 p-6 pb-4',
      'border-b border-divider',
      className
    )}
    {...props}
  />
))
GlassCardHeader.displayName = 'GlassCardHeader'

// Card Title Component
const GlassCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-2xl font-semibold leading-tight tracking-tight',
      'text-text-primary',
      className
    )}
    {...props}
  />
))
GlassCardTitle.displayName = 'GlassCardTitle'

// Card Description Component
const GlassCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      'text-sm text-text-secondary leading-relaxed',
      className
    )}
    {...props}
  />
))
GlassCardDescription.displayName = 'GlassCardDescription'

// Card Content Component
const GlassCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('p-6 pt-4', className)}
    {...props}
  />
))
GlassCardContent.displayName = 'GlassCardContent'

// Card Footer Component
const GlassCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center p-6 pt-4',
      'border-t border-divider',
      className
    )}
    {...props}
  />
))
GlassCardFooter.displayName = 'GlassCardFooter'

export {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardDescription,
  GlassCardContent,
  GlassCardFooter,
  glassCardVariants,
}