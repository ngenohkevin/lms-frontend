import type { NextConfig } from 'next';

// Bundle analyzer - only import in development or when analyzing
const withBundleAnalyzer = process.env['ANALYZE'] === 'true' || process.env['NODE_ENV'] === 'development'
  ? require('@next/bundle-analyzer')({
      enabled: process.env['ANALYZE'] === 'true',
      openAnalyzer: process.env['NODE_ENV'] === 'development' ? false : true, // Don't auto-open in dev
    })
  : (config: NextConfig) => config;

const nextConfig: NextConfig = {
  // Enhanced compilation and bundling
  experimental: {
    // Optimize compilation
    optimizeCss: true,
    optimizeServerReact: true,
    
    // Enable PPR (Partial Prerendering) when stable
    // ppr: 'incremental',
  },

  // Turbopack configuration (moved from experimental.turbo)
  turbopack: {
    // Turbopack configuration
    resolveAlias: {
      // Custom resolve aliases for faster resolution
      '@': './src',
      '@/components': './src/components',
      '@/lib': './src/lib',
      '@/app': './src/app',
      '@/styles': './src/styles',
    },
  },

  // Compiler optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
    
    // Enable SWC minification
    // This is enabled by default in Next.js 15
  },

  // Performance optimizations
  poweredByHeader: false, // Remove X-Powered-By header
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Development optimizations
  ...(process.env.NODE_ENV === 'development' && {
    // Development-specific optimizations
    devIndicators: {
      buildActivity: true,
      buildActivityPosition: 'bottom-left',
    },
    
    // Faster refresh
    fastRefresh: true,
    
    // Optimize webpack in development
    webpack: (config, { dev, isServer }) => {
      if (dev && !isServer) {
        // Optimize hot reloading
        config.optimization = {
          ...config.optimization,
          removeAvailableModules: false,
          removeEmptyChunks: false,
          splitChunks: false,
        };

        // Improve HMR performance
        config.resolve.alias = {
          ...config.resolve.alias,
          'react-dom$': 'react-dom/profiling',
          'scheduler/tracing': 'scheduler/tracing-profiling',
        };
      }

      // Enhanced source maps in development
      if (dev) {
        config.devtool = 'eval-source-map';
      }

      return config;
    },
  }),

  // Production optimizations
  ...(process.env.NODE_ENV === 'production' && {
    // Production build optimizations
    compress: true,
    generateEtags: true,
    
    // Output configuration
    output: 'standalone',
    
    // Bundle analyzer (conditional)
    ...(process.env['ANALYZE'] === 'true' && {
      webpack: (config) => {
        // Bundle analyzer will be added here if needed
        return config;
      },
    }),
  }),

  // Headers for better performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // TypeScript configuration
  typescript: {
    // Enable strict type checking during build
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    // Enable ESLint during build
    ignoreDuringBuilds: false,
    dirs: ['src'],
  },
};

export default withBundleAnalyzer(nextConfig);
