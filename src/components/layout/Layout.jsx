import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Target, ShieldCheck, Settings, Eye, EyeOff, Trash2 } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { Logo } from '../ui'
import ConfirmDialog from '../common/ConfirmDialog'
import Footer from './Footer'

const Layout = ({ children }) => {
  const location = useLocation()
  const { showOpenClosed, setShowOpenClosed, incidents, clearData } = useData()
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const navItems = [
    { path: '/', label: 'Hazard Identification', icon: Target },
    { path: '/data-control', label: 'Data Control', icon: ShieldCheck },
  ]

  const isSettingsActive = location.pathname === '/settings'
  const hasData = incidents.length > 0

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Frosted Glass Header */}
      <header className="fixed top-0 left-0 right-0 h-14 glass border-b border-surface-200/50 shadow-soft z-50">
        <div className="h-full px-4 flex items-center justify-between max-w-[1800px] mx-auto">
          {/* Logo + Nav */}
          <div className="flex items-center gap-8">
            {/* New Logo */}
            <Logo size="default" />

            {/* Navigation Tabs */}
            <nav className="flex items-center gap-1" role="navigation" aria-label="Main navigation">
              {navItems.map(({ path, label, icon: Icon }) => {
                const isActive = location.pathname === path

                return (
                  <NavLink
                    key={path}
                    to={path}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                      transition-all duration-200 ease-out
                      ${isActive
                        ? 'bg-primary-100/80 text-primary-700 shadow-sm'
                        : 'text-surface-600 hover:bg-white/60 hover:text-surface-800 hover:shadow-sm'
                      }
                    `}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon size={18} aria-hidden="true" />
                    <span>{label}</span>
                  </NavLink>
                )
              })}
            </nav>
          </div>

          {/* Right Side - Toggle, Clear & Settings */}
          <div className="flex items-center gap-2">
            {hasData && (
              <>
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
                  <span className="hidden sm:inline">{showOpenClosed ? 'Showing Open/Closed' : 'All Status'}</span>
                </button>

                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ease-out bg-safety-critical-light text-safety-critical hover:bg-red-100 hover:shadow-sm"
                  aria-label="Clear all data"
                >
                  <Trash2 size={16} aria-hidden="true" />
                  <span className="hidden sm:inline">Clear Data</span>
                </button>
              </>
            )}

            {/* Divider */}
            <div className="w-px h-6 bg-surface-200 mx-1" aria-hidden="true" />

            {/* Settings Button */}
            <NavLink
              to="/settings"
              className={`
                flex items-center justify-center w-9 h-9 rounded-lg
                transition-all duration-200 ease-out
                ${isSettingsActive
                  ? 'bg-primary-100/80 text-primary-700 shadow-sm'
                  : 'text-surface-500 hover:bg-white/60 hover:text-surface-700 hover:shadow-sm'
                }
              `}
              aria-label="Settings"
              aria-current={isSettingsActive ? 'page' : undefined}
            >
              <Settings size={20} aria-hidden="true" />
            </NavLink>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className="pt-14 p-4 min-h-[calc(100vh-56px-48px)]"
        role="main"
        aria-label="Main content"
      >
        <div className="max-w-[1800px] mx-auto animate-fade-in">
          {children}
        </div>
      </main>

      {/* Footer - hide on Data Control and Settings pages */}
      {location.pathname !== '/data-control' && location.pathname !== '/settings' && (
        <Footer />
      )}

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
