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
 * Uses the tab priority scheduler for ordered background warming instead of raw
 * requestIdleCallback, so active tab work is never starved.
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
import { scheduler } from './tabPriorityScheduler'

/**
 * Warm the Web Worker's internal cache for the inactive dataset variant.
 * Uses scheduler to respect tab priority — active tab computations run first.
 *
 * @param {Array} inactiveFiltered - Filtered incidents for the inactive toggle state
 * @param {Array} inactiveHeatmap - Heatmap incidents for the inactive toggle state
 * @param {string|number|null} period - Current period value (for hazard trending key)
 * @returns {Array<number>} Array of callback/timeout IDs for cancellation
 */
export function warmCaches(inactiveFiltered, inactiveHeatmap, period) {
  if (!inactiveFiltered || inactiveFiltered.length === 0) return []

  const ids = []

  // Worker warm-ups scheduled as DEFERRED priority (background work)
  // The scheduler will use requestIdleCallback with appropriate timeouts
  // based on whether these tabs were recently visited

  // Dashboard contributing factors (VERY HIGH cost)
  ids.push(scheduler.schedule('dashboard', () => {
    warmWorkerCache('aggregateFactors', inactiveHeatmap, null)
  }))

  // Outlook contributing factors (VERY HIGH cost)
  ids.push(scheduler.schedule('outlook', () => {
    warmWorkerCache('aggregateFactors', inactiveFiltered, null)
  }))

  // Hazard trending (HIGH cost) — used by outlook
  ids.push(scheduler.schedule('outlook', () => {
    warmWorkerCache('hazardTrending', inactiveFiltered, { period })
  }))

  // Misclassification analysis (VERY HIGH cost) — used by dataQuality
  ids.push(scheduler.schedule('dataQuality', () => {
    warmWorkerCache('misclassification', inactiveFiltered, null)
  }))

  // Text analysis (HIGH cost) — used by dataQuality
  ids.push(scheduler.schedule('dataQuality', () => {
    warmWorkerCache('textAnalysis', inactiveFiltered, null)
  }))

  // Categorization (MEDIUM cost) — used by dataQuality
  ids.push(scheduler.schedule('dataQuality', () => {
    warmWorkerCache('categorization', inactiveFiltered, null)
  }))

  // Trend & flagged records (MEDIUM cost) — used by dataQuality
  ids.push(scheduler.schedule('dataQuality', () => {
    warmWorkerCache('trendFlagged', inactiveFiltered, null)
  }))

  return ids
}

/**
 * Warm main-thread dashboard caches for the inactive toggle variant.
 * Each computation runs via the tab priority scheduler to avoid blocking UI.
 *
 * @param {Array} inactiveFiltered - Filtered incidents for the inactive toggle state
 * @param {Array} inactiveHeatmap - Heatmap incidents for the inactive toggle state
 * @param {Object} siteClassifications - Site-to-subregion mapping
 * @returns {Array<number>} Array of callback/timeout IDs for cancellation
 */
export function warmDashboardMainThreadCaches(inactiveFiltered, inactiveHeatmap, siteClassifications) {
  if (!inactiveFiltered || inactiveFiltered.length === 0) return []

  const ids = []

  ids.push(scheduler.schedule('dashboard', () => {
    const overdue30 = getOverdueCutoffDate(30)
    const result = computeDashboardAggregates(inactiveFiltered, overdue30)
    setCached(CACHE_KEYS.DASHBOARD_AGGREGATES, inactiveFiltered, result)
  }))

  ids.push(scheduler.schedule('dashboard', () => {
    const result = computeTopHazards(inactiveFiltered)
    setCached(CACHE_KEYS.TOP_HAZARDS, inactiveFiltered, result)
  }))

  ids.push(scheduler.schedule('dashboard', () => {
    const result = computeHazardsHeatmap(inactiveHeatmap)
    setCached(CACHE_KEYS.HAZARDS_HEATMAP, inactiveHeatmap, result)
  }))

  ids.push(scheduler.schedule('dashboard', () => {
    const result = computeSubregionContribution(inactiveFiltered, siteClassifications)
    setCached(CACHE_KEYS.SUBREGION_CONTRIBUTION, inactiveFiltered, result)
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

  // Fire all 7 tasks immediately (no scheduler - time-critical)
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
