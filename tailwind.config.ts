import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Enhanced typography with fluid scaling
      fontSize: {
        xs: ["clamp(0.75rem, 0.7rem + 0.25vw, 0.8125rem)", { lineHeight: '1.2' }],
        sm: ["clamp(0.875rem, 0.825rem + 0.25vw, 0.9375rem)", { lineHeight: '1.375' }],
        base: ["clamp(1rem, 0.95rem + 0.25vw, 1.0625rem)", { lineHeight: '1.5' }],
        lg: ["clamp(1.125rem, 1.075rem + 0.25vw, 1.1875rem)", { lineHeight: '1.375' }],
        xl: ["clamp(1.25rem, 1.2rem + 0.25vw, 1.375rem)", { lineHeight: '1.2' }],
        "2xl": ["clamp(1.5rem, 1.4rem + 0.5vw, 1.75rem)", { lineHeight: '1.2' }],
        "3xl": ["clamp(1.875rem, 1.75rem + 0.625vw, 2.125rem)", { lineHeight: '1.2' }],
        "4xl": ["clamp(2.25rem, 2.1rem + 0.75vw, 2.625rem)", { lineHeight: '1.2' }],
        "5xl": ["clamp(3rem, 2.75rem + 1.25vw, 3.75rem)", { lineHeight: '1.2' }],
      },
      // Premium font families
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', '"Helvetica Neue"', '"Segoe UI"', 'system-ui', 'sans-serif'],
        mono: ['"SF Mono"', 'Monaco', '"Cascadia Code"', '"Roboto Mono"', 'monospace'],
      },
      // Sophisticated spacing scale
      spacing: {
        '0.5': '2px',
        '1': '4px',
        '1.5': '6px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
        '20': '80px',
        '24': '96px',
        '32': '128px',
        '40': '160px',
        '48': '192px',
        '56': '224px',
        '64': '256px',
      },
      // Advanced border radius system
      borderRadius: {
        'none': '0',
        'sm': '4px',
        'DEFAULT': '8px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        'full': '9999px',
        // Component-specific radii
        'button': '8px',
        'input': '6px',
        'card': '12px',
        'modal': '16px',
        'tooltip': '6px',
        'badge': '9999px',
      },
      // Premium shadows and elevation
      boxShadow: {
        'none': 'none',
        'sm': '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'DEFAULT': '0 2px 6px rgba(0, 0, 0, 0.04), 0 2px 4px rgba(0, 0, 0, 0.06)',
        'md': '0 2px 6px rgba(0, 0, 0, 0.04), 0 2px 4px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 20px rgba(0, 0, 0, 0.04), 0 3px 6px rgba(0, 0, 0, 0.06)',
        'xl': '0 15px 35px rgba(0, 0, 0, 0.08), 0 5px 15px rgba(0, 0, 0, 0.08)',
        '2xl': '0 25px 50px rgba(0, 0, 0, 0.12), 0 12px 24px rgba(0, 0, 0, 0.08)',
        // Interactive elements
        'button': '0 1px 2px rgba(0, 0, 0, 0.08)',
        'button-hover': '0 2px 4px rgba(0, 0, 0, 0.12)',
        'button-active': 'inset 0 1px 2px rgba(0, 0, 0, 0.1)',
        // Overlays
        'modal': '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        'popover': '0 10px 40px rgba(0, 0, 0, 0.2)',
        'dropdown': '0 4px 12px rgba(0, 0, 0, 0.15)',
        // Dark mode variants
        'dark-sm': '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.4)',
        'dark-md': '0 2px 6px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.4)',
        'dark-lg': '0 10px 20px rgba(0, 0, 0, 0.3), 0 3px 6px rgba(0, 0, 0, 0.4)',
      },
      // Advanced color system with CSS variables
      colors: {
        // Primary surfaces
        background: 'var(--background)',
        'background-secondary': 'var(--background-secondary)',
        surface: 'var(--surface)',
        'surface-elevated': 'var(--surface-elevated)',
        'surface-overlay': 'var(--surface-overlay)',
        sidebar: 'var(--sidebar)',
        'sidebar-active': 'var(--sidebar-active)',
        
        // Text hierarchy
        foreground: 'var(--text-primary)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',
        'text-inverse': 'var(--text-inverse)',
        'text-link': 'var(--text-link)',
        
        // Brand colors
        accent: 'var(--accent)',
        'accent-hover': 'var(--accent-hover)',
        'accent-pressed': 'var(--accent-pressed)',
        'accent-light': 'var(--accent-light)',
        
        // Semantic colors
        success: 'var(--success)',
        'success-light': 'var(--success-light)',
        warning: 'var(--warning)',
        'warning-light': 'var(--warning-light)',
        error: 'var(--error)',
        'error-light': 'var(--error-light)',
        info: 'var(--info)',
        'info-light': 'var(--info-light)',
        
        // Borders and dividers
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        divider: 'var(--divider)',
        
        // Glass morphism
        'glass-background': 'var(--glass-background)',
        'glass-border': 'var(--glass-border)',
      },
      // Animation system
      transitionTimingFunction: {
        'ease-in-out-quart': 'cubic-bezier(0.77, 0, 0.175, 1)',
        'ease-out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
        'ease-out-back': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'ease-spring': 'cubic-bezier(0.5, -0.5, 0.5, 1.5)',
      },
      transitionDuration: {
        'instant': '0ms',
        'fast': '150ms',
        'normal': '300ms',
        'slow': '500ms',
        'slower': '700ms',
        'slowest': '1000ms',
      },
      // Content widths
      maxWidth: {
        'xs': '320px',
        'sm': '384px',
        'md': '512px',
        'lg': '640px',
        'xl': '768px',
        '2xl': '1024px',
        '3xl': '1280px',
        'max': '1440px',
      },
      // Sidebar dimensions
      width: {
        'sidebar-collapsed': '72px',
        'sidebar-expanded': '280px',
      },
      // Focus ring utilities
      ringColor: {
        'focus': 'var(--focus-ring)',
        'focus-error': 'var(--focus-ring-error)',
      },
      // Backdrop blur
      backdropBlur: {
        'glass': '20px',
      },
      backdropSaturate: {
        'glass': '180%',
      },
    },
  },
  plugins: [
    // Add custom utilities for glass morphism and advanced effects
    ({ addUtilities }) => {
      addUtilities({
        '.glass': {
          background: 'var(--glass-background)',
          backdropFilter: 'saturate(180%) blur(20px)',
          border: '1px solid var(--glass-border)',
        },
        '.glass-strong': {
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'saturate(180%) blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.hover-lift': {
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        },
        '.press-scale': {
          '&:active': {
            transform: 'scale(0.98)',
          },
        },
        '.focus-ring': {
          '&:focus-visible': {
            outline: 'none',
            boxShadow: '0 0 0 4px var(--focus-ring)',
          },
        },
        '.focus-ring-error': {
          '&:focus-visible': {
            outline: 'none',
            boxShadow: '0 0 0 4px var(--focus-ring-error)',
          },
        },
      });
    },
  ],
} satisfies Config;