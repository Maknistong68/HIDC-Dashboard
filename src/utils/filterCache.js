/**
 * Hierarchical Filter Cache
 *
 * Caches filtered incident arrays at each filter hierarchy level:
 *   Level 0: All incidents (= defaults, no filter applied)
 *   Level 1: Filtered by contractor only
 *   Level 2: Filtered by contractor + site
 *   Level 3: Filtered by contractor + site + subRegion
 *   Level 4: Filtered by contractor + site + subRegion + date range (= final result)
 *
 * When a filter is removed, we walk UP to find the deepest cached level
 * and filter DOWN from there — avoiding a full O(n) re-scan of all incidents.
 *
 * LRU cache with 20 entries max (~800KB worst case: 20 entries x 5K refs x 8 bytes).
 */

const MAX_ENTRIES = 15
const MAX_AGE_MS = 300_000 // 5 minutes

// LRU cache: Map preserves insertion order; oldest entries evicted first
let cache = new Map()

/**
 * Build a deterministic cache key for a given filter level.
 * @param {number} level - 0-4
 * @param {Object} filters - { contractor: [], site: [], subRegion: [] }
 * @param {string|null} dateKey - e.g. "2025-01~2026-01" or null
 * @returns {string}
 */
function buildKey(level, filters, dateKey) {
  const parts = [`L${level}`]
  if (level >= 1 && filters.contractor.length > 0) {
    parts.push(`c=${[...filters.contractor].sort().join(',')}`)
  }
  if (level >= 2 && filters.site.length > 0) {
    parts.push(`s=${[...filters.site].sort().join(',')}`)
  }
  if (level >= 3 && filters.subRegion.length > 0) {
    parts.push(`sr=${[...filters.subRegion].sort().join(',')}`)
  }
  if (level >= 4 && dateKey) {
    parts.push(`d=${dateKey}`)
  }
  return parts.join('|')
}

/**
 * Build a deterministic fingerprint string for the current filter state.
 * Used downstream by useTabCache to detect identical filter combinations
 * without comparing array references.
 *
 * @param {Object} filters - { contractor: [], site: [], subRegion: [] }
 * @param {string|null} period
 * @param {Object|null} customDateRange - { start, end }
 * @param {boolean} workRelatedOnly
 * @returns {string}
 */
export function buildFilterFingerprint(filters, period, customDateRange, workRelatedOnly) {
  const c = filters.contractor.length > 0 ? [...filters.contractor].sort().join(',') : ''
  const s = filters.site.length > 0 ? [...filters.site].sort().join(',') : ''
  const sr = filters.subRegion.length > 0 ? [...filters.subRegion].sort().join(',') : ''
  const d = customDateRange
    ? `${customDateRange.start}~${customDateRange.end}`
    : period !== null ? `p${period}` : ''
  const wr = workRelatedOnly ? '1' : '0'
  return `c=${c}|s=${s}|sr=${sr}|d=${d}|wr=${wr}`
}

/**
 * Determine the current filter level based on active filters.
 * @param {Object} filters - { contractor: [], site: [], subRegion: [] }
 * @param {boolean} hasDate - whether a date filter is active
 * @returns {number} 0-4
 */
function getFilterLevel(filters, hasDate) {
  if (hasDate) return 4
  if (filters.subRegion.length > 0) return 3
  if (filters.site.length > 0) return 2
  if (filters.contractor.length > 0) return 1
  return 0
}

/**
 * Store a result in the LRU cache, evicting oldest entry if at capacity.
 */
function cacheSet(key, value) {
  // Move to end (most recently used) by deleting and re-adding
  if (cache.has(key)) cache.delete(key)
  cache.set(key, { ...value, _ts: Date.now() })
  // Evict stale entries (> 5 min) — Map preserves insertion order
  const cutoff = Date.now() - MAX_AGE_MS
  for (const [k, v] of cache) {
    if (v._ts < cutoff) cache.delete(k)
    else break
  }
  // Also enforce count cap
  if (cache.size > MAX_ENTRIES) {
    const oldest = cache.keys().next().value
    cache.delete(oldest)
  }
}

/**
 * Get a cached result, promoting it to most-recently-used.
 * @returns {Array|undefined}
 */
function cacheGet(key) {
  if (!cache.has(key)) return undefined
  const value = cache.get(key)
  // Evict if stale
  if (value._ts < Date.now() - MAX_AGE_MS) {
    cache.delete(key)
    return undefined
  }
  // Promote to most recent
  cache.delete(key)
  value._ts = Date.now()
  cache.set(key, value)
  return value
}

/**
 * Perform hierarchical filtering with cache lookups at each level.
 *
 * Walks UP from the target level to find the deepest cached intermediate result,
 * then filters DOWN from that point — skipping already-applied filter stages.
 *
 * @param {Array} allIncidents - Full unfiltered incidents array
 * @param {Object} debouncedFilters - { contractor: [], site: [], subRegion: [] }
 * @param {Object} siteClassifications - site → subregion mapping
 * @param {string|null} dateFrom - ISO date string or null
 * @param {string|null} dateTo - ISO date string or null
 * @param {string|null} dateKey - deterministic string for date range (for cache key)
 * @param {Set} proactiveSet - Set of proactive type strings
 * @returns {{ baseFiltered: Array, baseHeatmap: Array, siteOptions: Array<{value,label}>, cacheLevel: string }}
 */
export function filterHierarchical(
  allIncidents,
  debouncedFilters,
  siteClassifications,
  dateFrom,
  dateTo,
  dateKey,
  proactiveSet
) {
  const hasContractor = debouncedFilters.contractor.length > 0
  const hasSite = debouncedFilters.site.length > 0
  const hasSubRegion = debouncedFilters.subRegion.length > 0
  const hasDate = dateFrom !== null

  const targetLevel = getFilterLevel(debouncedFilters, hasDate)

  // Check for exact match at target level first
  const targetKey = buildKey(targetLevel, debouncedFilters, dateKey)
  const exactHit = cacheGet(targetKey)
  if (exactHit) {
    if (import.meta.env.DEV) console.debug(`[FilterCache] HIT L${targetLevel}`, targetKey)
    return { ...exactHit, cacheLevel: `HIT L${targetLevel}` }
  }

  // Walk UP to find the deepest cached intermediate result
  let startLevel = 0
  let startData = allIncidents
  for (let level = targetLevel - 1; level >= 1; level--) {
    const key = buildKey(level, debouncedFilters, dateKey)
    const hit = cacheGet(key)
    if (hit) {
      startLevel = level
      // Use the cached filtered array as the starting point
      // We need the combined filtered+heatmap source, so use baseFiltered
      // (heatmap is always a subset, recalculated from filtered)
      startData = hit.baseFilteredPreDate || hit.baseFiltered
      if (import.meta.env.DEV) console.debug(`[FilterCache] PARTIAL HIT L${level}, filtering L${level}→L${targetLevel}`)
      break
    }
  }

  // Build filter sets
  const contractorSet = hasContractor ? new Set(debouncedFilters.contractor) : null
  const siteSet = hasSite ? new Set(debouncedFilters.site) : null
  const subRegionSet = hasSubRegion ? new Set(debouncedFilters.subRegion) : null

  // Determine if we should build L1 intermediate during this loop
  const l1Key = (startLevel === 0 && targetLevel > 1 && hasContractor)
    ? buildKey(1, debouncedFilters, dateKey)
    : null
  const buildL1 = l1Key && !cache.has(l1Key)

  // Filter from startData down to target level
  const filtered = []
  const heatmap = []
  const filteredPreDate = [] // L3 result (spatial only, before date filter)
  const contractorSitesSet = new Set()
  const l1Filtered = buildL1 ? [] : null
  const l1Heatmap = buildL1 ? [] : null

  for (let idx = 0; idx < startData.length; idx++) {
    const i = startData[idx]

    // Collect sites scoped to selected contractors (for siteOptions dropdown)
    if (i.site && (!hasContractor || contractorSet.has(i.contractor))) {
      contractorSitesSet.add(i.site)
    }

    // Apply contractor filter (skip if already applied at startLevel)
    if (startLevel < 1 && hasContractor && !contractorSet.has(i.contractor)) continue

    // After contractor filter passes — collect L1 intermediate
    if (buildL1 && startLevel < 1) {
      l1Filtered.push(i)
      if (!proactiveSet.has(i.type)) l1Heatmap.push(i)
    }

    // Apply site filter (skip if already applied at startLevel)
    if (startLevel < 2 && hasSite && !siteSet.has(i.site)) continue
    // Apply subRegion filter (skip if already applied at startLevel)
    if (startLevel < 3 && hasSubRegion && !subRegionSet.has(siteClassifications[i.site])) continue

    // Heatmap: no period filter, no proactive types
    if (!proactiveSet.has(i.type)) {
      heatmap.push(i)
    }

    // Track the pre-date array for caching L1-L3 intermediates
    if (hasDate) {
      filteredPreDate.push(i)
    }

    // Apply date filter
    if (hasDate) {
      if (i.date < dateFrom || i.date > dateTo) continue
    }

    filtered.push(i)
  }

  const sites = Array.from(contractorSitesSet).sort().map(s => ({ value: s, label: s }))

  const result = {
    baseFiltered: filtered,
    baseHeatmap: heatmap,
    siteOptions: sites,
  }

  // Cache at target level
  cacheSet(targetKey, { ...result, baseFilteredPreDate: hasDate ? filteredPreDate : filtered })

  // Cache L1 intermediate (built during the main loop — no second scan needed)
  if (buildL1) {
    const l1Sites = Array.from(contractorSitesSet).sort().map(s => ({ value: s, label: s }))
    cacheSet(l1Key, {
      baseFiltered: l1Filtered,
      baseFilteredPreDate: l1Filtered,
      baseHeatmap: l1Heatmap,
      siteOptions: l1Sites,
    })
  }

  if (import.meta.env.DEV) console.debug(`[FilterCache] MISS L${targetLevel}, computed from L${startLevel}`, targetKey)

  return { ...result, cacheLevel: `MISS L${targetLevel} from L${startLevel}` }
}

/**
 * Clear the hierarchical filter cache.
 * Called on data import/delete via clearDataCaches().
 */
export function clearHierarchicalFilterCache() {
  cache.clear()
}
