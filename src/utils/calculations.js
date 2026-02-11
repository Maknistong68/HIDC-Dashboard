import { startOfMonth, endOfMonth, isWithinInterval, parseISO, getWeek, getYear, getDaysInMonth, getDate, differenceInMonths, startOfWeek, endOfWeek, startOfQuarter, endOfQuarter, getQuarter, format } from 'date-fns'
import { RECORDABLE_INCIDENT_TYPES, NEGATIVE_OBSERVATION_TYPES, PYRAMID_SECTIONS } from './constants'
import { getCurrentDate } from './dateUtils'
import { isOpenAction } from './incidentHelpers'

// Get incident counts by type - counts each specific sub-type individually
export const getIncidentCountsByType = (incidents) => {
  // Initialize counts for all pyramid types
  const counts = {}
  PYRAMID_SECTIONS.forEach(section => {
    section.types.forEach(t => {
      counts[t.key] = 0
    })
  })
  // Keep legacy aggregate 'incident' count for backward compatibility
  counts['incident'] = 0

  incidents.forEach(incident => {
    const type = incident.type
    // Count in specific sub-type bucket
    if (counts.hasOwnProperty(type)) {
      counts[type]++
    }
    // Also maintain aggregate 'incident' count for backward compat
    if (RECORDABLE_INCIDENT_TYPES.includes(type)) {
      counts['incident']++
    }
  })

  return counts
}

/**
 * Get the date range spanned by incident data
 * @param {Array} incidents - Array of incident objects with .date (yyyy-MM-dd)
 * @returns {{ minDate: Date|null, maxDate: Date|null, spanMonths: number }}
 */
export const getIncidentDataRange = (incidents) => {
  if (!incidents || incidents.length === 0) {
    return { minDate: null, maxDate: null, spanMonths: 0 }
  }

  const dates = incidents.map(i => i.date).filter(Boolean).sort()
  if (dates.length === 0) {
    return { minDate: null, maxDate: null, spanMonths: 0 }
  }

  const minDate = parseISO(dates[0])
  const maxDate = parseISO(dates[dates.length - 1])
  const spanMonths = differenceInMonths(maxDate, minDate)

  return { minDate, maxDate, spanMonths }
}

// Get incidents grouped by month - Positive vs Negative Observations
// Uses centralized date for consistent "now" reference
// Excludes the current month if less than 80% of it has elapsed to avoid
// misleading drops from incomplete data.
// When months is not specified, auto-detects range from incident data.
export const getIncidentsByMonth = (incidents, months) => {
  const now = getCurrentDate()
  const result = []

  // Auto-detect range from data if months not specified
  if (!months && incidents && incidents.length > 0) {
    const { minDate } = getIncidentDataRange(incidents)
    if (minDate) {
      months = differenceInMonths(now, minDate) + 1
      months = Math.max(months, 1)
    } else {
      months = 12
    }
  } else if (!months) {
    months = 12
  }

  // Check if the current month is mature enough to include (>=80% elapsed)
  const dayOfMonth = getDate(now)
  const totalDaysInMonth = getDaysInMonth(now)
  const monthProgress = dayOfMonth / totalDaysInMonth
  const includeCurrentMonth = monthProgress >= 0.8

  for (let i = months - 1; i >= 0; i--) {
    // Skip the current month (i === 0) if it's too immature
    if (i === 0 && !includeCurrentMonth) continue

    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthStart = startOfMonth(date)
    const monthEnd = endOfMonth(date)

    const monthIncidents = incidents.filter(incident => {
      const incidentDate = parseISO(incident.date)
      return isWithinInterval(incidentDate, { start: monthStart, end: monthEnd })
    })

    result.push({
      label: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      negative: monthIncidents.filter(i => NEGATIVE_OBSERVATION_TYPES.includes(i.type)).length,
      incidents: monthIncidents.filter(i => RECORDABLE_INCIDENT_TYPES.includes(i.type)).length,
      positive: monthIncidents.filter(i => i.type === 'positive').length,
      total: monthIncidents.length,
    })
  }

  return result
}

/**
 * Get incidents grouped by week - Positive vs Negative Observations
 * Range is data-driven: from oldest incident's week to current week.
 * Excludes the current week if less than 80% of it has elapsed.
 */
export const getIncidentsByWeek = (incidents) => {
  if (!incidents || incidents.length === 0) return []

  const now = getCurrentDate()
  const result = []

  const { minDate } = getIncidentDataRange(incidents)
  if (!minDate) return []

  // Check if current week is mature enough (>=80% elapsed)
  const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 })
  const currentWeekEnd = endOfWeek(now, { weekStartsOn: 1 })
  const totalWeekMs = currentWeekEnd.getTime() - currentWeekStart.getTime()
  const elapsedMs = now.getTime() - currentWeekStart.getTime()
  const weekProgress = elapsedMs / totalWeekMs
  const includeCurrentWeek = weekProgress >= 0.8

  // Generate weekly buckets from minDate's week to now
  const dataWeekStart = startOfWeek(minDate, { weekStartsOn: 1 })
  let cursor = new Date(dataWeekStart)

  while (cursor <= now) {
    const weekStart = startOfWeek(cursor, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(cursor, { weekStartsOn: 1 })

    // Skip current week if immature
    const isCurrentWeek = weekStart.getTime() === currentWeekStart.getTime()
    if (isCurrentWeek && !includeCurrentWeek) {
      cursor = new Date(cursor.getTime() + 7 * 24 * 60 * 60 * 1000)
      continue
    }

    const weekIncidents = incidents.filter(incident => {
      const incidentDate = parseISO(incident.date)
      return isWithinInterval(incidentDate, { start: weekStart, end: weekEnd })
    })

    result.push({
      label: format(weekStart, 'MMM d'),
      negative: weekIncidents.filter(i => NEGATIVE_OBSERVATION_TYPES.includes(i.type)).length,
      incidents: weekIncidents.filter(i => RECORDABLE_INCIDENT_TYPES.includes(i.type)).length,
      positive: weekIncidents.filter(i => i.type === 'positive').length,
      total: weekIncidents.length,
    })

    cursor = new Date(cursor.getTime() + 7 * 24 * 60 * 60 * 1000)
  }

  return result
}

/**
 * Get incidents grouped by quarter - Positive vs Negative Observations
 * Range is data-driven: from oldest incident's quarter to current quarter.
 * Excludes the current quarter if less than 80% of it has elapsed.
 */
export const getIncidentsByQuarter = (incidents) => {
  if (!incidents || incidents.length === 0) return []

  const now = getCurrentDate()
  const result = []

  const { minDate } = getIncidentDataRange(incidents)
  if (!minDate) return []

  // Check if current quarter is mature enough (>=80% elapsed)
  const currentQStart = startOfQuarter(now)
  const currentQEnd = endOfQuarter(now)
  const totalQMs = currentQEnd.getTime() - currentQStart.getTime()
  const elapsedQMs = now.getTime() - currentQStart.getTime()
  const quarterProgress = elapsedQMs / totalQMs
  const includeCurrentQuarter = quarterProgress >= 0.8

  // Generate quarterly buckets from minDate's quarter to now
  let cursor = new Date(startOfQuarter(minDate))

  while (cursor <= now) {
    const qStart = startOfQuarter(cursor)
    const qEnd = endOfQuarter(cursor)

    // Skip current quarter if immature
    const isCurrentQuarter = qStart.getTime() === currentQStart.getTime()
    if (isCurrentQuarter && !includeCurrentQuarter) {
      cursor = new Date(qStart.getFullYear(), qStart.getMonth() + 3, 1)
      continue
    }

    const qIncidents = incidents.filter(incident => {
      const incidentDate = parseISO(incident.date)
      return isWithinInterval(incidentDate, { start: qStart, end: qEnd })
    })

    const quarter = getQuarter(qStart)

    result.push({
      label: `Q${quarter} '${format(qStart, 'yy')}`,
      negative: qIncidents.filter(i => NEGATIVE_OBSERVATION_TYPES.includes(i.type)).length,
      incidents: qIncidents.filter(i => RECORDABLE_INCIDENT_TYPES.includes(i.type)).length,
      positive: qIncidents.filter(i => i.type === 'positive').length,
      total: qIncidents.length,
    })

    cursor = new Date(qStart.getFullYear(), qStart.getMonth() + 3, 1)
  }

  return result
}

/**
 * SEVERITY_WEIGHTS - Documented penalty weights for safety score calculation
 *
 * These weights are used to calculate a composite safety score where higher-severity
 * incidents result in larger score deductions from a base of 100.
 *
 * WEIGHT RATIONALE & SOURCES:
 * - LTI (Lost Time Injury): -25 points
 *   Most severe outcome requiring time off work. Reference: OSHA recordkeeping criteria
 *   (29 CFR 1904) classifies LTIs as the most serious recordable incidents.
 *
 * - MTI (Medical Treatment Injury): -15 points
 *   Requires professional medical treatment beyond first aid. Reference: OSHA defines
 *   MTIs as incidents requiring treatment administered by a physician.
 *
 * - FAC (First Aid Case): -10 points
 *   Minor injury treatable with first aid. Reference: OSHA 1904.7(a) defines first aid
 *   treatment list (cleaning wounds, bandages, non-prescription medications).
 *
 * - NCR (Non-Conformance Report): -5 points
 *   Process/procedure deviation without injury. Indicates systemic issues.
 *
 * - Near-miss: -3 points
 *   ⚠️ IMPORTANT BIAS WARNING: This penalty may inadvertently discourage near-miss
 *   reporting. Near-misses are LEADING INDICATORS - high reporting rates indicate
 *   a healthy safety culture, not poor performance. Organizations with robust
 *   near-miss reporting (>5% of observations) typically have LOWER incident rates.
 *   Reference: Heinrich's Triangle (1931), Bird & Germain (1985) show near-misses
 *   predict future incidents at ratios of 300:29:1 or 600:30:1.
 *
 *   RECOMMENDATION: Consider removing or inverting this penalty to reward near-miss
 *   reporting rather than penalizing it.
 *
 * - Default (other types): -1 point
 *   Catch-all for unclassified observations.
 *
 * CONFIGURABLE: These weights may be adjusted in future versions via settings.
 * Current values represent industry-standard severity ratios.
 */
export const SEVERITY_WEIGHTS = {
  fatality: 10000,
  lti: 1000,
  mti: 500,
  fac: 100,
  'environmental': 200,
  'fire': 500,
  'security': 100,
  'damage-to-property': 200,
  'near-miss': 50,
  ncr: 20,
  default: 1
}

/**
 * Calculate project safety score (0-100)
 *
 * Methodology:
 * - Starts with base score of 100
 * - Deducts points based on SEVERITY_WEIGHTS for each incident
 * - Adds engagement bonus (max +20 points)
 * - Clamped to 0-100 range
 *
 * @param {Object} project - Project object with id
 * @param {Array} incidents - All incidents to filter by project
 * @param {Array} engagements - All engagements to filter by project
 * @returns {number} Safety score 0-100
 *
 * @see SEVERITY_WEIGHTS for weight documentation and bias warnings
 */
export const calculateProjectSafetyScore = (project, incidents, engagements) => {
  const projectIncidents = incidents.filter(i => i.projectId === project.id)
  const projectEngagements = engagements.filter(e => e.projectId === project.id)

  // Base score of 100
  let score = 100

  // Deduct for incidents using documented SEVERITY_WEIGHTS
  projectIncidents.forEach(incident => {
    const weight = SEVERITY_WEIGHTS[incident.type] || SEVERITY_WEIGHTS.default
    score -= weight
  })

  // Bonus for engagements (max +20)
  const engagementBonus = Math.min(projectEngagements.length * 2, 20)
  score += engagementBonus

  return Math.max(0, Math.min(100, score))
}

// Get open actions count
export const getOpenActionsCount = (incidents) => {
  return incidents.filter(isOpenAction).length
}

// Get weekly tracker data - uses centralized date
export const getWeeklyTrackerData = (engagements, projects, weekOffset = 0) => {
  const now = getCurrentDate()
  const targetDate = new Date(now.getTime() - weekOffset * 7 * 24 * 60 * 60 * 1000)
  const weekNum = getWeek(targetDate)
  const year = getYear(targetDate)

  return projects.map(project => {
    const projectEngagements = engagements.filter(e => {
      const eDate = parseISO(e.date)
      return e.projectId === project.id &&
             getWeek(eDate) === weekNum &&
             getYear(eDate) === year
    })

    return {
      projectId: project.id,
      projectName: project.name,
      week: weekNum,
      year: year,
      inspections: projectEngagements.filter(e => e.type === 'site-inspection').length,
      toolboxTalks: projectEngagements.filter(e => e.type === 'toolbox-talk').length,
      audits: projectEngagements.filter(e => e.type === 'internal-audit' || e.type === 'external-audit').length,
      trainings: projectEngagements.filter(e => e.type === 'training').length,
      total: projectEngagements.length,
    }
  })
}

// Generate unique ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}
