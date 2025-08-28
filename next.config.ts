import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable experimental features for Next.js 15
  experimental: {
    turbo: {
      // Updated turbo rules configuration
      rules: {
        "*.svg": ["@svgr/webpack"],
      },
    },
    optimizePackageImports: [
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu", 
      "@radix-ui/react-separator",
      "@radix-ui/react-slot",
      "@radix-ui/react-tooltip",
      "lucide-react",
      "framer-motion",
    ],
  },

  // Bundle analyzer for development
  bundlePagesRouterDependencies: true,
  
  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Performance optimizations
  poweredByHeader: false,
  reactStrictMode: true,

  // Custom webpack configuration
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle in development
    if (dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
          },
        },
      };
    }
    return config;
  },
};

export default nextConfig;
