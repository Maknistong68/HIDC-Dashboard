import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'

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

  // Contractor change resets site (parent-child relationship)
  const setContractor = useCallback((value) => {
    setContractorState(value)
    setSiteState('')
  }, [])

  // Direct site setter
  const setSite = useCallback((value) => {
    setSiteState(value)
  }, [])

  // Generic setter for FilterBar compatibility
  const setFilter = useCallback((key, value) => {
    if (key === 'contractor') {
      setContractor(value)
    } else if (key === 'site') {
      setSiteState(value)
    }
  }, [setContractor])

  // Clear all filters
  const clearFilters = useCallback(() => {
    setPeriod(null)
    setContractorState('')
    setSiteState('')
  }, [])

  // Combined filters object for FilterBar compatibility
  const filters = useMemo(() => ({ contractor, site }), [contractor, site])

  const value = useMemo(() => ({
    period,
    setPeriod,
    contractor,
    site,
    setContractor,
    setSite,
    setFilter,
    clearFilters,
    filters
  }), [period, contractor, site, setContractor, setSite, setFilter, clearFilters, filters])

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
