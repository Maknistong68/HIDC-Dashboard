import React, { useState, useEffect } from 'react'
import { X, Download, Monitor, Smartphone } from 'lucide-react'

/**
 * Install Prompt - Shows a banner prompting users to install the app
 * Works with PWA (Add to Home Screen) functionality
 */
const InstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already dismissed
    const dismissed = localStorage.getItem('hidc-install-dismissed')
    const dismissedTime = dismissed ? parseInt(dismissed) : 0
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24)

    // Show again after 7 days
    if (dismissed && daysSinceDismissed < 7) {
      return
    }

    // Check if already installed as PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstall = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    // Check if installed
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowPrompt(false)
    }
    window.addEventListener('appinstalled', handleAppInstalled)

    // Show prompt after 3 seconds for browsers that support it
    const timer = setTimeout(() => {
      if (!dismissed || daysSinceDismissed >= 7) {
        setShowPrompt(true)
      }
    }, 3000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleAppInstalled)
      clearTimeout(timer)
    }
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Use the native install prompt
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setShowPrompt(false)
      }
      setDeferredPrompt(null)
    } else {
      // Show manual instructions for browsers without beforeinstallprompt
      alert(
        'To install Event Dashboard:\n\n' +
        'Edge/Chrome: Click the menu (⋮) → "Install Event Dashboard" or "Add to Home Screen"\n\n' +
        'The app will work offline once installed!'
      )
    }
  }

  const handleDismiss = () => {
    localStorage.setItem('hidc-install-dismissed', Date.now().toString())
    setShowPrompt(false)
  }

  if (!showPrompt || isInstalled) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slideUp">
      <div className="bg-surface-800/95 backdrop-blur-xl border border-surface-700 rounded-2xl p-4 shadow-2xl">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 rounded-lg hover:bg-surface-700 text-surface-400 hover:text-surface-200 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-content-center shadow-lg shadow-primary-500/20">
            <svg viewBox="0 0 48 48" className="w-8 h-8 mx-auto" fill="none">
              <defs>
                <linearGradient id="installHexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3478f6" />
                  <stop offset="100%" stopColor="#1646d8" />
                </linearGradient>
              </defs>
              <path d="M24 4C25 4 26 4.3 26.8 4.8L39.2 12.2C40.8 13.2 41.8 14.8 41.8 16.6V31.4C41.8 33.2 40.8 34.8 39.2 35.8L26.8 43.2C25.2 44.2 23.2 44.2 21.6 43.2L9.2 35.8C7.6 34.8 6.6 33.2 6.6 31.4V16.6C6.6 14.8 7.6 13.2 9.2 12.2L21.6 4.8C22.4 4.3 23.4 4 24 4Z" fill="url(#installHexGrad)"/>
              <rect x="15" y="28" width="5" height="12" rx="1.5" fill="white" fillOpacity="0.9" />
              <rect x="22" y="24" width="5" height="16" rx="1.5" fill="white" fillOpacity="0.9" />
              <rect x="29" y="20" width="5" height="20" rx="1.5" fill="white" fillOpacity="0.9" />
            </svg>
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0 pr-6">
            <h3 className="text-sm font-semibold text-surface-100 mb-1">
              Install Event Dashboard
            </h3>
            <p className="text-xs text-surface-400 leading-relaxed">
              Add to your desktop for quick access. Works offline!
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={handleInstall}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <Download className="w-4 h-4" />
            Install App
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 py-2.5 text-surface-400 hover:text-surface-200 text-sm font-medium rounded-xl hover:bg-surface-700 transition-colors"
          >
            Not now
          </button>
        </div>

        {/* Features */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-surface-700">
          <div className="flex items-center gap-1.5 text-xs text-surface-500">
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-surface-500">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-success-500">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>Secure</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  )
}

export default InstallPrompt
