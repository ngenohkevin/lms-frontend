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
      }}
    >
      {children}
    </SWRConfig>
  );
}
