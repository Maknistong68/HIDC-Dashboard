import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ErrorBoundary from './components/common/ErrorBoundary'
import InstallPrompt from './components/common/InstallPrompt'
import { LoadingSpinner } from './components/ui'

// Direct imports for main tabs (instant switching)
import Dashboard from './pages/Dashboard'
import DataQuality from './pages/DataQuality'
import SafetyOutlook from './pages/SafetyOutlook'

// Lazy-loaded for less frequent pages
const FileManagement = lazy(() => import('./pages/FileManagement'))
const Legal = lazy(() => import('./pages/Legal'))

// Loading fallback for lazy-loaded pages
const PageLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <LoadingSpinner size="large" color="primary" />
  </div>
)

// Main tabs - always rendered, visibility controlled by CSS
const MainTabs = () => {
  const { pathname } = useLocation()
  const isMainTab = ['/', '/data-control', '/outlook'].includes(pathname)

  if (!isMainTab) return null

  return (
    <>
      <div style={{ display: pathname === '/' ? 'block' : 'none' }}>
        <Dashboard />
      </div>
      <div style={{ display: pathname === '/data-control' ? 'block' : 'none' }}>
        <DataQuality />
      </div>
      <div style={{ display: pathname === '/outlook' ? 'block' : 'none' }}>
        <SafetyOutlook />
      </div>
    </>
  )
}

function App() {
  const { pathname } = useLocation()
  const isMainTab = ['/', '/data-control', '/outlook'].includes(pathname)

  return (
    <ErrorBoundary>
      <Layout>
        <InstallPrompt />
        {/* Main tabs - always mounted for instant switching */}
        <MainTabs />

        {/* Other routes - lazy loaded */}
        {!isMainTab && (
          <Suspense fallback={<PageLoadingFallback />}>
            <Routes>
              <Route path="/files" element={<FileManagement />} />
              <Route path="/legal" element={<Legal />} />

              {/* Legacy redirects */}
              <Route path="/data-quality" element={<Navigate to="/data-control" replace />} />
              <Route path="/data" element={<Navigate to="/" replace />} />
              <Route path="/import" element={<Navigate to="/data-control" replace />} />
              <Route path="/settings" element={<Navigate to="/" replace />} />
              <Route path="/predictive" element={<Navigate to="/outlook" replace />} />
            </Routes>
          </Suspense>
        )}
      </Layout>
    </ErrorBoundary>
  )
}

export default App
