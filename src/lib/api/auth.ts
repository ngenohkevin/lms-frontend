import { apiClient, TokenStorage, JWTUtils } from './client';
import type { User } from '../types';

// Auth-specific types
export interface LoginRequest {
  username: string;
  password: string;
  remember_me?: boolean;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_at: string;
}


// Auth service
class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    
    if (!response.data) {
      throw new Error('Login failed: No data received');
    }

    // Store tokens and user data
    TokenStorage.setTokens(response.data.access_token, response.data.refresh_token);
    localStorage.setItem('lms_user', JSON.stringify(response.data.user));

    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear local storage
      TokenStorage.removeTokens();
      localStorage.removeItem('lms_user');
    }
  }

  async refreshToken(): Promise<AuthTokens> {
    const refreshToken = TokenStorage.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<AuthTokens>('/auth/refresh', {
      refresh_token: refreshToken,
    });

    if (!response.data) {
      throw new Error('Token refresh failed: No data received');
    }

    TokenStorage.setTokens(response.data.access_token, response.data.refresh_token);
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me');
    
    if (!response.data) {
      throw new Error('Failed to get current user');
    }

    // Update stored user data
    localStorage.setItem('lms_user', JSON.stringify(response.data));
    return response.data;
  }

  isAuthenticated(): boolean {
    const token = TokenStorage.getAccessToken();
    if (!token) return false;
    
    return !JWTUtils.isTokenExpired(token);
  }

  getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const userData = localStorage.getItem('lms_user');
      return userData ? JSON.parse(userData) as User : null;
    } catch {
      // Clear corrupted data
      localStorage.removeItem('lms_user');
      return null;
    }
  }

  hasRole(role: string | string[]): boolean {
    const user = this.getStoredUser();
    if (!user) return false;

    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    
    return user.role === role;
  }

  getTokenExpirationTime(): Date | null {
    const token = TokenStorage.getAccessToken();
    if (!token) return null;

    const expTime = JWTUtils.getTokenExpirationTime(token);
    return expTime ? new Date(expTime) : null;
  }

  willTokenExpireSoon(minutes = 5): boolean {
    const expTime = this.getTokenExpirationTime();
    if (!expTime) return true;

    const timeUntilExpiry = expTime.getTime() - Date.now();
    return timeUntilExpiry < minutes * 60 * 1000;
  }
}

const authService = new AuthService();
export default authService;