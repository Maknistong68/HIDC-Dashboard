/**
 * Monte Carlo Simulation Engine
 * Async simulation with chunked computation for non-blocking UI
 */

/**
 * Box-Muller transform for normal distribution sampling
 */
function boxMuller() {
  let u1 = 0, u2 = 0
  while (u1 === 0) u1 = Math.random()
  while (u2 === 0) u2 = Math.random()
  return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2)
}

/**
 * Compute mean/stddev of daily incident counts per hazard
 */
export function computeHazardStats(negativeIncidents, hazardNames) {
  const stats = {}
  const dailyCounts = {}

  for (const name of hazardNames) {
    dailyCounts[name] = {}
  }

  for (const inc of negativeIncidents) {
    const date = inc.date?.substring(0, 10)
    const hazard = inc.location
    if (!date || !hazard || !dailyCounts[hazard]) continue
    dailyCounts[hazard][date] = (dailyCounts[hazard][date] || 0) + 1
  }

  // Get full date range across all incidents
  const allDates = new Set()
  for (const inc of negativeIncidents) {
    const d = inc.date?.substring(0, 10)
    if (d) allDates.add(d)
  }
  const totalDays = Math.max(allDates.size, 1)

  for (const name of hazardNames) {
    const counts = dailyCounts[name]
    const values = []
    // Fill in zeros for dates without incidents for this hazard
    for (const d of allDates) {
      values.push(counts[d] || 0)
    }
    if (values.length === 0) {
      stats[name] = { mean: 0, stddev: 0, totalDays }
      continue
    }
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const variance = values.reduce((a, v) => a + (v - mean) ** 2, 0) / values.length
    stats[name] = { mean, stddev: Math.sqrt(variance), totalDays }
  }

  return stats
}

/**
 * Run Monte Carlo simulation asynchronously
 * @param {Object} params
 * @param {Object} params.hazardStats - Output of computeHazardStats
 * @param {string[]} params.hazardNames - Hazard names to simulate
 * @param {number} params.weeks - Number of future weeks to simulate (default 6)
 * @param {number} params.iterations - Total iterations (default 500)
 * @param {number} params.chunkSize - Iterations per frame (default 50)
 * @param {Function} params.onProgress - Progress callback (0-1)
 * @param {Object} params.abortRef - { current: boolean } ref to signal abort
 * @returns {Promise<Object>} Simulation results
 */
export function runMonteCarloSimulation({
  hazardStats,
  hazardNames,
  weeks = 6,
  iterations = 500,
  chunkSize = 50,
  onProgress,
  abortRef
}) {
  return new Promise((resolve) => {
    // Accumulator: for each hazard × week, track how many iterations exceed threshold
    const exceedanceCounts = {}
    const weeklyTotals = {}

    for (const name of hazardNames) {
      exceedanceCounts[name] = new Array(weeks).fill(0)
      weeklyTotals[name] = Array.from({ length: weeks }, () => [])
    }

    let completed = 0

    function processChunk() {
      if (abortRef?.current) {
        resolve(null)
        return
      }

      const end = Math.min(completed + chunkSize, iterations)

      for (let i = completed; i < end; i++) {
        for (const name of hazardNames) {
          const { mean, stddev } = hazardStats[name] || { mean: 0, stddev: 0 }
          for (let w = 0; w < weeks; w++) {
            // Simulate weekly count = sum of 7 daily samples
            let weeklyCount = 0
            for (let d = 0; d < 7; d++) {
              const sample = mean + stddev * boxMuller()
              weeklyCount += Math.max(0, Math.round(sample))
            }
            weeklyTotals[name][w].push(weeklyCount)
          }
        }
      }

      completed = end
      if (onProgress) onProgress(completed / iterations)

      if (completed < iterations) {
        setTimeout(processChunk, 0)
      } else {
        // Compute exceedance probabilities
        const cells = []
        const thresholds = {}

        for (const name of hazardNames) {
          const { mean } = hazardStats[name] || { mean: 0 }
          // Threshold = historical weekly mean * 1.5 (elevated risk)
          const weeklyMean = mean * 7
          const threshold = Math.max(1, Math.round(weeklyMean * 1.5))
          thresholds[name] = threshold

          const row = []
          for (let w = 0; w < weeks; w++) {
            const values = weeklyTotals[name][w]
            const exceeded = values.filter(v => v >= threshold).length
            const probability = exceeded / values.length
            const avg = values.reduce((a, b) => a + b, 0) / values.length
            const p95 = [...values].sort((a, b) => a - b)[Math.floor(values.length * 0.95)] || 0
            row.push({ probability, avg: Math.round(avg * 10) / 10, p95, threshold })
          }
          cells.push(row)
        }

        // Generate week labels
        const now = new Date()
        const weekLabels = Array.from({ length: weeks }, (_, i) => {
          const d = new Date(now)
          d.setDate(d.getDate() + (i + 1) * 7)
          return `W${i + 1}`
        })

        resolve({
          hazards: hazardNames,
          weeks: weekLabels,
          cells,
          thresholds,
          iterations: completed,
          isComplete: true
        })
      }
    }

    setTimeout(processChunk, 0)
  })
}

/**
 * Transform Monte Carlo results into plain-language risk summaries per hazard
 * @param {Object} result - Output of runMonteCarloSimulation
 * @param {Object} hazardStats - Output of computeHazardStats
 * @param {Object[]} sortedHazards - Hazard trend data array
 * @returns {Object[]} Ranked hazard risk summaries
 */
export function getHazardExceedanceSummary(result, hazardStats, sortedHazards) {
  if (!result?.hazards?.length || !result.cells?.length) return []

  const trendMap = {}
  for (const h of (sortedHazards || [])) {
    trendMap[h.name] = h.trendLevel?.level || 'stable'
  }

  const trendMultiplier = {
    'significant-rise': 1.5,
    'rising': 1.2,
    'stable': 1.0,
    'declining': 0.8,
    'significant-decline': 0.6
  }

  const summaries = result.hazards.map((name, idx) => {
    const row = result.cells[idx]
    if (!row?.length) return null

    const week1 = row[0]
    const stats = hazardStats?.[name] || { mean: 0, stddev: 0 }
    const weeklyMean = Math.round(stats.mean * 7)
    const trend = trendMap[name] || 'stable'
    const mult = trendMultiplier[trend] || 1.0

    const exceedanceProb = Math.round((week1.probability || 0) * 100)
    const sortScore = exceedanceProb * mult

    // Count how many of 6 weeks exceeded threshold
    const weeksExceeded = row.filter(w => w.probability > 0.5).length

    // Determine risk level
    let riskLevel = 'Low'
    let riskColor = 'green'
    if (exceedanceProb >= 70) { riskLevel = 'High'; riskColor = 'red' }
    else if (exceedanceProb >= 50) { riskLevel = 'Elevated'; riskColor = 'amber' }
    else if (exceedanceProb >= 30) { riskLevel = 'Moderate'; riskColor = 'amber' }

    // Build plain-language sentence
    const trendWord = trend === 'significant-rise' ? 'Trending sharply upward'
      : trend === 'rising' ? 'Trending upward'
      : trend === 'declining' ? 'Trending downward'
      : trend === 'significant-decline' ? 'Trending sharply downward'
      : 'Relatively stable'

    const sentence = weeksExceeded > 0
      ? `${weeksExceeded} of the last 6 weeks exceeded normal levels. ${trendWord}.`
      : `Within normal levels for recent weeks. ${trendWord}.`

    // 6-week probability strip data
    const weeklyProbs = row.map(w => Math.round((w.probability || 0) * 100))

    return {
      name,
      exceedanceProb,
      sortScore,
      riskLevel,
      riskColor,
      sentence,
      trend,
      weeklyMean,
      weeklyProbs,
      weeksExceeded,
      avgProjected: Math.round(week1.avg || 0),
      p95: week1.p95 || 0
    }
  }).filter(Boolean)

  summaries.sort((a, b) => b.sortScore - a.sortScore)

  return summaries
}
