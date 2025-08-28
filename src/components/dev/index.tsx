"use client";

import { BundleAnalyzer } from "./bundle-analyzer";
import { ErrorBoundary } from "./error-boundary";
import { PerformanceMonitor } from "./performance-monitor";

export { ErrorBoundary, PerformanceMonitor, BundleAnalyzer };

// Development tools container
export function DevTools() {
  return (
    <>
      <PerformanceMonitor />
      <BundleAnalyzer />
    </>
  );
}