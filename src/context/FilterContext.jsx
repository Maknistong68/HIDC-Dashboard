import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import { getExcludedReporters, setExcludedReporters as persistExcludedReporters } from '../utils/indexedDBStorage'

const FilterContext = createContext(null)

/**
 * FilterProvider - Shared filter state across Dashboard, DataQuality, and SafetyOutlook
 *
 * Provides synchronized filter state that persists when navigating between tabs:
 * - period: Time period filter (null = All, 0.25 = 1W, 1 = 1M, 3 = 3M, 6 = 6M, 12 = 1Y)
 * - contractor: Selected contractor filter ('' = All)
 * - site: Selected site filter ('' = All)
 */
export const FilterProvider = ({ children }) => {
  const [period, setPeriod] = useState(null)        // null = All
  const [contractor, setContractorState] = useState('')
  const [site, setSiteState] = useState('')
  const [excludedReporters, setExcludedReportersState] = useState([])

  // Load excluded reporters from IndexedDB on mount
  useEffect(() => {
    getExcludedReporters().then(reporters => {
      setExcludedReportersState(reporters)
    })
  }, [])

  // Contractor change resets site (parent-child relationship)
  const setContractor = useCallback((value) => {
    setContractorState(value)
    setSiteState('')
  }, [])

  // Direct site setter
  const setSite = useCallback((value) => {
    setSiteState(value)
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
    } else if (key === 'excludedReporters') {
      setExcludedReporters(value)
    }
  }, [setContractor, setExcludedReporters])

  // Clear all filters (excludedReporters persists - it's a setting, not a temporary filter)
  const clearFilters = useCallback(() => {
    setPeriod(null)
    setContractorState('')
    setSiteState('')
  }, [])

  // Combined filters object for FilterBar compatibility
  const filters = useMemo(() => ({ contractor, site, excludedReporters }), [contractor, site, excludedReporters])

  const value = useMemo(() => ({
    period,
    setPeriod,
    contractor,
    site,
    excludedReporters,
    setContractor,
    setSite,
    setExcludedReporters,
    setFilter,
    clearFilters,
    filters
  }), [period, contractor, site, excludedReporters, setContractor, setSite, setExcludedReporters, setFilter, clearFilters, filters])

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  )
}

/**
 * useFilter - Hook to access shared filter state
 * @returns {Object} Filter state and setters
 */
export const useFilter = () => {
  const context = useContext(FilterContext)
  if (!context) {
    throw new Error('useFilter must be used within a FilterProvider')
  }
  return context
}

export default FilterContext
