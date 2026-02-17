import { parseISO, format, startOfWeek, addWeeks } from 'date-fns'
import { filterByHazard, getSortedDates, calculateLinearRegression } from './incidentHelpers'
import { CONSEQUENCE_TYPE_MAP } from './riskMatrix'
import { isPositiveType } from './rootCauseEngine'

// ============================================================================
// RANDOM SAMPLING
// ============================================================================

/**
 * Sample from a Poisson distribution using the inverse-transform method.
 * For small λ (<30) uses Knuth's algorithm; for large λ uses normal approximation.
 */
export function poissonRandom(lambda) {
  if (lambda <= 0) return 0
  if (lambda > 30) {
    // Normal approximation for large λ
    const u1 = Math.random()
    const u2 = Math.random()
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    return Math.max(0, Math.round(lambda + Math.sqrt(lambda) * z))
  }
  // Knuth's algorithm
  const L = Math.exp(-lambda)
  let k = 0
  let p = 1
  do {
    k++
    p *= Math.random()
  } while (p > L)
  return k - 1
}

/**
 * Sample from a Negative Binomial distribution (mean, overdispersion).
 * Uses the Gamma-Poisson mixture representation.
 */
export function negativeBinomialRandom(mean, overdispersion) {
  if (mean <= 0) return 0
  // r = mean² / (variance - mean), where variance = mean * overdispersion
  const variance = mean * overdispersion
  const r = (mean * mean) / (variance - mean)
  if (r <= 0 || !isFinite(r)) return poissonRandom(mean)
  const p = mean / variance

  // Sample gamma(r, p/(1-p)) then Poisson(gamma)
  // Simple gamma sampling via Marsaglia & Tsang for shape >= 1
  const gammaShape = r
  const gammaScale = p / (1 - p)
  const gammaSample = sampleGamma(gammaShape, gammaScale)
  return poissonRandom(gammaSample)
}

/**
 * Sample from a Gamma distribution using Marsaglia & Tsang's method.
 */
function sampleGamma(shape, scale) {
  if (shape < 1) {
    // Boost: Gamma(a) = Gamma(a+1) * U^(1/a)
    return sampleGamma(shape + 1, scale) * Math.pow(Math.random(), 1 / shape)
  }
  const d = shape - 1 / 3
  const c = 1 / Math.sqrt(9 * d)
  while (true) {
    let x, v
    do {
      const u1 = Math.random()
      const u2 = Math.random()
      x = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
      v = Math.pow(1 + c * x, 3)
    } while (v <= 0)
    const u = Math.random()
    if (u < 1 - 0.0331 * x * x * x * x) return d * v * scale
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v * scale
  }
}

// ============================================================================
// RATE CALIBRATION
// ============================================================================

/**
 * Bucket incidents into ISO weeks, returning { week, count } array.
 * Replicates the pattern from predictiveCalculations.js (not exported there).
 */
function bucketWeeklyCounts(incidents, startDate, endDate) {
  const weekMap = new Map()
  for (const inc of incidents) {
    if (!inc.date) continue
    const d = typeof inc.date === 'string' ? parseISO(inc.date) : inc.date
    if (d < startDate || d > endDate) continue
    const weekKey = format(startOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd')
    weekMap.set(weekKey, (weekMap.get(weekKey) || 0) + 1)
  }
  const result = []
  let cursor = startOfWeek(startDate, { weekStartsOn: 1 })
  while (cursor <= endDate) {
    const key = format(cursor, 'yyyy-MM-dd')
    result.push({ week: key, count: weekMap.get(key) || 0 })
    cursor = addWeeks(cursor, 1)
  }
  return result
}

/**
 * Calibrate weekly rates, trend, overdispersion, and type distribution for each hazard.
 * Returns Map<hazardName, { weeklyRate, trendSlope, overdispersion, useNB, typeDistribution, weekCount }>
 */
export function calibrateHazardRates(incidents, sortedHazards) {
  const rates = new Map()
  const dates = getSortedDates(incidents)
  if (dates.length < 2) return rates

  const globalStart = parseISO(dates[0])
  const globalEnd = parseISO(dates[dates.length - 1])

  for (const hazard of sortedHazards) {
    const name = hazard.name || hazard
    const hazardInc = filterByHazard(incidents, name).filter(i => !isPositiveType(i.type))
    if (hazardInc.length === 0) continue

    const weeklyCounts = bucketWeeklyCounts(hazardInc, globalStart, globalEnd)
    if (weeklyCounts.length < 2) continue

    const counts = weeklyCounts.map(w => w.count)

    // EMA-smoothed current rate (alpha = 0.5)
    let ema = counts[0]
    for (let i = 1; i < counts.length; i++) {
      ema = 0.5 * counts[i] + 0.5 * ema
    }
    const weeklyRate = Math.max(0, ema)

    // Trend slope from last 6 EMA values
    const emaValues = []
    let e = counts[0]
    for (let i = 0; i < counts.length; i++) {
      e = 0.5 * counts[i] + 0.5 * e
      emaValues.push(e)
    }
    const recentEma = emaValues.slice(-6)
    const { slope: trendSlope } = calculateLinearRegression(recentEma)

    // Overdispersion check: variance / mean
    const mean = counts.reduce((s, c) => s + c, 0) / counts.length
    const variance = counts.reduce((s, c) => s + (c - mean) ** 2, 0) / counts.length
    const overdispersion = mean > 0 ? variance / mean : 1
    const useNB = overdispersion > 1.5

    // Type distribution: fraction of each incident type
    const typeCounts = {}
    for (const inc of hazardInc) {
      const t = inc.type?.toLowerCase() || 'unknown'
      typeCounts[t] = (typeCounts[t] || 0) + 1
    }
    const total = hazardInc.length
    const typeDistribution = {}
    for (const [type, count] of Object.entries(typeCounts)) {
      typeDistribution[type] = count / total
    }

    rates.set(name, {
      weeklyRate,
      trendSlope,
      overdispersion,
      useNB,
      typeDistribution,
      weekCount: weeklyCounts.length,
      incidentCount: hazardInc.length,
    })
  }

  return rates
}

// ============================================================================
// SIMULATION
// ============================================================================

/**
 * Run a single simulation trial across all hazards for the given horizon.
 */
function simulateTrial(rates, horizonWeeks) {
  let totalCount = 0
  const bySeverity = { sev4: 0, sev3: 0, sev2: 0, sev1: 0 }
  const byType = {}
  const byHazard = {}

  for (const [name, params] of rates) {
    let hazardTotal = 0
    let hazardSerious = 0

    for (let week = 1; week <= horizonWeeks; week++) {
      // Trend-adjusted rate
      let adjustedLambda = params.weeklyRate * (1 + params.trendSlope * week * 0.1)
      adjustedLambda = Math.max(0, adjustedLambda)

      // Sample count
      const weekCount = params.useNB
        ? negativeBinomialRandom(adjustedLambda, params.overdispersion)
        : poissonRandom(adjustedLambda)

      // Sample severity for each incident
      for (let j = 0; j < weekCount; j++) {
        const type = sampleType(params.typeDistribution)
        const severity = CONSEQUENCE_TYPE_MAP[type] || 1

        if (severity >= 4) bySeverity.sev4++
        else if (severity >= 3) bySeverity.sev3++
        else if (severity >= 2) bySeverity.sev2++
        else bySeverity.sev1++

        byType[type] = (byType[type] || 0) + 1
        if (severity >= 3) hazardSerious++
      }

      hazardTotal += weekCount
    }

    totalCount += hazardTotal
    byHazard[name] = { total: hazardTotal, serious: hazardSerious }
  }

  return { totalCount, bySeverity, byType, byHazard }
}

/**
 * Sample a type from the type distribution using inverse CDF.
 */
function sampleType(typeDistribution) {
  const r = Math.random()
  let cumulative = 0
  for (const [type, fraction] of Object.entries(typeDistribution)) {
    cumulative += fraction
    if (r <= cumulative) return type
  }
  // Fallback to last type
  const types = Object.keys(typeDistribution)
  return types[types.length - 1] || 'near-miss'
}

// ============================================================================
// PERCENTILE & HISTOGRAM HELPERS
// ============================================================================

export function computePercentiles(sortedValues, percentiles) {
  const result = {}
  for (const p of percentiles) {
    const index = Math.ceil((p / 100) * sortedValues.length) - 1
    result[`p${p}`] = sortedValues[Math.max(0, Math.min(index, sortedValues.length - 1))]
  }
  return result
}

export function buildHistogram(values, binCount = 20) {
  if (values.length === 0) return []
  const min = values[0]
  const max = values[values.length - 1]
  if (min === max) return [{ binStart: min, binEnd: min, count: values.length, pct: 100 }]

  const binWidth = Math.max(1, Math.ceil((max - min + 1) / binCount))
  const bins = []
  for (let i = 0; i < binCount; i++) {
    const binStart = min + i * binWidth
    const binEnd = binStart + binWidth - 1
    if (binStart > max) break
    bins.push({ binStart, binEnd: Math.min(binEnd, max), count: 0, pct: 0 })
  }

  for (const val of values) {
    const idx = Math.min(Math.floor((val - min) / binWidth), bins.length - 1)
    bins[idx].count++
  }

  const total = values.length
  for (const bin of bins) {
    bin.pct = Math.round((bin.count / total) * 1000) / 10
  }

  return bins
}

// ============================================================================
// MAIN ENTRY POINT
// ============================================================================

/**
 * Run Monte Carlo simulation across all hazards.
 *
 * @param {Array} incidents - All incidents (positive types will be filtered out)
 * @param {Array} sortedHazards - Hazard objects from getHazardTrendingByPeriod
 * @param {Object} options - { numSimulations, horizonWeeks, significantOnly }
 * @returns {Object} { summary, perHazard, distribution, severityBreakdown, meta }
 */
export function runMonteCarloSimulation(incidents, sortedHazards, options = {}) {
  const {
    numSimulations = 5000,
    horizonWeeks = 4,
    significantOnly = false,
  } = options

  // Filter to negative incidents
  const negativeIncidents = incidents.filter(i => !isPositiveType(i.type))

  if (negativeIncidents.length < 5 || sortedHazards.length === 0) {
    return {
      summary: null,
      perHazard: [],
      distribution: [],
      severityBreakdown: null,
      meta: { numSimulations, horizonWeeks, insufficient: true },
    }
  }

  // Filter hazards if significantOnly
  const hazards = significantOnly
    ? sortedHazards.filter(h => h.isSignificant)
    : sortedHazards

  // Calibrate rates
  const rates = calibrateHazardRates(negativeIncidents, hazards)
  if (rates.size === 0) {
    return {
      summary: null,
      perHazard: [],
      distribution: [],
      severityBreakdown: null,
      meta: { numSimulations, horizonWeeks, insufficient: true },
    }
  }

  // Run trials
  const totalCounts = []
  const hazardTotals = {}    // name → [counts]
  const hazardSerious = {}   // name → [counts]
  const severityAccum = { sev4: 0, sev3: 0, sev2: 0, sev1: 0 }
  const typeAccum = {}
  let seriousTrials = 0      // trials with ≥1 severity≥3
  let ltiFatalTrials = 0     // trials with ≥1 severity≥3 (LTI) or sev4 (fatality/fire)

  for (const [name] of rates) {
    hazardTotals[name] = []
    hazardSerious[name] = []
  }

  for (let i = 0; i < numSimulations; i++) {
    const trial = simulateTrial(rates, horizonWeeks)
    totalCounts.push(trial.totalCount)

    // Severity accumulation
    severityAccum.sev4 += trial.bySeverity.sev4
    severityAccum.sev3 += trial.bySeverity.sev3
    severityAccum.sev2 += trial.bySeverity.sev2
    severityAccum.sev1 += trial.bySeverity.sev1

    // Type accumulation
    for (const [type, count] of Object.entries(trial.byType)) {
      typeAccum[type] = (typeAccum[type] || 0) + count
    }

    // Serious incident tracking
    const hasSerious = trial.bySeverity.sev3 > 0 || trial.bySeverity.sev4 > 0
    if (hasSerious) seriousTrials++
    if (trial.bySeverity.sev4 > 0 || trial.bySeverity.sev3 > 0) ltiFatalTrials++

    // Per-hazard tracking
    for (const [name] of rates) {
      const h = trial.byHazard[name] || { total: 0, serious: 0 }
      hazardTotals[name].push(h.total)
      hazardSerious[name].push(h.serious)
    }
  }

  // Sort for percentile calculations
  totalCounts.sort((a, b) => a - b)
  const percentiles = computePercentiles(totalCounts, [5, 25, 50, 75, 95])

  // Summary
  const summary = {
    median: percentiles.p50,
    p25: percentiles.p25,
    p75: percentiles.p75,
    p5: percentiles.p5,
    p95: percentiles.p95,
    mean: Math.round((totalCounts.reduce((s, v) => s + v, 0) / numSimulations) * 10) / 10,
    seriousProbability: Math.round((seriousTrials / numSimulations) * 1000) / 10,
    ltiFatalProbability: Math.round((ltiFatalTrials / numSimulations) * 1000) / 10,
  }

  // Distribution histogram
  const distribution = buildHistogram(totalCounts, Math.min(25, Math.max(10, Math.ceil(Math.sqrt(numSimulations / 10)))))

  // Per-hazard breakdown
  const perHazard = []
  for (const [name, params] of rates) {
    const totals = hazardTotals[name]
    const serious = hazardSerious[name]
    totals.sort((a, b) => a - b)

    const mean = Math.round((totals.reduce((s, v) => s + v, 0) / numSimulations) * 10) / 10
    const pAtLeast1 = Math.round((totals.filter(v => v > 0).length / numSimulations) * 1000) / 10
    const pAtLeast1Serious = Math.round((serious.filter(v => v > 0).length / numSimulations) * 1000) / 10

    // Find worst historical severity for this hazard
    const worstSeverity = Math.max(
      ...Object.entries(params.typeDistribution).map(([type]) => CONSEQUENCE_TYPE_MAP[type] || 1)
    )

    perHazard.push({
      name,
      mean,
      pAtLeast1,
      pAtLeast1Serious,
      worstSeverity,
      weeklyRate: Math.round(params.weeklyRate * 100) / 100,
      useNB: params.useNB,
    })
  }

  // Sort by P(≥1 serious) descending
  perHazard.sort((a, b) => b.pAtLeast1Serious - a.pAtLeast1Serious || b.pAtLeast1 - a.pAtLeast1)

  // Severity breakdown (mean counts per simulation)
  const severityBreakdown = {
    fatality: Math.round((severityAccum.sev4 / numSimulations) * 10) / 10,
    serious: Math.round((severityAccum.sev3 / numSimulations) * 10) / 10,
    moderate: Math.round((severityAccum.sev2 / numSimulations) * 10) / 10,
    minor: Math.round((severityAccum.sev1 / numSimulations) * 10) / 10,
  }

  // Top types breakdown
  const typeBreakdown = Object.entries(typeAccum)
    .map(([type, total]) => ({ type, mean: Math.round((total / numSimulations) * 10) / 10 }))
    .sort((a, b) => b.mean - a.mean)

  // Data quality meta
  const totalWeeks = Math.max(...[...rates.values()].map(r => r.weekCount))
  const totalObs = [...rates.values()].reduce((s, r) => s + r.incidentCount, 0)

  return {
    summary,
    perHazard,
    distribution,
    severityBreakdown,
    typeBreakdown,
    meta: {
      numSimulations,
      horizonWeeks,
      hazardCount: rates.size,
      totalWeeks,
      totalObservations: totalObs,
      insufficient: false,
    },
  }
}
