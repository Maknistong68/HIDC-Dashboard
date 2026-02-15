import { useState, useEffect, useRef } from 'react'

// ─── Hash helper (copied from analyticsWorker.js) ───────────────────
function hashIncidents(incidents) {
  if (!incidents || incidents.length === 0) return 'empty'
  const sampleSize = Math.min(10, incidents.length)
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
      const { id, success, result, error } = e.data
      const cb = pendingCallbacks.get(id)
      if (cb) {
        pendingCallbacks.delete(id)
        if (success) {
          cb.resolve(result)
        } else {
          cb.reject(new Error(error))
        }
      }
    }
    workerInstance.onerror = (err) => {
      // Reject all pending on fatal worker error
      for (const [id, cb] of pendingCallbacks) {
        cb.reject(err)
        pendingCallbacks.delete(id)
      }
    }
  }
  return workerInstance
}

/**
 * Send a task to the worker and return a promise for the result.
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

  worker.postMessage({ id, task, incidents, params })
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
  const prevHashRef = useRef(null)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    // Don't send empty arrays to worker - return fallback immediately
    if (!incidents || incidents.length === 0) {
      prevHashRef.current = null
      setResult(fallback)
      setIsPending(false)
      return
    }

    // Skip postMessage if incidents hash is unchanged (avoids expensive structured clone)
    const hash = hashIncidents(incidents)
    if (hash === prevHashRef.current) {
      setIsPending(false)
      return
    }
    prevHashRef.current = hash

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
      .catch(() => {
        // On error, keep stale result, just clear pending
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
  if (!incidents || incidents.length === 0) return
  const { promise } = postTask(taskName, incidents, params)
  // Fire and forget - we don't need the result
  promise.catch(() => {})
}
