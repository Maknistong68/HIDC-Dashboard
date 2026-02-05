/**
 * Predictive Analytics Calculations for HSE Dashboard
 * Provides insights, recommendations, and trend analysis
 */

import { parseISO, format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths, subDays, differenceInDays } from 'date-fns'
import { getContractorMetrics, getNearMissMetrics, getObservationsByHour, getObservationsByDayOfWeek } from './dataQualityCalculations'
import { MAJOR_HAZARDS, ALL_HAZARDS, ROOT_CAUSES } from './constants'
import { parseSentence, DEVIATION_INDICATORS } from './sentenceParser'
import { aggregateRootCausesForHazard, getObservationTypeStats, isPositiveType } from './rootCauseEngine'

// Re-export the new keyword-based root cause detection as extractDeviationsForHazard
// for backward compatibility with existing components
export { aggregateRootCausesForHazard as extractDeviationsForHazard }
export { getObservationTypeStats }

// ============================================================================
// RECOMMENDATIONS ENGINE (PRIMARY)
// ============================================================================

/**
 * Generate all recommendations sorted by priority
 * Returns priority-ordered array of recommendations
 * NOTE: Only includes predictive alerts (trending hazards, overdue actions)
 * Contractor and coverage alerts are handled in Data Control tab
 */
export const generateRecommendations = (incidents, qualityData = null) => {
  const recommendations = []

  // Get trending hazard alerts (predictive)
  const trendingAlerts = getTrendingHazardAlerts(incidents)
  recommendations.push(...trendingAlerts)

  // Get overdue action alerts (actionable)
  const overdueAlerts = getOverdueActionAlerts(incidents)
  recommendations.push(...overdueAlerts)

  // Sort by priority (HIGH first, then MEDIUM, then LOW)
  const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 }
  return recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
}

/**
 * Get contractor performance alerts
 * Contractors with quality score below threshold
 */
export const getContractorAlerts = (incidents, threshold = 50) => {
  const contractors = getContractorMetrics(incidents)
  const lowPerformers = contractors.filter(c => c.qualityScore < threshold && c.totalObs >= 5)

  if (lowPerformers.length === 0) return []

  const alerts = []

  // Group by severity
  const critical = lowPerformers.filter(c => c.qualityScore < 30)
  const warning = lowPerformers.filter(c => c.qualityScore >= 30 && c.qualityScore < 40)
  const attention = lowPerformers.filter(c => c.qualityScore >= 40 && c.qualityScore < threshold)

  if (critical.length > 0) {
    alerts.push({
      id: 'contractor-critical',
      type: 'contractor-alert',
      priority: 'HIGH',
      title: 'Critical Contractor Performance',
      message: `${critical.length} contractor${critical.length > 1 ? 's have' : ' has'} quality scores below 30%`,
      details: critical.map(c => `${c.name} (${c.qualityScore}%)`).join(', '),
      metric: critical.length,
      icon: 'AlertTriangle',
      actionLabel: 'Review Contractors',
      drillDownData: critical
    })
  }

  if (warning.length > 0 || attention.length > 0) {
    const allLow = [...warning, ...attention]
    alerts.push({
      id: 'contractor-warning',
      type: 'contractor-alert',
      priority: warning.length > 0 ? 'MEDIUM' : 'LOW',
      title: 'Contractor Performance Alert',
      message: `${allLow.length} contractor${allLow.length > 1 ? 's have' : ' has'} quality scores below ${threshold}%`,
      details: allLow.slice(0, 3).map(c => `${c.name} (${c.qualityScore}%)`).join(', ') + (allLow.length > 3 ? ` +${allLow.length - 3} more` : ''),
      metric: allLow.length,
      icon: 'Users',
      actionLabel: 'View Details',
      drillDownData: allLow
    })
  }

  return alerts
}

/**
 * Get coverage gap alerts
 * Shifts/days with low observation rates
 */
export const getCoverageGapAlerts = (incidents) => {
  const alerts = []

  // Check hourly coverage (day vs night shift)
  const hourData = getObservationsByHour(incidents)
  if (hourData.summary.hasTimeData) {
    const nightPct = parseFloat(hourData.summary.nightShiftPct)
    if (nightPct < 10) {
      alerts.push({
        id: 'coverage-night-critical',
        type: 'coverage-gap',
        priority: 'HIGH',
        title: 'Night Shift Coverage Gap',
        message: `Night shift (18:00-06:00) only has ${nightPct}% of observations`,
        details: `Day shift: ${hourData.summary.dayShift} obs, Night shift: ${hourData.summary.nightShift} obs`,
        metric: `${nightPct}%`,
        icon: 'Moon',
        actionLabel: 'Improve Coverage',
        drillDownData: { hourData, type: 'night-shift' }
      })
    } else if (nightPct < 20) {
      alerts.push({
        id: 'coverage-night-warning',
        type: 'coverage-gap',
        priority: 'MEDIUM',
        title: 'Night Shift Under-represented',
        message: `Night shift coverage at ${nightPct}% - below recommended 25%`,
        details: `Consider increasing night shift observations`,
        metric: `${nightPct}%`,
        icon: 'Moon',
        actionLabel: 'View Details',
        drillDownData: { hourData, type: 'night-shift' }
      })
    }
  }

  // Check day of week coverage
  const dayData = getObservationsByDayOfWeek(incidents)
  const weekdayGaps = dayData.filter(d => d.isGap && !d.isWeekend)

  if (weekdayGaps.length >= 3) {
    alerts.push({
      id: 'coverage-weekday-critical',
      type: 'coverage-gap',
      priority: 'HIGH',
      title: 'Multiple Weekday Coverage Gaps',
      message: `${weekdayGaps.length} weekdays have below-average observations`,
      details: weekdayGaps.map(d => `${d.day}: ${d.count} obs (${d.percentage}%)`).join(', '),
      metric: weekdayGaps.length,
      icon: 'Calendar',
      actionLabel: 'Review Schedule',
      drillDownData: { dayData, gaps: weekdayGaps }
    })
  } else if (weekdayGaps.length > 0) {
    alerts.push({
      id: 'coverage-weekday-warning',
      type: 'coverage-gap',
      priority: 'LOW',
      title: 'Weekday Coverage Gap',
      message: `${weekdayGaps.map(d => d.day).join(', ')} ${weekdayGaps.length > 1 ? 'have' : 'has'} low observation counts`,
      details: weekdayGaps.map(d => `${d.day}: ${d.percentage}%`).join(', '),
      metric: weekdayGaps.length,
      icon: 'Calendar',
      actionLabel: 'View Details',
      drillDownData: { dayData, gaps: weekdayGaps }
    })
  }

  return alerts
}

/**
 * Get trending hazard alerts
 * Hazards with significant increase (>20%)
 */
export const getTrendingHazardAlerts = (incidents, threshold = 20) => {
  const alerts = []
  const trending = getHazardTrending(incidents)

  // Filter to significant increases
  const increasing = trending.filter(h => h.trend === 'up' && h.changePercent >= threshold)

  if (increasing.length === 0) return []

  // Critical: Major hazards trending up significantly
  const majorHazardsTrending = increasing.filter(h => MAJOR_HAZARDS.includes(h.hazard))
  const otherHazardsTrending = increasing.filter(h => !MAJOR_HAZARDS.includes(h.hazard))

  if (majorHazardsTrending.length > 0) {
    const top = majorHazardsTrending[0]
    alerts.push({
      id: 'hazard-major-trending',
      type: 'trending-hazard',
      priority: 'HIGH',
      title: 'Major Hazard Trending Up',
      message: `${top.hazard} incidents up ${top.changePercent.toFixed(0)}% this period`,
      details: `Previous: ${top.previousCount}, Current: ${top.currentCount}`,
      metric: `+${top.changePercent.toFixed(0)}%`,
      icon: 'TrendingUp',
      actionLabel: 'Investigate',
      drillDownData: majorHazardsTrending
    })

    if (majorHazardsTrending.length > 1) {
      alerts.push({
        id: 'hazard-major-multiple',
        type: 'trending-hazard',
        priority: 'MEDIUM',
        title: 'Multiple Major Hazards Rising',
        message: `${majorHazardsTrending.length} major hazard categories showing increase`,
        details: majorHazardsTrending.slice(0, 3).map(h => h.hazard).join(', '),
        metric: majorHazardsTrending.length,
        icon: 'AlertTriangle',
        actionLabel: 'Review All',
        drillDownData: majorHazardsTrending
      })
    }
  }

  if (otherHazardsTrending.length > 0 && otherHazardsTrending[0].changePercent >= 50) {
    const top = otherHazardsTrending[0]
    alerts.push({
      id: 'hazard-other-trending',
      type: 'trending-hazard',
      priority: 'MEDIUM',
      title: 'Hazard Category Trending Up',
      message: `${top.hazard} up ${top.changePercent.toFixed(0)}% - monitor closely`,
      details: `Previous: ${top.previousCount}, Current: ${top.currentCount}`,
      metric: `+${top.changePercent.toFixed(0)}%`,
      icon: 'TrendingUp',
      actionLabel: 'View Trend',
      drillDownData: otherHazardsTrending
    })
  }

  return alerts
}

/**
 * Get overdue action alerts
 * Observations open longer than threshold
 */
export const getOverdueActionAlerts = (incidents, daysThreshold = 30) => {
  const alerts = []
  const today = new Date()

  // Filter to open observations
  const openObservations = incidents.filter(i =>
    i.actionStatus === 'open' || i.actionStatus === 'in-progress'
  )

  // Calculate age for each
  const withAge = openObservations.map(obs => {
    const obsDate = obs.date ? parseISO(obs.date.substring(0, 10)) : null
    const age = obsDate ? differenceInDays(today, obsDate) : 0
    return { ...obs, age }
  })

  // Group by age threshold
  const critical = withAge.filter(o => o.age > 60)
  const warning = withAge.filter(o => o.age > 30 && o.age <= 60)
  // Attention: approaching threshold (14 days to threshold)
  const attentionThreshold = Math.max(14, daysThreshold - 16)
  const attention = withAge.filter(o => o.age >= attentionThreshold && o.age <= 30)

  if (critical.length > 0) {
    alerts.push({
      id: 'overdue-critical',
      type: 'overdue-action',
      priority: 'HIGH',
      title: 'Critical Overdue Actions',
      message: `${critical.length} observation${critical.length > 1 ? 's' : ''} open > 60 days`,
      details: `Oldest: ${Math.max(...critical.map(o => o.age))} days`,
      metric: critical.length,
      icon: 'Clock',
      actionLabel: 'Review Now',
      drillDownData: critical.sort((a, b) => b.age - a.age)
    })
  }

  if (warning.length > 0) {
    alerts.push({
      id: 'overdue-warning',
      type: 'overdue-action',
      priority: 'MEDIUM',
      title: 'Overdue Actions (30-60 days)',
      message: `${warning.length} observation${warning.length > 1 ? 's' : ''} need attention`,
      details: `Average age: ${Math.round(warning.reduce((sum, o) => sum + o.age, 0) / warning.length)} days`,
      metric: warning.length,
      icon: 'Clock',
      actionLabel: 'View List',
      drillDownData: warning.sort((a, b) => b.age - a.age)
    })
  }

  if (attention.length > 0) {
    alerts.push({
      id: 'overdue-attention',
      type: 'overdue-action',
      priority: 'LOW',
      title: 'Actions Approaching Overdue',
      message: `${attention.length} observation${attention.length > 1 ? 's' : ''} approaching 30-day limit`,
      details: 'Address these soon to prevent escalation',
      metric: attention.length,
      icon: 'AlertCircle',
      actionLabel: 'View List',
      drillDownData: attention.sort((a, b) => b.age - a.age)
    })
  }

  return alerts
}

// ============================================================================
// ROOT CAUSE ANALYSIS
// ============================================================================

/**
 * Get root cause breakdown distribution
 */
export const getRootCauseBreakdown = (incidents) => {
  const rootCauseCounts = {}

  incidents.forEach(incident => {
    const rootCause = incident.rootCause || 'Not Specified'
    rootCauseCounts[rootCause] = (rootCauseCounts[rootCause] || 0) + 1
  })

  const total = incidents.length
  const breakdown = Object.entries(rootCauseCounts)
    .map(([name, count]) => ({
      name,
      count,
      percentage: total > 0 ? ((count / total) * 100).toFixed(1) : '0.0',
      color: getRootCauseColor(name)
    }))
    .sort((a, b) => b.count - a.count)

  return {
    breakdown,
    total,
    topCause: breakdown[0] || null,
    hasData: breakdown.some(b => b.name !== 'Not Specified' && b.count > 0)
  }
}

/**
 * Get root cause by hazard correlation matrix
 */
export const getRootCauseByHazard = (incidents) => {
  // Get unique hazards and root causes
  const hazards = [...new Set(incidents.map(i => i.location || 'Unspecified'))]
    .filter(h => h !== 'Unspecified')
    .slice(0, 10) // Top 10 hazards

  const rootCauses = [...new Set(incidents.map(i => i.rootCause || 'Not Specified'))]
    .filter(r => r !== 'Not Specified')
    .slice(0, 8) // Top 8 root causes

  // Build matrix
  const matrix = hazards.map(hazard => {
    const hazardIncidents = incidents.filter(i => i.location === hazard)
    const total = hazardIncidents.length

    const row = { hazard, total }
    rootCauses.forEach(cause => {
      const count = hazardIncidents.filter(i => i.rootCause === cause).length
      row[cause] = count
      row[`${cause}_pct`] = total > 0 ? ((count / total) * 100).toFixed(0) : '0'
    })

    return row
  })

  return {
    matrix,
    hazards,
    rootCauses,
    hasData: matrix.length > 0 && rootCauses.length > 0
  }
}

/**
 * Get root cause trends over time
 */
export const getRootCauseTrends = (incidents, months = 12) => {
  if (incidents.length === 0) return { trends: [], rootCauses: [], hasData: false }

  // Get date range from actual data
  const dates = incidents.map(i => i.date).filter(Boolean).sort()
  if (dates.length === 0) return { trends: [], rootCauses: [], hasData: false }

  const endDate = parseISO(dates[dates.length - 1])
  const startDate = subMonths(endDate, months - 1)

  const monthsInRange = eachMonthOfInterval({
    start: startOfMonth(startDate),
    end: endOfMonth(endDate)
  })

  // Get top root causes
  const rootCauseCounts = {}
  incidents.forEach(i => {
    const rc = i.rootCause || 'Not Specified'
    if (rc !== 'Not Specified') {
      rootCauseCounts[rc] = (rootCauseCounts[rc] || 0) + 1
    }
  })

  const topRootCauses = Object.entries(rootCauseCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => name)

  // Build trend data
  const trends = monthsInRange.map(monthStart => {
    const monthStr = format(monthStart, 'yyyy-MM')
    const monthLabel = format(monthStart, 'MMM yy')

    const monthIncidents = incidents.filter(i => {
      if (!i.date) return false
      return i.date.substring(0, 7) === monthStr
    })

    const dataPoint = { month: monthLabel, monthKey: monthStr, total: monthIncidents.length }

    topRootCauses.forEach(cause => {
      dataPoint[cause] = monthIncidents.filter(i => i.rootCause === cause).length
    })

    return dataPoint
  })

  return {
    trends,
    rootCauses: topRootCauses,
    hasData: topRootCauses.length > 0
  }
}

// ============================================================================
// LEADING INDICATORS
// ============================================================================

/**
 * Get near miss analysis with benchmark comparison
 */
export const getNearMissAnalysis = (incidents) => {
  const metrics = getNearMissMetrics(incidents)
  const rate = parseFloat(metrics.rate)
  const benchmark = 5 // Industry benchmark: 5%

  let status = 'good'
  let message = 'Near-miss reporting exceeds industry benchmark'

  if (rate < 2) {
    status = 'critical'
    message = 'Near-miss reporting significantly below benchmark - possible underreporting'
  } else if (rate < benchmark) {
    status = 'warning'
    message = 'Near-miss rate below industry benchmark'
  }

  return {
    ...metrics,
    benchmark,
    rateValue: rate,
    gaugePercent: Math.min((rate / benchmark) * 100, 150), // Cap at 150% for gauge display
    status,
    message,
    gap: Math.max(0, benchmark - rate).toFixed(1),
    isAboveBenchmark: rate >= benchmark
  }
}

/**
 * Calculate trend direction over periods
 * Returns: improving, worsening, stable
 */
export const getTrendDirection = (dataPoints, field = 'value', periods = 3) => {
  if (!dataPoints || dataPoints.length < 2) {
    return { direction: 'stable', change: 0, confidence: 'low' }
  }

  const recent = dataPoints.slice(-periods)
  if (recent.length < 2) {
    return { direction: 'stable', change: 0, confidence: 'low' }
  }

  const values = recent.map(d => typeof d === 'object' ? d[field] : d).filter(v => !isNaN(v))
  if (values.length < 2) {
    return { direction: 'stable', change: 0, confidence: 'low' }
  }

  // Calculate simple linear regression slope
  const n = values.length
  const sumX = (n * (n - 1)) / 2
  const sumY = values.reduce((a, b) => a + b, 0)
  const sumXY = values.reduce((sum, val, i) => sum + i * val, 0)
  const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6

  const denominator = n * sumX2 - sumX * sumX
  const slope = denominator !== 0 ? (n * sumXY - sumX * sumY) / denominator : 0
  const avgValue = sumY / n
  const percentChange = avgValue !== 0 ? (slope / avgValue) * 100 : 0

  let direction = 'stable'
  if (percentChange > 5) direction = 'worsening'
  else if (percentChange < -5) direction = 'improving'

  return {
    direction,
    change: percentChange.toFixed(1),
    confidence: n >= 3 ? 'high' : 'medium',
    values
  }
}

/**
 * Get composite trend analysis
 */
export const getCompositeTrends = (incidents) => {
  // Get monthly data for trending
  const dates = incidents.map(i => i.date).filter(Boolean).sort()
  if (dates.length === 0) {
    return { quality: null, incidents: null, coverage: null }
  }

  const endDate = parseISO(dates[dates.length - 1])
  const startDate = subMonths(endDate, 5)

  const monthsInRange = eachMonthOfInterval({
    start: startOfMonth(startDate),
    end: endOfMonth(endDate)
  })

  // Calculate monthly metrics
  const monthlyData = monthsInRange.map(monthStart => {
    const monthStr = format(monthStart, 'yyyy-MM')
    const monthIncidents = incidents.filter(i =>
      i.date && i.date.substring(0, 7) === monthStr
    )

    const nearMiss = getNearMissMetrics(monthIncidents)

    return {
      month: format(monthStart, 'MMM'),
      incidentCount: monthIncidents.length,
      nearMissRate: parseFloat(nearMiss.rate)
    }
  })

  // Calculate trends
  const incidentTrend = getTrendDirection(monthlyData, 'incidentCount')
  const nearMissTrend = getTrendDirection(monthlyData, 'nearMissRate')

  return {
    incidents: {
      ...incidentTrend,
      label: 'Observation Volume',
      isGood: incidentTrend.direction !== 'worsening'
    },
    nearMiss: {
      ...nearMissTrend,
      label: 'Near-Miss Rate',
      isGood: nearMissTrend.direction !== 'worsening'
    },
    monthlyData
  }
}

// ============================================================================
// RISK CONCENTRATION
// ============================================================================

/**
 * Get hazards with trend direction
 */
export const getHazardTrending = (incidents) => {
  const dates = incidents.map(i => i.date).filter(Boolean).sort()
  if (dates.length === 0) return []

  const endDate = parseISO(dates[dates.length - 1])
  const midDate = subMonths(endDate, 1)
  const startDate = subMonths(endDate, 2)

  // Split into previous period vs current period
  const previousPeriod = incidents.filter(i => {
    if (!i.date) return false
    const d = parseISO(i.date.substring(0, 10))
    return d >= startDate && d < midDate
  })

  const currentPeriod = incidents.filter(i => {
    if (!i.date) return false
    const d = parseISO(i.date.substring(0, 10))
    return d >= midDate && d <= endDate
  })

  // Count by hazard for each period
  const previousCounts = {}
  previousPeriod.forEach(i => {
    const h = i.location || 'Unspecified'
    previousCounts[h] = (previousCounts[h] || 0) + 1
  })

  const currentCounts = {}
  currentPeriod.forEach(i => {
    const h = i.location || 'Unspecified'
    currentCounts[h] = (currentCounts[h] || 0) + 1
  })

  // All hazards
  const allHazards = new Set([...Object.keys(previousCounts), ...Object.keys(currentCounts)])

  const trending = [...allHazards].map(hazard => {
    const prev = previousCounts[hazard] || 0
    const curr = currentCounts[hazard] || 0

    let trend = 'stable'
    let changePercent = 0

    if (prev > 0) {
      changePercent = ((curr - prev) / prev) * 100
      if (changePercent > 10) trend = 'up'
      else if (changePercent < -10) trend = 'down'
    } else if (curr > 0) {
      trend = 'up'
      changePercent = 100
    }

    return {
      hazard,
      previousCount: prev,
      currentCount: curr,
      totalCount: prev + curr,
      trend,
      changePercent,
      isMajor: MAJOR_HAZARDS.includes(hazard)
    }
  })

  // Sort by current count descending
  return trending
    .filter(h => h.hazard !== 'Unspecified')
    .sort((a, b) => b.currentCount - a.currentCount)
}

/**
 * Get performance outliers
 * Contractors/reporters below threshold
 */
export const getPerformanceOutliers = (incidents, threshold = 50) => {
  const contractors = getContractorMetrics(incidents)

  // Contractors below threshold with minimum observations
  const outliers = contractors
    .filter(c => c.qualityScore < threshold && c.totalObs >= 5)
    .map(c => ({
      name: c.name,
      type: 'contractor',
      score: c.qualityScore,
      observations: c.totalObs,
      categorizationRate: c.categorizationRate,
      qualityRate: c.qualityRate,
      nearMissRate: c.nearMissRate,
      status: c.qualityScore < 30 ? 'critical' : c.qualityScore < 40 ? 'warning' : 'attention'
    }))
    .sort((a, b) => a.score - b.score)

  return {
    outliers,
    count: outliers.length,
    criticalCount: outliers.filter(o => o.status === 'critical').length,
    warningCount: outliers.filter(o => o.status === 'warning').length
  }
}

// ============================================================================
// OVERALL METRICS
// ============================================================================

/**
 * Calculate overall risk score (composite)
 * Based on observation-based metrics focused on Major Hazards (14 Significant Hazards)
 * All factors use RATES (not counts) to be size-bias free across companies
 */
export const calculateRiskScore = (incidents) => {
  if (incidents.length === 0) return { score: 0, level: 'unknown', factors: [] }

  const factors = []
  let totalWeight = 0
  let weightedSum = 0
  const now = new Date()

  // Helper: calculate days since observation date
  const getDaysSince = (dateStr) => {
    if (!dateStr) return Infinity
    try {
      const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr
      return differenceInDays(now, date)
    } catch {
      return Infinity
    }
  }

  // Helper: check if observation is high-risk (based on 14 significant hazards)
  const isHighRisk = (incident) =>
    MAJOR_HAZARDS.includes(incident.hazardCategory) || MAJOR_HAZARDS.includes(incident.location)

  // Split observations into periods (30 days each) for trend analysis
  const currentPeriodObs = incidents.filter(i => getDaysSince(i.date) <= 30)
  const previousPeriodObs = incidents.filter(i => getDaysSince(i.date) > 30 && getDaysSince(i.date) <= 60)

  // High-risk observations for each period
  const currentHighRisk = currentPeriodObs.filter(isHighRisk)
  const previousHighRisk = previousPeriodObs.filter(isHighRisk)

  // All high-risk observations (for factors 3 & 4)
  const allHighRiskObs = incidents.filter(isHighRisk)
  const totalHighRisk = allHighRiskObs.length

  // Factor 1: Near-Miss Reporting (weight: 25)
  const nearMiss = getNearMissAnalysis(incidents)
  const nmScore = Math.min(100, (nearMiss.rateValue / 5) * 100)
  factors.push({ name: 'Near-Miss Reporting', score: nmScore, weight: 25, status: nearMiss.status })
  weightedSum += nmScore * 25
  totalWeight += 25

  // Factor 2: High-Risk Trend (weight: 25) - SIZE-BIAS FREE using rates
  // Compares current period rate vs previous period rate
  // Improvement (decreasing rate) = good score
  const currentRate = currentPeriodObs.length >= 5
    ? (currentHighRisk.length / currentPeriodObs.length) * 100
    : null
  const previousRate = previousPeriodObs.length >= 5
    ? (previousHighRisk.length / previousPeriodObs.length) * 100
    : null

  let trendScore = 50 // Default: neutral
  let trendStatus = 'good'
  let trendDetail = ''

  if (currentRate !== null && previousRate !== null) {
    // Both periods have sufficient data - calculate trend
    const rateChange = previousRate - currentRate // Positive = improvement
    // +10% improvement = 100, 0% = 50, -10% worsening = 0
    trendScore = Math.max(0, Math.min(100, 50 + (rateChange * 5)))
    trendStatus = rateChange > 2 ? 'good' : rateChange < -2 ? 'critical' : 'warning'
    trendDetail = rateChange >= 0
      ? `${Math.abs(rateChange).toFixed(1)}% improvement`
      : `${Math.abs(rateChange).toFixed(1)}% increase`
  } else if (currentRate !== null) {
    // Only current period has data - use absolute rate vs benchmark (30% is neutral)
    trendScore = Math.max(0, Math.min(100, 100 - (currentRate * 1.67))) // 0% = 100, 60% = 0
    trendStatus = currentRate > 40 ? 'critical' : currentRate > 25 ? 'warning' : 'good'
    trendDetail = `${currentRate.toFixed(1)}% current rate`
  } else {
    // Insufficient data
    trendScore = 50
    trendStatus = 'warning'
    trendDetail = 'Insufficient data'
  }

  factors.push({
    name: 'High-Risk Trend',
    score: Math.round(trendScore),
    weight: 25,
    status: trendStatus,
    detail: trendDetail
  })
  weightedSum += trendScore * 25
  totalWeight += 25

  // Factor 3: High-Risk Closure Rate (weight: 25)
  // Higher closure rate is better
  const closedHighRisk = allHighRiskObs.filter(i => i.actionStatus === 'closed').length
  const closureRate = totalHighRisk > 0 ? (closedHighRisk / totalHighRisk) * 100 : 100
  factors.push({
    name: 'High-Risk Closure',
    score: Math.round(closureRate),
    weight: 25,
    status: closureRate < 50 ? 'critical' : closureRate < 70 ? 'warning' : 'good',
    detail: `${closedHighRisk} of ${totalHighRisk} closed`
  })
  weightedSum += closureRate * 25
  totalWeight += 25

  // Factor 4: Positive High-Risk Rate (weight: 25)
  // Higher positive rate indicates proactive safety culture
  const positiveHighRisk = allHighRiskObs.filter(i => isPositiveType(i.type)).length
  const positiveRate = totalHighRisk > 0 ? (positiveHighRisk / totalHighRisk) * 100 : 0
  const positiveScore = Math.min(100, positiveRate * 2) // Boost: 50% positive = 100 score
  factors.push({
    name: 'Positive High-Risk',
    score: Math.round(positiveScore),
    weight: 25,
    status: positiveRate < 10 ? 'critical' : positiveRate < 25 ? 'warning' : 'good',
    detail: `${positiveHighRisk} positive observations`
  })
  weightedSum += positiveScore * 25
  totalWeight += 25

  const score = Math.round(weightedSum / totalWeight)

  let level = 'good'
  if (score < 50) level = 'critical'
  else if (score < 70) level = 'warning'

  return { score, level, factors }
}

/**
 * Get count of pending action items (recommendations)
 */
export const getActionItemsCount = (incidents) => {
  const recommendations = generateRecommendations(incidents)
  return {
    total: recommendations.length,
    high: recommendations.filter(r => r.priority === 'HIGH').length,
    medium: recommendations.filter(r => r.priority === 'MEDIUM').length,
    low: recommendations.filter(r => r.priority === 'LOW').length
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// ============================================================================
// PHASE 1: PREDICTIVE FORECASTING
// ============================================================================

/**
 * PREDICTION_CONFIG - Documented configuration for all prediction parameters
 * All hardcoded values are centralized here with documented sources
 *
 * Changing these values will affect prediction accuracy and reliability.
 * Modifications should be validated against historical data.
 */
export const PREDICTION_CONFIG = {
  // Exponential decay factor for time-weighted calculations
  // Higher values (0.5+) weight recent data more heavily
  // Lower values (0.2-0.3) give more weight to historical patterns
  // Source: Standard time-series weighting practice; 0.4 balances recency vs stability
  DECAY_ALPHA: 0.4,

  // Near-miss rate benchmark (% of total observations)
  // Industry benchmark based on Heinrich's Triangle (300:29:1 ratio)
  // At least 5% of observations should be near-misses for healthy reporting
  // Source: Herbert W. Heinrich, Industrial Accident Prevention (1931)
  NEAR_MISS_BENCHMARK: 0.05,

  // Minimum data points for reliable forecasting
  // Statistical best practice recommends n > 30 for regression
  // 14 days is a practical minimum for daily incident forecasting
  // Source: Statistical sampling theory; adjusted for operational practicality
  MIN_FORECAST_DAYS: 14,

  // Minimum observations before forecasting is considered reliable
  // Source: Statistical best practice for meaningful analysis
  MIN_OBSERVATIONS: 10,

  // Trend detection thresholds (percentage change)
  // Source: Industry standard for safety metric significance
  TREND_THRESHOLDS: {
    SIGNIFICANT: 30,  // Major change requiring immediate attention
    MINOR: 10         // Notable change worth monitoring
  },

  // Confidence intervals for R-squared interpretation
  // Source: Statistical convention for regression analysis
  CONFIDENCE_THRESHOLDS: {
    HIGH: 0.7,    // Strong predictive relationship
    MEDIUM: 0.4   // Moderate predictive relationship
  },

  // Warning/critical thresholds for forecast alerts
  // Source: Industry standard for safety escalation
  ALERT_THRESHOLDS: {
    WARNING_MULTIPLIER: 1.5,   // 50% above average triggers warning
    CRITICAL_MULTIPLIER: 2.0  // 100% above average triggers critical
  }
}

/**
 * Linear regression forecasting
 * Uses least squares method to fit a line and project future values
 */
export const forecastIncidents = (incidents, forecastDays = 30) => {
  // Group incidents by date
  const dates = incidents.map(i => i.date).filter(Boolean).sort()

  // Use configured minimum instead of hardcoded 7
  if (dates.length < PREDICTION_CONFIG.MIN_FORECAST_DAYS) {
    return {
      historical: [],
      forecast: [],
      model: null,
      alerts: [],
      error: `Insufficient data for forecasting (need at least ${PREDICTION_CONFIG.MIN_FORECAST_DAYS} days)`,
      warning: dates.length >= 7 ? 'Low data: predictions may be unreliable' : null
    }
  }

  // Get date range
  const endDate = parseISO(dates[dates.length - 1])
  const startDate = subMonths(endDate, 3)

  // Count incidents per day
  const dailyCounts = {}
  incidents.forEach(i => {
    if (!i.date) return
    const dateKey = i.date.substring(0, 10)
    const d = parseISO(dateKey)
    if (d >= startDate && d <= endDate) {
      dailyCounts[dateKey] = (dailyCounts[dateKey] || 0) + 1
    }
  })

  // Build historical data array (last 90 days)
  const historical = []
  let currentDate = startDate
  while (currentDate <= endDate) {
    const dateKey = format(currentDate, 'yyyy-MM-dd')
    historical.push({
      date: dateKey,
      dateLabel: format(currentDate, 'MMM dd'),
      value: dailyCounts[dateKey] || 0,
      type: 'historical'
    })
    currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000)
  }

  // Calculate linear regression
  const n = historical.length
  const values = historical.map(h => h.value)

  // x = day index (0, 1, 2, ...), y = incident count
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0
  for (let i = 0; i < n; i++) {
    sumX += i
    sumY += values[i]
    sumXY += i * values[i]
    sumX2 += i * i
  }

  const denominator = n * sumX2 - sumX * sumX
  const slope = denominator !== 0 ? (n * sumXY - sumX * sumY) / denominator : 0
  const intercept = n > 0 ? (sumY - slope * sumX) / n : 0

  // Calculate R-squared
  const meanY = sumY / n
  let ssTotal = 0, ssResidual = 0
  for (let i = 0; i < n; i++) {
    const predicted = slope * i + intercept
    ssTotal += Math.pow(values[i] - meanY, 2)
    ssResidual += Math.pow(values[i] - predicted, 2)
  }
  const rSquared = ssTotal > 0 ? 1 - (ssResidual / ssTotal) : 0

  // Calculate standard error for confidence bands
  const standardError = Math.sqrt(ssResidual / (n - 2))
  const tValue = 1.96 // 95% confidence

  // Generate forecast
  const forecast = []
  for (let i = 0; i < forecastDays; i++) {
    const dayIndex = n + i
    const forecastDate = new Date(endDate.getTime() + (i + 1) * 24 * 60 * 60 * 1000)
    const predicted = Math.max(0, slope * dayIndex + intercept)
    const margin = tValue * standardError * Math.sqrt(1 + 1/n + Math.pow(dayIndex - sumX/n, 2) / (sumX2 - sumX*sumX/n))

    forecast.push({
      date: format(forecastDate, 'yyyy-MM-dd'),
      dateLabel: format(forecastDate, 'MMM dd'),
      value: Math.round(predicted * 10) / 10,
      upper: Math.round((predicted + margin) * 10) / 10,
      lower: Math.max(0, Math.round((predicted - margin) * 10) / 10),
      type: 'forecast'
    })
  }

  // Detect alerts (forecast exceeds thresholds)
  const avgDaily = sumY / n
  const alerts = detectForecastAlerts(forecast, avgDaily)

  return {
    historical,
    forecast,
    model: {
      slope: Math.round(slope * 1000) / 1000,
      intercept: Math.round(intercept * 100) / 100,
      rSquared: Math.round(rSquared * 100) / 100,
      trend: slope > 0.05 ? 'increasing' : slope < -0.05 ? 'decreasing' : 'stable',
      dailyChange: Math.round(slope * 100) / 100
    },
    alerts,
    summary: {
      avgHistorical: Math.round(avgDaily * 10) / 10,
      avgForecast: Math.round(forecast.reduce((sum, f) => sum + f.value, 0) / forecast.length * 10) / 10,
      confidence: rSquared > 0.7 ? 'high' : rSquared > 0.4 ? 'medium' : 'low'
    }
  }
}

/**
 * Exponential smoothing for trend-aware forecasting
 * Better for data with recent changes being more important
 */
export const exponentialSmoothingForecast = (incidents, alpha = 0.3) => {
  const dates = incidents.map(i => i.date).filter(Boolean).sort()
  if (dates.length < 14) {
    return { smoothedTrend: [], forecast: null, seasonality: null }
  }

  const endDate = parseISO(dates[dates.length - 1])
  const startDate = subMonths(endDate, 2)

  // Weekly aggregation for smoothing
  const weeklyCounts = {}
  incidents.forEach(i => {
    if (!i.date) return
    const d = parseISO(i.date.substring(0, 10))
    if (d >= startDate && d <= endDate) {
      const weekStart = format(startOfMonth(d), 'yyyy-MM-dd')
      weeklyCounts[weekStart] = (weeklyCounts[weekStart] || 0) + 1
    }
  })

  const weeks = Object.entries(weeklyCounts)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([week, count]) => ({ week, count }))

  if (weeks.length < 3) {
    return { smoothedTrend: [], forecast: null, seasonality: null }
  }

  // Apply exponential smoothing
  const smoothed = [weeks[0].count]
  for (let i = 1; i < weeks.length; i++) {
    smoothed.push(alpha * weeks[i].count + (1 - alpha) * smoothed[i - 1])
  }

  // Forecast next period
  const lastSmoothed = smoothed[smoothed.length - 1]
  const trend = smoothed.length > 1 ? smoothed[smoothed.length - 1] - smoothed[smoothed.length - 2] : 0

  return {
    smoothedTrend: weeks.map((w, i) => ({
      period: w.week,
      actual: w.count,
      smoothed: Math.round(smoothed[i] * 10) / 10
    })),
    forecast: {
      nextPeriod: Math.round((lastSmoothed + trend) * 10) / 10,
      trend: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable'
    },
    seasonality: null // Could add day-of-week seasonality detection
  }
}

/**
 * Detect alerts when forecast exceeds critical thresholds
 */
export const detectForecastAlerts = (forecast, avgDaily) => {
  const alerts = []
  const warningThreshold = avgDaily * 1.5 // 50% above average
  const criticalThreshold = avgDaily * 2.0 // 100% above average

  // Find first breach dates
  const firstWarning = forecast.find(f => f.value >= warningThreshold)
  const firstCritical = forecast.find(f => f.value >= criticalThreshold)

  // Count days exceeding thresholds
  const warningDays = forecast.filter(f => f.value >= warningThreshold && f.value < criticalThreshold).length
  const criticalDays = forecast.filter(f => f.value >= criticalThreshold).length

  if (firstCritical) {
    alerts.push({
      type: 'critical',
      message: `Forecast exceeds critical threshold (2x average) starting ${firstCritical.dateLabel}`,
      daysUntil: forecast.indexOf(firstCritical) + 1,
      affectedDays: criticalDays,
      threshold: Math.round(criticalThreshold * 10) / 10
    })
  }

  if (firstWarning && !firstCritical) {
    alerts.push({
      type: 'warning',
      message: `Forecast exceeds warning threshold (1.5x average) starting ${firstWarning.dateLabel}`,
      daysUntil: forecast.indexOf(firstWarning) + 1,
      affectedDays: warningDays,
      threshold: Math.round(warningThreshold * 10) / 10
    })
  }

  // Trend alert
  const firstHalf = forecast.slice(0, Math.floor(forecast.length / 2))
  const secondHalf = forecast.slice(Math.floor(forecast.length / 2))
  const firstAvg = firstHalf.reduce((s, f) => s + f.value, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((s, f) => s + f.value, 0) / secondHalf.length

  if (secondAvg > firstAvg * 1.3) {
    alerts.push({
      type: 'trend',
      message: 'Forecast shows accelerating upward trend',
      increase: Math.round(((secondAvg - firstAvg) / firstAvg) * 100)
    })
  }

  return alerts
}

// ============================================================================
// INCIDENT PREDICTION (Weekly/Monthly Forecasting + Type Probability)
// ============================================================================

/**
 * Forecast incidents by period (week or month)
 * Aggregates daily forecasts into weekly (7-day) or monthly (30-day) periods
 * Returns predicted counts with confidence ranges
 */
export const forecastIncidentsByPeriod = (incidents, period = 'week', periodsAhead = 1) => {
  const daysPerPeriod = period === 'week' ? 7 : 30
  const forecastDays = daysPerPeriod * periodsAhead

  // Get the base daily forecast
  const baseForecast = forecastIncidents(incidents, forecastDays)

  if (baseForecast.error || !baseForecast.forecast || baseForecast.forecast.length === 0) {
    return {
      period,
      periodsAhead,
      predictions: [],
      error: baseForecast.error || 'Insufficient data for forecasting'
    }
  }

  const { forecast, historical, model, summary } = baseForecast

  // Calculate historical averages for comparison
  const historicalTotal = historical.reduce((sum, h) => sum + h.value, 0)
  const historicalAvgPerPeriod = (historicalTotal / historical.length) * daysPerPeriod

  // Aggregate forecasts into periods
  const predictions = []
  for (let p = 0; p < periodsAhead; p++) {
    const periodStart = p * daysPerPeriod
    const periodEnd = Math.min((p + 1) * daysPerPeriod, forecast.length)
    const periodForecasts = forecast.slice(periodStart, periodEnd)

    if (periodForecasts.length === 0) continue

    const predictedTotal = periodForecasts.reduce((sum, f) => sum + f.value, 0)
    const upperTotal = periodForecasts.reduce((sum, f) => sum + f.upper, 0)
    const lowerTotal = periodForecasts.reduce((sum, f) => sum + f.lower, 0)

    // Calculate trend vs historical
    const changeFromHistorical = historicalAvgPerPeriod > 0
      ? ((predictedTotal - historicalAvgPerPeriod) / historicalAvgPerPeriod) * 100
      : 0

    let trend = 'stable'
    if (changeFromHistorical > 10) trend = 'increasing'
    else if (changeFromHistorical < -10) trend = 'decreasing'

    // Confidence based on R-squared and period distance
    let confidence = summary?.confidence || 'low'
    if (p > 1 && confidence === 'high') confidence = 'medium'
    if (p > 2) confidence = 'low'

    predictions.push({
      periodIndex: p + 1,
      periodLabel: period === 'week'
        ? `Week ${p + 1}`
        : `Month ${p + 1}`,
      startDate: periodForecasts[0]?.date,
      endDate: periodForecasts[periodForecasts.length - 1]?.date,
      predicted: Math.round(predictedTotal),
      upper: Math.round(upperTotal),
      lower: Math.round(lowerTotal),
      historical: Math.round(historicalAvgPerPeriod),
      changePercent: Math.round(changeFromHistorical),
      trend,
      confidence,
      daysIncluded: periodForecasts.length
    })
  }

  return {
    period,
    periodsAhead,
    predictions,
    model,
    summary: {
      ...summary,
      historicalAvgPerPeriod: Math.round(historicalAvgPerPeriod * 10) / 10
    }
  }
}

/**
 * Predict incident type probabilities using weighted moving average
 * Uses exponential decay weighting (recent months weighted higher)
 * Returns LTI/MTI/FAC probability breakdown
 *
 * Configuration: Uses PREDICTION_CONFIG.DECAY_ALPHA for time weighting
 */
export const predictIncidentTypeProbability = (incidents, lookbackMonths = 6) => {
  const dates = incidents.map(i => i.date).filter(Boolean).sort()
  if (dates.length < PREDICTION_CONFIG.MIN_OBSERVATIONS) {
    return {
      types: [],
      hasData: false,
      error: `Insufficient data for type prediction (need at least ${PREDICTION_CONFIG.MIN_OBSERVATIONS} observations)`
    }
  }

  const endDate = parseISO(dates[dates.length - 1])
  // Use configured decay factor instead of hardcoded value
  const alpha = PREDICTION_CONFIG.DECAY_ALPHA

  // Define incident types with severity weights
  const typeConfig = {
    'lti': { label: 'LTI (Lost Time Injury)', severity: 10, color: '#dc2626' },
    'mti': { label: 'MTI (Medical Treatment)', severity: 5, color: '#f59e0b' },
    'fac': { label: 'FAC (First Aid Case)', severity: 2, color: '#22c55e' },
    'near-miss': { label: 'Near Miss', severity: 1, color: '#3b82f6' }
  }

  // Calculate monthly type counts
  const monthlyTypeCounts = []
  for (let m = 0; m < lookbackMonths; m++) {
    const monthStart = startOfMonth(subMonths(endDate, m))
    const monthEnd = endOfMonth(monthStart)
    const monthStr = format(monthStart, 'yyyy-MM')

    const monthIncidents = incidents.filter(i => {
      if (!i.date) return false
      return i.date.substring(0, 7) === monthStr
    })

    const typeCounts = {}
    Object.keys(typeConfig).forEach(type => {
      typeCounts[type] = monthIncidents.filter(i => i.type === type).length
    })

    monthlyTypeCounts.push({
      month: monthStr,
      monthsAgo: m,
      weight: Math.pow(1 - alpha, m), // Exponential decay
      total: monthIncidents.length,
      ...typeCounts
    })
  }

  if (monthlyTypeCounts.every(m => m.total === 0)) {
    return {
      types: [],
      hasData: false,
      error: 'No incident type data available'
    }
  }

  // Calculate weighted averages for each type
  const totalWeight = monthlyTypeCounts.reduce((sum, m) => sum + m.weight, 0)
  const weightedCounts = {}

  Object.keys(typeConfig).forEach(type => {
    weightedCounts[type] = monthlyTypeCounts.reduce((sum, m) => {
      return sum + (m[type] * m.weight)
    }, 0) / totalWeight
  })

  // Calculate total weighted count
  const totalWeightedCount = Object.values(weightedCounts).reduce((a, b) => a + b, 0)

  // Detect trends per type (compare first half vs second half of period)
  const midPoint = Math.floor(lookbackMonths / 2)
  const recentMonths = monthlyTypeCounts.filter(m => m.monthsAgo < midPoint)
  const olderMonths = monthlyTypeCounts.filter(m => m.monthsAgo >= midPoint)

  const typeTrends = {}
  Object.keys(typeConfig).forEach(type => {
    const recentAvg = recentMonths.reduce((sum, m) => sum + m[type], 0) / recentMonths.length
    const olderAvg = olderMonths.reduce((sum, m) => sum + m[type], 0) / Math.max(1, olderMonths.length)

    const change = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : (recentAvg > 0 ? 100 : 0)

    // Use configured thresholds instead of hardcoded 15%
    const minorThreshold = PREDICTION_CONFIG.TREND_THRESHOLDS.MINOR

    typeTrends[type] = {
      recentAvg: Math.round(recentAvg * 10) / 10,
      olderAvg: Math.round(olderAvg * 10) / 10,
      changePercent: Math.round(change),
      trend: change > minorThreshold ? 'increasing' : change < -minorThreshold ? 'decreasing' : 'stable'
    }
  })

  // Build result with probabilities
  const types = Object.entries(typeConfig)
    .map(([type, config]) => {
      const probability = totalWeightedCount > 0
        ? (weightedCounts[type] / totalWeightedCount) * 100
        : 0

      return {
        type,
        label: config.label,
        severity: config.severity,
        color: config.color,
        probability: Math.round(probability * 10) / 10,
        weightedCount: Math.round(weightedCounts[type] * 10) / 10,
        trend: typeTrends[type].trend,
        trendChange: typeTrends[type].changePercent
      }
    })
    // Only include types with actual data (removed forced LTI inclusion)
    // This prevents misleading display of 0% LTI when no LTI data exists
    .filter(t => t.probability > 0 || t.weightedCount > 0)
    .sort((a, b) => b.probability - a.probability)

  // Normalize probabilities to sum to 100%
  const totalProbability = types.reduce((sum, t) => sum + t.probability, 0)
  if (totalProbability > 0 && totalProbability !== 100) {
    types.forEach(t => {
      t.probability = Math.round((t.probability / totalProbability) * 1000) / 10
    })
  }

  // Find most likely type
  const mostLikely = types[0] || null

  return {
    types,
    mostLikely,
    hasData: types.length > 0,
    lookbackMonths,
    monthlyData: monthlyTypeCounts
  }
}

/**
 * Calculate risk scores for each incident type
 * Formula: risk_score = probability × severity_weight × trend_multiplier
 */
export const calculateIncidentTypeRisk = (probabilityData) => {
  if (!probabilityData || !probabilityData.hasData || !probabilityData.types) {
    return {
      risks: [],
      highestRisk: null,
      hasData: false
    }
  }

  // Trend multipliers
  const trendMultipliers = {
    increasing: 1.2,
    stable: 1.0,
    decreasing: 0.8
  }

  const risks = probabilityData.types.map(typeData => {
    const trendMultiplier = trendMultipliers[typeData.trend] || 1.0

    // Risk score formula
    const riskScore = (typeData.probability / 100) * typeData.severity * trendMultiplier

    // Normalize to 0-100 scale (max possible = 100% × 10 × 1.2 = 12)
    const normalizedRisk = Math.min(100, Math.round((riskScore / 12) * 100))

    // Determine risk level
    let riskLevel = 'low'
    let alertType = null

    if (normalizedRisk >= 50) {
      riskLevel = 'high'
      alertType = 'critical'
    } else if (normalizedRisk >= 25) {
      riskLevel = 'medium'
      alertType = typeData.trend === 'increasing' ? 'warning' : null
    }

    // Generate alert if increasing trend on high severity type
    let alert = null
    if (typeData.trend === 'increasing' && typeData.severity >= 5) {
      alert = {
        type: alertType || 'warning',
        message: `${typeData.label.split(' ')[0]} incidents trending up ${typeData.trendChange}%`
      }
    }

    return {
      ...typeData,
      riskScore: normalizedRisk,
      rawRiskScore: Math.round(riskScore * 100) / 100,
      riskLevel,
      trendMultiplier,
      alert
    }
  }).sort((a, b) => b.riskScore - a.riskScore)

  const highestRisk = risks[0] || null

  return {
    risks,
    highestRisk,
    hasData: risks.length > 0,
    alerts: risks.filter(r => r.alert).map(r => r.alert)
  }
}

/**
 * Get combined incident prediction summary for UI
 * Returns weekly/monthly forecasts and type probability breakdown
 */
export const getIncidentPredictionSummary = (incidents) => {
  // Get weekly forecast (next 1 week)
  const weeklyForecast = forecastIncidentsByPeriod(incidents, 'week', 1)

  // Get monthly forecast (next 1 month)
  const monthlyForecast = forecastIncidentsByPeriod(incidents, 'month', 1)

  // Get incident type probabilities
  const typeProbability = predictIncidentTypeProbability(incidents, 6)

  // Calculate risk scores
  const typeRisk = calculateIncidentTypeRisk(typeProbability)

  // Build summary
  const weekPrediction = weeklyForecast.predictions?.[0] || null
  const monthPrediction = monthlyForecast.predictions?.[0] || null

  return {
    weekly: weekPrediction ? {
      predicted: weekPrediction.predicted,
      range: { min: weekPrediction.lower, max: weekPrediction.upper },
      trend: weekPrediction.trend,
      confidence: weekPrediction.confidence,
      changePercent: weekPrediction.changePercent
    } : null,
    monthly: monthPrediction ? {
      predicted: monthPrediction.predicted,
      range: { min: monthPrediction.lower, max: monthPrediction.upper },
      trend: monthPrediction.trend,
      confidence: monthPrediction.confidence,
      changePercent: monthPrediction.changePercent
    } : null,
    typeProbability,
    typeRisk,
    hasData: (weekPrediction || monthPrediction) || typeProbability.hasData,
    methodology: {
      countForecast: 'Linear regression with 95% confidence intervals',
      typeProbability: 'Exponential weighted moving average (α=0.4, 6-month lookback)',
      riskScore: 'Probability × Severity × Trend Multiplier'
    }
  }
}

// ============================================================================
// PHASE 2: ANOMALY DETECTION
// ============================================================================

/**
 * Detect anomalies using Z-score method
 * Values beyond threshold standard deviations from mean
 */
export const detectZScoreAnomalies = (incidents, threshold = 2.5) => {
  const dates = incidents.map(i => i.date).filter(Boolean).sort()
  if (dates.length < 14) return { anomalies: [], stats: null }

  const endDate = parseISO(dates[dates.length - 1])
  const startDate = subMonths(endDate, 3)

  // Daily counts
  const dailyCounts = {}
  incidents.forEach(i => {
    if (!i.date) return
    const dateKey = i.date.substring(0, 10)
    const d = parseISO(dateKey)
    if (d >= startDate && d <= endDate) {
      dailyCounts[dateKey] = (dailyCounts[dateKey] || 0) + 1
    }
  })

  const values = Object.values(dailyCounts)
  if (values.length < 7) return { anomalies: [], stats: null }

  // Calculate mean and standard deviation
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
  const stdDev = Math.sqrt(variance)

  if (stdDev === 0) return { anomalies: [], stats: { mean, stdDev: 0 } }

  // Find anomalies
  const anomalies = []
  Object.entries(dailyCounts).forEach(([date, count]) => {
    const zScore = (count - mean) / stdDev
    if (Math.abs(zScore) >= threshold) {
      anomalies.push({
        date,
        dateLabel: format(parseISO(date), 'MMM dd, yyyy'),
        value: count,
        zScore: Math.round(zScore * 100) / 100,
        type: zScore > 0 ? 'spike' : 'drop',
        severity: Math.abs(zScore) >= 3 ? 'high' : 'medium',
        deviation: Math.round((count - mean) / mean * 100)
      })
    }
  })

  return {
    anomalies: anomalies.sort((a, b) => Math.abs(b.zScore) - Math.abs(a.zScore)),
    stats: {
      mean: Math.round(mean * 10) / 10,
      stdDev: Math.round(stdDev * 10) / 10,
      threshold
    }
  }
}

/**
 * Detect anomalies using IQR (Interquartile Range) method
 * More robust to outliers than Z-score
 */
export const detectIQRAnomalies = (incidents) => {
  const dates = incidents.map(i => i.date).filter(Boolean).sort()
  if (dates.length < 14) return { anomalies: [], stats: null }

  const endDate = parseISO(dates[dates.length - 1])
  const startDate = subMonths(endDate, 3)

  // Daily counts
  const dailyCounts = {}
  incidents.forEach(i => {
    if (!i.date) return
    const dateKey = i.date.substring(0, 10)
    const d = parseISO(dateKey)
    if (d >= startDate && d <= endDate) {
      dailyCounts[dateKey] = (dailyCounts[dateKey] || 0) + 1
    }
  })

  const entries = Object.entries(dailyCounts).sort((a, b) => a[1] - b[1])
  const values = entries.map(e => e[1])

  if (values.length < 7) return { anomalies: [], stats: null }

  // Calculate quartiles
  const q1Index = Math.floor(values.length * 0.25)
  const q3Index = Math.floor(values.length * 0.75)
  const q1 = values[q1Index]
  const q3 = values[q3Index]
  const iqr = q3 - q1
  const median = values[Math.floor(values.length / 2)]

  const lowerBound = q1 - 1.5 * iqr
  const upperBound = q3 + 1.5 * iqr

  // Find anomalies
  const anomalies = []
  Object.entries(dailyCounts).forEach(([date, count]) => {
    if (count < lowerBound || count > upperBound) {
      anomalies.push({
        date,
        dateLabel: format(parseISO(date), 'MMM dd, yyyy'),
        value: count,
        type: count > upperBound ? 'spike' : 'drop',
        severity: count > q3 + 3 * iqr || count < q1 - 3 * iqr ? 'high' : 'medium',
        bounds: { lower: Math.round(lowerBound), upper: Math.round(upperBound) }
      })
    }
  })

  return {
    anomalies: anomalies.sort((a, b) => Math.abs(b.value - median) - Math.abs(a.value - median)),
    stats: { q1, median, q3, iqr, lowerBound: Math.round(lowerBound), upperBound: Math.round(upperBound) }
  }
}

/**
 * Detect change points (sudden shifts in baseline)
 */
export const detectChangePoints = (incidents, windowDays = 7) => {
  const dates = incidents.map(i => i.date).filter(Boolean).sort()
  if (dates.length < 21) return { changePoints: [], windows: [] }

  const endDate = parseISO(dates[dates.length - 1])
  const startDate = subMonths(endDate, 2)

  // Daily counts
  const dailyCounts = []
  let currentDate = startDate
  while (currentDate <= endDate) {
    const dateKey = format(currentDate, 'yyyy-MM-dd')
    const count = incidents.filter(i => i.date && i.date.substring(0, 10) === dateKey).length
    dailyCounts.push({ date: dateKey, count })
    currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000)
  }

  if (dailyCounts.length < windowDays * 3) return { changePoints: [], windows: [] }

  // Calculate rolling averages
  const windows = []
  for (let i = windowDays; i < dailyCounts.length - windowDays; i++) {
    const before = dailyCounts.slice(i - windowDays, i).reduce((s, d) => s + d.count, 0) / windowDays
    const after = dailyCounts.slice(i, i + windowDays).reduce((s, d) => s + d.count, 0) / windowDays
    const change = before > 0 ? ((after - before) / before) * 100 : (after > 0 ? 100 : 0)

    windows.push({
      date: dailyCounts[i].date,
      before: Math.round(before * 10) / 10,
      after: Math.round(after * 10) / 10,
      change: Math.round(change)
    })
  }

  // Find significant change points (>50% change)
  const changePoints = windows
    .filter(w => Math.abs(w.change) >= 50)
    .map(w => ({
      date: w.date,
      dateLabel: format(parseISO(w.date), 'MMM dd, yyyy'),
      type: w.change > 0 ? 'increase' : 'decrease',
      magnitude: Math.abs(w.change),
      before: w.before,
      after: w.after
    }))
    .sort((a, b) => b.magnitude - a.magnitude)
    .slice(0, 5) // Top 5 change points

  return { changePoints, windows }
}

/**
 * Combined anomaly analysis
 */
export const getAnomalyAnalysis = (incidents) => {
  const zScore = detectZScoreAnomalies(incidents)
  const iqr = detectIQRAnomalies(incidents)
  const changePoints = detectChangePoints(incidents)

  // Merge and deduplicate anomalies
  const allAnomalies = new Map()

  zScore.anomalies.forEach(a => {
    allAnomalies.set(a.date, { ...a, method: 'z-score' })
  })

  iqr.anomalies.forEach(a => {
    if (allAnomalies.has(a.date)) {
      allAnomalies.get(a.date).confirmedBy = 'both'
    } else {
      allAnomalies.set(a.date, { ...a, method: 'iqr' })
    }
  })

  const anomalies = Array.from(allAnomalies.values())
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10) // Top 10 most recent

  // Get affected incidents for drill-down
  anomalies.forEach(anomaly => {
    anomaly.incidents = incidents.filter(i =>
      i.date && i.date.substring(0, 10) === anomaly.date
    ).slice(0, 5)
  })

  return {
    anomalies,
    changePoints: changePoints.changePoints,
    summary: {
      totalAnomalies: anomalies.length,
      spikes: anomalies.filter(a => a.type === 'spike').length,
      drops: anomalies.filter(a => a.type === 'drop').length,
      highSeverity: anomalies.filter(a => a.severity === 'high').length
    },
    stats: zScore.stats
  }
}

// ============================================================================
// PHASE 3: CORRELATION ENGINE
// ============================================================================

/**
 * Calculate chi-square statistic for significance testing
 */
export const calculateChiSquare = (observed, expected) => {
  if (expected === 0) return { chiSquare: 0, significant: false }

  const chiSquare = Math.pow(observed - expected, 2) / expected

  // Critical values for df=1 at different significance levels
  // p < 0.05: 3.84, p < 0.01: 6.63, p < 0.001: 10.83
  const pValue = chiSquare >= 10.83 ? 0.001 :
                 chiSquare >= 6.63 ? 0.01 :
                 chiSquare >= 3.84 ? 0.05 : 1

  return {
    chiSquare: Math.round(chiSquare * 100) / 100,
    pValue,
    significant: pValue <= 0.05,
    significance: pValue <= 0.001 ? '***' : pValue <= 0.01 ? '**' : pValue <= 0.05 ? '*' : ''
  }
}

/**
 * Identify significant correlation patterns
 * Finds Contractor + Hazard + Root Cause combinations that occur more than expected
 */
export const identifyCorrelationPatterns = (incidents) => {
  if (incidents.length < 30) {
    return { patterns: [], matrix: [], hasData: false }
  }

  const patterns = []
  const total = incidents.length

  // Count by contractor
  const contractorCounts = {}
  incidents.forEach(i => {
    const c = i.contractor || 'Unknown'
    contractorCounts[c] = (contractorCounts[c] || 0) + 1
  })

  // Count by hazard
  const hazardCounts = {}
  incidents.forEach(i => {
    const h = i.location || 'Unspecified'
    hazardCounts[h] = (hazardCounts[h] || 0) + 1
  })

  // Count by root cause
  const rootCauseCounts = {}
  incidents.forEach(i => {
    const r = i.rootCause || 'Not Specified'
    rootCauseCounts[r] = (rootCauseCounts[r] || 0) + 1
  })

  // Find significant Contractor + Root Cause patterns
  const contractorRootCause = {}
  incidents.forEach(i => {
    const key = `${i.contractor || 'Unknown'}|||${i.rootCause || 'Not Specified'}`
    contractorRootCause[key] = (contractorRootCause[key] || 0) + 1
  })

  Object.entries(contractorRootCause).forEach(([key, observed]) => {
    const [contractor, rootCause] = key.split('|||')
    if (contractor === 'Unknown' || rootCause === 'Not Specified') return
    if (observed < 3) return // Minimum count threshold

    const contractorPct = (contractorCounts[contractor] || 0) / total
    const rootCausePct = (rootCauseCounts[rootCause] || 0) / total
    const expected = total * contractorPct * rootCausePct

    if (expected < 1) return // Skip if expected is too low

    const ratio = observed / expected
    const chi = calculateChiSquare(observed, expected)

    if (chi.significant && ratio >= 1.5) {
      patterns.push({
        type: 'contractor-rootcause',
        contractor,
        rootCause,
        observed,
        expected: Math.round(expected * 10) / 10,
        ratio: Math.round(ratio * 10) / 10,
        chiSquare: chi.chiSquare,
        significance: chi.significance,
        pValue: chi.pValue,
        description: `${contractor} has "${rootCause}" as root cause ${ratio.toFixed(1)}x more often than expected`
      })
    }
  })

  // Find significant Hazard + Root Cause patterns
  const hazardRootCause = {}
  incidents.forEach(i => {
    const key = `${i.location || 'Unspecified'}|||${i.rootCause || 'Not Specified'}`
    hazardRootCause[key] = (hazardRootCause[key] || 0) + 1
  })

  Object.entries(hazardRootCause).forEach(([key, observed]) => {
    const [hazard, rootCause] = key.split('|||')
    if (hazard === 'Unspecified' || rootCause === 'Not Specified') return
    if (observed < 3) return

    const hazardPct = (hazardCounts[hazard] || 0) / total
    const rootCausePct = (rootCauseCounts[rootCause] || 0) / total
    const expected = total * hazardPct * rootCausePct

    if (expected < 1) return

    const ratio = observed / expected
    const chi = calculateChiSquare(observed, expected)

    if (chi.significant && ratio >= 1.5) {
      patterns.push({
        type: 'hazard-rootcause',
        hazard,
        rootCause,
        observed,
        expected: Math.round(expected * 10) / 10,
        ratio: Math.round(ratio * 10) / 10,
        chiSquare: chi.chiSquare,
        significance: chi.significance,
        pValue: chi.pValue,
        description: `"${hazard}" incidents have "${rootCause}" ${ratio.toFixed(1)}x more often than expected`
      })
    }
  })

  // Sort by significance (chi-square value)
  patterns.sort((a, b) => b.chiSquare - a.chiSquare)

  return {
    patterns: patterns.slice(0, 10), // Top 10 patterns
    hasData: patterns.length > 0,
    summary: {
      totalPatterns: patterns.length,
      highlySignificant: patterns.filter(p => p.pValue <= 0.01).length,
      contractorPatterns: patterns.filter(p => p.type === 'contractor-rootcause').length,
      hazardPatterns: patterns.filter(p => p.type === 'hazard-rootcause').length
    }
  }
}

/**
 * Get enhanced root cause by hazard matrix with significance
 */
export const getRootCauseByHazardWithSignificance = (incidents) => {
  const base = getRootCauseByHazard(incidents)
  if (!base.hasData) return base

  const total = incidents.length

  // Calculate significance for each cell
  base.matrix.forEach(row => {
    base.rootCauses.forEach(cause => {
      const observed = row[cause] || 0
      const hazardTotal = row.total
      const causeTotal = incidents.filter(i => i.rootCause === cause).length

      if (observed >= 2 && total > 0) {
        const expected = (hazardTotal / total) * (causeTotal / total) * total
        const chi = calculateChiSquare(observed, expected)
        row[`${cause}_sig`] = chi.significance
        row[`${cause}_ratio`] = expected > 0 ? Math.round((observed / expected) * 10) / 10 : 0
      }
    })
  })

  return base
}

// ============================================================================
// PHASE 5: WHAT-IF SIMULATOR
// ============================================================================

/**
 * Simulate impact of closing overdue actions
 */
export const simulateActionClosure = (incidents, actionsToClose = 0) => {
  const overdueAlerts = getOverdueActionAlerts(incidents)
  const currentOverdue = overdueAlerts.reduce((sum, a) => sum + (a.metric || 0), 0)

  const currentScore = calculateRiskScore(incidents)
  const actionFactor = currentScore.factors.find(f => f.name === 'Action Closure')
  const currentActionScore = actionFactor ? actionFactor.score : 100

  // Each closed action improves score by 5 points (max 100)
  const newOverdue = Math.max(0, currentOverdue - actionsToClose)
  const projectedActionScore = Math.min(100, Math.max(0, 100 - (newOverdue * 5)))
  const improvement = projectedActionScore - currentActionScore

  // Recalculate overall risk score
  const scoreDelta = (improvement * 0.25) // Action closure is 25% weight

  return {
    currentOverdue,
    projectedOverdue: newOverdue,
    currentActionScore: Math.round(currentActionScore),
    projectedActionScore: Math.round(projectedActionScore),
    improvement: Math.round(improvement),
    currentRiskScore: currentScore.score,
    projectedRiskScore: Math.min(100, Math.round(currentScore.score + scoreDelta)),
    scoreDelta: Math.round(scoreDelta)
  }
}

/**
 * Simulate impact of improving night shift coverage
 */
export const simulateCoverageImprovement = (incidents, targetNightPct = 25) => {
  const hourData = getObservationsByHour(incidents)
  const currentNightPct = hourData.summary.hasTimeData
    ? parseFloat(hourData.summary.nightShiftPct)
    : 0

  const currentScore = calculateRiskScore(incidents)
  const coverageFactor = currentScore.factors.find(f => f.name === 'Shift Coverage')
  const currentCoverageScore = coverageFactor ? coverageFactor.score : 50

  // Coverage score = (nightPct / 25) * 100, capped at 100
  const projectedCoverageScore = Math.min(100, (targetNightPct / 25) * 100)
  const improvement = projectedCoverageScore - currentCoverageScore

  // Coverage is 20% weight
  const scoreDelta = (improvement * 0.20)

  return {
    currentNightPct: Math.round(currentNightPct * 10) / 10,
    targetNightPct,
    currentCoverageScore: Math.round(currentCoverageScore),
    projectedCoverageScore: Math.round(projectedCoverageScore),
    improvement: Math.round(improvement),
    currentRiskScore: currentScore.score,
    projectedRiskScore: Math.min(100, Math.round(currentScore.score + scoreDelta)),
    scoreDelta: Math.round(scoreDelta),
    additionalObsNeeded: Math.round((targetNightPct - currentNightPct) / 100 * incidents.length)
  }
}

/**
 * Simulate impact of reducing specific root cause incidents
 */
export const simulateRootCauseReduction = (incidents, rootCause, reductionPct = 25) => {
  const rootCauseIncidents = incidents.filter(i => i.rootCause === rootCause)
  const currentCount = rootCauseIncidents.length
  const projectedReduction = Math.round(currentCount * (reductionPct / 100))
  const projectedCount = currentCount - projectedReduction

  // Calculate impact on overall incident count
  const totalIncidents = incidents.length
  const projectedTotal = totalIncidents - projectedReduction
  const overallReduction = totalIncidents > 0
    ? Math.round((projectedReduction / totalIncidents) * 100)
    : 0

  return {
    rootCause,
    currentCount,
    reductionPct,
    projectedReduction,
    projectedCount,
    totalIncidents,
    projectedTotal,
    overallReductionPct: overallReduction,
    percentOfTotal: totalIncidents > 0
      ? Math.round((currentCount / totalIncidents) * 100)
      : 0
  }
}

/**
 * Run combined what-if simulation
 */
export const runWhatIfSimulation = (incidents, params = {}) => {
  const {
    actionsToClose = 0,
    targetNightPct = null,
    rootCause = null,
    rootCauseReductionPct = 25
  } = params

  const results = {
    baseline: calculateRiskScore(incidents),
    scenarios: []
  }

  if (actionsToClose > 0) {
    results.scenarios.push({
      name: 'Close Overdue Actions',
      ...simulateActionClosure(incidents, actionsToClose)
    })
  }

  if (targetNightPct !== null) {
    results.scenarios.push({
      name: 'Improve Night Coverage',
      ...simulateCoverageImprovement(incidents, targetNightPct)
    })
  }

  if (rootCause) {
    results.scenarios.push({
      name: `Reduce ${rootCause}`,
      ...simulateRootCauseReduction(incidents, rootCause, rootCauseReductionPct)
    })
  }

  // Calculate combined impact
  let combinedDelta = 0
  results.scenarios.forEach(s => {
    if (s.scoreDelta) combinedDelta += s.scoreDelta
  })

  results.combined = {
    currentRiskScore: results.baseline.score,
    projectedRiskScore: Math.min(100, Math.round(results.baseline.score + combinedDelta)),
    totalImprovement: Math.round(combinedDelta)
  }

  return results
}

// ============================================================================
// PHASE 6: SAFETY CULTURE METRICS
// ============================================================================

/**
 * Calculate observation velocity (rate of change in reporting)
 */
export const calculateObservationVelocity = (incidents, windowDays = 7) => {
  const dates = incidents.map(i => i.date).filter(Boolean).sort()
  if (dates.length < 14) {
    return { velocity: 0, trend: 'stable', percentChange: 0, status: 'unknown' }
  }

  const endDate = parseISO(dates[dates.length - 1])
  const midDate = new Date(endDate.getTime() - windowDays * 24 * 60 * 60 * 1000)
  const startDate = new Date(midDate.getTime() - windowDays * 24 * 60 * 60 * 1000)

  const previousPeriod = incidents.filter(i => {
    if (!i.date) return false
    const d = parseISO(i.date.substring(0, 10))
    return d >= startDate && d < midDate
  }).length

  const currentPeriod = incidents.filter(i => {
    if (!i.date) return false
    const d = parseISO(i.date.substring(0, 10))
    return d >= midDate && d <= endDate
  }).length

  const percentChange = previousPeriod > 0
    ? Math.round(((currentPeriod - previousPeriod) / previousPeriod) * 100)
    : (currentPeriod > 0 ? 100 : 0)

  let trend = 'stable'
  let status = 'good'

  if (percentChange > 10) {
    trend = 'increasing'
    status = 'good' // More reporting is generally positive
  } else if (percentChange < -20) {
    trend = 'decreasing'
    status = 'warning' // Significant drop may indicate engagement issues
  }

  return {
    velocity: currentPeriod - previousPeriod,
    previousPeriod,
    currentPeriod,
    trend,
    percentChange,
    status,
    windowDays
  }
}

/**
 * Calculate reporter diversity index
 * Measures how many unique reporters vs expected
 */
export const calculateReporterDiversityIndex = (incidents) => {
  const reporters = new Set()
  const contractors = new Set()

  incidents.forEach(i => {
    if (i.reporter) reporters.add(i.reporter)
    if (i.contractor) contractors.add(i.contractor)
  })

  const uniqueReporters = reporters.size
  const uniqueContractors = contractors.size

  // Expected: assume minimum 3 reporters per contractor
  const expectedReporters = uniqueContractors * 3

  const diversityIndex = expectedReporters > 0
    ? Math.min(1, uniqueReporters / expectedReporters)
    : 0

  let status = 'good'
  if (diversityIndex < 0.3) status = 'critical'
  else if (diversityIndex < 0.6) status = 'warning'

  return {
    uniqueReporters,
    uniqueContractors,
    expectedReporters,
    diversityIndex: Math.round(diversityIndex * 100) / 100,
    diversityPct: Math.round(diversityIndex * 100),
    status,
    message: diversityIndex < 0.5
      ? 'Low reporter diversity - encourage broader participation'
      : diversityIndex < 0.8
        ? 'Moderate diversity - room for improvement'
        : 'Good reporter diversity'
  }
}

/**
 * Calculate proactive vs reactive ratio
 * Positive observations : Negative observations
 */
export const calculateProactiveReactiveRatio = (incidents) => {
  const proactive = incidents.filter(i =>
    i.type === 'positive' || i.type === 'near-miss'
  ).length

  const reactive = incidents.filter(i =>
    ['lti', 'mti', 'fac', 'unsafe-act', 'unsafe-condition'].includes(i.type)
  ).length

  const ratio = reactive > 0 ? proactive / reactive : proactive
  const target = 10 // Industry target: 10:1 proactive to reactive

  let status = 'good'
  if (ratio < 2) status = 'critical'
  else if (ratio < 5) status = 'warning'

  return {
    proactiveCount: proactive,
    reactiveCount: reactive,
    ratio: Math.round(ratio * 10) / 10,
    target,
    targetMet: ratio >= target,
    status,
    gap: Math.max(0, Math.round((target - ratio) * reactive)),
    message: ratio < 5
      ? 'Increase positive observations and near-miss reporting'
      : ratio < 10
        ? 'Good progress - continue encouraging proactive reporting'
        : 'Excellent proactive safety culture'
  }
}

/**
 * Calculate leadership visibility index
 * Leadership events as percentage of total
 */
export const calculateLeadershipVisibility = (incidents) => {
  const leadershipEvents = incidents.filter(i => i.type === 'leadership').length
  const total = incidents.length
  const target = 5 // Target: 5% leadership events

  const ratio = total > 0 ? (leadershipEvents / total) * 100 : 0
  const index = Math.min(1, ratio / target)

  let status = 'good'
  if (ratio < 1) status = 'critical'
  else if (ratio < 3) status = 'warning'

  return {
    leadershipEvents,
    total,
    ratio: Math.round(ratio * 10) / 10,
    index: Math.round(index * 100) / 100,
    target,
    targetMet: ratio >= target,
    status,
    message: ratio < 2
      ? 'Increase leadership engagement and safety walks'
      : ratio < 5
        ? 'Moderate leadership visibility - room for improvement'
        : 'Strong leadership safety presence'
  }
}

/**
 * Calculate composite safety culture score
 */
export const calculateSafetyCultureScore = (incidents) => {
  const velocity = calculateObservationVelocity(incidents)
  const diversity = calculateReporterDiversityIndex(incidents)
  const proactiveRatio = calculateProactiveReactiveRatio(incidents)
  const leadership = calculateLeadershipVisibility(incidents)

  // Weight each component
  const weights = {
    velocity: 20,
    diversity: 25,
    proactive: 35,
    leadership: 20
  }

  // Normalize each component to 0-100
  const velocityScore = velocity.trend === 'increasing' ? 100 :
                        velocity.trend === 'stable' ? 70 : 40
  const diversityScore = diversity.diversityPct
  const proactiveScore = Math.min(100, (proactiveRatio.ratio / proactiveRatio.target) * 100)
  const leadershipScore = leadership.index * 100

  const compositeScore = Math.round(
    (velocityScore * weights.velocity +
     diversityScore * weights.diversity +
     proactiveScore * weights.proactive +
     leadershipScore * weights.leadership) / 100
  )

  let level = 'good'
  if (compositeScore < 40) level = 'critical'
  else if (compositeScore < 60) level = 'warning'

  return {
    score: compositeScore,
    level,
    components: [
      { name: 'Engagement Velocity', score: velocityScore, weight: weights.velocity, data: velocity },
      { name: 'Reporter Diversity', score: diversityScore, weight: weights.diversity, data: diversity },
      { name: 'Proactive Ratio', score: Math.round(proactiveScore), weight: weights.proactive, data: proactiveRatio },
      { name: 'Leadership Visibility', score: Math.round(leadershipScore), weight: weights.leadership, data: leadership }
    ],
    recommendations: [
      velocity.status !== 'good' && 'Encourage more frequent safety observations',
      diversity.status !== 'good' && 'Expand reporter participation across teams',
      proactiveRatio.status !== 'good' && 'Increase positive observation reporting',
      leadership.status !== 'good' && 'Schedule more leadership safety walks'
    ].filter(Boolean)
  }
}

/**
 * Get contractor benchmarking data
 */
export const getContractorBenchmark = (incidents) => {
  const contractors = getContractorMetrics(incidents)

  if (contractors.length === 0) {
    return { rankings: [], topPerformers: [], laggards: [], hasData: false }
  }

  // Calculate additional metrics for each contractor
  const enhanced = contractors.map(c => {
    const contractorIncidents = incidents.filter(i => i.contractor === c.name)
    const proactiveRatio = calculateProactiveReactiveRatio(contractorIncidents)
    const nearMiss = getNearMissMetrics(contractorIncidents)

    return {
      ...c,
      proactiveRatio: proactiveRatio.ratio,
      nearMissRate: parseFloat(nearMiss.rate),
      compositeScore: Math.round(
        (c.qualityScore * 0.4) +
        (Math.min(100, proactiveRatio.ratio * 10) * 0.3) +
        (Math.min(100, parseFloat(nearMiss.rate) * 20) * 0.3)
      )
    }
  })

  // Sort by composite score
  const ranked = enhanced.sort((a, b) => b.compositeScore - a.compositeScore)

  return {
    rankings: ranked.map((c, i) => ({ ...c, rank: i + 1 })),
    topPerformers: ranked.slice(0, 3),
    laggards: ranked.filter(c => c.compositeScore < 50),
    average: Math.round(ranked.reduce((s, c) => s + c.compositeScore, 0) / ranked.length),
    hasData: true
  }
}

// ============================================================================
// SAFETY OUTLOOK HELPERS (Phase 7)
// ============================================================================

/**
 * Convert score to 5-level status for Safety Outlook gauge
 */
export const getOutlookLevel = (score) => {
  if (score >= 81) return { level: 'excellent', label: 'Excellent', color: 'primary' }
  if (score >= 61) return { level: 'good', label: 'Good', color: 'success' }
  if (score >= 41) return { level: 'stable', label: 'Stable', color: 'caution' }
  if (score >= 21) return { level: 'caution', label: 'Caution', color: 'warning' }
  return { level: 'critical', label: 'Critical', color: 'danger' }
}

/**
 * Categorize risk factors into Leading/Trailing/Quality indicators
 */
export const categorizeRiskFactors = (factors) => {
  return {
    leading: factors.filter(f => ['Near-Miss Reporting'].includes(f.name)),
    trailing: factors.filter(f => ['Action Closure'].includes(f.name)),
    quality: factors.filter(f => ['Shift Coverage', 'Contractor Quality'].includes(f.name))
  }
}

/**
 * Get top signals from hazard trending + anomalies
 * Returns combined signals for TrendingSignalCards
 */
export const getTopSignals = (incidents, limit = 6) => {
  const trending = getHazardTrending(incidents)
  const anomalies = getAnomalyAnalysis(incidents)

  // Get signals from trending hazards
  const trendingSignals = trending
    .filter(h => h.trend !== 'stable')
    .slice(0, limit)
    .map(h => ({
      id: `trend-${h.hazard}`,
      name: h.hazard,
      type: 'trending',
      direction: h.trend,
      changePercent: h.changePercent,
      previousCount: h.previousCount,
      currentCount: h.currentCount,
      isMajor: h.isMajor,
      severity: h.isMajor ? 'major' : 'standard',
      isAnomaly: false
    }))

  // Add anomaly flags
  const anomalyDates = new Set(anomalies.anomalies.map(a => a.date))

  // Check if any trending hazards have anomalies
  trendingSignals.forEach(signal => {
    const relatedAnomalies = anomalies.anomalies.filter(a =>
      a.incidents?.some(i => i.location === signal.name)
    )
    if (relatedAnomalies.length > 0) {
      signal.isAnomaly = true
      signal.anomalyCount = relatedAnomalies.length
    }
  })

  return trendingSignals.slice(0, limit)
}

/**
 * Calculate contractor trend (current vs previous period)
 * Enhanced version of getContractorBenchmark with trend data
 */
export const getContractorTrend = (incidents, periodDays = 30) => {
  const benchmark = getContractorBenchmark(incidents)

  if (!benchmark.hasData) return benchmark

  const dates = incidents.map(i => i.date).filter(Boolean).sort()
  if (dates.length === 0) return benchmark

  const endDate = parseISO(dates[dates.length - 1])
  const midDate = subMonths(endDate, 1)
  const startDate = subMonths(endDate, 2)

  // Split into previous and current periods
  const previousPeriod = incidents.filter(i => {
    if (!i.date) return false
    const d = parseISO(i.date.substring(0, 10))
    return d >= startDate && d < midDate
  })

  const currentPeriod = incidents.filter(i => {
    if (!i.date) return false
    const d = parseISO(i.date.substring(0, 10))
    return d >= midDate && d <= endDate
  })

  // Calculate scores for each period
  const previousBenchmark = getContractorBenchmark(previousPeriod)

  // Add trend data to each contractor
  const rankingsWithTrend = benchmark.rankings.map(contractor => {
    const prevContractor = previousBenchmark.rankings?.find(c => c.name === contractor.name)
    const prevScore = prevContractor?.compositeScore || contractor.compositeScore
    const scoreDelta = contractor.compositeScore - prevScore

    let trend = 'stable'
    if (scoreDelta > 5) trend = 'improving'
    else if (scoreDelta < -5) trend = 'declining'

    // Determine action required based on score and trend
    let actionRequired = 'none'
    let urgency = 'low'

    if (contractor.compositeScore < 30) {
      actionRequired = 'Immediate intervention required'
      urgency = 'critical'
    } else if (contractor.compositeScore < 50) {
      actionRequired = 'Performance review needed'
      urgency = 'high'
    } else if (trend === 'declining' && scoreDelta < -10) {
      actionRequired = 'Investigate declining performance'
      urgency = 'medium'
    } else if (contractor.compositeScore < 60 && contractor.nearMissRate < 2) {
      actionRequired = 'Improve near-miss reporting'
      urgency = 'low'
    }

    return {
      ...contractor,
      prevScore,
      scoreDelta,
      trend,
      actionRequired,
      urgency
    }
  })

  return {
    ...benchmark,
    rankings: rankingsWithTrend
  }
}

/**
 * Get overall trend direction for the outlook gauge
 */
export const getOverallTrend = (incidents) => {
  const composite = getCompositeTrends(incidents)

  if (!composite.incidents) return { direction: 'stable', confidence: 'low' }

  // Weigh the different trends
  const incidentTrend = composite.incidents.direction
  const nearMissTrend = composite.nearMiss?.direction

  // If incidents are improving (worsening means more hazards = bad)
  // and near-miss is improving (worsening means less reporting = bad)
  // then overall is improving

  let score = 0
  if (incidentTrend === 'improving') score += 1
  else if (incidentTrend === 'worsening') score -= 1

  if (nearMissTrend === 'improving') score += 1
  else if (nearMissTrend === 'worsening') score -= 1

  let direction = 'stable'
  if (score >= 1) direction = 'improving'
  else if (score <= -1) direction = 'declining'

  return {
    direction,
    confidence: composite.incidents.confidence,
    details: {
      incidents: incidentTrend,
      nearMiss: nearMissTrend
    }
  }
}

// ============================================================================
// SAFETY OUTLOOK - HAZARD LIST VIEW (Phase 8)
// ============================================================================

/**
 * Get confidence level based on sample size
 * Returns confidence classification for trend reliability
 * @param {number} count - Total observation count
 * @returns {Object} Confidence level with rating and description
 */
export const getConfidenceFromCount = (count) => {
  if (count >= 20) {
    return { level: 'high', rating: 3, description: 'Statistically reliable trend' }
  }
  if (count >= 5) {
    return { level: 'medium', rating: 2, description: 'Moderate confidence, trend may change' }
  }
  return { level: 'low', rating: 1, description: 'Low sample size, trend may be unreliable' }
}

/**
 * Check if change is statistically significant
 * Uses chi-square approximation for trend reliability
 * @param {number} prev - Previous period count
 * @param {number} curr - Current period count
 * @returns {boolean} True if change is statistically significant
 */
export const isStatisticallySignificant = (prev, curr) => {
  const total = prev + curr
  // Need minimum sample for significance testing
  if (total < 10) return false

  // Chi-square test approximation
  const expected = total / 2
  const chiSq = Math.pow(curr - expected, 2) / expected + Math.pow(prev - expected, 2) / expected

  // Chi-square critical value for p < 0.05 with 1 df is 3.84
  return chiSq > 3.84
}

/**
 * Get trend level from percentage change
 * Returns 5-level trend classification for UI display
 * isNew flag indicates no baseline data exists for comparison
 * Now considers new hazards as rising (emerging risks)
 */
export const getTrendLevel = (changePercent, isNew = false, currentCount = 0) => {
  // When no baseline data exists but current has data, treat as emerging/rising
  // This ensures new hazards are prioritized for attention
  if (isNew) {
    // New hazards with multiple observations should rank higher
    if (currentCount >= 3) {
      return { level: 'significant-rise', icon: '▲▲', label: 'Emerging', color: 'critical', sortOrder: 0.5 }
    }
    return { level: 'new', icon: '★', label: 'New', color: 'info', sortOrder: 1.5 }
  }

  if (changePercent > 30) {
    return { level: 'significant-rise', icon: '▲▲', label: 'Significant Rise', color: 'critical', sortOrder: 0 }
  }
  if (changePercent > 10) {
    return { level: 'rising', icon: '▲', label: 'Rising', color: 'warning', sortOrder: 1 }
  }
  if (changePercent > -10) {
    return { level: 'stable', icon: '→', label: 'Stable', color: 'neutral', sortOrder: 2 }
  }
  if (changePercent > -30) {
    return { level: 'declining', icon: '▼', label: 'Declining', color: 'success-light', sortOrder: 3 }
  }
  return { level: 'significant-decline', icon: '▼▼', label: 'Significant Decline', color: 'success', sortOrder: 4 }
}

/**
 * Calculate time-decay weight for an incident
 * Recent data (last 3 months) gets weight 1.0
 * Older data decays exponentially with half-life of 90 days
 *
 * @param {Date} incidentDate - Date of the incident
 * @param {Date} endDate - Reference end date (most recent)
 * @returns {number} Weight between 0 and 1
 */
const calculateTimeWeight = (incidentDate, endDate) => {
  const daysAgo = differenceInDays(endDate, incidentDate)

  // Recent data (within 90 days) gets full weight
  if (daysAgo <= 90) return 1.0

  // Exponential decay with half-life of 90 days
  // After 90 days: weight = 0.5^((daysAgo - 90) / 90)
  const decayFactor = Math.pow(0.5, (daysAgo - 90) / 90)

  // Minimum weight of 0.1 to prevent old data from being completely ignored
  return Math.max(0.1, decayFactor)
}

/**
 * Enhanced hazard trending with configurable period
 * Split by period: compare current vs previous
 * Return hazards sorted by trend level
 *
 * For "All Time" periods, applies time-decay weighting to prevent
 * stale historical trends from dominating current analysis.
 */
export const getHazardTrendingByPeriod = (incidents, periodMonths = 3) => {
  const dates = incidents.map(i => i.date).filter(Boolean).sort()
  if (dates.length === 0) return []

  const endDate = parseISO(dates[dates.length - 1])
  const dataStartDate = parseISO(dates[0])

  let midDate, startDate
  const isAllTime = periodMonths === null || periodMonths === undefined

  // Handle null/undefined period (All time) - use full data range, split in half
  if (isAllTime) {
    // For "All time", use full data range and split at midpoint
    startDate = dataStartDate
    const totalDays = differenceInDays(endDate, dataStartDate)
    midDate = subDays(endDate, Math.floor(totalDays / 2))
  } else {
    // Calculate half period for comparison (current half vs previous half)
    const halfPeriodMonths = periodMonths / 2

    if (halfPeriodMonths < 1) {
      const halfPeriodDays = Math.round(halfPeriodMonths * 30)
      midDate = subDays(endDate, halfPeriodDays)
      startDate = subDays(endDate, halfPeriodDays * 2)
    } else {
      midDate = subMonths(endDate, halfPeriodMonths)
      startDate = subMonths(endDate, periodMonths)
    }

    // If calculated start is before actual data, use data start date
    if (startDate < dataStartDate) {
      startDate = dataStartDate
    }
  }

  // Split into previous period vs current period
  const previousPeriod = incidents.filter(i => {
    if (!i.date) return false
    try {
      const d = parseISO(i.date.substring(0, 10))
      if (isNaN(d.getTime())) return false
      return d >= startDate && d < midDate
    } catch {
      return false
    }
  })

  const currentPeriod = incidents.filter(i => {
    if (!i.date) return false
    try {
      const d = parseISO(i.date.substring(0, 10))
      if (isNaN(d.getTime())) return false
      return d >= midDate && d <= endDate
    } catch {
      return false
    }
  })

  // Count by hazard for each period
  // For "All Time", apply time-decay weighting to prevent stale trends from dominating
  const previousCounts = {}
  previousPeriod.forEach(i => {
    const h = i.location || 'Unspecified'
    if (isAllTime) {
      // Apply time-decay weight for "All Time" view
      const incidentDate = parseISO(i.date.substring(0, 10))
      const weight = calculateTimeWeight(incidentDate, endDate)
      previousCounts[h] = (previousCounts[h] || 0) + weight
    } else {
      previousCounts[h] = (previousCounts[h] || 0) + 1
    }
  })

  const currentCounts = {}
  currentPeriod.forEach(i => {
    const h = i.location || 'Unspecified'
    if (isAllTime) {
      // Apply time-decay weight for "All Time" view
      const incidentDate = parseISO(i.date.substring(0, 10))
      const weight = calculateTimeWeight(incidentDate, endDate)
      currentCounts[h] = (currentCounts[h] || 0) + weight
    } else {
      currentCounts[h] = (currentCounts[h] || 0) + 1
    }
  })

  // ALWAYS include ALL hazard categories from the master list
  // Plus any additional hazards found in the data that aren't in the standard list
  const dataHazards = new Set([...Object.keys(previousCounts), ...Object.keys(currentCounts)])
  const allHazards = new Set([...ALL_HAZARDS, ...dataHazards])

  const trending = [...allHazards].map(hazard => {
    const prevWeighted = previousCounts[hazard] || 0
    const currWeighted = currentCounts[hazard] || 0
    const totalWeighted = prevWeighted + currWeighted

    // For display, round weighted counts to integers
    const prev = isAllTime ? Math.round(prevWeighted) : prevWeighted
    const curr = isAllTime ? Math.round(currWeighted) : currWeighted
    const total = prev + curr

    // Determine if this is a "new" hazard (no baseline data to compare)
    const isNew = prevWeighted === 0 && currWeighted > 0

    // Calculate change percent using weighted values for accuracy
    // This ensures trend reflects time-weighted reality
    let changePercent = 0
    if (prevWeighted > 0) {
      changePercent = ((currWeighted - prevWeighted) / prevWeighted) * 100
    } else if (isNew) {
      // New hazards are treated as +100% for proper ranking in "By % Change" sort
      changePercent = 100
    }

    // For hazards with no data at all, use a special "no-data" level
    const hasNoData = totalWeighted === 0

    // Calculate confidence based on sample size (use actual total for better accuracy)
    const confidence = getConfidenceFromCount(total)

    // Check statistical significance for established hazards
    const isSignificant = !isNew && isStatisticallySignificant(prev, curr)

    const trendLevel = hasNoData
      ? { level: 'no-data', icon: '○', label: 'No Data', color: 'muted', sortOrder: 5 }
      : getTrendLevel(changePercent, isNew, curr)

    return {
      name: hazard,
      previousCount: prev,
      currentCount: curr,
      totalCount: total,
      changePercent,
      isNew,
      hasNoData,
      trendLevel,
      isMajor: MAJOR_HAZARDS.includes(hazard),
      confidence,
      isSignificant,
      // Include weighted values for debugging/advanced analysis
      _weightedPrev: isAllTime ? prevWeighted : undefined,
      _weightedCurr: isAllTime ? currWeighted : undefined
    }
  })

  // Sort: hazards with data first (by trend level), then no-data hazards alphabetically
  return trending
    .filter(h => h.name !== 'Unspecified')
    .sort((a, b) => {
      // Hazards with data come before hazards without data
      if (a.hasNoData !== b.hasNoData) {
        return a.hasNoData ? 1 : -1
      }
      // For hazards with data, sort by trend level
      if (!a.hasNoData) {
        const levelDiff = a.trendLevel.sortOrder - b.trendLevel.sortOrder
        if (levelDiff !== 0) return levelDiff
        // Within same level, sort by total count (higher first)
        return b.totalCount - a.totalCount
      }
      // For no-data hazards, sort alphabetically
      return a.name.localeCompare(b.name)
    })
}

/**
 * Get root causes for specific hazard
 * Filters incidents by selected hazard, then groups by root cause
 */
export const getRootCausesForHazard = (incidents, hazardName) => {
  const hazardIncidents = incidents.filter(i => i.location === hazardName)
  return getRootCauseBreakdown(hazardIncidents)
}

/**
 * Get daily breakdown for a specific hazard within time period
 * Used for the trend chart in detail view
 */
// Observation type constants
const NEGATIVE_TYPES = ['unsafe-act', 'unsafe-condition', 'near-miss', 'ncr', 'fac', 'mti', 'lti']
const POSITIVE_TYPES = ['positive']

export const getHazardDailyData = (incidents, hazardName, periodMonths = 6) => {
  const dates = incidents.map(i => i.date).filter(Boolean).sort()
  if (dates.length === 0) return { days: [], hasData: false }

  const endDate = parseISO(dates[dates.length - 1])

  // Handle null/undefined period (All time) - use full data range
  let startDate
  if (periodMonths === null || periodMonths === undefined) {
    startDate = parseISO(dates[0])
  } else if (periodMonths < 1) {
    // Handle fractional months by converting to days
    const periodDays = Math.round(periodMonths * 30)
    startDate = subDays(endDate, periodDays)
  } else {
    startDate = subMonths(endDate, periodMonths)
  }

  // Filter to hazard-specific incidents within the period
  const hazardIncidents = incidents.filter(i => {
    if (!i.date || i.location !== hazardName) return false
    try {
      const d = parseISO(i.date.substring(0, 10))
      if (isNaN(d.getTime())) return false
      return d >= startDate && d <= endDate
    } catch {
      return false
    }
  })

  // Count by day - separate positive and negative
  const dailyCounts = {}
  hazardIncidents.forEach(i => {
    const dateKey = i.date.substring(0, 10)
    if (!dailyCounts[dateKey]) {
      dailyCounts[dateKey] = { total: 0, positive: 0, negative: 0 }
    }
    dailyCounts[dateKey].total++
    if (POSITIVE_TYPES.includes(i.type)) {
      dailyCounts[dateKey].positive++
    } else if (NEGATIVE_TYPES.includes(i.type)) {
      dailyCounts[dateKey].negative++
    }
  })

  // Build daily data array for the entire period
  const days = []
  let currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    const dateKey = format(currentDate, 'yyyy-MM-dd')
    const dayLabel = format(currentDate, 'MMM d')
    const dayCounts = dailyCounts[dateKey] || { total: 0, positive: 0, negative: 0 }

    days.push({
      date: dateKey,
      label: dayLabel,
      count: dayCounts.total,
      positive: dayCounts.positive,
      negative: dayCounts.negative
    })

    currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000)
  }

  // Calculate totals
  const totalPositive = hazardIncidents.filter(i => POSITIVE_TYPES.includes(i.type)).length
  const totalNegative = hazardIncidents.filter(i => NEGATIVE_TYPES.includes(i.type)).length

  // Calculate trend line based on negative observations (simple linear regression)
  const n = days.length
  const values = days.map(d => d.negative)

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0
  for (let i = 0; i < n; i++) {
    sumX += i
    sumY += values[i]
    sumXY += i * values[i]
    sumX2 += i * i
  }

  const denominator = n * sumX2 - sumX * sumX
  const slope = n > 1 && denominator !== 0 ? (n * sumXY - sumX * sumY) / denominator : 0
  const intercept = n > 0 ? (sumY - slope * sumX) / n : 0

  // Add trend line values
  const daysWithTrend = days.map((d, i) => ({
    ...d,
    trendValue: Math.max(0, slope * i + intercept)
  }))

  return {
    days: daysWithTrend,
    hasData: hazardIncidents.length > 0,
    totalCount: hazardIncidents.length,
    totalPositive,
    totalNegative,
    avgPerDay: n > 0 ? Math.round((hazardIncidents.length / n) * 100) / 100 : 0,
    trend: slope > 0.01 ? 'increasing' : slope < -0.01 ? 'decreasing' : 'stable'
  }
}

/**
 * Get daily data for a specific contributing factor
 * Similar to getHazardDailyData but filters by factor detection
 */
export const getFactorDailyData = (incidents, factorName, periodMonths = 6, detectFn) => {
  const dates = incidents.map(i => i.date).filter(Boolean).sort()
  if (dates.length === 0) return { days: [], hasData: false }

  const endDate = parseISO(dates[dates.length - 1])

  // Handle null/undefined period (All time) - use full data range
  let startDate
  if (periodMonths === null || periodMonths === undefined) {
    startDate = parseISO(dates[0])
  } else if (periodMonths < 1) {
    const periodDays = Math.round(periodMonths * 30)
    startDate = subDays(endDate, periodDays)
  } else {
    startDate = subMonths(endDate, periodMonths)
  }

  // Filter to factor-specific incidents within the period
  // Only consider negative observations for factors
  const factorIncidents = incidents.filter(i => {
    if (!i.date) return false
    if (!NEGATIVE_TYPES.includes(i.type)) return false

    try {
      const d = parseISO(i.date.substring(0, 10))
      if (isNaN(d.getTime())) return false
      if (d < startDate || d > endDate) return false

      // Check if this factor is detected in the description
      if (detectFn) {
        const detectedFactors = detectFn(i.description)
        return detectedFactors.some(f => f.factor === factorName)
      }
      return false
    } catch {
      return false
    }
  })

  // Count by day
  const dailyCounts = {}
  factorIncidents.forEach(i => {
    const dateKey = i.date.substring(0, 10)
    if (!dailyCounts[dateKey]) {
      dailyCounts[dateKey] = { total: 0, negative: 0 }
    }
    dailyCounts[dateKey].total++
    dailyCounts[dateKey].negative++
  })

  // Build daily data array
  const days = []
  let currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    const dateKey = format(currentDate, 'yyyy-MM-dd')
    const dayLabel = format(currentDate, 'MMM d')
    const dayCounts = dailyCounts[dateKey] || { total: 0, negative: 0 }

    days.push({
      date: dateKey,
      label: dayLabel,
      count: dayCounts.total,
      negative: dayCounts.negative
    })

    currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000)
  }

  // Calculate totals
  const totalNegative = factorIncidents.length

  // Calculate trend (simple linear regression)
  const n = days.length
  const values = days.map(d => d.negative)

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0
  for (let i = 0; i < n; i++) {
    sumX += i
    sumY += values[i]
    sumXY += i * values[i]
    sumX2 += i * i
  }

  const denominator = n * sumX2 - sumX * sumX
  const slope = n > 1 && denominator !== 0 ? (n * sumXY - sumX * sumY) / denominator : 0

  return {
    days,
    hasData: factorIncidents.length > 0,
    totalCount: factorIncidents.length,
    totalNegative,
    avgPerDay: n > 0 ? Math.round((factorIncidents.length / n) * 100) / 100 : 0,
    trend: slope > 0.01 ? 'increasing' : slope < -0.01 ? 'decreasing' : 'stable'
  }
}

// ============================================================================
// DEVIATION EXTRACTION FOR ROOT CAUSE ANALYSIS
// ============================================================================

/**
 * Deviation categories for normalization
 * Maps common patterns to standardized deficiency labels
 */
const DEVIATION_CATEGORIES = {
  // PPE Issues
  'PPE not worn': ['no ppe', 'without ppe', 'missing ppe', 'ppe not worn', 'not wearing ppe', 'ppe not', 'lack of ppe'],
  'Harness not worn': ['no harness', 'without harness', 'harness not', 'missing harness', 'not wearing harness'],
  'Helmet not worn': ['no helmet', 'without helmet', 'helmet not', 'missing helmet', 'no hard hat', 'hard hat not', 'not wearing helmet'],
  'Gloves not worn': ['no gloves', 'without gloves', 'gloves not', 'missing gloves', 'not wearing gloves'],
  'Safety glasses not worn': ['no safety glasses', 'no goggles', 'without goggles', 'missing goggles', 'eye protection not'],
  'Safety vest not worn': ['no vest', 'no hi-vis', 'hi-vis not', 'without vest', 'missing vest'],
  'Safety boots not worn': ['no safety boots', 'no boots', 'without boots', 'improper footwear'],

  // Equipment Issues
  'Missing guardrail': ['no guardrail', 'guardrail missing', 'missing guardrail', 'without guardrail', 'guardrail not', 'no guard rail'],
  'Missing barricade': ['no barricade', 'barricade missing', 'without barricade', 'barricade not', 'missing barricade'],
  'Damaged equipment': ['damaged', 'broken equipment', 'faulty equipment', 'defective', 'equipment damaged'],
  'Unsecured scaffold': ['unsecured scaffold', 'scaffold not secured', 'unstable scaffold', 'scaffold unstable'],
  'Exposed cables': ['exposed cable', 'exposed wire', 'live wire', 'unprotected cable', 'cable exposed', 'wire exposed'],
  'Unprotected edge': ['unprotected edge', 'edge not protected', 'no edge protection', 'open edge', 'leading edge'],
  'Unsecured load': ['unsecured load', 'load not secured', 'loose load', 'load unsecured'],
  'Missing cover': ['no cover', 'cover missing', 'missing cover', 'uncovered', 'without cover', 'open hole'],
  'Equipment not inspected': ['not inspected', 'no inspection', 'inspection not', 'expired inspection', 'overdue inspection'],

  // Work Practice Issues
  'Working without permit': ['no permit', 'without permit', 'permit not', 'missing permit', 'lack of permit'],
  'Improper procedure': ['improper procedure', 'wrong procedure', 'not following procedure', 'procedure not followed'],
  'Poor housekeeping': ['poor housekeeping', 'housekeeping', 'untidy', 'cluttered', 'mess', 'debris', 'scattered'],
  'Improper lifting': ['improper lifting', 'wrong lifting', 'manual handling', 'lifting technique', 'incorrect lifting'],
  'Working at height without protection': ['working at height without', 'height without', 'no fall protection'],
  'Improper storage': ['improper storage', 'incorrect storage', 'poor storage', 'storage not', 'not stored properly'],
  'Unauthorized access': ['unauthorized access', 'access not controlled', 'no access control', 'unauthorized entry'],

  // Barrier/Control Issues
  'Inadequate signage': ['no sign', 'missing sign', 'inadequate sign', 'signage not', 'poor signage', 'no warning'],
  'Missing fire extinguisher': ['no fire extinguisher', 'fire extinguisher missing', 'missing extinguisher'],
  'Blocked access': ['blocked access', 'access blocked', 'exit blocked', 'blocked exit', 'obstructed'],
  'Inadequate lighting': ['poor lighting', 'inadequate lighting', 'no lighting', 'insufficient lighting', 'dark area'],
  'Missing first aid': ['no first aid', 'first aid missing', 'missing first aid', 'no first aid kit'],

  // Worker Welfare Issues
  'No drinking water': ['no drinking water', 'drinking water not', 'water not available', 'no potable water', 'lack of water'],
  'Welfare facility missing': ['welfare missing', 'no welfare', 'welfare not', 'inadequate welfare', 'lack of welfare'],
  'Poor toilet condition': ['toilet poor', 'poor toilet', 'toilet not clean', 'dirty toilet', 'toilet condition'],
  'Rest area inadequate': ['no rest area', 'rest area inadequate', 'inadequate rest', 'no shade', 'lack of rest'],
  'First aid not available': ['first aid not', 'no first aid', 'first aid missing'],

  // Supervision Issues
  'No supervision': ['no supervision', 'without supervision', 'unsupervised', 'supervision not', 'lack of supervision'],
  'No banksman': ['no banksman', 'banksman not', 'without banksman', 'missing banksman', 'no spotter'],
  'No signalman': ['no signalman', 'signalman not', 'without signalman', 'missing signalman'],

  // Documentation Issues
  'Missing documentation': ['no documentation', 'documentation missing', 'missing document', 'no paperwork'],
  'Expired certificate': ['expired certificate', 'certificate expired', 'expired license', 'license expired'],
  'No risk assessment': ['no risk assessment', 'risk assessment not', 'missing risk assessment', 'no ra', 'ra not'],
}

/**
 * Normalize a deviation string into a standard category
 */
const normalizeDeviation = (deviation) => {
  if (!deviation) return null
  const lowerDev = deviation.toLowerCase()

  // Check against category patterns
  for (const [category, patterns] of Object.entries(DEVIATION_CATEGORIES)) {
    for (const pattern of patterns) {
      if (lowerDev.includes(pattern)) {
        return category
      }
    }
  }

  // Clean up and capitalize if no match
  const cleaned = deviation
    .replace(/^(was |were |is |are |has |have |had |being |been )/i, '')
    .replace(/\s+/g, ' ')
    .trim()

  if (cleaned.length < 3) return null

  // Capitalize first letter
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase()
}

/**
 * Extract the deviation/deficiency from a parsed sentence and original text
 */
const extractDeviation = (parsed, originalText) => {
  if (!originalText) return null
  const lowerText = originalText.toLowerCase()

  // Priority 1: Explicit deviation from parser
  if (parsed.deviation) {
    return parsed.deviation
  }

  // Priority 2: Subject with deviation indicator
  if (parsed.mainSubject) {
    const hasDeviation = DEVIATION_INDICATORS.some(ind =>
      parsed.mainSubject.toLowerCase().includes(ind)
    )
    if (hasDeviation) {
      return parsed.mainSubject
    }
  }

  // Priority 3: Pattern-based extraction for common deficiency patterns
  const patterns = [
    // Missing patterns
    { regex: /(?:missing|no|without|lacking|lack of|absence of)\s+(\w+(?:\s+\w+){0,2})/i, group: 0 },
    // Not worn/used patterns
    { regex: /(\w+(?:\s+\w+)?)\s+(?:not|wasn't|weren't)\s+(?:worn|used|provided|available|installed)/i, group: 0 },
    // Exposed/damaged patterns
    { regex: /(?:exposed|damaged|broken|faulty|defective)\s+(\w+(?:\s+\w+)?)/i, group: 0 },
    // Poor/improper patterns
    { regex: /(?:poor|improper|inadequate|insufficient|incorrect)\s+(\w+(?:\s+\w+)?)/i, group: 0 },
    // Failure patterns
    { regex: /(\w+(?:\s+\w+)?)\s+(?:failure|failed)/i, group: 0 },
    // Unsecured/unstable patterns
    { regex: /(?:unsecured|unstable|loose|unprotected)\s+(\w+(?:\s+\w+)?)/i, group: 0 },
    // Without patterns
    { regex: /working\s+(?:without|with\s+no)\s+(\w+(?:\s+\w+)?)/i, group: 0 },
    // Not following patterns
    { regex: /not\s+(?:following|using|wearing|secured|protected)/i, group: 0 },
  ]

  for (const { regex, group } of patterns) {
    const match = lowerText.match(regex)
    if (match && match[group]) {
      return match[group].trim()
    }
  }

  // Priority 4: Use main keyword if it's a signal word
  if (parsed.mainKeyword && parsed.mainKeywordIsSignal) {
    // Check if there's a deviation indicator before it
    const keywordIndex = lowerText.indexOf(parsed.mainKeyword.toLowerCase())
    if (keywordIndex > 0) {
      const beforeKeyword = lowerText.substring(Math.max(0, keywordIndex - 20), keywordIndex)
      const hasDeviationBefore = DEVIATION_INDICATORS.some(ind => beforeKeyword.includes(ind))
      if (hasDeviationBefore) {
        // Extract the phrase with the deviation indicator
        for (const ind of DEVIATION_INDICATORS) {
          const indIndex = beforeKeyword.lastIndexOf(ind)
          if (indIndex >= 0) {
            return lowerText.substring(keywordIndex - 20 + indIndex, keywordIndex + parsed.mainKeyword.length + 5).trim()
          }
        }
      }
    }
    return parsed.mainKeyword
  }

  // Priority 5: Use summary.issue if available
  if (parsed.summary && parsed.summary.issue) {
    return parsed.summary.issue
  }

  return null
}

// NOTE: extractDeviationsForHazard is now re-exported from rootCauseEngine.js
// The new implementation uses predefined root causes with keyword detection
// instead of free-text extraction, resulting in better categorization and
// significantly reduced "Other" category (target: <30% vs previous 70-81%)

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get color for root cause
 */
const getRootCauseColor = (rootCause) => {
  const colors = {
    'Inadequate Training': '#8b5cf6',
    'Lack of Supervision': '#f97316',
    'Improper PPE Usage': '#eab308',
    'Equipment Failure': '#dc2626',
    'Poor Housekeeping': '#6366f1',
    'Unsafe Work Practice': '#ef4444',
    'Inadequate Procedure': '#14b8a6',
    'Environmental Conditions': '#22c55e',
    'Human Error': '#f43f5e',
    'Communication Failure': '#3b82f6',
    'Fatigue': '#a855f7',
    'Time Pressure': '#ec4899',
    'Not Specified': '#9ca3af',
    'Other': '#64748b'
  }
  return colors[rootCause] || '#94a3b8'
}

// ============================================================================
// SEASONAL PATTERN DETECTION
// ============================================================================

/**
 * Detect seasonal patterns in incident data
 * Analyzes day-of-week, hour-of-day, and month-of-year patterns
 * Returns patterns with statistical significance
 */
export const detectSeasonalPatterns = (incidents) => {
  if (!incidents || incidents.length < 30) {
    return {
      hasData: false,
      error: 'Insufficient data for seasonal analysis (need at least 30 incidents)',
      dayOfWeek: null,
      hourOfDay: null,
      monthOfYear: null,
      riskFactors: null
    }
  }

  const dayOfWeek = getDayOfWeekPatterns(incidents)
  const hourOfDay = getHourlyPatterns(incidents)
  const monthOfYear = getMonthlySeasonality(incidents)
  const riskFactors = calculateSeasonalRiskFactors(dayOfWeek, hourOfDay, monthOfYear)

  return {
    hasData: true,
    dayOfWeek,
    hourOfDay,
    monthOfYear,
    riskFactors,
    summary: generateSeasonalSummary(dayOfWeek, hourOfDay, monthOfYear)
  }
}

/**
 * Analyze day-of-week patterns with statistical analysis
 * Returns patterns with risk indices and confidence
 */
export const getDayOfWeekPatterns = (incidents) => {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const shortNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const counts = [0, 0, 0, 0, 0, 0, 0]
  const severityCounts = Array(7).fill(null).map(() => ({ high: 0, medium: 0, low: 0 }))

  incidents.forEach(incident => {
    if (!incident.date) return
    try {
      const date = parseISO(incident.date.substring(0, 10))
      const dayIndex = date.getDay()
      counts[dayIndex]++

      // Track severity by day
      const type = (incident.type || '').toLowerCase()
      if (type.includes('lti') || type.includes('lost time')) {
        severityCounts[dayIndex].high++
      } else if (type.includes('mti') || type.includes('medical')) {
        severityCounts[dayIndex].medium++
      } else {
        severityCounts[dayIndex].low++
      }
    } catch (e) { /* skip invalid dates */ }
  })

  const total = counts.reduce((a, b) => a + b, 0)
  if (total === 0) return { patterns: [], insights: [], hasData: false }

  const expectedPerDay = total / 7
  const variance = counts.reduce((sum, c) => sum + Math.pow(c - expectedPerDay, 2), 0) / 7
  const stdDev = Math.sqrt(variance)

  // Calculate chi-square for statistical significance
  const chiSquare = counts.reduce((sum, observed) => {
    return sum + Math.pow(observed - expectedPerDay, 2) / expectedPerDay
  }, 0)
  const isSignificant = chiSquare > 12.59 // p < 0.05 with df=6

  const patterns = dayNames.map((day, index) => {
    const count = counts[index]
    const percentage = (count / total) * 100
    const deviation = stdDev > 0 ? (count - expectedPerDay) / stdDev : 0
    const riskIndex = expectedPerDay > 0 ? (count / expectedPerDay) * 100 : 100

    let riskLevel = 'normal'
    if (riskIndex > 130) riskLevel = 'high'
    else if (riskIndex > 115) riskLevel = 'elevated'
    else if (riskIndex < 70) riskLevel = 'low'

    return {
      day,
      shortName: shortNames[index],
      dayIndex: index,
      count,
      percentage: Math.round(percentage * 10) / 10,
      expected: Math.round(expectedPerDay * 10) / 10,
      deviation: Math.round(deviation * 100) / 100,
      riskIndex: Math.round(riskIndex),
      riskLevel,
      isWeekend: index === 0 || index === 6,
      severity: severityCounts[index]
    }
  })

  // Find peak and low days
  const sortedByCount = [...patterns].sort((a, b) => b.count - a.count)
  const peakDay = sortedByCount[0]
  const lowDay = sortedByCount[sortedByCount.length - 1]

  // Generate insights
  const insights = []
  if (isSignificant) {
    insights.push({
      type: 'significant',
      message: `Day-of-week pattern is statistically significant (χ² = ${chiSquare.toFixed(1)})`,
      confidence: 'high'
    })
  }
  if (peakDay.riskIndex > 130) {
    insights.push({
      type: 'peak',
      message: `${peakDay.day} has ${peakDay.riskIndex - 100}% more incidents than average`,
      day: peakDay.day,
      riskIndex: peakDay.riskIndex
    })
  }
  if (lowDay.riskIndex < 70) {
    insights.push({
      type: 'low',
      message: `${lowDay.day} has ${100 - lowDay.riskIndex}% fewer incidents than average`,
      day: lowDay.day,
      riskIndex: lowDay.riskIndex
    })
  }

  // Weekend vs weekday analysis
  const weekendCount = counts[0] + counts[6]
  const weekdayCount = total - weekendCount
  const weekendExpected = (total / 7) * 2
  const weekdayExpected = (total / 7) * 5
  const weekendRatio = weekendExpected > 0 ? weekendCount / weekendExpected : 1

  if (weekendRatio > 1.2) {
    insights.push({
      type: 'weekend_high',
      message: `Weekend incidents are ${Math.round((weekendRatio - 1) * 100)}% higher than expected`,
      ratio: weekendRatio
    })
  } else if (weekendRatio < 0.8) {
    insights.push({
      type: 'weekend_low',
      message: `Weekend incidents are ${Math.round((1 - weekendRatio) * 100)}% lower than expected`,
      ratio: weekendRatio
    })
  }

  return {
    patterns,
    insights,
    hasData: true,
    isSignificant,
    chiSquare: Math.round(chiSquare * 10) / 10,
    peakDay: peakDay.day,
    lowDay: lowDay.day,
    weekendRatio: Math.round(weekendRatio * 100) / 100
  }
}

/**
 * Analyze hourly patterns (time-of-day analysis)
 * Returns patterns grouped by shift and with peak/off-peak identification
 */
export const getHourlyPatterns = (incidents) => {
  const hourCounts = Array(24).fill(0)
  const severityByHour = Array(24).fill(null).map(() => ({ high: 0, medium: 0, low: 0 }))
  let hasTimeData = false

  incidents.forEach(incident => {
    let hour = null

    // Try eventTime first
    if (incident.eventTime) {
      const match = incident.eventTime.match(/(\d{1,2}):?(\d{2})?/)
      if (match) {
        hour = parseInt(match[1], 10)
        if (hour >= 0 && hour < 24) hasTimeData = true
      }
    }

    // Fallback to date if it includes time (ISO format)
    if (hour === null && incident.date && incident.date.includes('T')) {
      const timePart = incident.date.split('T')[1]
      if (timePart) {
        const match = timePart.match(/(\d{2}):(\d{2})/)
        if (match) {
          hour = parseInt(match[1], 10)
          if (hour >= 0 && hour < 24) hasTimeData = true
        }
      }
    }

    if (hour !== null && hour >= 0 && hour < 24) {
      hourCounts[hour]++

      // Track severity
      const type = (incident.type || '').toLowerCase()
      if (type.includes('lti') || type.includes('lost time')) {
        severityByHour[hour].high++
      } else if (type.includes('mti') || type.includes('medical')) {
        severityByHour[hour].medium++
      } else {
        severityByHour[hour].low++
      }
    }
  })

  const total = hourCounts.reduce((a, b) => a + b, 0)
  if (total === 0 || !hasTimeData) {
    return { patterns: [], shifts: [], insights: [], hasData: false }
  }

  const expectedPerHour = total / 24

  // Define shifts
  const shiftDefinitions = {
    morning: { start: 6, end: 12, label: 'Morning (6AM-12PM)', color: '#f59e0b' },
    afternoon: { start: 12, end: 18, label: 'Afternoon (12PM-6PM)', color: '#ef4444' },
    evening: { start: 18, end: 22, label: 'Evening (6PM-10PM)', color: '#8b5cf6' },
    night: { start: 22, end: 6, label: 'Night (10PM-6AM)', color: '#3b82f6' }
  }

  const patterns = hourCounts.map((count, hour) => {
    const percentage = (count / total) * 100
    const riskIndex = expectedPerHour > 0 ? (count / expectedPerHour) * 100 : 100

    let shift = 'night'
    if (hour >= 6 && hour < 12) shift = 'morning'
    else if (hour >= 12 && hour < 18) shift = 'afternoon'
    else if (hour >= 18 && hour < 22) shift = 'evening'

    let riskLevel = 'normal'
    if (riskIndex > 150) riskLevel = 'high'
    else if (riskIndex > 120) riskLevel = 'elevated'
    else if (riskIndex < 50) riskLevel = 'low'

    return {
      hour,
      hourLabel: `${hour.toString().padStart(2, '0')}:00`,
      hour12: hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`,
      count,
      percentage: Math.round(percentage * 10) / 10,
      expected: Math.round(expectedPerHour * 10) / 10,
      riskIndex: Math.round(riskIndex),
      riskLevel,
      shift,
      shiftLabel: shiftDefinitions[shift].label,
      severity: severityByHour[hour]
    }
  })

  // Calculate shift totals
  const shifts = Object.entries(shiftDefinitions).map(([key, def]) => {
    let shiftTotal = 0
    let hoursInShift = 0

    for (let h = 0; h < 24; h++) {
      const inShift = key === 'night'
        ? (h >= def.start || h < def.end)
        : (h >= def.start && h < def.end)
      if (inShift) {
        shiftTotal += hourCounts[h]
        hoursInShift++
      }
    }

    const expectedForShift = (total / 24) * hoursInShift
    const riskIndex = expectedForShift > 0 ? (shiftTotal / expectedForShift) * 100 : 100

    return {
      key,
      label: def.label,
      color: def.color,
      count: shiftTotal,
      hours: hoursInShift,
      percentage: Math.round((shiftTotal / total) * 100 * 10) / 10,
      riskIndex: Math.round(riskIndex),
      riskLevel: riskIndex > 130 ? 'high' : riskIndex > 115 ? 'elevated' : riskIndex < 70 ? 'low' : 'normal'
    }
  })

  // Find peak hours (top 3)
  const sortedByCount = [...patterns].sort((a, b) => b.count - a.count)
  const peakHours = sortedByCount.slice(0, 3).filter(p => p.count > 0)

  // Generate insights
  const insights = []
  if (peakHours.length > 0) {
    const peakHoursList = peakHours.map(p => p.hour12).join(', ')
    insights.push({
      type: 'peak_hours',
      message: `Peak incident hours: ${peakHoursList}`,
      hours: peakHours.map(p => p.hour)
    })
  }

  const highRiskShift = shifts.find(s => s.riskIndex > 130)
  if (highRiskShift) {
    insights.push({
      type: 'high_risk_shift',
      message: `${highRiskShift.label} has ${highRiskShift.riskIndex - 100}% more incidents than expected`,
      shift: highRiskShift.key,
      riskIndex: highRiskShift.riskIndex
    })
  }

  return {
    patterns,
    shifts,
    insights,
    hasData: true,
    peakHours: peakHours.map(p => p.hour),
    totalWithTime: total
  }
}

/**
 * Analyze monthly seasonality patterns
 * Returns month-over-month patterns and yearly trends
 */
export const getMonthlySeasonality = (incidents) => {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const fullMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const monthCounts = Array(12).fill(0)
  const monthYearCounts = {} // Track by year-month for trend analysis

  incidents.forEach(incident => {
    if (!incident.date) return
    try {
      const date = parseISO(incident.date.substring(0, 10))
      const monthIndex = date.getMonth()
      monthCounts[monthIndex]++

      const yearMonth = format(date, 'yyyy-MM')
      monthYearCounts[yearMonth] = (monthYearCounts[yearMonth] || 0) + 1
    } catch (e) { /* skip invalid dates */ }
  })

  const total = monthCounts.reduce((a, b) => a + b, 0)
  if (total === 0) return { patterns: [], insights: [], hasData: false }

  const expectedPerMonth = total / 12

  // Calculate chi-square for significance
  const chiSquare = monthCounts.reduce((sum, observed) => {
    return sum + Math.pow(observed - expectedPerMonth, 2) / expectedPerMonth
  }, 0)
  const isSignificant = chiSquare > 19.68 // p < 0.05 with df=11

  const patterns = monthNames.map((month, index) => {
    const count = monthCounts[index]
    const percentage = (count / total) * 100
    const riskIndex = expectedPerMonth > 0 ? (count / expectedPerMonth) * 100 : 100

    let riskLevel = 'normal'
    if (riskIndex > 140) riskLevel = 'high'
    else if (riskIndex > 120) riskLevel = 'elevated'
    else if (riskIndex < 60) riskLevel = 'low'

    // Determine season
    let season = 'winter'
    if (index >= 2 && index <= 4) season = 'spring'
    else if (index >= 5 && index <= 7) season = 'summer'
    else if (index >= 8 && index <= 10) season = 'fall'

    return {
      month,
      fullName: fullMonthNames[index],
      monthIndex: index,
      count,
      percentage: Math.round(percentage * 10) / 10,
      expected: Math.round(expectedPerMonth * 10) / 10,
      riskIndex: Math.round(riskIndex),
      riskLevel,
      season
    }
  })

  // Find peak and low months
  const sortedByCount = [...patterns].sort((a, b) => b.count - a.count)
  const peakMonths = sortedByCount.slice(0, 3).filter(p => p.riskIndex > 100)
  const lowMonths = sortedByCount.slice(-3).filter(p => p.riskIndex < 100)

  // Seasonal analysis
  const seasonCounts = { winter: 0, spring: 0, summer: 0, fall: 0 }
  patterns.forEach(p => { seasonCounts[p.season] += p.count })

  const seasonPatterns = Object.entries(seasonCounts).map(([season, count]) => ({
    season,
    label: season.charAt(0).toUpperCase() + season.slice(1),
    count,
    percentage: Math.round((count / total) * 100 * 10) / 10,
    riskIndex: Math.round((count / (total / 4)) * 100)
  }))

  // Generate insights
  const insights = []
  if (isSignificant) {
    insights.push({
      type: 'significant',
      message: `Monthly pattern is statistically significant (χ² = ${chiSquare.toFixed(1)})`,
      confidence: 'high'
    })
  }

  if (peakMonths.length > 0 && peakMonths[0].riskIndex > 130) {
    insights.push({
      type: 'peak_months',
      message: `Highest incidents in ${peakMonths.map(p => p.fullName).join(', ')}`,
      months: peakMonths.map(p => p.monthIndex)
    })
  }

  const peakSeason = seasonPatterns.reduce((a, b) => a.riskIndex > b.riskIndex ? a : b)
  if (peakSeason.riskIndex > 120) {
    insights.push({
      type: 'peak_season',
      message: `${peakSeason.label} season has ${peakSeason.riskIndex - 100}% more incidents than average`,
      season: peakSeason.season,
      riskIndex: peakSeason.riskIndex
    })
  }

  // Year-over-year trend
  const yearMonthEntries = Object.entries(monthYearCounts).sort((a, b) => a[0].localeCompare(b[0]))
  const trend = yearMonthEntries.map(([yearMonth, count]) => ({
    period: yearMonth,
    label: format(parseISO(`${yearMonth}-01`), 'MMM yy'),
    count
  }))

  return {
    patterns,
    seasonPatterns,
    trend,
    insights,
    hasData: true,
    isSignificant,
    chiSquare: Math.round(chiSquare * 10) / 10,
    peakMonth: patterns.reduce((a, b) => a.count > b.count ? a : b).fullName,
    lowMonth: patterns.reduce((a, b) => a.count < b.count ? a : b).fullName
  }
}

/**
 * Calculate seasonal risk factors for predictive scoring
 * Returns combined risk multiplier based on current time factors
 */
export const calculateSeasonalRiskFactors = (dayOfWeek, hourOfDay, monthOfYear) => {
  const now = new Date()
  const currentDayIndex = now.getDay()
  const currentHour = now.getHours()
  const currentMonth = now.getMonth()

  let dayRisk = 1.0
  let hourRisk = 1.0
  let monthRisk = 1.0

  // Day of week risk
  if (dayOfWeek?.patterns) {
    const todayPattern = dayOfWeek.patterns.find(p => p.dayIndex === currentDayIndex)
    if (todayPattern) {
      dayRisk = todayPattern.riskIndex / 100
    }
  }

  // Hour of day risk
  if (hourOfDay?.patterns) {
    const hourPattern = hourOfDay.patterns.find(p => p.hour === currentHour)
    if (hourPattern) {
      hourRisk = hourPattern.riskIndex / 100
    }
  }

  // Month risk
  if (monthOfYear?.patterns) {
    const monthPattern = monthOfYear.patterns.find(p => p.monthIndex === currentMonth)
    if (monthPattern) {
      monthRisk = monthPattern.riskIndex / 100
    }
  }

  // Combined risk (geometric mean to avoid extreme values)
  const combinedRisk = Math.pow(dayRisk * hourRisk * monthRisk, 1/3)

  let riskLevel = 'normal'
  if (combinedRisk > 1.3) riskLevel = 'high'
  else if (combinedRisk > 1.15) riskLevel = 'elevated'
  else if (combinedRisk < 0.7) riskLevel = 'low'

  return {
    current: {
      dayRisk: Math.round(dayRisk * 100),
      hourRisk: Math.round(hourRisk * 100),
      monthRisk: Math.round(monthRisk * 100),
      combinedRisk: Math.round(combinedRisk * 100),
      riskLevel
    },
    today: dayOfWeek?.patterns?.find(p => p.dayIndex === currentDayIndex),
    thisHour: hourOfDay?.patterns?.find(p => p.hour === currentHour),
    thisMonth: monthOfYear?.patterns?.find(p => p.monthIndex === currentMonth)
  }
}

/**
 * Generate natural language summary of seasonal patterns
 */
const generateSeasonalSummary = (dayOfWeek, hourOfDay, monthOfYear) => {
  const summaryPoints = []

  // Day of week summary
  if (dayOfWeek?.hasData && dayOfWeek.peakDay) {
    const peakPattern = dayOfWeek.patterns.find(p => p.day === dayOfWeek.peakDay)
    if (peakPattern && peakPattern.riskIndex > 115) {
      summaryPoints.push(`${dayOfWeek.peakDay}s have the highest incident rate (${peakPattern.riskIndex}% of average)`)
    }
  }

  // Hour summary
  if (hourOfDay?.hasData && hourOfDay.peakHours?.length > 0) {
    const peakHourPatterns = hourOfDay.patterns.filter(p => hourOfDay.peakHours.includes(p.hour))
    const peakTimeRange = peakHourPatterns.map(p => p.hour12).join(', ')
    summaryPoints.push(`Peak incident times: ${peakTimeRange}`)
  }

  // Month summary
  if (monthOfYear?.hasData && monthOfYear.peakMonth) {
    const peakPattern = monthOfYear.patterns.find(p => p.fullName === monthOfYear.peakMonth)
    if (peakPattern && peakPattern.riskIndex > 120) {
      summaryPoints.push(`${monthOfYear.peakMonth} historically has the most incidents (${peakPattern.riskIndex}% of average)`)
    }
  }

  return summaryPoints
}

/**
 * Predict risk for upcoming periods based on seasonal patterns
 * Returns predictions for next 7 days with risk levels
 */
export const predictSeasonalRisk = (incidents, daysAhead = 7) => {
  const seasonalData = detectSeasonalPatterns(incidents)

  if (!seasonalData.hasData) {
    return {
      predictions: [],
      hasData: false,
      error: seasonalData.error
    }
  }

  const predictions = []
  const today = new Date()

  for (let i = 0; i < daysAhead; i++) {
    const targetDate = new Date(today.getTime() + i * 24 * 60 * 60 * 1000)
    const dayIndex = targetDate.getDay()
    const monthIndex = targetDate.getMonth()

    // Get base risks from patterns
    const dayPattern = seasonalData.dayOfWeek?.patterns?.find(p => p.dayIndex === dayIndex)
    const monthPattern = seasonalData.monthOfYear?.patterns?.find(p => p.monthIndex === monthIndex)

    const dayRisk = dayPattern?.riskIndex || 100
    const monthRisk = monthPattern?.riskIndex || 100

    // Combined risk
    const combinedRisk = Math.round(Math.sqrt(dayRisk * monthRisk))

    let riskLevel = 'normal'
    if (combinedRisk > 125) riskLevel = 'high'
    else if (combinedRisk > 110) riskLevel = 'elevated'
    else if (combinedRisk < 80) riskLevel = 'low'

    predictions.push({
      date: format(targetDate, 'yyyy-MM-dd'),
      dateLabel: format(targetDate, 'EEE, MMM d'),
      dayName: dayPattern?.day || format(targetDate, 'EEEE'),
      dayRisk,
      monthRisk,
      combinedRisk,
      riskLevel,
      isToday: i === 0,
      isWeekend: dayIndex === 0 || dayIndex === 6
    })
  }

  // Find highest risk day
  const highestRiskDay = predictions.reduce((a, b) => a.combinedRisk > b.combinedRisk ? a : b)

  return {
    predictions,
    hasData: true,
    highestRiskDay,
    summary: {
      highRiskDays: predictions.filter(p => p.riskLevel === 'high').length,
      elevatedDays: predictions.filter(p => p.riskLevel === 'elevated').length,
      averageRisk: Math.round(predictions.reduce((sum, p) => sum + p.combinedRisk, 0) / predictions.length)
    }
  }
}

/**
 * Calculate risk scores grouped by dimension (contractor, site, or subregion)
 * @param {Array} incidents - Array of incident objects
 * @param {string} dimension - 'contractor', 'site', or 'subregion'
 * @param {Object} siteClassifications - Map of site names to sub-region values (required for subregion dimension)
 * @returns {Array} Sorted array of { name, score, level, incidentCount }
 */
export const calculateRiskByDimension = (incidents, dimension, siteClassifications = {}) => {
  if (!incidents || incidents.length === 0) return []

  // Group incidents by the specified dimension
  const groups = new Map()

  incidents.forEach(incident => {
    let key = null

    switch (dimension) {
      case 'contractor':
        key = incident.contractor
        break
      case 'site':
        key = incident.site
        break
      case 'subregion':
        // Use site classifications to determine subregion
        key = siteClassifications[incident.site] || 'Unclassified'
        break
      default:
        key = incident.contractor
    }

    if (!key) return

    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key).push(incident)
  })

  // Calculate risk score for each group
  const results = []

  groups.forEach((groupIncidents, name) => {
    const riskData = calculateRiskScore(groupIncidents)

    results.push({
      name,
      score: riskData.score,
      level: riskData.level,
      incidentCount: groupIncidents.length
    })
  })

  // Sort by score descending (highest risk at top - but score is inverted, so lowest score = highest risk)
  results.sort((a, b) => a.score - b.score)

  return results
}
