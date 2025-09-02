'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { apiClient } from '../api/client';

// User types based on backend specification
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'librarian' | 'admin' | 'staff';
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  refreshUser: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginRequest) => {
        try {
          set({ isLoading: true, error: null });

          const response = await apiClient.post<LoginResponse>(
            '/auth/login',
            credentials
          );

          if (response.success && response.data) {
            const { user, access_token, refresh_token } = response.data;

            // Store tokens
            if (typeof window !== 'undefined') {
              localStorage.setItem('access_token', access_token);
              localStorage.setItem('refresh_token', refresh_token);
            }

            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          }
        } catch (error: unknown) {
          const errorMessage =
            error &&
            typeof error === 'object' &&
            'response' in error &&
            error.response &&
            typeof error.response === 'object' &&
            'data' in error.response &&
            error.response.data &&
            typeof error.response.data === 'object' &&
            'error' in error.response.data &&
            error.response.data.error &&
            typeof error.response.data.error === 'object' &&
            'message' in error.response.data.error &&
            typeof error.response.data.error.message === 'string'
              ? error.response.data.error.message
              : 'Login failed';
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
            user: null,
          });
          throw error;
        }
      },

      logout: () => {
        // Clear tokens
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }

        // Call logout endpoint
        apiClient.post('/auth/logout').catch(() => {
          // Ignore errors on logout
        });

        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      refreshUser: async () => {
        try {
          set({ isLoading: true });

          const response = await apiClient.get<User>('/auth/me');

          if (response.success && response.data) {
            set({
              user: response.data,
              isAuthenticated: true,
              isLoading: false,
            });
          }
        } catch {
          // If refresh fails, user should log in again
          get().logout();
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: state => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Custom hook for easier usage
export const useAuth = (): AuthStore & {
  hasRole: (role: User['role']) => boolean;
  hasAnyRole: (roles: User['role'][]) => boolean;
} => {
  const authStore = useAuthStore();

  return {
    ...authStore,
    hasRole: (role: User['role']) => authStore.user?.role === role,
    hasAnyRole: (roles: User['role'][]) =>
      authStore.user?.role ? roles.includes(authStore.user.role) : false,
  };
};
