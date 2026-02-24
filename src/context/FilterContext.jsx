import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getExcludedReporters, setExcludedReporters as persistExcludedReporters } from '../utils/indexedDBStorage'

// Separate contexts for state and actions to prevent unnecessary re-renders
// Exported so TabFreezeGate can provide frozen values to hidden tabs
export const FilterStateContext = createContext(null)
export const FilterActionsContext = createContext(null)

// Per-tab filter isolation constants
const TAB_PATHS = new Set(['/', '/data-control', '/outlook'])
const DEFAULT_TAB_FILTERS = {
  period: null,
  customDateRange: null,
  contractor: [],
  site: [],
  subRegion: [],
  workRelatedOnly: true,
}

/**
 * FilterProvider - Per-tab isolated filter state for Dashboard, DataQuality, and SafetyOutlook
 *
 * Each tab maintains its own independent filter state. Filtering on one tab does NOT affect
 * other tabs. Switching tabs is instant because each tab's filter fingerprint is stable
 * (unchanged while the user is on another tab) — so all cache layers hit.
 *
 * Split into FilterStateContext and FilterActionsContext to optimize re-renders:
 * - Components that only dispatch actions don't re-render on state changes
 * - Components that read state re-render only when state they use changes
 */
export const FilterProvider = ({ children }) => {
  const location = useLocation()
  const activeTab = TAB_PATHS.has(location.pathname) ? location.pathname : '/'

  // Per-tab filter state map
  const [tabFilters, setTabFilters] = useState(() => {
    const initial = {}
    for (const path of TAB_PATHS) {
      initial[path] = { ...DEFAULT_TAB_FILTERS }
    }
    return initial
  })

  // excludedReporters stays GLOBAL (it's a data-quality setting, not a per-tab filter)
  const [excludedReporters, setExcludedReportersState] = useState([])

  // Load excluded reporters from IndexedDB on mount
  useEffect(() => {
    getExcludedReporters().then(reporters => {
      setExcludedReportersState(reporters)
    })
  }, [])

  // Mutual exclusion: setting period clears custom range (active tab only)
  const setPeriod = useCallback((value) => {
    setTabFilters(prev => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], period: value, customDateRange: null }
    }))
  }, [activeTab])

  // Mutual exclusion: setting custom range clears period (active tab only)
  const setCustomDateRange = useCallback((value) => {
    setTabFilters(prev => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], customDateRange: value, period: null }
    }))
  }, [activeTab])

  // Contractor change resets site and subRegion (parent-child relationship, active tab only)
  const setContractor = useCallback((value) => {
    setTabFilters(prev => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], contractor: value, site: [], subRegion: [] }
    }))
  }, [activeTab])

  // Site change resets subRegion (parent-child relationship, active tab only)
  const setSite = useCallback((value) => {
    setTabFilters(prev => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], site: value, subRegion: [] }
    }))
  }, [activeTab])

  // Direct subRegion setter (active tab only)
  const setSubRegion = useCallback((value) => {
    setTabFilters(prev => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], subRegion: value }
    }))
  }, [activeTab])

  // Work-related toggle (active tab only)
  const setWorkRelatedOnly = useCallback((value) => {
    setTabFilters(prev => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], workRelatedOnly: value }
    }))
  }, [activeTab])

  // Excluded reporters setter (persists to IndexedDB) - GLOBAL
  const setExcludedReporters = useCallback(async (reporters) => {
    setExcludedReportersState(reporters)
    await persistExcludedReporters(reporters)
  }, [])

  // Generic setter for FilterBar compatibility
  const setFilter = useCallback((key, value) => {
    if (key === 'contractor') {
      setContractor(value)
    } else if (key === 'site') {
      setSite(value)
    } else if (key === 'subRegion') {
      setSubRegion(value)
    } else if (key === 'excludedReporters') {
      setExcludedReporters(value)
    }
  }, [setContractor, setSite, setSubRegion, setExcludedReporters])

  // Clear all filters for the active tab only (excludedReporters persists - it's a global setting)
  const clearFilters = useCallback(() => {
    setTabFilters(prev => ({
      ...prev,
      [activeTab]: { ...DEFAULT_TAB_FILTERS }
    }))
  }, [activeTab])

  // Derive active tab's state
  const active = tabFilters[activeTab] || DEFAULT_TAB_FILTERS
  const { period, customDateRange, contractor, site, subRegion, workRelatedOnly } = active

  // Combined filters object for FilterBar compatibility
  const filters = useMemo(() => ({ contractor, site, subRegion }), [contractor, site, subRegion])

  // State context value - exposes active tab's state (same shape as before)
  const stateValue = useMemo(() => ({
    period,
    customDateRange,
    contractor,
    site,
    subRegion,
    excludedReporters,
    workRelatedOnly,
    filters
  }), [period, customDateRange, contractor, site, subRegion, excludedReporters, workRelatedOnly, filters])

  // Actions context value - stable reference, only changes when activeTab changes
  const actionsValue = useMemo(() => ({
    setPeriod,
    setCustomDateRange,
    setContractor,
    setSite,
    setSubRegion,
    setExcludedReporters,
    setWorkRelatedOnly,
    setFilter,
    clearFilters
  }), [setPeriod, setCustomDateRange, setContractor, setSite, setSubRegion, setExcludedReporters, setWorkRelatedOnly, setFilter, clearFilters])

  return (
    <FilterStateContext.Provider value={stateValue}>
      <FilterActionsContext.Provider value={actionsValue}>
        {children}
      </FilterActionsContext.Provider>
    </FilterStateContext.Provider>
  )
}

/**
 * useFilterState - Hook to access filter state values
 * Use this for components that need to read filter values
 * @returns {Object} Filter state values (period, contractor, site, subRegion, excludedReporters, filters)
 */
export const useFilterState = () => {
  const context = useContext(FilterStateContext)
  if (!context) {
    throw new Error('useFilterState must be used within a FilterProvider')
  }
  return context
}

/**
 * useFilterActions - Hook to access filter action functions
 * Use this for components that only need to update filters (no re-render on state change)
 * @returns {Object} Filter action functions (setPeriod, setContractor, setSite, setSubRegion, setExcludedReporters, setFilter, clearFilters)
 */
export const useFilterActions = () => {
  const context = useContext(FilterActionsContext)
  if (!context) {
    throw new Error('useFilterActions must be used within a FilterProvider')
  }
  return context
}

/**
 * useFilter - Combined hook for backward compatibility
 * Returns both state and actions in a single object
 * @returns {Object} Combined filter state and actions
 */
export const useFilter = () => {
  const state = useFilterState()
  const actions = useFilterActions()

  // Combine state and actions - memoized to prevent unnecessary object recreation
  return useMemo(() => ({
    ...state,
    ...actions
  }), [state, actions])
}

// Legacy default export (unused — prefer named exports above)
export default FilterStateContext
