import { useState, useEffect, useRef, startTransition } from 'react'

// Default fingerprints for "all filters cleared" state
const DEFAULT_FINGERPRINTS = new Set([
  'c=|s=|sr=|d=|wr=1',
  'c=|s=|sr=|d=|wr=0',
])

// ─── Hash helper (copied from analyticsWorker.js) ───────────────────
function hashIncidents(incidents) {
  if (!incidents || incidents.length === 0) return 'empty'
  const sampleSize = Math.max(10, Math.min(50, Math.ceil(incidents.length / 500)))
  const step = Math.max(1, Math.floor(incidents.length / sampleSize))
  const parts = []
  for (let i = 0; i < incidents.length && parts.length < sampleSize; i += step) {
    const r = incidents[i]
    parts.push(`${r?.id || ''}|${r?.location || ''}|${r?.type || ''}|${r?.date || ''}`)
  }
  if (incidents.length > 1) {
    const last = incidents[incidents.length - 1]
    parts.push(`${last?.id || ''}|${last?.location || ''}|${last?.type || ''}`)
  }
  return `${incidents.length}:${parts.join(':')}`
}

// ─── Global LRU result cache ─────────────────────────────────────────
// Prevents flash of fallback when tabs unmount/remount (route-based rendering).
// Keyed by taskName|dataHash|paramsKey, holds up to 30 entries.
const MAX_RESULT_CACHE = 30
const resultCache = new Map()

/**
 * Permanent defaults cache — stores "all filters cleared" worker results outside the LRU.
 * These are NEVER evicted by filter cycling, so clearing filters is always instant.
 * Keyed by taskName|fingerprint|paramsKey
 */
const defaultResultCache = new Map()

function resultCacheGet(key) {
  if (!resultCache.has(key)) return undefined
  const val = resultCache.get(key)
  resultCache.delete(key)
  resultCache.set(key, val)
  return val
}

function resultCacheSet(key, value) {
  if (resultCache.has(key)) resultCache.delete(key)
  resultCache.set(key, value)
  if (resultCache.size > MAX_RESULT_CACHE) {
    const oldest = resultCache.keys().next().value
    resultCache.delete(oldest)
  }
}

/**
 * Clear the global worker result cache.
 * Called on data import/delete via clearAllCaches()/clearDataCaches().
 */
export function clearWorkerResultCache() {
  resultCache.clear()
  defaultResultCache.clear()
}

/**
 * Seed a result into the permanent defaults cache.
 * Called during import pre-computation to ensure first render is instant.
 *
 * @param {string} taskName - Worker task name
 * @param {string} fingerprint - Filter fingerprint (e.g. 'c=|s=|sr=|d=|wr=1')
 * @param {string} paramsKey - JSON-stringified params (or '')
 * @param {any} result - The pre-computed result to seed
 */
export function seedDefaultWorkerResult(taskName, fingerprint, paramsKey, result) {
  const key = `${taskName}|fp:${fingerprint}|${paramsKey}`
  defaultResultCache.set(key, result)
}

/**
 * Singleton analytics worker instance.
 * Created lazily on first use, shared across all components.
 */
let workerInstance = null
let requestIdCounter = 0
const pendingCallbacks = new Map() // id → { resolve, reject }

function getWorker() {
  if (!workerInstance) {
    workerInstance = new Worker(
      new URL('../workers/analyticsWorker.js', import.meta.url),
      { type: 'module' }
    )
    workerInstance.onmessage = (e) => {
      const { id, success, result, error, cacheMiss } = e.data
      const cb = pendingCallbacks.get(id)
      if (cb) {
        if (cacheMiss) {
          // Worker lost the cached data — clear our hash so next send includes full data
          if (import.meta.env.DEV) console.warn('[useWorkerTask] DATA_CACHE_MISS for task', e.data.task || 'unknown', 'hash:', e.data.dataHash)
          pendingCallbacks.delete(id)
          sentDataHashes.delete(e.data.dataHash)
          cb.reject(new Error('DATA_CACHE_MISS'))
        } else {
          pendingCallbacks.delete(id)
          if (success) {
            cb.resolve(result)
          } else {
            if (import.meta.env.DEV) console.warn('[useWorkerTask] task error:', e.data.task, error)
            cb.reject(new Error(error))
          }
        }
      }
    }
    workerInstance.onerror = (err) => {
      // Reject all pending on fatal worker error and clear dedup state
      sentDataHashes.clear()
      for (const [id, cb] of pendingCallbacks) {
        cb.reject(err)
        pendingCallbacks.delete(id)
      }
    }
  }
  return workerInstance
}

// ─── Layer 4: Data dedup — track which incident hashes the worker already has ──
const sentDataHashes = new Set()

/**
 * Send a task to the worker and return a promise for the result.
 * Uses data dedup: if the worker already has the incidents (same hash),
 * send only the hash (~100 bytes) instead of the full array (~30MB).
 *
 * @param {string} task - Task name (matches TASKS keys in analyticsWorker.js)
 * @param {Array} incidents - Incidents data to process
 * @param {Object|null} params - Additional params for the task
 * @param {string} [fingerprint] - Optional filter fingerprint for cache keying
 * @returns {{ promise: Promise, id: number }}
 */
function postTask(task, incidents, params, fingerprint) {
  const id = ++requestIdCounter
  const worker = getWorker()

  const promise = new Promise((resolve, reject) => {
    pendingCallbacks.set(id, { resolve, reject })
  })

  const dataHash = hashIncidents(incidents)
  const msg = { id, task, dataHash, params }

  // Include fingerprint if provided so worker can use it for cache keying
  if (fingerprint) msg.fingerprint = fingerprint

  if (sentDataHashes.has(dataHash)) {
    // Worker already has this data — send lightweight message
    worker.postMessage(msg)
  } else {
    // First time — send full data + hash
    sentDataHashes.add(dataHash)
    msg.incidents = incidents
    worker.postMessage(msg)
  }
  return { promise, id }
}

/**
 * useWorkerTask - Stale-while-revalidate hook for offloading computation to a Web Worker.
 *
 * 1. Sends the computation to the worker (non-blocking)
 * 2. Returns the **previous result** immediately (no blank flash)
 * 3. Updates to the new result when the worker finishes
 * 4. Tracks `isPending` for optional loading indicators
 * 5. Auto-cancels stale requests (only the latest request ID wins)
 *
 * @param {string} taskName - Worker task name
 * @param {Array} incidents - Incidents array
 * @param {Object|null} params - Extra params for the task
 * @param {Array} deps - Dependency array (triggers re-computation when changed)
 * @param {any} fallback - Initial fallback value before first result
 * @param {string} [fingerprint] - Optional filter fingerprint for permanent cache keying
 * @returns {{ result: any, isPending: boolean }}
 */
export function useWorkerTask(taskName, incidents, params, deps, fallback = null, fingerprint = undefined) {
  const [result, setResult] = useState(() => {
    // Check global cache for instant init (prevents fallback flash on remount)
    if (!incidents || incidents.length === 0) return fallback
    const paramsKey = params ? JSON.stringify(params) : ''

    // Check permanent defaults cache first (fingerprint-based)
    if (fingerprint && DEFAULT_FINGERPRINTS.has(fingerprint)) {
      const fpKey = `${taskName}|fp:${fingerprint}|${paramsKey}`
      const defaultHit = defaultResultCache.get(fpKey)
      if (defaultHit !== undefined) return defaultHit
    }

    // Fall back to hash-based LRU cache
    const hash = hashIncidents(incidents)
    const cacheKey = `${taskName}|${hash}|${paramsKey}`
    const cached = resultCacheGet(cacheKey)
    return cached !== undefined ? cached : fallback
  })
  const [isPending, setIsPending] = useState(() => {
    if (!incidents || incidents.length === 0) return false
    const paramsKey = params ? JSON.stringify(params) : ''

    // Check permanent defaults cache first
    if (fingerprint && DEFAULT_FINGERPRINTS.has(fingerprint)) {
      const fpKey = `${taskName}|fp:${fingerprint}|${paramsKey}`
      if (defaultResultCache.has(fpKey)) return false
    }

    const hash = hashIncidents(incidents)
    const cacheKey = `${taskName}|${hash}|${paramsKey}`
    return !resultCache.has(cacheKey)
  })
  const latestIdRef = useRef(0)
  const mountedRef = useRef(true)
  const prevKeyRef = useRef(null)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    // Don't send empty arrays to worker - return fallback immediately
    if (!incidents || incidents.length === 0) {
      prevKeyRef.current = null
      setResult(fallback)
      setIsPending(false)
      return
    }

    const hash = hashIncidents(incidents)
    const paramsKey = params ? JSON.stringify(params) : ''
    const fullKey = `${hash}|${paramsKey}`

    // Skip postMessage if incidents hash AND params are unchanged
    if (fullKey === prevKeyRef.current) {
      setIsPending(false)
      return
    }
    prevKeyRef.current = fullKey

    // Check permanent defaults cache first (fingerprint-based, never evicted)
    if (fingerprint && DEFAULT_FINGERPRINTS.has(fingerprint)) {
      const fpKey = `${taskName}|fp:${fingerprint}|${paramsKey}`
      const defaultHit = defaultResultCache.get(fpKey)
      if (defaultHit !== undefined) {
        startTransition(() => { setResult(defaultHit) })
        setIsPending(false)
        return
      }
    }

    // Check global hash-based result cache before posting to worker
    const cacheKey = `${taskName}|${fullKey}`
    const cached = resultCacheGet(cacheKey)
    if (cached !== undefined) {
      startTransition(() => { setResult(cached) })
      setIsPending(false)
      return
    }

    setIsPending(true)
    const { promise, id } = postTask(taskName, incidents, params, fingerprint)
    latestIdRef.current = id

    promise
      .then((workerResult) => {
        // Store in global hash-based cache
        resultCacheSet(cacheKey, workerResult)

        // Also pin in defaults cache if this is a default fingerprint
        if (fingerprint && DEFAULT_FINGERPRINTS.has(fingerprint)) {
          const fpKey = `${taskName}|fp:${fingerprint}|${paramsKey}`
          defaultResultCache.set(fpKey, workerResult)
        }

        // Only apply if this is still the latest request and component is mounted
        if (latestIdRef.current === id && mountedRef.current) {
          startTransition(() => { setResult(workerResult) })
          setIsPending(false)
        }
      })
      .catch((err) => {
        // On error, keep stale result, just clear pending
        if (import.meta.env.DEV) console.warn(`[useWorkerTask] ${taskName} failed:`, err.message)
        if (latestIdRef.current === id && mountedRef.current) {
          setIsPending(false)
        }
      })
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps

  return { result, isPending }
}

/**
 * Send a one-shot warm-up task to the worker (fire and forget).
 * Used by cacheWarmer to pre-populate the worker's internal cache.
 *
 * @param {string} taskName
 * @param {Array} incidents
 * @param {Object|null} params
 * @returns {Promise}
 */
export function warmWorkerCache(taskName, incidents, params) {
  if (!incidents || incidents.length === 0) return Promise.resolve(null)
  const { promise } = postTask(taskName, incidents, params)
  promise.catch(() => {}) // Suppress unhandled rejection
  return promise
}
