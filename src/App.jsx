import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ErrorBoundary from './components/common/ErrorBoundary'
import InstallPrompt from './components/common/InstallPrompt'
import ServiceWorkerUpdatePrompt from './components/common/ServiceWorkerUpdatePrompt'
import PreloadedTabs from './components/common/PreloadedTabs'
import { LoadingSpinner } from './components/ui'
import GlobalLoadingOverlay from './components/ui/GlobalLoadingOverlay'
import { ImportLockProvider } from './context/ImportLockContext'
import { FilteredDataProvider } from './context/FilteredDataContext'
import { useDataState, useUIState } from './context/DataContext'
import { OnboardingScreen, InitialLoadingScreen } from './components/onboarding'
import useDocumentTitle from './hooks/useDocumentTitle'

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
  const { incidents } = useDataState()
  const { isLoading, isProcessingBatch } = useUIState()
  useDocumentTitle()

  // Show minimal loading screen while data loads from IndexedDB
  if (isLoading) {
    return <InitialLoadingScreen />
  }

  // No data? Show only the onboarding/import screen (no Layout chrome)
  // Keep OnboardingScreen mounted while batch is processing to prevent unmounting mid-import
  if (incidents.length === 0 || isProcessingBatch) {
    return <OnboardingScreen />
  }

  // Normal app with Layout - preloaded tabs for instant switching
  // FilteredDataProvider centralizes filtered data computation for all 3 pages
  return (
    <>
      <FilteredDataProvider>
        <Layout>
          <InstallPrompt />
          <ServiceWorkerUpdatePrompt />

          {/* All 3 main tabs preloaded - instant switching via CSS display */}
          <PreloadedTabs />

          <Routes>
            {/* Main tabs - null element, handled by PreloadedTabs */}
            <Route path="/" element={null} />
            <Route path="/data-control" element={null} />
            <Route path="/outlook" element={null} />

            {/* Lazy-loaded secondary pages — ErrorBoundary catches chunk load failures */}
            <Route path="/files" element={
              <ErrorBoundary>
                <Suspense fallback={<PageLoadingFallback />}>
                  <FileManagement />
                </Suspense>
              </ErrorBoundary>
            } />
            <Route path="/legal" element={
              <ErrorBoundary>
                <Suspense fallback={<PageLoadingFallback />}>
                  <Legal />
                </Suspense>
              </ErrorBoundary>
            } />

            {/* Legacy redirects */}
            <Route path="/data-quality" element={<Navigate to="/data-control" replace />} />
            <Route path="/data" element={<Navigate to="/" replace />} />
            <Route path="/import" element={<Navigate to="/data-control" replace />} />
            <Route path="/settings" element={<Navigate to="/" replace />} />
            <Route path="/predictive" element={<Navigate to="/outlook" replace />} />

            {/* Catch-all: redirect unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </FilteredDataProvider>
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
