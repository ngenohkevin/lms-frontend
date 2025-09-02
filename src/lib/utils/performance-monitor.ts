import { isDevelopment, features } from '@/lib/config/env';

// Extended types for Web Vitals
interface PerformancePaintTiming extends PerformanceEntry {
  element?: HTMLElement;
  url?: string;
}

interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number;
}

interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
  sources?: unknown[];
}

// Performance metric types
interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  type: 'navigation' | 'resource' | 'measure' | 'custom';
  metadata?: Record<string, unknown>;
}

interface ResourceTiming {
  name: string;
  duration: number;
  size?: number;
  type: string;
  initiatorType: string;
}

interface NavigationTiming {
  dns: number;
  tcp: number;
  ssl: number;
  ttfb: number; // Time to First Byte
  domContentLoaded: number;
  loadComplete: number;
  firstPaint: number | undefined;
  firstContentfulPaint: number | undefined;
  largestContentfulPaint?: number;
  cumulativeLayoutShift?: number;
  firstInputDelay?: number;
}

// Performance monitoring class
class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];
  private isEnabled: boolean = isDevelopment && features.debug;
  private maxMetrics = 1000;

  constructor() {
    if (typeof window === 'undefined' || !this.isEnabled) return;

    this.initializeObservers();
    this.trackNavigation();
    this.trackWebVitals();
  }

  // Initialize performance observers
  private initializeObservers(): void {
    try {
      // Observer for navigation and resource timing
      const navigationObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric({
            name: entry.name,
            value: entry.duration,
            timestamp: entry.startTime,
            type: entry.entryType as 'navigation' | 'resource',
            metadata: {
              entryType: entry.entryType,
              initiatorType: (entry as PerformanceResourceTiming).initiatorType,
              transferSize: (entry as PerformanceResourceTiming).transferSize,
              decodedBodySize: (entry as PerformanceResourceTiming).decodedBodySize,
            },
          });
        }
      });

      navigationObserver.observe({ 
        entryTypes: ['navigation', 'resource'] 
      });
      this.observers.push(navigationObserver);

      // Observer for user timing measures
      const measureObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric({
            name: entry.name,
            value: entry.duration,
            timestamp: entry.startTime,
            type: 'measure',
          });
        }
      });

      measureObserver.observe({ entryTypes: ['measure'] });
      this.observers.push(measureObserver);

    } catch (error) {
      console.warn('Failed to initialize performance observers:', error);
    }
  }

  // Track navigation timing
  private trackNavigation(): void {
    if (typeof window === 'undefined' || !window.performance) return;

    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = this.getNavigationTiming();
        if (navigation) {
          this.logNavigationMetrics(navigation);
        }
      }, 0);
    });
  }

  // Track Web Vitals
  private trackWebVitals(): void {
    // Track LCP (Largest Contentful Paint)
    this.observeWebVital('largest-contentful-paint', (entry) => {
      this.recordMetric({
        name: 'LCP',
        value: entry.startTime,
        timestamp: Date.now(),
        type: 'custom',
        metadata: { 
          element: (entry as PerformancePaintTiming).element?.tagName,
          url: (entry as PerformancePaintTiming).url 
        },
      });
    });

    // Track FID (First Input Delay)
    this.observeWebVital('first-input', (entry) => {
      this.recordMetric({
        name: 'FID',
        value: (entry as PerformanceEventTiming).processingStart - (entry as PerformanceEventTiming).startTime,
        timestamp: Date.now(),
        type: 'custom',
        metadata: { 
          eventType: (entry as PerformanceEventTiming).name 
        },
      });
    });

    // Track CLS (Cumulative Layout Shift)
    this.observeWebVital('layout-shift', (entry) => {
      if (!(entry as LayoutShift).hadRecentInput) {
        this.recordMetric({
          name: 'CLS',
          value: (entry as LayoutShift).value,
          timestamp: Date.now(),
          type: 'custom',
          metadata: { 
            sources: (entry as LayoutShift).sources?.length 
          },
        });
      }
    });
  }

  // Helper to observe web vitals
  private observeWebVital(
    type: string, 
    callback: (entry: PerformanceEntry) => void
  ): void {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          callback(entry);
        }
      });

      observer.observe({ type, buffered: true });
      this.observers.push(observer);
    } catch (error) {
      // Some browsers may not support all entry types
      console.warn(`Web vital observer for ${type} not supported:`, error);
    }
  }

  // Get navigation timing metrics
  private getNavigationTiming(): NavigationTiming | null {
    if (typeof window === 'undefined' || !window.performance) return null;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!navigation) return null;

    return {
      dns: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp: navigation.connectEnd - navigation.connectStart,
      ssl: navigation.secureConnectionStart > 0 
        ? navigation.connectEnd - navigation.secureConnectionStart 
        : 0,
      ttfb: navigation.responseStart - navigation.requestStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.startTime,
      loadComplete: navigation.loadEventEnd - navigation.startTime,
      firstPaint: this.getPerformanceMark('first-paint'),
      firstContentfulPaint: this.getPerformanceMark('first-contentful-paint'),
    };
  }

  // Get performance paint timing
  private getPerformanceMark(name: string): number | undefined {
    const entries = performance.getEntriesByName(name);
    return entries.length > 0 ? entries[0]?.startTime : undefined;
  }

  // Record a performance metric
  private recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    if (this.isEnabled && features.debug) {
      console.warn('📊 Performance:', metric);
    }
  }

  // Log navigation metrics
  private logNavigationMetrics(navigation: NavigationTiming): void {
    if (!this.isEnabled) return;

    console.warn('🚀 Navigation Performance:');
    console.warn(`DNS Lookup: ${navigation.dns.toFixed(2)}ms`);
    console.warn(`TCP Connect: ${navigation.tcp.toFixed(2)}ms`);
    console.warn(`SSL Handshake: ${navigation.ssl.toFixed(2)}ms`);
    console.warn(`Time to First Byte: ${navigation.ttfb.toFixed(2)}ms`);
    console.warn(`DOM Content Loaded: ${navigation.domContentLoaded.toFixed(2)}ms`);
    console.warn(`Load Complete: ${navigation.loadComplete.toFixed(2)}ms`);
    
    if (navigation.firstPaint) {
      console.warn(`First Paint: ${navigation.firstPaint.toFixed(2)}ms`);
    }
    if (navigation.firstContentfulPaint) {
      console.warn(`First Contentful Paint: ${navigation.firstContentfulPaint.toFixed(2)}ms`);
    }

    // Check for performance issues
    this.analyzePerformance(navigation);
  }

  // Analyze performance and provide recommendations
  private analyzePerformance(navigation: NavigationTiming): void {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check DNS lookup time
    if (navigation.dns > 100) {
      issues.push(`Slow DNS lookup (${navigation.dns.toFixed(2)}ms)`);
      recommendations.push('Consider using a faster DNS provider');
    }

    // Check TTFB
    if (navigation.ttfb > 200) {
      issues.push(`Slow server response (${navigation.ttfb.toFixed(2)}ms)`);
      recommendations.push('Optimize server response time');
    }

    // Check total load time
    if (navigation.loadComplete > 3000) {
      issues.push(`Slow page load (${navigation.loadComplete.toFixed(2)}ms)`);
      recommendations.push('Optimize resources and reduce payload size');
    }

    if (issues.length > 0) {
      console.warn('⚠️ Performance Issues Detected:');
      issues.forEach(issue => console.warn(`• ${issue}`));
  
      console.warn('💡 Recommendations:');
      recommendations.forEach(rec => console.warn(`• ${rec}`));
      }
  }

  // Custom timing measurement
  mark(name: string): void {
    if (!this.isEnabled || typeof performance === 'undefined') return;
    
    try {
      performance.mark(name);
    } catch (error) {
      console.warn('Failed to create performance mark:', error);
    }
  }

  // Measure between two marks
  measure(name: string, startMark?: string, endMark?: string): number | null {
    if (!this.isEnabled || typeof performance === 'undefined') return null;

    try {
      performance.measure(name, startMark, endMark);
      const entries = performance.getEntriesByName(name, 'measure');
      return entries.length > 0 ? entries[entries.length - 1]?.duration ?? null : null;
    } catch (error) {
      console.warn('Failed to create performance measure:', error);
      return null;
    }
  }

  // Time a function execution
  time<T>(name: string, fn: () => T): T;
  time<T>(name: string, fn: () => Promise<T>): Promise<T>;
  time<T>(name: string, fn: () => T | Promise<T>): T | Promise<T> {
    if (!this.isEnabled) return fn();

    const startMark = `${name}-start`;
    const endMark = `${name}-end`;
    
    this.mark(startMark);
    
    const result = fn();
    
    if (result instanceof Promise) {
      return result.then((value) => {
        this.mark(endMark);
        const duration = this.measure(name, startMark, endMark);
        if (duration !== null) {
          console.warn(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
        }
        return value;
      });
    } else {
      this.mark(endMark);
      const duration = this.measure(name, startMark, endMark);
      if (duration !== null) {
        console.warn(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
      }
      return result;
    }
  }

  // Get resource timing summary
  getResourceSummary(): ResourceTiming[] {
    if (typeof performance === 'undefined') return [];

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    return resources.map(resource => ({
      name: resource.name,
      duration: resource.duration,
      size: resource.transferSize,
      type: this.getResourceType(resource.name),
      initiatorType: resource.initiatorType,
    }));
  }

  // Determine resource type from URL
  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'JavaScript';
    if (url.includes('.css')) return 'CSS';
    if (/\.(png|jpg|jpeg|gif|svg|webp)$/.exec(url)) return 'Image';
    if (url.includes('.woff') || url.includes('.ttf')) return 'Font';
    return 'Other';
  }

  // Get all recorded metrics
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  // Clear all metrics
  clearMetrics(): void {
    this.metrics = [];
    if (typeof performance !== 'undefined') {
      performance.clearMarks();
      performance.clearMeasures();
    }
  }

  // Enable/disable monitoring
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled && isDevelopment;
  }

  // Cleanup observers
  destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.clearMetrics();
  }
}

// Create global instance
export const performanceMonitor = new PerformanceMonitor();

// Export types
export type { PerformanceMetric, ResourceTiming, NavigationTiming };

// React hook for performance monitoring
export function usePerformanceMonitor(): {
  readonly mark: (name: string) => void;
  readonly measure: (name: string, startMark?: string, endMark?: string) => number | null;
  readonly time: <T>(name: string, fn: () => T | Promise<T>) => T | Promise<T>;
  readonly getMetrics: () => PerformanceMetric[];
  readonly getResourceSummary: () => ResourceTiming[];
  readonly clearMetrics: () => void;
} {
  return {
    mark: performanceMonitor.mark.bind(performanceMonitor),
    measure: performanceMonitor.measure.bind(performanceMonitor),
    time: performanceMonitor.time.bind(performanceMonitor),
    getMetrics: performanceMonitor.getMetrics.bind(performanceMonitor),
    getResourceSummary: performanceMonitor.getResourceSummary.bind(performanceMonitor),
    clearMetrics: performanceMonitor.clearMetrics.bind(performanceMonitor),
  } as const;
}