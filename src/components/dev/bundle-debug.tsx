'use client';

import { Package, TrendingUp, TrendingDown, AlertCircle, Info, ExternalLink } from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';

import { isDevelopment, features } from '@/lib/config/env';

interface BundleStats {
  totalSize: number;
  gzipSize: number;
  chunkCount: number;
  largestChunk: {
    name: string;
    size: number;
  } | null;
}

interface ChunkInfo {
  name: string;
  size: number;
  gzipSize?: number;
  type: 'main' | 'vendor' | 'chunk' | 'css';
  isAsync: boolean;
  modules?: string[];
}

export function BundleDebug(): React.ReactElement | null {
  const [isExpanded, setIsExpanded] = useState(false);
  const [bundleStats, setBundleStats] = useState<BundleStats | null>(null);
  const [chunks, setChunks] = useState<ChunkInfo[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Get bundle information from build manifest (if available)
  const analyzeBundleInfo = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      // Try to get build manifest from Next.js
      const buildManifest = (window as Record<string, unknown>).__BUILD_MANIFEST as {
        pages?: Record<string, unknown>;
        ampFirstPages?: Record<string, unknown>;
      } | undefined;
      const _buildManifestPages = (window as Record<string, unknown>).__BUILD_MANIFEST_CB;

      if (buildManifest) {
        const allFiles = [
          ...Object.values(buildManifest.pages ?? {}),
          ...Object.values(buildManifest.ampFirstPages ?? {}),
        ].flat() as string[];

        const chunksInfo: ChunkInfo[] = allFiles
          .filter((file): file is string => typeof file === 'string')
          .map((file) => {
            const isCSS = file.endsWith('.css');
            const isMainApp = file.includes('app/page') || file.includes('_app');
            const isVendor = file.includes('vendors') || file.includes('framework');

            return {
              name: file.split('/').pop() ?? file,
              size: 0, // Size not available in build manifest
              type: isMainApp ? 'main' : isVendor ? 'vendor' : isCSS ? 'css' : 'chunk',
              isAsync: !isMainApp && !isVendor,
            } as ChunkInfo;
          });

        setChunks(chunksInfo);
      }

      // Get resource timing for actual loaded resources
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const jsResources = resources.filter(r => r.name.includes('.js'));
      const cssResources = resources.filter(r => r.name.includes('.css'));

      const totalSize = [...jsResources, ...cssResources].reduce(
        (sum, resource) => sum + (resource.transferSize || 0),
        0
      );

      const largestResource = [...jsResources, ...cssResources].reduce(
        (largest, resource) => 
          (resource.transferSize ?? 0) > (largest?.transferSize ?? 0) ? resource : largest,
        null as PerformanceResourceTiming | null
      );

      setBundleStats({
        totalSize,
        gzipSize: totalSize, // Assume gzipped for network transfer
        chunkCount: jsResources.length + cssResources.length,
        largestChunk: largestResource ? {
          name: largestResource.name.split('/').pop() ?? largestResource.name,
          size: largestResource.transferSize ?? 0,
        } : null,
      });
    } catch (error) {
      console.warn('Failed to analyze bundle info:', error);
    }
  }, []);

  // Trigger bundle analysis
  const startAnalysis = useCallback(() => {
    setIsAnalyzing(true);
    try {
      // In development, we can only analyze what's loaded
      analyzeBundleInfo();
      
      // Suggest running production build for detailed analysis
      if (isDevelopment) {
        console.warn('🔍 Bundle Analysis Tip: Run "npm run analyze" for detailed production bundle analysis');
      }
    } finally {
      setIsAnalyzing(false);
    }
  }, [analyzeBundleInfo]);

  useEffect(() => {
    if (!isDevelopment || !features.debug) return;

    // Initial analysis
    void startAnalysis();

    // Re-analyze when new resources load
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const hasNewResources = entries.some(entry => 
        entry.name.includes('.js') || entry.name.includes('.css')
      );
      
      if (hasNewResources) {
        setTimeout(analyzeBundleInfo, 100);
      }
    });

    try {
      observer.observe({ entryTypes: ['resource'] });
    } catch (error) {
      console.warn('Performance observer not supported:', error);
    }

    return () => observer.disconnect();
  }, [startAnalysis, analyzeBundleInfo]);

  const formatBytes = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }, []);

  const getBundleSizeStatus = useCallback((size: number): { status: string; color: string; icon: React.ComponentType } => {
    if (size < 250 * 1024) return { status: 'good', color: 'text-green-400', icon: TrendingUp };
    if (size < 500 * 1024) return { status: 'warning', color: 'text-yellow-400', icon: AlertCircle };
    return { status: 'poor', color: 'text-red-400', icon: TrendingDown };
  }, []);

  if (!isDevelopment || !features.debug) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 max-w-sm">
      <div className="rounded-lg bg-black/90 p-3 text-xs text-white shadow-xl backdrop-blur">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between gap-2 font-semibold hover:text-blue-400"
        >
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Bundle Analysis
          </div>
          {bundleStats && (
            <div className="flex items-center gap-1 text-xs">
              {(() => {
                const { color, icon: StatusIcon } = getBundleSizeStatus(bundleStats.totalSize);
                return (
                  <>
                    <StatusIcon className="h-3 w-3" />
                    <span className={color}>{formatBytes(bundleStats.totalSize)}</span>
                  </>
                );
              })()}
            </div>
          )}
        </button>

        {isExpanded && (
          <div className="mt-3 space-y-3">
            {/* Bundle Stats */}
            {bundleStats && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded bg-purple-500/20 p-2">
                  <div className="flex items-center gap-1 text-purple-300">
                    <Package className="h-3 w-3" />
                    Total Size
                  </div>
                  <div className="font-mono text-white">{formatBytes(bundleStats.totalSize)}</div>
                </div>
                <div className="rounded bg-blue-500/20 p-2">
                  <div className="flex items-center gap-1 text-blue-300">
                    <TrendingUp className="h-3 w-3" />
                    Chunks
                  </div>
                  <div className="font-mono text-white">{bundleStats.chunkCount}</div>
                </div>
              </div>
            )}

            {/* Largest Chunk */}
            {bundleStats?.largestChunk && (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-gray-300">
                  Largest Chunk
                </div>
                <div className="rounded bg-gray-800/50 p-2">
                  <div className="flex items-center justify-between">
                    <span className="truncate font-mono text-gray-300 text-xs">
                      {bundleStats.largestChunk.name}
                    </span>
                    <span className="font-mono text-orange-400 text-xs">
                      {formatBytes(bundleStats.largestChunk.size)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Loaded Chunks */}
            {chunks.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-gray-300">
                  Loaded Chunks ({chunks.length})
                </div>
                <div className="max-h-32 space-y-1 overflow-y-auto">
                  {chunks.slice(0, 5).map((chunk, index) => (
                    <div
                      key={`${chunk.name}-${index}`}
                      className="rounded bg-gray-800/50 p-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate text-xs font-mono text-gray-300">
                          {chunk.name}
                        </span>
                        <span className={`text-xs ${
                          chunk.type === 'main' ? 'text-green-400' :
                          chunk.type === 'vendor' ? 'text-blue-400' :
                          chunk.type === 'css' ? 'text-purple-400' :
                          'text-gray-400'
                        }`}>
                          {chunk.type}
                        </span>
                      </div>
                    </div>
                  ))}
                  {chunks.length > 5 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{chunks.length - 5} more chunks
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-1">
              <button
                onClick={() => void startAnalysis()}
                disabled={isAnalyzing}
                className="flex-1 rounded bg-blue-500/20 px-2 py-1 text-xs text-blue-300 hover:bg-blue-500/30 disabled:opacity-50"
              >
                {isAnalyzing ? 'Analyzing...' : 'Refresh'}
              </button>
              <button
                onClick={() => {
                  console.warn('📊 Bundle Analysis Data:', {
                    stats: bundleStats,
                    chunks,
                    timestamp: new Date().toISOString(),
                  });
                }}
                className="flex-1 rounded bg-green-500/20 px-2 py-1 text-xs text-green-300 hover:bg-green-500/30"
              >
                Export
              </button>
            </div>

            {/* Analysis Tips */}
            <div className="rounded-md border border-blue-500/20 bg-blue-500/10 p-2">
              <div className="mb-1 flex items-center gap-1 text-xs font-semibold text-blue-300">
                <Info className="h-3 w-3" />
                Bundle Tips
              </div>
              <div className="space-y-1 text-xs text-blue-200">
                <div className="flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" />
                  <code className="text-xs">npm run analyze</code> for detailed analysis
                </div>
                <div>• Code splitting reduces initial bundle size</div>
                <div>• Tree shaking removes unused code</div>
                <div>• Consider lazy loading large components</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}