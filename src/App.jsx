import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ErrorBoundary from './components/common/ErrorBoundary'
import InstallPrompt from './components/common/InstallPrompt'
import ServiceWorkerUpdatePrompt from './components/common/ServiceWorkerUpdatePrompt'
import { LoadingSpinner } from './components/ui'
import GlobalLoadingOverlay from './components/ui/GlobalLoadingOverlay'
import { ImportLockProvider } from './context/ImportLockContext'
import { useData } from './context/DataContext'
import { OnboardingScreen, InitialLoadingScreen } from './components/onboarding'

// Direct imports for main pages
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

// Inner component that uses the import lock for route blocking
function AppContent() {
  const { incidents, isLoading, isProcessingBatch } = useData()

  // Show minimal loading screen while data loads from IndexedDB
  if (isLoading) {
    return <InitialLoadingScreen />
  }

  // No data? Show only the onboarding/import screen (no Layout chrome)
  // Keep OnboardingScreen mounted while batch is processing to prevent unmounting mid-import
  if (incidents.length === 0 || isProcessingBatch) {
    return <OnboardingScreen />
  }

  // Normal app with Layout - standard routing (only active page mounted)
  return (
    <>
      <Layout>
        <InstallPrompt />
        <ServiceWorkerUpdatePrompt />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/data-control" element={<DataQuality />} />
          <Route path="/outlook" element={<SafetyOutlook />} />
          <Route path="/files" element={
            <Suspense fallback={<PageLoadingFallback />}>
              <FileManagement />
            </Suspense>
          } />
          <Route path="/legal" element={
            <Suspense fallback={<PageLoadingFallback />}>
              <Legal />
            </Suspense>
          } />

          {/* Legacy redirects */}
          <Route path="/data-quality" element={<Navigate to="/data-control" replace />} />
          <Route path="/data" element={<Navigate to="/" replace />} />
          <Route path="/import" element={<Navigate to="/data-control" replace />} />
          <Route path="/settings" element={<Navigate to="/" replace />} />
          <Route path="/predictive" element={<Navigate to="/outlook" replace />} />
        </Routes>
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
