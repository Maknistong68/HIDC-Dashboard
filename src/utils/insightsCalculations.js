/**
 * Predictive Analytics Calculations for HSE Dashboard
 * Provides insights, recommendations, and trend analysis
 */

import { parseISO, format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths, differenceInDays } from 'date-fns'
import { getContractorMetrics, getNearMissMetrics, getObservationsByHour, getObservationsByDayOfWeek } from './dataQualityCalculations'
import { MAJOR_HAZARDS, ROOT_CAUSES } from './constants'

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
  const attention = withAge.filter(o => o.age > daysThreshold && o.age <= 30)

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

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
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
 */
export const calculateRiskScore = (incidents) => {
  if (incidents.length === 0) return { score: 0, level: 'unknown', factors: [] }

  const factors = []
  let totalWeight = 0
  let weightedSum = 0

  // Factor 1: Near-miss rate (weight: 25)
  const nearMiss = getNearMissAnalysis(incidents)
  const nmScore = Math.min(100, (nearMiss.rateValue / 5) * 100)
  factors.push({ name: 'Near-Miss Reporting', score: nmScore, weight: 25, status: nearMiss.status })
  weightedSum += nmScore * 25
  totalWeight += 25

  // Factor 2: Open actions age (weight: 25)
  const overdueAlerts = getOverdueActionAlerts(incidents)
  const overdueCount = overdueAlerts.reduce((sum, a) => sum + (a.metric || 0), 0)
  const openActionsScore = Math.max(0, 100 - (overdueCount * 5))
  factors.push({
    name: 'Action Closure',
    score: openActionsScore,
    weight: 25,
    status: overdueCount > 10 ? 'critical' : overdueCount > 5 ? 'warning' : 'good'
  })
  weightedSum += openActionsScore * 25
  totalWeight += 25

  // Factor 3: Coverage balance (weight: 20)
  const hourData = getObservationsByHour(incidents)
  const coverageScore = hourData.summary.hasTimeData
    ? Math.min(100, (parseFloat(hourData.summary.nightShiftPct) / 25) * 100)
    : 50
  factors.push({
    name: 'Shift Coverage',
    score: coverageScore,
    weight: 20,
    status: coverageScore < 50 ? 'warning' : 'good'
  })
  weightedSum += coverageScore * 20
  totalWeight += 20

  // Factor 4: Contractor performance (weight: 30)
  const outliers = getPerformanceOutliers(incidents)
  const contractorScore = Math.max(0, 100 - (outliers.criticalCount * 20) - (outliers.warningCount * 10))
  factors.push({
    name: 'Contractor Quality',
    score: contractorScore,
    weight: 30,
    status: outliers.criticalCount > 0 ? 'critical' : outliers.warningCount > 0 ? 'warning' : 'good'
  })
  weightedSum += contractorScore * 30
  totalWeight += 30

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
 * Linear regression forecasting
 * Uses least squares method to fit a line and project future values
 */
export const forecastIncidents = (incidents, forecastDays = 30) => {
  // Group incidents by date
  const dates = incidents.map(i => i.date).filter(Boolean).sort()
  if (dates.length < 7) {
    return {
      historical: [],
      forecast: [],
      model: null,
      alerts: [],
      error: 'Insufficient data for forecasting (need at least 7 days)'
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

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

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
