import { isPositiveType } from './rootCauseEngine'
import { getSortedDates } from './incidentHelpers'

// ============================================================================
// IMPACT AXIS - "What is the worst that has happened?"
// NEOM Safety Risk Assessment Standard (NEOM-NLF-STD-002.01 Rev 0.3.00)
// ============================================================================

// Maps incident type → impact severity level (1-5)
export const CONSEQUENCE_TYPE_MAP = {
  fatality: 5,
  lti: 3,
  fire: 4,
  mti: 2,
  environmental: 3,
  security: 3,
  fac: 2,
  'damage-to-property': 2,
  'property-damage': 2,
  'near-miss': 1,
  ncr: 1,
  'unsafe-act': 1,
  'unsafe-condition': 1,
}

export const CONSEQUENCE_LABELS = [
  '', // index 0 unused
  'Very Low',
  'Low',
  'Medium',
  'High',
  'Very High',
]

export const LIKELIHOOD_LABELS = [
  '', // index 0 unused
  'Rare',
  'Unlikely',
  'Possible',
  'Likely',
  'Almost Certain',
]

// Default thresholds (incidents per day) - ISO 31000 / AS/NZS 4360 aligned
const DEFAULT_LIKELIHOOD_THRESHOLDS = [
  { level: 5, min: 1.0 },    // Almost Certain: daily+
  { level: 4, min: 0.2 },    // Likely: 1-6 per week
  { level: 3, min: 0.033 },  // Possible: 1-6 per month
  { level: 2, min: 0.008 },  // Unlikely: 1-3 per quarter
  { level: 1, min: 0 },      // Rare: less than quarterly
]

// ============================================================================
// RISK LEVEL ZONES — 5-level score-based classification
// Score = L × C: Very High (20-25), High (15-19), Medium (8-14), Low (4-7), Very Low (1-3)
// ============================================================================

const RISK_ZONES = {
  veryHigh: {
    bg: 'bg-red-50',
    border: 'border-red-400',
    text: 'text-red-900',
    hover: 'hover:bg-red-100',
    badge: 'bg-red-600',
    shadow: 'shadow-md shadow-red-200/50',
    level: 'veryHigh',
    label: 'Very High',
    chipBg: 'bg-red-100',
    chipText: 'text-red-800',
    chipBorder: 'border-red-300',
  },
  high: {
    bg: 'bg-amber-50',
    border: 'border-amber-400',
    text: 'text-amber-900',
    hover: 'hover:bg-amber-100',
    badge: 'bg-amber-600',
    shadow: 'shadow-sm shadow-amber-200/50',
    level: 'high',
    label: 'High',
    chipBg: 'bg-amber-100',
    chipText: 'text-amber-800',
    chipBorder: 'border-amber-300',
  },
  medium: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-400',
    text: 'text-yellow-800',
    hover: 'hover:bg-yellow-100',
    badge: 'bg-yellow-500',
    shadow: '',
    level: 'medium',
    label: 'Medium',
    chipBg: 'bg-yellow-100',
    chipText: 'text-yellow-800',
    chipBorder: 'border-yellow-300',
  },
  low: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    text: 'text-emerald-800',
    hover: 'hover:bg-emerald-100',
    badge: 'bg-emerald-500',
    shadow: '',
    level: 'low',
    label: 'Low',
    chipBg: 'bg-emerald-100',
    chipText: 'text-emerald-800',
    chipBorder: 'border-emerald-300',
  },
  veryLow: {
    bg: 'bg-sky-50',
    border: 'border-sky-300',
    text: 'text-sky-800',
    hover: 'hover:bg-sky-100',
    badge: 'bg-sky-500',
    shadow: '',
    level: 'veryLow',
    label: 'Very Low',
    chipBg: 'bg-sky-100',
    chipText: 'text-sky-800',
    chipBorder: 'border-sky-300',
  },
}

/**
 * Get risk zone from Likelihood × Impact using score-based thresholds.
 * Score = L × C product determines the risk level (RAM standard).
 * Very High: 20-25, High: 10-19, Medium: 5-9, Low: 3-4, Very Low: 1-2
 */
export const getRiskZone = (likelihood, impact) => {
  const l = Math.max(1, Math.min(5, likelihood))
  const i = Math.max(1, Math.min(5, impact))
  const score = l * i
  if (score >= 20) return RISK_ZONES.veryHigh
  if (score >= 10) return RISK_ZONES.high
  if (score >= 5) return RISK_ZONES.medium
  if (score >= 3) return RISK_ZONES.low
  return RISK_ZONES.veryLow
}

/**
 * Get risk zone color for a specific L x C cell
 */
export const getCellRiskColor = (likelihood, consequence) => {
  return getRiskZone(likelihood, consequence)
}

/**
 * Get bold solid color for a score (1-25) based on its risk level (RAM standard).
 * Very High & High are both red shades; Medium yellow; Low lime; Very Low green.
 */
export const getScoreColor = (score) => {
  const s = Math.max(1, Math.min(25, score))
  if (s >= 20) return { backgroundColor: '#dc2626', color: '#ffffff', borderColor: '#991b1b' } // Very High – dark red
  if (s >= 10) return { backgroundColor: '#ef4444', color: '#450a0a', borderColor: '#dc2626' } // High – red
  if (s >= 5) return { backgroundColor: '#eab308', color: '#422006', borderColor: '#ca8a04' } // Medium – yellow
  if (s >= 3) return { backgroundColor: '#84cc16', color: '#1a2e05', borderColor: '#65a30d' } // Low – lime
  return { backgroundColor: '#22c55e', color: '#052e16', borderColor: '#16a34a' } // Very Low – green
}

/**
 * Get "Level - Score" label for a cell
 */
export const getScoreLabel = (likelihood, consequence) => {
  const score = likelihood * consequence
  const zone = getRiskZone(likelihood, consequence)
  return `${zone.label} - ${score}`
}

// ============================================================================
// CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate consequence level for a hazard based on worst recorded incident type
 * @param {Array} incidents - Incidents for this hazard
 * @returns {number} Consequence level 1-5
 */
export const calculateConsequenceLevel = (incidents) => {
  if (!incidents?.length) return 1
  let maxLevel = 0
  for (const incident of incidents) {
    const type = incident.type?.toLowerCase()
    if (!type) continue
    const level = CONSEQUENCE_TYPE_MAP[type] || 0
    if (level > maxLevel) maxLevel = level
  }
  return maxLevel || 1
}

/**
 * Get adaptive thresholds when dataset is small (<90 days)
 * Uses percentile distribution of hazard rates
 */
export const getAdaptiveThresholds = (hazardRates) => {
  if (!hazardRates.length) return DEFAULT_LIKELIHOOD_THRESHOLDS

  const sorted = [...hazardRates].sort((a, b) => a - b)
  const pct = (p) => sorted[Math.min(Math.floor(p * sorted.length), sorted.length - 1)]

  return [
    { level: 5, min: pct(0.8) },
    { level: 4, min: pct(0.6) },
    { level: 3, min: pct(0.4) },
    { level: 2, min: pct(0.2) },
    { level: 1, min: 0 },
  ]
}

/**
 * Calculate likelihood level for a hazard based on incident frequency
 * @param {number} negativeCount - Number of negative incidents for this hazard
 * @param {number} totalDays - Total days in the dataset
 * @param {Array} thresholds - Likelihood thresholds to use
 * @returns {number} Likelihood level 1-5
 */
export const calculateLikelihoodLevel = (negativeCount, totalDays, thresholds) => {
  if (totalDays <= 0 || negativeCount <= 0) return 1
  const rate = negativeCount / totalDays
  const levels = thresholds || DEFAULT_LIKELIHOOD_THRESHOLDS
  for (const { level, min } of levels) {
    if (rate >= min) return level
  }
  return 1
}

/**
 * Calculate risk score (L x C product, 1-25 scale)
 */
export const calculateMatrixRiskScore = (likelihood, consequence) => {
  return likelihood * consequence
}

// ============================================================================
// MAIN: Plot all hazards on the risk matrix
// ============================================================================

/**
 * Calculate matrix placement for all hazards
 * @param {Array} allIncidents - All incidents in the dataset
 * @param {Array} sortedHazards - Hazards from getHazardTrendingByPeriod()
 * @returns {Object} { hazards: [...], thresholds, totalDays, isAdaptive }
 */
export const plotHazardsOnMatrix = (allIncidents, sortedHazards) => {
  if (!allIncidents?.length || !sortedHazards?.length) {
    return { hazards: [], thresholds: DEFAULT_LIKELIHOOD_THRESHOLDS, totalDays: 0, isAdaptive: false }
  }

  // Calculate total days in dataset
  const dates = getSortedDates(allIncidents)
  if (!dates.length) {
    return { hazards: [], thresholds: DEFAULT_LIKELIHOOD_THRESHOLDS, totalDays: 0, isAdaptive: false }
  }
  const firstDate = new Date(dates[0])
  const lastDate = new Date(dates[dates.length - 1])
  const totalDays = Math.max(1, Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24)) + 1)

  // Group incidents by hazard, excluding positive types
  const hazardIncidentMap = new Map()
  for (const incident of allIncidents) {
    const hazardName = incident.location
    if (!hazardName) continue
    if (isPositiveType(incident.type)) continue
    if (!hazardIncidentMap.has(hazardName)) {
      hazardIncidentMap.set(hazardName, [])
    }
    hazardIncidentMap.get(hazardName).push(incident)
  }

  // Calculate rates for adaptive threshold check
  const hazardRates = []
  for (const [, incidents] of hazardIncidentMap) {
    hazardRates.push(incidents.length / totalDays)
  }

  // Use adaptive thresholds for small datasets (<90 days)
  const isAdaptive = totalDays < 90
  const thresholds = isAdaptive ? getAdaptiveThresholds(hazardRates) : DEFAULT_LIKELIHOOD_THRESHOLDS

  // Calculate L x C for each hazard
  const hazards = sortedHazards
    .filter(h => !h.hasNoData && h.totalCount > 0)
    .map(h => {
      const incidents = hazardIncidentMap.get(h.name) || []
      if (incidents.length === 0) return null

      // All incidents (including positive) for the hazard - for consequence calculation
      const allHazardIncidents = allIncidents.filter(i => i.location === h.name)

      const consequence = calculateConsequenceLevel(allHazardIncidents)
      const likelihood = calculateLikelihoodLevel(incidents.length, totalDays, thresholds)
      const riskScore = calculateMatrixRiskScore(likelihood, consequence)
      const rate = incidents.length / totalDays
      const zone = getRiskZone(likelihood, consequence)

      return {
        ...h,
        consequence,
        likelihood,
        riskScore,
        rate: Math.round(rate * 1000) / 1000,
        zone,
        negativeCount: incidents.length,
        incidents: allHazardIncidents,
      }
    })
    .filter(Boolean)
    .sort((a, b) => b.riskScore - a.riskScore || b.negativeCount - a.negativeCount)

  return { hazards, thresholds, totalDays, isAdaptive }
}
