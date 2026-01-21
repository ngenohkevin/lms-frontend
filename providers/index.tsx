"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "./auth-provider";
import { ThemeProvider } from "./theme-provider";
import { SWRProvider } from "./swr-provider";
import { Toaster } from "@/components/ui/sonner";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <SWRProvider>
        <AuthProvider>
          {children}
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </SWRProvider>
    </ThemeProvider>
  );
}

export { AuthProvider, useAuth } from "./auth-provider";
export { ThemeProvider } from "./theme-provider";
export { SWRProvider } from "./swr-provider";
