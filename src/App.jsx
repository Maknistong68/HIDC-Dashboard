import React, { Suspense, lazy, useRef } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ErrorBoundary from './components/common/ErrorBoundary'
import InstallPrompt from './components/common/InstallPrompt'
import ServiceWorkerUpdatePrompt from './components/common/ServiceWorkerUpdatePrompt'
import { LoadingSpinner } from './components/ui'
import GlobalLoadingOverlay from './components/ui/GlobalLoadingOverlay'
import { ImportLockProvider } from './context/ImportLockContext'
import { useData } from './context/DataContext'
import { OnboardingScreen, InitialLoadingScreen } from './components/onboarding'

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

// Main tabs - deferred rendering: mount on first visit, stay mounted after
// Dashboard always mounted (landing page). Others mount when navigated to.
// Once mounted, tabs stay mounted (preserving useMemo calculations across route changes).
const MainTabs = () => {
  const { pathname } = useLocation()
  const visitedRef = useRef(new Set(['/']))

  // Track visited tabs (useRef avoids re-render)
  if (['/data-control', '/outlook'].includes(pathname)) {
    visitedRef.current.add(pathname)
  }

  const getPageClass = (path) => {
    const isActive = pathname === path
    return `page-container ${isActive ? 'page-visible page-tab-switch' : 'page-hidden'}`
  }

  return (
    <div className="relative">
      <div className={getPageClass('/')}>
        <Dashboard />
      </div>
      {visitedRef.current.has('/data-control') && (
        <div className={getPageClass('/data-control')}>
          <DataQuality />
        </div>
      )}
      {visitedRef.current.has('/outlook') && (
        <div className={getPageClass('/outlook')}>
          <SafetyOutlook />
        </div>
      )}
    </div>
  )
}

// Inner component that uses the import lock for route blocking
function AppContent() {
  const { pathname } = useLocation()
  const { incidents, isLoading, isProcessingBatch } = useData()
  const isMainTab = ['/', '/data-control', '/outlook'].includes(pathname)

  // Show minimal loading screen while data loads from IndexedDB
  if (isLoading) {
    return <InitialLoadingScreen />
  }

  // No data? Show only the onboarding/import screen (no Layout chrome)
  // Keep OnboardingScreen mounted while batch is processing to prevent unmounting mid-import
  if (incidents.length === 0 || isProcessingBatch) {
    return <OnboardingScreen />
  }

  // Normal app with Layout
  return (
    <>
      <Layout>
        <InstallPrompt />
        <ServiceWorkerUpdatePrompt />
        {/* Main tabs - conditionally rendered for performance */}
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
      <GlobalLoadingOverlay />
    </>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <ImportLockProvider>
        <AppContent />
      </ImportLockProvider>
    </ErrorBoundary>
  )
}

export default App
