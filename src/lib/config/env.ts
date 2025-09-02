import { z } from 'zod';

// Environment validation schema
const envSchema = z.object({
  // App Configuration
  NEXT_PUBLIC_APP_NAME: z.string().min(1, 'App name is required'),
  NEXT_PUBLIC_APP_VERSION: z.string().min(1, 'App version is required'),
  NEXT_PUBLIC_APP_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // API Configuration
  NEXT_PUBLIC_API_URL: z
    .string()
    .url('API URL must be a valid URL')
    .min(1, 'API URL is required'),

  // Features
  NEXT_PUBLIC_ENABLE_ANALYTICS: z
    .string()
    .optional()
    .transform(val => val === 'true')
    .default(() => false),
  NEXT_PUBLIC_ENABLE_DEV_TOOLS: z
    .string()
    .optional()
    .transform(val => val === 'true')
    .default(() => true),
  NEXT_PUBLIC_ENABLE_DEBUG: z
    .string()
    .optional()
    .transform(val => val === 'true')
    .default(() => true),

  // File Upload
  NEXT_PUBLIC_MAX_FILE_SIZE: z
    .string()
    .optional()
    .transform(val => parseInt(val ?? '5242880', 10))
    .default(() => 5242880), // 5MB
  NEXT_PUBLIC_ALLOWED_FILE_TYPES: z
    .string()
    .optional()
    .transform(val => (val ?? 'image/jpeg,image/png,image/webp,application/pdf').split(',').map(type => type.trim()))
    .default(() => ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),

  // Security
  NEXT_PUBLIC_ENABLE_CSP: z
    .string()
    .optional()
    .transform(val => val === 'true')
    .default(() => false),
  NEXT_PUBLIC_ENABLE_SW: z
    .string()
    .optional()
    .transform(val => val === 'true')
    .default(() => false),
  NEXT_PUBLIC_CACHE_DURATION: z
    .string()
    .optional()
    .transform(val => parseInt(val ?? '0', 10))
    .default(() => 0),
});

// Validate and parse environment variables
function validateEnv(): z.infer<typeof envSchema> {
  try {
    // Create a safe environment object with defaults for client-side
    const safeEnv = {
      NEXT_PUBLIC_APP_NAME: process.env['NEXT_PUBLIC_APP_NAME'] ?? 'Library Management System',
      NEXT_PUBLIC_APP_VERSION: process.env['NEXT_PUBLIC_APP_VERSION'] ?? '1.0.0',
      NEXT_PUBLIC_APP_ENV: process.env['NEXT_PUBLIC_APP_ENV'] ?? 'development',
      NEXT_PUBLIC_API_URL: process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:8080/api/v1',
      NEXT_PUBLIC_ENABLE_ANALYTICS: process.env['NEXT_PUBLIC_ENABLE_ANALYTICS'] ?? 'false',
      NEXT_PUBLIC_ENABLE_DEV_TOOLS: process.env['NEXT_PUBLIC_ENABLE_DEV_TOOLS'] ?? 'true',
      NEXT_PUBLIC_ENABLE_DEBUG: process.env['NEXT_PUBLIC_ENABLE_DEBUG'] ?? 'true',
      NEXT_PUBLIC_MAX_FILE_SIZE: process.env['NEXT_PUBLIC_MAX_FILE_SIZE'] ?? '5242880',
      NEXT_PUBLIC_ALLOWED_FILE_TYPES: process.env['NEXT_PUBLIC_ALLOWED_FILE_TYPES'] ?? 'image/jpeg,image/png,image/webp,application/pdf',
      NEXT_PUBLIC_ENABLE_CSP: process.env['NEXT_PUBLIC_ENABLE_CSP'] ?? 'false',
      NEXT_PUBLIC_ENABLE_SW: process.env['NEXT_PUBLIC_ENABLE_SW'] ?? 'false',
      NEXT_PUBLIC_CACHE_DURATION: process.env['NEXT_PUBLIC_CACHE_DURATION'] ?? '0',
    };

    return envSchema.parse(safeEnv);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((err: z.ZodIssue) => `${err.path?.join('.') ?? 'unknown'}: ${err.message}`);
      
      // In development, log the error but provide fallback values
      if (typeof window !== 'undefined' && isDevelopment) {
        console.warn('🚨 Environment validation issues (using fallbacks):', missingVars);
      } else {
        // In production, this is a critical error
        throw new Error(
          `❌ Environment validation failed:\n${missingVars.join('\n')}\n\nPlease check your .env.local file.`
        );
      }
      
      // Return safe fallback configuration
      return {
        NEXT_PUBLIC_APP_NAME: 'Library Management System',
        NEXT_PUBLIC_APP_VERSION: '1.0.0',
        NEXT_PUBLIC_APP_ENV: 'development' as const,
        NEXT_PUBLIC_API_URL: 'http://localhost:8080/api/v1',
        NEXT_PUBLIC_ENABLE_ANALYTICS: false,
        NEXT_PUBLIC_ENABLE_DEV_TOOLS: true,
        NEXT_PUBLIC_ENABLE_DEBUG: true,
        NEXT_PUBLIC_MAX_FILE_SIZE: 5242880,
        NEXT_PUBLIC_ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
        NEXT_PUBLIC_ENABLE_CSP: false,
        NEXT_PUBLIC_ENABLE_SW: false,
        NEXT_PUBLIC_CACHE_DURATION: 0,
      };
    }

    // For other errors, re-throw
    throw error;
  }
}

// Export environment configuration
export const env = validateEnv();

// Helper flags
export const isDevelopment = env.NEXT_PUBLIC_APP_ENV === 'development';
export const isProduction = env.NEXT_PUBLIC_APP_ENV === 'production';
export const isTest = env.NEXT_PUBLIC_APP_ENV === 'test';

// Features object for easier access
export const features = {
  analytics: env.NEXT_PUBLIC_ENABLE_ANALYTICS,
  devTools: env.NEXT_PUBLIC_ENABLE_DEV_TOOLS,
  debug: env.NEXT_PUBLIC_ENABLE_DEBUG,
  csp: env.NEXT_PUBLIC_ENABLE_CSP,
  serviceWorker: env.NEXT_PUBLIC_ENABLE_SW,
};

// Log environment in development
if (isDevelopment && typeof window !== 'undefined') {
  // eslint-disable-next-line no-console
  console.log('🔧 Environment configuration:', {
    env: env.NEXT_PUBLIC_APP_ENV,
    api: env.NEXT_PUBLIC_API_URL,
    features: {
      analytics: env.NEXT_PUBLIC_ENABLE_ANALYTICS,
      devTools: env.NEXT_PUBLIC_ENABLE_DEV_TOOLS,
      debug: env.NEXT_PUBLIC_ENABLE_DEBUG,
      csp: env.NEXT_PUBLIC_ENABLE_CSP,
      serviceWorker: env.NEXT_PUBLIC_ENABLE_SW,
    },
  });
}

// Default export for convenience
export default env;