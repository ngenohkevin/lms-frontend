/**
 * Auth Service Tests
 */

import type { LoginRequest, AuthResponse, User, AuthTokens } from '../../../lib/types';

// Mock TokenStorage globally
const mockTokenStorage = {
  getAccessToken: jest.fn(),
  getRefreshToken: jest.fn(),
  setTokens: jest.fn(),
  removeTokens: jest.fn(),
  hasTokens: jest.fn(),
};

// Mock JWTUtils globally
const mockJWTUtils = {
  isTokenExpired: jest.fn(),
  getTokenExpirationTime: jest.fn(),
};

// Mock API client before importing auth
const mockApiClient = {
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
};

jest.mock('../../../lib/api/client', () => {
  return {
    ApiClient: jest.fn().mockImplementation(() => mockApiClient),
    apiClient: mockApiClient,
    TokenStorage: {
      getAccessToken: mockTokenStorage.getAccessToken,
      getRefreshToken: mockTokenStorage.getRefreshToken,
      setTokens: mockTokenStorage.setTokens,
      removeTokens: mockTokenStorage.removeTokens,
      hasTokens: mockTokenStorage.hasTokens,
    },
    JWTUtils: mockJWTUtils,
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

describe('authService', () => {
  // Import after mocks
  let authService: any;
  
  beforeAll(async () => {
    const authModule = await import('../../../lib/api/auth');
    authService = authModule.default;
  });
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
    // Reset token storage mocks
    mockTokenStorage.getAccessToken.mockReturnValue(null);
    mockTokenStorage.getRefreshToken.mockReturnValue(null);
    mockTokenStorage.setTokens.mockClear();
    mockTokenStorage.removeTokens.mockClear();
    // Reset JWT utils mocks
    mockJWTUtils.isTokenExpired.mockReturnValue(false);
    mockJWTUtils.getTokenExpirationTime.mockReturnValue(null);
  });

  describe('login', () => {
    it('should login successfully and store tokens', async () => {
      const credentials: LoginRequest = {
        username: 'testuser',
        password: 'password123',
      };

      mockApiClient.post.mockResolvedValue({
        success: true,
        data: mockAuthResponse,
      });

      const result = await authService.login(credentials);

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(mockTokenStorage.setTokens).toHaveBeenCalledWith(
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

      mockApiClient.post.mockResolvedValue({
        success: true,
        data: null,
      });

      await expect(authService.login(credentials)).rejects.toThrow(
        'Login failed: No data received'
      );
    });
  });

  describe('logout', () => {
    it('should logout successfully and clear storage', async () => {
      mockApiClient.post.mockResolvedValue({
        success: true,
        data: undefined,
      });

      await authService.logout();

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/logout');
      expect(mockTokenStorage.removeTokens).toHaveBeenCalled();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('lms_user');
    });

    it('should clear storage even if logout API fails', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Network error'));

      await authService.logout();

      expect(mockTokenStorage.removeTokens).toHaveBeenCalled();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('lms_user');
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      mockTokenStorage.getRefreshToken.mockReturnValue('refresh-token');

      mockApiClient.post.mockResolvedValue({
        success: true,
        data: mockTokens,
      });

      const result = await authService.refreshToken();

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/refresh', {
        refresh_token: 'refresh-token',
      });
      expect(mockTokenStorage.setTokens).toHaveBeenCalledWith(
        mockTokens.access_token,
        mockTokens.refresh_token
      );
      expect(result).toEqual(mockTokens);
    });

    it('should throw error when no refresh token available', async () => {
      mockTokenStorage.getRefreshToken.mockReturnValue(null);

      await expect(authService.refreshToken()).rejects.toThrow(
        'No refresh token available'
      );
    });
  });

  describe('getCurrentUser', () => {
    it('should get current user and update storage', async () => {
      mockApiClient.get.mockResolvedValue({
        success: true,
        data: mockUser,
      });

      const result = await authService.getCurrentUser();

      expect(mockApiClient.get).toHaveBeenCalledWith('/auth/me');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'lms_user',
        JSON.stringify(mockUser)
      );
      expect(result).toEqual(mockUser);
    });

    it('should throw error when no user data received', async () => {
      mockApiClient.get.mockResolvedValue({
        success: true,
        data: null,
      });

      await expect(authService.getCurrentUser()).rejects.toThrow(
        'Failed to get current user'
      );
    });
  });

  describe('isAuthenticated', () => {
    const createMockToken = (exp: number): string => {
      // Use Buffer to properly encode JSON for Node.js environment
      const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
      const payload = Buffer.from(JSON.stringify({ exp, sub: 'user123' })).toString('base64');
      const signature = 'mock-signature';
      return `${header}.${payload}.${signature}`;
    };

    it('should return true for valid token', () => {
      const futureTime = Math.floor(Date.now() / 1000) + 3600;
      const validToken = createMockToken(futureTime);
      mockTokenStorage.getAccessToken.mockReturnValue(validToken);
      mockJWTUtils.isTokenExpired.mockReturnValue(false);

      const result = authService.isAuthenticated();

      expect(result).toBe(true);
    });

    it('should return false for expired token', () => {
      const pastTime = Math.floor(Date.now() / 1000) - 3600;
      const expiredToken = createMockToken(pastTime);
      mockTokenStorage.getAccessToken.mockReturnValue(expiredToken);
      mockJWTUtils.isTokenExpired.mockReturnValue(true);

      const result = authService.isAuthenticated();

      expect(result).toBe(false);
    });

    it('should return false when no token exists', () => {
      mockTokenStorage.getAccessToken.mockReturnValue(null);

      const result = authService.isAuthenticated();

      expect(result).toBe(false);
    });

    it('should return false for invalid token', () => {
      mockTokenStorage.getAccessToken.mockReturnValue('invalid-token');
      mockJWTUtils.isTokenExpired.mockReturnValue(true);

      const result = authService.isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('getStoredUser', () => {
    it('should return stored user data', () => {
      (mockLocalStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(mockUser));

      const result = authService.getStoredUser();

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('lms_user');
      expect(result).toEqual(mockUser);
    });

    it('should return null when no user data exists', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = authService.getStoredUser();

      expect(result).toBeNull();
    });

    it('should return null and clear corrupted data', () => {
      (mockLocalStorage.getItem as jest.Mock).mockReturnValue('invalid-json');

      const result = authService.getStoredUser();

      expect(result).toBeNull();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('lms_user');
    });

    it('should return null in server environment', () => {
      const originalWindow = global.window;
      delete (global as { window?: Window }).window;

      const result = authService.getStoredUser();

      expect(result).toBeNull();

      global.window = originalWindow;
    });
  });

  describe('hasRole', () => {
    beforeEach(() => {
      (mockLocalStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(mockUser));
    });

    it('should return true for matching role', () => {
      const result = authService.hasRole('librarian');

      expect(result).toBe(true);
    });

    it('should return false for non-matching role', () => {
      const result = authService.hasRole('admin');

      expect(result).toBe(false);
    });

    it('should return true for matching role in array', () => {
      const result = authService.hasRole(['admin', 'librarian']);

      expect(result).toBe(true);
    });

    it('should return false when no user is stored', () => {
      (mockLocalStorage.getItem as jest.Mock).mockReturnValue(null);

      const result = authService.hasRole('librarian');

      expect(result).toBe(false);
    });
  });

  describe('getTokenExpirationTime', () => {
    const createMockToken = (exp: number): string => {
      // Use Buffer to properly encode JSON for Node.js environment
      const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
      const payload = Buffer.from(JSON.stringify({ exp, sub: 'user123' })).toString('base64');
      const signature = 'mock-signature';
      return `${header}.${payload}.${signature}`;
    };

    it('should return expiration date', () => {
      const expTime = Math.floor(Date.now() / 1000) + 3600;
      const token = createMockToken(expTime);
      mockTokenStorage.getAccessToken.mockReturnValue(token);
      mockJWTUtils.getTokenExpirationTime.mockReturnValue(expTime * 1000);

      const result = authService.getTokenExpirationTime();

      expect(result).toEqual(new Date(expTime * 1000));
    });

    it('should return null when no token exists', () => {
      mockTokenStorage.getAccessToken.mockReturnValue(null);

      const result = authService.getTokenExpirationTime();

      expect(result).toBeNull();
    });

    it('should return null for invalid token', () => {
      mockTokenStorage.getAccessToken.mockReturnValue('invalid-token');

      const result = authService.getTokenExpirationTime();

      expect(result).toBeNull();
    });
  });

  describe('willTokenExpireSoon', () => {
    const createMockToken = (exp: number): string => {
      // Use Buffer to properly encode JSON for Node.js environment
      const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
      const payload = Buffer.from(JSON.stringify({ exp, sub: 'user123' })).toString('base64');
      const signature = 'mock-signature';
      return `${header}.${payload}.${signature}`;
    };

    it('should return false for token expiring in more than 5 minutes', () => {
      const expTime = Math.floor(Date.now() / 1000) + 600; // 10 minutes from now
      const token = createMockToken(expTime);
      mockTokenStorage.getAccessToken.mockReturnValue(token);
      mockJWTUtils.getTokenExpirationTime.mockReturnValue(expTime * 1000);

      const result = authService.willTokenExpireSoon();

      expect(result).toBe(false);
    });

    it('should return true for token expiring in less than 5 minutes', () => {
      const expTime = Math.floor(Date.now() / 1000) + 240; // 4 minutes from now
      const token = createMockToken(expTime);
      mockTokenStorage.getAccessToken.mockReturnValue(token);
      mockJWTUtils.getTokenExpirationTime.mockReturnValue(expTime * 1000);

      const result = authService.willTokenExpireSoon();

      expect(result).toBe(true);
    });

    it('should return true when no token exists', () => {
      mockTokenStorage.getAccessToken.mockReturnValue(null);

      const result = authService.willTokenExpireSoon();

      expect(result).toBe(true);
    });
  });
});