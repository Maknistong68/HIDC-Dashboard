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
  // ENV sub-types
  'env-major': 4,
  'env-moderate': 3,
  'env-minor': 2,
  security: 3,
  fac: 2,
  // DMG sub-types
  'dmg-light-vehicle': 2,
  'dmg-heavy-plant': 3,
  'dmg-truck-trailer': 3,
  'dmg-static-equipment': 2,
  // Legacy consolidated types (backward compat)
  environmental: 3,
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
  if (s >= 10) return { backgroundColor: '#f87171', color: '#450a0a', borderColor: '#ef4444' } // High – red
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
 * Time-decay weights for consequence calculation.
 * Recent incidents have full weight; older incidents decay to avoid
 * permanently locking consequence at a historical worst-case level.
 */
const CONSEQUENCE_DECAY_BANDS = [
  { maxDaysAgo: 90, weight: 1.0 },   // Last 3 months: full weight
  { maxDaysAgo: 180, weight: 0.6 },  // 3-6 months: moderate decay
  { maxDaysAgo: 365, weight: 0.3 },  // 6-12 months: significant decay
  { maxDaysAgo: Infinity, weight: 0.1 }, // >1 year: minimal weight
]

/**
 * Calculate consequence level for a hazard using time-decayed worst severity.
 * Instead of a permanent max, recent severe incidents weigh more than old ones.
 * @param {Array} incidents - Negative incidents for this hazard
 * @param {Date} [referenceDate] - Date to measure recency from (defaults to now)
 * @returns {number} Consequence level 1-5
 */
export const calculateConsequenceLevel = (incidents, referenceDate) => {
  if (!incidents?.length) return 1
  const now = referenceDate || new Date()
  let maxWeighted = 0

  for (const incident of incidents) {
    const type = incident.type?.toLowerCase()
    if (!type) continue
    const severity = CONSEQUENCE_TYPE_MAP[type] || 0
    if (severity === 0) continue

    // Calculate days ago for this incident
    const incDate = incident.date ? new Date(incident.date) : null
    let weight = 1.0
    if (incDate && !isNaN(incDate)) {
      const daysAgo = Math.max(0, (now - incDate) / (1000 * 60 * 60 * 24))
      for (const band of CONSEQUENCE_DECAY_BANDS) {
        if (daysAgo <= band.maxDaysAgo) {
          weight = band.weight
          break
        }
      }
    }
    // No valid date → full weight (conservative: treat as recent)

    const weighted = severity * weight
    if (weighted > maxWeighted) maxWeighted = weighted
  }

  return Math.max(1, Math.round(maxWeighted))
}

/**
 * Get adaptive thresholds when dataset is small (<90 days)
 * Uses percentile distribution of hazard rates
 */
const getAdaptiveThresholds = (hazardRates) => {
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
 * Fix 5: Get blended thresholds for medium-sized datasets (30-90 days).
 * Linearly blends between adaptive (relative) and fixed (absolute) thresholds
 * so that rankings transition smoothly as dataset grows.
 * @param {Array} hazardRates - Array of rate values per hazard
 * @param {number} totalDays - Total days in the dataset
 * @returns {Array} Blended threshold array
 */
export const getBlendedThresholds = (hazardRates, totalDays) => {
  if (!hazardRates.length) return DEFAULT_LIKELIHOOD_THRESHOLDS
  if (totalDays >= 90) return DEFAULT_LIKELIHOOD_THRESHOLDS
  if (totalDays < 30) return getAdaptiveThresholds(hazardRates)

  // Blend: at 30 days weight=0.33 (mostly adaptive), at 90 days weight=1.0 (fully fixed)
  const weight = totalDays / 90
  const adaptive = getAdaptiveThresholds(hazardRates)

  return DEFAULT_LIKELIHOOD_THRESHOLDS.map((fixed, idx) => ({
    level: fixed.level,
    min: weight * fixed.min + (1 - weight) * adaptive[idx].min,
  }))
}

/**
 * Calculate likelihood level for a hazard based on incident frequency.
 * Applies confidence caps for small sample sizes and short dataset spans
 * to prevent statistical noise from inflating likelihood.
 * @param {number} negativeCount - Number of negative incidents for this hazard
 * @param {number} totalDays - Total days in the dataset
 * @param {Array} thresholds - Likelihood thresholds to use
 * @returns {number} Likelihood level 1-5
 */
export const calculateLikelihoodLevel = (negativeCount, totalDays, thresholds) => {
  if (totalDays <= 0 || negativeCount <= 0) return 1
  const rate = negativeCount / totalDays
  const levels = thresholds || DEFAULT_LIKELIHOOD_THRESHOLDS
  let calculated = 1
  for (const { level, min } of levels) {
    if (rate >= min) {
      calculated = level
      break
    }
  }

  // Fix 2: Minimum sample size guard
  // Small incident counts are statistically unreliable for high likelihood
  if (negativeCount < 3) calculated = Math.min(calculated, 2)       // <3 incidents → cap at Unlikely
  else if (negativeCount < 5) calculated = Math.min(calculated, 3)  // <5 incidents → cap at Possible

  // Fix 3: Minimum dataset span guard
  // Short observation windows inflate frequency rates
  if (totalDays < 14) calculated = Math.min(calculated, 2)       // <2 weeks → cap at Unlikely
  else if (totalDays < 30) calculated = Math.min(calculated, 3)  // <1 month → cap at Possible

  return calculated
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

  // Fix 5: Blended thresholds for datasets <90 days
  // <30 days: fully adaptive, 30-90 days: blended, >=90 days: fixed
  const isAdaptive = totalDays < 90
  const thresholds = getBlendedThresholds(hazardRates, totalDays)

  // Calculate L x C for each hazard
  const hazards = sortedHazards
    .filter(h => !h.hasNoData && h.totalCount > 0)
    .map(h => {
      const incidents = hazardIncidentMap.get(h.name) || []
      if (incidents.length === 0) return null

      // Fix 4: Use only negative incidents for consequence (consistent with likelihood)
      const consequence = calculateConsequenceLevel(incidents, lastDate)
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
        incidents,
      }
    })
    .filter(Boolean)
    .sort((a, b) => b.riskScore - a.riskScore || b.negativeCount - a.negativeCount)

  return { hazards, thresholds, totalDays, isAdaptive }
}
