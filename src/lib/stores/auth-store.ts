import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { User, Session } from '@/types'

interface AuthState {
  user: User | null
  session: Session | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  login: (user: User, session: Session) => void
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    immer((set, get) => ({
      // Initial state
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) =>
        set((state) => {
          state.user = user
          state.isAuthenticated = !!user
        }),

      setSession: (session) =>
        set((state) => {
          state.session = session
        }),

      setLoading: (loading) =>
        set((state) => {
          state.isLoading = loading
        }),

      setError: (error) =>
        set((state) => {
          state.error = error
        }),

      login: (user, session) =>
        set((state) => {
          state.user = user
          state.session = session
          state.isAuthenticated = true
          state.error = null
        }),

      logout: () =>
        set((state) => {
          state.user = null
          state.session = null
          state.isAuthenticated = false
          state.error = null
        }),

      clearError: () =>
        set((state) => {
          state.error = null
        }),
    })),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => {
        // Use sessionStorage for security (cleared when tab closes)
        if (typeof window !== 'undefined') {
          return sessionStorage
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      }),
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Selectors for optimized re-renders
export const useUser = () => useAuthStore((state) => state.user)
export const useSession = () => useAuthStore((state) => state.session)
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated)
export const useAuthLoading = () => useAuthStore((state) => state.isLoading)
export const useAuthError = () => useAuthStore((state) => state.error)