"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  BookOpen,
  AlertCircle,
  Eye,
  EyeOff,
  Shield,
  UserPlus,
  Settings,
  CheckCircle2,
} from "lucide-react";

const setupSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(50, "Username must be less than 50 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

type SetupFormData = z.infer<typeof setupSchema>;

const steps = [
  {
    icon: Shield,
    title: "Secure Setup",
    description: "Create the first administrator account",
  },
  {
    icon: UserPlus,
    title: "Invite Users",
    description: "Add librarians and staff members",
  },
  {
    icon: Settings,
    title: "Configure",
    description: "Customize your library settings",
  },
];

export function SetupForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetupFormData>({
    resolver: zodResolver(setupSchema),
  });

  const onSubmit = async (data: SetupFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await authApi.createFirstAdmin(data);
      toast.success("Admin account created successfully!", {
        description: "You can now sign in with your credentials.",
      });
      router.push("/login");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create admin account"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding & Steps */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/80 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNi02IDIuNjg2LTYgNiAyLjY4NiA2IDYgNnptMCAyYy00LjQxOCAwLTgtMy41ODItOC04czMuNTgyLTggOC04IDggMy41ODIgOCA4LTMuNTgyIDgtOCA4eiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9nPjwvc3ZnPg==')] opacity-30" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <BookOpen className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Library Management</h1>
              <p className="text-white/80 text-sm">System</p>
            </div>
          </div>

          {/* Tagline */}
          <div className="mb-12">
            <h2 className="text-4xl font-bold leading-tight mb-4">
              Welcome to your
              <br />
              new library
            </h2>
            <p className="text-white/80 text-lg max-w-md">
              Let&apos;s set up your library management system. This will only take a moment.
            </p>
          </div>

          {/* Setup steps */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
                  index === 0
                    ? "bg-white/20 backdrop-blur-sm"
                    : "bg-white/5 backdrop-blur-sm opacity-60"
                }`}
              >
                <div className={`p-2 rounded-lg ${index === 0 ? "bg-white/30" : "bg-white/10"}`}>
                  {index === 0 ? (
                    <step.icon className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="text-sm text-white/70">{step.description}</p>
                </div>
                {index === 0 && <CheckCircle2 className="h-5 w-5 text-white/80" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Setup Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-background to-muted/30">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold">LMS</span>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Create Admin Account</h2>
            <p className="text-muted-foreground mt-2">
              Set up the first administrator for your library
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="admin"
                autoComplete="username"
                disabled={isLoading}
                className="h-11"
                {...register("username")}
              />
              {errors.username && (
                <p className="text-sm text-destructive">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@library.com"
                autoComplete="email"
                disabled={isLoading}
                className="h-11"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  disabled={isLoading}
                  className="h-11 pr-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirm_password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  disabled={isLoading}
                  className="h-11 pr-10"
                  {...register("confirm_password")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirm_password && (
                <p className="text-sm text-destructive">{errors.confirm_password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full h-11 font-medium" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Admin Account"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            This account will have full administrative privileges
          </p>
        </div>
      </div>
    </div>
  );
}
