import { useState, useEffect, useRef, useContext } from 'react'
import { TabVisibilityContext } from './useDeferredMemo'

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
 * @returns {{ promise: Promise, id: number }}
 */
function postTask(task, incidents, params) {
  const id = ++requestIdCounter
  const worker = getWorker()

  const promise = new Promise((resolve, reject) => {
    pendingCallbacks.set(id, { resolve, reject })
  })

  const dataHash = hashIncidents(incidents)
  if (sentDataHashes.has(dataHash)) {
    // Worker already has this data — send lightweight message
    worker.postMessage({ id, task, dataHash, params })
  } else {
    // First time — send full data + hash
    sentDataHashes.add(dataHash)
    worker.postMessage({ id, task, incidents, dataHash, params })
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
 * @returns {{ result: any, isPending: boolean }}
 */
export function useWorkerTask(taskName, incidents, params, deps, fallback = null) {
  const [result, setResult] = useState(fallback)
  const [isPending, setIsPending] = useState(true)
  const latestIdRef = useRef(0)
  const mountedRef = useRef(true)
  const prevKeyRef = useRef(null) // tracks hash + params together
  const pendingArgsRef = useRef(null) // Layer 3: stash args when tab is hidden

  // Layer 3: visibility-aware gating — hidden tabs defer worker calls
  const isVisible = useContext(TabVisibilityContext)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  // Layer 3: When tab becomes visible, flush any stashed work
  useEffect(() => {
    if (isVisible && pendingArgsRef.current) {
      const { stashedIncidents, stashedParams, stashedKey } = pendingArgsRef.current
      pendingArgsRef.current = null

      // Check key hasn't already been processed
      if (stashedKey === prevKeyRef.current) {
        setIsPending(false)
        return
      }
      prevKeyRef.current = stashedKey

      setIsPending(true)
      const { promise, id } = postTask(taskName, stashedIncidents, stashedParams)
      latestIdRef.current = id

      promise
        .then((workerResult) => {
          if (latestIdRef.current === id && mountedRef.current) {
            setResult(workerResult)
            setIsPending(false)
          }
        })
        .catch((err) => {
          if (import.meta.env.DEV) console.warn(`[useWorkerTask] ${taskName} flush failed:`, err.message)
          if (latestIdRef.current === id && mountedRef.current) {
            setIsPending(false)
          }
        })
    }
  }, [isVisible, taskName]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Don't send empty arrays to worker - return fallback immediately
    if (!incidents || incidents.length === 0) {
      prevKeyRef.current = null
      pendingArgsRef.current = null
      setResult(fallback)
      setIsPending(false)
      return
    }

    const hash = hashIncidents(incidents)
    const paramsKey = params ? JSON.stringify(params) : ''
    const fullKey = `${hash}|${paramsKey}`

    // Layer 3: If tab is hidden, stash args instead of firing worker
    if (!isVisible) {
      pendingArgsRef.current = { stashedIncidents: incidents, stashedParams: params, stashedKey: fullKey }
      return
    }

    // Skip postMessage if incidents hash AND params are unchanged
    if (fullKey === prevKeyRef.current) {
      setIsPending(false)
      return
    }
    prevKeyRef.current = fullKey

    setIsPending(true)
    const { promise, id } = postTask(taskName, incidents, params)
    latestIdRef.current = id

    promise
      .then((workerResult) => {
        // Only apply if this is still the latest request and component is mounted
        if (latestIdRef.current === id && mountedRef.current) {
          setResult(workerResult)
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

    // Cleanup: mark stale (latestIdRef update handles it naturally)
    // No need to explicitly cancel - the ID check in .then() handles staleness
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
 */
export function warmWorkerCache(taskName, incidents, params) {
  if (!incidents || incidents.length === 0) return Promise.resolve(null)
  const { promise } = postTask(taskName, incidents, params)
  promise.catch(() => {}) // Suppress unhandled rejection
  return promise
}
