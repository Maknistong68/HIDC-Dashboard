import React, { useMemo, useState, useRef, useEffect } from 'react'
import {
  FileText,
  Upload,
  CheckCircle,
  CalendarClock,
  Calendar,
  ThumbsUp,
  CheckCheck,
  UserCheck,
  ClipboardList,
  Search,
  ChevronDown,
  ChevronUp,
  Database,
  Info,
} from 'lucide-react'
import { useData } from '../context/DataContext'
import KPICard from '../components/dashboard/KPICard'
import IncidentTrendChart from '../components/dashboard/IncidentTrendChart'
import IncidentPyramid from '../components/dashboard/IncidentPyramid'
import FilterBar from '../components/common/FilterBar'
import DataTable from '../components/common/DataTable'
import EmptyState from '../components/dashboard/EmptyState'
import QuickImportModal from '../components/import/QuickImportModal'
import ExportMenu from '../components/dashboard/ExportMenu'
import ReportModal from '../components/common/ReportModal'
import DrillDownModal from '../components/common/DrillDownModal'
import { useExport } from '../hooks/useExport'
import { INCIDENT_TYPES, ACTION_STATUSES } from '../utils/constants'
import {
  getIncidentCountsByType,
  getIncidentsByMonth,
  getOpenActionsCount,
  recategorizeBlankHazards,
} from '../utils/calculations'
import { format, parseISO, eachMonthOfInterval, startOfMonth, endOfMonth } from 'date-fns'

// Normalize hazard name for consistent grouping (fixes duplicates)
const normalizeHazard = (hazard) => {
  if (!hazard) return null
  return hazard
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Info tooltip component for chart explanations
const InfoTooltip = ({ text }) => (
  <div className="group relative inline-flex items-center ml-1.5">
    <Info size={14} className="text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
    <div className="hidden group-hover:block absolute z-50 w-64 p-2.5 bg-gray-900 text-white text-xs rounded-lg shadow-xl left-5 top-0 leading-relaxed">
      <div className="absolute -left-1.5 top-1.5 w-3 h-3 bg-gray-900 transform rotate-45"></div>
      <span className="relative">{text}</span>
    </div>
  </div>
)

const Dashboard = () => {
  const { projects, incidents, isLoading, showOpenClosed } = useData()

  // Import modal state
  const [showImportModal, setShowImportModal] = useState(false)

  // "This Month" quick filter
  const [thisMonthActive, setThisMonthActive] = useState(false)

  // Filter state - contractor is parent, site is child
  const [filters, setFilters] = useState({
    contractor: '',
    site: '',
    dateFrom: '',
    dateTo: ''
  })

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
  const hazardsHeatmapRef = useRef(null)

  // Chart refs object for export
  const chartRefs = {
    kpiCards1: kpiCards1Ref,
    kpiCards2: kpiCards2Ref,
    pyramid: pyramidRef,
    trendChart: trendChartRef,
    topHazards: topHazardsRef,
    topObservers: topObserversRef,
    hazardsHeatmap: hazardsHeatmapRef,
  }

  // Export hook is called after filteredIncidents is defined (see below)

  // Auto-scroll heatmap to end (most recent months) on load
  useEffect(() => {
    if (heatmapScrollRef.current) {
      heatmapScrollRef.current.scrollLeft = heatmapScrollRef.current.scrollWidth
    }
  }, [incidents])

  // Get this month's date range
  const getThisMonthRange = () => {
    const now = new Date()
    const start = format(startOfMonth(now), 'yyyy-MM-dd')
    const end = format(endOfMonth(now), 'yyyy-MM-dd')
    return { start, end }
  }

  // Handle "This Month" toggle
  const handleThisMonthToggle = () => {
    if (thisMonthActive) {
      // Turn off - clear date filters
      setFilters(prev => ({ ...prev, dateFrom: '', dateTo: '' }))
      setThisMonthActive(false)
    } else {
      // Turn on - set to this month
      const { start, end } = getThisMonthRange()
      setFilters(prev => ({ ...prev, dateFrom: start, dateTo: end }))
      setThisMonthActive(true)
    }
    setDrillDown({ chart: null, filter: null, level: 1, period: null, modalOpen: false })
    setHeatmapDrillDown({ hazard: null, month: null, modalOpen: false })
  }

  // Handle filter changes - reset site when contractor changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value }
      // Reset site filter when contractor changes (parent-child relationship)
      if (key === 'contractor') {
        newFilters.site = ''
      }
      return newFilters
    })
    setThisMonthActive(false) // Turn off "This Month" when manual filter changes
    setDrillDown({ chart: null, filter: null, level: 1, period: null, modalOpen: false })
    setHeatmapDrillDown({ hazard: null, month: null, modalOpen: false })
  }

  const clearFilters = () => {
    setFilters({ contractor: '', site: '', dateFrom: '', dateTo: '' })
    setThisMonthActive(false)
    setDrillDown({ chart: null, filter: null, level: 1, period: null, modalOpen: false })
    setHeatmapDrillDown({ hazard: null, month: null, modalOpen: false })
  }

  // Handle heatmap cell click - opens modal
  const handleHeatmapCellClick = (hazard, month, value) => {
    if (value === 0) return
    setHeatmapDrillDown({ hazard, month, modalOpen: true })
  }

  const closeHeatmapDrillDown = () => {
    setHeatmapDrillDown({ hazard: null, month: null, modalOpen: false })
  }

  // Handle drill-down - opens modal with level 2 (monthly breakdown)
  const handleDrillDown = (chart, filter) => {
    setDrillDown({ chart, filter, level: 2, period: null, modalOpen: true })
  }

  const closeDrillDownModal = () => {
    setDrillDown({ chart: null, filter: null, level: 1, period: null, modalOpen: false })
  }

  const handleDrillDownBack = () => {
    if (drillDown.level === 3) {
      setDrillDown(prev => ({ ...prev, level: 2, period: null }))
    } else {
      closeDrillDownModal()
    }
  }

  const handleMonthSelect = (monthData) => {
    setDrillDown(prev => ({ ...prev, level: 3, period: monthData.period }))
  }

  // Get unique contractors from incidents
  const uniqueContractors = useMemo(() => {
    const contractors = [...new Set(incidents.map(i => i.contractor).filter(Boolean))]
    return contractors.sort().map(contractor => ({ value: contractor, label: contractor }))
  }, [incidents])

  // Get sites filtered by selected contractor (parent-child relationship)
  const siteOptions = useMemo(() => {
    let relevantIncidents = incidents
    // If contractor is selected, only show sites belonging to that contractor
    if (filters.contractor) {
      relevantIncidents = incidents.filter(i => i.contractor === filters.contractor)
    }
    const sites = [...new Set(relevantIncidents.map(i => i.site).filter(Boolean))]
    return sites.sort().map(site => ({ value: site, label: site }))
  }, [incidents, filters.contractor])

  // Filter configuration - Contractor (parent) and Site (child)
  const filterConfig = [
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
    },
    {
      key: 'dateFrom',
      type: 'date',
      label: 'From',
      placeholder: 'Start Date'
    },
    {
      key: 'dateTo',
      type: 'date',
      label: 'To',
      placeholder: 'End Date'
    }
  ]

  // Filtered incidents based on contractor, site, and date (for KPIs, charts, Top Hazards, Top Observers)
  const filteredIncidents = useMemo(() => {
    let result = [...incidents]

    // Filter by contractor (parent filter)
    if (filters.contractor) {
      result = result.filter(i => i.contractor === filters.contractor)
    }

    // Filter by site (child filter - only shows sites for selected contractor)
    if (filters.site) {
      result = result.filter(i => i.site === filters.site)
    }

    if (filters.dateFrom) {
      result = result.filter(i => i.date >= filters.dateFrom)
    }
    if (filters.dateTo) {
      result = result.filter(i => i.date <= filters.dateTo)
    }

    return recategorizeBlankHazards(result)
  }, [incidents, filters])

  // Export hook - dashboardContentRef for PDF full-page capture, chartRefs for PowerPoint
  // Note: filteredIncidents is passed for summary statistics in exports
  const { isExporting, exportProgress, handleExportPDF, handleExportPPTX } = useExport(dashboardContentRef, chartRefs, filters, filteredIncidents)

  // Heatmap uses ALL incidents (not filtered by "This Month")
  // Only contractor/site filter applies to heatmap
  // Exclude positive observations from heatmap
  const heatmapIncidents = useMemo(() => {
    let result = [...incidents]

    if (filters.contractor) {
      result = result.filter(i => i.contractor === filters.contractor)
    }
    if (filters.site) {
      result = result.filter(i => i.site === filters.site)
    }

    // Exclude positive observations from heatmap
    result = result.filter(i => i.type !== 'positive')

    return recategorizeBlankHazards(result)
  }, [incidents, filters.contractor, filters.site])

  // Get filtered data based on drill-down selection
  const getFilteredBySelection = useMemo(() => {
    if (!drillDown.chart || !drillDown.filter) return []

    let filtered = filteredIncidents
    if (drillDown.chart === 'pyramid') {
      // Handle 'incident' type which aggregates lti, mti, fac
      if (drillDown.filter === 'incident') {
        filtered = filteredIncidents.filter(i => ['lti', 'mti', 'fac'].includes(i.type))
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
  const heatmapDrillDownData = useMemo(() => {
    if (!heatmapDrillDown.hazard || !heatmapDrillDown.month) return []

    return heatmapIncidents.filter(i => {
      const normalizedLocation = normalizeHazard(i.location)
      const incidentMonth = i.date?.substring(0, 7)
      return normalizedLocation === heatmapDrillDown.hazard && incidentMonth === heatmapDrillDown.month
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
    const types = ['incident', 'near-miss', 'unsafe-act', 'unsafe-condition', 'positive']

    types.forEach(type => {
      result[type] = { open: 0, closed: 0 }
    })

    filteredIncidents.forEach(incident => {
      // Aggregate LTI, MTI, FAC into 'incident' category
      const incidentTypes = ['lti', 'mti', 'fac']
      const typeKey = incidentTypes.includes(incident.type) ? 'incident' : incident.type

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

  // Open more than 1 month (30 days)
  const openMoreThanMonth = useMemo(() => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const cutoffDate = format(thirtyDaysAgo, 'yyyy-MM-dd')

    return filteredIncidents.filter(i =>
      i.actionStatus !== 'closed' &&
      i.date &&
      i.date < cutoffDate
    ).length
  }, [filteredIncidents])

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

  // Top Hazards data - EXCLUDES positive observations (only counts non-positive)
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
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
  }, [filteredIncidents])

  // Hazards Heatmap data (uses heatmapIncidents - not affected by "This Month")
  const hazardsHeatmap = useMemo(() => {
    if (heatmapIncidents.length === 0) return { months: [], hazards: [], data: {}, maxValue: 0 }

    const hazardSet = new Set()
    heatmapIncidents.forEach(i => {
      const normalized = normalizeHazard(i.location)
      if (normalized && normalized !== 'Not Specified') {
        hazardSet.add(normalized)
      }
    })
    const hazards = Array.from(hazardSet).sort()

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

    heatmapIncidents.forEach(incident => {
      const normalized = normalizeHazard(incident.location)
      if (normalized && normalized !== 'Not Specified' && incident.date) {
        const month = incident.date.substring(0, 7)
        if (data[normalized] && data[normalized][month] !== undefined) {
          data[normalized][month]++
          if (data[normalized][month] > maxValue) {
            maxValue = data[normalized][month]
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (incidents.length === 0) {
    return <EmptyState onImportComplete={() => {}} />
  }

  return (
    <div className="space-y-3">
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

        {/* This Month Button */}
        <button
          onClick={handleThisMonthToggle}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            thisMonthActive
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Calendar size={16} />
          This Month
        </button>

        {/* Import More Button */}
        <button
          onClick={() => setShowImportModal(true)}
          className="flex items-center gap-2 px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium whitespace-nowrap"
        >
          <Upload size={16} />
          Import
        </button>

        {/* Export Menu (3-dot) */}
        <ExportMenu
          onExportPDF={handleExportPDF}
          onExportPPTX={handleExportPPTX}
          isExporting={isExporting}
          exportProgress={exportProgress}
        />
      </div>

      {/* Quick Import Modal */}
      <QuickImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
      />

      {/* Dashboard Content - wrapped for PDF export full-page capture */}
      <div ref={dashboardContentRef} className="space-y-3 bg-gray-50 p-2 -m-2">
      {/* KPI Cards - Row 1 */}
      <div ref={kpiCards1Ref} className="grid grid-cols-4 gap-3">
        <KPICard
          title="Total Observations"
          value={filteredIncidents.length}
          subtitle={thisMonthActive ? 'This month' : 'All records'}
          icon={FileText}
          color="primary"
          info="Total number of observations matching current filters. Includes all types: incidents, near misses, unsafe acts/conditions, and positive observations."
        />
        <KPICard
          title="Close Out Rate"
          value={`${closeOutPercentage}%`}
          subtitle={`${filteredIncidents.filter(i => i.actionStatus === 'closed').length} of ${filteredIncidents.length} closed`}
          icon={CheckCircle}
          color={closeOutPercentage >= 80 ? 'success' : closeOutPercentage >= 50 ? 'warning' : 'danger'}
          info="Percentage of observations that have been closed. Target: 80%+ indicates good follow-through on safety actions."
        />
        <KPICard
          title="Positive Rate"
          value={`${positivePercentage}%`}
          subtitle={`${positiveCount} of ${filteredIncidents.length} positive`}
          icon={ThumbsUp}
          color={positivePercentage >= 30 ? 'success' : positivePercentage >= 15 ? 'warning' : 'info'}
          info="Percentage of positive observations. Higher rates (30%+) indicate proactive safety culture where good behaviors are recognized."
        />
        <KPICard
          title="Open > 1 Month"
          value={openMoreThanMonth}
          subtitle="Overdue actions"
          icon={CalendarClock}
          color={openMoreThanMonth > 10 ? 'danger' : openMoreThanMonth > 5 ? 'warning' : 'info'}
          info="Number of observations open for more than 30 days. High numbers indicate action follow-up delays that need attention."
        />
      </div>

      {/* KPI Cards - Row 2 (Approval Status) */}
      <div ref={kpiCards2Ref} className="grid grid-cols-4 gap-3">
        <KPICard
          title="Closed"
          value={approvalCounts.closed}
          subtitle="Fully closed items"
          icon={CheckCheck}
          color="success"
          info="Observations that have been fully closed and resolved. These require no further action."
        />
        <KPICard
          title="Contractor Review"
          value={approvalCounts.contractorReview}
          subtitle="Pending contractor review"
          icon={UserCheck}
          color={approvalCounts.contractorReview > 10 ? 'warning' : 'info'}
          info="Observations awaiting contractor review and response. Monitor to ensure timely contractor engagement."
        />
        <KPICard
          title="Review"
          value={approvalCounts.review}
          subtitle="Pending review"
          icon={ClipboardList}
          color={approvalCounts.review > 10 ? 'warning' : 'info'}
          info="Observations pending internal review. High numbers may indicate review bottleneck."
        />
        <KPICard
          title="Contractor Investigation"
          value={approvalCounts.contractorInvestigation}
          subtitle="Under investigation"
          icon={Search}
          color={approvalCounts.contractorInvestigation > 5 ? 'warning' : 'info'}
          info="Observations under contractor investigation. These typically involve more serious issues requiring detailed analysis."
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-3">
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

      {/* Top Hazards + Observers */}
      <div className="grid grid-cols-2 gap-3">
        {/* Top Hazards */}
        <div ref={topHazardsRef} className="bg-white border border-gray-300 p-3">
          <h3 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide flex items-center">
            Top Significant Hazards
            <InfoTooltip text="Top 10 hazard categories ranked by observation count. Click any bar to drill down into specific observations. Red/green bars show open vs closed status." />
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
                    className={`relative cursor-pointer hover:bg-gray-50 ${isActive ? 'ring-2 ring-gray-800' : ''}`}
                    onClick={() => handleDrillDown('hazards', hazard.name)}
                    style={{ opacity: drillDown.chart === 'hazards' && !isActive ? 0.5 : 1 }}
                  >
                    <div className="flex items-center justify-between p-1.5 relative z-10">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400 w-4">{index + 1}</span>
                        <span className="text-xs text-gray-700 truncate">{hazard.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {showOpenClosed && (
                          <span className="text-xs text-gray-500">{hazard.open}o/{hazard.closed}c</span>
                        )}
                        <span className="text-xs font-bold text-gray-900">{hazard.total}</span>
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
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center py-4">No hazard data available</p>
          )}
        </div>

        {/* Top Observers */}
        <div ref={topObserversRef} className="bg-white border border-gray-300 p-3">
          <h3 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide flex items-center">
            Top Observers
            <InfoTooltip text="Top 10 reporters ranked by observation count. Click any bar to see their observations. High reporter activity indicates strong safety culture engagement." />
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
                    className={`relative cursor-pointer hover:bg-gray-50 ${isActive ? 'ring-2 ring-gray-800' : ''}`}
                    onClick={() => handleDrillDown('observers', observer.name)}
                    style={{ opacity: drillDown.chart === 'observers' && !isActive ? 0.5 : 1 }}
                  >
                    <div className="flex items-center justify-between p-1.5 relative z-10">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400 w-4">{index + 1}</span>
                        <span className="text-xs text-gray-700 truncate">{observer.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {showOpenClosed && (
                          <span className="text-xs text-gray-500">{observer.open}o/{observer.closed}c</span>
                        )}
                        <span className="text-xs font-bold text-gray-900">{observer.total}</span>
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
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center py-4">No observer data available</p>
          )}
        </div>
      </div>

      {/* Hazards Heatmap - Scrollable (max 12 months visible) */}
      {hazardsHeatmap.hazards.length > 0 && (
        <div ref={hazardsHeatmapRef} className="bg-white border border-gray-300 p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide flex items-center">
              Hazards Heatmap (by Month)
              <InfoTooltip text="Monthly distribution of hazard categories. Darker colors indicate higher counts. Click any cell to drill down into that specific hazard/month combination." />
            </h3>
            {hazardsHeatmap.months.length > 12 && (
              <span className="text-xs text-gray-400">
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
                  <th className="text-left p-1.5 font-medium text-gray-600 sticky left-0 bg-white min-w-[140px] border-b border-gray-200">Hazard</th>
                  {hazardsHeatmap.months.map(month => (
                    <th key={month} className="p-1.5 font-medium text-gray-600 text-center min-w-[50px] border-b border-gray-200">
                      {format(parseISO(month + '-01'), 'MMM yy')}
                    </th>
                  ))}
                  <th className="p-1.5 font-medium text-gray-600 text-center min-w-[50px] border-b border-gray-200 bg-gray-50">Total</th>
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
                      <td className="p-1.5 text-gray-700 sticky left-0 bg-white truncate max-w-[140px] border-b border-gray-100" title={hazard}>
                        {hazard}
                      </td>
                      {hazardsHeatmap.months.map(month => {
                        const value = hazardsHeatmap.data[hazard]?.[month] || 0
                        const color = getHeatmapColor(value, hazardsHeatmap.maxValue)
                        const isSelected = heatmapDrillDown.hazard === hazard && heatmapDrillDown.month === month
                        return (
                          <td
                            key={month}
                            className={`p-1.5 text-center font-semibold border-b border-gray-100 ${value > 0 ? 'cursor-pointer hover:opacity-80' : ''}`}
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
                      <td className="p-1.5 text-center font-bold text-gray-900 bg-gray-50 border-b border-gray-100">
                        {rowTotal}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300">
                  <td className="p-1.5 font-bold text-gray-800 sticky left-0 bg-white">Total</td>
                  {hazardsHeatmap.months.map(month => {
                    const colTotal = hazardsHeatmap.hazards.reduce(
                      (sum, hazard) => sum + (hazardsHeatmap.data[hazard]?.[month] || 0),
                      0
                    )
                    return (
                      <td key={month} className="p-1.5 text-center font-bold text-gray-900 bg-gray-50">
                        {colTotal}
                      </td>
                    )
                  })}
                  <td className="p-1.5 text-center font-bold text-gray-900 bg-gray-200">
                    {heatmapIncidents.filter(i => i.location && i.location !== 'Not specified').length}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-2 mt-2 text-xs">
            <span className="text-gray-500">Low</span>
            <div
              className="w-24 h-3"
              style={{
                background: 'linear-gradient(to right, #ffffff, #ffffc8, #ffff32, #ffa500, #c81e1e)'
              }}
            ></div>
            <span className="text-gray-500">High</span>
          </div>

        </div>
      )}
      </div>
      {/* End of dashboardContentRef wrapper */}

      {/* All Records Section - Collapsible */}
      <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
        <button
          onClick={() => setShowAllRecords(!showAllRecords)}
          className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Database size={18} className="text-gray-600" />
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center">
              All Records
              <InfoTooltip text="Complete list of all observations matching current filters. Search, sort, and click any row to view full details." />
            </h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {filteredIncidents.length} records
            </span>
          </div>
          {showAllRecords ? (
            <ChevronUp size={18} className="text-gray-500" />
          ) : (
            <ChevronDown size={18} className="text-gray-500" />
          )}
        </button>

        {showAllRecords && (
          <div className="border-t border-gray-200 p-3">
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

      {/* Drill-Down Modal for Hazards & Observers */}
      <DrillDownModal
        isOpen={drillDown.modalOpen && (drillDown.chart === 'hazards' || drillDown.chart === 'observers')}
        onClose={closeDrillDownModal}
        title={
          drillDown.level === 3 && drillDown.period
            ? `${drillDown.filter} - ${format(parseISO(drillDown.period + '-01'), 'MMMM yyyy')}`
            : `${drillDown.filter} - Monthly Breakdown`
        }
        data={drillDown.level === 3 ? drillDownData : monthlyBreakdown}
        type={drillDown.level === 3 ? 'records' : 'monthly'}
        onDrillDown={handleMonthSelect}
        onBack={handleDrillDownBack}
        canGoBack={drillDown.level === 3}
        breadcrumb={[
          drillDown.chart === 'hazards' ? 'Top Hazards' : 'Top Observers',
          drillDown.filter,
          ...(drillDown.level === 3 && drillDown.period ? [format(parseISO(drillDown.period + '-01'), 'MMM yyyy')] : [])
        ].filter(Boolean)}
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
      />
    </div>
  )
}

export default Dashboard
