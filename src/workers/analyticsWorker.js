/**
 * Analytics Web Worker
 *
 * Runs heavy computation functions off the main thread.
 * Maintains an internal hash-based LRU cache to avoid redundant computation.
 *
 * Protocol:
 *   Main → Worker: { id, task, incidents, params }
 *   Worker → Main: { id, task, success, result } | { id, task, success: false, error }
 */

import { aggregateContributingFactors } from '../utils/rootCauseEngine'
import { getHazardTrendingByPeriod } from '../utils/insightsCalculations'
import {
  getMisclassificationAnalysis,
  getAutoClassificationSummary,
  getOtherHazardAnalysis,
  getDescriptionMetrics,
  getDuplicateDescriptions,
  detectFoulWords,
  detectVagueHazards,
  getUnclassifiableRecords,
  getFlaggedRecords,
} from '../utils/dataQualityCalculations'
import { detectMisspellings } from '../utils/spellChecker'

// ─── Internal LRU Cache ─────────────────────────────────────────────
const CACHE_MAX = 50
const cache = new Map()

function cacheGet(key) {
  if (!cache.has(key)) return undefined
  const val = cache.get(key)
  cache.delete(key)
  cache.set(key, val)
  return val
}

function cacheSet(key, value) {
  if (cache.has(key)) cache.delete(key)
  else if (cache.size >= CACHE_MAX) {
    const first = cache.keys().next().value
    cache.delete(first)
  }
  cache.set(key, value)
}

// ─── Hash helper (matches memoizedCalculations.js pattern) ──────────
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

// ─── Task Handlers ──────────────────────────────────────────────────

const TASKS = {
  aggregateFactors(incidents) {
    return aggregateContributingFactors(incidents)
  },

  hazardTrending(incidents) {
    return getHazardTrendingByPeriod(incidents)
  },

  misclassification(incidents) {
    return getMisclassificationAnalysis(incidents)
  },

  textAnalysis(incidents) {
    return {
      description: getDescriptionMetrics(incidents),
      duplicates: getDuplicateDescriptions(incidents),
      spellingIssues: detectMisspellings(incidents),
      foulWords: detectFoulWords(incidents),
      vagueHazards: detectVagueHazards(incidents),
    }
  },

  categorization(incidents) {
    return {
      autoClassification: getAutoClassificationSummary(incidents),
      otherHazards: getOtherHazardAnalysis(incidents),
    }
  },

  trendFlagged(incidents) {
    return {
      unclassifiableRecords: getUnclassifiableRecords(incidents),
      flaggedRecords: getFlaggedRecords(incidents),
    }
  },

}

// ─── Layer 4: Data dedup cache — store incident arrays by hash ──────
// Avoids re-cloning ~30MB when multiple tasks use the same data.
const DATA_CACHE_MAX = 5
const dataCache = new Map()

function dataCacheSet(hash, incidents) {
  if (dataCache.has(hash)) dataCache.delete(hash)
  else if (dataCache.size >= DATA_CACHE_MAX) {
    const first = dataCache.keys().next().value
    dataCache.delete(first)
  }
  dataCache.set(hash, incidents)
}

// ─── Message Handler ────────────────────────────────────────────────

self.onmessage = (e) => {
  const { id, task, incidents, dataHash, params } = e.data

  // Validate
  if (!TASKS[task]) {
    self.postMessage({ id, task, success: false, error: `Unknown task: ${task}` })
    return
  }

  // Resolve incidents: use provided data, or look up from data cache
  let resolvedIncidents = incidents
  if (!resolvedIncidents && dataHash) {
    resolvedIncidents = dataCache.get(dataHash)
    if (!resolvedIncidents) {
      // Cache miss — ask main thread to resend full data
      self.postMessage({ id, task, cacheMiss: true, dataHash })
      return
    }
  }

  // Store in data cache for future lightweight messages
  if (resolvedIncidents && dataHash) {
    dataCacheSet(dataHash, resolvedIncidents)
  }

  // Build result cache key
  const hash = dataHash || hashIncidents(resolvedIncidents)
  const paramsKey = params ? JSON.stringify(params) : ''
  const cacheKey = `${task}:${hash}:${paramsKey}`

  // Check result cache
  const cached = cacheGet(cacheKey)
  if (cached !== undefined) {
    self.postMessage({ id, task, success: true, result: cached })
    return
  }

  // Execute
  try {
    const result = TASKS[task](resolvedIncidents, params)
    cacheSet(cacheKey, result)
    self.postMessage({ id, task, success: true, result })
  } catch (err) {
    self.postMessage({ id, task, success: false, error: err.message || String(err) })
  }
}
