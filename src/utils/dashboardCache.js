/**
 * Dashboard Pre-computation Cache
 *
 * Module-level Map storing pre-computed dashboard results.
 * Used to skip expensive useMemo/useDeferredMemo computations on initial mount
 * when data has been pre-computed during the import phase.
 *
 * Each entry stores { incidents: <array ref>, result: <computed> }
 * so consumers can validate by reference equality (cached.incidents === incidents).
 */

const cache = new Map()

export const CACHE_KEYS = {
  FILTERED_DEFAULTS: 'filteredDefaults',
  UNIQUE_CONTRACTORS: 'uniqueContractors',
  DASHBOARD_AGGREGATES: 'dashboardAggregates',
  TOP_HAZARDS: 'topHazards',
  HAZARDS_HEATMAP: 'hazardsHeatmap',
  SUBREGION_CONTRIBUTION: 'subregionContribution',
}

/**
 * Get a cached pre-computed result
 * @param {string} key - One of CACHE_KEYS
 * @returns {{ incidents: Array, result: any } | undefined}
 */
export const getCached = (key) => cache.get(key)

/**
 * Store a pre-computed result
 * @param {string} key - One of CACHE_KEYS
 * @param {{ incidents: Array, result: any }} value
 */
export const setCached = (key, value) => cache.set(key, value)

/**
 * Clear all dashboard pre-computation caches
 * Called from clearDataCaches() and clearAllCaches() in memoizedCalculations.js
 */
export const clearDashboardCache = () => cache.clear()

// ─── Precompute status tracking ───────────────────────────────────────

let precomputeStatus = 'idle' // 'idle' | 'running' | 'ready'
let resolveWaiters = []

/**
 * Get current precompute status
 * @returns {'idle' | 'running' | 'ready'}
 */
export const getPrecomputeStatus = () => precomputeStatus

/**
 * Set precompute status. When set to 'ready', resolves all pending waiters.
 * @param {'idle' | 'running' | 'ready'} status
 */
export const setPrecomputeStatus = (status) => {
  precomputeStatus = status
  if (status === 'ready') {
    const waiters = resolveWaiters
    resolveWaiters = []
    waiters.forEach((resolve) => resolve())
  }
}

/**
 * Returns a Promise that resolves when precompute status becomes 'ready'.
 * If already ready or idle, resolves immediately.
 */
export const waitForPrecompute = () => {
  if (precomputeStatus !== 'running') return Promise.resolve()
  return new Promise((resolve) => {
    resolveWaiters.push(resolve)
  })
}
