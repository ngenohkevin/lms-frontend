# Library Management System—Implementation Progress

**BACKEND HAS FULLY BEEN IMPLEMENTED AND THE PROJECT FOLDER IS HERE:**`/Users/kevin/dev/backend/lms`

## 🔑 LOGIN CREDENTIALS (for frontend testing)

### Admin User
- **Username:** `admin`
- **Password:** `admin123`
- **Email:** admin@library.com
- **Role:** Admin (full system access)

### Librarian User
- **Username:** `librarian`
- **Password:** `librarian123`
- **Email:** librarian@library.com
- **Role:** Librarian (book and student management)

### Backend API Endpoint
- **URL:** http://localhost:8080/api/v1/auth/login
- **Method:** POST
- **CORS:** Fixed - allows `http://localhost:3000` with credentials


## Project Overview
**Goal**: Build a librarian-focused Library Management System to automate manual library operations, with scalability for future school-wide deployment.

**Repository Structure**: 📋 **Separate Repositories**
- **🔵 Backend Repository**: `lms-backend` (Go + Supabase PostgreSQL + Redis)
- **🟠 Frontend Repository**: `lms-frontend` (Next.js + TypeScript + Tailwind)
- **Independent Development**: Each repo can be developed and deployed separately
- **API Communication**: Frontend consumes backend REST API
- **Database**: Supabase PostgreSQL with built-in auth and real-time features

**Development Approach**: 🧪 **Test-Driven Development (TDD)**
- Write tests first, then implement code to pass tests
- Maintain >90% test coverage throughout development
- Red-Green-Refactor cycle for all features

**Current Status**: 🟡 Planning Complete - Ready for TDD Implementation


## 📋 Repository Strategy & Communication

### **🔵 Backend Repository (`lms-backend`)**
- **Technology**: Go + Gin + Supabase PostgreSQL + Redis
- **Responsibilities**: API endpoints, business logic, database operations, authentication
- **Deployment**: VPS (Virtual Private Server)
- **API**: REST API with JSON responses
- **Database**: Supabase PostgreSQL with connection pooling and real-time features
- **Testing**: Go testing framework with >90% coverage

### **🟠 Frontend Repository (`lms-frontend`)**
- **Technology**: Next.js 15.1.8 + TypeScript 5.9.2 + Tailwind CSS v4
- **State Management**: TanStack Query v5.71.10 + Zustand v5
- **Forms**: React Hook Form + Zod validation
- **UI Components**: Shadcn/ui with Radix UI primitives
- **Responsibilities**: User interface, client-side logic, API consumption
- **Deployment**: Netlify (Static hosting)
- **Communication**: Consumes backend REST API
- **Testing**: Jest + React Testing Library with >90% coverage
- **Design System**: macOS-inspired clean and elegant UI with advanced CSS variables

### **API Communication Flow**
```
🟠 Frontend (lms-frontend)
       │
       │ HTTP Requests
       │ (JSON API calls)
       ↓
🔵 Backend (lms-backend)
       │
       │ Database Queries
       ↓
💾 Supabase PostgreSQL Database
```

### **Development Workflow**
1. **Backend First**: Develop API endpoints with tests
2. **API Documentation**: Document API contracts
3. **Frontend Integration**: Build UI that consumes API
4. **End-to-End Testing**: Test complete user workflows

---

## 🎨 Frontend Design System & UI Guidelines

### **Premium macOS-Inspired Design Language**
The frontend embodies Apple's Human Interface Guidelines with meticulous attention to detail, creating an exceptionally polished and intuitive library management experience.

#### **🎯 Core Design Philosophy**
- **Clarity Through Refinement**: Every pixel serves a purpose; nothing is arbitrary
- **Depth & Hierarchy**: Subtle layers create visual hierarchy without clutter
- **Effortless Sophistication**: Complex functionality feels simple and natural
- **Delightful Interactions**: Thoughtful micro-interactions enhance user engagement
- **Accessibility First**: Beautiful design that works for everyone

#### **🌈 Advanced Color System & Theme Architecture**

**Refined Light Mode Palette** (macOS Monterey-inspired):
```css
:root {
  /* Primary Surfaces */
  --background: #FEFEFE;
  --background-secondary: #F5F5F7;
  --surface: #FFFFFF;
  --surface-elevated: #FFFFFF;
  --surface-overlay: rgba(255, 255, 255, 0.9);
  --sidebar: #F6F6F8;
  --sidebar-active: #E8E8ED;
  
  /* Borders & Dividers */
  --border: rgba(0, 0, 0, 0.08);
  --border-strong: rgba(0, 0, 0, 0.12);
  --divider: rgba(0, 0, 0, 0.06);
  
  /* Text Hierarchy */
  --text-primary: #1D1D1F;
  --text-secondary: #86868B;
  --text-tertiary: #C7C7CC;
  --text-inverse: #FFFFFF;
  --text-link: #007AFF;
  
  /* Brand Colors */
  --accent: #007AFF;
  --accent-hover: #0051D5;
  --accent-pressed: #0041B8;
  --accent-light: rgba(0, 122, 255, 0.1);
  
  /* Semantic Colors */
  --success: #34C759;
  --success-light: rgba(52, 199, 89, 0.1);
  --warning: #FF9F0A;
  --warning-light: rgba(255, 159, 10, 0.1);
  --error: #FF3B30;
  --error-light: rgba(255, 59, 48, 0.1);
  --info: #5AC8FA;
  --info-light: rgba(90, 200, 250, 0.1);
  
  /* Material Effects */
  --blur-background: saturate(180%) blur(20px);
  --glass-background: rgba(255, 255, 255, 0.72);
  --glass-border: rgba(255, 255, 255, 0.18);
  
  /* Focus States */
  --focus-ring: 0 0 0 4px rgba(0, 122, 255, 0.3);
  --focus-ring-error: 0 0 0 4px rgba(255, 59, 48, 0.3);
}
```

**Premium Dark Mode Palette** (macOS Dark Mode):
```css
:root[data-theme='dark'] {
  /* Primary Surfaces */
  --background: #000000;
  --background-secondary: #1C1C1E;
  --surface: #1C1C1E;
  --surface-elevated: #2C2C2E;
  --surface-overlay: rgba(28, 28, 30, 0.9);
  --sidebar: #141416;
  --sidebar-active: #2C2C2E;
  
  /* Borders & Dividers */
  --border: rgba(255, 255, 255, 0.08);
  --border-strong: rgba(255, 255, 255, 0.12);
  --divider: rgba(255, 255, 255, 0.06);
  
  /* Text Hierarchy */
  --text-primary: #FFFFFF;
  --text-secondary: #98989F;
  --text-tertiary: #48484A;
  --text-inverse: #000000;
  --text-link: #0A84FF;
  
  /* Brand Colors */
  --accent: #0A84FF;
  --accent-hover: #409CFF;
  --accent-pressed: #0060DF;
  --accent-light: rgba(10, 132, 255, 0.16);
  
  /* Semantic Colors */
  --success: #32D74B;
  --success-light: rgba(50, 215, 75, 0.16);
  --warning: #FFD60A;
  --warning-light: rgba(255, 214, 10, 0.16);
  --error: #FF453A;
  --error-light: rgba(255, 69, 58, 0.16);
  --info: #64D2FF;
  --info-light: rgba(100, 210, 255, 0.16);
  
  /* Material Effects */
  --blur-background: saturate(180%) blur(20px);
  --glass-background: rgba(28, 28, 30, 0.72);
  --glass-border: rgba(255, 255, 255, 0.18);
  
  /* Focus States */
  --focus-ring: 0 0 0 4px rgba(10, 132, 255, 0.4);
  --focus-ring-error: 0 0 0 4px rgba(255, 69, 58, 0.4);
}
```

#### **📐 Sophisticated Layout & Spatial System**

**Precision Grid System**:
```css
:root {
  /* Base Unit System (8px foundation) */
  --unit: 8px;
  --unit-half: 4px;
  --unit-quarter: 2px;
  --unit-double: 16px;
  
  /* Spacing Scale (Fibonacci-inspired) */
  --space-0: 0;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 40px;
  --space-8: 48px;
  --space-9: 64px;
  --space-10: 80px;
  --space-11: 96px;
  --space-12: 128px;
  
  /* Content Widths */
  --content-xs: 320px;
  --content-sm: 384px;
  --content-md: 512px;
  --content-lg: 640px;
  --content-xl: 768px;
  --content-2xl: 1024px;
  --content-3xl: 1280px;
  --content-max: 1440px;
  
  /* Sidebar Dimensions */
  --sidebar-width-collapsed: 72px;
  --sidebar-width-expanded: 280px;
  --sidebar-width-mobile: 100%;
}
```

#### **🔤 Premium Typography System**

**SF Pro-Inspired Typography**:
```css
:root {
  /* Font Families */
  --font-sans: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", 
               "Helvetica Neue", "Segoe UI", system-ui, sans-serif;
  --font-mono: "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", monospace;
  
  /* Font Sizes (Fluid Typography) */
  --text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.8125rem);     /* 12-13px */
  --text-sm: clamp(0.875rem, 0.825rem + 0.25vw, 0.9375rem);  /* 14-15px */
  --text-base: clamp(1rem, 0.95rem + 0.25vw, 1.0625rem);     /* 16-17px */
  --text-lg: clamp(1.125rem, 1.075rem + 0.25vw, 1.1875rem);  /* 18-19px */
  --text-xl: clamp(1.25rem, 1.2rem + 0.25vw, 1.375rem);      /* 20-22px */
  --text-2xl: clamp(1.5rem, 1.4rem + 0.5vw, 1.75rem);        /* 24-28px */
  --text-3xl: clamp(1.875rem, 1.75rem + 0.625vw, 2.125rem);  /* 30-34px */
  --text-4xl: clamp(2.25rem, 2.1rem + 0.75vw, 2.625rem);     /* 36-42px */
  --text-5xl: clamp(3rem, 2.75rem + 1.25vw, 3.75rem);        /* 48-60px */
  
  /* Font Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  
  /* Line Heights */
  --leading-tight: 1.2;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;
  
  /* Letter Spacing */
  --tracking-tight: -0.02em;
  --tracking-normal: 0;
  --tracking-wide: 0.02em;
  --tracking-wider: 0.04em;
  --tracking-widest: 0.08em;
}

```

#### **🎛️ Advanced Component Design System**

**Elevation & Shadow Hierarchy**:
```css
:root {
  /* macOS-style Subtle Shadows */
  --shadow-none: none;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 2px 6px rgba(0, 0, 0, 0.04), 0 2px 4px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 20px rgba(0, 0, 0, 0.04), 0 3px 6px rgba(0, 0, 0, 0.06);
  --shadow-xl: 0 15px 35px rgba(0, 0, 0, 0.08), 0 5px 15px rgba(0, 0, 0, 0.08);
  --shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.12), 0 12px 24px rgba(0, 0, 0, 0.08);
  
  /* Interactive Element Shadows */
  --shadow-button: 0 1px 2px rgba(0, 0, 0, 0.08);
  --shadow-button-hover: 0 2px 4px rgba(0, 0, 0, 0.12);
  --shadow-button-active: inset 0 1px 2px rgba(0, 0, 0, 0.1);
  
  /* Modal & Overlay Shadows */
  --shadow-modal: 0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.05);
  --shadow-popover: 0 10px 40px rgba(0, 0, 0, 0.2);
  --shadow-dropdown: 0 4px 12px rgba(0, 0, 0, 0.15);
  
  /* Dark Mode Shadows (Glowing Effect) */
  --shadow-dark-sm: 0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.4);
  --shadow-dark-md: 0 2px 6px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.4);
  --shadow-dark-lg: 0 10px 20px rgba(0, 0, 0, 0.3), 0 3px 6px rgba(0, 0, 0, 0.4);
}
```

**Border Radius System**:
```css
:root {
  --radius-none: 0;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 24px;
  --radius-full: 9999px;
  
  /* Component-specific radii */
  --radius-button: 8px;
  --radius-input: 6px;
  --radius-card: 12px;
  --radius-modal: 16px;
  --radius-tooltip: 6px;
  --radius-badge: 9999px;
}

```

#### **🏗️ Premium Layout Architecture**

**Main Application Structure**:
```
┌────────────────────────────────────────────────────────────────┐
│ Glass Header Bar                                               │
│ ┌──────────┬────────────────────────┬──────────┬──────────┐   │
│ │ App Logo │  Global Search Bar      │ Actions  │ Profile  │   │
│ └──────────┴────────────────────────┴──────────┴──────────┘   │
├─────────────────┬───────────────────────────────────────────────┤
│                 │ Content Area with Smooth Scrolling            │
│  Elegant        │ ┌─────────────────────────────────────────┐  │
│  Sidebar        │ │ Breadcrumb Navigation                   │  │
│                 │ ├─────────────────────────────────────────┤  │
│  ╭─────────╮    │ │ Page Header with Actions               │  │
│  │ 📚 Books │    │ ├─────────────────────────────────────────┤  │
│  ╰─────────╯    │ │                                         │  │
│  ╭─────────╮    │ │  Main Content                          │  │
│  │ 👥 Users │    │ │  • Cards with hover effects            │  │
│  ╰─────────╯    │ │  • Smooth transitions                  │  │
│  ╭─────────╮    │ │  • Glass morphism elements             │  │
│  │ 📊 Stats │    │ │  • Floating action buttons            │  │
│  ╰─────────╯    │ │                                         │  │
│  ╭─────────╮    │ └─────────────────────────────────────────┘  │
│  │ ⚙️ Config│    │                                              │
│  ╰─────────╯    │ Status Bar (Optional)                        │
└─────────────────┴───────────────────────────────────────────────┘
```

#### **🎨 Sophisticated UI Components**

**Button Hierarchy & States**:
```css
/* Primary Button */
.btn-primary {
  background: linear-gradient(180deg, var(--accent) 0%, var(--accent-hover) 100%);
  box-shadow: var(--shadow-button), inset 0 1px 0 rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 200ms var(--easing-ease-out);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-button-hover);
  background: linear-gradient(180deg, var(--accent-hover) 0%, var(--accent-pressed) 100%);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: var(--shadow-button-active);
}

/* Glass Button (Secondary) */
.btn-glass {
  background: var(--glass-background);
  backdrop-filter: var(--blur-background);
  border: 1px solid var(--glass-border);
}

/* Input Fields with Focus Glow */
.input-field {
  background: var(--surface);
  border: 1px solid var(--border);
  transition: all 200ms var(--easing-ease-out);
}

.input-field:focus {
  border-color: var(--accent);
  box-shadow: var(--focus-ring);
  background: var(--surface-elevated);
}
```

**Card Components with Depth**:
```css
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-sm);
  transition: all 300ms var(--easing-ease-out);
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--accent-light);
}

.card-glass {
  background: var(--glass-background);
  backdrop-filter: var(--blur-background);
  border: 1px solid var(--glass-border);
}
```

#### **📱 Responsive Design Strategy**

**Breakpoint System**:
```css
:root {
  /* Mobile First Breakpoints */
  --screen-xs: 475px;   /* Extra small phones */
  --screen-sm: 640px;   /* Small tablets */
  --screen-md: 768px;   /* Tablets */
  --screen-lg: 1024px;  /* Desktop */
  --screen-xl: 1280px;  /* Large desktop */
  --screen-2xl: 1536px; /* Extra large desktop */
  --screen-3xl: 1920px; /* Ultra wide */
}

/* Container Widths */
.container {
  width: 100%;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

@media (min-width: 640px) { .container { max-width: 640px; } }
@media (min-width: 768px) { .container { max-width: 768px; } }
@media (min-width: 1024px) { .container { max-width: 1024px; } }
@media (min-width: 1280px) { .container { max-width: 1280px; } }
@media (min-width: 1536px) { .container { max-width: 1536px; } }
```

#### **🎭 Premium Animation System**

**Animation Curves & Timing**:
```css
:root {
  /* Duration Scale */
  --duration-instant: 0ms;
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  --duration-slower: 700ms;
  --duration-slowest: 1000ms;
  
  /* Apple-style Easing Functions */
  --ease-in-out-quart: cubic-bezier(0.77, 0, 0.175, 1);
  --ease-out-expo: cubic-bezier(0.19, 1, 0.22, 1);
  --ease-out-back: cubic-bezier(0.175, 0.885, 0.32, 1.275);
  --ease-spring: cubic-bezier(0.5, -0.5, 0.5, 1.5);
  
  /* Micro-interactions */
  --hover-lift: translateY(-2px);
  --press-scale: scale(0.98);
  --focus-scale: scale(1.02);
}

/* Page Transitions */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideInLeft {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

@keyframes scaleIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

```

#### **🔄 Advanced Theme System**

**Theme Toggle Implementation**:
```javascript
// Theme detection and management
const themeManager = {
  init() {
    // Detect system preference
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
    const savedTheme = localStorage.getItem('theme') || 'system';
    
    // Apply theme with smooth transition
    this.applyTheme(savedTheme);
    
    // Listen for system changes
    systemTheme.addEventListener('change', () => {
      if (this.getCurrentTheme() === 'system') {
        this.applyTheme('system');
      }
    });
  },
  
  applyTheme(theme) {
    const root = document.documentElement;
    root.style.transition = 'background 300ms ease-in-out';
    
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', theme);
    }
    
    localStorage.setItem('theme', theme);
  }
};
```

#### **♿ Comprehensive Accessibility**

**WCAG AAA Compliance**:
```css
/* High Contrast Mode Support */
@media (prefers-contrast: high) {
  :root {
    --border: rgba(0, 0, 0, 0.3);
    --text-secondary: var(--text-primary);
    --accent: #0055CC;
  }
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Focus Visible Enhancement */
*:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

/* Skip to Content */
.skip-to-content {
  position: absolute;
  left: -9999px;
  z-index: 999;
}

.skip-to-content:focus {
  left: 50%;
  transform: translateX(-50%);
  top: 1rem;
}

---

## 🚀 Latest Frontend Technology Stack (Context7 Research)

### **Core Framework & Runtime**
- **Next.js 15.1.8**: Latest with App Router, React Server Components, enhanced streaming, and Turbopack bundler
- **React 19**: Latest with Server Components, improved Suspense, enhanced concurrent features, and useSyncExternalStore hook
- **TypeScript 5.9.2**: Latest with improved performance, better inference, enhanced error messages, and faster type checking

### **Styling & Design System**
- **Tailwind CSS v4**: Revolutionary update with native CSS variables, @theme directive, @utility API, and CSS-first architecture
  - **@theme Directive**: Define design tokens directly in CSS that generate utility classes
  - **Native CSS Variables**: All theme values exposed as `var(--color-*)`, `var(--spacing-*)`, etc.
  - **Enhanced Performance**: Smaller bundle sizes and faster builds
  - **Modern CSS Features**: Utilizes @layer, @property, and color-mix() functions
- **Shadcn/ui (latest)**: Premium component library with Tailwind v4 compatibility, data-slot attributes, and React 19 support
  - **Radix UI Integration**: Built on accessible, unstyled Radix UI primitives
  - **Copy-Paste Architecture**: Own your components with full customization control
  - **Enhanced Theming**: Supports both CSS variables and utility class theming

### **State Management & Data Fetching**
- **TanStack Query v5.71.10**: Advanced server state management with React 19 compatibility
  - **New Hook Signatures**: `useQuery({ queryKey, queryFn })` syntax
  - **Enhanced TypeScript**: Better type inference and error handling
  - **React 19 Optimizations**: Optimized for concurrent features and Suspense
  - **Minimum Requirement**: React 18+ (uses useSyncExternalStore hook)
- **Zustand v5**: Ultra-lightweight client state management
  - **Requirements**: TypeScript 4.5+ and React 18+ (our stack exceeds both)
  - **Enhanced Middleware**: Better TypeScript integration and patterns

### **Form Handling & Validation**
- **React Hook Form**: Latest with enhanced TypeScript 5.9.2 support and minimal re-renders
- **Zod**: TypeScript-first schema validation with improved error handling and type inference

### **Build Tools & Development Experience**
- **Turbopack**: Next.js 15's default bundler delivering up to 10x faster builds
- **ESLint 9**: Latest with flat config system and modern React/TypeScript rules
- **Prettier 3**: Improved performance and enhanced formatting capabilities
- **Jest 30**: Latest testing framework with enhanced TypeScript 5.9.2 support and React 19 compatibility

### **Detailed Technology Analysis**

#### **Next.js 15.1.8 - Latest Features**:
- **App Router with RSC**: Server Components for better performance and SEO
- **Streaming Support**: Progressive rendering with Suspense boundaries
- **Turbopack**: 10x faster builds with native Rust-based bundling
- **Enhanced Data Fetching**: Built-in caching strategies (force-cache, no-store, revalidate)
- **React 19 Integration**: Full compatibility with latest React features

#### **React 19 - Revolutionary Features**:
- **Server Components**: Execute on server for improved performance and smaller bundles
- **Enhanced Concurrent Rendering**: Better user experience with smoother interactions
- **useSyncExternalStore**: New hook enabling libraries like TanStack Query v5
- **Automatic Batching**: Improved state update batching for better performance
- **Better TypeScript Integration**: Enhanced type inference and error messages

#### **Tailwind CSS v4 - Game-Changing Architecture**:
- **@theme Directive**: Define design tokens directly in CSS that auto-generate utility classes
  ```css
  @theme {
    --color-brand-500: oklch(0.72 0.11 178);
    --breakpoint-3xl: 1920px;
    --font-display: "Satoshi", sans-serif;
  }
  ```
- **Native CSS Variables**: All theme values exposed as `var(--color-*)`, `var(--spacing-*)` for JS access
- **CSS-First Architecture**: Leverages modern CSS features (@layer, @property, color-mix)
- **Performance Gains**: Smaller CSS bundles and faster build times

#### **TanStack Query v5.71.10 - Advanced Server State**:
- **React 19 Optimized**: Built for concurrent rendering and Suspense
- **New API Design**: Object-based configuration `useQuery({ queryKey, queryFn })`
- **Enhanced TypeScript**: Better type safety and inference across the API
- **useSyncExternalStore**: Leverages React 18+'s new external store capabilities

#### **Shadcn/ui - Premium Component Library**:
- **Tailwind v4 Ready**: Full compatibility with new CSS architecture
- **React 19 Support**: Optimized for latest React features
- **data-slot Architecture**: Enhanced styling flexibility for component parts
- **Radix UI Foundation**: Built on accessible, unstyled primitives

### **Implementation Benefits**

#### **Performance Improvements**:
- **Turbopack**: Up to 10x faster development builds
- **React 19**: Enhanced concurrent rendering and automatic batching
- **Tailwind v4**: Smaller CSS bundle sizes with CSS variables
- **TanStack Query v5**: Optimized caching and background refetching

#### **Developer Experience**:
- **TypeScript 5.9.2**: Better error messages and faster type checking
- **ESLint 9**: Flat config system for easier configuration
- **Enhanced IDE Support**: Better autocomplete and intellisense across the stack

#### **Modern Features**:
- **React Server Components**: Better SEO and initial page load performance
- **Streaming**: Improved user experience with progressive rendering
- **CSS Variables in Tailwind**: Dynamic theming and better customization
- **Enhanced Accessibility**: Shadcn/ui components built on Radix UI primitives

### **Recommended Migration Path**:
1. **Phase 1**: Update to Next.js 15.1.8 and TypeScript 5.9.2
2. **Phase 2**: Migrate to Tailwind CSS v4 with new @theme directive
3. **Phase 3**: Update TanStack Query to v5 with new hook signatures
4. **Phase 4**: Integrate latest Shadcn/ui components with Radix UI
5. **Phase 5**: Implement React Server Components for performance optimization

---

## 🧪 TDD Methodology & Testing Strategy

### **Red-Green-Refactor Cycle**
1. **🔴 Red**: Write failing tests first
2. **🟢 Green**: Write minimal code to pass tests
3. **🔵 Refactor**: Improve code while keeping tests green

### **Testing Framework Stack**

#### **🔵 Backend Testing (Go) - `lms-backend` Repository**
- **Unit Tests**: `testify/assert` and `testify/mock`
- **Integration Tests**: Real database with test containers
- **API Tests**: `httptest` for HTTP endpoint testing
- **Test Database**: Separate PostgreSQL instance for testing
- **Coverage**: `go test -cover` with >90% target
- **Repository**: All backend tests in `lms-backend/tests/`

#### **🟠 Frontend Testing (TypeScript/React) - `lms-frontend` Repository**
- **Unit Tests**: `Jest` + `React Testing Library`
- **Component Tests**: `@testing-library/react`
- **Integration Tests**: `Cypress` for E2E testing
- **Mock Services**: `MSW` (Mock Service Worker) to mock backend API
- **Coverage**: `jest --coverage` with >90% target
- **Repository**: All frontend tests in `lms-frontend/src/__tests__/`

#### **Database Testing**
- **Migration Tests**: Test all up/down migrations
- **Constraint Tests**: Validate all database constraints
- **Performance Tests**: Query performance benchmarks
- **Data Integrity Tests**: Test foreign key relationships

### **Testing Commands**

#### **🔵 Backend Repository (`lms-backend`)**
```bash
# Navigate to backend repository
cd lms-backend

# Backend testing commands
make test              # Run all tests
make test-watch        # Run tests in watch mode
make test-cover        # Run tests with coverage
make test-integration  # Run integration tests only
make test-unit         # Run unit tests only
make test-db           # Run database tests
make test-migrations   # Test all migrations
```

#### **🟠 Frontend Repository (`lms-frontend`)**
```bash
# Navigate to frontend repository
cd lms-frontend

# Frontend testing commands
npm test               # Run all tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage
npm run test:e2e       # Run E2E tests
npm run test:component # Run component tests only
npm run test:unit      # Run unit tests only
```

### **Test Coverage Requirements**
- **Phase 1-3**: >85% coverage (Infrastructure & Core)
- **Phase 4-6**: >90% coverage (Business Logic)
- **Phase 7-10**: >95% coverage (Advanced Features)
- **Critical Paths**: 100% coverage (Authentication, Transactions)

---

#### **🚀 Performance Optimization**

**Web Vitals Targets**:
```javascript
// Performance metrics goals
const performanceTargets = {
  LCP: 2500,  // Largest Contentful Paint < 2.5s
  FID: 100,   // First Input Delay < 100ms
  CLS: 0.1,   // Cumulative Layout Shift < 0.1
  FCP: 1800,  // First Contentful Paint < 1.8s
  TTFB: 600,  // Time to First Byte < 600ms
  INP: 200    // Interaction to Next Paint < 200ms
};
```

**Optimization Strategies**:
- **Code Splitting**: Dynamic imports for route-based splitting
- **Image Optimization**: Next.js Image component with lazy loading
- **Font Loading**: Font display swap with preloading
- **Bundle Size**: Tree shaking and minification
- **Caching Strategy**: Service worker with offline support
- **Prefetching**: Smart link prefetching for instant navigation

#### **🎯 Key User Interfaces**

**1. Dashboard (Main Screen)**:
- Glass morphism header with search
- Statistics cards with subtle animations
- Real-time data updates with smooth transitions
- Quick action buttons with hover effects
- Activity timeline with infinite scroll

**2. Book Management Interface**:
- Grid/List view toggle with animation
- Advanced filters sidebar (collapsible)
- Bulk selection with checkbox animations
- Drag-and-drop for image uploads
- Inline editing with autosave

**3. Transaction Interface**:
- Step-by-step wizard with progress indicator
- Barcode scanner integration (Web API)
- Real-time availability checking
- Receipt generation and printing
- Transaction history with search

**4. Student Management**:
- Card-based student profiles
- Quick search with autocomplete
- Batch operations with progress bars
- Import/Export with drag-and-drop
- Activity tracking visualization

**5. Reports Dashboard**:
- Interactive charts (Chart.js/D3.js)
- Customizable widgets
- Export options (PDF, Excel, CSV)
- Date range picker with presets
- Comparison views with animations

---

## Phase 1: Core Infrastructure Setup
**Timeline**: Week 1-2  
**Status**: ⏳ Pending

### Milestones:

#### 1.1 🔵 Backend Project Structure (`lms-backend`)
- [ ] Initialize Go project with proper module structure
- [ ] Set up project directories (`cmd/`, `internal/`, `migrations/`, `tests/`, etc.)
- [ ] Create `go.mod` and initial dependencies
- [ ] **Set up testing framework** (Testify, test database)
- [ ] Set up basic `main.go` with Gin framework
- [ ] Create basic configuration structure
- [ ] **Write first integration test** (server startup)

#### 1.2 🟠 Premium Frontend Project Structure (`lms-frontend`)
- [ ] Initialize Next.js 15.1.8 with App Router, React Server Components, and TypeScript 5.9.2 strict mode
- [ ] **Configure Tailwind CSS v4 with premium design tokens**:
    - [ ] Set up CSS variables with @theme directive (Tailwind v4 feature)
    - [ ] Configure fluid typography and responsive spacing using new @utility API
    - [ ] Add animation utilities and easing functions with enhanced CSS support
- [ ] **Install core dependencies**:
    - [ ] Shadcn/ui latest components with Tailwind v4 compatibility and Radix UI primitives
    - [ ] Framer Motion for advanced animations with React 19 support
    - [ ] TanStack Query v5.71.10 for server state management (new hook signatures)
    - [ ] Zustand v5 for client state management (React 18+ and TypeScript 4.5+ support)
    - [ ] React Hook Form + Zod for forms with enhanced TypeScript integration
- [ ] **Create sophisticated project architecture**:
  ```
  src/
  ├── app/                    # Next.js app directory
  │   ├── (auth)/            # Auth group layout
  │   ├── (dashboard)/       # Dashboard group layout
  │   └── api/               # API routes
  ├── components/
  │   ├── ui/                # Base UI components
  │   ├── widgets/           # Composite components
  │   └── layouts/           # Layout components
  ├── lib/
  │   ├── api/               # API client
  │   ├── hooks/             # Custom hooks
  │   └── utils/             # Utilities
  └── styles/
      ├── globals.css        # Global styles
      └── themes/            # Theme configurations
  ```
- [ ] **Implement premium design system**:
    - [ ] macOS-style glass morphism components
    - [ ] Smooth theme toggle with system detection
    - [ ] Advanced shadow and elevation system
    - [ ] Premium color palette with semantic colors
- [ ] **Create responsive layout foundation**:
    - [ ] Collapsible sidebar with smooth animations
    - [ ] Glass morphism header bar
    - [ ] Floating action buttons
    - [ ] Mobile-first responsive design
- [ ] **Set up comprehensive testing**:
    - [ ] Jest + React Testing Library for unit tests
    - [ ] Cypress for E2E testing
    - [ ] MSW for API mocking
    - [ ] Visual regression testing setup
- [ ] **Configure performance optimization**:
    - [ ] Code splitting and lazy loading
    - [ ] Image optimization with Next/Image
    - [ ] Font optimization with next/font
    - [ ] Bundle analyzer setup

#### 1.3 🔵 Supabase Database Setup (`lms-backend`)
- [ ] Create Supabase project and obtain connection credentials
- [ ] Set up local development environment with Supabase CLI
- [ ] Install and configure golang-migrate for Supabase
- [ ] Create database connection module for Supabase PostgreSQL
- [ ] Set up connection pooling with pgx for Supabase
- [ ] Configure Supabase authentication integration
- [ ] Test database connectivity with Supabase
- [ ] **Write Supabase connection tests**
- [ ] **Set up Supabase real-time subscriptions** (for future features)

#### 1.4 🔵 Redis Setup (`lms-backend`)
- [ ] **Write Redis connection tests** (unit tests)
- [ ] Install and configure Redis (local development)
- [ ] Create Redis connection module (TDD)
- [ ] **Test Redis connectivity** (integration tests)
- [ ] Set up basic session storage (TDD)
- [ ] **Write Redis session tests**

#### 1.5 🔵 Backend Development Environment (`lms-backend`)
- [ ] Create Docker development environment for backend
- [ ] Set up docker-compose for backend services (Supabase local, Redis)
- [ ] Create Makefile with testing commands
- [ ] Install and configure Air for hot reloading
- [ ] Set up environment variable management (Supabase URL, keys)
- [ ] **Configure test environment** (separate Supabase test project)
- [ ] **Set up continuous testing** (test watch mode)
- [ ] **Configure Supabase local development** (supabase start)

#### 1.6 🟠 Premium Frontend Development Environment (`lms-frontend`)
- [ ] **Configure Next.js 15.1.8 for optimal DX**:
    - [ ] Set up Turbopack (Next.js 15's enhanced bundler) for faster builds
    - [ ] Configure path aliases (@components, @lib, etc.) with TypeScript 5.9.2 support
    - [ ] Enable TypeScript 5.9.2 strict mode with enhanced error checking
    - [ ] Set up ESLint 9 with flat config support and modern React rules
    - [ ] Configure Prettier 3 with improved performance and auto-format on save
- [ ] **Environment configuration**:
    - [ ] `.env.local` for development
    - [ ] `.env.production` for production
    - [ ] Type-safe environment variables with Zod
- [ ] **Advanced development features**:
    - [ ] Hot Module Replacement (HMR) optimization
    - [ ] Error overlay customization
    - [ ] Performance monitoring in dev mode
    - [ ] Bundle size analysis integration
- [ ] **Testing infrastructure**:
    - [ ] Jest 30 configuration with enhanced TypeScript 5.9.2 support and CSS modules
    - [ ] React Testing Library custom render with React 19 compatibility
    - [ ] Cypress latest with component testing setup and Next.js 15 support
    - [ ] Coverage reporting with Istanbul and improved source map support
- [ ] **Design system tooling**:
    - [ ] Storybook for component documentation
    - [ ] Design token generation pipeline
    - [ ] Theme preview and switching
    - [ ] Component playground
- [ ] **Developer experience enhancements**:
    - [ ] VS Code settings and extensions config
    - [ ] Debugging configuration
    - [ ] Git hooks with Husky
    - [ ] Commit linting with Commitizen

#### 1.7 🔵 Backend Logging & Monitoring (`lms-backend`)
- [ ] Set up structured logging with slog
- [ ] Create basic request logging middleware
- [ ] Set up health check endpoints
- [ ] Configure basic error handling
- [ ] **Write logging and monitoring tests**

**Phase 1 Completion Criteria**: ✅ All services running locally, basic project structure in place, **test framework configured and first tests passing**

---

## Phase 2: Authentication & Authorization
**Timeline**: Week 3  
**Status**: ⏳ Pending

### Milestones:

#### 2.1 🔵 JWT Authentication System (`lms-backend`) (TDD)
- [ ] **Write JWT token generation tests** (unit tests)
- [ ] Implement JWT token generation with RSA256
- [ ] **Write refresh token tests** (unit tests)
- [ ] Create refresh token system
- [ ] **Write password hashing tests** (unit tests)
- [ ] Set up Argon2 password hashing
- [ ] **Write authentication middleware tests** (unit tests)
- [ ] Create authentication middleware
- [ ] **Write token validation tests** (integration tests)
- [ ] Implement token validation and refresh

#### 2.2 🔵 User Management Backend (`lms-backend`) (TDD)
- [ ] **Write User model tests** (unit tests)
- [ ] Create User model and database operations
- [ ] **Write login/logout endpoint tests** (integration tests)
- [ ] Implement login/logout endpoints
- [ ] **Write password reset tests** (unit tests)
- [ ] Create password reset functionality
- [ ] **Write user profile tests** (unit tests)
- [ ] Add user profile management
- [ ] **Write RBAC tests** (unit tests)
- [ ] Set up role-based access control (RBAC)

#### 2.3 🟠 Premium Authentication Frontend (`lms-frontend`) (TDD)
- [ ] **Write comprehensive auth tests** (component + integration):
    - [ ] Login form component tests
    - [ ] Form validation tests
    - [ ] Authentication flow tests
    - [ ] Protected route tests
    - [ ] Session management tests
- [ ] **Create stunning login experience**:
    - [ ] Glass morphism login card with backdrop blur
    - [ ] Animated form transitions
    - [ ] Password strength indicator with colors
    - [ ] Remember me with custom checkbox
    - [ ] Social login buttons (if applicable)
- [ ] **Implement advanced form features**:
    - [ ] Real-time validation with debouncing
    - [ ] Error messages with smooth animations
    - [ ] Loading states with skeleton screens
    - [ ] Success animations on login
    - [ ] Auto-focus management
- [ ] **Build robust auth infrastructure**:
    - [ ] JWT token management with refresh
    - [ ] Axios interceptors for auth headers
    - [ ] Automatic token refresh on 401
    - [ ] Session timeout warnings
    - [ ] Multi-tab session sync
- [ ] **Create protected route system**:
    - [ ] Role-based route protection
    - [ ] Loading states with suspense
    - [ ] Redirect to intended page after login
    - [ ] Guest route protection
    - [ ] Permission-based UI rendering
- [ ] **Design beautiful auth UI elements**:
    - [ ] Floating labels for inputs
    - [ ] Custom password visibility toggle
    - [ ] Biometric authentication UI (if applicable)
    - [ ] Two-factor authentication flow
    - [ ] Password reset with email verification

#### 2.4 🔵 Rate Limiting & Security (`lms-backend`) (TDD)
- [ ] **Write rate limiting tests** (unit tests)
- [ ] Implement Redis-based rate limiting
- [ ] **Write security headers tests** (integration tests)
- [ ] Add security headers middleware
- [ ] **Write CORS tests** (integration tests)
- [ ] Set up CORS configuration
- [ ] **Write input validation tests** (unit tests)
- [ ] Add input validation middleware
- [ ] **Test security measures** (integration tests)

**Phase 2 Completion Criteria**: ✅ Librarians can securely log in and access protected routes + **All authentication tests passing (>90% coverage)**

---

## Phase 3: Core Database Operations
**Timeline**: Week 4  
**Status**: ⏳ Pending

### Milestones:

#### 3.1 🔵 Supabase Schema Implementation (`lms-backend`) (TDD)
- [ ] **Write migration tests** (integration tests)
- [ ] Create users table migration in Supabase
- [ ] **Write students table tests** (integration tests)
- [ ] Create students table migration in Supabase
- [ ] **Write books table tests** (integration tests)
- [ ] Create books table migration in Supabase
- [ ] **Write transactions table tests** (integration tests)
- [ ] Create transactions table migration in Supabase
- [ ] **Write reservations table tests** (integration tests)
- [ ] Create reservations table migration in Supabase
- [ ] **Write audit_logs table tests** (integration tests)
- [ ] Create audit_logs table migration in Supabase
- [ ] **Write notifications table tests** (integration tests)
- [ ] Create notifications table migration in Supabase
- [ ] **Configure Row Level Security (RLS)** for all tables
- [ ] **Set up Supabase auth integration** with custom user tables

#### 3.2 🔵 Supabase Indexes & Constraints (`lms-backend`) (TDD)
- [ ] **Write index performance tests** (performance tests)
- [ ] Add performance indexes to all Supabase tables
- [ ] **Write constraint tests** (integration tests)
- [ ] Implement foreign key constraints in Supabase
- [ ] **Write validation tests** (unit tests)
- [ ] Add check constraints for data validation
- [ ] **Write Supabase function tests** (unit tests)
- [ ] Create Supabase database functions for common operations
- [ ] **Write RLS policy tests** (security tests)
- [ ] Configure Row Level Security policies for data isolation
- [ ] **Run database performance tests** (performance tests)

#### 3.3 🔵 SQLC with Supabase Integration (`lms-backend`) (TDD)
- [ ] Set up SQLC configuration for Supabase PostgreSQL
- [ ] **Write CRUD operation tests** (unit tests)
- [ ] Write SQL queries for all CRUD operations with RLS
- [ ] Generate Go code from SQL
- [ ] **Write database service tests** (unit tests)
- [ ] Create database service layer with Supabase connection
- [ ] **Write Supabase client integration tests** (integration tests)
- [ ] Integrate with Supabase Go client library
- [ ] **Run all database operation tests** (integration tests)
- [ ] **Verify test coverage >90%**

#### 3.4 🔵 Audit Logging System (`lms-backend`) (TDD)
- [ ] **Write audit logging tests** (unit tests)
- [ ] Create audit logging middleware
- [ ] **Write change tracking tests** (integration tests)
- [ ] Implement change tracking for all tables
- [ ] **Write retention policy tests** (unit tests)
- [ ] Set up audit log retention policy
- [ ] **Test audit trail functionality** (integration tests)

#### 3.5 🔵 Soft Delete Implementation (`lms-backend`) (TDD)
- [ ] **Write soft delete tests** (unit tests)
- [ ] Add soft delete support to models
- [ ] **Write query filter tests** (unit tests)
- [ ] Update queries to respect soft deletes
- [ ] **Write restore functionality tests** (unit tests)
- [ ] Create restore functionality
- [ ] **Test soft delete operations** (integration tests)

**Phase 3 Completion Criteria**: ✅ All Supabase database operations working with RLS, proper constraints and audit trails + **Database tests passing (>95% coverage)**

---

## Phase 4: Book Management System
**Timeline**: Week 5-6  
**Status**: ⏳ Pending

### Milestones:

#### 4.1 Book Model & Operations (TDD)
- [ ] **Write Book model tests** (unit tests)
- [ ] Create Book model with validation
- [ ] **Write book CRUD tests** (unit tests)
- [ ] Implement book CRUD operations
- [ ] **Write book search tests** (unit tests)
- [ ] Add book search functionality
- [ ] **Write availability tracking tests** (unit tests)
- [ ] Create book availability tracking
- [ ] **Write categorization tests** (unit tests)
- [ ] Add book categorization

#### 4.2 🔵 Book Management API (`lms-backend`) (TDD)
- [ ] **Write book endpoint tests** (integration tests)
- [ ] Create book endpoints with pagination
- [ ] **Write advanced search tests** (integration tests)
- [ ] Add advanced search with filters
- [ ] **Write validation tests** (unit tests)
- [ ] Implement book validation rules
- [ ] **Write image upload tests** (integration tests)
- [ ] Add book cover image upload
- [ ] **Write import/export tests** (integration tests)
- [ ] Create book import/export functionality

#### 4.3 🟠 Premium Book Management Frontend (`lms-frontend`) (TDD)
- [ ] **Write comprehensive component tests**:
    - [ ] Book list with pagination tests
    - [ ] Book card component tests
    - [ ] Search and filter tests
    - [ ] Form validation tests
    - [ ] Image upload tests
- [ ] **Create stunning book catalog interface**:
    - [ ] **Grid View**:
        - [ ] Beautiful book cards with cover images
        - [ ] Hover effects with scale and shadow
        - [ ] Quick actions on hover (edit, delete, view)
        - [ ] Availability status badges
        - [ ] Loading skeletons during fetch
    - [ ] **List View**:
        - [ ] Compact table with sorting
        - [ ] Inline editing capabilities
        - [ ] Bulk selection with checkboxes
        - [ ] Sticky header on scroll
        - [ ] Virtualized scrolling for performance
- [ ] **Build advanced search experience**:
    - [ ] Global search with Command+K shortcut
    - [ ] Search suggestions dropdown
    - [ ] Recent searches history
    - [ ] Search filters sidebar
    - [ ] Live results with highlighting
- [ ] **Implement elegant book forms**:
    - [ ] Multi-step form wizard
    - [ ] Auto-save draft functionality
    - [ ] Rich text editor for descriptions
    - [ ] ISBN auto-fetch integration
    - [ ] Barcode scanner support
- [ ] **Create beautiful book details modal**:
    - [ ] Glass morphism modal overlay
    - [ ] Image gallery with zoom
    - [ ] Animated tabs for information sections
    - [ ] Related books carousel
    - [ ] Share and export options
- [ ] **Design drag-and-drop upload**:
    - [ ] Dropzone with dashed border
    - [ ] File preview with progress
    - [ ] Multiple file upload support
    - [ ] Image cropping and editing
    - [ ] Automatic image optimization

#### 4.4 🔵 Backend Search & Filtering (`lms-backend`)
- [ ] **Write search algorithm tests** (unit tests)
- [ ] Implement full-text search
- [ ] **Write search endpoint tests** (integration tests)
- [ ] Add search by title, author, ISBN, book_id
- [ ] **Write filtering tests** (unit tests)
- [ ] Create advanced filtering options
- [ ] **Write search performance tests** (performance tests)
- [ ] Optimize search performance

#### 4.5 🟠 Frontend Search & Filtering (`lms-frontend`)
- [ ] **Write search component tests** (component tests)
- [ ] Create macOS-style search interface with filters
- [ ] **Write search result tests** (component tests)
- [ ] Add search result highlighting with smooth animations
- [ ] **Write filter component tests** (component tests)
- [ ] Create advanced filtering UI with sidebar panels
- [ ] **Write keyboard navigation tests** (accessibility tests)
- [ ] Implement full keyboard navigation support

#### 4.6 🔵 Backend Inventory Management (`lms-backend`)
- [ ] **Write bulk operations tests** (integration tests)
- [ ] Add bulk book operations
- [ ] **Write stock management tests** (unit tests)
- [ ] Create book stock management
- [ ] **Write condition tracking tests** (unit tests)
- [ ] Implement book condition tracking
- [ ] **Write maintenance log tests** (unit tests)
- [ ] Create book maintenance logs

#### 4.7 🟠 Frontend Inventory Management (`lms-frontend`)
- [ ] **Write bulk operations UI tests** (component tests)
- [ ] Create elegant bulk operations interface with progress indicators
- [ ] **Write inventory dashboard tests** (component tests)
- [ ] Build inventory management dashboard with real-time updates
- [ ] **Write maintenance UI tests** (component tests)
- [ ] Create book maintenance interface with status tracking
- [ ] **Write notification system tests** (component tests)
- [ ] Implement toast notifications for user feedback
- [ ] **Write dark mode compatibility tests** (visual tests)
- [ ] Ensure all components work perfectly in both themes

**Phase 4 Completion Criteria**: ✅ Complete book catalog management with search and inventory tracking + **Book management tests passing (>90% coverage)** + **Premium macOS-inspired design system fully implemented with glass morphism, smooth animations, and sophisticated theme management**

---

## Phase 5: Student Management
**Timeline**: Week 7  
**Status**: ⏳ Pending

### Milestones:

#### 5.1 🔵 Student Model & Operations (`lms-backend`) (TDD)
- [ ] **Write Student model tests** (unit tests)
- [ ] Create Student model with validation
- [ ] **Write student CRUD tests** (unit tests)
- [ ] Implement student CRUD operations
- [ ] **Write student search tests** (unit tests)
- [ ] Add student search functionality
- [ ] **Write student ID generation tests** (unit tests)
- [ ] Create student ID generation system
- [ ] **Write student status tests** (unit tests)
- [ ] Add student status management

#### 5.2 🔵 Student Management API (`lms-backend`) (TDD)
- [ ] **Write student endpoint tests** (integration tests)
- [ ] Create student endpoints with pagination
- [ ] **Write search and filtering tests** (integration tests)
- [ ] Add student search and filtering
- [ ] **Write bulk import tests** (integration tests)
- [ ] Implement bulk student import (CSV)
- [ ] **Write validation tests** (unit tests)
- [ ] Add student validation rules
- [ ] **Write profile management tests** (unit tests)
- [ ] Create student profile management

#### 5.3 🟠 Student Management Frontend (`lms-frontend`) (TDD)
- [ ] **Write student list component tests** (component tests)
- [ ] Create student list page with pagination
- [ ] **Write student form tests** (component tests)
- [ ] Build student creation/editing forms
- [ ] **Write search component tests** (component tests)
- [ ] Add student search with filters
- [ ] **Write student details tests** (component tests)
- [ ] Create student details view
- [ ] **Write bulk import UI tests** (component tests)
- [ ] Add bulk student import UI

#### 5.4 🔵 Student Account Creation (`lms-backend`) (TDD)
- [ ] **Write account creation tests** (unit tests)
- [ ] Implement quick student account creation
- [ ] **Write password generation tests** (unit tests)
- [ ] Set student ID as default password
- [ ] **Write account validation tests** (unit tests)
- [ ] Add student account validation
- [ ] **Write account workflow tests** (integration tests)
- [ ] Test student account workflow

#### 5.5 🟠 Student Information Display (`lms-frontend`) (TDD)
- [ ] **Write student info component tests** (component tests)
- [ ] Create student information display
- [ ] **Write account creation UI tests** (component tests)
- [ ] Build student account creation interface

#### 5.6 🔵 Student Data Management (`lms-backend`) (TDD)
- [ ] **Write year organization tests** (unit tests)
- [ ] Add student year-based organization
- [ ] **Write activity tracking tests** (unit tests)
- [ ] Create student activity tracking
- [ ] **Write status management tests** (unit tests)
- [ ] Implement student status management
- [ ] **Write data export tests** (unit tests)
- [ ] Add student data export
- [ ] **Write statistics tests** (unit tests)
- [ ] Create student statistics

#### 5.7 🟠 Student Data Frontend (`lms-frontend`) (TDD)
- [ ] **Write data management UI tests** (component tests)
- [ ] Create student data management interface
- [ ] **Write statistics dashboard tests** (component tests)
- [ ] Build student statistics dashboard

**Phase 5 Completion Criteria**: ✅ Complete student management with easy account creation for librarians

---

## Phase 6: Transaction & Reservation System
**Timeline**: Week 8-9  
**Status**: ⏳ Pending

### Milestones:

#### 6.1 🔵 Transaction System Backend (`lms-backend`) (TDD)
- [ ] **Write Transaction model tests** (unit tests)
- [ ] Create Transaction model with validation
- [ ] **Write borrow/return operation tests** (unit tests)
- [ ] Implement borrow/return operations
- [ ] **Write transaction history tests** (unit tests)
- [ ] Add transaction history tracking
- [ ] **Write overdue detection tests** (unit tests)
- [ ] Create overdue book detection
- [ ] **Write fine calculation tests** (unit tests)
- [ ] Add fine calculation system

#### 6.2 🔵 Book Borrowing Logic (`lms-backend`) (TDD) ✅ COMPLETED
- [x] **Write availability checking tests** (unit tests)
- [x] Implement book availability checking
- [x] **Write borrowing rules tests** (unit tests)
- [x] Create borrowing business rules
- [x] **Write borrowing limits tests** (unit tests)
- [x] Add borrowing limits per student
- [x] **Write transaction validation tests** (unit tests)
- [x] Create transaction validation
- [x] **Write period management tests** (unit tests)
- [x] Add borrowing period management

#### 6.3 🔵 Book Return Logic (`lms-backend`) (TDD)
- [ ] **Write return processing tests** (unit tests)
- [ ] Implement return processing
- [ ] **Write overdue detection tests** (unit tests)
- [ ] Add overdue detection and fine calculation
- [ ] **Write return validation tests** (unit tests)
- [ ] Create return validation
- [ ] **Write condition assessment tests** (unit tests)
- [ ] Add book condition assessment
- [ ] **Write availability update tests** (unit tests)
- [ ] Update book availability

#### 6.4 🟠 Transaction Management Frontend (`lms-frontend`) (TDD)
- [ ] **Write borrowing interface tests** (component tests)
- [ ] Create borrowing interface
- [ ] **Write return processing UI tests** (component tests)
- [ ] Build return processing interface
- [ ] **Write transaction history tests** (component tests)
- [ ] Add transaction history view
- [ ] **Write overdue dashboard tests** (component tests)
- [ ] Create overdue books dashboard
- [ ] **Write fine management tests** (component tests)
- [ ] Add fine management interface

#### 6.5 🔵 Reservation System Backend (`lms-backend`) (TDD) ✅ COMPLETED
- [x] **Write reservation model tests** (unit tests)
- [x] Create reservation model and operations
- [x] **Write queue management tests** (unit tests)
- [x] Implement reservation queue management
- [x] **Write expiration handling tests** (unit tests)
- [x] Add reservation expiration handling
- [x] **Write fulfillment process tests** (unit tests)
- [x] Create reservation fulfillment process
- [x] **Write comprehensive unit tests** (>90% coverage achieved)
- [x] Create HTTP handlers for reservation endpoints
- [x] Create reservation request/response models and validation
- [x] Integrate reservation system with transaction system for automatic fulfillment
- [x] Run integration tests to ensure compatibility with existing features

#### 6.6 🟠 Reservation System Frontend (`lms-frontend`) (TDD)
- [ ] **Write reservation UI tests** (component tests)
- [ ] Add reservation management UI
- [ ] **Write reservation queue tests** (component tests)
- [ ] Create reservation queue interface

#### 6.7 🔵 Renewal System Backend (`lms-backend`) (TDD)
- [ ] **Write renewal logic tests** (unit tests)
- [ ] Implement book renewal logic
- [ ] **Write renewal validation tests** (unit tests)
- [ ] Add renewal validation rules
- [ ] **Write renewal processing tests** (unit tests)
- [ ] Create renewal processing
- [ ] **Write renewal history tests** (unit tests)
- [ ] Add renewal history tracking

#### 6.8 🟠 Renewal System Frontend (`lms-frontend`) (TDD)
- [ ] **Write renewal UI tests** (component tests)
- [ ] Create renewal management UI
- [ ] **Write renewal history tests** (component tests)
- [ ] Add renewal history interface

**Phase 6 Completion Criteria**: ✅ Complete transaction system with borrowing, returning, and reservations

---

## Phase 7: Notification System
**Timeline**: Week 10  
**Status**: ⏳ Pending

### Milestones:

#### 7.1 🔵 Notification Infrastructure (`lms-backend`) (TDD)
- [ ] **Write notification model tests** (unit tests)
- [ ] Create notification model and operations
- [ ] **Write email service tests** (unit tests)
- [ ] Set up email service integration
- [ ] **Write notification template tests** (unit tests)
- [ ] Create notification templates
- [ ] **Write queuing system tests** (unit tests)
- [ ] Add notification queuing system
- [ ] **Write status tracking tests** (unit tests)
- [ ] Implement notification status tracking

#### 7.2 🔵 Automated Notifications (`lms-backend`) (TDD)
- [ ] **Write due date reminder tests** (unit tests)
- [ ] Create due date reminder system
- [ ] **Write overdue notification tests** (unit tests)
- [ ] Add overdue book notifications
- [ ] **Write availability alert tests** (unit tests)
- [ ] Implement book availability alerts
- [ ] **Write fine notice tests** (unit tests)
- [ ] Create fine notice system
- [ ] **Write maintenance notification tests** (unit tests)
- [ ] Add system maintenance notifications

#### 7.3 🟠 Notification Management (`lms-frontend`) (TDD)
- [ ] **Write notification dashboard tests** (component tests)
- [ ] Create notification dashboard
- [ ] **Write notification history tests** (component tests)
- [ ] Add notification history view
- [ ] **Write notification preferences tests** (component tests)
- [ ] Implement notification preferences
- [ ] **Write template management tests** (component tests)
- [ ] Create notification templates management
- [ ] **Write notification statistics tests** (component tests)
- [ ] Add notification statistics

#### 7.4 🔵 Email Integration (`lms-backend`) (TDD)
- [ ] **Write SMTP configuration tests** (unit tests)
- [ ] Set up SMTP configuration
- [ ] **Write email template tests** (unit tests)
- [ ] Create email templates
- [ ] **Write delivery tracking tests** (unit tests)
- [ ] **Write queue processing tests** (unit tests)
- [ ] Implement email queue processing
- [ ] **Test email delivery system** (integration tests)

**Phase 7 Completion Criteria**: ✅ Automated notification system for overdue books and important events

---

## Phase 8: Reporting & Analytics
**Timeline**: Week 11  
**Status**: ⏳ Pending

### Milestones:

#### 8.1 🔵 Basic Reports (`lms-backend`) (TDD)
- [ ] **Write borrowing statistics tests** (unit tests)
- [ ] Create borrowing statistics report
- [ ] **Write overdue books tests** (unit tests)
- [ ] Add overdue books report
- [ ] **Write popular books tests** (unit tests)
- [ ] Implement popular books report
- [ ] **Write student activity tests** (unit tests)
- [ ] Create student activity report
- [ ] **Write inventory status tests** (unit tests)
- [ ] Add inventory status report

#### 8.2 🔵 Year-based Reporting (`lms-backend`) (TDD)
- [ ] **Write year-specific tests** (unit tests)
- [ ] Create year-specific borrowing reports
- [ ] **Write year-based overdue tests** (unit tests)
- [ ] Add year-based overdue tracking
- [ ] **Write year comparison tests** (unit tests)
- [ ] Implement year comparison reports
- [ ] **Write year-end summary tests** (unit tests)
- [ ] Create year-end summary reports
- [ ] **Write year-based analytics tests** (unit tests)
- [ ] Add year-based analytics

#### 8.3 🔵 Advanced Analytics (`lms-backend`) (TDD)
- [ ] **Write borrowing trends tests** (unit tests)
- [ ] Create borrowing trends analysis
- [ ] **Write book popularity tests** (unit tests)
- [ ] Add book popularity analytics
- [ ] **Write usage pattern tests** (unit tests)
- [ ] Implement usage pattern analysis
- [ ] **Write predictive analytics tests** (unit tests)
- [ ] Create predictive analytics
- [ ] **Write data visualization tests** (unit tests)
- [ ] Add data visualization

#### 8.4 🟠 Report Management (`lms-frontend`) (TDD)
- [ ] **Write report generation tests** (component tests)
- [ ] Create report generation interface
- [ ] **Write report scheduling tests** (component tests)
- [ ] Add report scheduling
- [ ] **Write report export tests** (component tests)
- [ ] Implement report export (PDF, Excel)
- [ ] **Write report sharing tests** (component tests)
- [ ] Create report sharing functionality
- [ ] **Write report templates tests** (component tests)
- [ ] Add report templates

#### 8.5 🟠 Dashboard Creation (`lms-frontend`) (TDD)
- [ ] **Write main dashboard tests** (component tests)
- [ ] Create main dashboard with key metrics
- [ ] **Write real-time statistics tests** (component tests)
- [ ] Add real-time statistics
- [ ] **Write charts and graphs tests** (component tests)
- [ ] Create visual charts and graphs
- [ ] **Write dashboard customization tests** (component tests)
- [ ] Implement dashboard customization
- [ ] **Write dashboard export tests** (component tests)
- [ ] Add dashboard export

**Phase 8 Completion Criteria**: ✅ Comprehensive reporting system with analytics and visual dashboards

---

## Phase 9: Advanced Features
**Timeline**: Week 12  
**Status**: ⏳ Pending

### Milestones:

#### 9.1 🔵 Caching Implementation (`lms-backend`) (TDD)
- [ ] **Write Redis caching tests** (unit tests)
- [ ] Implement Redis caching for frequently accessed data
- [ ] **Write cache invalidation tests** (unit tests)
- [ ] Add cache invalidation strategies
- [ ] **Write cache warming tests** (unit tests)
- [ ] Create cache warming procedures
- [ ] **Write query optimization tests** (performance tests)
- [ ] Optimize query performance with caching
- [ ] **Write cache monitoring tests** (unit tests)
- [ ] Monitor cache hit ratios

#### 9.2  API Versioning (`lms-backend`) (TDD)
- [ ] **Write API versioning tests** (unit tests)
- [ ] Implement API versioning strategy
- [ ] **Write version management tests** (unit tests)
- [ ] Create version management system
- [ ] **Write backward compatibility tests** (integration tests)
- [ ] Add backward compatibility
- [ ] **Write API documentation tests** (unit tests)
- [ ] Create API documentation
- [ ] **Write version migration tests** (integration tests)
- [ ] Test API version migration

#### 9.3 🔵 Backup & Recovery (`lms-backend`) (TDD)
- [ ] **Write backup system tests** (unit tests)
- [ ] Create automated database backup system
- [ ] **Write backup verification tests** (unit tests)
- [ ] Implement backup verification
- [ ] **Write disaster recovery tests** (integration tests)
- [ ] Create disaster recovery procedures
- [ ] **Write backup restoration tests** (integration tests)
- [ ] Test backup restoration process
- [ ] **Write backup monitoring tests** (unit tests)
- [ ] Add backup monitoring

#### 9.4 🔵 Advanced Security (`lms-backend`) (TDD)
- [ ] **Write security headers tests** (unit tests)
- [ ] Implement advanced security headers
- [ ] **Write API key management tests** (unit tests)
- [ ] Add API key management
- [ ] **Write security audit tests** (unit tests)
- [ ] Create security audit logging
- [ ] **Write intrusion detection tests** (unit tests)
- [ ] Implement intrusion detection
- [ ] **Write security monitoring tests** (unit tests)
- [ ] Add security monitoring

#### 9.5 🔵 System Health Monitoring (`lms-backend`) (TDD)
- [ ] **Write health check tests** (unit tests)
- [ ] Create system health checks
- [ ] **Write performance monitoring tests** (unit tests)
- [ ] Add performance monitoring
- [ ] **Write alerting system tests** (unit tests)
- [ ] Implement alerting system
- [ ] **Write log aggregation tests** (unit tests)
- [ ] Add log aggregation

#### 9.6 🟠 Monitoring Dashboard (`lms-frontend`) (TDD)
- [ ] **Write monitoring dashboard tests** (component tests)
- [ ] Create monitoring dashboard
- [ ] **Write system health UI tests** (component tests)
- [ ] Add system health visualization

**Phase 9 Completion Criteria**: ✅ Production-ready system with advanced features and monitoring

---

## Phase 10: Testing & Deployment
**Timeline**: Week 13-14  
**Status**: ⏳ Pending

### Milestones:

#### 10.1 🔵 Backend Unit Testing (`lms-backend`) (TDD)
- [ ] **Write service unit tests** (unit tests)
- [ ] Write unit tests for all backend services
- [ ] **Write database operation tests** (unit tests)
- [ ] Add database operation tests
- [ ] **Write API endpoint tests** (unit tests)
- [ ] Implement API endpoint tests
- [ ] **Achieve >90% backend test coverage** (coverage tests)

#### 10.2 🟠 Frontend Unit Testing (`lms-frontend`) (TDD)
- [ ] **Write component unit tests** (unit tests)
- [ ] Create unit tests for frontend components
- [ ] **Write service unit tests** (unit tests)
- [ ] Add frontend service tests
- [ ] **Achieve >90% frontend test coverage** (coverage tests)

#### 10.3 🔵 Backend Integration Testing (`lms-backend`) (TDD)
- [ ] **Write API integration tests** (integration tests)
- [ ] Create API integration tests
- [ ] **Write database integration tests** (integration tests)
- [ ] Add database integration tests
- [ ] **Write authentication flow tests** (integration tests)
- [ ] Test authentication flows
- [ ] **Write transaction flow tests** (integration tests)
- [ ] Create end-to-end transaction tests
- [ ] **Write error handling tests** (integration tests)
- [ ] Add error handling tests

#### 10.4 🟠 Frontend Integration Testing (`lms-frontend`) (TDD)
- [ ] **Write E2E tests** (E2E tests)
- [ ] Create end-to-end user flow tests
- [ ] **Write API integration tests** (integration tests)
- [ ] Test frontend-backend integration
- [ ] **Write user workflow tests** (integration tests)
- [ ] Test complete user workflows

#### 10.5 🔵 Performance Testing (`lms-backend`) (TDD)
- [ ] **Write load testing scenarios** (performance tests)
- [ ] Create load testing scenarios
- [ ] **Write database performance tests** (performance tests)
- [ ] Test database performance under load
- [ ] **Write API performance benchmarks** (performance tests)
- [ ] Add API performance benchmarks
- [ ] **Write concurrent user tests** (performance tests)
- [ ] Test concurrent user scenarios
- [ ] **Write optimization tests** (performance tests)
- [ ] Optimize performance bottlenecks

#### 10.6 🔵 Security Testing (`lms-backend`) (TDD)
- [ ] **Write security vulnerability tests** (security tests)
- [ ] Perform security vulnerability scans
- [ ] **Write authentication security tests** (security tests)
- [ ] Test authentication security
- [ ] **Write input validation tests** (security tests)
- [ ] Add input validation tests
- [ ] **Write SQL injection tests** (security tests)
- [ ] Test SQL injection prevention
- [ ] **Write penetration tests** (security tests)
- [ ] Perform penetration testing

#### 10.7 🔵 Backend Deployment Setup (`lms-backend`)
- [ ] Create production Docker configuration
- [ ] Set up GitHub Actions CI/CD for backend
- [ ] Configure production environment
- [ ] Create deployment scripts
- [ ] Set up monitoring and logging

#### 10.8 🟠 Frontend Deployment Setup (`lms-frontend`)
- [ ] Create production build configuration
- [ ] Set up GitHub Actions CI/CD for frontend
- [ ] Configure Netlify deployment
- [ ] Create deployment scripts
- [ ] Set up frontend monitoring

#### 10.9 📝 Documentation
- [ ] Create API documentation
- [ ] Write user manual for librarians
- [ ] Create system administration guide
- [ ] Add troubleshooting documentation
- [ ] Create training materials

**Phase 10 Completion Criteria**: ✅ Fully tested, documented, and deployed system ready for production use

---

## Project Milestones Summary

| Phase | Status | Start Date | End Date | Key Deliverable |
|-------|--------|------------|----------|-----------------|
| 1 | ⏳ Pending | - | - | Development Environment Ready |
| 2 | ⏳ Pending | - | - | Authentication System Complete |
| 3 | ⏳ Pending | - | - | Database Operations Ready |
| 4 | ⏳ Pending | - | - | Book Management System |
| 5 | ⏳ Pending | - | - | Student Management System |
| 6 | ⏳ Pending | - | - | Transaction System |
| 7 | ⏳ Pending | - | - | Notification System |
| 8 | ⏳ Pending | - | - | Reporting & Analytics |
| 9 | ⏳ Pending | - | - | Advanced Features |
| 10 | ⏳ Pending | - | - | Production Ready System |

---

## Risk Assessment & Mitigation

### High Risk Items:
- **Database Performance**: Large transaction volumes may impact performance
    - *Mitigation*: Implement proper indexing and connection pooling
- **Authentication Security**: JWT implementation must be secure
    - *Mitigation*: Use proven libraries and security best practices
- **Data Migration**: Future student feature activation must be seamless
    - *Mitigation*: Test migration procedures thoroughly

### Medium Risk Items:
- **Third-party Dependencies**: External libraries may have vulnerabilities
    - *Mitigation*: Regular dependency updates and security scanning
- **Notification Delivery**: Email/SMS services may fail
    - *Mitigation*: Implement fallback notification methods

### Low Risk Items:
- **UI/UX Complexity**: Interface may be too complex for librarians
    - *Mitigation*: User testing and iterative design improvements

---

## Success Metrics

### Phase 1-6 (Core System):
- [ ] System processes book transactions in <2 seconds
- [ ] Librarians can create student accounts in <30 seconds
- [ ] Book search returns results in <1 second
- [ ] System handles 100+ concurrent transactions without issues

### Phase 7-10 (Advanced Features):
- [ ] Automated notifications reduce overdue books by 50%
- [ ] Report generation completes in <5 seconds
- [ ] System uptime >99.9%
- [ ] Zero data loss incidents

### User Satisfaction:
- [ ] Librarians report 80%+ time savings on routine tasks
- [ ] System adoption rate >90% within first month
- [ ] User satisfaction score >4.5/5
- [ ] Zero critical bugs in production

---

## 🔄 Repository Development Strategy

### **Development Order**
1. **🔵 Backend First** (`lms-backend` repository)
    - Set up infrastructure and database
    - Implement authentication and core APIs
    - Build business logic and data operations
    - Create comprehensive test coverage

2. **🟠 Frontend Second** (`lms-frontend` repository)
    - Set up Next.js application
    - Build UI components and pages
    - Integrate with backend APIs
    - Add frontend testing and E2E tests

3. **🔗 Integration Third**
    - Test complete user workflows
    - Verify API contracts and data flow
    - Optimize performance and security
    - Deploy both repositories

### **Development Workflow**
```
Phase 1-3: 🔵 Backend Infrastructure → Database → Authentication
Phase 4-6: 🔵 Backend APIs → 🟠 Frontend UI → Integration
Phase 7-8: 🔵 Advanced Backend → 🟠 Advanced Frontend
Phase 9-10: 🔵🟠 Testing → Deployment → Documentation
```

### **Repository Coordination**
- **API Contracts**: Define and document API endpoints before frontend development
- **Type Synchronization**: Maintain consistent data types between Go structs and TypeScript interfaces
- **Testing Coordination**: Backend unit tests → Frontend component tests → Integration tests
- **Deployment Coordination**: Backend deployment → Frontend deployment → System verification

---

## Next Steps
1. **Immediate**: Set up 🔵 backend development environment (Phase 1)
2. **Week 1**: Complete 🔵 backend infrastructure setup
3. **Week 2**: Begin 🔵 backend authentication system implementation
4. **Week 3**: Start 🟠 frontend development after backend APIs are ready
5. **Weekly Reviews**: Assess progress and adjust timeline as needed

---

*Last Updated: [Current Date]*  
*Project Manager: [Your Name]*  
*Status: Planning Complete - Ready for TDD Implementation*

**🔵 Backend Repository**: `lms-backend` (Go + Supabase PostgreSQL + Redis)  
**🟠 Frontend Repository**: `lms-frontend` (Next.js 15.1.8 + TypeScript 5.9.2 + Tailwind CSS v4)  
**📊 State Management**: TanStack Query v5.71.10 + Zustand v5 + Shadcn/ui with Radix UI  
**🧪 Development Approach**: Test-Driven Development (TDD) with >90% coverage