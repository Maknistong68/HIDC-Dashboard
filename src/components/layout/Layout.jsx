import React, { useState, useCallback } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Target, ShieldCheck, Eye, EyeOff, Trash2, FolderOpen, Gauge } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useImportLock } from '../../context/ImportLockContext'
import { Logo } from '../ui'
import ConfirmDialog from '../common/ConfirmDialog'
import Footer from './Footer'
import MobileNav from './MobileNav'
import useIsMobile from '../../hooks/useIsMobile'

const Layout = ({ children }) => {
  const location = useLocation()
  const { showOpenClosed, setShowOpenClosed, incidents, clearData, isImporting } = useData()
  const { isLocked: isImportLocked } = useImportLock()
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const isMobile = useIsMobile(768) // Use md breakpoint for nav switch

  // Combined import check - either DataContext importing or global lock
  const isBlocked = isImporting || isImportLocked

  // Guard navigation while importing - completely blocks when locked
  const guardNavClick = useCallback((e) => {
    if (isImportLocked) {
      // Hard block - no confirmation, just prevent
      e.preventDefault()
      return
    }
    if (isImporting) {
      const confirmed = window.confirm(
        'A file import is in progress. Navigating away may interrupt it. Continue?'
      )
      if (!confirmed) {
        e.preventDefault()
      }
    }
  }, [isImporting, isImportLocked])

  // Main navigation tabs (3 tabs together)
  const navItems = [
    { path: '/', label: 'Hazard Identification', icon: Target },
    { path: '/data-control', label: 'Data Control', icon: ShieldCheck },
    { path: '/outlook', label: 'Safety Outlook', icon: Gauge },
  ]

  const hasData = incidents.length > 0

  return (
    <div className="min-h-screen bg-surface-50">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-primary-600 focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        Skip to main content
      </a>
      {/* Frosted Glass Header */}
      <header className="fixed top-0 left-0 right-0 h-14 glass border-b border-surface-200/50 shadow-soft z-50 safe-area-top">
        <div className="h-full px-2 sm:px-4 flex items-center justify-between max-w-[1800px] mx-auto">
          {/* Mobile: Hamburger + Logo */}
          {isMobile ? (
            <div className="flex items-center gap-1">
              <MobileNav onClearDataClick={() => setShowClearConfirm(true)} />
              <Logo size="small" />
            </div>
          ) : (
            /* Desktop: Logo + Nav */
            <div className="flex items-center gap-8">
              <Logo size="default" />

              {/* Navigation Tabs */}
              <nav className="flex items-center gap-1" role="navigation" aria-label="Main navigation">
                {navItems.map(({ path, label, icon: Icon }) => {
                  const isActive = location.pathname === path

                  return (
                    <NavLink
                      key={path}
                      to={path}
                      onClick={guardNavClick}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                        transition-all duration-200 ease-out
                        ${isImportLocked
                          ? 'pointer-events-none opacity-50 cursor-not-allowed'
                          : ''
                        }
                        ${isActive
                          ? 'bg-primary-100/80 text-primary-700 shadow-sm'
                          : 'text-surface-600 hover:bg-white/60 hover:text-surface-800 hover:shadow-sm'
                        }
                      `}
                      aria-current={isActive ? 'page' : undefined}
                      aria-disabled={isImportLocked}
                      tabIndex={isImportLocked ? -1 : undefined}
                    >
                      <Icon size={18} aria-hidden="true" />
                      <span>{label}</span>
                    </NavLink>
                  )
                })}
              </nav>
            </div>
          )}

          {/* Right Side - Mobile: Just Settings, Desktop: Full controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Desktop: File Manager button + toggle and clear buttons */}
            {!isMobile && (
              <>
                {/* File Manager button */}
                <NavLink
                  to="/files"
                  onClick={guardNavClick}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
                    transition-all duration-200 ease-out
                    ${isImportLocked
                      ? 'pointer-events-none opacity-50 cursor-not-allowed'
                      : ''
                    }
                    ${location.pathname === '/files'
                      ? 'bg-primary-100/80 text-primary-700 shadow-sm'
                      : 'bg-white/60 text-surface-600 hover:bg-white/80 hover:text-surface-800 hover:shadow-sm'
                    }
                  `}
                  aria-label="Open File Manager"
                  aria-disabled={isImportLocked}
                  tabIndex={isImportLocked ? -1 : undefined}
                >
                  <FolderOpen size={16} aria-hidden="true" />
                  <span className="hidden lg:inline">Files</span>
                </NavLink>

                {hasData && (
                  <>
                    {/* Divider */}
                    <div className="w-px h-6 bg-surface-200 mx-1" aria-hidden="true" />

                    <button
                      onClick={() => setShowOpenClosed(!showOpenClosed)}
                      className={`
                        flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
                        transition-all duration-200 ease-out
                        ${showOpenClosed
                          ? 'bg-primary-100/80 text-primary-700 shadow-sm'
                          : 'bg-white/60 text-surface-600 hover:bg-white/80 hover:text-surface-800 hover:shadow-sm'
                        }
                      `}
                      aria-pressed={showOpenClosed}
                      aria-label={showOpenClosed ? 'Hide open/closed breakdown' : 'Show open/closed breakdown'}
                    >
                      {showOpenClosed ? <Eye size={16} aria-hidden="true" /> : <EyeOff size={16} aria-hidden="true" />}
                      <span className="hidden lg:inline">{showOpenClosed ? 'Showing Open/Closed' : 'All Status'}</span>
                    </button>

                    <button
                      onClick={() => setShowClearConfirm(true)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ease-out bg-safety-critical-light text-safety-critical hover:bg-red-100 hover:shadow-sm"
                      aria-label="Clear all data"
                    >
                      <Trash2 size={16} aria-hidden="true" />
                      <span className="hidden lg:inline">Clear Data</span>
                    </button>
                  </>
                )}
              </>
            )}

            {/* Mobile: Show both toggle AND clear data buttons */}
            {isMobile && hasData && (
              <>
                <button
                  onClick={() => setShowOpenClosed(!showOpenClosed)}
                  className={`
                    w-11 h-11 flex items-center justify-center rounded-lg
                    transition-all duration-200 ease-out
                    ${showOpenClosed
                      ? 'bg-primary-100/80 text-primary-700'
                      : 'text-surface-500 hover:bg-white/60 hover:text-surface-700'
                    }
                  `}
                  aria-pressed={showOpenClosed}
                  aria-label={showOpenClosed ? 'Hide status breakdown' : 'Show status breakdown'}
                >
                  {showOpenClosed ? <Eye size={20} aria-hidden="true" /> : <EyeOff size={20} aria-hidden="true" />}
                </button>

                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="w-11 h-11 flex items-center justify-center rounded-lg bg-safety-critical-light text-safety-critical hover:bg-red-100 active:bg-red-200 transition-all duration-200"
                  aria-label="Clear all data"
                >
                  <Trash2 size={20} aria-hidden="true" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content - Responsive padding */}
      <main
        id="main-content"
        className={`pt-14 ${isMobile ? 'p-3' : 'p-4'}`}
        role="main"
        aria-label="Main content"
      >
        <div className="max-w-[1800px] mx-auto animate-fade-in">
          {children}
        </div>
      </main>

      {/* Footer - show consistently on all pages */}
      <Footer />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={clearData}
        title="Clear All Data"
        message="Are you sure you want to delete all data? This action cannot be undone."
        confirmText="Clear All Data"
        variant="danger"
      />
    </div>
  )
}

export default Layout
