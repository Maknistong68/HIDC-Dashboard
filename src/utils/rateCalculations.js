// ============================================================================
// PROXY EXPOSURE RATES
// Derive fair comparison rates from existing data (no man-hours needed)
// ============================================================================

import { isPositiveType } from './rootCauseEngine'
import { getSortedDates } from './incidentHelpers'

/**
 * Contractor-normalized rate: Incidents per 100 active contractors per month
 *
 * This normalizes for workforce size - a contractor with 10 incidents across
 * 100 workers is less concerning than 10 incidents across 5 workers.
 *
 * @param {Array} incidents - All incidents
 * @param {number} periodMonths - Number of months to analyze (default: all data)
 * @returns {Object} { rate, incidentCount, activeContractors, months, perContractor }
 */
export const contractorNormalizedRate = (incidents, periodMonths = null) => {
  if (!incidents?.length) return { rate: 0, incidentCount: 0, activeContractors: 0, months: 0, perContractor: [] }

  const dates = getSortedDates(incidents)
  if (!dates.length) return { rate: 0, incidentCount: 0, activeContractors: 0, months: 0, perContractor: [] }

  const firstDate = new Date(dates[0])
  const lastDate = new Date(dates[dates.length - 1])
  const totalDays = Math.max(1, Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24)) + 1)
  const months = Math.max(1, totalDays / 30.44) // average month length

  // Filter to period if specified
  let filtered = incidents
  if (periodMonths) {
    const cutoff = new Date(lastDate)
    cutoff.setMonth(cutoff.getMonth() - periodMonths)
    filtered = incidents.filter(i => i.date && new Date(i.date) >= cutoff)
  }

  // Count negative incidents and unique contractors
  const negativeIncidents = filtered.filter(i => !isPositiveType(i.type))
  const contractors = new Set(filtered.map(i => i.contractor || i.contractorName).filter(Boolean))
  const activeContractors = contractors.size || 1

  const rate = (negativeIncidents.length / activeContractors / months) * 100

  // Per-contractor breakdown
  const contractorCounts = {}
  negativeIncidents.forEach(i => {
    const name = i.contractor || i.contractorName || 'Unknown'
    contractorCounts[name] = (contractorCounts[name] || 0) + 1
  })
  const perContractor = Object.entries(contractorCounts)
    .map(([name, count]) => ({
      name,
      count,
      ratePerMonth: Math.round((count / months) * 100) / 100,
    }))
    .sort((a, b) => b.count - a.count)

  return {
    rate: Math.round(rate * 10) / 10,
    incidentCount: negativeIncidents.length,
    activeContractors,
    months: Math.round(months * 10) / 10,
    perContractor: perContractor.slice(0, 10),
  }
}

/**
 * Site-day rate: Incidents per active site per day (annualized)
 *
 * Normalizes for number of active work sites - more sites = more expected incidents.
 *
 * @param {Array} incidents - All incidents
 * @returns {Object} { dailyRate, annualizedRate, activeSites, totalDays, perSite }
 */
export const siteDayRate = (incidents) => {
  if (!incidents?.length) return { dailyRate: 0, annualizedRate: 0, activeSites: 0, totalDays: 0, perSite: [] }

  const dates = getSortedDates(incidents)
  if (!dates.length) return { dailyRate: 0, annualizedRate: 0, activeSites: 0, totalDays: 0, perSite: [] }

  const firstDate = new Date(dates[0])
  const lastDate = new Date(dates[dates.length - 1])
  const totalDays = Math.max(1, Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24)) + 1)

  const negativeIncidents = incidents.filter(i => !isPositiveType(i.type))
  const sites = new Set(incidents.map(i => i.site).filter(Boolean))
  const activeSites = sites.size || 1

  const dailyRate = negativeIncidents.length / activeSites / totalDays
  const annualizedRate = dailyRate * 365

  // Per-site breakdown
  const siteCounts = {}
  negativeIncidents.forEach(i => {
    const site = i.site || 'Unknown'
    siteCounts[site] = (siteCounts[site] || 0) + 1
  })
  const perSite = Object.entries(siteCounts)
    .map(([name, count]) => ({
      name,
      count,
      annualized: Math.round((count / totalDays) * 365 * 10) / 10,
    }))
    .sort((a, b) => b.count - a.count)

  return {
    dailyRate: Math.round(dailyRate * 1000) / 1000,
    annualizedRate: Math.round(annualizedRate * 10) / 10,
    activeSites,
    totalDays,
    perSite: perSite.slice(0, 10),
  }
}

/**
 * Observation density: Total observations per unique reporter per month
 *
 * Measures reporting culture - higher density means more active reporting.
 * Good benchmark: >5 observations per reporter per month indicates healthy culture.
 *
 * @param {Array} incidents - All incidents
 * @returns {Object} { density, totalObservations, uniqueReporters, months, benchmark }
 */
export const observationDensity = (incidents) => {
  if (!incidents?.length) return { density: 0, totalObservations: 0, uniqueReporters: 0, months: 0, benchmark: 'unknown' }

  const dates = getSortedDates(incidents)
  if (!dates.length) return { density: 0, totalObservations: 0, uniqueReporters: 0, months: 0, benchmark: 'unknown' }

  const firstDate = new Date(dates[0])
  const lastDate = new Date(dates[dates.length - 1])
  const totalDays = Math.max(1, Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24)) + 1)
  const months = Math.max(1, totalDays / 30.44)

  // Use contractor field as proxy for "reporter" since we don't have a reporter field
  const reporters = new Set(incidents.map(i => i.contractor || i.contractorName).filter(Boolean))
  const uniqueReporters = reporters.size || 1

  const density = incidents.length / uniqueReporters / months

  let benchmark = 'low'
  if (density >= 10) benchmark = 'excellent'
  else if (density >= 5) benchmark = 'good'
  else if (density >= 2) benchmark = 'moderate'

  return {
    density: Math.round(density * 10) / 10,
    totalObservations: incidents.length,
    uniqueReporters,
    months: Math.round(months * 10) / 10,
    benchmark,
  }
}

/**
 * Calculate all proxy rates at once
 * @param {Array} incidents - All incidents
 * @returns {Object} { contractor, site, observation }
 */
export const calculateAllRates = (incidents) => {
  return {
    contractor: contractorNormalizedRate(incidents),
    site: siteDayRate(incidents),
    observation: observationDensity(incidents),
  }
}
