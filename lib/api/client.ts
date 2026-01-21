import type { ApiResponse } from "@/lib/types";

type ParamValue = string | number | boolean | undefined | null;

interface RequestOptions extends RequestInit {
  params?: Record<string, ParamValue> | object;
}

class ApiClient {
  private accessToken: string | null = null;

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

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 401) {
      // Try to refresh the token
      const refreshed = await this.refreshToken();
      if (!refreshed) {
        // Redirect to login
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        throw new Error("Unauthorized");
      }
      throw new Error("Token refreshed, retry request");
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: response.statusText,
      }));
      throw new Error(error.message || error.error || "Request failed");
    }

    // Handle empty responses
    const text = await response.text();
    if (!text) {
      return {} as T;
    }

    return JSON.parse(text);
  }

  private async refreshToken(): Promise<boolean> {
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

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const url = this.buildUrl(endpoint, options?.params);
    const response = await fetch(url, {
      ...options,
      method: "GET",
      headers: this.getHeaders(),
      credentials: "include",
    });
    return this.handleResponse<T>(response);
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    const url = this.buildUrl(endpoint, options?.params);
    const response = await fetch(url, {
      ...options,
      method: "POST",
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });
    return this.handleResponse<T>(response);
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    const url = this.buildUrl(endpoint, options?.params);
    const response = await fetch(url, {
      ...options,
      method: "PUT",
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });
    return this.handleResponse<T>(response);
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    const url = this.buildUrl(endpoint, options?.params);
    const response = await fetch(url, {
      ...options,
      method: "PATCH",
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });
    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const url = this.buildUrl(endpoint, options?.params);
    const response = await fetch(url, {
      ...options,
      method: "DELETE",
      headers: this.getHeaders(),
      credentials: "include",
    });
    return this.handleResponse<T>(response);
  }

  async upload<T>(
    endpoint: string,
    formData: FormData,
    options?: RequestOptions
  ): Promise<T> {
    const url = this.buildUrl(endpoint, options?.params);
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
    return this.handleResponse<T>(response);
  }
}

export const apiClient = new ApiClient();
export default apiClient;
