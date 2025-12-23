import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { HardHat, LayoutDashboard, Database, Settings, Eye, EyeOff } from 'lucide-react'
import { useData } from '../../context/DataContext'

const Layout = ({ children }) => {
  const location = useLocation()
  const { showOpenClosed, setShowOpenClosed, incidents } = useData()

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/data', label: 'All Data', icon: Database },
    { path: '/settings', label: 'Settings', icon: Settings },
  ]

  // Only show toggle if there's data
  const hasData = incidents.length > 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-50">
        <div className="h-full px-4 flex items-center justify-between">
          {/* Logo + Nav */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <div className="flex items-center gap-3">
              {/* 3D Shield Logo */}
              <div className="relative w-10 h-10">
                {/* Shadow layer */}
                <div
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background: 'linear-gradient(145deg, #1e40af, #1e3a8a)',
                    transform: 'translate(2px, 2px)',
                  }}
                />
                {/* Main layer */}
                <div
                  className="absolute inset-0 rounded-lg flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)',
                    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.4), inset 0 -1px 1px rgba(0,0,0,0.2)',
                  }}
                >
                  {/* Inner highlight */}
                  <div
                    className="absolute top-0.5 left-0.5 right-0.5 h-4 rounded-t-md opacity-30"
                    style={{
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.8) 0%, transparent 100%)',
                    }}
                  />
                  {/* Icon */}
                  <HardHat className="w-5 h-5 text-white relative z-10 drop-shadow-sm" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-gray-900 text-base leading-tight tracking-wide">HIDC</span>
                <span className="text-[10px] text-gray-500 leading-tight">Hazard Identification Dashboard & Control</span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex items-center gap-1">
              {navItems.map(({ path, label, icon: Icon }) => {
                const isActive = location.pathname === path ||
                  (path === '/data' && location.pathname === '/incidents')

                return (
                  <NavLink
                    key={path}
                    to={path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon size={18} />
                    {label}
                  </NavLink>
                )
              })}
            </nav>
          </div>

          {/* Right Side - Toggle */}
          {hasData && (
            <button
              onClick={() => setShowOpenClosed(!showOpenClosed)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                showOpenClosed
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {showOpenClosed ? <Eye size={16} /> : <EyeOff size={16} />}
              <span>{showOpenClosed ? 'Showing Open/Closed' : 'All Status'}</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-14 p-4">
        {children}
      </main>
    </div>
  )
}

export default Layout
