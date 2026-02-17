/**
 * Cache Warmer - Background pre-computation for inactive work-related toggle variant
 *
 * When the user has workRelatedOnly=true, this warms the Web Worker's internal cache
 * for the all-incidents variant (and vice versa). When they toggle, the worker returns
 * cached results instantly.
 *
 * Also warms main-thread dashboard caches (aggregates, topHazards, heatmap, subregion)
 * so that toggling workRelatedOnly is instant even when data changes.
 *
 * Uses requestIdleCallback to schedule warm-up tasks without blocking the UI.
 */

import { warmWorkerCache } from '../hooks/useWorkerTask'
import {
  computeDashboardAggregates,
  computeTopHazards,
  computeHazardsHeatmap,
  computeSubregionContribution,
} from './dashboardComputations'
import { getOverdueCutoffDate } from './dateUtils'
import { setCached, CACHE_KEYS } from './dashboardCache'

const scheduleIdle = typeof requestIdleCallback === 'function'
  ? (cb) => requestIdleCallback(cb, { timeout: 5000 })
  : (cb) => setTimeout(cb, 1)

/**
 * Warm the Web Worker's internal cache for the inactive dataset variant.
 *
 * @param {Array} inactiveFiltered - Filtered incidents for the inactive toggle state
 * @param {Array} inactiveHeatmap - Heatmap incidents for the inactive toggle state
 * @param {string|number|null} period - Current period value (for hazard trending key)
 * @returns {Array<number>} Array of callback/timeout IDs for cancellation
 */
export function warmCaches(inactiveFiltered, inactiveHeatmap, period) {
  if (!inactiveFiltered || inactiveFiltered.length === 0) return []

  const ids = []

  // Priority 1: Dashboard contributing factors (VERY HIGH cost)
  ids.push(scheduleIdle(() => {
    warmWorkerCache('aggregateFactors', inactiveHeatmap, null)
  }))

  // Priority 2: Outlook contributing factors (VERY HIGH cost)
  ids.push(scheduleIdle(() => {
    warmWorkerCache('aggregateFactors', inactiveFiltered, null)
  }))

  // Priority 3: Hazard trending (HIGH cost)
  ids.push(scheduleIdle(() => {
    warmWorkerCache('hazardTrending', inactiveFiltered, { period })
  }))

  // Priority 4: Misclassification analysis (VERY HIGH cost)
  ids.push(scheduleIdle(() => {
    warmWorkerCache('misclassification', inactiveFiltered, null)
  }))

  // Priority 5: Text analysis (HIGH cost)
  ids.push(scheduleIdle(() => {
    warmWorkerCache('textAnalysis', inactiveFiltered, null)
  }))

  // Priority 6: Categorization (MEDIUM cost)
  ids.push(scheduleIdle(() => {
    warmWorkerCache('categorization', inactiveFiltered, null)
  }))

  // Priority 7: Trend & flagged records (MEDIUM cost)
  ids.push(scheduleIdle(() => {
    warmWorkerCache('trendFlagged', inactiveFiltered, null)
  }))

  return ids
}

/**
 * Warm all 7 worker caches immediately after batch import.
 *
 * Called from batchReloadIncidents() so that by the time the user clicks
 * "Go to Dashboard" (2-5s later), the worker cache is hot and charts
 * render instantly with no cold-start delay.
 *
 * Computes workRelated + heatmap subsets inline (same logic as
 * FilteredDataContext `defaults` useMemo) then fires all 7 tasks.
 *
 * @param {Array} records - All incident records from IndexedDB
 */
/**
 * Warm main-thread dashboard caches for the inactive toggle variant.
 * Each computation runs in a separate requestIdleCallback to avoid blocking UI.
 *
 * @param {Array} inactiveFiltered - Filtered incidents for the inactive toggle state
 * @param {Array} inactiveHeatmap - Heatmap incidents for the inactive toggle state
 * @param {Object} siteClassifications - Site-to-subregion mapping
 * @returns {Array<number>} Array of callback/timeout IDs for cancellation
 */
export function warmDashboardMainThreadCaches(inactiveFiltered, inactiveHeatmap, siteClassifications) {
  if (!inactiveFiltered || inactiveFiltered.length === 0) return []

  const ids = []

  ids.push(scheduleIdle(() => {
    const overdue30 = getOverdueCutoffDate(30)
    const result = computeDashboardAggregates(inactiveFiltered, overdue30)
    setCached(CACHE_KEYS.DASHBOARD_AGGREGATES, inactiveFiltered, result)
  }))

  ids.push(scheduleIdle(() => {
    const result = computeTopHazards(inactiveFiltered)
    setCached(CACHE_KEYS.TOP_HAZARDS, inactiveFiltered, result)
  }))

  ids.push(scheduleIdle(() => {
    const result = computeHazardsHeatmap(inactiveHeatmap)
    setCached(CACHE_KEYS.HAZARDS_HEATMAP, inactiveHeatmap, result)
  }))

  ids.push(scheduleIdle(() => {
    const result = computeSubregionContribution(inactiveFiltered, siteClassifications)
    setCached(CACHE_KEYS.SUBREGION_CONTRIBUTION, inactiveFiltered, result)
  }))

  return ids
}

export function warmInitialDashboardCaches(records) {
  if (!records || records.length === 0) return []

  const PROACTIVE_SET = new Set(['positive', 'leadership', 'emergency-drill'])

  // Compute the two default datasets (mirrors FilteredDataContext defaults)
  const wrFiltered = []
  const wrHeatmap = []
  for (let i = 0; i < records.length; i++) {
    const r = records[i]
    if (r.workRelated !== false) {
      wrFiltered.push(r)
      if (!PROACTIVE_SET.has(r.type)) wrHeatmap.push(r)
    }
  }

  // Use workRelated variants since workRelatedOnly defaults to true
  const filtered = wrFiltered
  const heatmap = wrHeatmap

  // Fire all 7 tasks immediately (no scheduleIdle - time-critical)
  // Return promises so callers can await completion
  return [
    warmWorkerCache('aggregateFactors', heatmap, null),     // Dashboard factors
    warmWorkerCache('aggregateFactors', filtered, null),     // Outlook factors
    warmWorkerCache('hazardTrending', filtered, { period: null }), // Default period
    warmWorkerCache('misclassification', filtered, null),
    warmWorkerCache('textAnalysis', filtered, null),
    warmWorkerCache('categorization', filtered, null),
    warmWorkerCache('trendFlagged', filtered, null),
  ]
}
