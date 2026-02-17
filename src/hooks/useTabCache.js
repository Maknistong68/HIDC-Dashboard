import { useRef, useContext } from 'react'
import { TabVisibilityContext } from './useDeferredMemo'

const MAX_ENTRIES_PER_KEY = 5

/**
 * Per-tab LRU caches, keyed by computation name.
 * Structure: Map<string, Map<fingerprint, result>>
 *
 * Each computation (e.g. 'dashboardAggregates') maintains its own LRU(5) cache
 * of fingerprint → result pairs. This means toggling between 5 filter states
 * returns instant cached results with zero recomputation.
 *
 * Cleared on data import/delete via clearAllTabCaches().
 */
const tabCaches = new Map()

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
 * useTabCache - Like useDeferredMemo, but with fingerprint-keyed LRU caching.
 *
 * When the filterFingerprint matches a previously cached result:
 *   → Returns instantly (no factory call, no recomputation)
 *
 * When a hidden tab becomes visible with an unchanged fingerprint:
 *   → Returns cached result (no recomputation)
 *
 * When fingerprint is new:
 *   → Calls factory, caches result, returns it
 *
 * Hidden tabs never recompute — they return the last known result.
 *
 * @param {string} cacheKey - Unique name for this computation (e.g. 'dashboardAggregates')
 * @param {Function} factory - Computation function (same as useMemo)
 * @param {string} fingerprint - Deterministic filter fingerprint from FilteredDataContext
 * @param {Array} deps - Dependency array (same as useMemo, used for non-filter dep changes)
 * @returns {any} The computed or cached result
 */
export function useTabCache(cacheKey, factory, fingerprint, deps) {
  const isVisible = useContext(TabVisibilityContext)
  const cachedRef = useRef(undefined)
  const prevFingerprintRef = useRef(undefined)
  const prevDepsRef = useRef(undefined)

  // Build a composite key that includes both fingerprint and non-filter deps
  // This handles cases where e.g. cutoffDates change without filter changes
  const depsKey = deps.length > 0
    ? deps.map(d => {
        if (d === null || d === undefined) return 'null'
        if (Array.isArray(d)) return `arr${d.length}`
        if (typeof d === 'object') return JSON.stringify(d)
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

  // Fingerprint changed — check LRU cache for a previous result
  const cache = getCache(cacheKey)
  const lruHit = lruGet(cache, compositeFingerprint)
  if (lruHit !== undefined) {
    // Cache hit! Return instantly without calling factory
    if (import.meta.env.DEV) console.debug(`[useTabCache] HIT ${cacheKey}`)
    cachedRef.current = lruHit
    prevFingerprintRef.current = compositeFingerprint
    prevDepsRef.current = deps
    return lruHit
  }

  // Cache miss — only compute if visible (hidden tabs defer)
  if (!isVisible && cachedRef.current !== undefined) {
    // Hidden tab with stale data — return stale value
    return cachedRef.current
  }

  // Compute new result
  const result = factory()
  cachedRef.current = result
  prevFingerprintRef.current = compositeFingerprint
  prevDepsRef.current = deps

  // Store in LRU cache
  lruSet(cache, compositeFingerprint, result)

  return result
}

/**
 * Clear all per-tab KPI caches.
 * Called on data import/delete via clearDataCaches().
 */
export function clearAllTabCaches() {
  tabCaches.clear()
}
