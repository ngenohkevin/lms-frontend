type ParamValue = string | number | boolean | undefined | null;

// Helper to clear auth cookies
function clearAuthCookies() {
  if (typeof document !== "undefined") {
    document.cookie = "access_token=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "refresh_token=; path=/; max-age=0; SameSite=Lax";
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, ParamValue> | object;
}

class ApiClient {
  private accessToken: string | null = null;
  private refreshPromise: Promise<boolean> | null = null; // Mutex for refresh

  // Read access token from cookie (for persistence across page refreshes)
  private getAccessTokenFromCookie(): string | null {
    if (typeof document === "undefined") return null;
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === "access_token") {
        return value;
      }
    }
    return null;
  }

  // Get the current access token (from memory or cookie)
  private getCurrentToken(): string | null {
    return this.accessToken || this.getAccessTokenFromCookie();
  }

  // Get base URL dynamically - empty on client (uses proxy), full URL on server
  private getBaseUrl(): string {
    if (typeof window !== "undefined") {
      // Client-side: use relative URL to proxy through Next.js
      return "";
    }
    // Server-side: use direct API URL
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  private buildUrl(
    endpoint: string,
    params?: Record<string, ParamValue> | object
  ): string {
    const baseUrl = this.getBaseUrl();
    // For relative URLs (client-side), we can't use new URL() directly
    const fullPath = `${baseUrl}${endpoint}`;

    if (!baseUrl) {
      // Client-side: build URL manually
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, String(value));
          }
        });
      }
      const queryString = searchParams.toString();
      return queryString ? `${fullPath}?${queryString}` : fullPath;
    }

    // Server-side: use URL constructor
    const url = new URL(fullPath);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return url.toString();
  }

  private async handleResponse<T>(response: Response, skipAuthRedirect = false, isRetry = false): Promise<T> {
    if (response.status === 401) {
      // For login failures, extract the error message instead of redirecting
      if (skipAuthRedirect) {
        const error = await response.json().catch(() => ({
          message: "Invalid email or password",
        }));
        const errorMessage = error.error?.message || error.message || error.error || "Invalid email or password";
        throw new Error(typeof errorMessage === 'string' ? errorMessage : "Invalid email or password");
      }

      // If this is already a retry, don't try to refresh again (prevent infinite loop)
      if (isRetry) {
        clearAuthCookies();
        this.accessToken = null;
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        throw new Error("Unauthorized");
      }

      // Try to refresh the token
      const refreshed = await this.refreshToken();
      if (!refreshed) {
        // Clear invalid tokens and redirect to login
        clearAuthCookies();
        this.accessToken = null;
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        throw new Error("Unauthorized");
      }
      // Signal that token was refreshed and request should be retried
      // Use a specific error message that we can check for in the retry logic
      throw new Error("__TOKEN_REFRESHED__");
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: response.statusText,
      }));
      // Handle nested error structure: { error: { code, message }, success: false }
      const errorMessage = error.error?.message || error.message || error.error || "Request failed";
      throw new Error(typeof errorMessage === 'string' ? errorMessage : "Request failed");
    }

    // Handle empty responses
    const text = await response.text();
    if (!text) {
      return {} as T;
    }

    return JSON.parse(text);
  }

  private async refreshToken(): Promise<boolean> {
    // Use a mutex to prevent multiple simultaneous refresh attempts
    // If a refresh is already in progress, wait for it
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.doRefreshToken();
    try {
      return await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async doRefreshToken(): Promise<boolean> {
    try {
      // Get refresh token from cookie
      let refreshTokenValue = "";
      if (typeof document !== "undefined") {
        const cookies = document.cookie.split(";");
        for (const cookie of cookies) {
          const [name, value] = cookie.trim().split("=");
          if (name === "refresh_token") {
            refreshTokenValue = value;
            break;
          }
        }
      }

      if (!refreshTokenValue) {
        return false;
      }

      const response = await fetch(`${this.getBaseUrl()}/api/v1/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshTokenValue }),
        credentials: "include",
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      // Response is wrapped: {success, data: {access_token, refresh_token, expires_in}}
      if (data.data?.access_token) {
        this.accessToken = data.data.access_token;
        // Update cookies
        if (typeof document !== "undefined") {
          document.cookie = `access_token=${data.data.access_token}; path=/; max-age=${data.data.expires_in || 3600}; SameSite=Lax`;
          if (data.data.refresh_token) {
            document.cookie = `refresh_token=${data.data.refresh_token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
          }
        }
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    const token = this.getCurrentToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  // Helper to check if error indicates retry is needed
  private shouldRetry(error: unknown): boolean {
    return error instanceof Error && error.message === "__TOKEN_REFRESHED__";
  }

  async get<T>(
    endpoint: string,
    options?: RequestOptions & { skipAuthRedirect?: boolean }
  ): Promise<T> {
    const url = this.buildUrl(endpoint, options?.params);
    const doFetch = async (isRetry = false) => {
      const response = await fetch(url, {
        ...options,
        method: "GET",
        headers: this.getHeaders(),
        credentials: "include",
      });
      return this.handleResponse<T>(response, options?.skipAuthRedirect, isRetry);
    };

    try {
      return await doFetch();
    } catch (error) {
      if (this.shouldRetry(error)) {
        return await doFetch(true); // Retry with new token, mark as retry
      }
      throw error;
    }
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions & { skipAuthRedirect?: boolean }
  ): Promise<T> {
    const url = this.buildUrl(endpoint, options?.params);
    const doFetch = async (isRetry = false) => {
      const response = await fetch(url, {
        ...options,
        method: "POST",
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
        credentials: "include",
      });
      return this.handleResponse<T>(response, options?.skipAuthRedirect, isRetry);
    };

    try {
      return await doFetch();
    } catch (error) {
      if (this.shouldRetry(error)) {
        return await doFetch(true); // Retry with new token, mark as retry
      }
      throw error;
    }
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    const url = this.buildUrl(endpoint, options?.params);
    const doFetch = async (isRetry = false) => {
      const response = await fetch(url, {
        ...options,
        method: "PUT",
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
        credentials: "include",
      });
      return this.handleResponse<T>(response, false, isRetry);
    };

    try {
      return await doFetch();
    } catch (error) {
      if (this.shouldRetry(error)) {
        return await doFetch(true); // Retry with new token, mark as retry
      }
      throw error;
    }
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    const url = this.buildUrl(endpoint, options?.params);
    const doFetch = async (isRetry = false) => {
      const response = await fetch(url, {
        ...options,
        method: "PATCH",
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
        credentials: "include",
      });
      return this.handleResponse<T>(response, false, isRetry);
    };

    try {
      return await doFetch();
    } catch (error) {
      if (this.shouldRetry(error)) {
        return await doFetch(true); // Retry with new token, mark as retry
      }
      throw error;
    }
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const url = this.buildUrl(endpoint, options?.params);
    const doFetch = async (isRetry = false) => {
      const response = await fetch(url, {
        ...options,
        method: "DELETE",
        headers: this.getHeaders(),
        credentials: "include",
      });
      return this.handleResponse<T>(response, false, isRetry);
    };

    try {
      return await doFetch();
    } catch (error) {
      if (this.shouldRetry(error)) {
        return await doFetch(true); // Retry with new token, mark as retry
      }
      throw error;
    }
  }

  async upload<T>(
    endpoint: string,
    formData: FormData,
    options?: RequestOptions
  ): Promise<T> {
    const url = this.buildUrl(endpoint, options?.params);
    const doFetch = async (isRetry = false) => {
      const headers: HeadersInit = {};
      const token = this.getCurrentToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      // Don't set Content-Type for FormData, browser will set it with boundary
      const response = await fetch(url, {
        ...options,
        method: "POST",
        headers,
        body: formData,
        credentials: "include",
      });
      return this.handleResponse<T>(response, false, isRetry);
    };

    try {
      return await doFetch();
    } catch (error) {
      if (this.shouldRetry(error)) {
        return await doFetch(true); // Retry with new token, mark as retry
      }
      throw error;
    }
  }

  // Download file as blob with authentication
  async download(endpoint: string, options?: RequestOptions): Promise<Blob> {
    const url = this.buildUrl(endpoint, options?.params);
    const doFetch = async (isRetry = false) => {
      const headers: HeadersInit = {};
      const token = this.getCurrentToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const response = await fetch(url, {
        ...options,
        method: "GET",
        headers,
        credentials: "include",
      });
      if (response.status === 401) {
        // If this is already a retry, don't try to refresh again
        if (isRetry) {
          clearAuthCookies();
          this.accessToken = null;
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          throw new Error("Unauthorized");
        }
        const refreshed = await this.refreshToken();
        if (!refreshed) {
          clearAuthCookies();
          this.accessToken = null;
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          throw new Error("Unauthorized");
        }
        throw new Error("__TOKEN_REFRESHED__");
      }
      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }
      return response.blob();
    };

    try {
      return await doFetch();
    } catch (error) {
      if (this.shouldRetry(error)) {
        return await doFetch(true); // Retry with new token, mark as retry
      }
      throw error;
    }
  }
}

export const apiClient = new ApiClient();
export default apiClient;
