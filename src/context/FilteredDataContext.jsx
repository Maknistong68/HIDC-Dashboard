import React, { createContext, useContext, useMemo, useEffect, useRef } from 'react'
import { useData } from './DataContext'
import { useDate } from './DateContext'
import { useFilter } from './FilterContext'
import { PROACTIVE_TYPES } from '../utils/constants'

const FilteredDataContext = createContext(null)

/**
 * FilteredDataProvider - Centralizes filtered data computation shared across all 3 pages.
 *
 * All 3 pages (Dashboard, DataQuality, SafetyOutlook) independently computed the EXACT same
 * filteredIncidents, uniqueContractors, siteOptions, and filterConfig (~12 duplicate useMemo hooks).
 * This context computes once and shares with all pages.
 *
 * Dual-dataset pattern: Both work-related and all-incidents arrays are pre-computed so
 * toggling workRelatedOnly is an instant reference swap with zero recomputation.
 *
 * Provides:
 * - filteredIncidents: incidents filtered by contractor, site, subRegion, and period
 * - heatmapIncidents: incidents filtered by contractor, site, subRegion (no period, no proactive types)
 * - uniqueContractors: dropdown options for contractor filter
 * - siteOptions: dropdown options for site filter (scoped to selected contractor)
 * - filterConfig: complete filter configuration array for FilterBar
 */
export const FilteredDataProvider = ({ children }) => {
  const { incidents, siteClassifications, hasSubregionAssignments, assignedSubRegions } = useData()
  const { getPeriodRange } = useDate()
  const { period, contractor, site, subRegion, workRelatedOnly } = useFilter()

  // Base filtered set: all filters EXCEPT workRelated
  // This does NOT recompute when workRelatedOnly toggles
  const baseFiltered = useMemo(() => {
    if (period === null) {
      return incidents.filter(i => {
        if (contractor && i.contractor !== contractor) return false
        if (site && i.site !== site) return false
        if (subRegion && siteClassifications[i.site] !== subRegion) return false
        return true
      })
    }

    const { start: dateFrom, end: dateTo } = getPeriodRange(period)

    return incidents.filter(i => {
      if (contractor && i.contractor !== contractor) return false
      if (site && i.site !== site) return false
      if (subRegion && siteClassifications[i.site] !== subRegion) return false
      if (i.date < dateFrom) return false
      if (i.date > dateTo) return false
      return true
    })
  }, [incidents, contractor, site, subRegion, siteClassifications, period, getPeriodRange])

  // Pre-compute work-related variant (cheap .filter on already-filtered base)
  const workRelatedFiltered = useMemo(() => {
    return baseFiltered.filter(i => i.workRelated !== false)
  }, [baseFiltered])

  // Swap reference based on toggle — no recomputation
  const filteredIncidents = workRelatedOnly ? workRelatedFiltered : baseFiltered

  // Base heatmap: all filters EXCEPT workRelated and period, excludes proactive types
  const baseHeatmap = useMemo(() => {
    return incidents.filter(i => {
      if (PROACTIVE_TYPES.includes(i.type)) return false
      if (contractor && i.contractor !== contractor) return false
      if (site && i.site !== site) return false
      if (subRegion && siteClassifications[i.site] !== subRegion) return false
      return true
    })
  }, [incidents, contractor, site, subRegion, siteClassifications])

  // Pre-compute work-related heatmap variant
  const workRelatedHeatmap = useMemo(() => {
    return baseHeatmap.filter(i => i.workRelated !== false)
  }, [baseHeatmap])

  // Swap reference based on toggle — no recomputation
  const heatmapIncidents = workRelatedOnly ? workRelatedHeatmap : baseHeatmap

  // Background-warm aggregation caches for the INACTIVE variant
  const warmingRef = useRef([])
  useEffect(() => {
    // Cancel any in-flight warming tasks
    warmingRef.current.forEach(id => {
      if (typeof cancelIdleCallback === 'function') {
        cancelIdleCallback(id)
      } else {
        clearTimeout(id)
      }
    })
    warmingRef.current = []

    // Determine inactive arrays (the ones NOT currently displayed)
    const inactiveFiltered = workRelatedOnly ? baseFiltered : workRelatedFiltered
    const inactiveHeatmap = workRelatedOnly ? baseHeatmap : workRelatedHeatmap

    if (inactiveFiltered.length === 0) return

    // Dynamic import to avoid adding heavy transitive deps to critical render path
    import('../utils/cacheWarmer').then(({ warmCaches }) => {
      const ids = warmCaches(inactiveFiltered, inactiveHeatmap, period)
      warmingRef.current = ids
    })

    return () => {
      warmingRef.current.forEach(id => {
        if (typeof cancelIdleCallback === 'function') {
          cancelIdleCallback(id)
        } else {
          clearTimeout(id)
        }
      })
      warmingRef.current = []
    }
  }, [baseFiltered, workRelatedFiltered, baseHeatmap, workRelatedHeatmap, workRelatedOnly, period])

  // Unique contractors from all incidents (not filtered)
  const uniqueContractors = useMemo(() => {
    const contractors = [...new Set(incidents.map(i => i.contractor).filter(Boolean))]
    return contractors.sort().map(c => ({ value: c, label: c }))
  }, [incidents])

  // Sites filtered by selected contractor (parent-child relationship)
  const siteOptions = useMemo(() => {
    let relevantIncidents = incidents
    if (contractor) {
      relevantIncidents = incidents.filter(i => i.contractor === contractor)
    }
    const sites = [...new Set(relevantIncidents.map(i => i.site).filter(Boolean))]
    return sites.sort().map(s => ({ value: s, label: s }))
  }, [incidents, contractor])

  // Filter configuration array for FilterBar
  const filterConfig = useMemo(() => {
    const config = [
      {
        key: 'contractor',
        type: 'select',
        label: 'Contractor',
        placeholder: 'All Contractors',
        options: uniqueContractors
      },
      {
        key: 'site',
        type: 'select',
        label: 'Site',
        placeholder: 'All Sites',
        options: siteOptions
      }
    ]

    if (hasSubregionAssignments) {
      config.push({
        key: 'subRegion',
        type: 'select',
        label: 'Sub-Region',
        placeholder: 'All Sub-Regions',
        options: assignedSubRegions
      })
    }

    return config
  }, [uniqueContractors, siteOptions, hasSubregionAssignments, assignedSubRegions])

  const value = useMemo(() => ({
    filteredIncidents,
    heatmapIncidents,
    uniqueContractors,
    siteOptions,
    filterConfig,
  }), [filteredIncidents, heatmapIncidents, uniqueContractors, siteOptions, filterConfig])

  return (
    <FilteredDataContext.Provider value={value}>
      {children}
    </FilteredDataContext.Provider>
  )
}

/**
 * useFilteredData - Hook to access centralized filtered data
 */
export const useFilteredData = () => {
  const context = useContext(FilteredDataContext)
  if (!context) {
    throw new Error('useFilteredData must be used within a FilteredDataProvider')
  }
  return context
}
