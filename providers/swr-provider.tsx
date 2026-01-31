"use client";

import { SWRConfig } from "swr";
import type { ReactNode } from "react";
import apiClient from "@/lib/api/client";

interface SWRProviderProps {
  children: ReactNode;
}

export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        fetcher: (url: string) => apiClient.get(url),
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        errorRetryCount: 3,
        dedupingInterval: 2000,
        // Don't retry on auth/permission errors (401, 403)
        onErrorRetry: (error, _key, _config, revalidate, { retryCount }) => {
          // Don't retry on permission/auth errors
          if (error?.message?.includes("Unauthorized") ||
              error?.message?.includes("INSUFFICIENT_PERMISSIONS") ||
              error?.message?.includes("Forbidden")) {
            return;
          }
          // Only retry up to 3 times
          if (retryCount >= 3) return;
          // Retry after 5 seconds
          setTimeout(() => revalidate({ retryCount }), 5000);
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}
