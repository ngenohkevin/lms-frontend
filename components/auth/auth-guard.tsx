"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import type { UserRole } from "@/lib/types";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  fallback?: React.ReactNode;
}

export function AuthGuard({
  children,
  requiredRoles,
  fallback,
}: AuthGuardProps) {
  const { user, isLoading, isAuthenticated, setupRequired } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect to login if setup is required (will redirect to /setup instead)
    if (!isLoading && !isAuthenticated && !setupRequired) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, setupRequired, router]);

  // Show loading state
  if (isLoading) {
    return (
      fallback || (
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )
    );
  }

  // Setup required - don't render anything, will redirect to /setup
  if (setupRequired) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Check roles if required
  if (requiredRoles && requiredRoles.length > 0 && user) {
    if (!requiredRoles.includes(user.role)) {
      return (
        <div className="flex h-screen flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">
            You don&apos;t have permission to access this page.
          </p>
          <button
            onClick={() => router.push("/")}
            className="text-primary underline underline-offset-4"
          >
            Go to Dashboard
          </button>
        </div>
      );
    }
  }

  return <>{children}</>;
}
