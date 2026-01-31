/**
 * Data Quality Calculations for HSE Executive Dashboard
 * Provides metrics for coverage, quality, and performance analysis
 */

import { parseISO, format, startOfMonth, endOfMonth, eachMonthOfInterval, differenceInDays } from 'date-fns'
import { CONTEXT_REDIRECTS, HAZARD_PHRASES, HAZARD_PATTERNS, MAJOR_HAZARDS, FOUL_WORDS_LIST, VAGUE_HAZARD_TERMS } from './constants'
import { analyzeObservation } from './contextClassifier'
import { categorizeHazard } from './excelParser'
import { getSettings } from './settingsReader'

/**
 * Extract hour from eventTime field (format: "HH:MM") or date string
 */
export const extractHour = (eventTime, dateStr) => {
  // First try the dedicated eventTime field (preferred)
  if (eventTime && typeof eventTime === 'string') {
    const timeMatch = eventTime.match(/^(\d{1,2}):(\d{2})/)
    if (timeMatch) {
      const hour = parseInt(timeMatch[1], 10)
      if (hour >= 0 && hour < 24) {
        return hour
      }
    }
  }

  // Fallback: try to extract time from date string
  if (dateStr) {
    const timeMatch = String(dateStr).match(/(\d{1,2}):(\d{2})/)
    if (timeMatch) {
      const hour = parseInt(timeMatch[1], 10)
      if (hour >= 0 && hour < 24) {
        return hour
      }
    }
  }

  return null
}

/**
 * Extract day of week from date string
 * Returns 0-6 (Sunday-Saturday)
 */
export const extractDayOfWeek = (dateStr) => {
  if (!dateStr) return null

  // Try DD/MM/YYYY format first
  const ddmmMatch = String(dateStr).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (ddmmMatch) {
    const day = parseInt(ddmmMatch[1], 10)
    const month = parseInt(ddmmMatch[2], 10) - 1
    const year = parseInt(ddmmMatch[3], 10)
    const date = new Date(year, month, day)
    return date.getDay()
  }

  // Try YYYY-MM-DD format
  try {
    const date = parseISO(dateStr.substring(0, 10))
    if (!isNaN(date.getTime())) {
      return date.getDay()
    }
  } catch {
    return null
  }

  return null
}

/**
 * Count words in a string
 */
export const countWords = (text) => {
  if (!text || typeof text !== 'string') return 0
  return text.trim().split(/\s+/).filter(word => word.length > 0).length
}

/**
 * Calculate observations by day of week
 */
export const getObservationsByDayOfWeek = (incidents) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const counts = [0, 0, 0, 0, 0, 0, 0]

  incidents.forEach(incident => {
    const dayIndex = extractDayOfWeek(incident.date)
    if (dayIndex !== null) {
      counts[dayIndex]++
    }
  })

  const total = counts.reduce((a, b) => a + b, 0)
  const avgPerDay = total / 7

  return days.map((day, index) => ({
    day,
    dayIndex: index,
    count: counts[index],
    percentage: total > 0 ? ((counts[index] / total) * 100).toFixed(1) : '0.0',
    isGap: counts[index] < avgPerDay * 0.5, // Less than 50% of average = gap
    isWeekend: index === 0 || index === 6
  }))
}

/**
 * Calculate observations by hour of day
 */
export const getObservationsByHour = (incidents) => {
  const hourCounts = Array(24).fill(0)
  let hasTimeData = false

  incidents.forEach(incident => {
    // Use eventTime field (from import) or fallback to parsing date
    const hour = extractHour(incident.eventTime, incident.date)
    if (hour !== null) {
      hourCounts[hour]++
      hasTimeData = true
    }
  })

  const total = hourCounts.reduce((a, b) => a + b, 0)
  const dayShiftTotal = hourCounts.slice(6, 18).reduce((a, b) => a + b, 0)
  const nightShiftTotal = total - dayShiftTotal

  return {
    hourly: hourCounts.map((count, hour) => ({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      hourNum: hour,
      count,
      percentage: total > 0 ? ((count / total) * 100).toFixed(1) : '0.0',
      shift: hour >= 6 && hour < 18 ? 'day' : 'night',
      isPeak: count > (total / 24) * 2 // More than 2x average = peak
    })),
    summary: {
      dayShift: dayShiftTotal,
      nightShift: nightShiftTotal,
      dayShiftPct: total > 0 ? ((dayShiftTotal / total) * 100).toFixed(1) : '0.0',
      nightShiftPct: total > 0 ? ((nightShiftTotal / total) * 100).toFixed(1) : '0.0',
      hasTimeData
    }
  }
}

/**
 * Calculate categorization quality metrics
 */
export const getCategorizationMetrics = (incidents) => {
  const blankCategories = ['', null, undefined, 'Not Specified', 'Not specified']
  const otherCategories = ['Other', 'Others', 'other', 'others', 'General', 'General Safety']

  let proper = 0
  let blank = 0
  let other = 0

  incidents.forEach(incident => {
    const location = incident.location?.trim()
    if (!location || blankCategories.includes(location)) {
      blank++
    } else if (otherCategories.includes(location)) {
      other++
    } else {
      proper++
    }
  })

  const total = incidents.length
  return {
    proper,
    blank,
    other,
    total,
    properRate: total > 0 ? ((proper / total) * 100).toFixed(1) : '0.0',
    status: (proper / total) >= 0.8 ? 'good' : (proper / total) >= 0.6 ? 'warning' : 'poor'
  }
}

/**
 * Calculate description quality metrics
 */
export const getDescriptionMetrics = (incidents) => {
  const distribution = {
    veryShort: 0,  // 0-5 words
    short: 0,      // 6-15 words
    good: 0,       // 16-30 words
    excellent: 0   // 31+ words
  }

  let totalWords = 0
  const flaggedRecords = []

  incidents.forEach(incident => {
    const wordCount = countWords(incident.description)
    totalWords += wordCount

    if (wordCount <= 5) {
      distribution.veryShort++
      flaggedRecords.push({
        id: incident.id || incident.externalId,
        date: incident.date,
        reporter: incident.reportedBy,
        issue: 'Short description',
        description: incident.description?.substring(0, 50) || '(empty)',
        wordCount
      })
    } else if (wordCount <= 15) {
      distribution.short++
    } else if (wordCount <= 30) {
      distribution.good++
    } else {
      distribution.excellent++
    }
  })

  const total = incidents.length
  const qualityCount = distribution.good + distribution.excellent
  const qualityRate = total > 0 ? (qualityCount / total) * 100 : 0

  return {
    distribution,
    avgWordCount: total > 0 ? Math.round(totalWords / total) : 0,
    qualityRate: qualityRate.toFixed(1),
    flaggedCount: distribution.veryShort,
    flaggedRecords: flaggedRecords.slice(0, 50), // Limit to 50
    status: qualityRate >= 75 ? 'good' : qualityRate >= 50 ? 'warning' : 'poor'
  }
}

/**
 * Get records flagged for miscategorization review
 * Returns all incidents where user has flagged the category as wrong
 */
export const getFlaggedRecords = (incidents) => {
  return incidents.filter(i => i._flaggedMiscategorized === true)
}

/**
 * Calculate near miss rate (leading indicator)
 * Denominator: Only incident types that form the traditional safety pyramid
 * (LTI, MTI, FAC, Near-miss, Unsafe Act, Unsafe Condition)
 * Excludes: Positive observations, NCR, Leadership events
 */
export const getNearMissMetrics = (incidents) => {
  // Only include traditional safety pyramid types in denominator
  const pyramidTypes = ['lti', 'mti', 'fac', 'near-miss', 'unsafe-act', 'unsafe-condition']
  const pyramidIncidents = incidents.filter(i => pyramidTypes.includes(i.type))
  const nearMisses = incidents.filter(i => i.type === 'near-miss')

  const total = pyramidIncidents.length
  const nmCount = nearMisses.length
  const rate = total > 0 ? (nmCount / total) * 100 : 0

  return {
    count: nmCount,
    total,
    nonPositiveCount: total, // For backward compatibility with drill-down
    rate: rate.toFixed(1),
    // Scale: 5%+ = good, 2-5% = warning, <2% = poor (underreporting)
    status: rate >= 5 ? 'good' : rate >= 2 ? 'warning' : 'poor',
    target: 5, // Industry benchmark: 5%
    gap: Math.max(0, 5 - rate).toFixed(1)
  }
}

/**
 * Calculate reporter performance metrics
 */
export const getReporterMetrics = (incidents) => {
  const reporters = {}

  incidents.forEach(incident => {
    const name = incident.reportedBy || 'Unknown'
    if (!reporters[name]) {
      reporters[name] = {
        name,
        total: 0,
        unsafeAct: 0,
        unsafeCondition: 0,
        nearMiss: 0,
        positive: 0,
        totalWords: 0,
        qualityCount: 0 // descriptions > 15 words
      }
    }

    reporters[name].total++

    if (incident.type === 'unsafe-act') reporters[name].unsafeAct++
    else if (incident.type === 'unsafe-condition') reporters[name].unsafeCondition++
    else if (incident.type === 'near-miss') reporters[name].nearMiss++
    else if (incident.type === 'positive') reporters[name].positive++

    const wordCount = countWords(incident.description)
    reporters[name].totalWords += wordCount
    if (wordCount > 15) reporters[name].qualityCount++
  })

  return Object.values(reporters)
    .map(r => ({
      ...r,
      avgWordCount: r.total > 0 ? Math.round(r.totalWords / r.total) : 0,
      qualityRate: r.total > 0 ? ((r.qualityCount / r.total) * 100).toFixed(1) : '0.0',
      nonPositive: r.total - r.positive
    }))
    .sort((a, b) => b.total - a.total)
}

/**
 * Calculate contractor quality metrics
 */
export const getContractorMetrics = (incidents) => {
  const contractors = {}

  incidents.forEach(incident => {
    const name = incident.contractor || 'Unassigned'
    if (!contractors[name]) {
      contractors[name] = {
        name,
        total: 0,
        properCategory: 0,
        totalWords: 0,
        qualityCount: 0,
        nearMiss: 0,
        nonPositive: 0,
        datesSet: new Set(),
        reporters: new Set()
      }
    }

    const c = contractors[name]
    c.total++

    // Track dates for coverage calculation
    if (incident.date) {
      c.datesSet.add(incident.date.substring(0, 10))
    }

    // Track reporters
    if (incident.reportedBy) {
      c.reporters.add(incident.reportedBy)
    }

    // Categorization
    const loc = incident.location?.trim()
    if (loc && !['', 'Other', 'Others', 'Not Specified'].includes(loc)) {
      c.properCategory++
    }

    // Description quality
    const wordCount = countWords(incident.description)
    c.totalWords += wordCount
    if (wordCount > 15) c.qualityCount++

    // Near miss & non-positive
    if (incident.type === 'near-miss') c.nearMiss++
    if (incident.type !== 'positive') c.nonPositive++
  })

  return Object.values(contractors)
    .map(c => ({
      name: c.name,
      totalObs: c.total,
      categorizationRate: c.total > 0 ? ((c.properCategory / c.total) * 100).toFixed(1) : '0.0',
      avgWordCount: c.total > 0 ? Math.round(c.totalWords / c.total) : 0,
      qualityRate: c.total > 0 ? ((c.qualityCount / c.total) * 100).toFixed(1) : '0.0',
      nearMissRate: c.nonPositive > 0 ? ((c.nearMiss / c.nonPositive) * 100).toFixed(1) : '0.0',
      activeDays: c.datesSet.size,
      activeReporters: c.reporters.size,
      // Calculate composite quality score (0-100)
      qualityScore: Math.round(
        (c.total > 0 ? (c.properCategory / c.total) : 0) * 30 +
        (c.total > 0 ? (c.qualityCount / c.total) : 0) * 30 +
        (c.nonPositive > 0 ? Math.min((c.nearMiss / c.nonPositive) / 0.05, 1) : 0) * 20 +
        Math.min(c.datesSet.size / 30, 1) * 20
      )
    }))
    .sort((a, b) => b.totalObs - a.totalObs)
}

/**
 * Calculate coverage score (days with observations / total working days)
 */
export const getCoverageMetrics = (incidents, daysInPeriod = 30) => {
  const uniqueDates = new Set()

  incidents.forEach(incident => {
    if (incident.date) {
      uniqueDates.add(incident.date.substring(0, 10))
    }
  })

  const activeDays = uniqueDates.size
  const coverageRate = Math.min((activeDays / daysInPeriod) * 100, 100)

  return {
    activeDays,
    totalDays: daysInPeriod,
    rate: coverageRate.toFixed(1),
    status: coverageRate >= 90 ? 'good' : coverageRate >= 70 ? 'warning' : 'poor'
  }
}

/**
 * Calculate overall data quality score (0-100)
 * Now uses settings for quality score weights
 */
export const calculateQualityScore = (incidents) => {
  if (incidents.length === 0) return { score: 0, breakdown: {} }

  // Get settings for quality scoring weights
  const settings = getSettings()
  const qualitySettings = settings.validation?.qualityScoring || {}
  const customWeights = qualitySettings.weights || {}

  // Use custom weights from settings if available, otherwise use defaults
  const weights = {
    categorization: customWeights.categorization || 20,
    description: customWeights.description || 20,
    nearMiss: 15,
    coverage: customWeights.completeness || 20, // completeness maps to coverage
    reporters: 10,
    dataIntegrity: 15
  }

  // Normalize weights to sum to 100
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0)
  const normalizedWeights = {}
  for (const key in weights) {
    normalizedWeights[key] = (weights[key] / totalWeight) * 100
  }

  const categorization = getCategorizationMetrics(incidents)
  const description = getDescriptionMetrics(incidents)
  const nearMiss = getNearMissMetrics(incidents)
  const coverage = getCoverageMetrics(incidents)
  const reporters = getReporterMetrics(incidents)
  const duplicates = getDuplicateDescriptions(incidents)

  // Active reporters (>5 observations)
  const activeReporters = reporters.filter(r => r.total >= 5).length
  const totalReporters = reporters.length
  const reporterEngagement = totalReporters > 0 ? (activeReporters / totalReporters) * 100 : 0

  // Calculate composite score
  const categorizationScore = parseFloat(categorization.properRate)
  const descriptionScore = parseFloat(description.qualityRate)
  const nearMissScore = Math.min(parseFloat(nearMiss.rate) / 5 * 100, 100) // Scale: 5% = 100
  const coverageScore = parseFloat(coverage.rate)

  // Data Integrity score: Lower duplicate rate = higher score
  // Formula: 0% = 100%, 5% = 75%, 10% = 50%, 20%+ = 0%
  const duplicateRate = parseFloat(duplicates.duplicateRate)
  const dataIntegrityScore = Math.max(0, 100 - (duplicateRate * 5))
  const dataIntegrityStatus = duplicateRate <= 2 ? 'good' : duplicateRate <= 5 ? 'warning' : 'poor'

  // Calculate score using normalized weights
  const score = Math.round(
    categorizationScore * (normalizedWeights.categorization / 100) +
    descriptionScore * (normalizedWeights.description / 100) +
    nearMissScore * (normalizedWeights.nearMiss / 100) +
    coverageScore * (normalizedWeights.coverage / 100) +
    reporterEngagement * (normalizedWeights.reporters / 100) +
    dataIntegrityScore * (normalizedWeights.dataIntegrity / 100)
  )

  return {
    score,
    breakdown: {
      categorization: { value: categorizationScore, weight: Math.round(normalizedWeights.categorization), status: categorization.status },
      description: { value: descriptionScore, weight: Math.round(normalizedWeights.description), status: description.status },
      nearMiss: { value: nearMissScore, weight: Math.round(normalizedWeights.nearMiss), status: nearMiss.status, actualRate: nearMiss.rate },
      coverage: { value: coverageScore, weight: Math.round(normalizedWeights.coverage), status: coverage.status },
      reporters: { value: reporterEngagement, weight: Math.round(normalizedWeights.reporters), active: activeReporters, total: totalReporters },
      dataIntegrity: { value: dataIntegrityScore, weight: Math.round(normalizedWeights.dataIntegrity), status: dataIntegrityStatus, duplicateRate: duplicates.duplicateRate, duplicateCount: duplicates.totalDuplicates }
    },
    settingsApplied: true
  }
}

/**
 * Calculate monthly quality trend
 * @param incidents - Array of incidents
 * @param months - Number of months to show (default 12, or 0 for full data range)
 */
export const getQualityTrend = (incidents, months = 12) => {
  if (incidents.length === 0) return []

  // Get date range from actual data
  const dates = incidents.map(i => i.date).filter(Boolean).sort()
  if (dates.length === 0) return []

  const endDate = parseISO(dates[dates.length - 1])
  const startDate = new Date(endDate)

  // If months is 0, use full data range; otherwise use specified months
  if (months === 0) {
    const firstDate = parseISO(dates[0])
    startDate.setTime(firstDate.getTime())
  } else {
    startDate.setMonth(startDate.getMonth() - months + 1)
  }

  const monthsInRange = eachMonthOfInterval({
    start: startOfMonth(startDate),
    end: endOfMonth(endDate)
  })

  return monthsInRange.map(monthStart => {
    const monthEnd = endOfMonth(monthStart)
    const monthStr = format(monthStart, 'yyyy-MM')

    // Filter incidents for this month
    const monthIncidents = incidents.filter(i => {
      if (!i.date) return false
      const incidentMonth = i.date.substring(0, 7)
      return incidentMonth === monthStr
    })

    if (monthIncidents.length === 0) {
      return {
        month: format(monthStart, 'MMM yy'),
        monthKey: monthStr,
        qualityScore: 0,
        categorizationRate: 0,
        coverageScore: 0,
        dataIntegrity: 100,
        count: 0
      }
    }

    const quality = calculateQualityScore(monthIncidents)
    const categorization = getCategorizationMetrics(monthIncidents)
    const daysInMonth = differenceInDays(monthEnd, monthStart) + 1
    const coverage = getCoverageMetrics(monthIncidents, daysInMonth)
    const duplicates = getDuplicateDescriptions(monthIncidents)
    const dataIntegrityScore = Math.max(0, 100 - (parseFloat(duplicates.duplicateRate) * 5))

    return {
      month: format(monthStart, 'MMM yy'),
      monthKey: monthStr,
      qualityScore: quality.score,
      categorizationRate: parseFloat(categorization.properRate),
      coverageScore: parseFloat(coverage.rate),
      dataIntegrity: Math.round(dataIntegrityScore),
      count: monthIncidents.length
    }
  })
}

/**
 * Get detailed monthly quality breakdown for drill-down
 * Shows how each metric was calculated with formulas and counts
 */
export const getMonthlyQualityBreakdown = (monthIncidents, monthLabel, daysInMonth) => {
  if (!monthIncidents || monthIncidents.length === 0) {
    return null
  }

  const total = monthIncidents.length

  // Categorization breakdown
  const categorization = getCategorizationMetrics(monthIncidents)

  // Description quality breakdown
  const description = getDescriptionMetrics(monthIncidents)

  // Near miss breakdown
  const nearMiss = getNearMissMetrics(monthIncidents)

  // Coverage breakdown
  const coverage = getCoverageMetrics(monthIncidents, daysInMonth)

  // Duplicate/Data Integrity breakdown
  const duplicates = getDuplicateDescriptions(monthIncidents)
  const duplicateRate = parseFloat(duplicates.duplicateRate)
  const dataIntegrityScore = Math.max(0, 100 - (duplicateRate * 5))

  // Reporter engagement breakdown
  const reporters = getReporterMetrics(monthIncidents)
  const activeReporters = reporters.filter(r => r.total >= 5).length
  const totalReporters = reporters.length
  const reporterEngagement = totalReporters > 0 ? Math.round((activeReporters / totalReporters) * 100) : 0

  // Overall quality score
  const quality = calculateQualityScore(monthIncidents)

  return {
    month: monthLabel,
    totalObservations: total,
    qualityScore: quality.score,

    // Categorization details
    categorization: {
      score: parseFloat(categorization.properRate),
      proper: categorization.proper,
      blank: categorization.blank,
      other: categorization.other,
      formula: `${categorization.proper} proper / ${total} total = ${categorization.properRate}%`
    },

    // Description quality details
    description: {
      score: parseFloat(description.qualityRate),
      avgWordCount: description.avgWordCount,
      distribution: description.distribution,
      formula: `${description.qualityCount} good descriptions / ${total} total = ${description.qualityRate}%`
    },

    // Coverage details
    coverage: {
      score: parseFloat(coverage.rate),
      activeDays: coverage.activeDays,
      totalDays: daysInMonth,
      formula: `${coverage.activeDays} active days / ${daysInMonth} total days = ${coverage.rate}%`
    },

    // Data Integrity details
    dataIntegrity: {
      score: Math.round(dataIntegrityScore),
      duplicateCount: duplicates.totalDuplicates,
      duplicateGroups: duplicates.totalGroups,
      duplicateRate: duplicateRate.toFixed(1),
      formula: `100 - (${duplicateRate.toFixed(1)}% × 5) = ${Math.round(dataIntegrityScore)}%`
    },

    // Near Miss details
    nearMiss: {
      score: parseFloat(nearMiss.rate),
      count: nearMiss.count,
      nonPositiveCount: nearMiss.nonPositiveCount,
      formula: `${nearMiss.count} near misses / ${nearMiss.nonPositiveCount} non-positive = ${nearMiss.rate}%`
    },

    // Reporter engagement details
    reporters: {
      score: reporterEngagement,
      active: activeReporters,
      total: totalReporters,
      formula: `${activeReporters} active (5+ obs) / ${totalReporters} total = ${reporterEngagement}%`
    },

    // Raw observations for further drill-down
    observations: monthIncidents
  }
}

/**
 * Generate coverage gap alerts
 */
export const getCoverageAlerts = (dayOfWeekData, hourData) => {
  const alerts = []

  // Check for day gaps
  dayOfWeekData.forEach(day => {
    if (day.isGap && !day.isWeekend) {
      alerts.push({
        type: 'day-gap',
        severity: 'warning',
        message: `${day.day} coverage only ${day.percentage}% - significantly below average`
      })
    }
  })

  // Check for night shift coverage
  if (hourData.summary.hasTimeData) {
    const nightPct = parseFloat(hourData.summary.nightShiftPct)
    if (nightPct < 10) {
      alerts.push({
        type: 'shift-gap',
        severity: 'warning',
        message: `Night shift (18:00-06:00) only ${nightPct}% of observations`
      })
    }
  }

  return alerts
}

/**
 * Detect duplicate descriptions (copy-paste behavior)
 */
export const getDuplicateDescriptions = (incidents) => {
  const descriptionMap = {}

  incidents.forEach(incident => {
    if (!incident.description) return

    // Normalize description: lowercase, trim, remove extra whitespace
    const normalized = incident.description.toLowerCase().trim().replace(/\s+/g, ' ')

    // Skip very short descriptions (less than 10 chars)
    if (normalized.length < 10) return

    if (!descriptionMap[normalized]) {
      descriptionMap[normalized] = {
        originalDescription: incident.description,
        count: 0,
        reporters: new Set(),
        dates: [],
        incidents: []
      }
    }

    descriptionMap[normalized].count++
    descriptionMap[normalized].reporters.add(incident.reportedBy || 'Unknown')
    descriptionMap[normalized].dates.push(incident.date)
    // Store full incident object for drill-down functionality
    descriptionMap[normalized].incidents.push(incident)
  })

  // Filter to only duplicates (count >= 2)
  const duplicateGroups = Object.values(descriptionMap)
    .filter(group => group.count >= 2)
    .map(group => ({
      description: group.originalDescription,
      count: group.count,
      reporters: [...group.reporters],
      dates: group.dates,
      incidents: group.incidents,
      isSameReporter: group.reporters.size === 1
    }))
    .sort((a, b) => b.count - a.count)

  const totalDuplicates = duplicateGroups.reduce((sum, g) => sum + g.count, 0)
  const uniqueDescriptions = Object.keys(descriptionMap).length

  return {
    duplicateGroups,
    totalGroups: duplicateGroups.length,
    totalDuplicates,
    uniqueDescriptions,
    duplicateRate: incidents.length > 0
      ? ((totalDuplicates / incidents.length) * 100).toFixed(1)
      : '0.0'
  }
}

/**
 * Analyze "Other" hazard observations and suggest proper classifications
 */
export const getOtherHazardAnalysis = (incidents) => {
  // Keywords for each major hazard category
  const hazardKeywords = {
    'Working at Height': ['ladder', 'scaffold', 'scaffolding', 'roof', 'edge protection', 'guardrail', 'handrail', 'elevated', 'platform', 'fall from height', 'working at height', 'height work', 'above ground'],
    'Lifting': ['crane', 'rigging', 'sling', 'shackle', 'lifting operation', 'suspended load', 'hoist', 'winch', 'lifting plan', 'lift plan', 'lifting gear'],
    'Confined Spaces': ['confined space', 'manhole', 'tank entry', 'vessel entry', 'enclosed space', 'restricted space', 'permit to work confined'],
    'Energized System': ['electrical', 'live wire', 'exposed cable', 'power line', 'switchgear', 'transformer', 'junction box', 'electrical panel', 'energized', 'de-energized', 'lockout', 'tagout', 'loto'],
    'Fire': ['fire hazard', 'flammable', 'combustible', 'ignition source', 'fire risk', 'fire load', 'smoking area'],
    'Hot Work': ['welding', 'cutting', 'grinding', 'brazing', 'soldering', 'torch', 'spark', 'hot work permit'],
    'Mobile Plant & Equipment': ['excavator', 'forklift', 'crane', 'loader', 'bulldozer', 'dump truck', 'roller', 'compactor', 'plant equipment', 'heavy equipment', 'machine', 'vehicle'],
    'Breaking Ground & Excavation': ['excavation', 'trench', 'digging', 'earthwork', 'underground', 'buried services', 'shoring', 'benching', 'cave-in'],
    'Temporary Works': ['formwork', 'falsework', 'temporary structure', 'propping', 'shoring', 'temporary support'],
    'Working in Heat': ['heat stress', 'hot environment', 'sun exposure', 'dehydration', 'heat exhaustion', 'working in heat', 'high temperature'],
    'Working on or Near Live Roads': ['live road', 'traffic', 'highway', 'road work', 'traffic management', 'road closure'],
    'Working on or Near Water': ['water body', 'river', 'lake', 'pond', 'drowning', 'water hazard', 'near water'],
    'Driving': ['driving', 'vehicle', 'speeding', 'seatbelt', 'driver', 'road safety', 'journey management']
  }

  // Filter "Other" hazard observations
  const otherHazards = incidents.filter(i => {
    const location = (i.location || '').toLowerCase().trim()
    return location === 'other' || location === 'others' || location === '' || location === 'not specified'
  })

  const suggestions = []

  otherHazards.forEach(incident => {
    const descLower = (incident.description || '').toLowerCase()
    let suggestedHazard = null
    let matchedKeywords = []
    let confidence = 'low'

    // Check each hazard category for keyword matches
    for (const [hazard, keywords] of Object.entries(hazardKeywords)) {
      const matches = keywords.filter(kw => descLower.includes(kw))
      if (matches.length > 0) {
        if (matches.length > matchedKeywords.length) {
          suggestedHazard = hazard
          matchedKeywords = matches
          confidence = matches.length >= 3 ? 'high' : matches.length >= 2 ? 'medium' : 'low'
        }
      }
    }

    if (suggestedHazard) {
      suggestions.push({
        id: incident.externalId,
        date: incident.date,
        reporter: incident.reportedBy || 'Unknown',
        description: incident.description,
        currentHazard: incident.location || 'Other',
        suggestedHazard,
        confidence,
        keywords: matchedKeywords.slice(0, 3), // Top 3 keywords
        incident // Store full incident for drill-down
      })
    }
  })

  // Sort by confidence (high first)
  const confidenceOrder = { high: 0, medium: 1, low: 2 }
  suggestions.sort((a, b) => confidenceOrder[a.confidence] - confidenceOrder[b.confidence])

  return {
    totalOther: otherHazards.length,
    reclassifiable: suggestions.length,
    reclassifiableRate: otherHazards.length > 0
      ? ((suggestions.length / otherHazards.length) * 100).toFixed(1)
      : '0.0',
    suggestions,
    byHazard: suggestions.reduce((acc, s) => {
      acc[s.suggestedHazard] = (acc[s.suggestedHazard] || 0) + 1
      return acc
    }, {})
  }
}

/**
 * Get Auto-Classification Summary - Shows what WAS auto-classified from blank/generic to proper categories
 * Uses originalHazardCategory (before) vs location (after) to track changes
 */
export const getAutoClassificationSummary = (incidents) => {
  const blankValues = ['', null, undefined, '(blank)']
  const genericValues = ['other', 'others', 'general', 'general safety', 'not specified']

  // Filter incidents that were auto-classified (category changed from original)
  const autoClassified = incidents.filter(incident => {
    // Must have tracking data
    if (!incident.originalHazardCategory && incident.hazardCategorySource !== 'auto-classified') {
      return false
    }

    const original = (incident.originalHazardCategory || '').toLowerCase().trim()
    const current = (incident.location || '').toLowerCase().trim()

    // Include if:
    // 1. hazardCategorySource is 'auto-classified', OR
    // 2. Original was blank/generic and current is different
    if (incident.hazardCategorySource === 'auto-classified') return true

    const wasBlank = !incident.originalHazardCategory || blankValues.includes(original)
    const wasGeneric = genericValues.includes(original)

    return (wasBlank || wasGeneric) && original !== current
  })

  // Group by "from -> to" mapping
  const mappingGroups = {}

  autoClassified.forEach(incident => {
    const originalRaw = incident.originalHazardCategory
    const from = !originalRaw || originalRaw.trim() === '' ? '(blank)' : originalRaw
    const to = incident.location || 'General Site Issues'
    const key = `${from}|||${to}`

    if (!mappingGroups[key]) {
      mappingGroups[key] = {
        from,
        to,
        count: 0,
        records: [],
        confidenceSum: 0,
        highConfidence: 0,
        mediumConfidence: 0,
        lowConfidence: 0
      }
    }

    mappingGroups[key].count++
    mappingGroups[key].records.push(incident)

    // Use contextAnalysis confidence if available
    const confidence = incident.contextAnalysis?.confidence || 0
    mappingGroups[key].confidenceSum += confidence

    if (confidence >= 85) {
      mappingGroups[key].highConfidence++
    } else if (confidence >= 65) {
      mappingGroups[key].mediumConfidence++
    } else {
      mappingGroups[key].lowConfidence++
    }
  })

  // Convert to array and sort by count
  const mappings = Object.values(mappingGroups)
    .map(group => ({
      ...group,
      avgConfidence: group.count > 0 ? Math.round(group.confidenceSum / group.count) : 0,
      confidenceLevel: group.highConfidence > group.count / 2 ? 'high' :
        group.mediumConfidence > group.count / 2 ? 'medium' : 'low'
    }))
    .sort((a, b) => b.count - a.count)

  // Group by original category
  const byOriginalCategory = {}
  mappings.forEach(m => {
    if (!byOriginalCategory[m.from]) {
      byOriginalCategory[m.from] = { count: 0, destinations: {} }
    }
    byOriginalCategory[m.from].count += m.count
    byOriginalCategory[m.from].destinations[m.to] = m.count
  })

  // Group by new category
  const byNewCategory = {}
  mappings.forEach(m => {
    if (!byNewCategory[m.to]) {
      byNewCategory[m.to] = { count: 0, sources: {} }
    }
    byNewCategory[m.to].count += m.count
    byNewCategory[m.to].sources[m.from] = m.count
  })

  // Calculate summary stats
  let fromBlank = 0
  let fromOther = 0
  let fromGeneric = 0
  let highConfidence = 0
  let mediumConfidence = 0
  let lowConfidence = 0

  autoClassified.forEach(incident => {
    const original = (incident.originalHazardCategory || '').toLowerCase().trim()

    if (!incident.originalHazardCategory || original === '' || original === '(blank)') {
      fromBlank++
    } else if (original === 'other' || original === 'others') {
      fromOther++
    } else if (genericValues.includes(original)) {
      fromGeneric++
    }

    const confidence = incident.contextAnalysis?.confidence || 0
    if (confidence >= 85) highConfidence++
    else if (confidence >= 65) mediumConfidence++
    else lowConfidence++
  })

  return {
    totalAutoClassified: autoClassified.length,
    percentageOfTotal: incidents.length > 0
      ? ((autoClassified.length / incidents.length) * 100).toFixed(1)
      : '0.0',
    mappings,
    byOriginalCategory,
    byNewCategory,
    summary: {
      fromBlank,
      fromOther,
      fromGeneric,
      highConfidence,
      mediumConfidence,
      lowConfidence
    }
  }
}

/**
 * Get Before/After Categorization Metrics - Shows comparison of Excel vs Current state
 * Before: Based on originalHazardCategory (what Excel had)
 * After: Based on location (current state after classification)
 */
export const getBeforeAfterCategorizationMetrics = (incidents) => {
  const blankCategories = ['', null, undefined, 'Not Specified', 'Not specified']
  const otherCategories = ['Other', 'Others', 'other', 'others', 'General', 'General Safety']

  // Helper to categorize a value
  const categorizeValue = (value) => {
    const trimmed = (value || '').trim()
    if (!trimmed || blankCategories.includes(trimmed)) return 'blank'
    if (otherCategories.includes(trimmed)) return 'other'
    return 'proper'
  }

  // Calculate BEFORE metrics (using originalHazardCategory)
  const before = { proper: 0, blank: 0, other: 0, byCategory: {} }

  // Calculate AFTER metrics (using location)
  const after = { proper: 0, blank: 0, other: 0, byCategory: {} }

  // Track transitions for drill-down
  const transitions = {}

  incidents.forEach(incident => {
    // Before state (original from Excel)
    const originalValue = incident.originalHazardCategory
    const beforeType = categorizeValue(originalValue)
    before[beforeType]++

    // Track category distribution for before
    const beforeCat = originalValue || '(blank)'
    before.byCategory[beforeCat] = (before.byCategory[beforeCat] || 0) + 1

    // After state (current)
    const currentValue = incident.location
    const afterType = categorizeValue(currentValue)
    after[afterType]++

    // Track category distribution for after
    const afterCat = currentValue || '(blank)'
    after.byCategory[afterCat] = (after.byCategory[afterCat] || 0) + 1

    // Track transitions if changed
    if (beforeType !== afterType || beforeCat !== afterCat) {
      const key = `${beforeType}|||${afterType}`
      if (!transitions[key]) {
        transitions[key] = { from: beforeType, to: afterType, count: 0, records: [] }
      }
      transitions[key].count++
      transitions[key].records.push(incident)
    }
  })

  const total = incidents.length

  // Calculate rates
  before.total = total
  before.properRate = total > 0 ? ((before.proper / total) * 100).toFixed(1) : '0.0'
  before.status = (before.proper / total) >= 0.8 ? 'good' : (before.proper / total) >= 0.6 ? 'warning' : 'poor'

  after.total = total
  after.properRate = total > 0 ? ((after.proper / total) * 100).toFixed(1) : '0.0'
  after.status = (after.proper / total) >= 0.8 ? 'good' : (after.proper / total) >= 0.6 ? 'warning' : 'poor'

  // Convert byCategory to sorted arrays
  before.byCategoryList = Object.entries(before.byCategory)
    .map(([name, count]) => ({ name, count, percentage: ((count / total) * 100).toFixed(1) }))
    .sort((a, b) => b.count - a.count)

  after.byCategoryList = Object.entries(after.byCategory)
    .map(([name, count]) => ({ name, count, percentage: ((count / total) * 100).toFixed(1) }))
    .sort((a, b) => b.count - a.count)

  // Calculate improvement
  const properDelta = after.proper - before.proper
  const blankDelta = after.blank - before.blank
  const otherDelta = after.other - before.other
  const properRateDelta = (parseFloat(after.properRate) - parseFloat(before.properRate)).toFixed(1)

  let message = ''
  if (properDelta > 0) {
    message = `Auto-classification improved proper categorization from ${before.properRate}% to ${after.properRate}% (+${properDelta} records)`
  } else if (properDelta === 0) {
    message = 'No change in categorization between Excel and current state'
  } else {
    message = `Categorization changed from ${before.properRate}% to ${after.properRate}%`
  }

  return {
    before,
    after,
    improvement: {
      properDelta,
      blankDelta,
      otherDelta,
      properRateDelta: properRateDelta > 0 ? `+${properRateDelta}` : properRateDelta,
      message,
      hasImprovement: properDelta > 0
    },
    transitions: Object.values(transitions).sort((a, b) => b.count - a.count)
  }
}

/**
 * Get comprehensive reporter analytics for deep dive modal
 */
export const getReporterDeepDive = (incidents, reporterName, allIncidents) => {
  // Filter incidents for this reporter
  const reporterIncidents = incidents.filter(i => i.reportedBy === reporterName)

  if (reporterIncidents.length === 0) {
    return null
  }

  // Basic stats
  const total = reporterIncidents.length

  // Observation type breakdown
  const typeBreakdown = {
    nearMiss: reporterIncidents.filter(i => i.type === 'near-miss').length,
    unsafeCondition: reporterIncidents.filter(i => i.type === 'unsafe-condition').length,
    unsafeAct: reporterIncidents.filter(i => i.type === 'unsafe-act').length,
    positive: reporterIncidents.filter(i => i.type === 'positive').length,
    incident: reporterIncidents.filter(i => ['lti', 'mti', 'fac'].includes(i.type)).length
  }

  // Calculate percentages
  const typeBreakdownPct = {
    nearMiss: total > 0 ? ((typeBreakdown.nearMiss / total) * 100).toFixed(1) : '0.0',
    unsafeCondition: total > 0 ? ((typeBreakdown.unsafeCondition / total) * 100).toFixed(1) : '0.0',
    unsafeAct: total > 0 ? ((typeBreakdown.unsafeAct / total) * 100).toFixed(1) : '0.0',
    positive: total > 0 ? ((typeBreakdown.positive / total) * 100).toFixed(1) : '0.0',
    incident: total > 0 ? ((typeBreakdown.incident / total) * 100).toFixed(1) : '0.0'
  }

  // Top hazards reported
  const hazardCounts = {}
  reporterIncidents.forEach(i => {
    const hazard = i.location || 'Unspecified'
    hazardCounts[hazard] = (hazardCounts[hazard] || 0) + 1
  })
  const topHazards = Object.entries(hazardCounts)
    .map(([name, count]) => ({ name, count, percentage: ((count / total) * 100).toFixed(1) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Time of reporting pattern
  const hourCounts = Array(24).fill(0)
  let hasTimeData = false
  reporterIncidents.forEach(i => {
    const hour = extractHour(i.eventTime, i.date)
    if (hour !== null) {
      hourCounts[hour]++
      hasTimeData = true
    }
  })
  const dayShiftCount = hourCounts.slice(6, 18).reduce((a, b) => a + b, 0)
  const nightShiftCount = hourCounts.reduce((a, b) => a + b, 0) - dayShiftCount
  const totalWithTime = dayShiftCount + nightShiftCount

  // Active days and daily rate
  const uniqueDates = new Set(reporterIncidents.map(i => i.date?.substring(0, 10)).filter(Boolean))
  const activeDays = uniqueDates.size
  const dates = [...uniqueDates].sort()
  const firstDate = dates[0]
  const lastDate = dates[dates.length - 1]

  // Calculate span in days
  let spanDays = 1
  if (firstDate && lastDate && firstDate !== lastDate) {
    const first = new Date(firstDate)
    const last = new Date(lastDate)
    spanDays = Math.max(1, Math.ceil((last - first) / (1000 * 60 * 60 * 24)) + 1)
  }
  const dailyRate = (total / Math.max(activeDays, 1)).toFixed(1)

  // Description quality
  const wordCounts = reporterIncidents.map(i => countWords(i.description))
  const avgWordCount = wordCounts.length > 0
    ? Math.round(wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length)
    : 0
  const qualityCount = wordCounts.filter(wc => wc > 15).length
  const qualityRate = total > 0 ? ((qualityCount / total) * 100).toFixed(1) : '0.0'
  const maxWordCount = Math.max(...wordCounts, 0)
  const filteredCounts = wordCounts.filter(w => w > 0)
  const minWordCount = filteredCounts.length > 0 ? Math.min(...filteredCounts) : 0

  // Flagged (poor quality) descriptions
  const flaggedRecords = reporterIncidents
    .filter(i => countWords(i.description) <= 5)
    .slice(0, 5)
    .map(i => ({
      id: i.externalId,
      date: i.date,
      description: i.description,
      wordCount: countWords(i.description)
    }))

  // Team average comparison (using allIncidents)
  const allReporterMetrics = getReporterMetrics(allIncidents || incidents)
  const avgTotal = allReporterMetrics.reduce((sum, r) => sum + r.total, 0) / Math.max(allReporterMetrics.length, 1)
  const avgNearMissRate = allReporterMetrics.reduce((sum, r) => {
    const nonPositive = r.total - r.positive
    return sum + (nonPositive > 0 ? (r.nearMiss / nonPositive) * 100 : 0)
  }, 0) / Math.max(allReporterMetrics.length, 1)
  const avgQualityRate = allReporterMetrics.reduce((sum, r) => sum + parseFloat(r.qualityRate), 0) / Math.max(allReporterMetrics.length, 1)

  // This reporter's near miss rate
  const nonPositive = total - typeBreakdown.positive
  const nearMissRate = nonPositive > 0 ? ((typeBreakdown.nearMiss / nonPositive) * 100).toFixed(1) : '0.0'

  // Recent observations
  const recentObservations = [...reporterIncidents]
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .slice(0, 10)
    .map(i => ({
      id: i.externalId,
      date: i.date,
      type: i.type,
      description: i.description,
      hazard: i.location,
      status: i.actionStatus
    }))

  // Monthly trend
  const monthlyData = {}
  reporterIncidents.forEach(i => {
    if (i.date) {
      const month = i.date.substring(0, 7)
      monthlyData[month] = (monthlyData[month] || 0) + 1
    }
  })
  const monthlyTrend = Object.entries(monthlyData)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month))

  // Duplicate descriptions (same description used multiple times by this reporter)
  const descriptionCounts = {}
  reporterIncidents.forEach(i => {
    const desc = (i.description || '').toLowerCase().trim()
    if (desc.length > 10) { // Only count meaningful descriptions
      descriptionCounts[desc] = descriptionCounts[desc] || { count: 0, records: [] }
      descriptionCounts[desc].count++
      descriptionCounts[desc].records.push(i)
    }
  })
  const duplicateDescriptions = Object.entries(descriptionCounts)
    .filter(([_, data]) => data.count > 1)
    .flatMap(([desc, data]) => data.records.map(r => ({
      id: r.externalId,
      date: r.date,
      description: r.description,
      duplicateCount: data.count
    })))
    .slice(0, 10)

  // Vague descriptions (low confidence from context classifier)
  const vagueDescriptions = reporterIncidents
    .map(i => {
      const analysis = analyzeObservation(i.description, i.originalHazardCategory || i.location)
      return {
        id: i.externalId,
        date: i.date,
        description: i.description,
        confidence: analysis.confidence,
        reasoning: analysis.reasoning
      }
    })
    .filter(r => r.confidence < 65)
    .slice(0, 10)

  return {
    name: reporterName,
    total,

    // Type breakdown
    typeBreakdown,
    typeBreakdownPct,

    // Hazards
    topHazards,

    // Time patterns
    hourlyPattern: hourCounts.map((count, hour) => ({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      count
    })),
    hasTimeData,
    dayShiftPct: totalWithTime > 0 ? ((dayShiftCount / totalWithTime) * 100).toFixed(1) : '0.0',
    nightShiftPct: totalWithTime > 0 ? ((nightShiftCount / totalWithTime) * 100).toFixed(1) : '0.0',

    // Activity
    activeDays,
    spanDays,
    firstDate,
    lastDate,
    dailyRate,

    // Quality
    avgWordCount,
    qualityRate,
    maxWordCount,
    minWordCount,
    flaggedRecords,
    flaggedCount: reporterIncidents.filter(i => countWords(i.description) <= 5).length,

    // Near miss rate
    nearMissRate,

    // Team comparison
    comparison: {
      totalVsAvg: { reporter: total, team: Math.round(avgTotal), better: total > avgTotal },
      nearMissVsAvg: { reporter: parseFloat(nearMissRate), team: avgNearMissRate.toFixed(1), better: parseFloat(nearMissRate) > avgNearMissRate },
      qualityVsAvg: { reporter: parseFloat(qualityRate), team: avgQualityRate.toFixed(1), better: parseFloat(qualityRate) > avgQualityRate },
      dailyRateVsAvg: { reporter: parseFloat(dailyRate), team: (avgTotal / 30).toFixed(1), better: parseFloat(dailyRate) > avgTotal / 30 }
    },

    // Recent observations
    recentObservations,

    // Monthly trend
    monthlyTrend,

    // Data Quality Issues
    duplicateDescriptions,
    vagueDescriptions
  }
}

/**
 * Find keywords that triggered a hazard classification
 * Checks CONTEXT_REDIRECTS, HAZARD_PHRASES, and HAZARD_PATTERNS
 */
export const findTriggeringKeywords = (description, targetCategory) => {
  if (!description || !targetCategory) return []

  const text = description.toLowerCase()
  const matchedKeywords = []

  // Check CONTEXT_REDIRECTS (highest priority)
  for (const [phrase, category] of Object.entries(CONTEXT_REDIRECTS)) {
    if (category === targetCategory && text.includes(phrase.toLowerCase())) {
      matchedKeywords.push(phrase)
    }
  }

  // Check HAZARD_PHRASES (multi-word patterns)
  const phrases = HAZARD_PHRASES[targetCategory] || []
  for (const phrase of phrases) {
    if (text.includes(phrase.toLowerCase())) {
      matchedKeywords.push(phrase)
    }
  }

  // Check HAZARD_PATTERNS (single keywords)
  const keywords = HAZARD_PATTERNS[targetCategory] || []
  for (const keyword of keywords) {
    if (text.includes(keyword.toLowerCase())) {
      matchedKeywords.push(keyword)
    }
  }

  // Remove duplicates and sort by length (longer = more specific)
  return [...new Set(matchedKeywords)].sort((a, b) => b.length - a.length)
}

/**
 * Analyze auto-classified import records
 * Provides detailed metrics on records that were auto-classified during import
 */
export const getImportClassificationMetrics = (hazardIssues, incidents) => {
  if (!hazardIssues || hazardIssues.length === 0) {
    return null
  }

  // Build lookup map for incidents by externalId
  const incidentMap = {}
  incidents.forEach(incident => {
    if (incident.externalId) {
      incidentMap[incident.externalId] = incident
    }
  })

  // Calculate total imported records (approximate from incidents)
  const totalImported = incidents.length
  const totalAutoClassified = hazardIssues.length
  const percentageOfImport = totalImported > 0
    ? ((totalAutoClassified / totalImported) * 100).toFixed(1)
    : '0.0'

  // Summary counters
  let fromBlank = 0
  let fromOther = 0
  let highConfidence = 0
  let mediumConfidence = 0
  let lowConfidence = 0

  // Category breakdown
  const categoryMap = {}

  // Process each hazard issue
  const detailedRecords = hazardIssues.map(issue => {
    // Look up the incident
    const incident = incidentMap[issue.eventId]

    // Count original value types
    const originalLower = (issue.original || '').toLowerCase().trim()
    if (originalLower === '(blank)' || originalLower === '' || !issue.original) {
      fromBlank++
    } else {
      fromOther++
    }

    // Get triggering keywords
    const description = incident?.description || ''
    const triggeringKeywords = findTriggeringKeywords(description, issue.autoClassified)

    // Determine confidence based on keyword count
    let confidence = 'low'
    if (triggeringKeywords.length >= 3) {
      confidence = 'high'
      highConfidence++
    } else if (triggeringKeywords.length >= 2) {
      confidence = 'medium'
      mediumConfidence++
    } else {
      lowConfidence++
    }

    // Track category breakdown
    if (!categoryMap[issue.autoClassified]) {
      categoryMap[issue.autoClassified] = {
        category: issue.autoClassified,
        count: 0,
        records: []
      }
    }
    categoryMap[issue.autoClassified].count++

    // Build detailed record
    const record = {
      row: issue.row,
      eventId: issue.eventId,
      originalValue: issue.original || '(blank)',
      newCategory: issue.autoClassified,
      description: description,
      descriptionSnippet: description ? description.substring(0, 80) + (description.length > 80 ? '...' : '') : '(no description)',
      reportedBy: incident?.reportedBy || 'Unknown',
      contractor: incident?.contractor || '',
      site: incident?.site || '',
      date: incident?.date || '',
      triggeringKeywords,
      confidence,
      incident // Store full incident for drill-down
    }

    categoryMap[issue.autoClassified].records.push(record)

    return record
  })

  // Build category breakdown array sorted by count
  const byCategory = Object.values(categoryMap)
    .map(cat => ({
      ...cat,
      percentage: totalAutoClassified > 0
        ? ((cat.count / totalAutoClassified) * 100).toFixed(1)
        : '0.0'
    }))
    .sort((a, b) => b.count - a.count)

  return {
    totalAutoClassified,
    percentageOfImport,
    byCategory,
    detailedRecords,
    summary: {
      fromBlank,
      fromOther,
      highConfidence,
      mediumConfidence,
      lowConfidence
    }
  }
}

/**
 * Detect potential misclassifications by re-analyzing all records
 * The system uses ONLY 13 Major Hazard categories + "Other"
 * Only flag when BOTH current and suggested are within the 13 Major Hazards
 * (real misclassification between major hazards)
 */
export const getMisclassificationAnalysis = (incidents) => {
  if (!incidents || incidents.length === 0) {
    return {
      totalMisclassified: 0,
      misclassifiedRecords: [],
      byCurrentCategory: [],
      bySuggestedCategory: []
    }
  }

  // The 13 valid categories in the system (anything else = "Other")
  const VALID_CATEGORIES = [
    'Breaking Ground & Excavation',
    'Confined Spaces',
    'Energized System',
    'Fire',
    'Hot Work',
    'Lifting',
    'Mobile Plant & Equipment',
    'Temporary Works',
    'Working in Heat',
    'Working at Height',
    'Working on or Near Live Roads',
    'Working on or Near Water',
    'Driving'
  ]

  const misclassifiedRecords = []

  incidents.forEach(incident => {
    const currentCategory = incident.location || ''
    const description = incident.description || ''

    // Skip if no description to analyze
    if (!description.trim()) return

    // Skip if current category is blank/other (those are handled by Other Hazard Opportunities)
    const currentLower = currentCategory.toLowerCase().trim()
    if (!currentLower || currentLower === 'other' || currentLower === 'others' || currentLower === 'not specified') {
      return
    }

    // Only process if current category is one of the 13 valid categories
    const isValidCategory = VALID_CATEGORIES.includes(currentCategory)
    if (!isValidCategory) return // Skip if current is not one of the 13

    // Check if description supports the current category
    const currentCategoryKeywords = findTriggeringKeywords(description, currentCategory)

    // If no keywords support the current category, check what description suggests
    if (currentCategoryKeywords.length === 0) {
      // Find what the description actually suggests
      const suggestedCategory = categorizeHazard(description, '')

      // ONLY flag if suggested is ALSO one of the 13 Major Hazards AND different from current
      const suggestedIsValid = VALID_CATEGORIES.includes(suggestedCategory)

      if (suggestedIsValid && suggestedCategory !== currentCategory) {
        const triggeringKeywords = findTriggeringKeywords(description, suggestedCategory)

        // Only flag if we have keyword evidence for the suggested category
        if (triggeringKeywords.length > 0) {
          let confidence = 'low'
          if (triggeringKeywords.length >= 3) confidence = 'high'
          else if (triggeringKeywords.length >= 2) confidence = 'medium'

          misclassifiedRecords.push({
            id: incident.externalId || incident.id,
            date: incident.date,
            reporter: incident.reportedBy || 'Unknown',
            contractor: incident.contractor || '',
            site: incident.site || '',
            description: description,
            descriptionSnippet: description.substring(0, 80) + (description.length > 80 ? '...' : ''),
            currentCategory,
            suggestedCategory,
            triggeringKeywords,
            confidence,
            isMajorHazardMismatch: true,
            incident
          })
        }
      }
    }
  })

  // Sort by confidence (high first) then by major hazard mismatch
  const confidenceOrder = { high: 0, medium: 1, low: 2 }
  misclassifiedRecords.sort((a, b) => {
    if (a.isMajorHazardMismatch !== b.isMajorHazardMismatch) {
      return a.isMajorHazardMismatch ? -1 : 1
    }
    return confidenceOrder[a.confidence] - confidenceOrder[b.confidence]
  })

  // Group by current category
  const byCurrentCategory = {}
  misclassifiedRecords.forEach(record => {
    if (!byCurrentCategory[record.currentCategory]) {
      byCurrentCategory[record.currentCategory] = { category: record.currentCategory, count: 0, records: [] }
    }
    byCurrentCategory[record.currentCategory].count++
    byCurrentCategory[record.currentCategory].records.push(record)
  })

  // Group by suggested category
  const bySuggestedCategory = {}
  misclassifiedRecords.forEach(record => {
    if (!bySuggestedCategory[record.suggestedCategory]) {
      bySuggestedCategory[record.suggestedCategory] = { category: record.suggestedCategory, count: 0, records: [] }
    }
    bySuggestedCategory[record.suggestedCategory].count++
    bySuggestedCategory[record.suggestedCategory].records.push(record)
  })

  return {
    totalMisclassified: misclassifiedRecords.length,
    percentageOfTotal: incidents.length > 0
      ? ((misclassifiedRecords.length / incidents.length) * 100).toFixed(1)
      : '0.0',
    misclassifiedRecords,
    byCurrentCategory: Object.values(byCurrentCategory).sort((a, b) => b.count - a.count),
    bySuggestedCategory: Object.values(bySuggestedCategory).sort((a, b) => b.count - a.count),
    summary: {
      highConfidence: misclassifiedRecords.filter(r => r.confidence === 'high').length,
      mediumConfidence: misclassifiedRecords.filter(r => r.confidence === 'medium').length,
      lowConfidence: misclassifiedRecords.filter(r => r.confidence === 'low').length,
      majorHazardMismatches: misclassifiedRecords.filter(r => r.isMajorHazardMismatch).length
    }
  }
}

/**
 * Get Unclassifiable Records - Identifies records that couldn't be properly classified
 * These are records that need manual review:
 * - No description: Empty/blank description field
 * - Too short: Description under 10 characters
 * - Unrecognized category: Original Excel category couldn't be normalized
 * - Low confidence: Auto-classified with confidence < 65%
 */
export const getUnclassifiableRecords = (incidents) => {
  if (!incidents || incidents.length === 0) {
    return {
      total: 0,
      byReason: {
        noDescription: { count: 0, records: [], percentage: '0.0' },
        tooShort: { count: 0, records: [], percentage: '0.0' },
        unrecognizedCategory: { count: 0, records: [], percentage: '0.0' },
        lowConfidence: { count: 0, records: [], percentage: '0.0' }
      },
      summary: {
        actionable: 0,
        total: 0,
        percentage: '0.0'
      }
    }
  }

  // Track records by reason (a record can belong to multiple categories)
  const noDescription = []
  const tooShort = []
  const unrecognizedCategory = []
  const lowConfidence = []
  const historicalPlaceholder = [] // Enablon legacy/placeholder events

  // Track unique records (for total count - avoid double counting)
  const allUnclassifiable = new Set()

  // Approved categories that normalize correctly (27 hazard categories)
  const approvedCategories = [
    // 14 NEOM Eltizam Significant Hazards + Physical/Mechanical
    'Confined Spaces', 'Energized System', 'Explosives & Blasting',
    'Mobile Plant & Equipment', 'Breaking Ground & Excavation', 'Fire',
    'Hot Work', 'Lifting', 'Temporary Works', 'Working on or Near Live Roads',
    'Working on or Near Water', 'Driving', 'Working at Height', 'Working in Heat',
    'Physical Hazard', 'Mechanical Hazard',
    // 11 Sub-significant Hazards
    'COSHH', 'Respiratory Hazard', 'Housekeeping', 'Site Security',
    'Access', 'Worker Welfare', 'Tools', 'Traffic Management',
    'General Site Issues', 'Environmental', 'Slip and Trip'
  ]

  // Generic/blank values that indicate classification issues
  const genericValues = ['other', 'others', 'general', 'general safety', 'not specified', '', '(blank)']

  // Placeholder values that should be treated as "no description"
  const emptyPlaceholders = ['n/a', 'na', 'none', '-', '.', '...', 'nil', 'null', 'empty', '(empty)', '(blank)', 'blank', 'tbd', 'tbc', 'pending', 'no description', 'not applicable', 'n.a.', 'n.a']

  // Historical/placeholder events that should be flagged (e.g., Enablon legacy data)
  const historicalPlaceholderPatterns = [
    'historical event',
    'please ignore this event',
    'do not submit for investigation',
    'loaded here for consistency'
  ]

  incidents.forEach(incident => {
    const description = (incident.description || '').trim()
    const descriptionLower = description.toLowerCase()
    const originalCategory = incident.originalHazardCategory
    const confidence = incident.contextAnalysis?.confidence || 0
    const source = incident.hazardCategorySource

    let hasIssue = false

    // Check 1: No description (empty or placeholder values)
    const isEmptyDescription = !description || description === '' || emptyPlaceholders.includes(descriptionLower)
    if (isEmptyDescription) {
      noDescription.push({
        id: incident.externalId || incident.id,
        date: incident.date,
        reporter: incident.reportedBy || 'Unknown',
        contractor: incident.contractor || '',
        site: incident.site || '',
        description: description || '(empty)',
        originalCategory: originalCategory || '(blank)',
        currentCategory: incident.location || 'General Site Issues',
        reason: description ? `Placeholder value: "${description}"` : 'No description provided',
        incident
      })
      hasIssue = true
    }
    // Check 2: Too short description (0-5 words, matching Description Distribution's "Poor" category)
    const wordCount = description.split(/\s+/).filter(w => w.length > 0).length
    if (wordCount > 0 && wordCount <= 5) {
      tooShort.push({
        id: incident.externalId || incident.id,
        date: incident.date,
        reporter: incident.reportedBy || 'Unknown',
        contractor: incident.contractor || '',
        site: incident.site || '',
        description: description,
        wordCount: wordCount,
        originalCategory: originalCategory || '(blank)',
        currentCategory: incident.location || 'General Site Issues',
        reason: `Description too short (${wordCount} word${wordCount === 1 ? '' : 's'})`,
        incident
      })
      hasIssue = true
    }

    // Check 3: Unrecognized original category from Excel
    // (category exists in Excel but doesn't match any approved category)
    // Only flag if system couldn't reclassify with high confidence
    if (originalCategory && originalCategory.trim() !== '') {
      const originalLower = originalCategory.toLowerCase().trim()
      const isGeneric = genericValues.includes(originalLower)
      const isApproved = approvedCategories.some(cat =>
        cat.toLowerCase() === originalLower ||
        originalLower.includes(cat.toLowerCase()) ||
        cat.toLowerCase().includes(originalLower)
      )

      if (!isGeneric && !isApproved) {
        // Only flag as unrecognized if confidence is LOW
        // High confidence (>=65%) means successful reclassification regardless of source
        if (confidence < 65) {
          unrecognizedCategory.push({
            id: incident.externalId || incident.id,
            date: incident.date,
            reporter: incident.reportedBy || 'Unknown',
            contractor: incident.contractor || '',
            site: incident.site || '',
            description: description || '(empty)',
            originalCategory: originalCategory,
            currentCategory: incident.location || 'General Site Issues',
            confidence: confidence,
            reason: confidence > 0
              ? `Unrecognized category "${originalCategory}" (reclassified with ${confidence}% confidence)`
              : `Unrecognized category: "${originalCategory}"`,
            incident
          })
          hasIssue = true
        }
      }
    }

    // Check 4: Low confidence auto-classification
    if (source === 'auto-classified' && confidence > 0 && confidence < 65) {
      lowConfidence.push({
        id: incident.externalId || incident.id,
        date: incident.date,
        reporter: incident.reportedBy || 'Unknown',
        contractor: incident.contractor || '',
        site: incident.site || '',
        description: description || '(empty)',
        originalCategory: originalCategory || '(blank)',
        currentCategory: incident.location || 'General Site Issues',
        confidence: confidence,
        reason: `Low confidence classification (${confidence}%)`,
        incident
      })
      hasIssue = true
    }

    // Check 5: Historical/placeholder events (e.g., Enablon legacy data)
    // These are fake observations that say "please ignore" - they shouldn't count in metrics
    const isHistoricalPlaceholder = historicalPlaceholderPatterns.some(pattern =>
      descriptionLower.includes(pattern)
    )
    if (isHistoricalPlaceholder) {
      historicalPlaceholder.push({
        id: incident.externalId || incident.id,
        date: incident.date,
        reporter: incident.reportedBy || 'Unknown',
        contractor: incident.contractor || '',
        site: incident.site || '',
        description: description.substring(0, 100) + (description.length > 100 ? '...' : ''),
        originalCategory: originalCategory || '(blank)',
        currentCategory: incident.location || 'General Site Issues',
        reason: 'Historical/placeholder event - should be excluded from metrics',
        incident
      })
      hasIssue = true
    }

    if (hasIssue) {
      allUnclassifiable.add(incident.id || incident.externalId)
    }
  })

  const total = allUnclassifiable.size
  const totalIncidents = incidents.length

  return {
    total,
    byReason: {
      noDescription: {
        count: noDescription.length,
        records: noDescription,
        percentage: totalIncidents > 0 ? ((noDescription.length / totalIncidents) * 100).toFixed(1) : '0.0',
        label: 'No Description',
        description: 'Records with empty or blank description field'
      },
      tooShort: {
        count: tooShort.length,
        records: tooShort,
        percentage: totalIncidents > 0 ? ((tooShort.length / totalIncidents) * 100).toFixed(1) : '0.0',
        label: 'Too Short (0-5 words)',
        description: 'Descriptions with 5 words or less (Poor quality)'
      },
      unrecognizedCategory: {
        count: unrecognizedCategory.length,
        records: unrecognizedCategory,
        percentage: totalIncidents > 0 ? ((unrecognizedCategory.length / totalIncidents) * 100).toFixed(1) : '0.0',
        label: 'Unrecognized Category',
        description: 'Original Excel category not in approved list'
      },
      lowConfidence: {
        count: lowConfidence.length,
        records: lowConfidence,
        percentage: totalIncidents > 0 ? ((lowConfidence.length / totalIncidents) * 100).toFixed(1) : '0.0',
        label: 'Low Confidence',
        description: 'Auto-classified with less than 65% confidence'
      },
      historicalPlaceholder: {
        count: historicalPlaceholder.length,
        records: historicalPlaceholder,
        percentage: totalIncidents > 0 ? ((historicalPlaceholder.length / totalIncidents) * 100).toFixed(1) : '0.0',
        label: 'Historical/Placeholder',
        description: 'Legacy Enablon events marked as "ignore" - not real observations'
      }
    },
    summary: {
      actionable: total,
      total: totalIncidents,
      percentage: totalIncidents > 0 ? ((total / totalIncidents) * 100).toFixed(1) : '0.0',
      message: total > 0
        ? `${total} records (${((total / totalIncidents) * 100).toFixed(1)}%) require manual review`
        : 'All records properly classified'
    }
  }
}

/**
 * Detect foul/inappropriate words in observation descriptions
 * Uses word boundary matching to avoid false positives (e.g., "class" matching "ass")
 */
export const detectFoulWords = (incidents) => {
  if (!incidents || incidents.length === 0) {
    return {
      count: 0,
      records: [],
      percentage: '0.0',
      status: 'good'
    }
  }

  const flaggedRecords = []

  incidents.forEach(incident => {
    const description = incident.description || ''
    if (!description.trim()) return

    const descriptionLower = description.toLowerCase()
    const foundWords = []

    // Check each foul word using word boundary matching
    FOUL_WORDS_LIST.forEach(word => {
      // Create regex with word boundaries to avoid partial matches
      // e.g., "ass" should not match "class", "assessment", "pass"
      const regex = new RegExp(`\\b${word}\\b`, 'gi')
      if (regex.test(descriptionLower)) {
        foundWords.push(word)
      }
    })

    if (foundWords.length > 0) {
      flaggedRecords.push({
        id: incident.externalId || incident.id,
        date: incident.date,
        reporter: incident.reportedBy || 'Unknown',
        contractor: incident.contractor || '',
        site: incident.site || '',
        description: description,
        descriptionSnippet: description.substring(0, 80) + (description.length > 80 ? '...' : ''),
        flaggedWords: [...new Set(foundWords)], // Remove duplicates
        wordCount: foundWords.length,
        severity: foundWords.length >= 3 ? 'high' : foundWords.length >= 2 ? 'medium' : 'low',
        incident
      })
    }
  })

  return {
    count: flaggedRecords.length,
    records: flaggedRecords.sort((a, b) => b.wordCount - a.wordCount),
    percentage: incidents.length > 0
      ? ((flaggedRecords.length / incidents.length) * 100).toFixed(1)
      : '0.0',
    status: flaggedRecords.length === 0 ? 'good' : 'poor',
    summary: {
      highSeverity: flaggedRecords.filter(r => r.severity === 'high').length,
      mediumSeverity: flaggedRecords.filter(r => r.severity === 'medium').length,
      lowSeverity: flaggedRecords.filter(r => r.severity === 'low').length
    }
  }
}

/**
 * Detect vague hazard descriptions that lack specificity
 * Flags descriptions that use generic terms without providing detail
 * A description is considered vague if:
 * - Contains a vague term AND is short (≤15 words), OR
 * - Contains a vague term in the first 5 words (as the primary descriptor)
 */
export const detectVagueHazards = (incidents) => {
  if (!incidents || incidents.length === 0) {
    return {
      count: 0,
      records: [],
      percentage: '0.0',
      status: 'good'
    }
  }

  const flaggedRecords = []

  incidents.forEach(incident => {
    const description = incident.description || ''
    if (!description.trim()) return

    const descriptionLower = description.toLowerCase()
    const words = description.trim().split(/\s+/).filter(w => w.length > 0)
    const wordCount = words.length
    const firstFiveWords = words.slice(0, 5).join(' ').toLowerCase()

    const foundTerms = []

    // Check each vague term
    VAGUE_HAZARD_TERMS.forEach(({ term, requires }) => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi')

      if (regex.test(descriptionLower)) {
        // Flag if:
        // 1. Description is short (≤15 words) - not enough detail, OR
        // 2. Vague term appears in first 5 words (primary descriptor)
        const isInFirstFive = new RegExp(`\\b${term}\\b`, 'gi').test(firstFiveWords)
        const isShortDescription = wordCount <= 15

        if (isShortDescription || isInFirstFive) {
          foundTerms.push({ term, requires, isInFirstFive })
        }
      }
    })

    if (foundTerms.length > 0) {
      flaggedRecords.push({
        id: incident.externalId || incident.id,
        date: incident.date,
        reporter: incident.reportedBy || 'Unknown',
        contractor: incident.contractor || '',
        site: incident.site || '',
        description: description,
        descriptionSnippet: description.substring(0, 80) + (description.length > 80 ? '...' : ''),
        vagueTerms: foundTerms,
        wordCount: wordCount,
        reason: wordCount <= 15
          ? `Short description (${wordCount} words) with vague term "${foundTerms[0].term}"`
          : `Vague term "${foundTerms[0].term}" used as primary descriptor`,
        improvement: foundTerms[0].requires,
        incident
      })
    }
  })

  return {
    count: flaggedRecords.length,
    records: flaggedRecords.sort((a, b) => a.wordCount - b.wordCount), // Shortest first
    percentage: incidents.length > 0
      ? ((flaggedRecords.length / incidents.length) * 100).toFixed(1)
      : '0.0',
    status: flaggedRecords.length === 0 ? 'good' : 'warning',
    summary: {
      shortDescriptions: flaggedRecords.filter(r => r.wordCount <= 15).length,
      primaryDescriptor: flaggedRecords.filter(r => r.wordCount > 15).length,
      topVagueTerms: Object.entries(
        flaggedRecords.reduce((acc, r) => {
          r.vagueTerms.forEach(({ term }) => {
            acc[term] = (acc[term] || 0) + 1
          })
          return acc
        }, {})
      )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([term, count]) => ({ term, count }))
    }
  }
}
