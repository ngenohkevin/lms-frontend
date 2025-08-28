import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import { toast } from 'sonner'
import type { ApiResponse } from '@/types'

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
const API_TIMEOUT = 30000 // 30 seconds

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // CSRF protection
  },
  withCredentials: true, // Include cookies for authentication
})

// Token management
let refreshPromise: Promise<any> | null = null

const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('access_token')
}

const setAccessToken = (token: string | null): void => {
  if (typeof window === 'undefined') return
  if (token) {
    localStorage.setItem('access_token', token)
  } else {
    localStorage.removeItem('access_token')
  }
}

const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('refresh_token')
}

const setRefreshToken = (token: string | null): void => {
  if (typeof window === 'undefined') return
  if (token) {
    localStorage.setItem('refresh_token', token)
  } else {
    localStorage.removeItem('refresh_token')
  }
}

// Request interceptor to add authentication token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Add CSRF token if available
    if (typeof window !== 'undefined') {
      const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content
      if (csrfToken && config.headers) {
        config.headers['X-CSRF-Token'] = csrfToken
      }
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for token refresh and error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    return response
  },
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as any

    // Handle 401 Unauthorized - attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (refreshPromise) {
        // If refresh is already in progress, wait for it
        await refreshPromise
        const newToken = getAccessToken()
        if (newToken && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
        }
        return apiClient(originalRequest)
      }

      originalRequest._retry = true
      const refreshToken = getRefreshToken()

      if (refreshToken) {
        refreshPromise = refreshAccessToken(refreshToken)
        try {
          const newTokens = await refreshPromise
          setAccessToken(newTokens.accessToken)
          setRefreshToken(newTokens.refreshToken)
          
          // Retry the original request
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`
          }
          return apiClient(originalRequest)
        } catch (refreshError) {
          // Refresh failed - redirect to login
          clearTokens()
          redirectToLogin()
          return Promise.reject(refreshError)
        } finally {
          refreshPromise = null
        }
      } else {
        // No refresh token - redirect to login
        clearTokens()
        redirectToLogin()
      }
    }

    // Handle other error statuses
    handleApiError(error)
    return Promise.reject(error)
  }
)

// Token refresh function
const refreshAccessToken = async (refreshToken: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
      refresh_token: refreshToken
    })
    return response.data.data
  } catch (error) {
    throw error
  }
}

// Clear all tokens
const clearTokens = (): void => {
  setAccessToken(null)
  setRefreshToken(null)
}

// Redirect to login page
const redirectToLogin = (): void => {
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname
    const loginUrl = currentPath !== '/login' ? `/login?redirect=${encodeURIComponent(currentPath)}` : '/login'
    window.location.href = loginUrl
  }
}

// Error handler
const handleApiError = (error: AxiosError<ApiResponse>): void => {
  const response = error.response
  const data = response?.data

  if (response?.status === 403) {
    toast.error('Access denied. You do not have permission to perform this action.')
  } else if (response?.status === 404) {
    toast.error('The requested resource was not found.')
  } else if (response?.status === 422) {
    toast.error(data?.message || 'Validation error occurred.')
  } else if (response?.status === 429) {
    toast.error('Too many requests. Please try again later.')
  } else if (response?.status >= 500) {
    toast.error('Server error. Please try again later.')
  } else if (error.code === 'ECONNABORTED') {
    toast.error('Request timeout. Please check your connection.')
  } else if (!response) {
    toast.error('Network error. Please check your internet connection.')
  }
}

// API client methods
export const api = {
  // Authentication
  async login(credentials: { email: string; password: string }) {
    const response = await apiClient.post<ApiResponse<{ user: any; tokens: any }>>('/auth/login', credentials)
    const { user, tokens } = response.data.data
    setAccessToken(tokens.accessToken)
    setRefreshToken(tokens.refreshToken)
    return { user, tokens }
  },

  async logout() {
    try {
      await apiClient.post('/auth/logout')
    } finally {
      clearTokens()
      redirectToLogin()
    }
  },

  async getCurrentUser() {
    const response = await apiClient.get<ApiResponse<any>>('/auth/me')
    return response.data.data
  },

  // Generic CRUD operations
  async get<T = any>(url: string, params?: any): Promise<T> {
    const response = await apiClient.get<ApiResponse<T>>(url, { params })
    return response.data.data
  },

  async post<T = any>(url: string, data?: any): Promise<T> {
    const response = await apiClient.post<ApiResponse<T>>(url, data)
    return response.data.data
  },

  async put<T = any>(url: string, data?: any): Promise<T> {
    const response = await apiClient.put<ApiResponse<T>>(url, data)
    return response.data.data
  },

  async patch<T = any>(url: string, data?: any): Promise<T> {
    const response = await apiClient.patch<ApiResponse<T>>(url, data)
    return response.data.data
  },

  async delete<T = any>(url: string): Promise<T> {
    const response = await apiClient.delete<ApiResponse<T>>(url)
    return response.data.data
  },

  // File upload
  async uploadFile<T = any>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post<ApiResponse<T>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    })
    return response.data.data
  },
}

// Export token management functions
export { 
  getAccessToken, 
  setAccessToken, 
  getRefreshToken, 
  setRefreshToken, 
  clearTokens 
}

export default apiClient