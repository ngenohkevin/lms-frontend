"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { authApi } from "@/lib/api";
import type { User, LoginCredentials, UserRole } from "@/lib/types";

// Helper to clear auth cookies
function clearAuthCookies() {
  if (typeof document !== "undefined") {
    document.cookie = "access_token=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "refresh_token=; path=/; max-age=0; SameSite=Lax";
  }
}

// Public paths that don't require authentication
const PUBLIC_PATHS = ["/login", "/forgot-password", "/reset-password", "/setup"];
const SETUP_PATH = "/setup";
const ACCEPT_INVITE_PREFIX = "/accept-invite";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  isLibrarian: boolean;
  isAdmin: boolean;
  isStudent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Helper to handle auth failure - clears cookies and redirects
  const handleAuthFailure = useCallback(() => {
    clearAuthCookies();
    setUser(null);
    // Only redirect if not already on a public page
    const isPublicPath = PUBLIC_PATHS.includes(pathname) || pathname.startsWith(ACCEPT_INVITE_PREFIX);
    if (!isPublicPath) {
      router.push("/login");
    }
  }, [pathname, router]);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await authApi.me();
      setUser(userData);
    } catch {
      handleAuthFailure();
    }
  }, [handleAuthFailure]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Skip setup check for accept-invite pages
        const isAcceptInvitePage = pathname.startsWith(ACCEPT_INVITE_PREFIX);

        // Check if setup is required (only if not on setup or accept-invite page)
        if (!isAcceptInvitePage && pathname !== SETUP_PATH) {
          try {
            const setupCheck = await authApi.checkSetup();
            if (setupCheck.setup_required) {
              router.push(SETUP_PATH);
              setIsLoading(false);
              return;
            }
          } catch {
            // If setup check fails, continue with normal auth flow
            console.warn("Setup check failed, continuing with auth flow");
          }
        }

        // Check if we have an access token (in cookie)
        const hasToken = typeof document !== "undefined" &&
          document.cookie.includes("access_token=");

        if (hasToken) {
          // Try to get user data with existing token
          try {
            await refreshUser();
            return; // Success, we have the user
          } catch {
            // Token might be expired, try to refresh
            try {
              await authApi.refresh();
              await refreshUser();
              return;
            } catch {
              // Refresh failed, clear cookies and redirect
              handleAuthFailure();
            }
          }
        } else {
          setUser(null);
        }
      } catch {
        handleAuthFailure();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [refreshUser, handleAuthFailure, pathname, router]);

  const login = async (credentials: LoginCredentials) => {
    const response = await authApi.login(credentials);
    setUser(response.user);
    router.push("/");
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors
    } finally {
      clearAuthCookies();
      setUser(null);
      router.push("/login");
    }
  };

  const hasRole = useCallback(
    (roles: UserRole | UserRole[]) => {
      if (!user) return false;
      const roleArray = Array.isArray(roles) ? roles : [roles];
      return roleArray.includes(user.role);
    },
    [user]
  );

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshUser,
    hasRole,
    isLibrarian: user?.role === "librarian" || user?.role === "admin",
    isAdmin: user?.role === "admin",
    isStudent: user?.role === "student",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
