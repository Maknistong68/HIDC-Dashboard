import { isPositiveType } from './rootCauseEngine'
import { getSortedDates } from './incidentHelpers'
import { SEVERITY_WEIGHTS } from './calculations'
import { SIGNIFICANT_HAZARDS, PYRAMID_SECTIONS } from './constants'

// ============================================================================
// IMPACT AXIS - "What is the worst that has happened?"
// Safety Risk Assessment Standard
// ============================================================================

// Maps incident type → impact severity level (1-5)
export const CONSEQUENCE_TYPE_MAP = {
  fatality: 4,
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

// Description-based severity signals — phrases from the NEOM Hazard Impact Table
// Each entry: { phrases: string[], minSeverity: number, bypassMaxBoost: boolean }
// bypassMaxBoost=true means the phrase can jump directly to its level (level 5 only)
// bypassMaxBoost=false means the phrase is capped at +1 above the type severity
export const DESCRIPTION_SEVERITY_SIGNALS = [
  {
    minSeverity: 5,
    bypassMaxBoost: true,
    phrases: ['multiple fatalities', 'multiple deaths', 'several fatalities', 'mass casualty'],
  },
  {
    minSeverity: 4,
    bypassMaxBoost: false,
    phrases: [
      'permanent disability', 'amputation', 'paralysis',
      'complete shutdown', 'stop work order', 'license suspended',
    ],
  },
  {
    minSeverity: 3,
    bypassMaxBoost: false,
    phrases: ['hospitalized', 'hospitalization', 'admitted to hospital', 'intensive care'],
  },
]

/**
 * Scan description text for severity-indicating phrases.
 * Returns the highest matching signal or null.
 * @param {string} description - Incident description text
 * @returns {{ minSeverity: number, bypassMaxBoost: boolean } | null}
 */
export const getDescriptionSeveritySignal = (description) => {
  if (!description || typeof description !== 'string') return null
  const text = description.toLowerCase()
  for (const signal of DESCRIPTION_SEVERITY_SIGNALS) {
    for (const phrase of signal.phrases) {
      if (text.includes(phrase)) {
        return { minSeverity: signal.minSeverity, bypassMaxBoost: signal.bypassMaxBoost }
      }
    }
  }
  return null
}

/**
 * Count fatality-type incidents with time-decay weight >= 0.6 (within ~6 months).
 * Used for the multiple-fatalities override to reach consequence level 5.
 * @param {Array} incidents - Incidents for this hazard
 * @param {Date} referenceDate - Date to measure recency from
 * @returns {number} Count of recent fatalities
 */
export const countRecentFatalities = (incidents, referenceDate) => {
  if (!incidents?.length) return 0
  const now = referenceDate || new Date()
  let count = 0
  for (const incident of incidents) {
    const type = incident.type?.toLowerCase()
    if (type !== 'fatality') continue
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
    if (weight >= 0.6) count++
  }
  return count
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

// Assessment period for Poisson probability calculation (1 year = standard operational HSE)
export const ASSESSMENT_PERIOD_DAYS = 365

// Likelihood probability thresholds — ISO 31000 / AS/NZS 4360 aligned
// P(≥1 incident in assessment period) = 1 − e^(−λT)
// where λ = observed rate (incidents/day), T = assessment period (days)
export const LIKELIHOOD_PROBABILITY_THRESHOLDS = [
  { level: 5, minProbability: 0.90, label: '>90%',    freqDesc: 'Multiple times per year' },
  { level: 4, minProbability: 0.71, label: '71–90%',  freqDesc: 'Once every 1–2 years' },
  { level: 3, minProbability: 0.31, label: '31–70%',  freqDesc: 'Once every 2–5 years' },
  { level: 2, minProbability: 0.10, label: '10–30%',  freqDesc: 'Once every 5–10 years' },
  { level: 1, minProbability: 0,    label: '<10%',     freqDesc: 'Once in 10+ years' },
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
 * Calculate consequence level for a hazard using time-decayed worst severity,
 * enhanced with description-based severity signals from the NEOM Hazard Impact Table.
 *
 * Three paths (in order):
 *   A) Multiple recent fatalities (≥2 within ~6 months) → level 5 immediately
 *   B) Per-incident: type severity + description boost (capped at +1, unless bypassMaxBoost)
 *   C) Time decay still applies to boosted severity
 *
 * @param {Array} incidents - Negative incidents for this hazard
 * @param {Date} [referenceDate] - Date to measure recency from (defaults to now)
 * @returns {number} Consequence level 1-5
 */
export const calculateConsequenceLevel = (incidents, referenceDate) => {
  if (!incidents?.length) return 1
  const now = referenceDate || new Date()

  // Path A: Multiple recent fatalities → level 5 (complete shutdown scenario)
  if (countRecentFatalities(incidents, now) >= 2) return 5

  // Path B + C: Per-incident type + description boost with time decay
  let maxWeighted = 0

  for (const incident of incidents) {
    const type = incident.type?.toLowerCase()
    if (!type) continue
    const typeSeverity = CONSEQUENCE_TYPE_MAP[type] || 0
    if (typeSeverity === 0) continue

    // Check description for severity-indicating phrases
    const descSignal = getDescriptionSeveritySignal(incident.description)
    let effectiveSeverity = typeSeverity

    if (descSignal) {
      if (descSignal.bypassMaxBoost) {
        // Level 5 phrases (e.g. "multiple fatalities") can jump directly
        effectiveSeverity = Math.max(typeSeverity, descSignal.minSeverity)
      } else {
        // Conservative +1 cap: boost at most 1 level above type severity
        effectiveSeverity = Math.max(typeSeverity, Math.min(typeSeverity + 1, descSignal.minSeverity))
      }
    }

    // Calculate time-decay weight
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

    const weighted = effectiveSeverity * weight
    if (weighted > maxWeighted) maxWeighted = weighted
  }

  return Math.max(1, Math.min(5, Math.round(maxWeighted)))
}

/**
 * Calculate the Poisson probability of at least 1 incident occurring
 * within the assessment period, given the observed rate.
 *
 * Formula: P(≥1) = 1 − e^(−λT)
 *   λ = negativeCount / totalDays  (observed rate, incidents per day)
 *   T = ASSESSMENT_PERIOD_DAYS     (365 days = 1 year)
 *
 * @param {number} negativeCount - Number of negative incidents for this hazard
 * @param {number} totalDays - Total calendar days in the dataset
 * @returns {number} Probability 0–1
 */
export const calculatePoissonProbability = (negativeCount, totalDays) => {
  if (totalDays <= 0 || negativeCount <= 0) return 0
  const lambda = negativeCount / totalDays
  return 1 - Math.exp(-lambda * ASSESSMENT_PERIOD_DAYS)
}

/**
 * Calculate likelihood level for a hazard using Poisson probability.
 *
 * Maps the probability of at least 1 incident in the assessment period
 * to the 5-level scale per ISO 31000 / AS/NZS 4360:
 *   5 Almost Certain  >90%   Multiple times per year
 *   4 Likely           71–90% Once every 1–2 years
 *   3 Possible         31–70% Once every 2–5 years
 *   2 Unlikely         10–30% Once every 5–10 years
 *   1 Rare             <10%   Once in 10+ years
 *
 * Confidence caps prevent statistical noise from inflating small samples.
 *
 * @param {number} negativeCount - Number of negative incidents for this hazard
 * @param {number} totalDays - Total days in the dataset
 * @returns {number} Likelihood level 1-5
 */
export const calculateLikelihoodLevel = (negativeCount, totalDays) => {
  if (totalDays <= 0 || negativeCount <= 0) return 1

  const probability = calculatePoissonProbability(negativeCount, totalDays)

  // Map probability to likelihood level (highest match first)
  let calculated = 1
  for (const { level, minProbability } of LIKELIHOOD_PROBABILITY_THRESHOLDS) {
    if (probability >= minProbability) {
      calculated = level
      break
    }
  }

  // Confidence cap: small sample sizes are statistically unreliable
  if (negativeCount < 3) calculated = Math.min(calculated, 2)       // <3 incidents → cap at Unlikely
  else if (negativeCount < 5) calculated = Math.min(calculated, 3)  // <5 incidents → cap at Possible

  // Confidence cap: short observation windows inflate annualized rates
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
 * Calculate matrix placement for all hazards using Poisson probability.
 *
 * Each hazard gets:
 *   - consequence: time-decayed worst severity (1-5)
 *   - likelihood: Poisson probability mapped to ISO 31000 levels (1-5)
 *   - riskScore: L × C (1-25)
 *   - probability: raw P(≥1) over the assessment period (0-1)
 *
 * @param {Array} allIncidents - All incidents in the dataset
 * @param {Array} sortedHazards - Hazards from getHazardTrendingByPeriod()
 * @returns {Object} { hazards: [...], thresholds, totalDays }
 */
export const plotHazardsOnMatrix = (allIncidents, sortedHazards) => {
  if (!allIncidents?.length || !sortedHazards?.length) {
    return { hazards: [], thresholds: LIKELIHOOD_PROBABILITY_THRESHOLDS, totalDays: 0 }
  }

  // Calculate total days in dataset
  const dates = getSortedDates(allIncidents)
  if (!dates.length) {
    return { hazards: [], thresholds: LIKELIHOOD_PROBABILITY_THRESHOLDS, totalDays: 0 }
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

  // Calculate L x C for each hazard
  const hazards = sortedHazards
    .filter(h => !h.hasNoData && h.totalCount > 0)
    .map(h => {
      const incidents = hazardIncidentMap.get(h.name) || []
      if (incidents.length === 0) return null

      const consequence = calculateConsequenceLevel(incidents, lastDate)
      const likelihood = calculateLikelihoodLevel(incidents.length, totalDays)
      const riskScore = calculateMatrixRiskScore(likelihood, consequence)
      const rate = incidents.length / totalDays
      const probability = calculatePoissonProbability(incidents.length, totalDays)
      const zone = getRiskZone(likelihood, consequence)

      return {
        ...h,
        consequence,
        likelihood,
        riskScore,
        rate: Math.round(rate * 1000) / 1000,
        probability: Math.round(probability * 1000) / 1000,
        zone,
        negativeCount: incidents.length,
        incidents,
      }
    })
    .filter(Boolean)
    .sort((a, b) => b.riskScore - a.riskScore || b.negativeCount - a.negativeCount)

  return { hazards, thresholds: LIKELIHOOD_PROBABILITY_THRESHOLDS, totalDays }
}

// ============================================================================
// PYRAMID RANKING — Weighted severity scoring for hazard prioritization
// ============================================================================

// Build a lookup: incident type → which PYRAMID_SECTIONS section it belongs to
const TYPE_TO_SECTION = (() => {
  const map = {}
  for (const section of PYRAMID_SECTIONS) {
    for (const t of section.types) {
      map[t.key] = section.id
    }
  }
  return map
})()

// Section IDs for grouping scores
const SECTION_IDS = {
  INJURY: 'incidents-hum',
  ENV_PROP: 'incidents-env-dmg',
  OBSERVATIONS: 'observations',
}

/**
 * Calculate pyramid-weighted severity ranking for all hazards.
 *
 * Groups negative incidents by hazard, multiplies count × SEVERITY_WEIGHTS per type,
 * and merges the L×C Risk Score from the risk matrix for combined ranking.
 *
 * Ranking order: riskScore (L×C, 1-25) first, then pyramidScore (weighted count) as tiebreaker.
 * This ensures hazards that are both frequent AND severe rank highest.
 *
 * @param {Array} incidents - All incidents (positive types are filtered out internally)
 * @param {Array} sortedHazards - Hazards from getHazardTrendingByPeriod() (for trend data)
 * @param {Object} [matrixData] - Output from plotHazardsOnMatrix() with L×C risk scores
 * @returns {Array<Object>} Ranked hazards with riskScore, pyramidScore, breakdown, sections, topContributor
 */
export const calculatePyramidRanking = (incidents, sortedHazards, matrixData) => {
  if (!incidents?.length) return []

  const significantSet = new Set(SIGNIFICANT_HAZARDS)

  // Build trend lookup from sortedHazards
  const trendMap = new Map()
  if (sortedHazards?.length) {
    for (const h of sortedHazards) {
      trendMap.set(h.name, h.trendLevel)
    }
  }

  // Build risk matrix lookup: hazard name → { riskScore, likelihood, consequence, zone }
  const matrixMap = new Map()
  if (matrixData?.hazards?.length) {
    for (const h of matrixData.hazards) {
      matrixMap.set(h.name, {
        riskScore: h.riskScore,
        likelihood: h.likelihood,
        consequence: h.consequence,
        zone: h.zone,
      })
    }
  }

  // Group negative incidents by hazard
  const hazardMap = new Map()
  for (const inc of incidents) {
    const hazard = inc.location
    if (!hazard) continue
    if (isPositiveType(inc.type)) continue
    if (!hazardMap.has(hazard)) hazardMap.set(hazard, [])
    hazardMap.get(hazard).push(inc)
  }

  const results = []

  for (const [name, hazardIncidents] of hazardMap) {
    // Count by type and calculate weighted scores
    const typeCounts = {}
    let pyramidScore = 0

    for (const inc of hazardIncidents) {
      const type = inc.type?.toLowerCase()
      if (!type) continue
      if (!typeCounts[type]) typeCounts[type] = { count: 0, score: 0 }
      const weight = SEVERITY_WEIGHTS[type] || SEVERITY_WEIGHTS.default
      typeCounts[type].count += 1
      typeCounts[type].score += weight
      pyramidScore += weight
    }

    if (pyramidScore === 0) continue

    // Build breakdown (per-type) and sections (grouped)
    const breakdown = {}
    const sections = {
      [SECTION_IDS.INJURY]: 0,
      [SECTION_IDS.ENV_PROP]: 0,
      [SECTION_IDS.OBSERVATIONS]: 0,
    }

    let topType = null
    let topScore = 0

    for (const [type, data] of Object.entries(typeCounts)) {
      breakdown[type] = { count: data.count, score: data.score }
      const sectionId = TYPE_TO_SECTION[type]
      if (sectionId && sections[sectionId] !== undefined) {
        sections[sectionId] += data.score
      }
      if (data.score > topScore) {
        topScore = data.score
        topType = type
      }
    }

    // Find display label for top contributor
    let topLabel = topType
    for (const section of PYRAMID_SECTIONS) {
      const found = section.types.find(t => t.key === topType)
      if (found) { topLabel = found.label; break }
    }

    // Merge risk matrix L×C data
    const matrix = matrixMap.get(name) || { riskScore: 0, likelihood: 0, consequence: 0, zone: null }

    results.push({
      name,
      riskScore: matrix.riskScore,
      likelihood: matrix.likelihood,
      consequence: matrix.consequence,
      zone: matrix.zone,
      pyramidScore,
      rawCount: hazardIncidents.length,
      isSignificant: significantSet.has(name),
      trendLevel: trendMap.get(name) || null,
      breakdown,
      sections,
      topContributor: {
        type: topType,
        label: topLabel,
        percentage: Math.round((topScore / pyramidScore) * 100),
      },
    })
  }

  // Sort by riskScore (L×C) first, then pyramidScore as tiebreaker
  results.sort((a, b) => b.riskScore - a.riskScore || b.pyramidScore - a.pyramidScore || b.rawCount - a.rawCount)

  // Assign ranks
  for (let i = 0; i < results.length; i++) {
    results[i].rank = i + 1
  }

  return results
}
