import { parseISO, subDays, differenceInDays, format, startOfWeek, addWeeks } from 'date-fns'
import {
  filterByHazard,
  isOpenAction,
  getSortedDates,
  calculateLinearRegression,
} from './incidentHelpers'
import { CONSEQUENCE_TYPE_MAP } from './riskMatrix'
import { isPositiveType } from './rootCauseEngine'

// ============================================================================
// SHARED HELPERS
// ============================================================================

/**
 * Bucket incidents into ISO weeks, returning an array of { week, count } objects.
 * `week` is the Monday date string (YYYY-MM-DD).
 */
const bucketWeeklyCounts = (incidents, startDate, endDate) => {
  const weekMap = new Map()
  for (const inc of incidents) {
    if (!inc.date) continue
    const d = typeof inc.date === 'string' ? parseISO(inc.date) : inc.date
    if (d < startDate || d > endDate) continue
    const weekKey = format(startOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd')
    weekMap.set(weekKey, (weekMap.get(weekKey) || 0) + 1)
  }

  // Fill gaps with zero-count weeks
  const result = []
  let cursor = startOfWeek(startDate, { weekStartsOn: 1 })
  const end = endDate
  while (cursor <= end) {
    const key = format(cursor, 'yyyy-MM-dd')
    result.push({ week: key, count: weekMap.get(key) || 0 })
    cursor = addWeeks(cursor, 1)
  }
  return result
}

// ============================================================================
// RISK TREND FORECAST (EMA + projection)
// ============================================================================

/**
 * Calculate EMA forecast for a single hazard.
 * Returns weekly rates, EMA line, 4-week projection, and confidence bands.
 */
export const calculateEMAForecast = (incidents, hazardName, alpha = 0.5) => {
  const hazardInc = filterByHazard(incidents, hazardName).filter(
    (i) => !isPositiveType(i.type)
  )
  const dates = getSortedDates(hazardInc)
  if (dates.length < 2) {
    return {
      hazardName,
      weeklyRates: [],
      emaLine: [],
      forecast: [],
      confidence: [],
      currentRate: 0,
      trendDirection: 'stable',
      forecastRate: 0,
      confidenceWidth: 0,
      hasData: false,
    }
  }

  const start = parseISO(dates[0])
  const end = parseISO(dates[dates.length - 1])
  const weeklyCounts = bucketWeeklyCounts(hazardInc, start, end)

  if (weeklyCounts.length < 3) {
    return {
      hazardName,
      weeklyRates: weeklyCounts,
      emaLine: [],
      forecast: [],
      confidence: [],
      currentRate: weeklyCounts[weeklyCounts.length - 1]?.count || 0,
      trendDirection: 'stable',
      forecastRate: 0,
      confidenceWidth: 0,
      hasData: false,
    }
  }

  // Calculate EMA with Bollinger Bands (rolling 4-week, 1.5σ — tight bands)
  const BOLLINGER_WINDOW = 4
  const BOLLINGER_K = 1.5
  const emaLine = []
  let ema = weeklyCounts[0].count
  for (let j = 0; j < weeklyCounts.length; j++) {
    ema = alpha * weeklyCounts[j].count + (1 - alpha) * ema
    const roundedEma = Math.round(ema * 100) / 100
    // Rolling σ from recent actual counts
    const wStart = Math.max(0, j - BOLLINGER_WINDOW + 1)
    const window = weeklyCounts.slice(wStart, j + 1).map(w => w.count)
    const wMean = window.reduce((s, v) => s + v, 0) / window.length
    const wStd = Math.sqrt(window.reduce((s, v) => s + (v - wMean) ** 2, 0) / window.length)
    const bUpper = Math.round((roundedEma + BOLLINGER_K * wStd) * 100) / 100
    const bLower = Math.round(Math.max(0, roundedEma - BOLLINGER_K * wStd) * 100) / 100
    emaLine.push({
      week: weeklyCounts[j].week,
      ema: roundedEma,
      bollingerUpper: bUpper,
      bollingerLower: bLower,
      spike: weeklyCounts[j].count > roundedEma + BOLLINGER_K * wStd,
    })
  }

  // Extract last Bollinger width to continue bands into forecast zone
  const lastBollingerEntry = emaLine[emaLine.length - 1]
  const lastBollingerWidth = lastBollingerEntry.bollingerUpper - lastBollingerEntry.ema

  // Trend from last 6 EMA values (or fewer)
  const lastEma = ema
  const trendWindow = emaLine.slice(-Math.min(6, emaLine.length)).map(e => e.ema)
  const trendReg = calculateLinearRegression(trendWindow)
  const weeklySlope = trendReg.slope
  const projectionSlope = weeklySlope

  // 4-week trending forecast with Bollinger-continuation bands
  // Damped decay: convert slope to per-week rate, capped at ±30% to prevent extremes
  const slopeRate = lastEma > 0 ? Math.max(-0.3, Math.min(0.3, projectionSlope / lastEma)) : 0
  // Floor: forecast can't drop below 30% of current rate (hazards don't vanish)
  const floor = lastEma * 0.3

  // Recovery rate for last 2 forecast weeks — mirror the slope magnitude, min 5%/week
  const recoveryRate = Math.max(0.05, Math.abs(slopeRate))

  const forecast = []
  const confidence = []
  let prevEma = lastEma
  for (let i = 1; i <= 4; i++) {
    const forecastWeek = format(addWeeks(parseISO(weeklyCounts[weeklyCounts.length - 1].week), i), 'yyyy-MM-dd')
    // Weeks 1-2: follow natural trend; Weeks 3-4: always move upward (recovery)
    const rate = i >= 3 ? recoveryRate : slopeRate
    const raw = prevEma * (1 + rate)
    const forecastEma = Math.max(floor, raw)
    prevEma = forecastEma
    const bandWidth = lastBollingerWidth * 0.7
    forecast.push({
      week: forecastWeek,
      ema: Math.round(forecastEma * 100) / 100,
    })
    confidence.push({
      week: forecastWeek,
      upper: Math.round((forecastEma + bandWidth) * 100) / 100,
      lower: Math.round(Math.max(forecastEma * 0.3, forecastEma - bandWidth) * 100) / 100,
    })
  }

  // Trend direction from last 4 EMA values
  const recentEma = emaLine.slice(-4).map((e) => e.ema)
  const reg = calculateLinearRegression(recentEma)

  // 4-week forecast average rate (reflects trending, not flat)
  const forecastAvg = forecast.reduce((s, f) => s + f.ema, 0) / forecast.length

  return {
    hazardName,
    weeklyRates: weeklyCounts,
    emaLine,
    forecast,
    confidence,
    currentRate: Math.round(lastEma * 10) / 10,
    trendDirection: reg.trend === 'increasing' ? 'rising' : reg.trend === 'decreasing' ? 'declining' : 'stable',
    forecastRate: Math.round(forecastAvg * 10) / 10,
    confidenceWidth: Math.round(lastBollingerWidth * 10) / 10,
    hasData: true,
  }
}

/**
 * Compact sparkline summaries for all hazards.
 */
export const calculateAllHazardForecasts = (incidents, hazards) => {
  if (!incidents?.length || !hazards?.length) return []
  return hazards
    .filter((h) => h.totalCount > 0 && !h.hasNoData)
    .map((h) => {
      const result = calculateEMAForecast(incidents, h.name)
      return {
        name: h.name,
        currentRate: result.currentRate,
        forecastRate: result.forecastRate,
        trendDirection: result.trendDirection,
        sparkline: result.weeklyRates.slice(-12).map((w) => w.count),
        hasData: result.hasData,
      }
    })
    .sort((a, b) => b.currentRate - a.currentRate)
}

// ============================================================================
// INCIDENT PROBABILITY (Poisson)
// ============================================================================

/**
 * Poisson probability of at least 1 incident over `weeks` weeks.
 * P(≥1) = 1 - e^(-λ×T) where λ = weeklyRate, T = weeks.
 * Returns percentage 0-100.
 */
export const calculateIncidentProbability = (weeklyRate, weeks = 4) => {
  if (!weeklyRate || weeklyRate <= 0) return 0
  const lambda = weeklyRate * weeks
  const prob = (1 - Math.exp(-lambda)) * 100
  return Math.round(prob * 10) / 10
}

// ============================================================================
// CRITICAL THRESHOLD (serious incident weeks)
// ============================================================================

/**
 * Calculate the critical threshold — the average weekly incident count
 * during weeks that had at least one serious incident (severity ≥ 3).
 *
 * @param {Array} hazardIncidents - negative incidents for this hazard
 * @param {Array} weeklyRates - from forecastData.weeklyRates [{week, count}]
 * @returns {{ threshold: number, seriousWeekCount: number, hasSeriousData: true }} | null
 */
export const calculateCriticalThreshold = (hazardIncidents, weeklyRates) => {
  if (!hazardIncidents?.length || !weeklyRates?.length) return null

  // Build a set of week keys that had a serious incident (severity ≥ 3)
  const seriousWeeks = new Set()
  for (const inc of hazardIncidents) {
    if (!inc.date) continue
    const sev = CONSEQUENCE_TYPE_MAP[inc.type?.toLowerCase()] || 1
    if (sev >= 3) {
      const d = typeof inc.date === 'string' ? parseISO(inc.date) : inc.date
      const weekKey = format(startOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd')
      seriousWeeks.add(weekKey)
    }
  }

  if (seriousWeeks.size === 0) {
    // Fallback: statistical upper bounds at multiple sigma levels
    const counts = weeklyRates.map(w => w.count)
    const mean = counts.reduce((s, c) => s + c, 0) / counts.length
    const variance = counts.reduce((s, c) => s + Math.pow(c - mean, 2), 0) / counts.length
    const stdDev = Math.sqrt(variance)
    return {
      threshold: Math.round((mean + 1.5 * stdDev) * 10) / 10,
      thresholds: {
        tight: Math.round((mean + 1.0 * stdDev) * 10) / 10,
        std: Math.round((mean + 1.5 * stdDev) * 10) / 10,
        wide: Math.round((mean + 2.0 * stdDev) * 10) / 10,
      },
      seriousWeekCount: 0,
      hasSeriousData: false,
    }
  }

  // Collect the total weekly counts for those serious weeks
  const seriousWeekCounts = weeklyRates
    .filter(w => seriousWeeks.has(w.week))
    .map(w => w.count)

  if (seriousWeekCounts.length === 0) return null

  const avg = seriousWeekCounts.reduce((s, c) => s + c, 0) / seriousWeekCounts.length
  const sorted = [...seriousWeekCounts].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
  const min = sorted[0]

  // Extract date range from serious week keys
  const sortedWeeks = [...seriousWeeks].sort()
  const firstWeek = sortedWeeks[0]
  const lastWeek = sortedWeeks[sortedWeeks.length - 1]

  return {
    threshold: Math.round(avg * 10) / 10,
    thresholds: {
      avg: Math.round(avg * 10) / 10,
      med: Math.round(median * 10) / 10,
      min: Math.round(min * 10) / 10,
    },
    seriousWeekCount: seriousWeekCounts.length,
    dateRange: {
      from: format(parseISO(firstWeek), 'MMM yyyy'),
      to: format(parseISO(lastWeek), 'MMM yyyy'),
    },
    hasSeriousData: true,
  }
}

// ============================================================================
// SIMULATION FORECAST OVERLAY
// ============================================================================

/**
 * Apply a simulation effect to forecast data, returning modified forecast points.
 * `totalEffectPercent` is the projected change from sliders (e.g. -15 means 15% reduction).
 * Uses progressive compounding so the simulated line diverges dramatically from baseline.
 * Returns null if effect is 0 (no overlay needed).
 */
const PROGRESSION_FACTORS = [0.5, 1.0, 1.6, 2.3]

export const applySimulationToForecast = (forecastData, totalEffectPercent) => {
  if (!forecastData?.hasData || !totalEffectPercent || totalEffectPercent === 0) return null

  const baselineRate = forecastData.currentRate

  const forecast = forecastData.forecast.map((f, i) => {
    const weekMultiplier = 1 + (totalEffectPercent / 100) * PROGRESSION_FACTORS[i]
    return {
      week: f.week,
      simulatedEma: Math.max(0, Math.round(f.ema * weekMultiplier * 100) / 100),
    }
  })

  // simulatedRate = week-4 endpoint (the "target" the simulation achieves)
  const week4Multiplier = 1 + (totalEffectPercent / 100) * PROGRESSION_FACTORS[3]
  const simulatedRate = Math.max(0, Math.round(baselineRate * week4Multiplier * 10) / 10)

  return {
    forecast,
    simulatedRate,
    baselineRate,
    effectPercent: totalEffectPercent,
  }
}

// ============================================================================
// RISK VELOCITY
// ============================================================================

/**
 * Calculate rate-of-change for each hazard over 30-day windows.
 * Returns velocity %, acceleration, and severity weight.
 */
export const calculateRiskVelocity = (incidents, hazards) => {
  if (!incidents?.length || !hazards?.length) return []

  const dates = getSortedDates(incidents)
  if (dates.length < 2) return []
  const latestDate = parseISO(dates[dates.length - 1])
  const midDate = subDays(latestDate, 30)
  const earlyDate = subDays(latestDate, 60)

  return hazards
    .filter((h) => h.totalCount > 0 && !h.hasNoData)
    .map((h) => {
      const hazardInc = filterByHazard(incidents, h.name).filter(
        (i) => !isPositiveType(i.type)
      )
      if (hazardInc.length === 0) return null

      // Current 30-day count
      const current = hazardInc.filter((i) => {
        const d = parseISO(i.date)
        return d > midDate && d <= latestDate
      }).length

      // Previous 30-day count
      const previous = hazardInc.filter((i) => {
        const d = parseISO(i.date)
        return d > earlyDate && d <= midDate
      }).length

      // Velocity % = (current - previous) / max(previous, 1) * 100
      const velocity = Math.round(
        ((current - previous) / Math.max(previous, 1)) * 100
      )

      // Acceleration = velocity change (would need 3rd period, simplify to sign of second derivative)
      const prePrevious = hazardInc.filter((i) => {
        const d = parseISO(i.date)
        return d > subDays(latestDate, 90) && d <= earlyDate
      }).length
      const prevVelocity = Math.round(
        ((previous - prePrevious) / Math.max(prePrevious, 1)) * 100
      )
      const acceleration = velocity - prevVelocity

      // Severity weight from CONSEQUENCE_TYPE_MAP
      let maxSeverity = 1
      for (const inc of hazardInc) {
        const sev = CONSEQUENCE_TYPE_MAP[inc.type?.toLowerCase()] || 1
        if (sev > maxSeverity) maxSeverity = sev
      }

      return {
        name: h.name,
        currentCount: current,
        previousCount: previous,
        totalCount: hazardInc.length,
        velocity,
        acceleration,
        severityWeight: maxSeverity,
        isAccelerating: velocity > 0 && acceleration > 0,
        isStable: Math.abs(velocity) <= 5,
        isDecelerating: velocity < 0,
      }
    })
    .filter(Boolean)
    .sort((a, b) => b.velocity - a.velocity)
}

/**
 * Group velocity data into accelerating / stable / decelerating buckets.
 */
export const groupByVelocity = (velocityData) => {
  const accelerating = []
  const stable = []
  const decelerating = []

  for (const item of velocityData) {
    if (item.velocity > 5 && item.acceleration > 0) {
      accelerating.push(item)
    } else if (Math.abs(item.velocity) <= 5) {
      stable.push(item)
    } else if (item.velocity < -5) {
      decelerating.push(item)
    } else {
      // velocity > 5 but decelerating, or velocity < -5 but accelerating
      // Classify by primary velocity direction
      if (item.velocity > 0) accelerating.push(item)
      else stable.push(item)
    }
  }

  return { accelerating, stable, decelerating }
}

// ============================================================================
// PREDICTIVE SAFETY INDEX (PSI)
// ============================================================================

/**
 * Calculate PSI for a single hazard. Score 0-100 where higher = worse risk.
 *
 * Weights:
 *   0.4 × incident_trend   (normalized slope of weekly counts)
 *   0.3 × near_miss_ratio  (near-misses / total observations)
 *   0.2 × open_action_rate (open actions = unresolved risk)
 *   0.1 × reporting_decline (declining observation trend = reduced visibility)
 */
export const calculatePSI = (incidents, hazardName) => {
  const hazardInc = filterByHazard(incidents, hazardName)
  const negativeInc = hazardInc.filter((i) => !isPositiveType(i.type))
  const allObservations = hazardInc.length

  if (allObservations === 0) {
    return {
      hazardName,
      psi: 0,
      factors: { incidentTrend: 0, nearMissRatio: 0, openActionRate: 0, reportingDecline: 0 },
      hasData: false,
    }
  }

  const dates = getSortedDates(negativeInc)

  // Factor 1: Incident trend (normalized slope of weekly counts → 0-100)
  let incidentTrendScore = 50 // neutral baseline
  if (dates.length >= 2) {
    const start = parseISO(dates[0])
    const end = parseISO(dates[dates.length - 1])
    const weeks = bucketWeeklyCounts(negativeInc, start, end)
    if (weeks.length >= 3) {
      const values = weeks.map((w) => w.count)
      const reg = calculateLinearRegression(values)
      // Normalize slope: positive slope = higher risk
      const avgCount = values.reduce((s, v) => s + v, 0) / values.length
      const normalizedSlope = avgCount > 0 ? (reg.slope / avgCount) * 100 : 0
      incidentTrendScore = Math.max(0, Math.min(100, 50 + normalizedSlope * 5))
    }
  }

  // Factor 2: Near-miss ratio (more near-misses relative to total = better reporting → lower risk)
  const nearMisses = hazardInc.filter(
    (i) => i.type?.toLowerCase() === 'near-miss' || i.type?.toLowerCase() === 'nearmiss'
  ).length
  const nearMissRatio = allObservations > 0 ? nearMisses / allObservations : 0
  // Higher near-miss ratio → better safety culture → LOWER PSI score
  // If ratio > 0.5, that's good → low score; if 0 near-misses → bad → high score
  const nearMissScore = Math.max(0, Math.min(100, 100 - nearMissRatio * 200))

  // Factor 3: Open action rate (open/in-progress actions = unresolved risk)
  const openActions = hazardInc.filter(isOpenAction).length
  const openActionRate = allObservations > 0 ? openActions / allObservations : 0
  const openActionScore = Math.min(100, openActionRate * 200) // 50% open → 100 score

  // Factor 4: Reporting decline (declining total observation trend)
  let reportingDeclineScore = 50
  const allDates = getSortedDates(hazardInc)
  if (allDates.length >= 2) {
    const start = parseISO(allDates[0])
    const end = parseISO(allDates[allDates.length - 1])
    const weeks = bucketWeeklyCounts(hazardInc, start, end)
    if (weeks.length >= 4) {
      const recent = weeks.slice(-4)
      const earlier = weeks.slice(-8, -4)
      if (earlier.length >= 2) {
        const recentAvg = recent.reduce((s, w) => s + w.count, 0) / recent.length
        const earlierAvg = earlier.reduce((s, w) => s + w.count, 0) / earlier.length
        // Declining reporting = higher risk (less visibility)
        if (earlierAvg > 0) {
          const changeRate = (recentAvg - earlierAvg) / earlierAvg
          reportingDeclineScore = Math.max(0, Math.min(100, 50 - changeRate * 50))
        }
      }
    }
  }

  // Weighted PSI
  const psi = Math.round(
    0.4 * incidentTrendScore +
    0.3 * nearMissScore +
    0.2 * openActionScore +
    0.1 * reportingDeclineScore
  )

  return {
    hazardName,
    psi: Math.max(0, Math.min(100, psi)),
    factors: {
      incidentTrend: Math.round(incidentTrendScore),
      nearMissRatio: Math.round(nearMissScore),
      openActionRate: Math.round(openActionScore),
      reportingDecline: Math.round(reportingDeclineScore),
    },
    nearMissRatio: Math.round(nearMissRatio * 100),
    openActionRate: Math.round(openActionRate * 100),
    totalIncidents: negativeInc.length,
    totalObservations: allObservations,
    hasData: true,
  }
}

/**
 * Calculate PSI for all hazards, sorted by PSI descending (worst first).
 */
export const calculateAllPSI = (incidents, hazards) => {
  if (!incidents?.length || !hazards?.length) return []
  return hazards
    .filter((h) => h.totalCount > 0 && !h.hasNoData)
    .map((h) => calculatePSI(incidents, h.name))
    .filter((p) => p.hasData)
    .sort((a, b) => b.psi - a.psi)
}

/**
 * Summary: average PSI + red/amber/green counts.
 */
export const getPSISummary = (psiData) => {
  if (!psiData?.length) {
    return { averagePSI: 0, red: 0, amber: 0, green: 0, total: 0 }
  }
  const avg = Math.round(psiData.reduce((s, p) => s + p.psi, 0) / psiData.length)
  return {
    averagePSI: avg,
    red: psiData.filter((p) => p.psi > 60).length,
    amber: psiData.filter((p) => p.psi > 30 && p.psi <= 60).length,
    green: psiData.filter((p) => p.psi <= 30).length,
    total: psiData.length,
  }
}
