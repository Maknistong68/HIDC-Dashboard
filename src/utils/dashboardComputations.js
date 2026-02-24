/**
 * Extracted Pure Computation Functions for Dashboard Pre-computation
 *
 * These functions mirror the computations in FilteredDataContext and Dashboard.jsx.
 * They are used by both:
 * 1. dashboardPrecompute.js — to pre-calculate during import phase
 * 2. The React hooks themselves — as fallback when cache misses
 *
 * Each function is pure: takes data in, returns computed result.
 */

import {
  PROACTIVE_TYPES,
  SIGNIFICANT_HAZARDS,
  SUB_SIGNIFICANT_HAZARDS,
  NEGATIVE_OBSERVATION_TYPES,
  INCIDENT_CATEGORY_TYPES,
  RECORDABLE_INCIDENT_TYPES,
  PYRAMID_SECTIONS,
} from './constants'
import { memoize } from './memoizedCalculations'
import { format, parseISO, eachMonthOfInterval, startOfMonth, endOfMonth } from 'date-fns'

// ─── Module-level constants (same as Dashboard.jsx lines 68-84) ─────────

const NEGATIVE_SET = new Set(NEGATIVE_OBSERVATION_TYPES)
const PROACTIVE_SET = new Set(PROACTIVE_TYPES)
const INCIDENT_CAT_SET = new Set(INCIDENT_CATEGORY_TYPES)
const SUB_TYPE_TO_PYRAMID = {
  'env-major': 'environmental',
  'env-moderate': 'environmental',
  'env-minor': 'environmental',
  'dmg-light-vehicle': 'damage-to-property',
  'dmg-heavy-plant': 'damage-to-property',
  'dmg-truck-trailer': 'damage-to-property',
  'dmg-static-equipment': 'damage-to-property',
  'property-damage': 'damage-to-property',
}

const SIGNIFICANT_HAZARDS_MAP = new Map(SIGNIFICANT_HAZARDS.map((h, i) => [h.toLowerCase(), i]))
const SUB_SIGNIFICANT_HAZARDS_MAP = new Map(SUB_SIGNIFICANT_HAZARDS.map((h, i) => [h.toLowerCase(), i]))

const normalizeHazard = memoize((hazard) => {
  if (!hazard) return null
  return hazard
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}, 500)

// ─── 1. computeFilteredDefaults ─────────────────────────────────────────
// Mirrors FilteredDataContext.defaults useMemo (lines 42-64)

export function computeFilteredDefaults(incidents) {
  const heatmap = []
  const wrFiltered = []
  const wrHeatmap = []
  const sites = new Set()
  for (let idx = 0; idx < incidents.length; idx++) {
    const i = incidents[idx]
    if (i.site) sites.add(i.site)
    const isProactive = i._isProactive !== undefined ? i._isProactive : PROACTIVE_SET.has(i.type)
    if (!isProactive) heatmap.push(i)
    if (i.workRelated !== false) {
      wrFiltered.push(i)
      if (!isProactive) wrHeatmap.push(i)
    }
  }
  return {
    baseFiltered: incidents,
    baseHeatmap: heatmap,
    workRelatedFiltered: wrFiltered,
    workRelatedHeatmap: wrHeatmap,
    siteOptions: Array.from(sites).sort().map(s => ({ value: s, label: s })),
  }
}

// ─── 2. computeUniqueContractors ────────────────────────────────────────
// Mirrors FilteredDataContext.uniqueContractors useMemo (lines 200-203)

export function computeUniqueContractors(incidents) {
  const contractors = [...new Set(incidents.map(i => i.contractor).filter(Boolean))]
  return contractors.sort().map(c => ({ value: c, label: c }))
}

// ─── 3. computeDashboardAggregates ──────────────────────────────────────
// Mirrors Dashboard.dashboardAggregates useDeferredMemo (lines 337-453)

export function computeDashboardAggregates(filteredIncidents, overdue30) {
  const total = filteredIncidents.length

  let closedCount = 0
  let openCount = 0
  let inProgressCount = 0
  let positiveTotal = 0
  let overdueCount = 0
  let negativeCount = 0
  let proactiveCount = 0
  let incidentCatCount = 0

  const approval = { closed: 0, contractorReview: 0, review: 0, contractorInvestigation: 0 }

  const pyramid = {}
  PYRAMID_SECTIONS.forEach(section => {
    section.types.forEach(t => { pyramid[t.key] = { open: 0, closed: 0 } })
  })

  const typeCounts = {}
  PYRAMID_SECTIONS.forEach(section => {
    section.types.forEach(t => { typeCounts[t.key] = 0 })
  })
  typeCounts['incident'] = 0

  const observerMap = {}
  const companyMap = {}

  for (let idx = 0; idx < total; idx++) {
    const i = filteredIncidents[idx]
    const isClosed = i.actionStatus === 'closed'
    const type = i.type

    if (isClosed) closedCount++
    else if (i.actionStatus === 'in-progress') inProgressCount++
    else openCount++

    if (type === 'positive') positiveTotal++
    if (!isClosed && i.date && i.date < overdue30) overdueCount++

    if (NEGATIVE_SET.has(type)) negativeCount++
    if (PROACTIVE_SET.has(type)) proactiveCount++
    if (INCIDENT_CAT_SET.has(type)) incidentCatCount++

    const approvalVal = i.approvalStatus?.toLowerCase()?.trim() || ''
    if (approvalVal === 'closed') approval.closed++
    else if (approvalVal === 'contractor review') approval.contractorReview++
    else if (approvalVal === 'review') approval.review++
    else if (approvalVal === 'contractor investigation') approval.contractorInvestigation++

    const pyramidKey = SUB_TYPE_TO_PYRAMID[type] || type
    if (pyramid[pyramidKey]) {
      if (isClosed) pyramid[pyramidKey].closed++
      else pyramid[pyramidKey].open++
    }

    const typeCountKey = SUB_TYPE_TO_PYRAMID[type] || type
    if (typeCounts[typeCountKey] !== undefined) typeCounts[typeCountKey]++
    if (i._isRecordable !== undefined ? i._isRecordable : RECORDABLE_INCIDENT_TYPES.includes(type)) typeCounts['incident']++

    const reporter = i.reportedBy || 'Unknown'
    if (!observerMap[reporter]) observerMap[reporter] = { open: 0, closed: 0 }
    if (isClosed) observerMap[reporter].closed++
    else observerMap[reporter].open++

    const company = i.contractor || 'Unknown'
    if (!companyMap[company]) companyMap[company] = { name: company, open: 0, closed: 0, total: 0 }
    companyMap[company].total++
    if (isClosed) companyMap[company].closed++
    else companyMap[company].open++
  }

  return {
    incidentCounts: typeCounts,
    pyramidData: pyramid,
    closeOutPercentage: total === 0 ? 0 : Math.round((closedCount / total) * 100),
    closedCount,
    openMoreThanMonth: overdueCount,
    positivePercentage: total === 0 ? 0 : Math.round((positiveTotal / total) * 100),
    positiveCount: positiveTotal,
    approvalCounts: approval,
    observersData: Object.entries(observerMap)
      .map(([name, data]) => ({ name, open: data.open, closed: data.closed, total: data.open + data.closed }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10),
    companyData: Object.values(companyMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10),
    positiveNegativeData: [
      { name: 'Negative', value: negativeCount, color: '#ef4444' },
      { name: 'Positive', value: proactiveCount, color: '#22c55e' },
      { name: 'Incidents', value: incidentCatCount, color: '#f59e0b' },
    ],
    observationStatusData: [
      { name: 'Open', value: openCount, color: '#f97316' },
      { name: 'In Progress', value: inProgressCount, color: '#3b82f6' },
      { name: 'Closed', value: closedCount, color: '#22c55e' },
    ],
  }
}

// ─── 4. computeTopHazards ───────────────────────────────────────────────
// Mirrors Dashboard.topHazards useDeferredMemo (lines 491-531)

export function computeTopHazards(filteredIncidents) {
  const counts = {}
  for (let idx = 0; idx < filteredIncidents.length; idx++) {
    const incident = filteredIncidents[idx]
    if (incident._isProactive !== undefined ? incident._isProactive : PROACTIVE_SET.has(incident.type)) continue
    const normalized = normalizeHazard(incident.location)
    if (normalized && normalized !== 'Not Specified') {
      if (!counts[normalized]) {
        counts[normalized] = { open: 0, closed: 0 }
      }
      if (incident.actionStatus === 'closed') {
        counts[normalized].closed++
      } else {
        counts[normalized].open++
      }
    }
  }
  return Object.entries(counts)
    .map(([name, data]) => ({
      name,
      open: data.open,
      closed: data.closed,
      total: data.open + data.closed,
    }))
    .sort((a, b) => {
      const lowerA = a.name.toLowerCase()
      const lowerB = b.name.toLowerCase()
      const isSignificantA = SIGNIFICANT_HAZARDS_MAP.has(lowerA)
      const isSignificantB = SIGNIFICANT_HAZARDS_MAP.has(lowerB)

      if (isSignificantA === isSignificantB) {
        return b.total - a.total
      }
      return isSignificantA ? -1 : 1
    })
    .slice(0, 10)
}

// ─── 5. computeHazardsHeatmap ───────────────────────────────────────────
// Mirrors Dashboard.hazardsHeatmap useDeferredMemo (lines 535-624)

export function computeHazardsHeatmap(heatmapIncidents) {
  const hazardSet = new Set(SIGNIFICANT_HAZARDS)
  const hazardSetLower = new Set(SIGNIFICANT_HAZARDS.map(h => h.toLowerCase()))

  // Single pass: build hazard set, track min/max date, collect pre-normalized pairs
  let minDate = null, maxDate = null
  const normalized = [] // [{month, lowerHazard}]
  for (let idx = 0; idx < heatmapIncidents.length; idx++) {
    const i = heatmapIncidents[idx]
    const norm = normalizeHazard(i.location)
    if (!norm || norm === 'Not Specified') continue

    const lower = norm.toLowerCase()
    if (!hazardSetLower.has(lower)) {
      const canonicalSub = SUB_SIGNIFICANT_HAZARDS.find(h => h.toLowerCase() === lower)
      hazardSet.add(canonicalSub || norm)
      hazardSetLower.add(lower)
    }

    if (i.date) {
      normalized.push({ month: i.date.substring(0, 7), lowerHazard: lower })
      if (!minDate || i.date < minDate) minDate = i.date
      if (!maxDate || i.date > maxDate) maxDate = i.date
    }
  }
  if (!minDate) return { months: [], hazards: [], data: {}, maxValue: 0 }

  const hazards = Array.from(hazardSet).sort((a, b) => {
    const lowerA = a.toLowerCase()
    const lowerB = b.toLowerCase()
    const significantIndexA = SIGNIFICANT_HAZARDS_MAP.get(lowerA) ?? -1
    const significantIndexB = SIGNIFICANT_HAZARDS_MAP.get(lowerB) ?? -1
    const subIndexA = SUB_SIGNIFICANT_HAZARDS_MAP.get(lowerA) ?? -1
    const subIndexB = SUB_SIGNIFICANT_HAZARDS_MAP.get(lowerB) ?? -1

    if (significantIndexA !== -1 && significantIndexB !== -1) return significantIndexA - significantIndexB
    if (significantIndexA !== -1) return -1
    if (significantIndexB !== -1) return 1
    if (subIndexA !== -1 && subIndexB !== -1) return subIndexA - subIndexB
    if (subIndexA !== -1) return -1
    if (subIndexB !== -1) return 1
    return a.localeCompare(b)
  })

  const startDate = parseISO(minDate)
  const endDate = parseISO(maxDate)

  const months = eachMonthOfInterval({ start: startOfMonth(startDate), end: endOfMonth(endDate) })
    .map(d => format(d, 'yyyy-MM'))

  const data = {}
  let maxValue = 0

  const lowerToCanonical = {}
  hazards.forEach(hazard => {
    data[hazard] = {}
    months.forEach(month => {
      data[hazard][month] = 0
    })
    lowerToCanonical[hazard.toLowerCase()] = hazard
  })

  // Build matrix from collected pairs (no re-normalization needed)
  for (let idx = 0; idx < normalized.length; idx++) {
    const { month, lowerHazard } = normalized[idx]
    const canonical = lowerToCanonical[lowerHazard]
    if (canonical && data[canonical]?.[month] !== undefined) {
      data[canonical][month]++
      if (data[canonical][month] > maxValue) maxValue = data[canonical][month]
    }
  }

  return { months, hazards, data, maxValue }
}

// ─── 6. computeSubregionContribution ────────────────────────────────────
// Mirrors Dashboard.subregionContributionData useDeferredMemo (lines 464-487)

const SUBREGION_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4']
const SUBREGION_OTHERS_COLOR = '#94a3b8'

export function computeSubregionContribution(filteredIncidents, siteClassifications) {
  const counts = {}
  filteredIncidents.forEach(i => {
    const site = i.site || 'Unknown'
    const subregion = siteClassifications[site] || 'Unassigned'
    counts[subregion] = (counts[subregion] || 0) + 1
  })
  const sorted = Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const top6 = sorted.slice(0, 6)
  const rest = sorted.slice(6)
  const othersValue = rest.reduce((sum, d) => sum + d.value, 0)

  const result = top6.map((d, i) => ({
    ...d,
    color: SUBREGION_COLORS[i] || SUBREGION_OTHERS_COLOR,
  }))
  if (othersValue > 0) {
    result.push({ name: 'Others', value: othersValue, color: SUBREGION_OTHERS_COLOR })
  }
  return result
}
