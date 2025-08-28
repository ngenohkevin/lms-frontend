"use client";

import { useEffect, useState } from "react";

import { isDevelopment } from "@/lib/env";

interface PerformanceMetrics {
  fcp: number | null;
  lcp: number | null;
  cls: number | null;
  fid: number | null;
  ttfb: number | null;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    cls: null,
    fid: null,
    ttfb: null,
  });

  useEffect(() => {
    if (!isDevelopment()) return;

    // Function to report metrics
    const reportMetric = (metric: any) => {
      const metricName = metric.name.toLowerCase().replace(/-/g, '');
      setMetrics(prev => ({
        ...prev,
        [metricName]: metric.value,
      }));
    };

    // Observe performance metrics
    if ('PerformanceObserver' in window) {
      // Core Web Vitals
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(reportMetric);
      });

      try {
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
      } catch {
        // Fallback for browsers that don't support all entry types
      }

      // First Contentful Paint
      const fcpObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach(reportMetric);
      });

      try {
        fcpObserver.observe({ entryTypes: ['paint'] });
      } catch {
        // Fallback
      }

      // Navigation timing for TTFB
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navigationEntries.length > 0) {
        const navigationEntry = navigationEntries[0];
        setMetrics(prev => ({
          ...prev,
          ttfb: navigationEntry.responseStart - navigationEntry.requestStart,
        }));
      }

      return () => {
        observer.disconnect();
        fcpObserver.disconnect();
      };
    }
  }, []);

  // Only show in development
  if (!isDevelopment()) return null;

  const getStatusColor = (value: number | null, thresholds: { good: number; poor: number }) => {
    if (value === null) return "text-gray-400";
    if (value <= thresholds.good) return "text-green-500";
    if (value <= thresholds.poor) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-3 rounded-lg text-xs font-mono z-50 backdrop-blur">
      <h3 className="text-yellow-400 font-semibold mb-2">Performance Metrics</h3>
      <div className="space-y-1">
        <div className={`${getStatusColor(metrics.fcp, { good: 1800, poor: 3000 })}`}>
          FCP: {metrics.fcp ? `${Math.round(metrics.fcp)}ms` : 'N/A'}
        </div>
        <div className={`${getStatusColor(metrics.lcp, { good: 2500, poor: 4000 })}`}>
          LCP: {metrics.lcp ? `${Math.round(metrics.lcp)}ms` : 'N/A'}
        </div>
        <div className={`${getStatusColor(metrics.cls, { good: 0.1, poor: 0.25 })}`}>
          CLS: {metrics.cls ? metrics.cls.toFixed(3) : 'N/A'}
        </div>
        <div className={`${getStatusColor(metrics.fid, { good: 100, poor: 300 })}`}>
          FID: {metrics.fid ? `${Math.round(metrics.fid)}ms` : 'N/A'}
        </div>
        <div className={`${getStatusColor(metrics.ttfb, { good: 600, poor: 1200 })}`}>
          TTFB: {metrics.ttfb ? `${Math.round(metrics.ttfb)}ms` : 'N/A'}
        </div>
      </div>
    </div>
  );
}