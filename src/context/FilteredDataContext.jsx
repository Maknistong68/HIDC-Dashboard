import React, { createContext, useContext, useMemo } from 'react'
import { useData } from './DataContext'
import { useDate } from './DateContext'
import { useFilter } from './FilterContext'
import { PROACTIVE_TYPES } from '../utils/constants'
import { getCachedFilteredIncidents } from '../utils/memoizedCalculations'

const FilteredDataContext = createContext(null)

/**
 * FilteredDataProvider - Centralizes filtered data computation shared across all 3 pages.
 *
 * All 3 pages (Dashboard, DataQuality, SafetyOutlook) independently computed the EXACT same
 * filteredIncidents, uniqueContractors, siteOptions, and filterConfig (~12 duplicate useMemo hooks).
 * This context computes once and shares with all pages.
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
  const { period, contractor, site, subRegion } = useFilter()

  // Filtered incidents based on contractor, site, subRegion, and period
  // Uses module-level cache for cross-render deduplication
  const filteredIncidents = useMemo(() => {
    const filters = { contractor, site, subRegion, period }

    return getCachedFilteredIncidents(incidents, filters, (data, f) => {
      if (f.period === null) {
        return data.filter(i => {
          if (f.contractor && i.contractor !== f.contractor) return false
          if (f.site && i.site !== f.site) return false
          if (f.subRegion && siteClassifications[i.site] !== f.subRegion) return false
          return true
        })
      }

      const { start: dateFrom, end: dateTo } = getPeriodRange(f.period)

      return data.filter(i => {
        if (f.contractor && i.contractor !== f.contractor) return false
        if (f.site && i.site !== f.site) return false
        if (f.subRegion && siteClassifications[i.site] !== f.subRegion) return false
        if (i.date < dateFrom) return false
        if (i.date > dateTo) return false
        return true
      })
    })
  }, [incidents, contractor, site, subRegion, siteClassifications, period, getPeriodRange])

  // Heatmap uses ALL incidents (not filtered by period)
  // Excludes proactive types, applies contractor/site/subRegion filters
  const heatmapIncidents = useMemo(() => {
    return incidents.filter(i => {
      if (PROACTIVE_TYPES.includes(i.type)) return false
      if (contractor && i.contractor !== contractor) return false
      if (site && i.site !== site) return false
      if (subRegion && siteClassifications[i.site] !== subRegion) return false
      return true
    })
  }, [incidents, contractor, site, subRegion, siteClassifications])

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
