import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import { getExcludedReporters, setExcludedReporters as persistExcludedReporters } from '../utils/indexedDBStorage'

// Separate contexts for state and actions to prevent unnecessary re-renders
const FilterStateContext = createContext(null)
const FilterActionsContext = createContext(null)

/**
 * FilterProvider - Shared filter state across Dashboard, DataQuality, and SafetyOutlook
 *
 * Provides synchronized filter state that persists when navigating between tabs:
 * - period: Time period filter (null = All, 0.25 = 1W, 1 = 1M, 3 = 3M, 6 = 6M, 12 = 1Y)
 * - contractor: Selected contractor filter ('' = All)
 * - site: Selected site filter ('' = All)
 *
 * Split into FilterStateContext and FilterActionsContext to optimize re-renders:
 * - Components that only dispatch actions don't re-render on state changes
 * - Components that read state re-render only when state they use changes
 */
export const FilterProvider = ({ children }) => {
  const [period, setPeriod] = useState(null)        // null = All
  const [contractor, setContractorState] = useState('')
  const [site, setSiteState] = useState('')
  const [subRegion, setSubRegionState] = useState('')
  const [excludedReporters, setExcludedReportersState] = useState([])
  const [workRelatedOnly, setWorkRelatedOnly] = useState(true)

  // Load excluded reporters from IndexedDB on mount
  useEffect(() => {
    getExcludedReporters().then(reporters => {
      setExcludedReportersState(reporters)
    })
  }, [])

  // Contractor change resets site and subRegion (parent-child relationship)
  const setContractor = useCallback((value) => {
    setContractorState(value)
    setSiteState('')
    setSubRegionState('')
  }, [])

  // Direct site setter
  const setSite = useCallback((value) => {
    setSiteState(value)
  }, [])

  // Direct subRegion setter
  const setSubRegion = useCallback((value) => {
    setSubRegionState(value)
  }, [])

  // Excluded reporters setter (persists to IndexedDB)
  const setExcludedReporters = useCallback(async (reporters) => {
    setExcludedReportersState(reporters)
    await persistExcludedReporters(reporters)
  }, [])

  // Generic setter for FilterBar compatibility
  const setFilter = useCallback((key, value) => {
    if (key === 'contractor') {
      setContractor(value)
    } else if (key === 'site') {
      setSiteState(value)
    } else if (key === 'subRegion') {
      setSubRegionState(value)
    } else if (key === 'excludedReporters') {
      setExcludedReporters(value)
    }
  }, [setContractor, setExcludedReporters])

  // Clear all filters (excludedReporters persists - it's a setting, not a temporary filter)
  const clearFilters = useCallback(() => {
    setPeriod(null)
    setContractorState('')
    setSiteState('')
    setSubRegionState('')
    setWorkRelatedOnly(true)
  }, [])

  // Combined filters object for FilterBar compatibility
  const filters = useMemo(() => ({ contractor, site, subRegion, excludedReporters, workRelatedOnly }), [contractor, site, subRegion, excludedReporters, workRelatedOnly])

  // State context value - will cause re-renders when state changes
  const stateValue = useMemo(() => ({
    period,
    contractor,
    site,
    subRegion,
    excludedReporters,
    workRelatedOnly,
    filters
  }), [period, contractor, site, subRegion, excludedReporters, workRelatedOnly, filters])

  // Actions context value - stable reference, won't cause re-renders
  const actionsValue = useMemo(() => ({
    setPeriod,
    setContractor,
    setSite,
    setSubRegion,
    setExcludedReporters,
    setWorkRelatedOnly,
    setFilter,
    clearFilters
  }), [setContractor, setSite, setSubRegion, setExcludedReporters, setFilter, clearFilters])

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

export default FilterStateContext
