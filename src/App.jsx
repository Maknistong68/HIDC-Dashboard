import { Suspense, lazy, useEffect, useRef } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ErrorBoundary from './components/common/ErrorBoundary'
import InstallPrompt from './components/common/InstallPrompt'
import ServiceWorkerUpdatePrompt from './components/common/ServiceWorkerUpdatePrompt'
import Dashboard from './pages/Dashboard'
import DataQuality from './pages/DataQuality'
import SafetyOutlook from './pages/SafetyOutlook'
import { LoadingSpinner } from './components/ui'
import GlobalLoadingOverlay from './components/ui/GlobalLoadingOverlay'
import { ImportLockProvider } from './context/ImportLockContext'
import { FilteredDataProvider, FilteredDataContext, useFilteredData } from './context/FilteredDataContext'
import { useFilterState, useFilterActions, FilterStateContext, FilterActionsContext } from './context/FilterContext'
import { useDataState, useUIState } from './context/DataContext'
import { OnboardingScreen, InitialLoadingScreen } from './components/onboarding'
import useDocumentTitle from './hooks/useDocumentTitle'
import { scheduler } from './utils/tabPriorityScheduler'

// Lazy-loaded for less frequent pages
const FileManagement = lazy(() => import('./pages/FileManagement'))
const Legal = lazy(() => import('./pages/Legal'))

// Loading fallback for lazy-loaded pages
const PageLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <LoadingSpinner size="large" color="primary" />
  </div>
)

/**
 * TabFreezeGate — freezes context values when a tab is inactive.
 *
 * Provides INNER context providers that shadow the global ones.
 * When isActive=true: refs update with fresh context values → children see live data.
 * When isActive=false: refs hold stale values → inner Provider values don't change →
 * React's nested-Provider bail-out skips the entire subtree (no re-render at all).
 *
 * This means hidden tabs have ZERO cost on filter changes — React doesn't even
 * visit their fiber subtree during context propagation.
 */
function TabFreezeGate({ isActive, children }) {
  // Subscribe to global (outer) context providers
  const filterState = useFilterState()
  const filterActions = useFilterActions()
  const filteredData = useFilteredData()

  // Frozen refs — only updated when this tab is active
  const frozenStateRef = useRef(filterState)
  const frozenActionsRef = useRef(filterActions)
  const frozenDataRef = useRef(filteredData)

  if (isActive) {
    frozenStateRef.current = filterState
    frozenActionsRef.current = filterActions
    frozenDataRef.current = filteredData
  }

  // Inner providers shadow the global ones.
  // Children's useContext() reads from these (closest ancestor), not the global providers.
  // When frozen values haven't changed, React bails out of the entire subtree.
  return (
    <FilterStateContext.Provider value={frozenStateRef.current}>
      <FilterActionsContext.Provider value={frozenActionsRef.current}>
        <FilteredDataContext.Provider value={frozenDataRef.current}>
          {children}
        </FilteredDataContext.Provider>
      </FilterActionsContext.Provider>
    </FilterStateContext.Provider>
  )
}

/**
 * TabPanel — persistent tab container with deferred mounting.
 *
 * - First visit: mounts the tab component (deferred — not mounted until user navigates here)
 * - Subsequent visits: tab stays mounted, just toggles CSS display
 * - Hidden tabs: context frozen via TabFreezeGate → zero re-render cost
 *
 * This eliminates the unmount/remount cycle that was causing ~300ms lag on every tab switch.
 */
function TabPanel({ path, children }) {
  const location = useLocation()
  const isActive = location.pathname === path
  const mountedRef = useRef(isActive) // Mount immediately if it's the initial route

  if (isActive) mountedRef.current = true
  if (!mountedRef.current) return null

  return (
    <div style={{ display: isActive ? undefined : 'none' }}>
      <TabFreezeGate isActive={isActive}>
        {children}
      </TabFreezeGate>
    </div>
  )
}

// Inner component that uses the import lock for route blocking
function AppContent() {
  const { incidents } = useDataState()
  const { isLoading, isProcessingBatch } = useUIState()
  const location = useLocation()
  useDocumentTitle()

  // Notify scheduler of active tab on route changes
  useEffect(() => {
    const tab = location.pathname === '/data-control' ? 'dataQuality'
      : location.pathname === '/outlook' ? 'outlook'
      : location.pathname === '/' ? 'dashboard'
      : null
    if (tab) scheduler.setActiveTab(tab)
  }, [location.pathname])

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
  // Main tabs: persistent (display-toggled), context-frozen when hidden → instant tab switching
  // Secondary pages: standard Routes (lazy-loaded, rarely visited)
  return (
    <>
      <FilteredDataProvider>
        <Layout>
          <InstallPrompt />
          <ServiceWorkerUpdatePrompt />

          {/* Main tabs — persistent, display-toggled, context-frozen when hidden */}
          <TabPanel path="/">
            <Dashboard />
          </TabPanel>
          <TabPanel path="/data-control">
            <DataQuality />
          </TabPanel>
          <TabPanel path="/outlook">
            <SafetyOutlook />
          </TabPanel>

          {/* Secondary pages + legacy redirects — standard route-based */}
          <Routes>
            {/* Main tab routes — render nothing (handled by TabPanel above) */}
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
