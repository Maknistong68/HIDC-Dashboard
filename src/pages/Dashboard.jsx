import React, { useMemo, useState, useRef, useEffect, useCallback, memo } from 'react'
import {
  FileText,
  CheckCircle,
  CalendarClock,
  ThumbsUp,
  CheckCheck,
  UserCheck,
  ClipboardList,
  Search,
  ChevronDown,
  ChevronUp,
  Database,
} from 'lucide-react'
import { useData } from '../context/DataContext'
import { useDate } from '../context/DateContext'
import { useFilter } from '../context/FilterContext'
import KPICard from '../components/dashboard/KPICard'
import IncidentTrendChart from '../components/dashboard/IncidentTrendChart'
import IncidentPyramid from '../components/dashboard/IncidentPyramid'
import ObservationsByDayOfWeek from '../components/dashboard/ObservationsByDayOfWeek'
import ObservationsByHourOfDay from '../components/dashboard/ObservationsByHourOfDay'
import FilterBar from '../components/common/FilterBar'
import TimePeriodToggle from '../components/common/TimePeriodToggle'
import DataTable from '../components/common/DataTable'
import EmptyState from '../components/dashboard/EmptyState'
import ReportModal from '../components/common/ReportModal'
import DrillDownModal from '../components/common/DrillDownModal'
import { InfoTooltip } from '../components/ui/Tooltip'
import Skeleton from '../components/ui/Skeleton'
import { INCIDENT_TYPES, ACTION_STATUSES, SIGNIFICANT_HAZARDS, SUB_SIGNIFICANT_HAZARDS, RECORDABLE_INCIDENT_TYPES } from '../utils/constants'
import {
  getIncidentCountsByType,
  getIncidentsByMonth,
  getOpenActionsCount,
} from '../utils/calculations'
import { aggregateContributingFactors } from '../utils/rootCauseEngine'
import { memoize } from '../utils/memoizedCalculations'
import { format, parseISO, eachMonthOfInterval, startOfMonth, endOfMonth } from 'date-fns'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Link } from 'react-router-dom'

const SUBREGION_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4']
const SUBREGION_OTHERS_COLOR = '#94a3b8'

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
  const { projects, incidents, isLoading, showOpenClosed, siteClassifications, hasSubregionAssignments, assignedSubRegions } = useData()
  const { cutoffDates, getPeriodRange } = useDate()

  // Shared filter state from context
  const { period, setPeriod, filters, setFilter, clearFilters: contextClearFilters, contractor, site, subRegion } = useFilter()

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

  // All Records section state
  const [showAllRecords, setShowAllRecords] = useState(false)

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

  // Get unique contractors from incidents
  const uniqueContractors = useMemo(() => {
    const contractors = [...new Set(incidents.map(i => i.contractor).filter(Boolean))]
    return contractors.sort().map(contractor => ({ value: contractor, label: contractor }))
  }, [incidents])

  // Get sites filtered by selected contractor (parent-child relationship)
  const siteOptions = useMemo(() => {
    let relevantIncidents = incidents
    // If contractor is selected, only show sites belonging to that contractor
    if (contractor) {
      relevantIncidents = incidents.filter(i => i.contractor === contractor)
    }
    const sites = [...new Set(relevantIncidents.map(i => i.site).filter(Boolean))]
    return sites.sort().map(site => ({ value: site, label: site }))
  }, [incidents, contractor])

  // Filter configuration - Contractor (parent), Site (child), and Sub-Region (conditional)
  // Memoized to prevent unnecessary re-renders in FilterBar
  const filterConfig = useMemo(() => {
    const config = [
      {
        key: 'contractor',
        type: 'select',
        label: 'Contractor',
        placeholder: 'All Contractors',
        options: uniqueContractors
      },
      {
        key: 'site',
        type: 'select',
        label: 'Site',
        placeholder: 'All Sites',
        options: siteOptions
      }
    ]

    // Only show Sub-Region filter if there are any site assignments
    if (hasSubregionAssignments) {
      config.push({
        key: 'subRegion',
        type: 'select',
        label: 'Sub-Region',
        placeholder: 'All Sub-Regions',
        options: assignedSubRegions
      })
    }

    return config
  }, [uniqueContractors, siteOptions, hasSubregionAssignments, assignedSubRegions])

  // Filtered incidents based on contractor, site, subRegion, and period (for KPIs, charts, Top Hazards, Top Observers)
  // Note: Hazard categorization is done at import time, so no recategorization needed here
  // Note: getPeriodRange is a stable function from dateUtils - no need in dependency array
  const filteredIncidents = useMemo(() => {
    // If period is null, show all data (no date filtering)
    if (period === null) {
      return incidents.filter(i => {
        if (contractor && i.contractor !== contractor) return false
        if (site && i.site !== site) return false
        // Filter by sub-region using site classifications
        if (subRegion && siteClassifications[i.site] !== subRegion) return false
        return true
      })
    }

    // Get date range from period
    const { start: dateFrom, end: dateTo } = getPeriodRange(period)

    return incidents.filter(i => {
      if (contractor && i.contractor !== contractor) return false
      if (site && i.site !== site) return false
      // Filter by sub-region using site classifications
      if (subRegion && siteClassifications[i.site] !== subRegion) return false
      if (i.date < dateFrom) return false
      if (i.date > dateTo) return false
      return true
    })
  }, [incidents, contractor, site, subRegion, siteClassifications, period])

  // Heatmap uses ALL incidents (not filtered by "This Month")
  // Contractor/site/subRegion filters apply to heatmap
  // Exclude positive observations from heatmap
  // Note: Hazard categorization is done at import time, so no recategorization needed here
  const heatmapIncidents = useMemo(() => {
    return incidents.filter(i => {
      if (i.type === 'positive') return false
      if (contractor && i.contractor !== contractor) return false
      if (site && i.site !== site) return false
      // Filter by sub-region using site classifications
      if (subRegion && siteClassifications[i.site] !== subRegion) return false
      return true
    })
  }, [incidents, contractor, site, subRegion, siteClassifications])

  // Calculate contributing factors for negative incidents (used for hazard insights drill-down)
  const factorData = useMemo(() => {
    return aggregateContributingFactors(heatmapIncidents, 'negative')
  }, [heatmapIncidents])

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
      // Exclude positive observations for hazards drill-down (consistent with Top Hazards chart)
      const normalizedFilter = normalizeHazard(drillDown.filter)
      filtered = filteredIncidents.filter(i =>
        i.type !== 'positive' && normalizeHazard(i.location) === normalizedFilter
      )
    } else if (drillDown.chart === 'company') {
      // Filter by contractor/company
      filtered = filteredIncidents.filter(i =>
        (i.contractor || 'Unknown') === drillDown.filter
      )
    } else if (drillDown.chart === 'positiveNegative') {
      // Filter by positive or negative category
      if (drillDown.filter === 'Negative') {
        filtered = filteredIncidents.filter(i =>
          ['unsafe-act', 'unsafe-condition', 'near-miss', 'ncr'].includes(i.type)
        )
      } else if (drillDown.filter === 'Positive') {
        filtered = filteredIncidents.filter(i =>
          ['leadership', 'positive'].includes(i.type)
        )
      }
    } else if (drillDown.chart === 'subRegion') {
      filtered = filteredIncidents.filter(i =>
        (siteClassifications[i.site] || 'Unassigned') === drillDown.filter
      )
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

  // Table columns
  const incidentColumns = [
    { key: 'date', header: 'Date', accessor: (row) => row.date },
    {
      key: 'type',
      header: 'Type',
      accessor: (row) => row.type,
      render: (row) => {
        const typeInfo = INCIDENT_TYPES.find(t => t.value === row.type)
        return (
          <span
            className="px-1.5 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: typeInfo?.color + '20',
              color: typeInfo?.color
            }}
          >
            {typeInfo?.label || row.type}
          </span>
        )
      }
    },
    { key: 'description', header: 'Description', accessor: (row) => row.description?.substring(0, 50) + '...' },
    { key: 'location', header: 'Hazard', accessor: (row) => row.location },
    { key: 'contractor', header: 'Contractor', accessor: (row) => row.contractor || '-' },
    { key: 'site', header: 'Site', accessor: (row) => row.site || '-' },
    { key: 'reportedBy', header: 'Reporter', accessor: (row) => row.reportedBy },
    { key: 'actionStatus', header: 'Status', accessor: (row) => row.actionStatus }
  ]

  const incidentCounts = useMemo(
    () => getIncidentCountsByType(filteredIncidents),
    [filteredIncidents]
  )

  // Pyramid data with open/closed breakdown
  const pyramidData = useMemo(() => {
    const result = {}
    const types = ['incident', 'near-miss', 'ncr', 'unsafe-act', 'unsafe-condition', 'positive', 'leadership']

    types.forEach(type => {
      result[type] = { open: 0, closed: 0 }
    })

    filteredIncidents.forEach(incident => {
      // Aggregate LTI, MTI, FAC into 'incident' category
      const typeKey = RECORDABLE_INCIDENT_TYPES.includes(incident.type) ? 'incident' : incident.type

      if (result[typeKey]) {
        if (incident.actionStatus === 'closed') {
          result[typeKey].closed++
        } else {
          result[typeKey].open++
        }
      }
    })

    return result
  }, [filteredIncidents])

  const incidentTrend = useMemo(
    () => getIncidentsByMonth(filteredIncidents, 12),
    [filteredIncidents]
  )

  // Close out percentage
  const closeOutPercentage = useMemo(() => {
    if (filteredIncidents.length === 0) return 0
    const closed = filteredIncidents.filter(i => i.actionStatus === 'closed').length
    return Math.round((closed / filteredIncidents.length) * 100)
  }, [filteredIncidents])

  // Open more than 1 month (30 days) - uses centralized cutoff date
  const openMoreThanMonth = useMemo(() => {
    return filteredIncidents.filter(i =>
      i.actionStatus !== 'closed' &&
      i.date &&
      i.date < cutoffDates.overdue30Days
    ).length
  }, [filteredIncidents, cutoffDates.overdue30Days])

  // Positive observation percentage
  const positivePercentage = useMemo(() => {
    if (filteredIncidents.length === 0) return 0
    const positiveCount = filteredIncidents.filter(i => i.type === 'positive').length
    return Math.round((positiveCount / filteredIncidents.length) * 100)
  }, [filteredIncidents])

  const positiveCount = useMemo(() => {
    return filteredIncidents.filter(i => i.type === 'positive').length
  }, [filteredIncidents])

  // Approval status counts (from original approval column)
  const approvalCounts = useMemo(() => {
    const counts = {
      closed: 0,
      contractorReview: 0,
      review: 0,
      contractorInvestigation: 0,
    }

    filteredIncidents.forEach(incident => {
      const approval = incident.approvalStatus?.toLowerCase()?.trim() || ''
      if (approval === 'closed') {
        counts.closed++
      } else if (approval === 'contractor review') {
        counts.contractorReview++
      } else if (approval === 'review') {
        counts.review++
      } else if (approval === 'contractor investigation') {
        counts.contractorInvestigation++
      }
    })

    return counts
  }, [filteredIncidents])

  // Observers data with open/closed breakdown
  const observersData = useMemo(() => {
    const counts = {}
    filteredIncidents.forEach(incident => {
      const reporter = incident.reportedBy || 'Unknown'
      if (!counts[reporter]) {
        counts[reporter] = { open: 0, closed: 0 }
      }
      if (incident.actionStatus === 'closed') {
        counts[reporter].closed++
      } else {
        counts[reporter].open++
      }
    })
    return Object.entries(counts)
      .map(([name, data]) => ({
        name,
        open: data.open,
        closed: data.closed,
        total: data.open + data.closed
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
  }, [filteredIncidents])

  // Company data with open/closed breakdown (by contractor field)
  const companyData = useMemo(() => {
    const companyMap = {}
    filteredIncidents.forEach(incident => {
      const company = incident.contractor || 'Unknown'
      if (!companyMap[company]) {
        companyMap[company] = { name: company, open: 0, closed: 0, total: 0 }
      }
      companyMap[company].total++
      if (incident.actionStatus === 'closed') {
        companyMap[company].closed++
      } else {
        companyMap[company].open++
      }
    })
    return Object.values(companyMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
  }, [filteredIncidents])

  // Positive vs Negative data for pie chart
  const positiveNegativeData = useMemo(() => {
    const negative = filteredIncidents.filter(i =>
      ['unsafe-act', 'unsafe-condition', 'near-miss', 'ncr'].includes(i.type)
    ).length

    const positive = filteredIncidents.filter(i =>
      ['leadership', 'positive'].includes(i.type)
    ).length

    return [
      { name: 'Negative', value: negative, color: '#ef4444' },
      { name: 'Positive', value: positive, color: '#22c55e' }
    ]
  }, [filteredIncidents])

  // Hazard Classification: Eltizam vs Other (excludes positive observations)
  const hazardClassificationData = useMemo(() => {
    const nonPositive = filteredIncidents.filter(i => i.type !== 'positive')
    let eltizam = 0
    let other = 0
    nonPositive.forEach(i => {
      const normalized = normalizeHazard(i.location)
      if (normalized && normalized !== 'Not Specified') {
        if (SIGNIFICANT_HAZARDS_MAP.has(normalized.toLowerCase())) {
          eltizam++
        } else {
          other++
        }
      }
    })
    return [
      { name: 'Eltizam Hazards', value: eltizam, color: '#eab308' },
      { name: 'Other Hazards', value: other, color: '#8b5cf6' },
    ]
  }, [filteredIncidents])

  // Subregion Contribution: top 6 subregions + Others
  const subregionContributionData = useMemo(() => {
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

  // Top Hazards data - EXCLUDES positive observations (only counts non-positive)
  // Significant Hazards (13 official categories) are prioritized first
  const topHazards = useMemo(() => {
    const counts = {}
    // Filter out positive observations - Top Hazards should only show non-positive observations
    const nonPositiveIncidents = filteredIncidents.filter(i => i.type !== 'positive')
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
        // Priority 1: Significant Hazards first (14 NEOM Eltizam categories)
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
  // Always shows all 14 NEOM Eltizam Significant Hazards + any additional hazards with data
  const hazardsHeatmap = useMemo(() => {
    // Start with all 14 Significant Hazards (NEOM Eltizam) - use canonical names
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

    // Sort hazards by priority: Significant (14 NEOM Eltizam) first, then Sub-significant, then alphabetical
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
            activeFilters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
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
          subtitle={`${filteredIncidents.filter(i => i.actionStatus === 'closed').length} of ${filteredIncidents.length} closed`}
          icon={CheckCircle}
          color={closeOutPercentage >= 80 ? 'success' : closeOutPercentage >= 50 ? 'warning' : 'danger'}
          info="HOW THIS IS CALCULATED: We look at the 'Action Status' field in your data. If an observation is marked as 'Closed', it means someone has addressed the issue and completed any required actions. This percentage shows how many observations have been fully resolved compared to the total. GREEN (80%+): Excellent - your team is closing out issues quickly. YELLOW (50-79%): Needs attention - some issues are lingering. RED (below 50%): Urgent - too many open items need action."
        />
        <KPICard
          title="Positive Rate"
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
          title="Review"
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
            <IncidentTrendChart data={incidentTrend} />
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
                    onClick={(data) => handleDrillDown('positiveNegative', data.name)}
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
                    formatter={(value, name) => {
                      const total = positiveNegativeData.reduce((sum, d) => sum + d.value, 0)
                      const percent = total > 0 ? Math.round((value / total) * 100) : 0
                      return [`${value} (${percent}%)`, name]
                    }}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value, entry) => {
                      const item = positiveNegativeData.find(d => d.name === value)
                      const total = positiveNegativeData.reduce((sum, d) => sum + d.value, 0)
                      const percent = total > 0 ? Math.round((item?.value / total) * 100) : 0
                      return (
                        <span className="text-xs text-surface-700">
                          {value}: {item?.value} ({percent}%)
                        </span>
                      )
                    }}
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
        {/* Donut 1: Hazard Classification */}
        <div className="bg-white border border-surface-200 rounded-lg p-3 shadow-soft">
          <h3 className="text-xs font-semibold text-surface-700 mb-2 uppercase tracking-wide flex items-center">
            Hazard Classification
            <InfoTooltip text="Breakdown of observations by hazard classification. Eltizam Hazards are the 14 NEOM significant hazard categories. Other Hazards are all remaining hazard types. Source: observations, inspections, incidents (excludes positive observations)." />
          </h3>
          {hazardClassificationData.some(d => d.value > 0) ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={hazardClassificationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {hazardClassificationData.map((entry, index) => (
                      <Cell key={`hazclass-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => {
                      const total = hazardClassificationData.reduce((sum, d) => sum + d.value, 0)
                      const percent = total > 0 ? Math.round((value / total) * 100) : 0
                      return [`${value} (${percent}%)`, name]
                    }}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => {
                      const item = hazardClassificationData.find(d => d.name === value)
                      const total = hazardClassificationData.reduce((sum, d) => sum + d.value, 0)
                      const percent = total > 0 ? Math.round((item?.value / total) * 100) : 0
                      return (
                        <span className="text-xs text-surface-700">
                          {value}: {item?.value} ({percent}%)
                        </span>
                      )
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-xs text-surface-400">No hazard data available</p>
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
                        onClick={(data) => {
                          if (data.name !== 'Others') {
                            handleDrillDown('subRegion', data.name)
                          }
                        }}
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
                        formatter={(value, name) => {
                          const total = subregionContributionData.reduce((sum, d) => sum + d.value, 0)
                          const percent = total > 0 ? Math.round((value / total) * 100) : 0
                          return [`${value} (${percent}%)`, name]
                        }}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => {
                          const item = subregionContributionData.find(d => d.name === value)
                          const total = subregionContributionData.reduce((sum, d) => sum + d.value, 0)
                          const percent = total > 0 ? Math.round((item?.value / total) * 100) : 0
                          return (
                            <span className="text-xs text-surface-700">
                              {value}: {item?.value} ({percent}%)
                            </span>
                          )
                        }}
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

      {/* All Records Section - Collapsible */}
      <div className="bg-white border border-surface-200 rounded-lg overflow-hidden shadow-soft">
        <button
          onClick={() => setShowAllRecords(!showAllRecords)}
          className="w-full flex items-center justify-between p-3 hover:bg-surface-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Database size={18} className="text-surface-600" />
            <h3 className="text-sm font-semibold text-surface-700 uppercase tracking-wide flex items-center">
              All Records
              <InfoTooltip text="HOW THIS DATA IS DISPLAYED: This is a complete list of every observation that matches your current filters (time period, contractor, site). Each row is one observation from your imported data. You can search by typing keywords, sort by clicking column headers, and click any row to see the full details including the complete description, all photos, and action history. Use this to find specific observations or review data in detail." />
            </h3>
            <span className="text-xs text-surface-500 bg-surface-100 px-2 py-0.5 rounded-full">
              {filteredIncidents.length} records
            </span>
          </div>
          {showAllRecords ? (
            <ChevronUp size={18} className="text-surface-500" />
          ) : (
            <ChevronDown size={18} className="text-surface-500" />
          )}
        </button>

        {showAllRecords && (
          <div className="border-t border-surface-200 p-3">
            <DataTable
              data={filteredIncidents}
              columns={[
                {
                  key: 'date',
                  header: 'Date',
                  accessor: (row) => row.date,
                  render: (row) => {
                    try {
                      return format(parseISO(row.date), 'MMM d, yyyy')
                    } catch {
                      return row.date
                    }
                  },
                  width: '100px',
                },
                {
                  key: 'type',
                  header: 'Type',
                  accessor: (row) => row.type,
                  render: (row) => {
                    const type = INCIDENT_TYPES.find((t) => t.value === row.type)
                    return (
                      <span
                        className="px-1.5 py-0.5 text-xs font-medium rounded-sm"
                        style={{
                          backgroundColor: `${type?.color}20`,
                          color: type?.color,
                        }}
                      >
                        {type?.label || row.type}
                      </span>
                    )
                  },
                  width: '120px',
                },
                {
                  key: 'contractor',
                  header: 'Contractor',
                  accessor: (row) => row.contractor || '-',
                  width: '120px',
                },
                {
                  key: 'site',
                  header: 'Site',
                  accessor: (row) => row.site || '-',
                  width: '120px',
                },
                {
                  key: 'description',
                  header: 'Description',
                  accessor: (row) => row.description,
                  render: (row) => (
                    <span className="line-clamp-2 text-xs">{row.description}</span>
                  ),
                },
                {
                  key: 'location',
                  header: 'Hazard',
                  accessor: (row) => row.location || '-',
                  width: '120px',
                },
                {
                  key: 'reportedBy',
                  header: 'Reporter',
                  accessor: (row) => row.reportedBy || '-',
                  width: '120px',
                },
                {
                  key: 'actionStatus',
                  header: 'Status',
                  accessor: (row) => row.actionStatus,
                  render: (row) => {
                    const status = ACTION_STATUSES.find((s) => s.value === row.actionStatus)
                    return (
                      <span
                        className="px-1.5 py-0.5 text-xs font-medium rounded-sm"
                        style={{
                          backgroundColor: `${status?.color}20`,
                          color: status?.color,
                        }}
                      >
                        {status?.label || row.actionStatus}
                      </span>
                    )
                  },
                  width: '90px',
                },
              ]}
              searchPlaceholder="Search records..."
              emptyMessage="No records match the current filters."
              pageSize={15}
              onViewClick={setViewingRecord}
            />
          </div>
        )}
      </div>

      {/* Report Modal */}
      <ReportModal
        record={viewingRecord}
        onClose={() => setViewingRecord(null)}
      />

      {/* Drill-Down Modal for Hazards, Observers, Companies, and Positive/Negative */}
      <DrillDownModal
        isOpen={drillDown.modalOpen && ['hazards', 'observers', 'company', 'positiveNegative', 'subRegion'].includes(drillDown.chart)}
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
          drillDown.chart === 'subRegion' ? 'Sub-Regions' : '',
          drillDown.filter,
          ...(drillDown.level === 3 && drillDown.period ? [format(parseISO(drillDown.period + '-01'), 'MMM yyyy')] : [])
        ].filter(Boolean)}
        source={
          drillDown.chart === 'hazards' ? 'Hazards Identification' :
          drillDown.chart === 'observers' ? 'Observer Analytics' :
          drillDown.chart === 'company' ? 'Company Analytics' :
          drillDown.chart === 'positiveNegative' ? 'Observation Type Analytics' :
          drillDown.chart === 'subRegion' ? 'Sub-Region Analytics' : 'Analytics'
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
