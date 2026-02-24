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
import { detectContributingFactors, getHazardCategory } from './rootCauseEngine'
import { RECORDABLE_INCIDENT_TYPES, PROACTIVE_TYPES } from './constants'
import { seedDefaultCache } from '../hooks/useTabCache'
import { seedDefaultWorkerResult, warmWorkerCache } from '../hooks/useWorkerTask'

const RECORDABLE_SET = new Set(RECORDABLE_INCIDENT_TYPES)
const PROACTIVE_SET = new Set(PROACTIVE_TYPES)

/**
 * Yield to the UI thread so progress bar / animations stay responsive
 */
const yieldToUI = () => new Promise(resolve => setTimeout(resolve, 0))

/**
 * Pre-compute derived fields and contributing factors on incident objects.
 * Mutates incidents in-place (they're already in memory as React state).
 *
 * Fields added:
 *  - _factors: Array of {name, score, ...} from detectContributingFactors
 *  - _dayOfWeek: 0-6 (Sun-Sat) from parsed date
 *  - _isRecordable: boolean from RECORDABLE_INCIDENT_TYPES
 *  - _isProactive: boolean from PROACTIVE_TYPES
 *
 * Yields to UI every 500 incidents so progress bar stays responsive.
 *
 * @param {Array} incidents - Full incidents array (mutated in-place)
 * @param {Function} [onBatch] - Optional progress callback (done, total) => void
 */
async function precomputeIncidentFields(incidents, onBatch) {
  const BATCH_SIZE = 500
  const total = incidents.length

  for (let i = 0; i < total; i++) {
    const incident = incidents[i]

    // Skip if already pre-computed (re-import / reload from IndexedDB)
    if (!incident._factors) {
      const hazardCategory = getHazardCategory(incident)
      incident._factors = detectContributingFactors(
        incident.description, hazardCategory,
        { returnScores: true, incidentType: incident.type }
      )
    }

    // Derived fields (cheap, always recompute to ensure consistency)
    if (incident._dayOfWeek === undefined) {
      if (incident.date) {
        const d = new Date(incident.date)
        incident._dayOfWeek = isNaN(d.getTime()) ? -1 : d.getDay()
      } else {
        incident._dayOfWeek = -1
      }
    }
    if (incident._isRecordable === undefined) {
      incident._isRecordable = RECORDABLE_SET.has(incident.type)
    }
    if (incident._isProactive === undefined) {
      incident._isProactive = PROACTIVE_SET.has(incident.type)
    }

    // Yield to UI every BATCH_SIZE incidents
    if ((i + 1) % BATCH_SIZE === 0) {
      if (onBatch) onBatch(i + 1, total)
      await yieldToUI()
    }
  }

  // Final progress
  if (onBatch) onBatch(total, total)
}

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
    onProgress('Building contractor list...', 10)
    const contractors = computeUniqueContractors(incidents)
    setCached(CACHE_KEYS.UNIQUE_CONTRACTORS, incidents, contractors)
    await yieldToUI()

    // Step 2b: Pre-compute factors + derived fields
    onProgress('Pre-computing factors...', 15)
    await precomputeIncidentFields(incidents)
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

    // Pre-compute contributing factors + derived fields for all incidents
    // This eliminates O(n × 3900 regex) on every filter change
    onProgress('Pre-computing factors...', 10)
    await precomputeIncidentFields(incidents, (done, total) => {
      const pct = 10 + Math.round((done / total) * 10) // 10-20%
      onProgress(`Pre-computing factors... ${done}/${total}`, pct)
    })
    await yieldToUI()

    const wrFiltered = defaults.workRelatedFiltered
    const wrHeatmap = defaults.workRelatedHeatmap
    const baseFiltered = defaults.baseFiltered
    const baseHeatmap = defaults.baseHeatmap
    const overdue30 = getOverdueCutoffDate(30)

    onProgress('Calculating KPIs...', 22)
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

    // Seed useTabCache defaults for Dashboard tab computations
    // Both wr=1 and wr=0 variants — so clearing filters is instant on first load
    onProgress('Seeding default caches...', 52)
    const WR1 = 'c=|s=|sr=|d=|wr=1'
    const WR0 = 'c=|s=|sr=|d=|wr=0'
    // Dashboard deps keys must match the composite key format from useTabCache:
    //   deps.map(d => Array.isArray(d) ? `arr${d.length}` : String(d)).join('|')
    // dashboardAggregates: [filteredIncidents, cutoffDates.overdue30Days]
    const overdue30Str = String(overdue30)
    const wrAggDeps = `arr${wrFiltered.length}|${overdue30Str}`
    const baseAggDeps = `arr${baseFiltered.length}|${overdue30Str}`
    seedDefaultCache('dashboardAggregates', WR1, wrAggDeps, wrAggregates)
    seedDefaultCache('dashboardAggregates', WR0, baseAggDeps, baseAggregates)
    // topHazards: [filteredIncidents]
    seedDefaultCache('topHazards', WR1, `arr${wrFiltered.length}`, wrTopHazards)
    seedDefaultCache('topHazards', WR0, `arr${baseFiltered.length}`, baseTopHazards)
    // hazardsHeatmap: [heatmapIncidents]
    seedDefaultCache('hazardsHeatmap', WR1, `arr${wrHeatmap.length}`, wrHeatmapResult)
    seedDefaultCache('hazardsHeatmap', WR0, `arr${baseHeatmap.length}`, baseHeatmapResult)
    await yieldToUI()

    // ═══════════════════════════════════════════════════════════════════
    // PHASE 2: Worker tasks (55-80%)
    // ═══════════════════════════════════════════════════════════════════

    onProgress('Running analytics engine...', 55)

    // Dynamic import to avoid adding cacheWarmer to the precompute bundle
    const { warmInitialDashboardCaches } = await import('./cacheWarmer')
    const workerPromises = warmInitialDashboardCaches(incidents)

    // Collect worker results for seeding defaults cache
    // warmInitialDashboardCaches returns: [aggFactors(heatmap), aggFactors(filtered), hazardTrending, misclass, textAnalysis, categorization, trendFlagged]
    const workerSettled = []

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

      const settled = await Promise.allSettled(tracked)
      settled.forEach(s => workerSettled.push(s.status === 'fulfilled' ? s.value : null))
    }

    await yieldToUI()

    // Seed worker results into permanent defaults cache
    // Map index to [taskName, fingerprint] pairs based on warmInitialDashboardCaches order
    const workerResultMap = [
      // idx 0: aggregateFactors for heatmap incidents (Dashboard uses heatmapIncidents)
      { task: 'aggregateFactors', fp: WR1 },
      // idx 1: aggregateFactors for filtered incidents (SafetyOutlook uses filteredIncidents)
      { task: 'aggregateFactors', fp: WR1 },
      // idx 2: hazardTrending
      { task: 'hazardTrending', fp: WR1 },
      // idx 3-6: DataQuality worker tasks (use filteredIncidents = wrFiltered by default)
      { task: 'misclassification', fp: WR1 },
      { task: 'textAnalysis', fp: WR1 },
      { task: 'categorization', fp: WR1 },
      { task: 'trendFlagged', fp: WR1 },
    ]
    workerSettled.forEach((result, idx) => {
      if (result != null && workerResultMap[idx]) {
        const { task, fp } = workerResultMap[idx]
        const paramsKey = task === 'hazardTrending' ? JSON.stringify({ period: null }) : ''
        seedDefaultWorkerResult(task, fp, paramsKey, result)
      }
    })

    // ═══════════════════════════════════════════════════════════════════
    // PHASE 3: Risk matrix + pyramid ranking (80-100%)
    // ═══════════════════════════════════════════════════════════════════

    onProgress('Computing risk matrix...', 82)

    // Re-request hazardTrending result (instant cache hit since worker already computed it)
    let sortedHazards = []
    try {
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
