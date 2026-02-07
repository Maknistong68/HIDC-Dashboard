import React from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { RefreshCw, X } from 'lucide-react'

/**
 * ServiceWorkerUpdatePrompt - Shows a toast when a new SW version is available.
 * Replaces the old autoUpdate behavior that could silently reload mid-import.
 * User controls when the update/reload happens.
 */
const ServiceWorkerUpdatePrompt = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slideUp">
      <div className="bg-surface-800/95 backdrop-blur-xl border border-surface-700 rounded-2xl p-4 shadow-2xl w-80">
        {/* Close */}
        <button
          onClick={() => setNeedRefresh(false)}
          className="absolute top-3 right-3 p-1 rounded-lg hover:bg-surface-700 text-surface-400 hover:text-surface-200 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="flex items-start gap-3 pr-6">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-surface-100 mb-1">
              Update Available
            </h3>
            <p className="text-xs text-surface-400 leading-relaxed">
              A new version of HIDC Dashboard is ready.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={() => updateServiceWorker(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Update Now
          </button>
          <button
            onClick={() => setNeedRefresh(false)}
            className="px-4 py-2 text-surface-400 hover:text-surface-200 text-sm font-medium rounded-xl hover:bg-surface-700 transition-colors"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  )
}

export default ServiceWorkerUpdatePrompt
