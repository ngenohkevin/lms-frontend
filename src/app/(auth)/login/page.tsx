'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  BookOpen,
  Shield,
  LogIn,
  AlertCircle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/lib/stores/auth-store';
import { cn } from '@/lib/utils';

// Validation schema
const loginSchema = z.object({
  username: z.string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters'),
  password: z.string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
  remember_me: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

// Password strength indicator
const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { score: 0, label: 'Very Weak', color: 'text-red-500' },
    { score: 1, label: 'Weak', color: 'text-red-400' },
    { score: 2, label: 'Fair', color: 'text-yellow-500' },
    { score: 3, label: 'Good', color: 'text-blue-500' },
    { score: 4, label: 'Strong', color: 'text-green-500' },
    { score: 5, label: 'Very Strong', color: 'text-green-600' },
  ];

  return levels[Math.min(score, 5)]!;
};

export default function LoginPage(): React.JSX.Element {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);
  const [_showPasswordStrength, _setShowPasswordStrength] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      remember_me: false,
    },
    mode: 'onChange',
  });

  const { register, handleSubmit, watch, formState } = form;
  const { errors, isValid, dirtyFields } = formState;
  
  const watchedPassword = watch('password', '');
  const passwordStrength = getPasswordStrength(watchedPassword || '');

  React.useEffect(() => {
    setMounted(true);
    clearError();
  }, [clearError]);

  React.useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [error, clearError]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleFormError = (err: unknown): void => {
    console.error('Login failed:', err);
  };

  const onSubmit = async (data: LoginForm): Promise<void> => {
    try {
      await login({
        username: data.username,
        password: data.password,
        remember_me: data.remember_me ?? false,
      });
      router.push('/dashboard');
    } catch (err) {
      // Error is handled by the auth store
      handleFormError(err);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-4 relative overflow-hidden">
      {/* Theme Toggle - Fixed Position */}
      <div className='fixed top-6 right-6 z-50'>
        <ThemeToggle variant="button" size="default" />
      </div>

      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
        <div className="absolute inset-0">
          {/* Floating particles */}
          {Array.from({ length: 20 }, (_, i) => i + 1).map((i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-blue-400/20 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              transition={{
                duration: Math.random() * 20 + 10,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm sm:max-w-sm md:max-w-md relative z-10"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center mb-6 sm:mb-8"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 mb-4 sm:mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg"
          >
            <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </motion.div>

          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Welcome Back
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Sign in to your Library Management account
          </p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="bg-card/70 backdrop-blur-xl rounded-2xl shadow-2xl p-4 sm:p-6 border border-border/50"
        >
          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={(e) => { void handleSubmit(onSubmit)(e); }} className="space-y-4">
            {/* Username Field */}
            <div className="space-y-2">
              <Input
                {...register('username')}
                id="username"
                type="text"
                label="Username"
                placeholder="librarian"
                variant="glass"
                leftIcon={<User className="w-4 h-4" />}
                error={errors.username?.message ?? ''}
                disabled={isLoading}
                className={cn(
                  dirtyFields.username && !errors.username && 'border-green-500/50 focus:border-green-500'
                )}
                rightIcon={
                  dirtyFields.username && !errors.username ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : undefined
                }
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Input
                {...register('password')}
                id="password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="librarian123"
                variant="glass"
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                }
                error={errors.password?.message ?? ''}
                disabled={isLoading}
                className={cn(
                  dirtyFields.password && !errors.password && 'border-green-500/50 focus:border-green-500'
                )}
              />

              {/* Password Strength Indicator - Only show when typing */}
              <AnimatePresence>
                {watchedPassword && watchedPassword.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-4 py-2 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Password Strength:
                      </span>
                      <span className={cn('font-medium', passwordStrength.color)}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="mt-2 w-full bg-muted rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                        className={cn(
                          'h-2 rounded-full transition-all duration-300',
                          passwordStrength.score <= 1 && 'bg-red-500',
                          passwordStrength.score === 2 && 'bg-yellow-500',
                          passwordStrength.score === 3 && 'bg-blue-500',
                          passwordStrength.score >= 4 && 'bg-green-500'
                        )}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  {...register('remember_me')}
                  type="checkbox"
                  className="w-4 h-4 text-primary rounded border-border focus:ring-primary"
                  disabled={isLoading}
                />
                <span className="text-sm text-muted-foreground">
                  Remember me
                </span>
              </label>

              <button
                type="button"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                disabled={isLoading}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="accent"
              size="default"
              className="w-full h-9"
              loading={isLoading}
              loadingText="Signing in..."
              disabled={!isValid || isLoading}
              leftIcon={!isLoading && <LogIn className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          {/* Demo Credentials */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl"
          >
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Demo Credentials
                </h3>
                <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                  <p><strong>Username:</strong> librarian</p>
                  <p><strong>Password:</strong> librarian123</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4" />
            Powered by Library Management System
            <Sparkles className="w-4 h-4" />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
