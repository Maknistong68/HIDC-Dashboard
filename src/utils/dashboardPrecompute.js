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

    // Step 3a: Dashboard aggregates — work-related variant (default toggle=ON)
    onProgress('Calculating KPIs (work-related)...', 20)
    const wrAggregates = computeDashboardAggregates(wrFiltered, overdue30)
    setCached(CACHE_KEYS.DASHBOARD_AGGREGATES, wrFiltered, wrAggregates)
    await yieldToUI()

    // Step 3b: Dashboard aggregates — all-incidents variant (toggle=OFF)
    onProgress('Calculating KPIs (all records)...', 30)
    const baseAggregates = computeDashboardAggregates(baseFiltered, overdue30)
    setCached(CACHE_KEYS.DASHBOARD_AGGREGATES, baseFiltered, baseAggregates)
    await yieldToUI()

    // Step 4a: Top hazards — work-related variant
    onProgress('Ranking hazards (work-related)...', 40)
    const wrTopHazards = computeTopHazards(wrFiltered)
    setCached(CACHE_KEYS.TOP_HAZARDS, wrFiltered, wrTopHazards)
    await yieldToUI()

    // Step 4b: Top hazards — all-incidents variant
    onProgress('Ranking hazards (all records)...', 50)
    const baseTopHazards = computeTopHazards(baseFiltered)
    setCached(CACHE_KEYS.TOP_HAZARDS, baseFiltered, baseTopHazards)
    await yieldToUI()

    // Step 5a: Hazards heatmap — work-related variant
    onProgress('Building heatmap (work-related)...', 60)
    const wrHeatmapResult = computeHazardsHeatmap(wrHeatmap)
    setCached(CACHE_KEYS.HAZARDS_HEATMAP, wrHeatmap, wrHeatmapResult)
    await yieldToUI()

    // Step 5b: Hazards heatmap — all-incidents variant
    onProgress('Building heatmap (all records)...', 70)
    const baseHeatmapResult = computeHazardsHeatmap(baseHeatmap)
    setCached(CACHE_KEYS.HAZARDS_HEATMAP, baseHeatmap, baseHeatmapResult)
    await yieldToUI()

    // Step 6a: Subregion contribution — work-related variant
    onProgress('Computing subregions (work-related)...', 80)
    const wrSubregion = computeSubregionContribution(wrFiltered, siteClassifications)
    setCached(CACHE_KEYS.SUBREGION_CONTRIBUTION, wrFiltered, wrSubregion)
    await yieldToUI()

    // Step 6b: Subregion contribution — all-incidents variant
    onProgress('Computing subregions (all records)...', 90)
    const baseSubregion = computeSubregionContribution(baseFiltered, siteClassifications)
    setCached(CACHE_KEYS.SUBREGION_CONTRIBUTION, baseFiltered, baseSubregion)
    await yieldToUI()

    onProgress('Dashboard ready!', 100)
  } finally {
    setPrecomputeStatus('ready')
  }
}
