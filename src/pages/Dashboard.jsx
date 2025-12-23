import React, { useMemo, useState, useRef, useEffect } from 'react'
import {
  FileText,
  Upload,
  CheckCircle,
  CalendarClock,
  Calendar,
  ThumbsUp,
} from 'lucide-react'
import { useData } from '../context/DataContext'
import KPICard from '../components/dashboard/KPICard'
import IncidentTrendChart from '../components/dashboard/IncidentTrendChart'
import IncidentPyramid from '../components/dashboard/IncidentPyramid'
import FilterBar from '../components/common/FilterBar'
import DataTable from '../components/common/DataTable'
import EmptyState from '../components/dashboard/EmptyState'
import ImportWarnings from '../components/import/ImportWarnings'
import QuickImportModal from '../components/import/QuickImportModal'
import { INCIDENT_TYPES } from '../utils/constants'
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

const Dashboard = () => {
  const { projects, incidents, isLoading, importWarnings, showOpenClosed } = useData()

  // Import modal state
  const [showImportModal, setShowImportModal] = useState(false)

  // "This Month" quick filter
  const [thisMonthActive, setThisMonthActive] = useState(false)

  // Filter state
  const [filters, setFilters] = useState({
    company: '',
    dateFrom: '',
    dateTo: ''
  })

  // Drill-down state with 3 levels
  const [drillDown, setDrillDown] = useState({
    chart: null,
    filter: null,
    level: 1,
    period: null,
  })

  // Heatmap cell click state
  const [heatmapDrillDown, setHeatmapDrillDown] = useState({
    hazard: null,
    month: null,
  })

  // Heatmap scroll ref
  const heatmapScrollRef = useRef(null)

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
    setDrillDown({ chart: null, filter: null, level: 1, period: null })
    setHeatmapDrillDown({ hazard: null, month: null })
  }

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setThisMonthActive(false) // Turn off "This Month" when manual filter changes
    setDrillDown({ chart: null, filter: null, level: 1, period: null })
    setHeatmapDrillDown({ hazard: null, month: null })
  }

  const clearFilters = () => {
    setFilters({ company: '', dateFrom: '', dateTo: '' })
    setThisMonthActive(false)
    setDrillDown({ chart: null, filter: null, level: 1, period: null })
    setHeatmapDrillDown({ hazard: null, month: null })
  }

  // Handle heatmap cell click
  const handleHeatmapCellClick = (hazard, month, value) => {
    if (value === 0) return

    if (heatmapDrillDown.hazard === hazard && heatmapDrillDown.month === month) {
      setHeatmapDrillDown({ hazard: null, month: null })
    } else {
      setHeatmapDrillDown({ hazard, month })
    }
  }

  const closeHeatmapDrillDown = () => {
    setHeatmapDrillDown({ hazard: null, month: null })
  }

  // Handle drill-down - 3 levels
  const handleDrillDown = (chart, filter) => {
    if (drillDown.chart === chart && drillDown.filter === filter && drillDown.level >= 2) {
      setDrillDown({ chart: null, filter: null, level: 1, period: null })
    } else {
      setDrillDown({ chart, filter, level: 2, period: null })
    }
  }

  const handleDrillDownBack = () => {
    if (drillDown.level === 3) {
      setDrillDown(prev => ({ ...prev, level: 2, period: null }))
    } else {
      setDrillDown({ chart: null, filter: null, level: 1, period: null })
    }
  }

  const handleMonthSelect = (period) => {
    setDrillDown(prev => ({ ...prev, level: 3, period }))
  }

  // Get unique companies from incidents
  const uniqueCompanies = useMemo(() => {
    const companies = [...new Set(incidents.map(i => i.company).filter(Boolean))]
    return companies.sort().map(company => ({ value: company, label: company }))
  }, [incidents])

  // Filter configuration
  const filterConfig = [
    {
      key: 'company',
      type: 'select',
      label: 'Company/Site',
      placeholder: 'All Companies/Sites',
      options: uniqueCompanies
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

  // Filtered incidents based on company and date (for KPIs, charts, Top Hazards, Top Observers)
  const filteredIncidents = useMemo(() => {
    let result = [...incidents]

    if (filters.company) {
      result = result.filter(i => i.company === filters.company)
    }

    if (filters.dateFrom) {
      result = result.filter(i => i.date >= filters.dateFrom)
    }
    if (filters.dateTo) {
      result = result.filter(i => i.date <= filters.dateTo)
    }

    return recategorizeBlankHazards(result)
  }, [incidents, filters])

  // Heatmap uses ALL incidents (not filtered by "This Month")
  // Only company filter applies to heatmap
  const heatmapIncidents = useMemo(() => {
    let result = [...incidents]

    if (filters.company) {
      result = result.filter(i => i.company === filters.company)
    }

    return recategorizeBlankHazards(result)
  }, [incidents, filters.company])

  // Get filtered data based on drill-down selection
  const getFilteredBySelection = useMemo(() => {
    if (!drillDown.chart || !drillDown.filter) return []

    let filtered = filteredIncidents
    if (drillDown.chart === 'pyramid') {
      filtered = filteredIncidents.filter(i => i.type === drillDown.filter)
    } else if (drillDown.chart === 'observers') {
      filtered = filteredIncidents.filter(i => i.reportedBy === drillDown.filter)
    } else if (drillDown.chart === 'hazards') {
      const normalizedFilter = normalizeHazard(drillDown.filter)
      filtered = filteredIncidents.filter(i => normalizeHazard(i.location) === normalizedFilter)
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
            className="px-1.5 py-0.5 text-xs rounded font-medium"
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
    { key: 'company', header: 'Company/Site', accessor: (row) => row.company || '-' },
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
    const types = ['near-miss', 'unsafe-act', 'unsafe-condition', 'positive']

    types.forEach(type => {
      result[type] = { open: 0, closed: 0 }
    })

    filteredIncidents.forEach(incident => {
      if (result[incident.type]) {
        if (incident.actionStatus === 'closed') {
          result[incident.type].closed++
        } else {
          result[incident.type].open++
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

  // Top Hazards data
  const topHazards = useMemo(() => {
    const counts = {}
    filteredIncidents.forEach(incident => {
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
      {/* Import Warnings - Embedded (not dismissable) */}
      {importWarnings && (importWarnings.dateIssues?.length > 0 || importWarnings.hazardIssues?.length > 0) && (
        <ImportWarnings warnings={importWarnings} onDismiss={null} />
      )}

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
      </div>

      {/* Quick Import Modal */}
      <QuickImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-3">
        <KPICard
          title="Total Observations"
          value={filteredIncidents.length}
          subtitle={thisMonthActive ? 'This month' : 'All records'}
          icon={FileText}
          color="primary"
        />
        <KPICard
          title="Close Out Rate"
          value={`${closeOutPercentage}%`}
          subtitle={`${filteredIncidents.filter(i => i.actionStatus === 'closed').length} of ${filteredIncidents.length} closed`}
          icon={CheckCircle}
          color={closeOutPercentage >= 80 ? 'success' : closeOutPercentage >= 50 ? 'warning' : 'danger'}
        />
        <KPICard
          title="Positive Rate"
          value={`${positivePercentage}%`}
          subtitle={`${positiveCount} of ${filteredIncidents.length} positive`}
          icon={ThumbsUp}
          color={positivePercentage >= 30 ? 'success' : positivePercentage >= 15 ? 'warning' : 'info'}
        />
        <KPICard
          title="Open > 1 Month"
          value={openMoreThanMonth}
          subtitle="Overdue actions"
          icon={CalendarClock}
          color={openMoreThanMonth > 10 ? 'danger' : openMoreThanMonth > 5 ? 'warning' : 'info'}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <IncidentPyramid
            data={incidentCounts}
            pyramidData={pyramidData}
            showOpenClosed={showOpenClosed}
            onTypeClick={(type) => handleDrillDown('pyramid', type)}
            activeType={drillDown.chart === 'pyramid' ? drillDown.filter : null}
          />
          {/* Level 2: Monthly Breakdown */}
          {drillDown.chart === 'pyramid' && drillDown.level === 2 && monthlyBreakdown.length > 0 && (
            <div className="mt-2 bg-white rounded-lg border border-gray-200 p-3">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-semibold text-gray-800 uppercase">
                  {drillDown.filter} - Monthly Breakdown
                </h4>
                <button onClick={handleDrillDownBack} className="text-xs text-blue-600 hover:text-blue-800">
                  Close
                </button>
              </div>
              <div className="space-y-1">
                {monthlyBreakdown.map(month => {
                  const maxCount = Math.max(...monthlyBreakdown.map(m => m.count))
                  return (
                    <div
                      key={month.period}
                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                      onClick={() => handleMonthSelect(month.period)}
                    >
                      <span className="text-xs w-16 text-gray-600">{month.label}</span>
                      <div className="flex-1 h-4 bg-gray-100 rounded overflow-hidden">
                        <div className="h-full bg-blue-500 rounded" style={{ width: `${(month.count / maxCount) * 100}%` }} />
                      </div>
                      <span className="text-xs font-bold w-8 text-right text-gray-900">{month.count}</span>
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-gray-400 text-center mt-2">Click a month to view details</p>
            </div>
          )}
          {/* Level 3: Data Table */}
          {drillDown.chart === 'pyramid' && drillDown.level === 3 && drillDownData.length > 0 && (
            <div className="mt-2 bg-white rounded-lg border border-gray-200 p-3">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-semibold text-gray-800 uppercase">
                  {drillDown.filter} - {drillDown.period ? format(parseISO(drillDown.period + '-01'), 'MMMM yyyy') : ''}
                </h4>
                <button onClick={handleDrillDownBack} className="text-xs text-blue-600 hover:text-blue-800">
                  Back to Monthly
                </button>
              </div>
              <DataTable data={drillDownData} columns={incidentColumns} searchable={true} pageSize={5} emptyMessage="No matching records" />
            </div>
          )}
        </div>
        <IncidentTrendChart data={incidentTrend} />
      </div>

      {/* Top Hazards + Observers */}
      <div className="grid grid-cols-2 gap-3">
        {/* Top Hazards */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h3 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
            Top Significant Hazards
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
                    className={`relative cursor-pointer hover:bg-gray-50 rounded ${isActive ? 'ring-2 ring-gray-800' : ''}`}
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
                      <div className="absolute top-0 left-0 h-full flex rounded overflow-hidden" style={{ width: `${totalWidth}%`, zIndex: 0 }}>
                        {hazard.open > 0 && <div className="h-full bg-red-300" style={{ width: `${openPercent}%` }} title={`Open: ${hazard.open}`} />}
                        {hazard.closed > 0 && <div className="h-full bg-green-300" style={{ width: `${closedPercent}%` }} title={`Closed: ${hazard.closed}`} />}
                      </div>
                    ) : (
                      <div className="absolute top-0 left-0 h-full bg-red-100 rounded" style={{ width: `${totalWidth}%`, zIndex: 0 }} />
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center py-4">No hazard data available</p>
          )}
          {/* Hazard Drill-down */}
          {drillDown.chart === 'hazards' && drillDown.level === 2 && monthlyBreakdown.length > 0 && (
            <div className="mt-2 border-t border-gray-200 pt-2">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-semibold text-gray-700">{drillDown.filter} - Monthly</h4>
                <button onClick={handleDrillDownBack} className="text-xs text-blue-600 hover:text-blue-800">Close</button>
              </div>
              <div className="space-y-1">
                {monthlyBreakdown.map(month => {
                  const maxCount = Math.max(...monthlyBreakdown.map(m => m.count))
                  return (
                    <div key={month.period} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded" onClick={() => handleMonthSelect(month.period)}>
                      <span className="text-xs w-16 text-gray-600">{month.label}</span>
                      <div className="flex-1 h-3 bg-gray-100 rounded overflow-hidden">
                        <div className="h-full bg-red-400 rounded" style={{ width: `${(month.count / maxCount) * 100}%` }} />
                      </div>
                      <span className="text-xs font-bold w-6 text-right">{month.count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          {drillDown.chart === 'hazards' && drillDown.level === 3 && drillDownData.length > 0 && (
            <div className="mt-2 border-t border-gray-200 pt-2">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-semibold text-gray-700">{drillDown.period ? format(parseISO(drillDown.period + '-01'), 'MMM yyyy') : ''}</h4>
                <button onClick={handleDrillDownBack} className="text-xs text-blue-600 hover:text-blue-800">Back</button>
              </div>
              <DataTable data={drillDownData} columns={incidentColumns} searchable={true} pageSize={5} emptyMessage="No matching records" />
            </div>
          )}
        </div>

        {/* Top Observers */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h3 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
            Top Observers
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
                    className={`relative cursor-pointer hover:bg-gray-50 rounded ${isActive ? 'ring-2 ring-gray-800' : ''}`}
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
                      <div className="absolute top-0 left-0 h-full flex rounded overflow-hidden" style={{ width: `${totalWidth}%`, zIndex: 0 }}>
                        {observer.open > 0 && <div className="h-full bg-red-300" style={{ width: `${openPercent}%` }} title={`Open: ${observer.open}`} />}
                        {observer.closed > 0 && <div className="h-full bg-green-300" style={{ width: `${closedPercent}%` }} title={`Closed: ${observer.closed}`} />}
                      </div>
                    ) : (
                      <div className="absolute top-0 left-0 h-full bg-blue-100 rounded" style={{ width: `${totalWidth}%`, zIndex: 0 }} />
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center py-4">No observer data available</p>
          )}
          {/* Observer Drill-down */}
          {drillDown.chart === 'observers' && drillDown.level === 2 && monthlyBreakdown.length > 0 && (
            <div className="mt-2 border-t border-gray-200 pt-2">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-semibold text-gray-700">{drillDown.filter} - Monthly</h4>
                <button onClick={handleDrillDownBack} className="text-xs text-blue-600 hover:text-blue-800">Close</button>
              </div>
              <div className="space-y-1">
                {monthlyBreakdown.map(month => {
                  const maxCount = Math.max(...monthlyBreakdown.map(m => m.count))
                  return (
                    <div key={month.period} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded" onClick={() => handleMonthSelect(month.period)}>
                      <span className="text-xs w-16 text-gray-600">{month.label}</span>
                      <div className="flex-1 h-3 bg-gray-100 rounded overflow-hidden">
                        <div className="h-full bg-blue-400 rounded" style={{ width: `${(month.count / maxCount) * 100}%` }} />
                      </div>
                      <span className="text-xs font-bold w-6 text-right">{month.count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          {drillDown.chart === 'observers' && drillDown.level === 3 && drillDownData.length > 0 && (
            <div className="mt-2 border-t border-gray-200 pt-2">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-semibold text-gray-700">{drillDown.period ? format(parseISO(drillDown.period + '-01'), 'MMM yyyy') : ''}</h4>
                <button onClick={handleDrillDownBack} className="text-xs text-blue-600 hover:text-blue-800">Back</button>
              </div>
              <DataTable data={drillDownData} columns={incidentColumns} searchable={true} pageSize={5} emptyMessage="No matching records" />
            </div>
          )}
        </div>
      </div>

      {/* Hazards Heatmap - Scrollable (max 12 months visible) */}
      {hazardsHeatmap.hazards.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Hazards Heatmap (by Month)
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
              className="w-24 h-3 rounded"
              style={{
                background: 'linear-gradient(to right, #ffffff, #ffffc8, #ffff32, #ffa500, #c81e1e)'
              }}
            ></div>
            <span className="text-gray-500">High</span>
          </div>

          {/* Heatmap Drill-Down Table */}
          {heatmapDrillDown.hazard && heatmapDrillDown.month && heatmapDrillDownData.length > 0 && (
            <div className="mt-3 border-t border-gray-200 pt-3">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-semibold text-gray-800">
                  {heatmapDrillDown.hazard} - {format(parseISO(heatmapDrillDown.month + '-01'), 'MMMM yyyy')}
                  <span className="ml-2 text-xs font-normal text-gray-500">
                    ({heatmapDrillDownData.length} observation{heatmapDrillDownData.length !== 1 ? 's' : ''})
                  </span>
                </h4>
                <button onClick={closeHeatmapDrillDown} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                  Close
                </button>
              </div>
              <DataTable
                data={heatmapDrillDownData}
                columns={incidentColumns}
                searchable={true}
                pageSize={10}
                emptyMessage="No observations found"
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Dashboard
