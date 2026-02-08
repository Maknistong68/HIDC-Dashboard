import React from 'react'
import Logo from '../ui/Logo'

/**
 * InitialLoadingScreen - Minimal full-page loading indicator
 * Shown during initial IndexedDB data load before we know if data exists.
 * No Layout chrome - just a centered branded loader.
 */
const InitialLoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-primary-50/30 flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-6">
        {/* Logo */}
        <Logo size="large" showText={false} />

        {/* Loading spinner */}
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
          <span className="text-surface-500 text-sm font-medium">Loading...</span>
        </div>
      </div>
    </div>
  )
}

export default InitialLoadingScreen
