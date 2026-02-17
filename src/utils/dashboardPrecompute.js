/**
 * Dashboard Pre-computation Orchestrator
 *
 * Called after batchReloadIncidents() completes during import.
 * Runs each computation sequentially, stores results in dashboardCache,
 * and yields to the UI between steps via setTimeout(0).
 *
 * Pre-computes BOTH work-related and all-incidents variants so that
 * toggling workRelatedOnly is instant (O(1) cache hit) from the start.
 */

import { setCached, CACHE_KEYS, setPrecomputeStatus } from './dashboardCache'
import {
  computeFilteredDefaults,
  computeUniqueContractors,
  computeDashboardAggregates,
  computeTopHazards,
  computeHazardsHeatmap,
  computeSubregionContribution,
} from './dashboardComputations'
import { getOverdueCutoffDate } from './dateUtils'
import { plotHazardsOnMatrix, calculatePyramidRanking } from './riskMatrix'

/**
 * Yield to the UI thread so progress bar / animations stay responsive
 */
const yieldToUI = () => new Promise(resolve => setTimeout(resolve, 0))

/**
 * Pre-compute all dashboard data and store in cache.
 *
 * @param {Array} incidents - The full incidents array (same ref stored in React state)
 * @param {Object} siteClassifications - Site-to-subregion mapping
 * @param {Function} onProgress - Callback: (stepMessage: string, percent: number) => void
 */
export async function precomputeDashboardData(incidents, siteClassifications, onProgress) {
  if (!incidents || incidents.length === 0) return

  setPrecomputeStatus('running')

  try {
    // Step 1: Filtered defaults (base, heatmap, work-related splits)
    onProgress('Computing filtered data...', 5)
    const defaults = computeFilteredDefaults(incidents)
    setCached(CACHE_KEYS.FILTERED_DEFAULTS, incidents, defaults)
    await yieldToUI()

    // Step 2: Unique contractors
    onProgress('Building contractor list...', 12)
    const contractors = computeUniqueContractors(incidents)
    setCached(CACHE_KEYS.UNIQUE_CONTRACTORS, incidents, contractors)
    await yieldToUI()

    const wrFiltered = defaults.workRelatedFiltered
    const wrHeatmap = defaults.workRelatedHeatmap
    const baseFiltered = defaults.baseFiltered // = incidents
    const baseHeatmap = defaults.baseHeatmap
    const overdue30 = getOverdueCutoffDate(30)

    // Step 3: Dashboard aggregates — both variants batched
    onProgress('Calculating KPIs...', 20)
    const wrAggregates = computeDashboardAggregates(wrFiltered, overdue30)
    const baseAggregates = computeDashboardAggregates(baseFiltered, overdue30)
    setCached(CACHE_KEYS.DASHBOARD_AGGREGATES, wrFiltered, wrAggregates)
    setCached(CACHE_KEYS.DASHBOARD_AGGREGATES, baseFiltered, baseAggregates)
    await yieldToUI()

    // Step 4: Top hazards — both variants batched
    onProgress('Ranking hazards...', 40)
    const wrTopHazards = computeTopHazards(wrFiltered)
    const baseTopHazards = computeTopHazards(baseFiltered)
    setCached(CACHE_KEYS.TOP_HAZARDS, wrFiltered, wrTopHazards)
    setCached(CACHE_KEYS.TOP_HAZARDS, baseFiltered, baseTopHazards)
    await yieldToUI()

    // Step 5: Hazards heatmap — both variants batched
    onProgress('Building heatmap...', 60)
    const wrHeatmapResult = computeHazardsHeatmap(wrHeatmap)
    const baseHeatmapResult = computeHazardsHeatmap(baseHeatmap)
    setCached(CACHE_KEYS.HAZARDS_HEATMAP, wrHeatmap, wrHeatmapResult)
    setCached(CACHE_KEYS.HAZARDS_HEATMAP, baseHeatmap, baseHeatmapResult)
    await yieldToUI()

    // Step 6: Subregion contribution — both variants batched
    onProgress('Computing subregions...', 80)
    const wrSubregion = computeSubregionContribution(wrFiltered, siteClassifications)
    const baseSubregion = computeSubregionContribution(baseFiltered, siteClassifications)
    setCached(CACHE_KEYS.SUBREGION_CONTRIBUTION, wrFiltered, wrSubregion)
    setCached(CACHE_KEYS.SUBREGION_CONTRIBUTION, baseFiltered, baseSubregion)
    await yieldToUI()

    onProgress('Dashboard ready!', 100)
  } finally {
    setPrecomputeStatus('ready')
  }
}

/**
 * Full calculation gate: blocks until ALL computations are complete.
 *
 * Phase 1 (0-55%):  Main-thread dashboard precompute (filtered defaults, aggregates, etc.)
 * Phase 2 (55-80%): Await all 7 worker tasks via Promise.allSettled
 * Phase 3 (80-100%): Risk matrix + pyramid ranking (depends on hazardTrending from Phase 2)
 *
 * @param {Array} incidents - Full incidents array from IndexedDB
 * @param {Object} siteClassifications - Site-to-subregion mapping
 * @param {Function} onProgress - Callback: (stepMessage: string, percent: number) => void
 */
export async function precomputeAllData(incidents, siteClassifications, onProgress) {
  if (!incidents || incidents.length === 0) return

  setPrecomputeStatus('running')

  try {
    // ═══════════════════════════════════════════════════════════════════
    // PHASE 1: Main-thread dashboard precompute (0-55%)
    // ═══════════════════════════════════════════════════════════════════

    onProgress('Computing filtered data...', 3)
    const defaults = computeFilteredDefaults(incidents)
    setCached(CACHE_KEYS.FILTERED_DEFAULTS, incidents, defaults)
    await yieldToUI()

    onProgress('Building contractor list...', 7)
    const contractors = computeUniqueContractors(incidents)
    setCached(CACHE_KEYS.UNIQUE_CONTRACTORS, incidents, contractors)
    await yieldToUI()

    const wrFiltered = defaults.workRelatedFiltered
    const wrHeatmap = defaults.workRelatedHeatmap
    const baseFiltered = defaults.baseFiltered
    const baseHeatmap = defaults.baseHeatmap
    const overdue30 = getOverdueCutoffDate(30)

    onProgress('Calculating KPIs...', 12)
    const wrAggregates = computeDashboardAggregates(wrFiltered, overdue30)
    const baseAggregates = computeDashboardAggregates(baseFiltered, overdue30)
    setCached(CACHE_KEYS.DASHBOARD_AGGREGATES, wrFiltered, wrAggregates)
    setCached(CACHE_KEYS.DASHBOARD_AGGREGATES, baseFiltered, baseAggregates)
    await yieldToUI()

    onProgress('Ranking hazards...', 25)
    const wrTopHazards = computeTopHazards(wrFiltered)
    const baseTopHazards = computeTopHazards(baseFiltered)
    setCached(CACHE_KEYS.TOP_HAZARDS, wrFiltered, wrTopHazards)
    setCached(CACHE_KEYS.TOP_HAZARDS, baseFiltered, baseTopHazards)
    await yieldToUI()

    onProgress('Building heatmap...', 36)
    const wrHeatmapResult = computeHazardsHeatmap(wrHeatmap)
    const baseHeatmapResult = computeHazardsHeatmap(baseHeatmap)
    setCached(CACHE_KEYS.HAZARDS_HEATMAP, wrHeatmap, wrHeatmapResult)
    setCached(CACHE_KEYS.HAZARDS_HEATMAP, baseHeatmap, baseHeatmapResult)
    await yieldToUI()

    onProgress('Computing subregions...', 47)
    const wrSubregion = computeSubregionContribution(wrFiltered, siteClassifications)
    const baseSubregion = computeSubregionContribution(baseFiltered, siteClassifications)
    setCached(CACHE_KEYS.SUBREGION_CONTRIBUTION, wrFiltered, wrSubregion)
    setCached(CACHE_KEYS.SUBREGION_CONTRIBUTION, baseFiltered, baseSubregion)
    await yieldToUI()

    // ═══════════════════════════════════════════════════════════════════
    // PHASE 2: Worker tasks (55-80%)
    // ═══════════════════════════════════════════════════════════════════

    onProgress('Running analytics engine...', 55)

    // Dynamic import to avoid adding cacheWarmer to the precompute bundle
    const { warmInitialDashboardCaches } = await import('./cacheWarmer')
    const workerPromises = warmInitialDashboardCaches(incidents)

    if (workerPromises.length > 0) {
      // Track per-task completion for granular progress
      let completed = 0
      const total = workerPromises.length
      const tracked = workerPromises.map(p =>
        p.then(result => {
          completed++
          const workerPercent = 55 + Math.round((completed / total) * 25)
          onProgress(`Analytics ${completed}/${total} complete...`, workerPercent)
          return result
        }).catch(() => {
          completed++
          const workerPercent = 55 + Math.round((completed / total) * 25)
          onProgress(`Analytics ${completed}/${total} complete...`, workerPercent)
          return null
        })
      )

      await Promise.allSettled(tracked)
    }

    await yieldToUI()

    // ═══════════════════════════════════════════════════════════════════
    // PHASE 3: Risk matrix + pyramid ranking (80-100%)
    // ═══════════════════════════════════════════════════════════════════

    onProgress('Computing risk matrix...', 82)

    // Re-request hazardTrending result (instant cache hit since worker already computed it)
    let sortedHazards = []
    try {
      const { warmWorkerCache } = await import('../hooks/useWorkerTask')
      sortedHazards = await warmWorkerCache('hazardTrending', wrFiltered, { period: null }) || []
    } catch {
      // Worker may have failed - proceed without hazard data
    }
    await yieldToUI()

    if (sortedHazards.length > 0) {
      onProgress('Plotting risk matrix...', 87)
      const matrixData = plotHazardsOnMatrix(wrFiltered, sortedHazards)
      setCached(CACHE_KEYS.RISK_MATRIX, wrFiltered, matrixData)
      await yieldToUI()

      onProgress('Computing pyramid ranking...', 93)
      const pyramidRanking = calculatePyramidRanking(wrFiltered, sortedHazards, matrixData)
      setCached(CACHE_KEYS.PYRAMID_RANKING, wrFiltered, pyramidRanking)
      await yieldToUI()
    }

    onProgress('All computations complete!', 100)
  } finally {
    setPrecomputeStatus('ready')
  }
}
