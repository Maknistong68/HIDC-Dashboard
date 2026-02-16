/**
 * Dashboard Pre-computation Orchestrator
 *
 * Called after batchReloadIncidents() completes during import.
 * Runs each computation sequentially, stores results in dashboardCache,
 * and yields to the UI between steps via setTimeout(0).
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
    onProgress('Computing filtered data...', 10)
    const defaults = computeFilteredDefaults(incidents)
    setCached(CACHE_KEYS.FILTERED_DEFAULTS, { incidents, result: defaults })
    await yieldToUI()

    // Step 2: Unique contractors
    onProgress('Building contractor list...', 25)
    const contractors = computeUniqueContractors(incidents)
    setCached(CACHE_KEYS.UNIQUE_CONTRACTORS, { incidents, result: contractors })
    await yieldToUI()

    // For dashboard aggregates, use work-related filtered as default
    // (workRelatedOnly defaults to true on initial load)
    const wrFiltered = defaults.workRelatedFiltered
    const wrHeatmap = defaults.workRelatedHeatmap

    // Step 3: Dashboard aggregates (KPIs, pyramid, observers, companies)
    onProgress('Calculating KPIs...', 40)
    const overdue30 = getOverdueCutoffDate(30)
    const aggregates = computeDashboardAggregates(wrFiltered, overdue30)
    setCached(CACHE_KEYS.DASHBOARD_AGGREGATES, { incidents: wrFiltered, result: aggregates })
    await yieldToUI()

    // Step 4: Top hazards
    onProgress('Ranking hazards...', 60)
    const topHazards = computeTopHazards(wrFiltered)
    setCached(CACHE_KEYS.TOP_HAZARDS, { incidents: wrFiltered, result: topHazards })
    await yieldToUI()

    // Step 5: Hazards heatmap
    onProgress('Building heatmap...', 80)
    const heatmap = computeHazardsHeatmap(wrHeatmap)
    setCached(CACHE_KEYS.HAZARDS_HEATMAP, { incidents: wrHeatmap, result: heatmap })
    await yieldToUI()

    // Step 6: Subregion contribution
    onProgress('Computing subregions...', 90)
    const subregion = computeSubregionContribution(wrFiltered, siteClassifications)
    setCached(CACHE_KEYS.SUBREGION_CONTRIBUTION, { incidents: wrFiltered, result: subregion })
    await yieldToUI()

    onProgress('Dashboard ready!', 100)
  } finally {
    setPrecomputeStatus('ready')
  }
}
