import { createContext, useContext, useMemo, useEffect, useRef } from 'react'
import { useDataState } from './DataContext'
import { useDate } from './DateContext'
import { useFilterState } from './FilterContext'
import { useDebouncedFilter } from '../hooks/useDebouncedFilter'
import { PROACTIVE_TYPES } from '../utils/constants'
import { getCached, CACHE_KEYS } from '../utils/dashboardCache'
import { filterHierarchical, buildFilterFingerprint } from '../utils/filterCache'

// Exported so TabFreezeGate can provide frozen values to hidden tabs
export const FilteredDataContext = createContext(null)

const PROACTIVE_SET = new Set(PROACTIVE_TYPES)

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
 * Hierarchical filter cache: When removing a filter, uses cached intermediate results
 * instead of re-scanning all incidents from scratch.
 *
 * Provides:
 * - filteredIncidents: incidents filtered by contractor, site, subRegion, and period
 * - heatmapIncidents: incidents filtered by contractor, site, subRegion (no period, no proactive types)
 * - uniqueContractors: dropdown options for contractor filter
 * - siteOptions: dropdown options for site filter (scoped to selected contractor)
 * - filterConfig: complete filter configuration array for FilterBar
 * - filterFingerprint: deterministic string representing current filter state (for per-tab caching)
 */
export const FilteredDataProvider = ({ children }) => {
  const { incidents, siteClassifications, hasSubregionAssignments, assignedSubRegions } = useDataState()
  const { getPeriodRange } = useDate()
  const { period, customDateRange, filters, workRelatedOnly } = useFilterState()

  // Debounce multi-select filter arrays (100ms) so rapid checkbox clicks
  // don't trigger 5 consecutive O(n) filter passes
  // `filters` is already memoized in FilterContext (line 83) — stable reference
  const { debounced: debouncedFilters } = useDebouncedFilter(filters, 100)

  // Pre-cache the "no filter" result — stable reference that only changes when incidents change.
  // When all filters are cleared, we return this instantly (zero iteration).
  // Single O(n) pass computes base + workRelated variants together.
  const defaults = useMemo(() => {
    // Check pre-computation cache (populated during import phase)
    const cached = getCached(CACHE_KEYS.FILTERED_DEFAULTS, incidents)
    if (cached) return cached

    const heatmap = []
    const wrFiltered = []
    const wrHeatmap = []
    const sites = new Set()
    for (let idx = 0; idx < incidents.length; idx++) {
      const i = incidents[idx]
      if (i.site) sites.add(i.site)
      const isProactive = PROACTIVE_SET.has(i.type)
      if (!isProactive) heatmap.push(i)
      if (i.workRelated !== false) {
        wrFiltered.push(i)
        if (!isProactive) wrHeatmap.push(i)
      }
    }
    return {
      baseFiltered: incidents,
      baseHeatmap: heatmap,
      workRelatedFiltered: wrFiltered,
      workRelatedHeatmap: wrHeatmap,
      siteOptions: Array.from(sites).sort().map(s => ({ value: s, label: s }))
    }
  }, [incidents])

  // Fast boolean check: are ALL filters in their default (cleared) state?
  // Uses debouncedFilters (not immediate) so it stays in sync with the main computation.
  // This prevents a double-render cascade: without this, isAllCleared flips immediately
  // on filter change while debouncedFilters lags behind, causing a wasted O(n) pass
  // with stale data followed by the real computation 100ms later — two full render cycles.
  // "Clear All" is still instant because useDebouncedFilter flushes immediately when all empty.
  const isAllCleared = useMemo(() => {
    const { contractor: c, site: s, subRegion: sr } = debouncedFilters
    return period === null && customDateRange === null &&
      c.length === 0 && s.length === 0 && sr.length === 0
  }, [debouncedFilters, period, customDateRange])

  // Hierarchical filtered computation with LRU cache at each filter level.
  // Uses debounced filter values so rapid multi-select clicks batch into one computation.
  // When removing a filter, walks UP to find deepest cached intermediate and filters DOWN.
  const { baseFiltered, baseHeatmap, siteOptions } = useMemo(() => {
    // Fast path: all filters cleared → return pre-cached defaults (zero iteration)
    if (isAllCleared) return defaults

    // Compute date range
    let dateFrom = null
    let dateTo = null
    let dateKey = null
    if (customDateRange !== null) {
      dateFrom = customDateRange.start
      dateTo = customDateRange.end
      dateKey = `${customDateRange.start}~${customDateRange.end}`
    } else if (period !== null) {
      const range = getPeriodRange(period)
      dateFrom = range.start
      dateTo = range.end
      dateKey = `p${period}`
    }

    return filterHierarchical(
      incidents,
      debouncedFilters,
      siteClassifications,
      dateFrom,
      dateTo,
      dateKey,
      PROACTIVE_SET
    )
  }, [incidents, debouncedFilters, siteClassifications, period, customDateRange, getPeriodRange, isAllCleared, defaults])

  // Pre-compute work-related variant — fast-path returns cached ref when all cleared
  const workRelatedFiltered = useMemo(() => {
    if (isAllCleared) return defaults.workRelatedFiltered
    return baseFiltered.filter(i => i.workRelated !== false)
  }, [baseFiltered, isAllCleared, defaults])

  // Swap reference based on toggle — no recomputation
  const filteredIncidents = workRelatedOnly ? workRelatedFiltered : baseFiltered

  // Pre-compute work-related heatmap variant — fast-path returns cached ref when all cleared
  const workRelatedHeatmap = useMemo(() => {
    if (isAllCleared) return defaults.workRelatedHeatmap
    return baseHeatmap.filter(i => i.workRelated !== false)
  }, [baseHeatmap, isAllCleared, defaults])

  // Swap reference based on toggle — no recomputation
  const heatmapIncidents = workRelatedOnly ? workRelatedHeatmap : baseHeatmap

  // Deterministic fingerprint of the current filter state — enables per-tab KPI caching
  // without comparing array references. Identical filter combos produce identical fingerprints.
  const filterFingerprint = useMemo(
    () => buildFilterFingerprint(debouncedFilters, period, customDateRange, workRelatedOnly),
    [debouncedFilters, period, customDateRange, workRelatedOnly]
  )

  // Background-warm aggregation caches for the INACTIVE variant
  // Debounced by 500ms to avoid warming overhead on rapid filter changes
  const warmingRef = useRef([])
  const warmDebounceRef = useRef(null)
  useEffect(() => {
    // Cancel pending debounce
    if (warmDebounceRef.current) clearTimeout(warmDebounceRef.current)
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

    // Debounce: wait 500ms after last filter change before warming
    warmDebounceRef.current = setTimeout(() => {
      // Dynamic import to avoid adding heavy transitive deps to critical render path
      import('../utils/cacheWarmer').then(({ warmCaches, warmDashboardMainThreadCaches }) => {
        // Warm Web Worker caches (heavy analytics)
        const workerIds = warmCaches(inactiveFiltered, inactiveHeatmap, period)
        // Warm main-thread dashboard caches (aggregates, topHazards, heatmap, subregion)
        const mainIds = warmDashboardMainThreadCaches(inactiveFiltered, inactiveHeatmap, siteClassifications)
        warmingRef.current = [...workerIds, ...mainIds]
      })
    }, 500)

    return () => {
      if (warmDebounceRef.current) clearTimeout(warmDebounceRef.current)
      warmingRef.current.forEach(id => {
        if (typeof cancelIdleCallback === 'function') {
          cancelIdleCallback(id)
        } else {
          clearTimeout(id)
        }
      })
      warmingRef.current = []
    }
  }, [baseFiltered, workRelatedFiltered, baseHeatmap, workRelatedHeatmap, workRelatedOnly, period, siteClassifications])

  // Unique contractors from all incidents (not filtered)
  const uniqueContractors = useMemo(() => {
    // Check pre-computation cache (populated during import phase)
    const cached = getCached(CACHE_KEYS.UNIQUE_CONTRACTORS, incidents)
    if (cached) return cached

    const contractors = [...new Set(incidents.map(i => i.contractor).filter(Boolean))]
    return contractors.sort().map(c => ({ value: c, label: c }))
  }, [incidents])

  // Filter configuration array for FilterBar
  const filterConfig = useMemo(() => {
    const config = [
      {
        key: 'contractor',
        type: 'multiSelect',
        label: 'Contractor',
        placeholder: 'All Contractors',
        options: uniqueContractors
      },
      {
        key: 'site',
        type: 'multiSelect',
        label: 'Site',
        placeholder: 'All Sites',
        options: siteOptions
      }
    ]

    if (hasSubregionAssignments) {
      config.push({
        key: 'subRegion',
        type: 'multiSelect',
        label: 'Sub-Region',
        placeholder: 'All Sub-Regions',
        options: assignedSubRegions
      })
    }

    return config
  }, [uniqueContractors, siteOptions, hasSubregionAssignments, assignedSubRegions])

  const value = useMemo(() => {
    return {
      filteredIncidents,
      heatmapIncidents,
      uniqueContractors,
      siteOptions,
      filterConfig,
      filterFingerprint,
      isAllCleared,
    }
  }, [filteredIncidents, heatmapIncidents, uniqueContractors, siteOptions, filterConfig, filterFingerprint, isAllCleared])

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
