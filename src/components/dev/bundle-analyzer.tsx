"use client";

import { useEffect, useState } from "react";

import { isDevelopment } from "@/lib/env";

interface BundleInfo {
  size: number;
  chunks: string[];
  loadTime: number;
}

export function BundleAnalyzer() {
  const [bundleInfo, setBundleInfo] = useState<BundleInfo | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isDevelopment()) return;

    // Analyze bundle performance
    const analyzeBundlePerformance = () => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const jsResources = resources.filter(resource => 
        resource.name.includes('.js') && resource.name.includes('_next')
      );

      const totalSize = jsResources.reduce((total, resource) => 
        total + (resource.transferSize || 0), 0
      );

      const chunks = jsResources.map(resource => {
        const parts = resource.name.split('/');
        return parts[parts.length - 1];
      });

      const totalLoadTime = jsResources.reduce((total, resource) => 
        total + resource.duration, 0
      );

      setBundleInfo({
        size: totalSize,
        chunks,
        loadTime: totalLoadTime,
      });
    };

    // Analyze after a short delay to ensure all resources are loaded
    const timer = setTimeout(analyzeBundlePerformance, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!isDevelopment() || !bundleInfo) return null;

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 left-4 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg z-50 text-xs font-mono transition-colors"
        title="Toggle Bundle Analyzer"
      >
        📦 Bundle
      </button>

      {/* Bundle Info Panel */}
      {isVisible && (
        <div className="fixed bottom-16 left-4 bg-black/90 text-white p-4 rounded-lg text-xs font-mono z-50 backdrop-blur w-80">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-purple-400 font-semibold">Bundle Analysis</h3>
            <button 
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-2">
            <div>
              <span className="text-gray-400">Total Size: </span>
              <span className={`${bundleInfo.size > 512000 ? 'text-red-400' : bundleInfo.size > 256000 ? 'text-yellow-400' : 'text-green-400'}`}>
                {formatSize(bundleInfo.size)}
              </span>
            </div>
            
            <div>
              <span className="text-gray-400">Load Time: </span>
              <span className={`${bundleInfo.loadTime > 2000 ? 'text-red-400' : bundleInfo.loadTime > 1000 ? 'text-yellow-400' : 'text-green-400'}`}>
                {Math.round(bundleInfo.loadTime)}ms
              </span>
            </div>
            
            <div>
              <span className="text-gray-400">Chunks: </span>
              <span className="text-blue-400">{bundleInfo.chunks.length}</span>
            </div>
          </div>

          <details className="mt-3">
            <summary className="text-gray-400 cursor-pointer hover:text-white">
              View Chunks
            </summary>
            <div className="mt-2 max-h-40 overflow-auto space-y-1">
              {bundleInfo.chunks.map((chunk, index) => (
                <div key={index} className="text-xs text-gray-300 truncate">
                  {chunk}
                </div>
              ))}
            </div>
          </details>

          <div className="mt-3 pt-3 border-t border-gray-700">
            <div className="text-xs text-gray-400">
              💡 Tips:
            </div>
            <ul className="text-xs text-gray-300 mt-1 space-y-1">
              <li>• Keep bundles under 244KB</li>
              <li>• Use dynamic imports for code splitting</li>
              <li>• Remove unused dependencies</li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
}