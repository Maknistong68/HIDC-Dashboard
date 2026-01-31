import React, { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Menu, X, Target, ShieldCheck, Eye, EyeOff, Trash2, FileText, FolderOpen, Gauge } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { Logo } from '../ui'

/**
 * MobileNav - Hamburger menu with slide-out drawer for mobile navigation
 * Features:
 * - 44px touch targets for all interactive elements
 * - Slide-in animation from left
 * - Backdrop tap to close
 * - All navigation items accessible
 * - Data controls (show/hide status, clear data) included
 */
const MobileNav = ({ onClearDataClick }) => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const { showOpenClosed, setShowOpenClosed, incidents } = useData()

  const hasData = incidents.length > 0

  // Main navigation tabs
  const navItems = [
    { path: '/', label: 'Hazard Identification', icon: Target },
    { path: '/data-control', label: 'Data Control', icon: ShieldCheck },
    { path: '/outlook', label: 'Safety Outlook', icon: Gauge },
  ]

  // Utility items
  const utilityItems = [
    { path: '/files', label: 'File Manager', icon: FolderOpen },
    { path: '/legal', label: 'Legal', icon: FileText },
  ]

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  return (
    <>
      {/* Hamburger Button - 44px touch target */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-white/60 active:bg-white/80 transition-colors"
        aria-label="Open navigation menu"
        aria-expanded={isOpen}
        aria-controls="mobile-nav-drawer"
      >
        <Menu size={24} className="text-surface-700" />
      </button>

      {/* Overlay + Drawer - Very high z-index to appear above charts */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999]" id="mobile-nav-drawer" style={{ isolation: 'isolate' }}>
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in-overlay"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer */}
          <nav
            className="absolute top-0 left-0 bottom-0 w-72 max-w-[85vw] bg-white shadow-2xl animate-slide-in-left flex flex-col safe-area-top safe-area-left"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            {/* Header with Logo and Close */}
            <div className="flex items-center justify-between p-4 border-b border-surface-200">
              <Logo size="small" />
              <button
                onClick={() => setIsOpen(false)}
                className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-surface-100 active:bg-surface-200 transition-colors -mr-2"
                aria-label="Close navigation menu"
              >
                <X size={24} className="text-surface-600" />
              </button>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 overflow-y-auto py-2">
              {/* Main navigation */}
              <div className="px-4 mb-2">
                <span className="text-xs font-semibold text-surface-400 uppercase tracking-wide">
                  Main
                </span>
              </div>
              <div className="px-2 space-y-1">
                {navItems.map(({ path, label, icon: Icon }) => {
                  const isActive = location.pathname === path

                  return (
                    <NavLink
                      key={path}
                      to={path}
                      className={`
                        flex items-center gap-3 h-12 px-4 rounded-lg font-medium
                        transition-all duration-200 ease-out
                        ${isActive
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-surface-700 hover:bg-surface-100 active:bg-surface-200'
                        }
                      `}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <Icon size={20} aria-hidden="true" />
                      <span>{label}</span>
                    </NavLink>
                  )
                })}
              </div>

              {/* Utility items */}
              <div className="mt-4 pt-4 border-t border-surface-200">
                <div className="px-4 mb-2">
                  <span className="text-xs font-semibold text-surface-400 uppercase tracking-wide">
                    Tools
                  </span>
                </div>
                <div className="px-2 space-y-1">
                  {utilityItems.map(({ path, label, icon: Icon }) => {
                    const isActive = location.pathname === path

                    return (
                      <NavLink
                        key={path}
                        to={path}
                        className={`
                          flex items-center gap-3 h-12 px-4 rounded-lg font-medium
                          transition-all duration-200 ease-out
                          ${isActive
                            ? 'bg-primary-100 text-primary-700'
                            : 'text-surface-700 hover:bg-surface-100 active:bg-surface-200'
                          }
                        `}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <Icon size={20} aria-hidden="true" />
                        <span>{label}</span>
                      </NavLink>
                    )
                  })}
                </div>
              </div>

              {/* Data Controls Section */}
              {hasData && (
                <div className="mt-4 pt-4 border-t border-surface-200">
                  <div className="px-4 mb-2">
                    <span className="text-xs font-semibold text-surface-400 uppercase tracking-wide">
                      Data Controls
                    </span>
                  </div>
                  <div className="px-2 space-y-1">
                    {/* Toggle Open/Closed */}
                    <button
                      onClick={() => setShowOpenClosed(!showOpenClosed)}
                      className={`
                        w-full flex items-center gap-3 h-12 px-4 rounded-lg font-medium
                        transition-all duration-200 ease-out text-left
                        ${showOpenClosed
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-surface-700 hover:bg-surface-100 active:bg-surface-200'
                        }
                      `}
                      aria-pressed={showOpenClosed}
                    >
                      {showOpenClosed ? (
                        <Eye size={20} aria-hidden="true" />
                      ) : (
                        <EyeOff size={20} aria-hidden="true" />
                      )}
                      <div className="flex flex-col">
                        <span>{showOpenClosed ? 'Showing Open/Closed' : 'All Status'}</span>
                        <span className="text-xs text-surface-500">Toggle status breakdown</span>
                      </div>
                    </button>

                    {/* Clear Data */}
                    <button
                      onClick={() => {
                        setIsOpen(false)
                        // Small delay to allow menu to close before showing confirm dialog
                        setTimeout(() => onClearDataClick?.(), 150)
                      }}
                      className="w-full flex items-center gap-3 h-12 px-4 rounded-lg font-medium transition-all duration-200 ease-out text-left text-safety-critical hover:bg-safety-critical-light active:bg-red-100"
                    >
                      <Trash2 size={20} aria-hidden="true" />
                      <div className="flex flex-col">
                        <span>Clear All Data</span>
                        <span className="text-xs text-surface-500">Remove imported data</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-surface-200 safe-area-bottom">
              <p className="text-xs text-surface-400 text-center">
                HSE Dashboard v1.0
              </p>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}

export default MobileNav
