/**
 * Auth Service Tests
 */

import AuthService from '../../../lib/api/auth';
import { TokenStorage } from '../../../lib/api/client';
import type { LoginRequest, AuthResponse, User, AuthTokens } from '../../../lib/types';

// Mock API client
jest.mock('../../../lib/api/client', () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const actual = jest.requireActual('../../../lib/api/client');
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    ...actual,
    apiClient: {
      post: jest.fn(),
      get: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
      request: jest.fn(),
      axiosInstance: {} as Record<string, unknown>,
      isRefreshing: false,
      failedQueue: [],
      setupInterceptors: jest.fn(),
      processQueue: jest.fn(),
    },
    TokenStorage: class {
      static getAccessToken = jest.fn();
      static getRefreshToken = jest.fn();
      static setTokens = jest.fn();
      static removeTokens = jest.fn();
      static hasTokens = jest.fn();
    },
  };
});

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(() => null),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('AuthService', () => {
  const mockUser: User = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    role: 'librarian',
    is_active: true,
    last_login: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  const mockTokens: AuthTokens = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
  };

  const mockAuthResponse: AuthResponse = {
    user: mockUser,
    access_token: mockTokens.access_token,
    refresh_token: mockTokens.refresh_token,
    expires_at: mockTokens.expires_at,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  describe('login', () => {
    it('should login successfully and store tokens', async () => {
      const credentials: LoginRequest = {
        username: 'testuser',
        password: 'password123',
      };

      const { apiClient } = await import('../../../lib/api/client');
      if (apiClient) {
        (apiClient.post as jest.Mock).mockResolvedValue({
          data: mockAuthResponse,
        });
      }

      const result = await AuthService.login(credentials);

      expect(apiClient?.post).toHaveBeenCalledWith('/api/v1/auth/login', credentials);
      expect(TokenStorage.setTokens).toHaveBeenCalledWith(
        mockAuthResponse.access_token,
        mockAuthResponse.refresh_token
      );
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'lms_user',
        JSON.stringify(mockUser)
      );
      expect(result).toEqual(mockAuthResponse);
    });

    it('should throw error when login fails', async () => {
      const credentials: LoginRequest = {
        username: 'testuser',
        password: 'wrongpassword',
      };

      const { apiClient } = await import('../../../lib/api/client');
      if (apiClient) {
        (apiClient.post as jest.Mock).mockResolvedValue({
          data: null,
        });
      }

      await expect(AuthService.login(credentials)).rejects.toThrow(
        'Login failed: No data received'
      );
    });
  });

  describe('logout', () => {
    it('should logout successfully and clear storage', async () => {
      const { apiClient } = await import('../../../lib/api/client');
      if (apiClient) {
        (apiClient.post as jest.Mock).mockResolvedValue({});
      }

      await AuthService.logout();

      expect(apiClient?.post).toHaveBeenCalledWith('/api/v1/auth/logout');
      expect(TokenStorage.removeTokens).toHaveBeenCalled();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('lms_user');
    });

    it('should clear storage even if logout API fails', async () => {
      const { apiClient } = await import('../../../lib/api/client');
      if (apiClient) {
        (apiClient.post as jest.Mock).mockRejectedValue(new Error('Network error'));
      }

      await AuthService.logout();

      expect(TokenStorage.removeTokens).toHaveBeenCalled();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('lms_user');
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      (TokenStorage.getRefreshToken as jest.Mock).mockReturnValue('refresh-token');

      const { apiClient } = await import('../../../lib/api/client');
      if (apiClient) {
        (apiClient.post as jest.Mock).mockResolvedValue({
          data: mockTokens,
        });
      }

      const result = await AuthService.refreshToken();

      expect(apiClient?.post).toHaveBeenCalledWith('/api/v1/auth/refresh', {
        refresh_token: 'refresh-token',
      });
      expect(TokenStorage.setTokens).toHaveBeenCalledWith(
        mockTokens.access_token,
        mockTokens.refresh_token
      );
      expect(result).toEqual(mockTokens);
    });

    it('should throw error when no refresh token available', async () => {
      (TokenStorage.getRefreshToken as jest.Mock).mockReturnValue(null);

      await expect(AuthService.refreshToken()).rejects.toThrow(
        'No refresh token available'
      );
    });
  });

  describe('getCurrentUser', () => {
    it('should get current user and update storage', async () => {
      const { apiClient } = await import('../../../lib/api/client');
      if (apiClient) {
        (apiClient.get as jest.Mock).mockResolvedValue({
          data: mockUser,
        });
      }

      const result = await AuthService.getCurrentUser();

      expect(apiClient?.get).toHaveBeenCalledWith('/api/v1/auth/me');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'lms_user',
        JSON.stringify(mockUser)
      );
      expect(result).toEqual(mockUser);
    });

    it('should throw error when no user data received', async () => {
      const { apiClient } = await import('../../../lib/api/client');
      if (apiClient) {
        (apiClient.get as jest.Mock).mockResolvedValue({
          data: null,
        });
      }

      await expect(AuthService.getCurrentUser()).rejects.toThrow(
        'Failed to get current user'
      );
    });
  });

  describe('isAuthenticated', () => {
    const createMockToken = (exp: number): string => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({ exp, sub: 'user123' }));
      const signature = 'mock-signature';
      return `${header}.${payload}.${signature}`;
    };

    it('should return true for valid token', () => {
      const futureTime = Math.floor(Date.now() / 1000) + 3600;
      const validToken = createMockToken(futureTime);
      (TokenStorage.getAccessToken as jest.Mock).mockReturnValue(validToken);

      const result = AuthService.isAuthenticated();

      expect(result).toBe(true);
    });

    it('should return false for expired token', () => {
      const pastTime = Math.floor(Date.now() / 1000) - 3600;
      const expiredToken = createMockToken(pastTime);
      (TokenStorage.getAccessToken as jest.Mock).mockReturnValue(expiredToken);

      const result = AuthService.isAuthenticated();

      expect(result).toBe(false);
    });

    it('should return false when no token exists', () => {
      (TokenStorage.getAccessToken as jest.Mock).mockReturnValue(null);

      const result = AuthService.isAuthenticated();

      expect(result).toBe(false);
    });

    it('should return false for invalid token', () => {
      (TokenStorage.getAccessToken as jest.Mock).mockReturnValue('invalid-token');

      const result = AuthService.isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('getStoredUser', () => {
    it('should return stored user data', () => {
      (mockLocalStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(mockUser));

      const result = AuthService.getStoredUser();

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('lms_user');
      expect(result).toEqual(mockUser);
    });

    it('should return null when no user data exists', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = AuthService.getStoredUser();

      expect(result).toBeNull();
    });

    it('should return null and clear corrupted data', () => {
      (mockLocalStorage.getItem as jest.Mock).mockReturnValue('invalid-json');

      const result = AuthService.getStoredUser();

      expect(result).toBeNull();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('lms_user');
    });

    it('should return null in server environment', () => {
      const originalWindow = global.window;
      delete (global as { window?: Window }).window;

      const result = AuthService.getStoredUser();

      expect(result).toBeNull();

      global.window = originalWindow;
    });
  });

  describe('hasRole', () => {
    beforeEach(() => {
      (mockLocalStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(mockUser));
    });

    it('should return true for matching role', () => {
      const result = AuthService.hasRole('librarian');

      expect(result).toBe(true);
    });

    it('should return false for non-matching role', () => {
      const result = AuthService.hasRole('admin');

      expect(result).toBe(false);
    });

    it('should return true for matching role in array', () => {
      const result = AuthService.hasRole(['admin', 'librarian']);

      expect(result).toBe(true);
    });

    it('should return false when no user is stored', () => {
      (mockLocalStorage.getItem as jest.Mock).mockReturnValue(null);

      const result = AuthService.hasRole('librarian');

      expect(result).toBe(false);
    });
  });

  describe('getTokenExpirationTime', () => {
    const createMockToken = (exp: number): string => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({ exp, sub: 'user123' }));
      const signature = 'mock-signature';
      return `${header}.${payload}.${signature}`;
    };

    it('should return expiration date', () => {
      const expTime = Math.floor(Date.now() / 1000) + 3600;
      const token = createMockToken(expTime);
      (TokenStorage.getAccessToken as jest.Mock).mockReturnValue(token);

      const result = AuthService.getTokenExpirationTime();

      expect(result).toEqual(new Date(expTime * 1000));
    });

    it('should return null when no token exists', () => {
      (TokenStorage.getAccessToken as jest.Mock).mockReturnValue(null);

      const result = AuthService.getTokenExpirationTime();

      expect(result).toBeNull();
    });

    it('should return null for invalid token', () => {
      (TokenStorage.getAccessToken as jest.Mock).mockReturnValue('invalid-token');

      const result = AuthService.getTokenExpirationTime();

      expect(result).toBeNull();
    });
  });

  describe('willTokenExpireSoon', () => {
    const createMockToken = (exp: number): string => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({ exp, sub: 'user123' }));
      const signature = 'mock-signature';
      return `${header}.${payload}.${signature}`;
    };

    it('should return false for token expiring in more than 5 minutes', () => {
      const expTime = Math.floor(Date.now() / 1000) + 600; // 10 minutes from now
      const token = createMockToken(expTime);
      (TokenStorage.getAccessToken as jest.Mock).mockReturnValue(token);

      const result = AuthService.willTokenExpireSoon();

      expect(result).toBe(false);
    });

    it('should return true for token expiring in less than 5 minutes', () => {
      const expTime = Math.floor(Date.now() / 1000) + 240; // 4 minutes from now
      const token = createMockToken(expTime);
      (TokenStorage.getAccessToken as jest.Mock).mockReturnValue(token);

      const result = AuthService.willTokenExpireSoon();

      expect(result).toBe(true);
    });

    it('should return true when no token exists', () => {
      (TokenStorage.getAccessToken as jest.Mock).mockReturnValue(null);

      const result = AuthService.willTokenExpireSoon();

      expect(result).toBe(true);
    });
  });
});