/**
 * Dashboard Pre-computation Cache
 *
 * WeakMap-based multi-entry cache that allows BOTH work-related toggle variants
 * to coexist simultaneously. Toggling between variants is an O(1) cache hit.
 *
 * Structure: Map<string, WeakMap<Array, result>>
 * - Outer Map: keyed by cache key (e.g. 'dashboardAggregates')
 * - Inner WeakMap: keyed by the array reference → computed result
 *   WeakMap ensures old array entries are GC'd automatically when arrays lose refs.
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
 * Get a cached pre-computed result for a specific array reference.
 * @param {string} key - One of CACHE_KEYS
 * @param {Array} ref - The array reference to look up
 * @returns {any | undefined} The cached result, or undefined on miss
 */
export const getCached = (key, ref) => {
  const weakMap = cache.get(key)
  if (!weakMap || !ref) return undefined
  return weakMap.get(ref)
}

/**
 * Store a pre-computed result for a specific array reference.
 * @param {string} key - One of CACHE_KEYS
 * @param {Array} ref - The array reference to key on
 * @param {any} result - The computed result to cache
 */
export const setCached = (key, ref, result) => {
  let weakMap = cache.get(key)
  if (!weakMap) {
    weakMap = new WeakMap()
    cache.set(key, weakMap)
  }
  weakMap.set(ref, result)
}

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
