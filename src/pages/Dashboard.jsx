import React, { useMemo, useDeferredValue, useState, useRef, useEffect, useCallback, memo } from 'react'
import {
  FileText,
  CheckCircle,
  CalendarClock,
  ThumbsUp,
  CheckCheck,
  UserCheck,
  ClipboardList,
  Search,
  Database,
} from 'lucide-react'
import { useData } from '../context/DataContext'
import { useDate } from '../context/DateContext'
import { useFilter } from '../context/FilterContext'
import { useFilteredData } from '../context/FilteredDataContext'
import { useDeferredMemo } from '../hooks/useDeferredMemo'
import { useWorkerTask } from '../hooks/useWorkerTask'
import KPICard from '../components/dashboard/KPICard'
import IncidentTrendChart from '../components/dashboard/IncidentTrendChart'
import IncidentPyramid from '../components/dashboard/IncidentPyramid'
import ObservationsByDayOfWeek from '../components/dashboard/ObservationsByDayOfWeek'
import ObservationsByHourOfDay from '../components/dashboard/ObservationsByHourOfDay'
import FilterBar from '../components/common/FilterBar'
import TimePeriodToggle from '../components/common/TimePeriodToggle'
import EmptyState from '../components/dashboard/EmptyState'
import ReportModal from '../components/common/ReportModal'
import DrillDownModal from '../components/common/DrillDownModal'
import { InfoTooltip } from '../components/ui/Tooltip'
import Skeleton from '../components/ui/Skeleton'
import { INCIDENT_TYPES, SIGNIFICANT_HAZARDS, SUB_SIGNIFICANT_HAZARDS, RECORDABLE_INCIDENT_TYPES, PYRAMID_SECTIONS, NEGATIVE_OBSERVATION_TYPES, PROACTIVE_TYPES, INCIDENT_CATEGORY_TYPES } from '../utils/constants'
import { memoize } from '../utils/memoizedCalculations'
import { format, parseISO, eachMonthOfInterval, startOfMonth, endOfMonth } from 'date-fns'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Link } from 'react-router-dom'

const SUBREGION_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4']
const SUBREGION_OTHERS_COLOR = '#94a3b8'

// Stable Recharts props (hoisted to avoid re-renders from inline object/function recreation)
const TOOLTIP_CONTENT_STYLE = {
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
}

// Generic pie tooltip formatter - creates percent string from data array
const makePieFormatter = (dataArray) => (value, name) => {
  const total = dataArray.reduce((sum, d) => sum + d.value, 0)
  const percent = total > 0 ? Math.round((value / total) * 100) : 0
  return [`${value} (${percent}%)`, name]
}

// Generic pie legend formatter - creates label with count and percent
const makePieLegendFormatter = (dataArray) => (value) => {
  const item = dataArray.find(d => d.name === value)
  const total = dataArray.reduce((sum, d) => sum + d.value, 0)
  const percent = total > 0 ? Math.round((item?.value / total) * 100) : 0
  return (
    <span className="text-xs text-surface-700">
      {value}: {item?.value} ({percent}%)
    </span>
  )
}

// O(1) lookup maps for hazard sorting (avoids O(n) findIndex in sort comparator)
const SIGNIFICANT_HAZARDS_MAP = new Map(SIGNIFICANT_HAZARDS.map((h, i) => [h.toLowerCase(), i]))
const SUB_SIGNIFICANT_HAZARDS_MAP = new Map(SUB_SIGNIFICANT_HAZARDS.map((h, i) => [h.toLowerCase(), i]))

// Normalize hazard name for consistent grouping (fixes duplicates)
// Memoized to prevent redundant string operations on filter changes
const normalizeHazard = memoize((hazard) => {
  if (!hazard) return null
  return hazard
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}, 500) // Cache up to 500 unique hazard names


const Dashboard = () => {
  const { incidents, isLoading, showOpenClosed, siteClassifications, hasSubregionAssignments } = useData()
  const { cutoffDates } = useDate()

  // Shared filter state from context
  const { period, customDateRange, searchQuery, setPeriod, setSearchQuery, filters, setFilter, clearFilters: contextClearFilters } = useFilter()

  // Centralized filtered data from shared context (eliminates ~5 duplicate useMemos)
  const { filteredIncidents: _fi, heatmapIncidents: _hi, filterConfig } = useFilteredData()
  const filteredIncidents = useDeferredValue(_fi)
  const heatmapIncidents = useDeferredValue(_hi)

  // Stable prop for FilterBar — prevents React.memo defeat from inline spreading
  const activeFilters = useMemo(
    () => ({ ...filters, period, customDateRange }),
    [filters, period, customDateRange]
  )

  // Drill-down state with 3 levels + modal open state
  const [drillDown, setDrillDown] = useState({
    chart: null,
    filter: null,
    level: 1,
    period: null,
    modalOpen: false,
  })

  // Heatmap cell click state
  const [heatmapDrillDown, setHeatmapDrillDown] = useState({
    hazard: null,
    month: null,
    modalOpen: false,
  })

  // Report modal state
  const [viewingRecord, setViewingRecord] = useState(null)

  // Collapsible section state
  const [collapsedSections, setCollapsedSections] = useState({
    temporal: true,  // Collapsed by default
    heatmap: true,   // Collapsed by default
  })

  // Heatmap scroll ref
  const heatmapScrollRef = useRef(null)

  // Dashboard content ref for full-page PDF capture
  const dashboardContentRef = useRef(null)

  // Export refs for chart capture
  const kpiCards1Ref = useRef(null)
  const kpiCards2Ref = useRef(null)
  const pyramidRef = useRef(null)
  const trendChartRef = useRef(null)
  const topHazardsRef = useRef(null)
  const topObserversRef = useRef(null)
  const topCompaniesRef = useRef(null)
  const positiveNegativeRef = useRef(null)
  const dayOfWeekRef = useRef(null)
  const hourOfDayRef = useRef(null)
  const hazardsHeatmapRef = useRef(null)

  // Auto-scroll heatmap to end (most recent months) on load
  useEffect(() => {
    if (heatmapScrollRef.current) {
      heatmapScrollRef.current.scrollLeft = heatmapScrollRef.current.scrollWidth
    }
  }, [incidents])

  // Handle period change
  const handlePeriodChange = useCallback((newPeriod) => {
    setPeriod(newPeriod)
    setDrillDown({ chart: null, filter: null, level: 1, period: null, modalOpen: false })
    setHeatmapDrillDown({ hazard: null, month: null, modalOpen: false })
  }, [])

  // Handle filter changes - uses shared context (resets site when contractor changes)
  const handleFilterChange = useCallback((key, value) => {
    setFilter(key, value)
    setDrillDown({ chart: null, filter: null, level: 1, period: null, modalOpen: false })
    setHeatmapDrillDown({ hazard: null, month: null, modalOpen: false })
  }, [setFilter])

  const clearFilters = useCallback(() => {
    contextClearFilters()
    setDrillDown({ chart: null, filter: null, level: 1, period: null, modalOpen: false })
    setHeatmapDrillDown({ hazard: null, month: null, modalOpen: false })
  }, [contextClearFilters])

  // Handle heatmap cell click - opens modal
  const handleHeatmapCellClick = useCallback((hazard, month, value) => {
    if (value === 0) return
    setHeatmapDrillDown({ hazard, month, modalOpen: true })
  }, [])

  const closeHeatmapDrillDown = useCallback(() => {
    setHeatmapDrillDown({ hazard: null, month: null, modalOpen: false })
  }, [])

  const toggleSection = useCallback((section) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }, [])

  // Handle drill-down - opens modal with level 2 (monthly breakdown)
  const handleDrillDown = useCallback((chart, filter) => {
    setDrillDown({ chart, filter, level: 2, period: null, modalOpen: true })
  }, [])

  const closeDrillDownModal = useCallback(() => {
    setDrillDown({ chart: null, filter: null, level: 1, period: null, modalOpen: false })
  }, [])

  const handleDrillDownBack = useCallback(() => {
    setDrillDown(prev => {
      if (prev.level === 3) {
        return { ...prev, level: 2, period: null }
      }
      return { chart: null, filter: null, level: 1, period: null, modalOpen: false }
    })
  }, [])

  const handleMonthSelect = useCallback((monthData) => {
    setDrillDown(prev => ({ ...prev, level: 3, period: monthData.period }))
  }, [])

  // uniqueContractors, siteOptions, filterConfig, filteredIncidents, heatmapIncidents
  // are now provided by FilteredDataContext (see useFilteredData() above)

  // Calculate contributing factors for all observations (used for hazard insights drill-down)
  // Offloaded to Web Worker to keep main thread free during tab switches
  const { result: factorData } = useWorkerTask(
    'aggregateFactors', heatmapIncidents, null, [heatmapIncidents],
    { byFactor: [], analyzed: 0, total: 0 }
  )

  // Get filtered data based on drill-down selection
  const getFilteredBySelection = useMemo(() => {
    if (!drillDown.chart || !drillDown.filter) return []

    let filtered = filteredIncidents
    if (drillDown.chart === 'pyramid') {
      // Handle 'incident' type which aggregates lti, mti, fac
      if (drillDown.filter === 'incident') {
        filtered = filteredIncidents.filter(i => RECORDABLE_INCIDENT_TYPES.includes(i.type))
      } else {
        filtered = filteredIncidents.filter(i => i.type === drillDown.filter)
      }
    } else if (drillDown.chart === 'observers') {
      filtered = filteredIncidents.filter(i => i.reportedBy === drillDown.filter)
    } else if (drillDown.chart === 'hazards') {
      // Exclude proactive types for hazards drill-down (consistent with Top Hazards chart)
      const normalizedFilter = normalizeHazard(drillDown.filter)
      filtered = filteredIncidents.filter(i =>
        !PROACTIVE_TYPES.includes(i.type) && normalizeHazard(i.location) === normalizedFilter
      )
    } else if (drillDown.chart === 'company') {
      // Filter by contractor/company
      filtered = filteredIncidents.filter(i =>
        (i.contractor || 'Unknown') === drillDown.filter
      )
    } else if (drillDown.chart === 'positiveNegative') {
      // Filter by positive, negative, or incidents category
      if (drillDown.filter === 'Negative') {
        filtered = filteredIncidents.filter(i =>
          NEGATIVE_OBSERVATION_TYPES.includes(i.type)
        )
      } else if (drillDown.filter === 'Positive') {
        filtered = filteredIncidents.filter(i =>
          PROACTIVE_TYPES.includes(i.type)
        )
      } else if (drillDown.filter === 'Incidents') {
        filtered = filteredIncidents.filter(i =>
          INCIDENT_CATEGORY_TYPES.includes(i.type)
        )
      }
    } else if (drillDown.chart === 'subRegion') {
      filtered = filteredIncidents.filter(i =>
        (siteClassifications[i.site] || 'Unassigned') === drillDown.filter
      )
    } else if (drillDown.chart === 'observationStatus') {
      const STATUS_NAME_MAP = { 'Open': 'open', 'In Progress': 'in-progress', 'Closed': 'closed' }
      const statusValue = STATUS_NAME_MAP[drillDown.filter]
      if (statusValue) {
        filtered = filteredIncidents.filter(i => i.actionStatus === statusValue)
      }
    }
    return filtered
  }, [drillDown.chart, drillDown.filter, filteredIncidents])

  // Monthly breakdown for level 2
  const monthlyBreakdown = useMemo(() => {
    if (!drillDown.chart || !drillDown.filter || drillDown.level < 2) return []

    const byMonth = {}
    getFilteredBySelection.forEach(i => {
      const month = i.date?.substring(0, 7) || 'Unknown'
      byMonth[month] = (byMonth[month] || 0) + 1
    })

    return Object.entries(byMonth)
      .map(([period, count]) => ({
        period,
        label: period !== 'Unknown' ? format(parseISO(period + '-01'), 'MMM yyyy') : 'Unknown',
        count
      }))
      .sort((a, b) => a.period.localeCompare(b.period))
  }, [drillDown.chart, drillDown.filter, drillDown.level, getFilteredBySelection])

  // Level 3 data (filtered by month)
  const drillDownData = useMemo(() => {
    if (!drillDown.chart || !drillDown.filter) return []
    if (drillDown.level === 3 && drillDown.period) {
      return getFilteredBySelection.filter(i => i.date?.substring(0, 7) === drillDown.period)
    }
    return getFilteredBySelection
  }, [drillDown, getFilteredBySelection])

  // Heatmap drill-down data (uses heatmapIncidents, not filteredIncidents)
  // Uses case-insensitive comparison to match canonical hazard names
  const heatmapDrillDownData = useMemo(() => {
    if (!heatmapDrillDown.hazard || !heatmapDrillDown.month) return []

    const targetHazardLower = heatmapDrillDown.hazard.toLowerCase()

    return heatmapIncidents.filter(i => {
      const normalizedLocation = normalizeHazard(i.location)
      if (!normalizedLocation) return false
      const incidentMonth = i.date?.substring(0, 7)
      return normalizedLocation.toLowerCase() === targetHazardLower && incidentMonth === heatmapDrillDown.month
    })
  }, [heatmapDrillDown, heatmapIncidents])

  // ── Single-pass KPI + chart aggregation ──────────────────────────────
  // Replaces 8 separate O(n) useMemos with ONE pass through filteredIncidents.
  // Hidden tabs skip this entirely thanks to useDeferredMemo.
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

  const dashboardAggregates = useDeferredMemo(() => {
    const total = filteredIncidents.length

    // KPI accumulators
    let closedCount = 0
    let openCount = 0
    let inProgressCount = 0
    let positiveTotal = 0
    let overdueCount = 0
    let negativeCount = 0
    let proactiveCount = 0
    let incidentCatCount = 0

    // Approval accumulators
    const approval = { closed: 0, contractorReview: 0, review: 0, contractorInvestigation: 0 }

    // Pyramid accumulators
    const pyramid = {}
    PYRAMID_SECTIONS.forEach(section => {
      section.types.forEach(t => { pyramid[t.key] = { open: 0, closed: 0 } })
    })

    // Incident counts by type (for getIncidentCountsByType replacement)
    const typeCounts = {}
    PYRAMID_SECTIONS.forEach(section => {
      section.types.forEach(t => { typeCounts[t.key] = 0 })
    })
    typeCounts['incident'] = 0

    // Observer + company accumulators
    const observerMap = {}
    const companyMap = {}

    const overdue30 = cutoffDates.overdue30Days

    for (let idx = 0; idx < total; idx++) {
      const i = filteredIncidents[idx]
      const isClosed = i.actionStatus === 'closed'
      const type = i.type

      // KPI: closed/open/in-progress counts
      if (isClosed) closedCount++
      else if (i.actionStatus === 'in-progress') inProgressCount++
      else openCount++

      // KPI: positive count
      if (type === 'positive') positiveTotal++

      // KPI: overdue > 30 days
      if (!isClosed && i.date && i.date < overdue30) overdueCount++

      // Pie chart: observation breakdown
      if (NEGATIVE_SET.has(type)) negativeCount++
      if (PROACTIVE_SET.has(type)) proactiveCount++
      if (INCIDENT_CAT_SET.has(type)) incidentCatCount++

      // Approval counts
      const approvalVal = i.approvalStatus?.toLowerCase()?.trim() || ''
      if (approvalVal === 'closed') approval.closed++
      else if (approvalVal === 'contractor review') approval.contractorReview++
      else if (approvalVal === 'review') approval.review++
      else if (approvalVal === 'contractor investigation') approval.contractorInvestigation++

      // Pyramid
      const pyramidKey = SUB_TYPE_TO_PYRAMID[type] || type
      if (pyramid[pyramidKey]) {
        if (isClosed) pyramid[pyramidKey].closed++
        else pyramid[pyramidKey].open++
      }

      // Incident counts by type (same logic as getIncidentCountsByType)
      const typeCountKey = SUB_TYPE_TO_PYRAMID[type] || type
      if (typeCounts[typeCountKey] !== undefined) typeCounts[typeCountKey]++
      if (RECORDABLE_INCIDENT_TYPES.includes(type)) typeCounts['incident']++

      // Observers
      const reporter = i.reportedBy || 'Unknown'
      if (!observerMap[reporter]) observerMap[reporter] = { open: 0, closed: 0 }
      if (isClosed) observerMap[reporter].closed++
      else observerMap[reporter].open++

      // Companies
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
        { name: 'Incidents', value: incidentCatCount, color: '#f59e0b' }
      ],
      observationStatusData: [
        { name: 'Open', value: openCount, color: '#f97316' },
        { name: 'In Progress', value: inProgressCount, color: '#3b82f6' },
        { name: 'Closed', value: closedCount, color: '#22c55e' },
      ],
    }
  }, [filteredIncidents, cutoffDates.overdue30Days])

  // Destructure for easy access (stable refs while tab is hidden)
  const {
    incidentCounts, pyramidData, closeOutPercentage, closedCount,
    openMoreThanMonth, positivePercentage, positiveCount,
    approvalCounts, observersData, companyData, positiveNegativeData,
    observationStatusData,
  } = dashboardAggregates

  // Subregion Contribution: top 6 subregions + Others
  const subregionContributionData = useDeferredMemo(() => {
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
  }, [filteredIncidents, siteClassifications])

  // Top Hazards data - EXCLUDES proactive types (only counts non-proactive)
  // Significant Hazards (13 official categories) are prioritized first
  const topHazards = useDeferredMemo(() => {
    const counts = {}
    // Filter out proactive types - Top Hazards should only show non-proactive observations
    const nonPositiveIncidents = filteredIncidents.filter(i => !PROACTIVE_TYPES.includes(i.type))
    nonPositiveIncidents.forEach(incident => {
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
    })
    return Object.entries(counts)
      .map(([name, data]) => ({
        name,
        open: data.open,
        closed: data.closed,
        total: data.open + data.closed
      }))
      .sort((a, b) => {
        // Priority 1: Significant Hazards first (14 categories)
        // Use case-insensitive comparison because normalizeHazard may change case of words like "on", "or"
        const lowerA = a.name.toLowerCase()
        const lowerB = b.name.toLowerCase()
        const isSignificantA = SIGNIFICANT_HAZARDS_MAP.has(lowerA)
        const isSignificantB = SIGNIFICANT_HAZARDS_MAP.has(lowerB)

        // If both are significant or both are not, sort by count
        if (isSignificantA === isSignificantB) {
          return b.total - a.total
        }
        // Significant hazards come first
        return isSignificantA ? -1 : 1
      })
      .slice(0, 10)
  }, [filteredIncidents])

  // Hazards Heatmap data (uses heatmapIncidents - not affected by "This Month")
  // Always shows all 14 Significant Hazards + any additional hazards with data
  const hazardsHeatmap = useDeferredMemo(() => {
    // Start with all 14 Significant Hazards - use canonical names
    const hazardSet = new Set(SIGNIFICANT_HAZARDS)

    // Track lowercase versions to prevent duplicates
    const hazardSetLower = new Set(SIGNIFICANT_HAZARDS.map(h => h.toLowerCase()))

    // Add any additional hazards from data (sub-significant hazards that appear in incidents)
    // Only add if not already present (case-insensitive check)
    heatmapIncidents.forEach(i => {
      const normalized = normalizeHazard(i.location)
      if (normalized && normalized !== 'Not Specified') {
        const lowerNormalized = normalized.toLowerCase()
        // Only add if this hazard (case-insensitive) doesn't already exist
        if (!hazardSetLower.has(lowerNormalized)) {
          // Check if there's a canonical form in SUB_SIGNIFICANT_HAZARDS
          const canonicalSub = SUB_SIGNIFICANT_HAZARDS.find(h => h.toLowerCase() === lowerNormalized)
          hazardSet.add(canonicalSub || normalized)
          hazardSetLower.add(lowerNormalized)
        }
      }
    })

    // Sort hazards by priority: Significant (14) first, then Sub-significant, then alphabetical
    const hazards = Array.from(hazardSet).sort((a, b) => {
      const lowerA = a.toLowerCase()
      const lowerB = b.toLowerCase()
      const significantIndexA = SIGNIFICANT_HAZARDS_MAP.get(lowerA) ?? -1
      const significantIndexB = SIGNIFICANT_HAZARDS_MAP.get(lowerB) ?? -1
      const subIndexA = SUB_SIGNIFICANT_HAZARDS_MAP.get(lowerA) ?? -1
      const subIndexB = SUB_SIGNIFICANT_HAZARDS_MAP.get(lowerB) ?? -1

      // Both are significant hazards - sort by priority order
      if (significantIndexA !== -1 && significantIndexB !== -1) return significantIndexA - significantIndexB
      // A is significant - A comes first
      if (significantIndexA !== -1) return -1
      // B is significant - B comes first
      if (significantIndexB !== -1) return 1
      // Both are sub-significant - sort by sub order
      if (subIndexA !== -1 && subIndexB !== -1) return subIndexA - subIndexB
      // A is sub-significant - A comes first
      if (subIndexA !== -1) return -1
      // B is sub-significant - B comes first
      if (subIndexB !== -1) return 1
      // Fallback: alphabetical
      return a.localeCompare(b)
    })

    const dates = heatmapIncidents.map(i => i.date).filter(Boolean).sort()
    if (dates.length === 0) return { months: [], hazards: [], data: {}, maxValue: 0 }

    const startDate = parseISO(dates[0])
    const endDate = parseISO(dates[dates.length - 1])

    const months = eachMonthOfInterval({ start: startOfMonth(startDate), end: endOfMonth(endDate) })
      .map(d => format(d, 'yyyy-MM'))

    const data = {}
    let maxValue = 0

    hazards.forEach(hazard => {
      data[hazard] = {}
      months.forEach(month => {
        data[hazard][month] = 0
      })
    })

    // Create a lowercase-to-canonical mapping for case-insensitive data aggregation
    const lowerToCanonical = {}
    hazards.forEach(h => {
      lowerToCanonical[h.toLowerCase()] = h
    })

    heatmapIncidents.forEach(incident => {
      const normalized = normalizeHazard(incident.location)
      if (normalized && normalized !== 'Not Specified' && incident.date) {
        const month = incident.date.substring(0, 7)
        // Find the canonical hazard name (case-insensitive match)
        const canonicalHazard = lowerToCanonical[normalized.toLowerCase()]
        if (canonicalHazard && data[canonicalHazard] && data[canonicalHazard][month] !== undefined) {
          data[canonicalHazard][month]++
          if (data[canonicalHazard][month] > maxValue) {
            maxValue = data[canonicalHazard][month]
          }
        }
      }
    })

    return { months, hazards, data, maxValue }
  }, [heatmapIncidents])

  // Get heatmap cell color
  const getHeatmapColor = (value, maxValue) => {
    if (value === 0 || maxValue === 0) {
      return { bg: '#ffffff', text: '#9ca3af' }
    }

    const percent = value / maxValue
    let r, g, b

    if (percent <= 0.25) {
      const t = percent / 0.25
      r = 255
      g = 255
      b = Math.round(255 - (255 - 200) * t)
    } else if (percent <= 0.5) {
      const t = (percent - 0.25) / 0.25
      r = 255
      g = 255 - Math.round(50 * t)
      b = Math.round(200 - 150 * t)
    } else if (percent <= 0.75) {
      const t = (percent - 0.5) / 0.25
      r = 255
      g = Math.round(205 - 105 * t)
      b = Math.round(50 - 50 * t)
    } else {
      const t = (percent - 0.75) / 0.25
      r = Math.round(255 - 55 * t)
      g = Math.round(100 - 70 * t)
      b = 0
    }

    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    const textColor = brightness > 150 ? '#1f2937' : '#ffffff'

    return { bg: `rgb(${r}, ${g}, ${b})`, text: textColor }
  }

  // Stable pie chart click handlers (avoid inline arrow functions that cause Recharts re-renders)
  const handlePositiveNegativeClick = useCallback(
    (data) => handleDrillDown('positiveNegative', data.name),
    [handleDrillDown]
  )
  const handleSubRegionClick = useCallback(
    (data) => { if (data.name !== 'Others') handleDrillDown('subRegion', data.name) },
    [handleDrillDown]
  )
  const handleObservationStatusClick = useCallback(
    (data) => handleDrillDown('observationStatus', data.name),
    [handleDrillDown]
  )

  // Stable tooltip/legend formatters per chart (re-create only when data changes)
  const posNegFormatter = useMemo(() => makePieFormatter(positiveNegativeData), [positiveNegativeData])
  const posNegLegendFormatter = useMemo(() => makePieLegendFormatter(positiveNegativeData), [positiveNegativeData])
  const obsStatusFormatter = useMemo(() => makePieFormatter(observationStatusData), [observationStatusData])
  const obsStatusLegendFormatter = useMemo(() => makePieLegendFormatter(observationStatusData), [observationStatusData])
  const subRegFormatter = useMemo(() => makePieFormatter(subregionContributionData), [subregionContributionData])
  const subRegLegendFormatter = useMemo(() => makePieLegendFormatter(subregionContributionData), [subregionContributionData])

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* KPI row skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton.KPICard key={i} />
          ))}
        </div>
        {/* Chart skeleton */}
        <Skeleton.Chart height={240} />
        {/* Table skeleton */}
        <Skeleton.Table rows={5} cols={4} />
      </div>
    )
  }

  if (incidents.length === 0) {
    return <EmptyState onImportComplete={() => {}} />
  }

  return (
    <div className="space-y-4">
      {/* Filters Row */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <FilterBar
            filters={filterConfig}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* Time Period Toggle */}
        <TimePeriodToggle period={period} onPeriodChange={handlePeriodChange} showAll />
      </div>

      {/* Dashboard Content - wrapped for PDF export full-page capture */}
      <div ref={dashboardContentRef} className="space-y-3 bg-surface-50 p-2 -m-2">
      {/* Performance Overview Section */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-surface-500 uppercase tracking-wide">
          Performance Overview
        </h2>

        {/* KPI Cards - Row 1 */}
        <div ref={kpiCards1Ref} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <KPICard
          title="Total Observations"
          value={filteredIncidents.length}
          subtitle={period === null ? 'All time' : period === 0.25 ? 'Last week' : period === 1 ? 'Last month' : `Last ${period} months`}
          icon={FileText}
          color="primary"
          info="HOW THIS NUMBER IS CALCULATED: We count every single safety observation that was submitted during the selected time period. This includes all types - incidents, near misses, unsafe acts, unsafe conditions, positive observations, and leadership events. If you've applied any filters (like selecting a specific contractor or site), this number only counts observations matching those filters. A higher number generally means more people are actively reporting safety concerns, which is a good sign of an engaged safety culture."
        />
        <KPICard
          title="Close Out Rate"
          value={`${closeOutPercentage}%`}
          subtitle={`${closedCount} of ${filteredIncidents.length} closed`}
          icon={CheckCircle}
          color={closeOutPercentage >= 80 ? 'success' : closeOutPercentage >= 50 ? 'warning' : 'danger'}
          info="HOW THIS IS CALCULATED: We look at the 'Action Status' field in your data. If an observation is marked as 'Closed', it means someone has addressed the issue and completed any required actions. This percentage shows how many observations have been fully resolved compared to the total. GREEN (80%+): Excellent - your team is closing out issues quickly. YELLOW (50-79%): Needs attention - some issues are lingering. RED (below 50%): Urgent - too many open items need action."
        />
        <KPICard
          title="Positive Observation"
          value={`${positivePercentage}%`}
          subtitle={`${positiveCount} of ${filteredIncidents.length} positive`}
          icon={ThumbsUp}
          color={positivePercentage >= 30 ? 'success' : positivePercentage >= 15 ? 'warning' : 'info'}
          info="HOW THIS IS CALCULATED: We count observations where the 'Type' field is marked as 'Positive Observation' or similar positive category, then divide by the total number of observations. Positive observations are when someone spots a person doing something SAFELY and reports it as a good example. GREEN (30%+): Your team actively recognizes good safety behaviors - this builds a positive safety culture. YELLOW (15-29%): Some positive reporting, but encourage more recognition of safe work. BLUE (below 15%): Consider training staff to spot and report positive safety behaviors."
        />
        <KPICard
          title="Open > 1 Month"
          value={openMoreThanMonth}
          subtitle="Overdue actions"
          icon={CalendarClock}
          color={openMoreThanMonth > 10 ? 'danger' : openMoreThanMonth > 5 ? 'warning' : 'info'}
          info="HOW THIS IS CALCULATED: We check each observation's date and compare it to today. If an observation was submitted more than 30 days ago AND it's still marked as 'Open' (not closed), it appears in this count. These are overdue items that need attention. RED (more than 10): Urgent - you have a backlog of unresolved safety issues that need immediate focus. YELLOW (6-10): Some items are slipping through - review and prioritize. BLUE (0-5): Good control - keep monitoring these older items."
        />
      </div>

        {/* KPI Cards - Row 2 (Approval Status) */}
        <div ref={kpiCards2Ref} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <KPICard
          title="Closed"
          value={approvalCounts.closed}
          subtitle="Fully closed items"
          icon={CheckCheck}
          color="success"
          info="HOW THIS IS CALCULATED: We look at the 'Approval Status' column in your data (different from Action Status). When this field shows 'Closed', it means the observation has gone through all review stages and is completely finished. No more work needed on these items. This is your count of successfully completed observations where all investigations, reviews, and follow-up actions are done."
        />
        <KPICard
          title="Contractor Review"
          value={approvalCounts.contractorReview}
          subtitle="Pending contractor review"
          icon={UserCheck}
          color={approvalCounts.contractorReview > 10 ? 'warning' : 'info'}
          info="HOW THIS IS CALCULATED: We filter observations where the 'Approval Status' column contains 'Contractor Review'. These are items waiting for a contractor to look at and respond. The contractor needs to review what happened and provide their input before the observation can move forward. YELLOW (more than 10): You have a backlog - consider following up with contractors to speed up their reviews."
        />
        <KPICard
          title="PMC/NDT Review"
          value={approvalCounts.review}
          subtitle="Pending review"
          icon={ClipboardList}
          color={approvalCounts.review > 10 ? 'warning' : 'info'}
          info="HOW THIS IS CALCULATED: We count observations where the 'Approval Status' column shows 'Review'. These items are waiting for someone on your team to look at them and decide on next steps. They haven't been assigned to a contractor yet - they need internal attention first. YELLOW (more than 10): Your review queue is building up - consider dedicating time to work through these."
        />
        <KPICard
          title="Contractor Investigation"
          value={approvalCounts.contractorInvestigation}
          subtitle="Under investigation"
          icon={Search}
          color={approvalCounts.contractorInvestigation > 5 ? 'warning' : 'info'}
          info="HOW THIS IS CALCULATED: We count observations where the 'Approval Status' column shows 'Contractor Investigation'. These are typically more serious issues where the contractor needs to dig deeper - finding out what happened, why it happened, and how to prevent it in the future. Investigations take longer than simple reviews because they require gathering evidence and interviewing people. YELLOW (more than 5): Monitor these closely as investigations shouldn't drag on too long."
        />
        </div>
      </div>

      {/* Observation Analysis Section */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-surface-500 uppercase tracking-wide">
          Observation Analysis
        </h2>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div ref={pyramidRef}>
            <IncidentPyramid
              data={incidentCounts}
              pyramidData={pyramidData}
              showOpenClosed={showOpenClosed}
              incidents={filteredIncidents}
            />
          </div>
          <div ref={trendChartRef}>
            <IncidentTrendChart incidents={filteredIncidents} />
          </div>
        </div>
      </div>

      {/* Top Contributors Section */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-surface-500 uppercase tracking-wide">
          Top Contributors
        </h2>

        {/* Top Hazards + Observers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Top Hazards */}
          <div ref={topHazardsRef} className="bg-white border border-surface-200 rounded-lg p-3 shadow-soft">
          <h3 className="text-xs font-semibold text-surface-700 mb-2 uppercase tracking-wide flex items-center">
            Top Significant Hazards
            <InfoTooltip text="HOW THIS DATA IS COLLECTED: Every observation has a 'Hazard Category' or 'Location' field that describes what type of hazard was involved. We group all observations by their hazard type and count how many times each one appears, then show you the top 10 most common hazards. The bar colors show status: RED portion = still open (needs action), GREEN portion = closed (resolved). Click any bar to see the actual observations in that hazard category. Note: Positive observations are excluded since they report SAFE behaviors, not hazards." />
          </h3>
          {topHazards.length > 0 ? (
            <div className="space-y-1">
              {topHazards.map((hazard, index) => {
                const maxTotal = topHazards[0]?.total || 1
                const totalWidth = (hazard.total / maxTotal) * 100
                // For open/closed, calculate percentages relative to the bar's own total
                const openPercent = hazard.total > 0 ? (hazard.open / hazard.total) * 100 : 0
                const closedPercent = hazard.total > 0 ? (hazard.closed / hazard.total) * 100 : 0
                const isActive = drillDown.chart === 'hazards' && drillDown.filter === hazard.name

                return (
                  <div
                    key={hazard.name}
                    role="button"
                    tabIndex={0}
                    aria-label={`Drill down on ${hazard.name}: ${hazard.total} observations`}
                    className={`relative cursor-pointer hover:bg-surface-50 focus:outline-none focus:ring-2 focus:ring-primary-500 ${isActive ? 'ring-2 ring-surface-800' : ''}`}
                    onClick={() => handleDrillDown('hazards', hazard.name)}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleDrillDown('hazards', hazard.name)}
                    style={{ opacity: drillDown.chart === 'hazards' && !isActive ? 0.5 : 1 }}
                  >
                    <div className="flex items-center justify-between p-1.5 relative z-10">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-surface-400 w-4">{index + 1}</span>
                        <span className="text-xs text-surface-700 truncate">{hazard.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {showOpenClosed && (
                          <span className="text-xs text-surface-500">{hazard.open}o/{hazard.closed}c</span>
                        )}
                        <span className="text-xs font-bold text-surface-900">{hazard.total}</span>
                      </div>
                    </div>
                    {showOpenClosed ? (
                      <div className="absolute top-0 left-0 h-full flex overflow-hidden" style={{ width: `${totalWidth}%`, zIndex: 0 }}>
                        {hazard.open > 0 && <div className="h-full bg-red-300" style={{ width: `${openPercent}%` }} title={`Open: ${hazard.open}`} />}
                        {hazard.closed > 0 && <div className="h-full bg-green-300" style={{ width: `${closedPercent}%` }} title={`Closed: ${hazard.closed}`} />}
                      </div>
                    ) : (
                      <div className="absolute top-0 left-0 h-full bg-red-100" style={{ width: `${totalWidth}%`, zIndex: 0 }} />
                    )}
                  </div>
                )
              })}
              {/* Drill-down hint */}
              <p className="text-xs text-surface-400 text-center mt-2 opacity-60">Click any bar to explore details</p>
            </div>
          ) : (
            <p className="text-xs text-surface-400 text-center py-4">No hazard data available</p>
          )}
        </div>

        {/* Top Observers */}
        <div ref={topObserversRef} className="bg-white border border-surface-200 rounded-lg p-3 shadow-soft">
          <h3 className="text-xs font-semibold text-surface-700 mb-2 uppercase tracking-wide flex items-center">
            Top Observers
            <InfoTooltip text="HOW THIS DATA IS COLLECTED: Every observation has a 'Reported By' or 'Observer' field containing the name of who submitted it. We count how many observations each person has submitted and rank them from most to least active. The top 10 most active reporters are shown here. The bar colors show status of their reports: RED = still open, GREEN = closed. Click any name to see all their observations. People who report more safety observations are actively engaged in keeping the workplace safe." />
          </h3>
          {observersData.length > 0 ? (
            <div className="space-y-1">
              {observersData.map((observer, index) => {
                const maxTotal = observersData[0]?.total || 1
                const totalWidth = (observer.total / maxTotal) * 100
                // For open/closed, calculate percentages relative to the bar's own total
                const openPercent = observer.total > 0 ? (observer.open / observer.total) * 100 : 0
                const closedPercent = observer.total > 0 ? (observer.closed / observer.total) * 100 : 0
                const isActive = drillDown.chart === 'observers' && drillDown.filter === observer.name

                return (
                  <div
                    key={observer.name}
                    role="button"
                    tabIndex={0}
                    aria-label={`Drill down on ${observer.name}: ${observer.total} observations`}
                    className={`relative cursor-pointer hover:bg-surface-50 focus:outline-none focus:ring-2 focus:ring-primary-500 ${isActive ? 'ring-2 ring-surface-800' : ''}`}
                    onClick={() => handleDrillDown('observers', observer.name)}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleDrillDown('observers', observer.name)}
                    style={{ opacity: drillDown.chart === 'observers' && !isActive ? 0.5 : 1 }}
                  >
                    <div className="flex items-center justify-between p-1.5 relative z-10">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-surface-400 w-4">{index + 1}</span>
                        <span className="text-xs text-surface-700 truncate">{observer.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {showOpenClosed && (
                          <span className="text-xs text-surface-500">{observer.open}o/{observer.closed}c</span>
                        )}
                        <span className="text-xs font-bold text-surface-900">{observer.total}</span>
                      </div>
                    </div>
                    {showOpenClosed ? (
                      <div className="absolute top-0 left-0 h-full flex overflow-hidden" style={{ width: `${totalWidth}%`, zIndex: 0 }}>
                        {observer.open > 0 && <div className="h-full bg-red-300" style={{ width: `${openPercent}%` }} title={`Open: ${observer.open}`} />}
                        {observer.closed > 0 && <div className="h-full bg-green-300" style={{ width: `${closedPercent}%` }} title={`Closed: ${observer.closed}`} />}
                      </div>
                    ) : (
                      <div className="absolute top-0 left-0 h-full bg-blue-100" style={{ width: `${totalWidth}%`, zIndex: 0 }} />
                    )}
                  </div>
                )
              })}
              {/* Drill-down hint */}
              <p className="text-xs text-surface-400 text-center mt-2 opacity-60">Click any bar to explore details</p>
            </div>
          ) : (
            <p className="text-xs text-surface-400 text-center py-4">No observer data available</p>
          )}
        </div>
        </div>

        {/* Observations per Company + Positive vs Negative */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Observations per Company */}
          <div ref={topCompaniesRef} className="bg-white border border-surface-200 rounded-lg p-3 shadow-soft">
          <h3 className="text-xs font-semibold text-surface-700 mb-2 uppercase tracking-wide flex items-center">
            Observations per Company
            <InfoTooltip text="HOW THIS DATA IS COLLECTED: Every observation has a 'Contractor' or 'Company' field. We count how many observations each company has and rank them from most to least. The top 10 companies by observation count are shown. The bar colors show status: RED = still open, GREEN = closed. Click any company to see their observations broken down by month." />
          </h3>
          {companyData.length > 0 ? (
            <div className="space-y-1">
              {companyData.map((company, index) => {
                const maxTotal = companyData[0]?.total || 1
                const totalWidth = (company.total / maxTotal) * 100
                const openPercent = company.total > 0 ? (company.open / company.total) * 100 : 0
                const closedPercent = company.total > 0 ? (company.closed / company.total) * 100 : 0
                const isActive = drillDown.chart === 'company' && drillDown.filter === company.name

                return (
                  <div
                    key={company.name}
                    role="button"
                    tabIndex={0}
                    aria-label={`Drill down on ${company.name}: ${company.total} observations`}
                    className={`relative cursor-pointer hover:bg-surface-50 focus:outline-none focus:ring-2 focus:ring-primary-500 ${isActive ? 'ring-2 ring-surface-800' : ''}`}
                    onClick={() => handleDrillDown('company', company.name)}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleDrillDown('company', company.name)}
                    style={{ opacity: drillDown.chart === 'company' && !isActive ? 0.5 : 1 }}
                  >
                    <div className="flex items-center justify-between p-1.5 relative z-10">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-surface-400 w-4">{index + 1}</span>
                        <span className="text-xs text-surface-700 truncate">{company.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {showOpenClosed && (
                          <span className="text-xs text-surface-500">{company.open}o/{company.closed}c</span>
                        )}
                        <span className="text-xs font-bold text-surface-900">{company.total}</span>
                      </div>
                    </div>
                    {showOpenClosed ? (
                      <div className="absolute top-0 left-0 h-full flex overflow-hidden" style={{ width: `${totalWidth}%`, zIndex: 0 }}>
                        {company.open > 0 && <div className="h-full bg-red-300" style={{ width: `${openPercent}%` }} title={`Open: ${company.open}`} />}
                        {company.closed > 0 && <div className="h-full bg-green-300" style={{ width: `${closedPercent}%` }} title={`Closed: ${company.closed}`} />}
                      </div>
                    ) : (
                      <div className="absolute top-0 left-0 h-full bg-purple-100" style={{ width: `${totalWidth}%`, zIndex: 0 }} />
                    )}
                  </div>
                )
              })}
              {/* Drill-down hint */}
              <p className="text-xs text-surface-400 text-center mt-2 opacity-60">Click any bar to explore details</p>
            </div>
          ) : (
            <p className="text-xs text-surface-400 text-center py-4">No company data available</p>
          )}
        </div>

        {/* Positive vs Negative Pie Chart */}
        <div ref={positiveNegativeRef} className="bg-white border border-surface-200 rounded-lg p-3 shadow-soft">
          <h3 className="text-xs font-semibold text-surface-700 mb-2 uppercase tracking-wide flex items-center">
            Positive vs Negative Observations
            <InfoTooltip text="HOW THIS IS CALCULATED: We categorize observations into two groups: NEGATIVE includes Unsafe Acts, Unsafe Conditions, Near Misses, and NCRs - these identify hazards or problems. POSITIVE includes Leadership and Positive Observations - these recognize good safety behaviors. Click on a segment to see the individual observations in that category." />
          </h3>
          {positiveNegativeData.some(d => d.value > 0) ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={positiveNegativeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    onClick={handlePositiveNegativeClick}
                    style={{ cursor: 'pointer' }}
                  >
                    {positiveNegativeData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke={drillDown.chart === 'positiveNegative' && drillDown.filter === entry.name ? '#1f2937' : 'none'}
                        strokeWidth={drillDown.chart === 'positiveNegative' && drillDown.filter === entry.name ? 3 : 0}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={posNegFormatter}
                    contentStyle={TOOLTIP_CONTENT_STYLE}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={posNegLegendFormatter}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Drill-down hint */}
              <p className="text-xs text-surface-400 text-center opacity-60">Click a segment to explore</p>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-xs text-surface-400">No observation data available</p>
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Hazard Distribution Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Donut 1: Open vs Closed Observations */}
        <div className="bg-white border border-surface-200 rounded-lg p-3 shadow-soft">
          <h3 className="text-xs font-semibold text-surface-700 mb-2 uppercase tracking-wide flex items-center">
            Open vs Closed Observations
            <InfoTooltip text="HOW THIS IS CALCULATED: Every observation has an 'Action Status' field showing its current state. OPEN (orange) = the observation needs action and hasn't been addressed yet. IN PROGRESS (blue) = someone is actively working on resolving the issue. CLOSED (green) = the observation has been fully resolved and all actions completed. Click any segment to see the individual observations in that status category." />
          </h3>
          {observationStatusData.some(d => d.value > 0) ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={observationStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    onClick={handleObservationStatusClick}
                    style={{ cursor: 'pointer' }}
                  >
                    {observationStatusData.map((entry, index) => (
                      <Cell
                        key={`obsstatus-${index}`}
                        fill={entry.color}
                        stroke={drillDown.chart === 'observationStatus' && drillDown.filter === entry.name ? '#1f2937' : 'none'}
                        strokeWidth={drillDown.chart === 'observationStatus' && drillDown.filter === entry.name ? 3 : 0}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={obsStatusFormatter}
                    contentStyle={TOOLTIP_CONTENT_STYLE}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={obsStatusLegendFormatter}
                  />
                </PieChart>
              </ResponsiveContainer>
              <p className="text-xs text-surface-400 text-center opacity-60">Click a segment to explore</p>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-xs text-surface-400">No observation data available</p>
            </div>
          )}
        </div>

        {/* Donut 2: Subregion Contribution */}
        <div className="bg-white border border-surface-200 rounded-lg p-3 shadow-soft">
          {hasSubregionAssignments ? (
            <>
              <h3 className="text-xs font-semibold text-surface-700 mb-2 uppercase tracking-wide flex items-center">
                Subregion Contribution
                <InfoTooltip text="Distribution of observations across subregions. Click a segment to filter the dashboard by that subregion. Shows top 6 subregions with remaining grouped as Others." />
              </h3>
              {subregionContributionData.some(d => d.value > 0) ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={subregionContributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        onClick={handleSubRegionClick}
                        style={{ cursor: 'pointer' }}
                      >
                        {subregionContributionData.map((entry, index) => (
                          <Cell
                            key={`subreg-${index}`}
                            fill={entry.color}
                            stroke={drillDown.chart === 'subRegion' && drillDown.filter === entry.name ? '#1f2937' : 'none'}
                            strokeWidth={drillDown.chart === 'subRegion' && drillDown.filter === entry.name ? 3 : 0}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={subRegFormatter}
                        contentStyle={TOOLTIP_CONTENT_STYLE}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={subRegLegendFormatter}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-surface-400 text-center opacity-60">Click a segment to explore</p>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-xs text-surface-400">No subregion data available</p>
                </div>
              )}
            </>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center gap-3">
              <div className="text-center">
                <Database className="w-8 h-8 text-surface-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-surface-600">Subregion data not assigned</p>
                <p className="text-xs text-surface-400 mt-1">Please complete subregional assignment to view this chart.</p>
              </div>
              <Link
                to="/files"
                className="text-xs font-medium text-blue-600 hover:text-blue-700 underline"
              >
                Go to File Manager
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Temporal Patterns Section */}
      <div className="space-y-3">
        {/* Observations by Day of Week + Hour of Day */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div ref={dayOfWeekRef}>
            <ObservationsByDayOfWeek incidents={filteredIncidents} />
          </div>
          <div ref={hourOfDayRef}>
            <ObservationsByHourOfDay incidents={filteredIncidents} />
          </div>
        </div>
      </div>

      {/* Hazards Heatmap - Scrollable (max 12 months visible) */}
      {hazardsHeatmap.hazards.length > 0 && (
        <div ref={hazardsHeatmapRef} className="bg-white border border-surface-200 rounded-lg p-3 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-surface-700 uppercase tracking-wide flex items-center">
              Hazards Heatmap (by Month)
              <InfoTooltip text="HOW THIS DATA IS COLLECTED: This table combines hazard categories (rows) with months (columns). For each cell, we count how many observations of that hazard type occurred during that month. Colors indicate intensity: WHITE = no observations that month, YELLOW to ORANGE = moderate activity, RED = high activity (most observations). This shows you patterns over time - you can spot which hazards are increasing, decreasing, or seasonal. Click any colored cell to see the actual observations for that hazard and month. Note: Positive observations are excluded since they're not hazards." />
            </h3>
            {hazardsHeatmap.months.length > 12 && (
              <span className="text-xs text-surface-400">
                Showing {hazardsHeatmap.months.length} months - scroll to view all
              </span>
            )}
          </div>

          <div
            ref={heatmapScrollRef}
            className="overflow-x-auto"
          >
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left p-1.5 font-medium text-surface-600 sticky left-0 bg-white min-w-[140px] border-b border-surface-200">Hazard</th>
                  {hazardsHeatmap.months.map(month => (
                    <th key={month} className="p-1.5 font-medium text-surface-600 text-center min-w-[50px] border-b border-surface-200">
                      {format(parseISO(month + '-01'), 'MMM yy')}
                    </th>
                  ))}
                  <th className="p-1.5 font-medium text-surface-600 text-center min-w-[50px] border-b border-surface-200 bg-surface-50">Total</th>
                </tr>
              </thead>
              <tbody>
                {hazardsHeatmap.hazards.map(hazard => {
                  const rowTotal = hazardsHeatmap.months.reduce(
                    (sum, month) => sum + (hazardsHeatmap.data[hazard]?.[month] || 0),
                    0
                  )
                  return (
                    <tr key={hazard}>
                      <td className="p-1.5 text-surface-700 sticky left-0 bg-white truncate max-w-[140px] border-b border-surface-100" title={hazard}>
                        {hazard}
                      </td>
                      {hazardsHeatmap.months.map(month => {
                        const value = hazardsHeatmap.data[hazard]?.[month] || 0
                        const color = getHeatmapColor(value, hazardsHeatmap.maxValue)
                        const isSelected = heatmapDrillDown.hazard === hazard && heatmapDrillDown.month === month
                        return (
                          <td
                            key={month}
                            className={`p-1.5 text-center font-semibold border-b border-surface-100 ${value > 0 ? 'cursor-pointer hover:opacity-80' : ''}`}
                            style={{
                              backgroundColor: color.bg,
                              color: color.text,
                              outline: isSelected ? '2px solid #1f2937' : 'none',
                              outlineOffset: '-1px',
                            }}
                            onClick={() => handleHeatmapCellClick(hazard, month, value)}
                          >
                            {value > 0 ? value : ''}
                          </td>
                        )
                      })}
                      <td className="p-1.5 text-center font-bold text-surface-900 bg-surface-50 border-b border-surface-100">
                        {rowTotal}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-surface-300">
                  <td className="p-1.5 font-bold text-surface-800 sticky left-0 bg-white">Total</td>
                  {hazardsHeatmap.months.map(month => {
                    const colTotal = hazardsHeatmap.hazards.reduce(
                      (sum, hazard) => sum + (hazardsHeatmap.data[hazard]?.[month] || 0),
                      0
                    )
                    return (
                      <td key={month} className="p-1.5 text-center font-bold text-surface-900 bg-surface-50">
                        {colTotal}
                      </td>
                    )
                  })}
                  <td className="p-1.5 text-center font-bold text-surface-900 bg-surface-200">
                    {heatmapIncidents.filter(i => i.location && i.location !== 'Not specified').length}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-2 mt-2 text-xs">
            <span className="text-surface-500">Low</span>
            <div
              className="w-24 h-3 rounded"
              style={{
                background: 'linear-gradient(to right, #ffffff, #ffffc8, #ffff32, #ffa500, #c81e1e)'
              }}
            ></div>
            <span className="text-surface-500">High</span>
          </div>

        </div>
      )}
      </div>
      {/* End of dashboardContentRef wrapper */}

      {/* Report Modal */}
      <ReportModal
        record={viewingRecord}
        onClose={() => setViewingRecord(null)}
      />

      {/* Drill-Down Modal for Hazards, Observers, Companies, and Positive/Negative */}
      <DrillDownModal
        isOpen={drillDown.modalOpen && ['hazards', 'observers', 'company', 'positiveNegative', 'subRegion', 'observationStatus'].includes(drillDown.chart)}
        onClose={closeDrillDownModal}
        title={
          drillDown.level === 3 && drillDown.period
            ? `${drillDown.filter} - ${format(parseISO(drillDown.period + '-01'), 'MMMM yyyy')}`
            : (drillDown.chart === 'hazards' || drillDown.chart === 'observers') && drillDown.level === 2
              ? `${drillDown.filter} Insights`
              : `${drillDown.filter} - Monthly Breakdown`
        }
        data={drillDown.level === 3 ? drillDownData : (drillDown.chart === 'hazards' || drillDown.chart === 'observers') && drillDown.level === 2 ? getFilteredBySelection : monthlyBreakdown}
        type={drillDown.level === 3 ? 'records' : (drillDown.chart === 'hazards' || drillDown.chart === 'observers') && drillDown.level === 2 ? 'records' : 'monthly'}
        onDrillDown={handleMonthSelect}
        onBack={handleDrillDownBack}
        canGoBack={drillDown.level === 3}
        breadcrumb={[
          drillDown.chart === 'hazards' ? 'Top Hazards' :
          drillDown.chart === 'observers' ? 'Top Observers' :
          drillDown.chart === 'company' ? 'Companies' :
          drillDown.chart === 'positiveNegative' ? 'Positive vs Negative' :
          drillDown.chart === 'subRegion' ? 'Sub-Regions' :
          drillDown.chart === 'observationStatus' ? 'Observation Status' : '',
          drillDown.filter,
          ...(drillDown.level === 3 && drillDown.period ? [format(parseISO(drillDown.period + '-01'), 'MMM yyyy')] : [])
        ].filter(Boolean)}
        source={
          drillDown.chart === 'hazards' ? 'Hazards Identification' :
          drillDown.chart === 'observers' ? 'Observer Analytics' :
          drillDown.chart === 'company' ? 'Company Analytics' :
          drillDown.chart === 'positiveNegative' ? 'Observation Type Analytics' :
          drillDown.chart === 'subRegion' ? 'Sub-Region Analytics' :
          drillDown.chart === 'observationStatus' ? 'Action Status Analytics' : 'Analytics'
        }
        showInsights={(drillDown.chart === 'hazards' || drillDown.chart === 'observers') && drillDown.level === 2}
        insightsMode={drillDown.chart === 'observers' ? 'observer' : 'hazard'}
        insightsData={
          drillDown.chart === 'hazards' && drillDown.level === 2 ? {
            hazardName: drillDown.filter,
            hazardIncidents: getFilteredBySelection,
            allIncidents: filteredIncidents
          } : drillDown.chart === 'observers' && drillDown.level === 2 ? {
            observerName: drillDown.filter,
            observerIncidents: getFilteredBySelection,
            allIncidents: filteredIncidents
          } : null
        }
        factorData={drillDown.chart === 'hazards' && drillDown.level === 2 ? factorData : null}
      />

      {/* Heatmap Drill-Down Modal */}
      <DrillDownModal
        isOpen={heatmapDrillDown.modalOpen}
        onClose={closeHeatmapDrillDown}
        title={
          heatmapDrillDown.hazard && heatmapDrillDown.month
            ? `${heatmapDrillDown.hazard} - ${format(parseISO(heatmapDrillDown.month + '-01'), 'MMMM yyyy')}`
            : 'Heatmap Details'
        }
        data={heatmapDrillDownData}
        type="records"
        breadcrumb={['Heatmap', heatmapDrillDown.hazard, heatmapDrillDown.month ? format(parseISO(heatmapDrillDown.month + '-01'), 'MMM yyyy') : ''].filter(Boolean)}
        source="Hazards Identification"
        showInsights={heatmapDrillDown.hazard && heatmapDrillDownData.length > 0}
        insightsMode="hazard"
        insightsData={heatmapDrillDown.hazard ? {
          hazardName: heatmapDrillDown.hazard,
          hazardIncidents: heatmapDrillDownData,
          allIncidents: heatmapIncidents,
          filterMonth: heatmapDrillDown.month // Pass month for month-specific insights
        } : null}
        factorData={heatmapDrillDown.hazard ? factorData : null}
      />
    </div>
  )
}

export default memo(Dashboard)
