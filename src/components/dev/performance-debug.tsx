'use client';

import { Activity, Zap, Clock, Monitor, ChevronDown, ChevronRight } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { isDevelopment, features } from '@/lib/config/env';
import { performanceMonitor, type PerformanceMetric, type ResourceTiming } from '@/lib/utils/performance-monitor';

export function PerformanceDebug(): React.ReactElement | null {
  const [isExpanded, setIsExpanded] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [resources, setResources] = useState<ResourceTiming[]>([]);

  useEffect(() => {
    if (!isDevelopment || !features.debug) return;

    const updateMetrics = (): void => {
      setMetrics(performanceMonitor.getMetrics().slice(-10)); // Last 10 metrics
      setResources(performanceMonitor.getResourceSummary().slice(-5)); // Last 5 resources
    };

    // Update metrics periodically
    const interval = setInterval(updateMetrics, 2000);
    updateMetrics(); // Initial load

    return () => clearInterval(interval);
  }, []);

  if (!isDevelopment || !features.debug) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="rounded-lg bg-black/90 p-3 text-xs text-white shadow-xl backdrop-blur">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between gap-2 font-semibold hover:text-green-400"
        >
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Performance Monitor
          </div>
          {isExpanded ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </button>

        {isExpanded && (
          <div className="mt-3 space-y-3">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded bg-blue-500/20 p-2">
                <div className="flex items-center gap-1 text-blue-300">
                  <Zap className="h-3 w-3" />
                  Metrics
                </div>
                <div className="font-mono text-white">{metrics.length}</div>
              </div>
              <div className="rounded bg-green-500/20 p-2">
                <div className="flex items-center gap-1 text-green-300">
                  <Clock className="h-3 w-3" />
                  Resources
                </div>
                <div className="font-mono text-white">{resources.length}</div>
              </div>
            </div>

            {/* Recent Metrics */}
            {metrics.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-gray-300">
                  Recent Metrics
                </div>
                <div className="max-h-32 space-y-1 overflow-y-auto">
                  {metrics.slice(-5).map((metric, index) => (
                    <div
                      key={`${metric.name}-${metric.timestamp}-${index}`}
                      className="rounded bg-gray-800/50 p-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate font-mono text-gray-300">
                          {metric.name}
                        </span>
                        <span className="font-mono text-yellow-400">
                          {metric.value.toFixed(1)}ms
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {metric.type}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resource Summary */}
            {resources.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-gray-300">
                  Resource Timing
                </div>
                <div className="max-h-32 space-y-1 overflow-y-auto">
                  {resources.map((resource, index) => (
                    <div
                      key={`${resource.name}-${index}`}
                      className="rounded bg-gray-800/50 p-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate text-xs text-gray-300">
                          {resource.type}
                        </span>
                        <span className="font-mono text-xs text-green-400">
                          {resource.duration.toFixed(1)}ms
                        </span>
                      </div>
                      {resource.size && (
                        <div className="text-xs text-gray-500">
                          {formatBytes(resource.size)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-1">
              <button
                onClick={() => {
                  performanceMonitor.clearMetrics();
                  setMetrics([]);
                  setResources([]);
                }}
                className="flex-1 rounded bg-red-500/20 px-2 py-1 text-xs text-red-300 hover:bg-red-500/30"
              >
                Clear
              </button>
              <button
                onClick={() => {
                  const data = {
                    metrics: performanceMonitor.getMetrics(),
                    resources: performanceMonitor.getResourceSummary(),
                    timestamp: new Date().toISOString(),
                  };
                  console.warn('📊 Performance Data:', data);
                }}
                className="flex-1 rounded bg-blue-500/20 px-2 py-1 text-xs text-blue-300 hover:bg-blue-500/30"
              >
                Export
              </button>
            </div>

            {/* Performance Tips */}
            <div className="rounded-md border border-yellow-500/20 bg-yellow-500/10 p-2">
              <div className="mb-1 flex items-center gap-1 text-xs font-semibold text-yellow-300">
                <Monitor className="h-3 w-3" />
                Tips
              </div>
              <div className="space-y-0.5 text-xs text-yellow-200">
                <div>• Open DevTools → Performance tab</div>
                <div>• Use React DevTools Profiler</div>
                <div>• Check Network tab for slow resources</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to format bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}