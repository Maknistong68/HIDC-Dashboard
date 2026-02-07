import { differenceInDays, startOfMonth, endOfMonth, isWithinInterval, parseISO, getWeek, getYear } from 'date-fns'
import { HAZARD_PATTERNS, HAZARD_CATEGORIES, MAJOR_HAZARDS, RECORDABLE_INCIDENT_TYPES, NEGATIVE_OBSERVATION_TYPES } from './constants'
import { categorizeHazard, normalizeHazardCategory } from './excelParser'
import { getCurrentDate, getToday } from './dateUtils'

/**
 * Categorize hazard based on description - uses the 30 approved categories
 * (13 Major + 17 Sub-Significant hazards)
 * IMPORTANT: Never returns "Others" or "General Safety"
 */
export const categorizeHazardByDescription = (description, existingCategory = '') => {
  return categorizeHazard(description, existingCategory)
}

/**
 * Recategorize ALL incidents to use the 30 approved hazard categories
 * Uses context-aware 7-step classification system:
 * - Checks context redirects first (e.g., "line of fire" → Mobile Plant, not Fire)
 * - Validates Major hazards against description (prevents wrong categories)
 * - Prioritizes Major hazards (13) over Sub-Significant (17)
 * - Never returns "Others", "General Safety", or any non-approved categories
 */
export const recategorizeBlankHazards = (incidents) => {
  return incidents.map(incident => {
    // ALWAYS use categorizeHazard which has full validation logic
    // This ensures Major hazards are validated against description
    // and prevents incorrect categories like "Working on or Near Water" for PPE issues
    return {
      ...incident,
      location: categorizeHazard(incident.description, incident.location)
    }
  })
}

/**
 * Fix mis-categorized Major Hazards that were wrongly changed to "Unclassified"
 * This migration fixes records where:
 * 1. originalHazardCategory was a valid Major Hazard (e.g., "Energised Systems")
 * 2. But location was set to "Unclassified" due to empty/minimal description
 *
 * The fix re-processes using the original Excel category, which will now be trusted
 * for Major Hazards when description is empty.
 */
export const fixMiscategorizedMajorHazards = (incidents) => {
  let fixedCount = 0

  const fixed = incidents.map(incident => {
    // Only fix records that meet all criteria:
    // 1. Has originalHazardCategory from Excel
    // 2. Current location is "General Site Issues" (formerly "Unclassified")
    // 3. Original category normalizes to a Major Hazard
    if (
      incident.originalHazardCategory &&
      (incident.location === 'General Site Issues' || incident.location === 'Unclassified') &&
      incident.hazardCategorySource === 'auto-classified'
    ) {
      const normalizedOriginal = normalizeHazardCategory(incident.originalHazardCategory)

      if (normalizedOriginal && MAJOR_HAZARDS.includes(normalizedOriginal)) {
        // Re-run categorization with the original category
        // The updated categorizeHazard will now trust the Excel category
        const newCategory = categorizeHazard(incident.description, incident.originalHazardCategory)

        // Only update if the category changed
        if (newCategory !== incident.location) {
          fixedCount++
          return {
            ...incident,
            location: newCategory,
            hazardCategorySource: 'excel', // Now it's from Excel
            dataQualityIssue: null // Clear any previous issue
          }
        }
      }
    }

    return incident
  })

  // fixedCount tracked internally for silent migration

  return fixed
}

// Calculate TRIR (Total Recordable Incident Rate)
// TRIR = (Number of Recordable Incidents × 200,000) / Total Hours Worked
export const calculateTRIR = (incidents, totalManHours) => {
  if (!totalManHours || totalManHours === 0) return 0
  const recordableTypes = ['lti', 'mti', 'fac']
  const recordableCount = incidents.filter(i => recordableTypes.includes(i.type)).length
  return ((recordableCount * 200000) / totalManHours).toFixed(2)
}

// Calculate LTIR (Lost Time Incident Rate)
export const calculateLTIR = (incidents, totalManHours) => {
  if (!totalManHours || totalManHours === 0) return 0
  const ltiCount = incidents.filter(i => i.type === 'lti').length
  return ((ltiCount * 200000) / totalManHours).toFixed(2)
}

// Calculate Days Without LTI - uses centralized date
export const calculateDaysWithoutLTI = (incidents) => {
  const ltiIncidents = incidents
    .filter(i => i.type === 'lti')
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  if (ltiIncidents.length === 0) {
    // If no LTI ever, calculate from earliest incident or return a default
    const allIncidents = [...incidents].sort((a, b) => new Date(a.date) - new Date(b.date))
    if (allIncidents.length === 0) return 365 // Default if no incidents at all
    return differenceInDays(getCurrentDate(), parseISO(allIncidents[0].date))
  }

  const lastLTI = parseISO(ltiIncidents[0].date)
  return differenceInDays(getCurrentDate(), lastLTI)
}

// Calculate Engagement Score for a period
export const calculateEngagementScore = (engagements, targets, startDate, endDate) => {
  const periodEngagements = engagements.filter(e => {
    const date = parseISO(e.date)
    return isWithinInterval(date, { start: startDate, end: endDate })
  })

  let totalTarget = 0
  let totalCompleted = 0

  Object.entries(targets).forEach(([type, target]) => {
    totalTarget += target
    const completed = periodEngagements.filter(e => e.type === type).length
    totalCompleted += Math.min(completed, target)
  })

  if (totalTarget === 0) return 100
  return Math.round((totalCompleted / totalTarget) * 100)
}

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

// Get engagements grouped by type
export const getEngagementsByType = (engagements) => {
  const counts = {}

  engagements.forEach(engagement => {
    counts[engagement.type] = (counts[engagement.type] || 0) + 1
  })

  return counts
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

// Get overdue compliance items - uses centralized date
export const getOverdueComplianceCount = (compliance) => {
  const now = getCurrentDate()
  return compliance.filter(c => {
    const expiryDate = parseISO(c.expiryDate)
    return expiryDate < now
  }).length
}

// Get expiring soon compliance items (within 30 days) - uses centralized date
export const getExpiringSoonCount = (compliance, days = 30) => {
  const now = getCurrentDate()
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)

  return compliance.filter(c => {
    const expiryDate = parseISO(c.expiryDate)
    return expiryDate >= now && expiryDate <= futureDate
  }).length
}

// Generate heatmap data for activity calendar - uses centralized date
export const generateHeatmapData = (engagements, days = 365) => {
  const now = getCurrentDate()
  const result = []

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const dateStr = date.toISOString().split('T')[0]

    const dayEngagements = engagements.filter(e => e.date === dateStr)

    result.push({
      date: dateStr,
      count: dayEngagements.length,
      level: dayEngagements.length === 0 ? 0 :
             dayEngagements.length <= 2 ? 1 :
             dayEngagements.length <= 4 ? 2 :
             dayEngagements.length <= 6 ? 3 : 4
    })
  }

  return result
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
