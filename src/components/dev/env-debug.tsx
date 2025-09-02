import React from 'react';

import { env, features, isDevelopment } from '@/lib/config/env';

export function EnvDebug(): React.ReactElement | null {
  // Only show in development
  if (!isDevelopment || !features.debug) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-md rounded-lg bg-black/80 p-4 text-xs text-white shadow-lg backdrop-blur">
      <div className="mb-2 font-semibold">🔧 Environment Debug</div>
      <div className="space-y-1">
        <div>
          <span className="text-gray-300">App:</span> {env.NEXT_PUBLIC_APP_NAME} v
          {env.NEXT_PUBLIC_APP_VERSION}
        </div>
        <div>
          <span className="text-gray-300">Env:</span> {env.NEXT_PUBLIC_APP_ENV}
        </div>
        <div>
          <span className="text-gray-300">API:</span> {env.NEXT_PUBLIC_API_URL}
        </div>
        <div>
          <span className="text-gray-300">Features:</span>{' '}
          {Object.entries(features)
            .filter(([, enabled]) => enabled)
            .map(([name]) => name)
            .join(', ') || 'None'}
        </div>
      </div>
    </div>
  );
}