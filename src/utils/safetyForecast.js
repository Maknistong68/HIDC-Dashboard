import {
  forecastIncidentsByPeriod,
  predictIncidentTypeProbability,
  calculateRiskScore,
  getHazardTrendingByPeriod
} from './insightsCalculations'

/**
 * Weather tier definitions (5 levels, higher score = safer)
 */
const WEATHER_TIERS = [
  { min: 80, label: 'Sunny', icon: 'Sun', color: '#22c55e' },
  { min: 60, label: 'Partly Cloudy', icon: 'CloudSun', color: '#3b82f6' },
  { min: 40, label: 'Cloudy', icon: 'Cloud', color: '#eab308' },
  { min: 20, label: 'Stormy', icon: 'CloudRain', color: '#f97316' },
  { min: 0, label: 'Severe Storm', icon: 'CloudLightning', color: '#ef4444' }
]

function mapToWeather(score) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)))
  const tier = WEATHER_TIERS.find(t => clamped >= t.min) || WEATHER_TIERS[WEATHER_TIERS.length - 1]
  return { score: clamped, ...tier }
}

/**
 * Signal 1: Incident Trend (25%)
 * Uses forecastIncidentsByPeriod to check if incidents are predicted up or down.
 */
function calcTrendScore(incidents, period) {
  const periodKey = period === 1 ? 'week' : 'month'
  const forecast = forecastIncidentsByPeriod(incidents, periodKey, 1)

  if (forecast.error || !forecast.predictions?.length) {
    return { score: 50, detail: 'Insufficient data for trend' }
  }

  const pred = forecast.predictions[0]
  const change = pred.changePercent || 0

  let score
  if (pred.trend === 'decreasing') {
    score = Math.min(100, 80 + Math.abs(change) * 0.4)
  } else if (pred.trend === 'stable') {
    score = 60 - Math.abs(change) * 0.5
    score = Math.max(50, Math.min(70, score))
  } else {
    score = Math.max(0, 40 - Math.abs(change) * 0.6)
  }

  const arrow = pred.trend === 'decreasing' ? 'down' : pred.trend === 'increasing' ? 'up' : 'flat'
  const detail = `Incidents trending ${arrow} ${Math.abs(Math.round(change))}%`
  return { score: Math.round(score), detail }
}

/**
 * Signal 2: Severity Mix (20%)
 * Uses predictIncidentTypeProbability. High probability of LTI/MTI = lower score.
 */
function calcSeverityScore(incidents) {
  const result = predictIncidentTypeProbability(incidents)

  if (result.error || !result.hasData || !result.types?.length) {
    return { score: 70, detail: 'No severity data' }
  }

  // Calculate weighted risk from type probabilities
  const severityWeights = { lti: 1.0, mti: 0.6, fac: 0.2, 'near-miss': 0.05 }
  let weightedRisk = 0
  result.types.forEach(t => {
    const w = severityWeights[t.type] ?? 0.1
    weightedRisk += (t.probability / 100) * w
  })

  // Invert: low risk = high score. Max possible weightedRisk ~1.0
  const score = Math.round(Math.max(0, Math.min(100, (1 - weightedRisk) * 100)))

  // Find dominant concern
  const serious = result.types.filter(t => t.type === 'lti' || t.type === 'mti')
  let detail = 'Severity mix is favorable'
  if (serious.length > 0) {
    const rising = serious.filter(t => t.trend === 'increasing')
    if (rising.length > 0) {
      detail = `${rising.map(t => t.label?.split(' ')[0] || t.type.toUpperCase()).join(', ')} probability rising`
    } else {
      const totalSerious = serious.reduce((s, t) => s + t.probability, 0)
      detail = `Serious types at ${Math.round(totalSerious)}% probability`
    }
  }

  return { score, detail }
}

/**
 * Signal 3: Near-Miss Reporting (20%)
 * Uses calculateRiskScore factor 1 directly.
 */
function calcNearMissScore(riskResult) {
  const factor = riskResult.factors?.find(f => f.name === 'Near-Miss Reporting')
  if (!factor) return { score: 50, detail: 'No near-miss data' }
  const detail = factor.detail || (factor.score >= 70 ? 'Good reporting rate' : 'Low near-miss capture')
  return { score: Math.round(factor.score), detail }
}

/**
 * Signal 4: Action Closure (20%)
 * Uses calculateRiskScore factor 3 (High-Risk Closure).
 */
function calcClosureScore(riskResult) {
  const factor = riskResult.factors?.find(f => f.name === 'High-Risk Closure')
  if (!factor) return { score: 50, detail: 'No closure data' }
  const detail = factor.detail || `${Math.round(factor.score)}% actions closed`
  return { score: Math.round(factor.score), detail }
}

/**
 * Signal 5: Hazard Trend Direction (15%)
 * Uses getHazardTrendingByPeriod. More declining hazards = higher score.
 */
function calcHazardDirectionScore(incidents, period) {
  const hazards = getHazardTrendingByPeriod(incidents, period)
  const withData = hazards.filter(h => !h.hasNoData)

  if (withData.length === 0) {
    return { score: 50, detail: 'No hazard trend data' }
  }

  let declining = 0
  let stable = 0
  let rising = 0

  withData.forEach(h => {
    const level = h.trendLevel?.level
    if (level === 'declining' || level === 'significant-decline' || level === 'improving') declining++
    else if (level === 'rising' || level === 'significant-rise' || level === 'critical' || level === 'warning' || level === 'attention') rising++
    else stable++
  })

  const total = withData.length
  const score = Math.round((declining * 100 + stable * 60 + rising * 10) / total)
  const risingCount = rising

  let detail = 'Hazard trends balanced'
  if (risingCount > 2) detail = `Watch: ${risingCount} hazard categories rising`
  else if (declining > rising) detail = `${declining} hazard categories improving`
  else if (risingCount > 0) detail = `${risingCount} hazard categor${risingCount === 1 ? 'y' : 'ies'} rising`

  return { score: Math.max(0, Math.min(100, score)), detail }
}

/**
 * Main entry: calculate the safety weather forecast for a given period.
 *
 * @param {Array} incidents - filtered incident array
 * @param {'week'|'month'} period - 1 = week (3 months lookback), 3 = month
 * @returns {{ score, label, icon, color, factors[], insight }}
 */
export function calculateSafetyWeather(incidents, period = 'week') {
  if (!incidents?.length) {
    return {
      ...mapToWeather(50),
      factors: [],
      insight: 'Not enough data for a forecast'
    }
  }

  const periodMonths = period === 'week' ? 1 : 3

  // Pre-calculate shared risk score (used by signals 3 & 4)
  const riskResult = calculateRiskScore(incidents)

  const factors = [
    { key: 'trend', name: 'Incident Trend', weight: 0.25, ...calcTrendScore(incidents, periodMonths) },
    { key: 'severity', name: 'Severity Mix', weight: 0.20, ...calcSeverityScore(incidents) },
    { key: 'nearMiss', name: 'Near-Miss Reporting', weight: 0.20, ...calcNearMissScore(riskResult) },
    { key: 'closure', name: 'Action Closure', weight: 0.20, ...calcClosureScore(riskResult) },
    { key: 'hazardDir', name: 'Hazard Trends', weight: 0.15, ...calcHazardDirectionScore(incidents, periodMonths) }
  ]

  const finalScore = factors.reduce((sum, f) => sum + f.score * f.weight, 0)
  const weather = mapToWeather(finalScore)

  // Pick the most impactful insight (lowest scoring factor)
  const worstFactor = [...factors].sort((a, b) => a.score - b.score)[0]
  const insight = worstFactor?.detail || 'Conditions look stable'

  return { ...weather, factors, insight }
}
