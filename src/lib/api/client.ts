import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import { env } from '../config/env';

const API_BASE_URL = env.NEXT_PUBLIC_API_URL;

// Custom error class
export class ApiClientError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

// Token storage utilities
export class TokenStorage {
  static getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('lms_access_token');
  }

  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('lms_refresh_token');
  }

  static setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('lms_access_token', accessToken);
    localStorage.setItem('lms_refresh_token', refreshToken);
  }

  static removeTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('lms_access_token');
    localStorage.removeItem('lms_refresh_token');
  }

  static hasTokens(): boolean {
    return !!(this.getAccessToken() && this.getRefreshToken());
  }
}

// JWT utilities
export class JWTUtils {
  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]!)) as { exp: number };
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }

  static getTokenExpirationTime(token: string): number | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]!)) as { exp: number };
      return payload.exp * 1000;
    } catch {
      return null;
    }
  }
}

export class ApiClient {
  private client: AxiosInstance;

  public isRefreshing = false;
  public failedQueue: {
    resolve: (token: string | null) => void;
    reject: (err: unknown) => void;
  }[] = [];
  public axiosInstance: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    this.axiosInstance = this.client;
    this.setupInterceptors();
  }

  public setupInterceptors(): void {
    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      config => {
        const token = TokenStorage.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(new Error(String(error)))
    );

    // Response interceptor - handle auth errors
    this.client.interceptors.response.use(
      response => response,
      async error => {
        if (axios.isAxiosError(error)) {
          const originalRequest = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;

          if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(token => {
              if (originalRequest) {
                originalRequest.headers = originalRequest.headers ?? {};
                originalRequest.headers.Authorization = `Bearer ${String(token)}`;
                return this.client(originalRequest);
              }
              return Promise.reject(new Error('Original request not available'));
            }).catch(err => Promise.reject(new Error(String(err))));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshTokens();
            this.processQueue(newToken, null);
            
            if (originalRequest) {
              originalRequest.headers = originalRequest.headers ?? {};
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            this.processQueue(null, refreshError);
            TokenStorage.removeTokens();
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            return Promise.reject(new Error(String(refreshError)));
          } finally {
            this.isRefreshing = false;
          }
        }
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  public processQueue(token: string | null, error: unknown): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  private async refreshTokens(): Promise<string> {
    const refreshToken = TokenStorage.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refresh_token: refreshToken,
    });

    const { access_token, refresh_token: newRefreshToken } = response.data as {
      access_token: string;
      refresh_token: string;
    };
    
    TokenStorage.setTokens(access_token, newRefreshToken);
    return access_token;
  }

  private handleError(error: unknown): ApiClientError {
    if (error instanceof ApiClientError) {
      return error;
    }
    
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const errorData = error.response?.data as { error?: { code?: string; message?: string; details?: unknown } } | undefined;
      const code = errorData?.error?.code ?? 'NETWORK_ERROR';
      const message = errorData?.error?.message ?? error.message ?? 'An unexpected error occurred';
      const details = errorData?.error?.details;
      
      return new ApiClientError(String(message), status, String(code), details);
    }
    
    return new ApiClientError('Unexpected error', undefined, 'UNKNOWN_ERROR', undefined);
  }

  // HTTP methods
  async request<T = unknown>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client(config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async get<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'GET', url, ...config });
  }

  async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'POST', url, data, ...config });
  }

  async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'PUT', url, data, ...config });
  }

  async patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'PATCH', url, data, ...config });
  }

  async delete<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'DELETE', url, ...config });
  }

  async upload<T = unknown>(
    url: string,
    file: File,
    onUploadProgress?: (progressEvent: { loaded: number; total?: number }) => void,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    const uploadConfig: AxiosRequestConfig = {
      method: 'POST',
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
      ...config,
    };

    if (onUploadProgress) {
      uploadConfig.onUploadProgress = onUploadProgress;
    }

    return this.request<T>(uploadConfig);
  }
}

// API Response type based on backend specification
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  meta?: Record<string, unknown>;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
  request_id: string;
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export types
export type { AxiosRequestConfig } from 'axios';
