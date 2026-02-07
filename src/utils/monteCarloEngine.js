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
