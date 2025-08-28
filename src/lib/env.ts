import { z } from "zod";

// Environment variable schema with validation
const envSchema = z.object({
  // Application Configuration
  NEXT_PUBLIC_APP_ENV: z.enum(["development", "production", "staging"]).default("development"),
  NEXT_PUBLIC_APP_NAME: z.string().default("Library Management System"),
  NEXT_PUBLIC_APP_VERSION: z.string().default("1.0.0"),

  // API Configuration
  NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:8080/api/v1"),
  NEXT_PUBLIC_API_TIMEOUT: z.coerce.number().positive().default(10000),

  // Authentication
  NEXT_PUBLIC_JWT_REFRESH_INTERVAL: z.coerce.number().positive().default(300000),
  NEXT_PUBLIC_SESSION_TIMEOUT: z.coerce.number().positive().default(3600000),

  // Features
  NEXT_PUBLIC_ENABLE_NOTIFICATIONS: z.coerce.boolean().default(true),
  NEXT_PUBLIC_ENABLE_RESERVATIONS: z.coerce.boolean().default(true),
  NEXT_PUBLIC_ENABLE_FINES: z.coerce.boolean().default(true),
  NEXT_PUBLIC_ENABLE_ANALYTICS: z.coerce.boolean().default(true),

  // UI Configuration
  NEXT_PUBLIC_THEME_DEFAULT: z.enum(["light", "dark", "system"]).default("system"),
  NEXT_PUBLIC_ITEMS_PER_PAGE: z.coerce.number().positive().default(20),
  NEXT_PUBLIC_SEARCH_DEBOUNCE_MS: z.coerce.number().positive().default(300),

  // Development Tools
  NEXT_PUBLIC_SHOW_DEVTOOLS: z.coerce.boolean().default(false),
  NEXT_PUBLIC_ENABLE_MOCK_API: z.coerce.boolean().default(false),
});

// Validate environment variables
const envValidation = envSchema.safeParse(process.env);

if (!envValidation.success) {
  console.error("❌ Invalid environment variables:", envValidation.error.format());
  throw new Error("Invalid environment configuration");
}

// Export validated and type-safe environment variables
export const env = envValidation.data;

// Type-safe environment helper functions
export const isProduction = () => env.NEXT_PUBLIC_APP_ENV === "production";
export const isDevelopment = () => env.NEXT_PUBLIC_APP_ENV === "development";
export const isStaging = () => env.NEXT_PUBLIC_APP_ENV === "staging";

// Feature flags
export const featureFlags = {
  notifications: env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS,
  reservations: env.NEXT_PUBLIC_ENABLE_RESERVATIONS,
  fines: env.NEXT_PUBLIC_ENABLE_FINES,
  analytics: env.NEXT_PUBLIC_ENABLE_ANALYTICS,
  devtools: env.NEXT_PUBLIC_SHOW_DEVTOOLS,
  mockApi: env.NEXT_PUBLIC_ENABLE_MOCK_API,
} as const;

// API configuration
export const apiConfig = {
  baseUrl: env.NEXT_PUBLIC_API_URL,
  timeout: env.NEXT_PUBLIC_API_TIMEOUT,
} as const;

// Authentication configuration
export const authConfig = {
  refreshInterval: env.NEXT_PUBLIC_JWT_REFRESH_INTERVAL,
  sessionTimeout: env.NEXT_PUBLIC_SESSION_TIMEOUT,
} as const;

// UI configuration
export const uiConfig = {
  theme: {
    default: env.NEXT_PUBLIC_THEME_DEFAULT,
  },
  pagination: {
    itemsPerPage: env.NEXT_PUBLIC_ITEMS_PER_PAGE,
  },
  search: {
    debounceMs: env.NEXT_PUBLIC_SEARCH_DEBOUNCE_MS,
  },
} as const;

// Application metadata
export const appMetadata = {
  name: env.NEXT_PUBLIC_APP_NAME,
  version: env.NEXT_PUBLIC_APP_VERSION,
  environment: env.NEXT_PUBLIC_APP_ENV,
} as const;

// Export types for type safety across the application
export type Environment = typeof env;
export type FeatureFlags = typeof featureFlags;
export type ApiConfig = typeof apiConfig;
export type AuthConfig = typeof authConfig;
export type UiConfig = typeof uiConfig;
export type AppMetadata = typeof appMetadata;