/**
 * Cache Warmer - Background pre-computation for inactive work-related toggle variant
 *
 * When the user has workRelatedOnly=true, this warms the Web Worker's internal cache
 * for the all-incidents variant (and vice versa). When they toggle, the worker returns
 * cached results instantly.
 *
 * Uses requestIdleCallback to schedule warm-up tasks without blocking the UI.
 */

import { warmWorkerCache } from '../hooks/useWorkerTask'

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
