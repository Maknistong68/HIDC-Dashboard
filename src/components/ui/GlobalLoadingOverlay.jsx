import React from 'react'
import { useLoading } from '../../context/LoadingContext'

const GlobalLoadingOverlay = () => {
  const { isLoading, progress, message } = useLoading()

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center transition-opacity duration-400 ${
        isLoading
          ? 'opacity-100 pointer-events-auto'
          : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-surface-900/60 backdrop-blur-sm" />

      {/* Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-80 text-center">
        {/* App branding */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 mx-auto mb-4 flex items-center justify-center shadow-lg shadow-primary-500/20">
          <svg viewBox="0 0 48 48" className="w-7 h-7" fill="none">
            <path
              d="M24 4C25 4 26 4.3 26.8 4.8L39.2 12.2C40.8 13.2 41.8 14.8 41.8 16.6V31.4C41.8 33.2 40.8 34.8 39.2 35.8L26.8 43.2C25.2 44.2 23.2 44.2 21.6 43.2L9.2 35.8C7.6 34.8 6.6 33.2 6.6 31.4V16.6C6.6 14.8 7.6 13.2 9.2 12.2L21.6 4.8C22.4 4.3 23.4 4 24 4Z"
              fill="white"
              fillOpacity="0.9"
            />
            <rect x="15" y="28" width="5" height="12" rx="1.5" fill="currentColor" className="text-primary-500" />
            <rect x="22" y="24" width="5" height="16" rx="1.5" fill="currentColor" className="text-primary-600" />
            <rect x="29" y="20" width="5" height="20" rx="1.5" fill="currentColor" className="text-primary-700" />
          </svg>
        </div>

        <h3 className="text-base font-semibold text-surface-900 mb-1">Event Dashboard</h3>
        <p className="text-sm text-surface-500 mb-5 min-h-[1.25rem]">{message || 'Loading...'}</p>

        {/* Progress bar */}
        <div className="w-full h-2 bg-surface-100 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-surface-400">{Math.round(progress)}%</p>
      </div>
    </div>
  )
}

export default GlobalLoadingOverlay
