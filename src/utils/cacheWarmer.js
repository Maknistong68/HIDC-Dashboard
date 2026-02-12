/**
 * Cache Warmer - Background pre-computation for inactive work-related toggle variant
 *
 * When the user has workRelatedOnly=true, this warms caches for the all-incidents variant
 * (and vice versa). When they toggle, every getCachedAggregation call is a cache hit.
 *
 * Uses requestIdleCallback (with setTimeout fallback for Safari) to avoid blocking the UI.
 * Each warming task runs in its own idle callback for maximum responsiveness.
 */

import { getCachedAggregation } from './memoizedCalculations'
import { aggregateContributingFactors } from './rootCauseEngine'
import { getHazardTrendingByPeriod } from './insightsCalculations'
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
} from './dataQualityCalculations'
import { detectMisspellings } from './spellChecker'

const scheduleIdle = typeof requestIdleCallback === 'function'
  ? (cb) => requestIdleCallback(cb, { timeout: 5000 })
  : (cb) => setTimeout(cb, 1)

/**
 * Warm aggregation caches for the inactive dataset variant.
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
    getCachedAggregation('dashboard-factors-all', inactiveHeatmap, (data) =>
      aggregateContributingFactors(data)
    )
  }))

  // Priority 2: Outlook contributing factors (VERY HIGH cost)
  ids.push(scheduleIdle(() => {
    getCachedAggregation('outlook-factors-all', inactiveFiltered, (data) =>
      aggregateContributingFactors(data)
    )
  }))

  // Priority 3: Hazard trending (HIGH cost)
  ids.push(scheduleIdle(() => {
    getCachedAggregation(`outlook-hazardTrending-${period}`, inactiveFiltered, (data) =>
      getHazardTrendingByPeriod(data, period)
    )
  }))

  // Priority 4: Misclassification analysis (VERY HIGH cost)
  ids.push(scheduleIdle(() => {
    getCachedAggregation('dq-misclassification', inactiveFiltered, (data) =>
      getMisclassificationAnalysis(data)
    )
  }))

  // Priority 5: Text analysis (HIGH cost)
  ids.push(scheduleIdle(() => {
    getCachedAggregation('dq-textAnalysis', inactiveFiltered, (data) => ({
      description: getDescriptionMetrics(data),
      duplicates: getDuplicateDescriptions(data),
      spellingIssues: detectMisspellings(data),
      foulWords: detectFoulWords(data),
      vagueHazards: detectVagueHazards(data),
    }))
  }))

  // Priority 6: Categorization (MEDIUM cost)
  ids.push(scheduleIdle(() => {
    getCachedAggregation('dq-categorization', inactiveFiltered, (data) => ({
      autoClassification: getAutoClassificationSummary(data),
      otherHazards: getOtherHazardAnalysis(data),
    }))
  }))

  // Priority 7: Trend & flagged records (MEDIUM cost)
  ids.push(scheduleIdle(() => {
    getCachedAggregation('dq-trendFlagged', inactiveFiltered, (data) => ({
      unclassifiableRecords: getUnclassifiableRecords(data),
      flaggedRecords: getFlaggedRecords(data),
    }))
  }))

  return ids
}
