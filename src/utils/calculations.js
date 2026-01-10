import { differenceInDays, startOfMonth, endOfMonth, isWithinInterval, parseISO, getWeek, getYear } from 'date-fns'
import { HAZARD_PATTERNS, HAZARD_CATEGORIES, MAJOR_HAZARDS } from './constants'
import { categorizeHazard, normalizeHazardCategory } from './excelParser'

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
 * Fix mis-categorized Major Hazards that were wrongly changed to "Work Environment"
 * This migration fixes records where:
 * 1. originalHazardCategory was a valid Major Hazard (e.g., "Energised Systems")
 * 2. But location was set to "Work Environment" due to empty/minimal description
 *
 * The fix re-processes using the original Excel category, which will now be trusted
 * for Major Hazards when description is empty.
 */
export const fixMiscategorizedMajorHazards = (incidents) => {
  let fixedCount = 0

  const fixed = incidents.map(incident => {
    // Only fix records that meet all criteria:
    // 1. Has originalHazardCategory from Excel
    // 2. Current location is "Work Environment"
    // 3. Original category normalizes to a Major Hazard
    if (
      incident.originalHazardCategory &&
      incident.location === 'Work Environment' &&
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

  if (fixedCount > 0) {
    console.log(`[Migration] Fixed ${fixedCount} mis-categorized Major Hazard records`)
  }

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

// Calculate Days Without LTI
export const calculateDaysWithoutLTI = (incidents) => {
  const ltiIncidents = incidents
    .filter(i => i.type === 'lti')
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  if (ltiIncidents.length === 0) {
    // If no LTI ever, calculate from earliest incident or return a default
    const allIncidents = [...incidents].sort((a, b) => new Date(a.date) - new Date(b.date))
    if (allIncidents.length === 0) return 365 // Default if no incidents at all
    return differenceInDays(new Date(), parseISO(allIncidents[0].date))
  }

  const lastLTI = parseISO(ltiIncidents[0].date)
  return differenceInDays(new Date(), lastLTI)
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

  const incidentTypes = ['lti', 'mti', 'fac']

  incidents.forEach(incident => {
    // Aggregate LTI, MTI, FAC into 'incident' count
    if (incidentTypes.includes(incident.type)) {
      counts['incident']++
    } else if (counts.hasOwnProperty(incident.type)) {
      counts[incident.type]++
    }
  })

  return counts
}

// Get incidents grouped by month - Positive vs Negative Observations
export const getIncidentsByMonth = (incidents, months = 12) => {
  const now = new Date()
  const result = []

  // Define types
  const negativeTypes = ['unsafe-act', 'unsafe-condition', 'near-miss', 'ncr']
  const incidentTypes = ['lti', 'mti', 'fac']

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
      negative: monthIncidents.filter(i => negativeTypes.includes(i.type)).length,
      incidents: monthIncidents.filter(i => incidentTypes.includes(i.type)).length,
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

// Calculate project safety score (0-100)
export const calculateProjectSafetyScore = (project, incidents, engagements) => {
  const projectIncidents = incidents.filter(i => i.projectId === project.id)
  const projectEngagements = engagements.filter(e => e.projectId === project.id)

  // Base score of 100
  let score = 100

  // Deduct for incidents (weighted by severity)
  projectIncidents.forEach(incident => {
    switch (incident.type) {
      case 'lti': score -= 25; break
      case 'mti': score -= 15; break
      case 'fac': score -= 10; break
      case 'ncr': score -= 5; break // Non-Conformance
      case 'near-miss': score -= 3; break
      default: score -= 1
    }
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

// Get overdue compliance items
export const getOverdueComplianceCount = (compliance) => {
  const now = new Date()
  return compliance.filter(c => {
    const expiryDate = parseISO(c.expiryDate)
    return expiryDate < now
  }).length
}

// Get expiring soon compliance items (within 30 days)
export const getExpiringSoonCount = (compliance, days = 30) => {
  const now = new Date()
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)

  return compliance.filter(c => {
    const expiryDate = parseISO(c.expiryDate)
    return expiryDate >= now && expiryDate <= futureDate
  }).length
}

// Generate heatmap data for activity calendar
export const generateHeatmapData = (engagements, days = 365) => {
  const now = new Date()
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

// Get weekly tracker data
export const getWeeklyTrackerData = (engagements, projects, weekOffset = 0) => {
  const now = new Date()
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
