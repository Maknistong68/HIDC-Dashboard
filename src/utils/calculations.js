import { startOfMonth, endOfMonth, isWithinInterval, parseISO, getWeek, getYear } from 'date-fns'
import { RECORDABLE_INCIDENT_TYPES, NEGATIVE_OBSERVATION_TYPES } from './constants'
import { getCurrentDate } from './dateUtils'

// Get incident counts by type
export const getIncidentCountsByType = (incidents) => {
  const counts = {
    'incident': 0, // Aggregates LTI, MTI, FAC
    'near-miss': 0,
    'ncr': 0, // Non-Conformance
    'unsafe-act': 0,
    'unsafe-condition': 0,
    'positive': 0,
    'leadership': 0, // Leadership Event
  }

  incidents.forEach(incident => {
    // Aggregate LTI, MTI, FAC into 'incident' count
    if (RECORDABLE_INCIDENT_TYPES.includes(incident.type)) {
      counts['incident']++
    } else if (counts.hasOwnProperty(incident.type)) {
      counts[incident.type]++
    }
  })

  return counts
}

// Get incidents grouped by month - Positive vs Negative Observations
// Uses centralized date for consistent "now" reference
export const getIncidentsByMonth = (incidents, months = 12) => {
  const now = getCurrentDate()
  const result = []

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthStart = startOfMonth(date)
    const monthEnd = endOfMonth(date)

    const monthIncidents = incidents.filter(incident => {
      const incidentDate = parseISO(incident.date)
      return isWithinInterval(incidentDate, { start: monthStart, end: monthEnd })
    })

    result.push({
      month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      negative: monthIncidents.filter(i => NEGATIVE_OBSERVATION_TYPES.includes(i.type)).length,
      incidents: monthIncidents.filter(i => RECORDABLE_INCIDENT_TYPES.includes(i.type)).length,
      positive: monthIncidents.filter(i => i.type === 'positive').length,
      total: monthIncidents.length,
    })
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
  lti: 25,
  mti: 15,
  fac: 10,
  ncr: 5,
  'near-miss': 3,  // See warning above about reporting suppression
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
  return incidents.filter(i => i.actionStatus === 'open' || i.actionStatus === 'in-progress').length
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
