'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api/client'
import { useAuthStore } from '@/lib/stores/auth-store'
import type { LoginFormData, SignupFormData } from '@/lib/validations/auth'
import type { User } from '@/types'

// Query keys for better cache management
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  session: () => [...authKeys.all, 'session'] as const,
}

// Hook for getting current user
export const useCurrentUser = () => {
  const { user, isAuthenticated } = useAuthStore()
  
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: api.getCurrentUser,
    enabled: isAuthenticated && !user, // Only fetch if authenticated but no user in store
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
    retry: (failureCount, error: any) => {
      // Don't retry on 401/403 errors
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false
      }
      return failureCount < 3
    },
  })
}

// Hook for login mutation
export const useLogin = () => {
  const queryClient = useQueryClient()
  const { login: loginStore, setLoading, setError } = useAuthStore()

  return useMutation({
    mutationFn: (credentials: LoginFormData) => api.login(credentials),
    onMutate: () => {
      setLoading(true)
      setError(null)
    },
    onSuccess: (data) => {
      const { user, tokens } = data
      
      // Update auth store
      loginStore(user, {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        userId: user.id,
        expiresAt: new Date(tokens.expiresAt),
      })

      // Invalidate and refetch user data
      queryClient.setQueryData(authKeys.user(), user)
      queryClient.invalidateQueries({ queryKey: authKeys.all })

      toast.success('Login successful')
      setLoading(false)
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Login failed. Please try again.'
      setError(errorMessage)
      setLoading(false)
      toast.error(errorMessage)
    },
  })
}

// Hook for logout mutation
export const useLogout = () => {
  const queryClient = useQueryClient()
  const { logout: logoutStore } = useAuthStore()

  return useMutation({
    mutationFn: api.logout,
    onSuccess: () => {
      // Clear auth store
      logoutStore()
      
      // Clear all queries
      queryClient.clear()
      
      toast.success('Logged out successfully')
    },
    onError: () => {
      // Even if logout API fails, clear local state
      logoutStore()
      queryClient.clear()
    },
  })
}

// Hook for signup mutation (admin only)
export const useSignup = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userData: SignupFormData) => api.post('/auth/signup', userData),
    onSuccess: (data) => {
      // Invalidate users list if it exists
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User created successfully')
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Failed to create user. Please try again.'
      toast.error(errorMessage)
    },
  })
}

// Hook for password change
export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) => 
      api.post('/auth/change-password', data),
    onSuccess: () => {
      toast.success('Password changed successfully')
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Failed to change password. Please try again.'
      toast.error(errorMessage)
    },
  })
}

// Hook for forgot password
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email: string) => api.post('/auth/forgot-password', { email }),
    onSuccess: () => {
      toast.success('Password reset instructions sent to your email')
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Failed to send reset instructions. Please try again.'
      toast.error(errorMessage)
    },
  })
}

// Hook for reset password
export const useResetPassword = () => {
  return useMutation({
    mutationFn: (data: { token: string; password: string }) => 
      api.post('/auth/reset-password', data),
    onSuccess: () => {
      toast.success('Password reset successfully. Please log in with your new password.')
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Failed to reset password. Please try again.'
      toast.error(errorMessage)
    },
  })
}

// Hook for profile update
export const useUpdateProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userData: Partial<User>) => api.put('/auth/profile', userData),
    onSuccess: (updatedUser) => {
      // Update cached user data
      queryClient.setQueryData(authKeys.user(), updatedUser)
      toast.success('Profile updated successfully')
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Failed to update profile. Please try again.'
      toast.error(errorMessage)
    },
  })
}

// Hook to check authentication status
export const useAuth = () => {
  const { user, isAuthenticated, isLoading, error } = useAuthStore()
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser()

  return {
    user: user || currentUser,
    isAuthenticated,
    isLoading: isLoading || isUserLoading,
    error,
  }
}