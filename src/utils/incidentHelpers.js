import { parseISO, subMonths, subDays } from 'date-fns'

// ============ DATE UTILITIES ============

// Replace 16 occurrences of: incidents.map(i => i.date).filter(Boolean).sort()
export const getSortedDates = (incidents) =>
  incidents.map((i) => i.date).filter(Boolean).sort()

// Replace 7+ occurrences of date range extraction
export const getIncidentDateRange = (incidents, periodMonths = null) => {
  const dates = getSortedDates(incidents)
  if (dates.length === 0) return { startDate: null, endDate: null, dates: [], hasData: false }
  const endDate = parseISO(dates[dates.length - 1])
  let startDate
  if (periodMonths === null || periodMonths === undefined) {
    startDate = parseISO(dates[0])
  } else if (periodMonths < 1) {
    startDate = subDays(endDate, Math.round(periodMonths * 30))
  } else {
    startDate = subMonths(endDate, periodMonths)
  }
  return { startDate, endDate, dates, hasData: true }
}

// ============ FILTERING UTILITIES ============

// Replace 14 occurrences of: incidents.filter(i => i.location === hazardName)
export const filterByHazard = (incidents, hazardName) =>
  incidents.filter((i) => i.location === hazardName)

// Replace 8 occurrences of action status checks
export const isOpenAction = (incident) =>
  incident.actionStatus === 'open' || incident.actionStatus === 'in-progress'

export const getOpenActions = (incidents) => incidents.filter(isOpenAction)

// ============ UNIQUE VALUE EXTRACTORS ============

// Replace 6 occurrences of unique contractor/site extraction
export const getUniqueValues = (incidents, field) =>
  [...new Set(incidents.map((i) => i[field]).filter(Boolean))].sort()

export const getUniqueContractors = (incidents) => getUniqueValues(incidents, 'contractor')
export const getUniqueSites = (incidents) => getUniqueValues(incidents, 'site')
export const getUniqueHazards = (incidents) =>
  [...new Set(incidents.map((i) => i.location).filter(Boolean))]

// ============ TIME-SERIES UTILITIES ============

// Replace 5 occurrences of daily count accumulation
export const buildDailyCounts = (incidents, startDate, endDate) => {
  const dailyCounts = {}
  incidents.forEach((i) => {
    if (!i.date) return
    const dateKey = i.date.substring(0, 10)
    const d = parseISO(dateKey)
    if (d >= startDate && d <= endDate) {
      dailyCounts[dateKey] = (dailyCounts[dateKey] || 0) + 1
    }
  })
  return dailyCounts
}

// Replace 3 occurrences of linear regression
export const calculateLinearRegression = (values) => {
  const n = values.length
  if (n === 0) return { slope: 0, intercept: 0, rSquared: 0, trend: 'stable' }
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumX2 = 0
  for (let i = 0; i < n; i++) {
    sumX += i
    sumY += values[i]
    sumXY += i * values[i]
    sumX2 += i * i
  }
  const denominator = n * sumX2 - sumX * sumX
  const slope = denominator !== 0 ? (n * sumXY - sumX * sumY) / denominator : 0
  const intercept = n > 0 ? (sumY - slope * sumX) / n : 0
  // R-squared
  const meanY = sumY / n
  let ssTot = 0,
    ssRes = 0
  for (let i = 0; i < n; i++) {
    const predicted = slope * i + intercept
    ssTot += Math.pow(values[i] - meanY, 2)
    ssRes += Math.pow(values[i] - predicted, 2)
  }
  const rSquared = ssTot > 0 ? 1 - ssRes / ssTot : 0
  const trend = slope > 0.1 ? 'increasing' : slope < -0.1 ? 'decreasing' : 'stable'
  return { slope, intercept, rSquared, trend }
}

// ============ PATTERN MATCHING ============

// Replace 7+ occurrences in rootCauseEngine.js
export const matchPatterns = (text, patterns) => patterns.filter((pattern) => text.includes(pattern))

export const normalizeText = (text, trimWhitespace = true) => {
  let normalized = (text || '').toLowerCase()
  if (trimWhitespace) normalized = normalized.replace(/\s+/g, ' ').trim()
  return normalized
}

// ============ FORMATTING ============

// Replace 6 inconsistent toFixed patterns
export const roundTo = (value, decimals = 1) =>
  Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)

export const formatPercent = (value, decimals = 1) => parseFloat(value).toFixed(decimals)

// Note: RECORDABLE_INCIDENT_TYPES is in constants.js - import from there
