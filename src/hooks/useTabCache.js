import { useRef } from 'react'

const MAX_ENTRIES_PER_KEY = 10

// Default fingerprints for "all filters cleared" state (workRelatedOnly true/false)
const DEFAULT_FINGERPRINTS = new Set([
  'c=|s=|sr=|d=|wr=1',
  'c=|s=|sr=|d=|wr=0',
])

/**
 * Cached JSON.stringify via WeakMap — avoids re-stringifying the same object
 * reference on every render. O(1) for repeated calls with the same reference.
 *
 * This is critical for deps that include large worker results (misclassificationData,
 * textAnalysisMetrics, etc.) — without caching, JSON.stringify runs on every render
 * even when the object hasn't changed.
 */
const jsonCache = new WeakMap()
function cachedStringify(obj) {
  if (jsonCache.has(obj)) return jsonCache.get(obj)
  const s = JSON.stringify(obj)
  jsonCache.set(obj, s)
  return s
}

/**
 * Per-tab LRU caches, keyed by computation name.
 * Structure: Map<string, Map<fingerprint, result>>
 *
 * Each computation (e.g. 'dashboardAggregates') maintains its own LRU(10) cache
 * of fingerprint → result pairs. This means toggling between 10 filter states
 * returns instant cached results with zero recomputation.
 *
 * Cleared on data import/delete via clearAllTabCaches().
 */
const tabCaches = new Map()

/**
 * Permanent defaults cache — stores "all filters cleared" results outside the LRU.
 * These are NEVER evicted by filter cycling, so clearing filters is always instant.
 * Structure: Map<compositeFingerprint, result>
 */
const defaultsCache = new Map()

function isDefaultFingerprint(compositeFingerprint) {
  // compositeFingerprint format: "c=|s=|sr=|d=|wr=X||depsKey"
  // Extract the filter fingerprint (before the || separator)
  const filterPart = compositeFingerprint.split('||')[0]
  return DEFAULT_FINGERPRINTS.has(filterPart)
}

function getCache(key) {
  if (!tabCaches.has(key)) tabCaches.set(key, new Map())
  return tabCaches.get(key)
}

function lruGet(cacheMap, fingerprint) {
  if (!cacheMap.has(fingerprint)) return undefined
  const value = cacheMap.get(fingerprint)
  // Promote to most recent
  cacheMap.delete(fingerprint)
  cacheMap.set(fingerprint, value)
  return value
}

function lruSet(cacheMap, fingerprint, value) {
  if (cacheMap.has(fingerprint)) cacheMap.delete(fingerprint)
  cacheMap.set(fingerprint, value)
  if (cacheMap.size > MAX_ENTRIES_PER_KEY) {
    const oldest = cacheMap.keys().next().value
    cacheMap.delete(oldest)
  }
}

/**
 * useTabCache - Fingerprint-keyed LRU memo hook.
 *
 * When the filterFingerprint matches a previously cached result:
 *   → Returns instantly (no factory call, no recomputation)
 *
 * When fingerprint is new:
 *   → Calls factory, caches result, returns it
 *
 * Default (all-cleared) fingerprints are pinned in a permanent cache
 * outside the LRU, so clearing filters is always instant regardless
 * of how many filter combinations have been cycled through.
 *
 * @param {string} cacheKey - Unique name for this computation (e.g. 'dashboardAggregates')
 * @param {Function} factory - Computation function (same as useMemo)
 * @param {string} fingerprint - Deterministic filter fingerprint from FilteredDataContext
 * @param {Array} deps - Dependency array (same as useMemo, used for non-filter dep changes)
 * @returns {any} The computed or cached result
 */
export function useTabCache(cacheKey, factory, fingerprint, deps) {
  const cachedRef = useRef(undefined)
  const prevFingerprintRef = useRef(undefined)

  // Build a composite key that includes both fingerprint and non-filter deps
  // This handles cases where e.g. cutoffDates change without filter changes
  // Uses cachedStringify for objects to avoid re-serializing large worker results
  // (misclassificationData, etc.) on every render — O(1) for same object references
  const depsKey = deps.length > 0
    ? deps.map(d => {
        if (d === null || d === undefined) return 'null'
        if (Array.isArray(d)) return `arr${d.length}`
        if (typeof d === 'object') return cachedStringify(d)
        return String(d)
      }).join('|')
    : ''
  const compositeFingerprint = `${fingerprint}||${depsKey}`

  // Check if fingerprint+deps have changed
  const fingerprintChanged = compositeFingerprint !== prevFingerprintRef.current

  if (!fingerprintChanged) {
    // Same fingerprint — return current cached value (no work needed)
    return cachedRef.current
  }

  // Fingerprint changed — check permanent defaults cache FIRST
  const defaultKey = `${cacheKey}|${compositeFingerprint}`
  const defaultHit = defaultsCache.get(defaultKey)
  if (defaultHit !== undefined) {
    cachedRef.current = defaultHit
    prevFingerprintRef.current = compositeFingerprint
    return defaultHit
  }

  // Then check LRU cache for a previous result
  const cache = getCache(cacheKey)
  const lruHit = lruGet(cache, compositeFingerprint)
  if (lruHit !== undefined) {
    cachedRef.current = lruHit
    prevFingerprintRef.current = compositeFingerprint
    return lruHit
  }

  // Compute new result
  const result = factory()
  cachedRef.current = result
  prevFingerprintRef.current = compositeFingerprint

  // Store in LRU cache
  lruSet(cache, compositeFingerprint, result)

  // Also pin in defaults cache if this is a default fingerprint
  if (isDefaultFingerprint(compositeFingerprint)) {
    defaultsCache.set(defaultKey, result)
  }

  return result
}

/**
 * Seed a result into the permanent defaults cache.
 * Called during import pre-computation to ensure first render is instant.
 *
 * @param {string} cacheKey - Computation name (e.g. 'dashboardAggregates')
 * @param {string} fingerprint - Filter fingerprint (e.g. 'c=|s=|sr=|d=|wr=1')
 * @param {string} depsKey - Serialized deps key
 * @param {any} result - The pre-computed result to seed
 */
export function seedDefaultCache(cacheKey, fingerprint, depsKey, result) {
  const compositeFingerprint = `${fingerprint}||${depsKey}`
  const defaultKey = `${cacheKey}|${compositeFingerprint}`
  defaultsCache.set(defaultKey, result)
}

/**
 * Clear all per-tab KPI caches.
 * Called on data import/delete via clearDataCaches().
 */
export function clearAllTabCaches() {
  tabCaches.clear()
  defaultsCache.clear()
}
