import React, { useMemo, useState } from 'react'
import {
  BarChart3,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Users,
  FileText,
  Calendar,
  Building2,
  Download,
  ChevronDown,
  ChevronUp,
  Info,
  Upload,
  Tag,
  Eye,
  Brain,
  Target,
  Zap,
  Type,
  Copy
} from 'lucide-react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import FilterBar from '../components/common/FilterBar'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell,
  ReferenceLine
} from 'recharts'
import { useData } from '../context/DataContext'
import {
  calculateQualityScore,
  getCategorizationMetrics,
  getDescriptionMetrics,
  getNearMissMetrics,
  getReporterMetrics,
  getContractorMetrics,
  getCoverageMetrics,
  getQualityTrend,
  getDuplicateDescriptions,
  getOtherHazardAnalysis,
  getReporterDeepDive,
  extractHour,
  getImportClassificationMetrics,
  getMonthlyQualityBreakdown,
  getMisclassificationAnalysis,
  getAutoClassificationSummary,
  getBeforeAfterCategorizationMetrics,
  getUnclassifiableRecords
} from '../utils/dataQualityCalculations'
import { detectMisspellings } from '../utils/spellChecker'
import ReporterModal from '../components/common/ReporterModal'
import DrillDownModal from '../components/common/DrillDownModal'
import QuickImportModal from '../components/import/QuickImportModal'

// Status color mapping
const getStatusColor = (status) => {
  switch (status) {
    case 'good': return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' }
    case 'warning': return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' }
    case 'poor': return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' }
    default: return { bg: 'bg-surface-100', text: 'text-surface-700', border: 'border-surface-300' }
  }
}

const getStatusIcon = (status) => {
  switch (status) {
    case 'good': return <CheckCircle size={16} className="text-green-600" />
    case 'warning': return <AlertTriangle size={16} className="text-yellow-600" />
    case 'poor': return <XCircle size={16} className="text-red-600" />
    default: return null
  }
}

// Info Tooltip Component - Shows explanation on hover
const InfoTooltip = ({ text }) => (
  <div className="group relative inline-flex items-center ml-1.5">
    <Info size={14} className="text-surface-400 cursor-help hover:text-surface-600 transition-colors" />
    <div className="hidden group-hover:block absolute z-50 w-64 p-2.5 bg-surface-900 text-white text-xs rounded-lg shadow-xl left-5 top-0 leading-relaxed">
      <div className="absolute -left-1.5 top-1.5 w-3 h-3 bg-surface-900 transform rotate-45"></div>
      <span className="relative">{text}</span>
    </div>
  </div>
)

// Quality Score Gauge component
const QualityScoreGauge = ({ score }) => {
  const getScoreColor = () => {
    if (score >= 80) return '#22c55e' // green
    if (score >= 60) return '#eab308' // yellow
    return '#ef4444' // red
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="40"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          <circle
            cx="48"
            cy="48"
            r="40"
            fill="none"
            stroke={getScoreColor()}
            strokeWidth="8"
            strokeDasharray={`${(score / 100) * 251.2} 251.2`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-surface-900">{score}</span>
        </div>
      </div>
      <div>
        <div className="flex items-center text-sm font-medium text-surface-500">
          Data Quality Score
          <InfoTooltip text="Overall rating (0-100) based on: Categorization (25%), Description quality (25%), Near miss rate (20%), Coverage (20%), and Reporter engagement (10%)." />
        </div>
        <div className="text-xs text-surface-400">out of 100</div>
      </div>
    </div>
  )
}

// KPI Mini Card
const KPIMiniCard = ({ title, value, unit, status, icon: Icon, subtitle, onClick, info }) => {
  const colors = getStatusColor(status)
  return (
    <div
      className={`bg-white border ${colors.border} rounded-lg p-3 shadow-soft ${onClick ? 'cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all' : ''}`}
      onClick={onClick}
      title={onClick ? 'Click to view details' : undefined}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center">
          <span className="text-xs font-medium text-surface-500 uppercase">{title}</span>
          {info && <InfoTooltip text={info} />}
        </div>
        <Icon size={14} className="text-surface-400" />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold text-surface-900">{value}{unit}</span>
        {getStatusIcon(status)}
      </div>
      {subtitle && <div className="text-xs text-surface-400 mt-1">{subtitle}</div>}
    </div>
  )
}

const DataQuality = () => {
  const { incidents, isLoading, importWarnings } = useData()
  const [expandedSection, setExpandedSection] = useState(null)
  const [reporterSort, setReporterSort] = useState('total')
  const [contractorSort, setContractorSort] = useState('totalObs')
  const [selectedReporter, setSelectedReporter] = useState(null)
  const [showDuplicates, setShowDuplicates] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showClassificationReview, setShowClassificationReview] = useState(false)
  const [classificationTab, setClassificationTab] = useState('summary') // 'summary' | 'detailed'
  const [showMisclassification, setShowMisclassification] = useState(false)
  const [misclassificationTab, setMisclassificationTab] = useState('detailed') // 'detailed' | 'byCurrent' | 'bySuggested'
  const [showUnclassifiable, setShowUnclassifiable] = useState(false)
  const [showSpellingIssues, setShowSpellingIssues] = useState(false)

  // Spell checker is always ready (hybrid approach - no async loading)
  const spellCheckerReady = true
  const spellCheckerLoading = false

  // Drill-down state
  const [drillDown, setDrillDown] = useState({
    isOpen: false,
    type: null,        // 'monthly' | 'records'
    title: '',
    data: [],
    breadcrumb: [],
    level: 1,          // 1 = summary, 2 = records
    context: {}        // Extra context (metric name, day name, etc.)
  })

  // Filter state - same as Dashboard
  const [thisMonthActive, setThisMonthActive] = useState(false)
  const [filters, setFilters] = useState({
    contractor: '',
    site: '',
    dateFrom: '',
    dateTo: ''
  })

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
      setFilters(prev => ({ ...prev, dateFrom: '', dateTo: '' }))
      setThisMonthActive(false)
    } else {
      const { start, end } = getThisMonthRange()
      setFilters(prev => ({ ...prev, dateFrom: start, dateTo: end }))
      setThisMonthActive(true)
    }
  }

  // Handle filter changes - reset site when contractor changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value }
      if (key === 'contractor') {
        newFilters.site = ''
      }
      return newFilters
    })
    setThisMonthActive(false)
  }

  const clearFilters = () => {
    setFilters({ contractor: '', site: '', dateFrom: '', dateTo: '' })
    setThisMonthActive(false)
  }

  // Get unique contractors from incidents
  const uniqueContractors = useMemo(() => {
    const contractors = [...new Set(incidents.map(i => i.contractor).filter(Boolean))]
    return contractors.sort().map(contractor => ({ value: contractor, label: contractor }))
  }, [incidents])

  // Get sites filtered by selected contractor
  const siteOptions = useMemo(() => {
    let relevantIncidents = incidents
    if (filters.contractor) {
      relevantIncidents = incidents.filter(i => i.contractor === filters.contractor)
    }
    const sites = [...new Set(relevantIncidents.map(i => i.site).filter(Boolean))]
    return sites.sort().map(site => ({ value: site, label: site }))
  }, [incidents, filters.contractor])

  // Filter configuration
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

  // Filtered incidents based on filters
  const filteredIncidents = useMemo(() => {
    let result = [...incidents]

    if (filters.contractor) {
      result = result.filter(i => i.contractor === filters.contractor)
    }
    if (filters.site) {
      result = result.filter(i => i.site === filters.site)
    }
    if (filters.dateFrom) {
      result = result.filter(i => i.date >= filters.dateFrom)
    }
    if (filters.dateTo) {
      result = result.filter(i => i.date <= filters.dateTo)
    }

    return result
  }, [incidents, filters])

  // Calculate all metrics using filtered incidents
  const qualityData = useMemo(() => {
    if (filteredIncidents.length === 0) return null

    const quality = calculateQualityScore(filteredIncidents)
    const categorization = getCategorizationMetrics(filteredIncidents)
    const description = getDescriptionMetrics(filteredIncidents)
    const nearMiss = getNearMissMetrics(filteredIncidents)
    const reporters = getReporterMetrics(filteredIncidents)
    const contractors = getContractorMetrics(filteredIncidents)
    const coverage = getCoverageMetrics(filteredIncidents)
    const trend = getQualityTrend(filteredIncidents, 12)
    const alerts = [] // Coverage alerts removed - charts moved to Dashboard
    const duplicates = getDuplicateDescriptions(filteredIncidents)
    // Spelling issues - instant hybrid spell checker (no loading required)
    const spellingIssues = detectMisspellings(filteredIncidents)
    const otherHazards = getOtherHazardAnalysis(filteredIncidents)

    // Auto-Classification Summary (shows what WAS auto-classified)
    const autoClassification = getAutoClassificationSummary(filteredIncidents)

    // Before/After Categorization Comparison
    const categorizationComparison = getBeforeAfterCategorizationMetrics(filteredIncidents)

    // Unclassifiable Records (records needing manual review)
    const unclassifiableRecords = getUnclassifiableRecords(filteredIncidents)

    return {
      quality,
      categorization,
      description,
      nearMiss,
      reporters,
      contractors,
      coverage,
      trend,
      alerts,
      duplicates,
      spellingIssues,
      otherHazards,
      autoClassification,
      categorizationComparison,
      unclassifiableRecords
    }
  }, [filteredIncidents])

  // Sort reporters
  const sortedReporters = useMemo(() => {
    if (!qualityData) return []
    return [...qualityData.reporters].sort((a, b) => {
      if (reporterSort === 'total') return b.total - a.total
      if (reporterSort === 'nearMiss') return b.nearMiss - a.nearMiss
      if (reporterSort === 'quality') return parseFloat(b.qualityRate) - parseFloat(a.qualityRate)
      return 0
    }).slice(0, 15)
  }, [qualityData, reporterSort])

  // Sort contractors
  const sortedContractors = useMemo(() => {
    if (!qualityData) return []
    return [...qualityData.contractors].sort((a, b) => {
      if (contractorSort === 'totalObs') return b.totalObs - a.totalObs
      if (contractorSort === 'qualityScore') return b.qualityScore - a.qualityScore
      if (contractorSort === 'coverage') return b.activeDays - a.activeDays
      return 0
    }).slice(0, 10)
  }, [qualityData, contractorSort])

  // Reporter deep dive data
  const reporterDeepDive = useMemo(() => {
    if (!selectedReporter) return null
    return getReporterDeepDive(filteredIncidents, selectedReporter, incidents)
  }, [selectedReporter, filteredIncidents, incidents])

  // Import classification review data
  const classificationReviewData = useMemo(() => {
    if (!importWarnings?.hazardIssues || importWarnings.hazardIssues.length === 0) {
      return null
    }
    return getImportClassificationMetrics(importWarnings.hazardIssues, incidents)
  }, [importWarnings, incidents])

  // Misclassification analysis - detects records with wrong categories
  const misclassificationData = useMemo(() => {
    if (filteredIncidents.length === 0) return null
    return getMisclassificationAnalysis(filteredIncidents)
  }, [filteredIncidents])

  // Handle reporter click
  const handleReporterClick = (reporterName) => {
    setSelectedReporter(reporterName)
  }

  // Drill-down handlers
  const openDrillDown = (title, records, breadcrumb = [], context = {}) => {
    setDrillDown({
      isOpen: true,
      type: 'records',
      title,
      data: records,
      breadcrumb,
      level: 2,
      context
    })
  }

  const closeDrillDown = () => {
    setDrillDown({
      isOpen: false,
      type: null,
      title: '',
      data: [],
      breadcrumb: [],
      level: 1,
      context: {}
    })
  }

  // Day of week drill-down
  const handleDayDrillDown = (dayData) => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const dayIndex = dayNames.findIndex(d => d.slice(0, 3) === dayData.day)
    const records = filteredIncidents.filter(inc => {
      if (!inc.date) return false
      const incidentDay = new Date(inc.date).getDay()
      return incidentDay === dayIndex
    })
    openDrillDown(
      `${dayNames[dayIndex]} Observations`,
      records,
      ['Data Quality', 'Day of Week', dayNames[dayIndex]],
      { day: dayNames[dayIndex], dayIndex }
    )
  }

  // Hour drill-down
  const handleHourDrillDown = (hourData) => {
    // hourData has hourNum (integer) and hour (formatted string like "09:00")
    const hourNum = hourData.hourNum
    const records = filteredIncidents.filter(inc => {
      // Use extractHour which checks eventTime and date fields - same as the chart calculation
      const incHour = extractHour(inc.eventTime, inc.date)
      return incHour === hourNum
    })
    const hourLabel = `${String(hourNum).padStart(2, '0')}:00 - ${String(hourNum).padStart(2, '0')}:59`
    openDrillDown(
      `${hourLabel} Observations`,
      records,
      ['Data Quality', 'Hour of Day', hourLabel],
      { hour: hourNum }
    )
  }

  // Contractor drill-down
  const handleContractorDrillDown = (contractor) => {
    const records = filteredIncidents.filter(inc => inc.contractor === contractor.name)
    openDrillDown(
      `${contractor.name} - All Observations`,
      records,
      ['Data Quality', 'Contractor', contractor.name],
      { contractor: contractor.name }
    )
  }

  // KPI drill-down
  const handleKPIDrillDown = (metric, title, filterFn) => {
    const records = filteredIncidents.filter(filterFn)
    openDrillDown(
      title,
      records,
      ['Data Quality', metric],
      { metric }
    )
  }

  // Categorization drill-down
  const handleCategorizationDrillDown = (category, count) => {
    let filterFn
    if (category === 'Proper') {
      filterFn = (inc) => inc.location && inc.location.trim() !== '' && inc.location.toLowerCase() !== 'other'
    } else if (category === 'Blank') {
      filterFn = (inc) => !inc.location || inc.location.trim() === ''
    } else {
      filterFn = (inc) => inc.location && inc.location.toLowerCase() === 'other'
    }
    const records = filteredIncidents.filter(filterFn)
    openDrillDown(
      `${category} Categorization - ${count} Records`,
      records,
      ['Data Quality', 'Categorization', category],
      { category }
    )
  }

  // Description quality drill-down
  const handleDescriptionDrillDown = (range, label) => {
    let filterFn
    if (range === 'veryShort') {
      filterFn = (inc) => {
        const words = (inc.description || '').trim().split(/\s+/).filter(Boolean).length
        return words <= 5
      }
    } else if (range === 'short') {
      filterFn = (inc) => {
        const words = (inc.description || '').trim().split(/\s+/).filter(Boolean).length
        return words >= 6 && words <= 15
      }
    } else if (range === 'good') {
      filterFn = (inc) => {
        const words = (inc.description || '').trim().split(/\s+/).filter(Boolean).length
        return words >= 16 && words <= 30
      }
    } else {
      filterFn = (inc) => {
        const words = (inc.description || '').trim().split(/\s+/).filter(Boolean).length
        return words > 30
      }
    }
    const records = filteredIncidents.filter(filterFn)
    openDrillDown(
      `Description Quality - ${label}`,
      records,
      ['Data Quality', 'Description', label],
      { range }
    )
  }

  // Duplicate group drill-down
  const handleDuplicateDrillDown = (group) => {
    openDrillDown(
      `Duplicate Group - ${group.count} Records`,
      group.incidents,
      ['Data Quality', 'Duplicates'],
      { description: group.description }
    )
  }

  // Spelling drill-down - show single incident with misspellings
  const handleSpellingDrillDown = (record) => {
    openDrillDown(
      `Spelling Issue - ${record.misspellings.length} misspelling${record.misspellings.length > 1 ? 's' : ''}`,
      [record.incident],
      ['Data Quality', 'Spelling'],
      { misspellings: record.misspellings }
    )
  }

  // Copy spelling report to clipboard
  const copySpellingReport = () => {
    if (!qualityData?.spellingIssues?.records) return

    // Group misspellings by word
    const misspellingCounts = {}
    qualityData.spellingIssues.records.forEach(record => {
      record.misspellings.forEach(m => {
        const key = `${m.misspelled} → ${m.correction}`
        misspellingCounts[key] = (misspellingCounts[key] || 0) + 1
      })
    })

    // Sort by frequency
    const sorted = Object.entries(misspellingCounts)
      .sort((a, b) => b[1] - a[1])

    // Generate report
    const lines = [
      '## SPELLING ISSUES REPORT',
      `Generated: ${new Date().toLocaleString()}`,
      `Total Records with Issues: ${qualityData.spellingIssues.count}`,
      `Percentage of Total: ${qualityData.spellingIssues.percentage}%`,
      '',
      '### Top Misspellings by Frequency',
      '',
      '| Misspelling | Correction | Count |',
      '|-------------|------------|-------|',
      ...sorted.slice(0, 50).map(([key, count]) => {
        const [misspelled, correction] = key.split(' → ')
        return `| ${misspelled} | ${correction} | ${count} |`
      }),
      '',
      '---',
      'Use this report to:',
      '1. Add false positives to SPELL_CHECK_WHITELIST in constants.js',
      '2. Add missing misspellings to COMMON_MISSPELLINGS in spellChecker.js',
    ]

    const report = lines.join('\n')
    navigator.clipboard.writeText(report).then(() => {
      alert('Spelling report copied to clipboard!')
    }).catch(err => {
      console.error('Failed to copy:', err)
      alert('Failed to copy report')
    })
  }

  // Other hazard drill-down - show single incident details
  const handleOtherHazardDrillDown = (suggestion) => {
    // Single suggestion = single incident
    openDrillDown(
      `Suggested: ${suggestion.suggestedHazard}`,
      [suggestion.incident], // Wrap in array for RecordsTable
      ['Data Quality', 'Other Hazard', suggestion.suggestedHazard],
      { suggestedHazard: suggestion.suggestedHazard, keywords: suggestion.keywords }
    )
  }

  // Other hazard drill-down - show all suggestions for a hazard category
  const handleOtherHazardCategoryDrillDown = (hazardName) => {
    const matchingSuggestions = otherHazards?.suggestions?.filter(s => s.suggestedHazard === hazardName) || []
    const records = matchingSuggestions.map(s => s.incident)
    openDrillDown(
      `${hazardName} - Reclassification Candidates`,
      records,
      ['Data Quality', 'Other Hazard', hazardName],
      { suggestedHazard: hazardName }
    )
  }

  // Classification review drill-down - show single incident details
  const handleClassificationDrillDown = (record) => {
    if (record.incident) {
      openDrillDown(
        `Auto-Classified: ${record.newCategory}`,
        [record.incident],
        ['Data Quality', 'Import Classification', record.newCategory],
        {
          originalValue: record.originalValue,
          triggeringKeywords: record.triggeringKeywords,
          confidence: record.confidence
        }
      )
    }
  }

  // Classification category drill-down - show all records for a category
  const handleClassificationCategoryDrillDown = (categoryData) => {
    const records = categoryData.records
      .map(r => r.incident)
      .filter(Boolean)
    openDrillDown(
      `Auto-Classified as: ${categoryData.category}`,
      records,
      ['Data Quality', 'Import Classification', categoryData.category],
      { category: categoryData.category }
    )
  }

  // Misclassification drill-down - show single record details
  const handleMisclassificationDrillDown = (record) => {
    if (record.incident) {
      openDrillDown(
        `Misclassified: ${record.currentCategory} → ${record.suggestedCategory}`,
        [record.incident],
        ['Data Quality', 'Misclassification', record.suggestedCategory],
        {
          currentCategory: record.currentCategory,
          suggestedCategory: record.suggestedCategory,
          triggeringKeywords: record.triggeringKeywords,
          confidence: record.confidence
        }
      )
    }
  }

  // Misclassification category drill-down - show all records for a category
  const handleMisclassificationCategoryDrillDown = (categoryData, type) => {
    const records = categoryData.records
      .map(r => r.incident)
      .filter(Boolean)
    const label = type === 'current'
      ? `Currently: ${categoryData.category}`
      : `Should be: ${categoryData.category}`
    openDrillDown(
      label,
      records,
      ['Data Quality', 'Misclassification', categoryData.category],
      { category: categoryData.category, type }
    )
  }

  // Unclassifiable records drill-down - show records by reason
  const handleUnclassifiableDrillDown = (reason) => {
    if (!qualityData?.unclassifiableRecords?.byReason?.[reason]) return

    const reasonData = qualityData.unclassifiableRecords.byReason[reason]
    const records = reasonData.records.map(r => r.incident).filter(Boolean)

    const reasonLabels = {
      noDescription: 'No Description',
      tooShort: 'Too Short',
      unrecognizedCategory: 'Unrecognized Category',
      lowConfidence: 'Low Confidence'
    }

    openDrillDown(
      `Unclassifiable - ${reasonLabels[reason]}`,
      records,
      ['Data Quality', 'Unclassifiable', reasonLabels[reason]],
      {
        reason,
        reasonLabel: reasonLabels[reason],
        reasonDescription: reasonData.description,
        count: reasonData.count
      }
    )
  }

  // Trend chart drill-down - show monthly quality breakdown
  const handleTrendDrillDown = (monthData) => {
    if (!monthData || !monthData.monthKey) return

    // Filter incidents for this month
    const monthIncidents = filteredIncidents.filter(inc => {
      if (!inc.date) return false
      return inc.date.substring(0, 7) === monthData.monthKey
    })

    if (monthIncidents.length === 0) return

    // Calculate days in month
    const [year, month] = monthData.monthKey.split('-').map(Number)
    const daysInMonth = new Date(year, month, 0).getDate()

    // Get detailed breakdown
    const breakdown = getMonthlyQualityBreakdown(monthIncidents, monthData.month, daysInMonth)

    if (breakdown) {
      setDrillDown({
        isOpen: true,
        type: 'monthly-breakdown',
        title: `${monthData.month} - Quality Metrics Breakdown`,
        data: breakdown,
        breadcrumb: ['Data Quality', 'Trend', monthData.month],
        level: 1,
        context: { monthKey: monthData.monthKey }
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (incidents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-surface-500">
        <BarChart3 size={48} className="mb-4 opacity-50" />
        <p>No data available. Import observations to see data quality metrics.</p>
      </div>
    )
  }

  // Check if filtered results are empty
  if (!qualityData) {
    return (
      <div className="space-y-4">
        {/* Filters Row - same layout as Dashboard */}
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
                : 'bg-white border border-surface-200 text-surface-700 hover:bg-surface-50'
            }`}
          >
            <Calendar size={16} />
            This Month
          </button>

          {/* Import Button */}
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-surface-800 text-white rounded-lg hover:bg-surface-700 transition-colors text-sm font-medium whitespace-nowrap"
          >
            <Upload size={16} />
            Import Data
          </button>
        </div>

        {/* Quick Import Modal */}
        <QuickImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
        />

        <div className="flex flex-col items-center justify-center h-64 text-surface-500">
          <BarChart3 size={48} className="mb-4 opacity-50" />
          <p>No observations match the current filters.</p>
        </div>
      </div>
    )
  }

  const { quality, categorization, description, nearMiss, reporters, contractors, coverage, trend, alerts, duplicates, spellingIssues, otherHazards, autoClassification, categorizationComparison, unclassifiableRecords } = qualityData

  // Pie chart colors
  const COLORS = ['#22c55e', '#94a3b8', '#f97316']

  return (
    <div className="space-y-4">
      {/* Filters Row - same layout as Dashboard */}
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
              : 'bg-white border border-surface-200 text-surface-700 hover:bg-surface-50'
          }`}
        >
          <Calendar size={16} />
          This Month
        </button>

        {/* Import Button */}
        <button
          onClick={() => setShowImportModal(true)}
          className="flex items-center gap-2 px-3 py-2 bg-surface-800 text-white rounded-lg hover:bg-surface-700 transition-colors text-sm font-medium whitespace-nowrap"
        >
          <Upload size={16} />
          Import Data
        </button>
      </div>

      {/* Quick Import Modal */}
      <QuickImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
      />

      {/* SECTION 1: Quality Score Banner */}
      <div className="bg-white border border-surface-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-surface-700 uppercase tracking-wide flex items-center gap-2">
            <BarChart3 size={16} />
            Data Quality Overview
          </h2>
          <span className="text-xs text-surface-400">{filteredIncidents.length} of {incidents.length} observations</span>
        </div>

        <div className="grid grid-cols-6 gap-4">
          {/* Quality Score Gauge */}
          <div className="col-span-1 flex items-center justify-center border-r border-surface-200">
            <QualityScoreGauge score={quality.score} />
          </div>

          {/* KPI Cards */}
          <div className="col-span-5 grid grid-cols-6 gap-2">
            <KPIMiniCard
              title="Categorization"
              value={categorization.properRate}
              unit="%"
              status={categorization.status}
              icon={FileText}
              subtitle={`${categorization.proper}/${categorization.total} proper`}
              info="Percentage of observations with a proper hazard category (not blank or 'Other')."
            />
            <KPIMiniCard
              title="Description"
              value={description.qualityRate}
              unit="%"
              status={description.status}
              icon={FileText}
              subtitle={`Avg ${description.avgWordCount} words`}
              info="Percentage of observations with detailed descriptions (more than 15 words)."
            />
            <KPIMiniCard
              title="Near Miss"
              value={nearMiss.rate}
              unit="%"
              status={nearMiss.status}
              icon={AlertTriangle}
              subtitle={`Target: 5%`}
              info="Percentage of non-positive observations that are near misses. Target: 5% indicates good hazard awareness."
            />
            <KPIMiniCard
              title="Coverage"
              value={coverage.rate}
              unit="%"
              status={coverage.status}
              icon={Calendar}
              subtitle={`${coverage.activeDays} active days`}
              info="Percentage of days in the period with at least one observation submitted."
            />
            <KPIMiniCard
              title="Reporters"
              value={quality.breakdown.reporters.active}
              unit={`/${quality.breakdown.reporters.total}`}
              status={quality.breakdown.reporters.active >= quality.breakdown.reporters.total * 0.7 ? 'good' : 'warning'}
              icon={Users}
              subtitle="with 5+ obs"
              info="Number of reporters with 5 or more observations, indicating consistent engagement."
            />
            <KPIMiniCard
              title="Data Integrity"
              value={Math.max(0, 100 - parseFloat(duplicates.duplicateRate) * 5).toFixed(0)}
              unit="%"
              status={quality.breakdown.dataIntegrity?.status || 'good'}
              icon={CheckCircle}
              subtitle={`${duplicates.totalDuplicates} duplicates (${duplicates.duplicateRate}%)`}
              info="Formula: 100 - (Duplicate Rate × 5). Example: 0% = 100%, 5% = 75%, 10% = 50%, 20%+ = 0%."
            />
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {alerts.map((alert, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                  alert.severity === 'warning' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                }`}
              >
                <AlertTriangle size={12} />
                {alert.message}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 1B: Quality Trend Chart */}
      {trend.length > 0 && (
        <div className="bg-white border border-surface-200 rounded-lg p-4">
          <h3 className="text-xs font-semibold text-surface-700 uppercase tracking-wide mb-3 flex items-center gap-2">
            <TrendingUp size={14} />
            Quality Score Trend (Last 12 Months)
            <InfoTooltip text="Monthly trend of overall data quality score. Click on any point to see that month's observations." />
          </h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} onClick={(data) => data?.activePayload?.[0]?.payload && handleTrendDrillDown(data.activePayload[0].payload)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ fontSize: 12 }}
                  formatter={(value) => [`${value}%`, 'Quality Score']}
                  labelFormatter={(label) => `${label} (click for details)`}
                />
                <ReferenceLine y={75} stroke="#3b82f6" strokeDasharray="5 5" strokeWidth={1} label={{ value: '75% target', position: 'right', fontSize: 10, fill: '#3b82f6' }} />
                <Line
                  type="monotone"
                  dataKey="qualityScore"
                  name="Quality Score"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4, style: { cursor: 'pointer' } }}
                  activeDot={{ r: 6, style: { cursor: 'pointer' } }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* SECTION 1C: Duplicate Detection & Spelling Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Duplicate Detection */}
        <div className="bg-white border border-surface-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-surface-700 uppercase tracking-wide flex items-center gap-2">
              <FileText size={14} />
              Duplicate Descriptions
              <InfoTooltip text="Identifies copy-paste descriptions indicating low-quality data entry. Same description used multiple times suggests reporters aren't providing unique observations." />
            </h3>
            {duplicates.totalGroups > 0 && (
              <button
                onClick={() => setShowDuplicates(!showDuplicates)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                {showDuplicates ? 'Hide' : 'View'} Details
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 mb-3">
            <div className={`text-2xl font-bold ${duplicates.totalGroups > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
              {duplicates.totalGroups}
            </div>
            <div className="text-sm text-surface-600">
              <div>duplicate groups found</div>
              <div className="text-xs text-surface-400">{duplicates.totalDuplicates} total duplicate entries ({duplicates.duplicateRate}%)</div>
            </div>
          </div>

          {showDuplicates && duplicates.duplicateGroups.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto mt-3 border-t border-surface-200 pt-3">
              {duplicates.duplicateGroups.slice(0, 10).map((group, idx) => (
                <div
                  key={idx}
                  className="bg-surface-50 rounded p-2 text-xs cursor-pointer hover:bg-surface-100 transition-colors"
                  onClick={() => handleDuplicateDrillDown(group)}
                  title="Click to view all records with this description"
                >
                  <div className="flex justify-between mb-1">
                    <span className={`font-medium ${group.isSameReporter ? 'text-red-600' : 'text-yellow-600'}`}>
                      Used {group.count}x {group.isSameReporter ? '(same reporter)' : `(${group.reporters.length} reporters)`}
                    </span>
                  </div>
                  <p className="text-surface-600 italic truncate" title={group.description}>
                    "{group.description}"
                  </p>
                </div>
              ))}
              {duplicates.duplicateGroups.length > 10 && (
                <div className="text-xs text-surface-400 text-center">
                  +{duplicates.duplicateGroups.length - 10} more groups
                </div>
              )}
            </div>
          )}

          {duplicates.totalGroups === 0 && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle size={16} />
              No duplicate descriptions detected
            </div>
          )}
        </div>

        {/* Spelling Issues */}
        <div className="bg-white border border-surface-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-surface-700 uppercase tracking-wide flex items-center gap-2">
              <Type size={14} className="text-orange-500" />
              Spelling Issues
              <InfoTooltip text="Uses Typo.js with full English dictionary to detect misspellings. Construction/safety technical terms are whitelisted to avoid false positives." />
            </h3>
            {spellCheckerReady && spellingIssues.count > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={copySpellingReport}
                  className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800"
                  title="Copy spelling report to clipboard"
                >
                  <Copy size={12} />
                  Copy Report
                </button>
                <button
                  onClick={() => setShowSpellingIssues(!showSpellingIssues)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  {showSpellingIssues ? 'Hide' : 'View'} Details
                </button>
              </div>
            )}
          </div>

          {/* Loading State */}
          {spellCheckerLoading && (
            <div className="flex items-center gap-2 text-blue-600 text-sm">
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              Loading spell checker dictionary...
            </div>
          )}

          {/* Ready State */}
          {spellCheckerReady && (
            <>
              <div className="flex items-center gap-4 mb-3">
                <div className={`text-2xl font-bold ${spellingIssues.count > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {spellingIssues.count}
                </div>
                <div className="text-sm text-surface-600">
                  <div>records with misspellings</div>
                  <div className="text-xs text-surface-400">{spellingIssues.percentage}% of total records</div>
                </div>
              </div>

              {showSpellingIssues && spellingIssues.records.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto mt-3 border-t border-surface-200 pt-3">
                  {spellingIssues.records.slice(0, 10).map((record, idx) => (
                    <div
                      key={idx}
                      className="bg-surface-50 rounded p-2 text-xs cursor-pointer hover:bg-surface-100 transition-colors"
                      onClick={() => handleSpellingDrillDown(record)}
                      title="Click to view record details"
                    >
                      <div className="flex justify-between mb-1">
                        <span className="font-medium text-orange-600">
                          {record.misspellings.map(m => `"${m.misspelled}" → "${m.correction}"`).join(', ')}
                        </span>
                      </div>
                      <p className="text-surface-600 italic truncate" title={record.description}>
                        "{record.description}"
                      </p>
                    </div>
                  ))}
                  {spellingIssues.records.length > 10 && (
                    <div className="text-xs text-surface-400 text-center">
                      +{spellingIssues.records.length - 10} more records
                    </div>
                  )}
                </div>
              )}

              {spellingIssues.count === 0 && (
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <CheckCircle size={16} />
                  No spelling issues detected
                </div>
              )}
            </>
          )}

          {/* Error State - spell checker failed to load */}
          {!spellCheckerLoading && !spellCheckerReady && (
            <div className="flex items-center gap-2 text-surface-400 text-sm">
              <AlertTriangle size={16} />
              Spell checker unavailable
            </div>
          )}
        </div>
      </div>

      {/* SECTION: Unclassifiable Records - Records Needing Manual Review */}
      {qualityData.unclassifiableRecords && qualityData.unclassifiableRecords.total > 0 && (
        <div className="bg-white border border-amber-300 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-surface-700 uppercase tracking-wide flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-600" />
              Unclassifiable Records
              <InfoTooltip text="Records that couldn't be properly classified due to missing/short descriptions, unrecognized categories, or low classification confidence. These require manual review." />
              <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                {qualityData.unclassifiableRecords.total}
              </span>
            </h3>
            <button
              onClick={() => setShowUnclassifiable(!showUnclassifiable)}
              className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-800"
            >
              {showUnclassifiable ? 'Hide' : 'View'} Details
              {showUnclassifiable ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-5 gap-2 mb-3">
            <div className="bg-amber-50 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-amber-700">{qualityData.unclassifiableRecords.total}</div>
              <div className="text-xs text-amber-600">Total</div>
            </div>
            <div
              className="bg-surface-50 rounded-lg p-2 text-center cursor-pointer hover:bg-surface-100 transition-colors"
              onClick={() => handleUnclassifiableDrillDown('noDescription')}
              title="Click to view records"
            >
              <div className="text-lg font-bold text-surface-700">{qualityData.unclassifiableRecords.byReason.noDescription.count}</div>
              <div className="text-xs text-surface-600">No Description</div>
            </div>
            <div
              className="bg-orange-50 rounded-lg p-2 text-center cursor-pointer hover:bg-orange-100 transition-colors"
              onClick={() => handleUnclassifiableDrillDown('tooShort')}
              title="Click to view records"
            >
              <div className="text-lg font-bold text-orange-700">{qualityData.unclassifiableRecords.byReason.tooShort.count}</div>
              <div className="text-xs text-orange-600">Too Short</div>
            </div>
            <div
              className="bg-purple-50 rounded-lg p-2 text-center cursor-pointer hover:bg-purple-100 transition-colors"
              onClick={() => handleUnclassifiableDrillDown('unrecognizedCategory')}
              title="Click to view records"
            >
              <div className="text-lg font-bold text-purple-700">{qualityData.unclassifiableRecords.byReason.unrecognizedCategory.count}</div>
              <div className="text-xs text-purple-600">Unrecognized</div>
            </div>
            <div
              className="bg-red-50 rounded-lg p-2 text-center cursor-pointer hover:bg-red-100 transition-colors"
              onClick={() => handleUnclassifiableDrillDown('lowConfidence')}
              title="Click to view records"
            >
              <div className="text-lg font-bold text-red-700">{qualityData.unclassifiableRecords.byReason.lowConfidence.count}</div>
              <div className="text-xs text-red-600">Low Confidence</div>
            </div>
          </div>

          {/* Expanded Details */}
          {showUnclassifiable && (
            <div className="space-y-3 mt-3 border-t border-surface-200 pt-3">
              {/* No Description */}
              {qualityData.unclassifiableRecords.byReason.noDescription.count > 0 && (
                <div
                  className="bg-surface-50 rounded-lg p-3 cursor-pointer hover:bg-surface-100 transition-colors"
                  onClick={() => handleUnclassifiableDrillDown('noDescription')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-surface-500"></div>
                      <span className="text-sm font-medium text-surface-700">No Description</span>
                    </div>
                    <span className="text-sm font-bold text-surface-700">{qualityData.unclassifiableRecords.byReason.noDescription.count}</span>
                  </div>
                  <p className="text-xs text-surface-500">Records with empty or blank description field - cannot verify classification</p>
                  <div className="mt-2 h-1.5 bg-surface-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-surface-500 rounded-full"
                      style={{ width: `${qualityData.unclassifiableRecords.byReason.noDescription.percentage}%` }}
                    />
                  </div>
                  <div className="text-right text-xs text-surface-400 mt-1">{qualityData.unclassifiableRecords.byReason.noDescription.percentage}% of records</div>
                </div>
              )}

              {/* Too Short */}
              {qualityData.unclassifiableRecords.byReason.tooShort.count > 0 && (
                <div
                  className="bg-orange-50 rounded-lg p-3 cursor-pointer hover:bg-orange-100 transition-colors"
                  onClick={() => handleUnclassifiableDrillDown('tooShort')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      <span className="text-sm font-medium text-orange-700">Too Short</span>
                    </div>
                    <span className="text-sm font-bold text-orange-700">{qualityData.unclassifiableRecords.byReason.tooShort.count}</span>
                  </div>
                  <p className="text-xs text-orange-600">Descriptions under 10 characters - not enough context for reliable classification</p>
                  <div className="mt-2 h-1.5 bg-orange-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full"
                      style={{ width: `${qualityData.unclassifiableRecords.byReason.tooShort.percentage}%` }}
                    />
                  </div>
                  <div className="text-right text-xs text-orange-400 mt-1">{qualityData.unclassifiableRecords.byReason.tooShort.percentage}% of records</div>
                </div>
              )}

              {/* Unrecognized Category */}
              {qualityData.unclassifiableRecords.byReason.unrecognizedCategory.count > 0 && (
                <div
                  className="bg-purple-50 rounded-lg p-3 cursor-pointer hover:bg-purple-100 transition-colors"
                  onClick={() => handleUnclassifiableDrillDown('unrecognizedCategory')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      <span className="text-sm font-medium text-purple-700">Unrecognized Category</span>
                    </div>
                    <span className="text-sm font-bold text-purple-700">{qualityData.unclassifiableRecords.byReason.unrecognizedCategory.count}</span>
                  </div>
                  <p className="text-xs text-purple-600">Original Excel category not in approved list - may be misspelled or custom</p>
                  <div className="mt-2 h-1.5 bg-purple-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${qualityData.unclassifiableRecords.byReason.unrecognizedCategory.percentage}%` }}
                    />
                  </div>
                  <div className="text-right text-xs text-purple-400 mt-1">{qualityData.unclassifiableRecords.byReason.unrecognizedCategory.percentage}% of records</div>
                </div>
              )}

              {/* Low Confidence */}
              {qualityData.unclassifiableRecords.byReason.lowConfidence.count > 0 && (
                <div
                  className="bg-red-50 rounded-lg p-3 cursor-pointer hover:bg-red-100 transition-colors"
                  onClick={() => handleUnclassifiableDrillDown('lowConfidence')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span className="text-sm font-medium text-red-700">Low Confidence</span>
                    </div>
                    <span className="text-sm font-bold text-red-700">{qualityData.unclassifiableRecords.byReason.lowConfidence.count}</span>
                  </div>
                  <p className="text-xs text-red-600">Auto-classified with less than 65% confidence - classification may be inaccurate</p>
                  <div className="mt-2 h-1.5 bg-red-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: `${qualityData.unclassifiableRecords.byReason.lowConfidence.percentage}%` }}
                    />
                  </div>
                  <div className="text-right text-xs text-red-400 mt-1">{qualityData.unclassifiableRecords.byReason.lowConfidence.percentage}% of records</div>
                </div>
              )}
            </div>
          )}

          {/* Summary Message */}
          <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-700">
              {qualityData.unclassifiableRecords.summary.message}
            </p>
          </div>
        </div>
      )}

      {/* SECTION: Potential Misclassifications */}
      {misclassificationData && misclassificationData.totalMisclassified > 0 && (
        <div className="bg-white border border-orange-300 rounded-lg p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-surface-700 uppercase tracking-wide flex items-center gap-2">
              <AlertTriangle size={14} className="text-orange-600" />
              Potential Misclassifications
              <InfoTooltip text="Records where the current hazard category doesn't match what the description suggests. These may need manual review and correction." />
              <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                {misclassificationData.totalMisclassified}
              </span>
            </h3>
            <button
              onClick={() => setShowMisclassification(!showMisclassification)}
              className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-800"
            >
              {showMisclassification ? 'Hide' : 'View'} Details
              {showMisclassification ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          {/* Summary Stats Row - always visible */}
          <div className="grid grid-cols-5 gap-3 mb-3">
            <div className="bg-orange-50 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-orange-700">{misclassificationData.totalMisclassified}</div>
              <div className="text-xs text-surface-500">Total Found</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-orange-700">{misclassificationData.percentageOfTotal}%</div>
              <div className="text-xs text-surface-500">% of Records</div>
            </div>
            <div className="bg-red-50 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-red-700">{misclassificationData.summary.majorHazardMismatches}</div>
              <div className="text-xs text-surface-500">Major Hazard</div>
            </div>
            <div className="bg-green-50 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-green-700">{misclassificationData.summary.highConfidence}</div>
              <div className="text-xs text-surface-500">High Confidence</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-yellow-700">{misclassificationData.summary.mediumConfidence}</div>
              <div className="text-xs text-surface-500">Medium Confidence</div>
            </div>
          </div>

          {/* Expanded Details */}
          {showMisclassification && (
            <>
              {/* Tabs */}
              <div className="flex gap-1 mb-3 border-b border-surface-200">
                <button
                  onClick={() => setMisclassificationTab('detailed')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-t transition-colors ${
                    misclassificationTab === 'detailed'
                      ? 'bg-orange-100 text-orange-700 border-b-2 border-orange-500'
                      : 'text-surface-500 hover:text-surface-700 hover:bg-surface-50'
                  }`}
                >
                  All Records ({misclassificationData.misclassifiedRecords.length})
                </button>
                <button
                  onClick={() => setMisclassificationTab('byCurrent')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-t transition-colors ${
                    misclassificationTab === 'byCurrent'
                      ? 'bg-orange-100 text-orange-700 border-b-2 border-orange-500'
                      : 'text-surface-500 hover:text-surface-700 hover:bg-surface-50'
                  }`}
                >
                  By Current Category ({misclassificationData.byCurrentCategory.length})
                </button>
                <button
                  onClick={() => setMisclassificationTab('bySuggested')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-t transition-colors ${
                    misclassificationTab === 'bySuggested'
                      ? 'bg-orange-100 text-orange-700 border-b-2 border-orange-500'
                      : 'text-surface-500 hover:text-surface-700 hover:bg-surface-50'
                  }`}
                >
                  By Suggested Category ({misclassificationData.bySuggestedCategory.length})
                </button>
              </div>

              {/* Tab Content - All Records */}
              {misclassificationTab === 'detailed' && (
                <div className="overflow-auto max-h-96">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-surface-50">
                      <tr>
                        <th className="text-left p-2 font-medium text-surface-600">Date</th>
                        <th className="text-left p-2 font-medium text-surface-600">Current</th>
                        <th className="text-left p-2 font-medium text-surface-600">Should Be</th>
                        <th className="text-left p-2 font-medium text-surface-600">Description</th>
                        <th className="text-left p-2 font-medium text-surface-600">Keywords</th>
                        <th className="text-center p-2 font-medium text-surface-600">View</th>
                      </tr>
                    </thead>
                    <tbody>
                      {misclassificationData.misclassifiedRecords.slice(0, 50).map((record, idx) => (
                        <tr
                          key={record.id || idx}
                          className={`${idx % 2 === 0 ? 'bg-white' : 'bg-surface-50'} hover:bg-orange-50 cursor-pointer`}
                          onClick={() => handleMisclassificationDrillDown(record)}
                        >
                          <td className="p-2 text-surface-600">{record.date?.substring(0, 10)}</td>
                          <td className="p-2">
                            <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs">
                              {record.currentCategory}
                            </span>
                          </td>
                          <td className="p-2">
                            <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                              {record.suggestedCategory}
                            </span>
                          </td>
                          <td className="p-2 truncate max-w-[200px]" title={record.description}>
                            {record.descriptionSnippet}
                          </td>
                          <td className="p-2">
                            <div className="flex flex-wrap gap-1">
                              {record.triggeringKeywords.slice(0, 2).map((kw, i) => (
                                <span key={i} className="px-1 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                                  {kw}
                                </span>
                              ))}
                              {record.triggeringKeywords.length > 2 && (
                                <span className="text-surface-400">+{record.triggeringKeywords.length - 2}</span>
                              )}
                            </div>
                          </td>
                          <td className="p-2 text-center">
                            <Eye size={14} className="text-orange-600 inline" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {misclassificationData.misclassifiedRecords.length > 50 && (
                    <div className="text-xs text-surface-400 mt-2 text-center">
                      Showing 50 of {misclassificationData.misclassifiedRecords.length} records
                    </div>
                  )}
                </div>
              )}

              {/* Tab Content - By Current Category */}
              {misclassificationTab === 'byCurrent' && (
                <div className="overflow-auto max-h-80">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-surface-50">
                      <tr>
                        <th className="text-left p-2 font-medium text-surface-600">Current Category (Wrong)</th>
                        <th className="text-right p-2 font-medium text-surface-600">Count</th>
                        <th className="text-center p-2 font-medium text-surface-600">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {misclassificationData.byCurrentCategory.map((cat, idx) => (
                        <tr
                          key={cat.category}
                          className={`${idx % 2 === 0 ? 'bg-white' : 'bg-surface-50'} hover:bg-orange-50 cursor-pointer`}
                          onClick={() => handleMisclassificationCategoryDrillDown(cat, 'current')}
                        >
                          <td className="p-2">
                            <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs">
                              {cat.category}
                            </span>
                          </td>
                          <td className="p-2 text-right font-medium">{cat.count}</td>
                          <td className="p-2 text-center">
                            <Eye size={14} className="text-orange-600 inline" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab Content - By Suggested Category */}
              {misclassificationTab === 'bySuggested' && (
                <div className="overflow-auto max-h-80">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-surface-50">
                      <tr>
                        <th className="text-left p-2 font-medium text-surface-600">Should Be Category (Correct)</th>
                        <th className="text-right p-2 font-medium text-surface-600">Count</th>
                        <th className="text-center p-2 font-medium text-surface-600">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {misclassificationData.bySuggestedCategory.map((cat, idx) => (
                        <tr
                          key={cat.category}
                          className={`${idx % 2 === 0 ? 'bg-white' : 'bg-surface-50'} hover:bg-orange-50 cursor-pointer`}
                          onClick={() => handleMisclassificationCategoryDrillDown(cat, 'suggested')}
                        >
                          <td className="p-2">
                            <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                              {cat.category}
                            </span>
                          </td>
                          <td className="p-2 text-right font-medium">{cat.count}</td>
                          <td className="p-2 text-center">
                            <Eye size={14} className="text-orange-600 inline" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* SECTION: Import Classification Review */}
      {classificationReviewData && (
        <div className="bg-white border border-blue-300 rounded-lg p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-surface-700 uppercase tracking-wide flex items-center gap-2">
              <Tag size={14} className="text-blue-600" />
              Import Classification Review
              <InfoTooltip text="Records automatically classified during import when the original hazard category was blank or generic ('Other'). Shows the keywords that triggered each classification." />
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                {classificationReviewData.totalAutoClassified}
              </span>
            </h3>
            <button
              onClick={() => setShowClassificationReview(!showClassificationReview)}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
            >
              {showClassificationReview ? 'Hide' : 'View'} Details
              {showClassificationReview ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          {/* Summary Stats Row - always visible */}
          <div className="grid grid-cols-5 gap-3 mb-3">
            <div className="bg-blue-50 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-blue-700">{classificationReviewData.totalAutoClassified}</div>
              <div className="text-xs text-surface-500">Auto-Classified</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-blue-700">{classificationReviewData.percentageOfImport}%</div>
              <div className="text-xs text-surface-500">% of Import</div>
            </div>
            <div className="bg-surface-50 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-surface-700">{classificationReviewData.summary.fromBlank}</div>
              <div className="text-xs text-surface-500">From Blank</div>
            </div>
            <div className="bg-surface-50 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-surface-700">{classificationReviewData.summary.fromOther}</div>
              <div className="text-xs text-surface-500">From Other</div>
            </div>
            <div className="bg-green-50 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-green-700">{classificationReviewData.summary.highConfidence}</div>
              <div className="text-xs text-surface-500">High Confidence</div>
            </div>
          </div>

          {/* Expanded Details */}
          {showClassificationReview && (
            <>
              {/* Tabs */}
              <div className="flex gap-1 mb-3 border-b border-surface-200">
                <button
                  onClick={() => setClassificationTab('summary')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-t transition-colors ${
                    classificationTab === 'summary'
                      ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500'
                      : 'text-surface-500 hover:text-surface-700 hover:bg-surface-50'
                  }`}
                >
                  By Category ({classificationReviewData.byCategory.length})
                </button>
                <button
                  onClick={() => setClassificationTab('detailed')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-t transition-colors ${
                    classificationTab === 'detailed'
                      ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500'
                      : 'text-surface-500 hover:text-surface-700 hover:bg-surface-50'
                  }`}
                >
                  Full Details ({classificationReviewData.detailedRecords.length})
                </button>
              </div>

              {/* Tab Content - By Category */}
              {classificationTab === 'summary' && (
                <div className="overflow-auto max-h-80">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-surface-50">
                      <tr>
                        <th className="text-left p-2 font-medium text-surface-600">Category</th>
                        <th className="text-right p-2 font-medium text-surface-600">Count</th>
                        <th className="text-right p-2 font-medium text-surface-600">%</th>
                        <th className="text-center p-2 font-medium text-surface-600">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classificationReviewData.byCategory.map((cat, idx) => (
                        <tr
                          key={cat.category}
                          className={`${idx % 2 === 0 ? 'bg-white' : 'bg-surface-50'} hover:bg-blue-50 cursor-pointer`}
                          onClick={() => handleClassificationCategoryDrillDown(cat)}
                        >
                          <td className="p-2">
                            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                              {cat.category}
                            </span>
                          </td>
                          <td className="p-2 text-right font-medium">{cat.count}</td>
                          <td className="p-2 text-right text-surface-500">{cat.percentage}%</td>
                          <td className="p-2 text-center">
                            <Eye size={14} className="text-blue-600 inline" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab Content - Full Details */}
              {classificationTab === 'detailed' && (
                <div className="overflow-auto max-h-96">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-surface-50">
                      <tr>
                        <th className="text-left p-2 font-medium text-surface-600">Row</th>
                        <th className="text-left p-2 font-medium text-surface-600">Event ID</th>
                        <th className="text-left p-2 font-medium text-surface-600">Original</th>
                        <th className="text-left p-2 font-medium text-surface-600">New Category</th>
                        <th className="text-left p-2 font-medium text-surface-600">Description</th>
                        <th className="text-left p-2 font-medium text-surface-600">Keywords</th>
                        <th className="text-left p-2 font-medium text-surface-600">Reporter</th>
                        <th className="text-center p-2 font-medium text-surface-600">View</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classificationReviewData.detailedRecords.slice(0, 50).map((record, idx) => (
                        <tr
                          key={record.eventId || idx}
                          className={`${idx % 2 === 0 ? 'bg-white' : 'bg-surface-50'} hover:bg-blue-50 cursor-pointer`}
                          onClick={() => handleClassificationDrillDown(record)}
                        >
                          <td className="p-2 text-surface-600">{record.row}</td>
                          <td className="p-2 text-surface-500 font-mono truncate max-w-[80px]" title={record.eventId}>
                            {record.eventId?.substring(0, 12)}...
                          </td>
                          <td className="p-2">
                            <span className="px-1.5 py-0.5 bg-surface-100 text-surface-600 rounded text-xs">
                              {record.originalValue}
                            </span>
                          </td>
                          <td className="p-2">
                            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                              {record.newCategory}
                            </span>
                          </td>
                          <td className="p-2 truncate max-w-[180px]" title={record.description}>
                            {record.descriptionSnippet}
                          </td>
                          <td className="p-2">
                            <div className="flex flex-wrap gap-1">
                              {record.triggeringKeywords.slice(0, 3).map((kw, i) => (
                                <span key={i} className="px-1 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                                  {kw}
                                </span>
                              ))}
                              {record.triggeringKeywords.length > 3 && (
                                <span className="text-surface-400">+{record.triggeringKeywords.length - 3}</span>
                              )}
                              {record.triggeringKeywords.length === 0 && (
                                <span className="text-surface-400 italic">auto-default</span>
                              )}
                            </div>
                          </td>
                          <td className="p-2 truncate max-w-[100px]" title={record.reportedBy}>
                            {record.reportedBy}
                          </td>
                          <td className="p-2 text-center">
                            <Eye size={14} className="text-blue-600 inline" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {classificationReviewData.detailedRecords.length > 50 && (
                    <div className="text-xs text-surface-400 mt-2 text-center">
                      Showing 50 of {classificationReviewData.detailedRecords.length} records
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* SECTION 2: Reporter & Contractor Analytics */}
      <div className="grid grid-cols-2 gap-4">
        {/* Reporter Performance */}
        <div className="bg-white border border-surface-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-surface-700 uppercase tracking-wide flex items-center gap-2">
              <Users size={14} />
              Reporter Performance
              <InfoTooltip text="Top reporters ranked by observation count. Shows near miss rate and description quality rate. Click any row for detailed analytics." />
            </h3>
            <select
              value={reporterSort}
              onChange={(e) => setReporterSort(e.target.value)}
              className="text-xs border border-surface-200 rounded px-2 py-1"
            >
              <option value="total">Sort by Total</option>
              <option value="nearMiss">Sort by Near Miss</option>
              <option value="quality">Sort by Quality</option>
            </select>
          </div>
          <div className="overflow-auto max-h-64">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-surface-50">
                <tr>
                  <th className="text-left p-2 font-medium text-surface-600">Reporter</th>
                  <th className="text-center p-2 font-medium text-surface-600">Total</th>
                  <th className="text-center p-2 font-medium text-surface-600">NM</th>
                  <th className="text-center p-2 font-medium text-surface-600">Quality</th>
                </tr>
              </thead>
              <tbody>
                {sortedReporters.map((reporter, idx) => (
                  <tr
                    key={reporter.name}
                    className={`${idx % 2 === 0 ? 'bg-white' : 'bg-surface-50'} cursor-pointer hover:bg-blue-50 transition-colors`}
                    onClick={() => handleReporterClick(reporter.name)}
                    title="Click to view detailed analytics"
                  >
                    <td className="p-2 truncate max-w-[150px]" title={reporter.name}>
                      <span className="text-blue-600 hover:underline">{reporter.name}</span>
                    </td>
                    <td className="p-2 text-center font-medium">{reporter.total}</td>
                    <td className="p-2 text-center">
                      <span className={reporter.nearMiss === 0 ? 'text-red-500' : 'text-green-600'}>
                        {reporter.nearMiss}
                      </span>
                    </td>
                    <td className="p-2 text-center">
                      <span className={parseFloat(reporter.qualityRate) >= 75 ? 'text-green-600' : 'text-yellow-600'}>
                        {reporter.qualityRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {reporters.some(r => r.nearMiss === 0 && r.total >= 10) && (
            <div className="mt-2 text-xs text-yellow-600 flex items-center gap-1">
              <AlertTriangle size={12} />
              Some reporters have 0 near misses - training may be needed
            </div>
          )}
        </div>

        {/* Contractor Quality */}
        <div className="bg-white border border-surface-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-surface-700 uppercase tracking-wide flex items-center gap-2">
              <Building2 size={14} />
              Contractor Quality Comparison
              <InfoTooltip text="Quality metrics by contractor: observation count, quality score, categorization rate, and active days. Click any row to see all their observations." />
            </h3>
            <select
              value={contractorSort}
              onChange={(e) => setContractorSort(e.target.value)}
              className="text-xs border border-surface-200 rounded px-2 py-1"
            >
              <option value="totalObs">Sort by Total</option>
              <option value="qualityScore">Sort by Score</option>
              <option value="coverage">Sort by Coverage</option>
            </select>
          </div>
          <div className="overflow-auto max-h-64">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-surface-50">
                <tr>
                  <th className="text-left p-2 font-medium text-surface-600">Contractor</th>
                  <th className="text-center p-2 font-medium text-surface-600">Obs</th>
                  <th className="text-center p-2 font-medium text-surface-600">Score</th>
                  <th className="text-center p-2 font-medium text-surface-600">Days</th>
                </tr>
              </thead>
              <tbody>
                {sortedContractors.map((contractor, idx) => (
                  <tr
                    key={contractor.name}
                    className={`${idx % 2 === 0 ? 'bg-white' : 'bg-surface-50'} cursor-pointer hover:bg-blue-50 transition-colors`}
                    onClick={() => handleContractorDrillDown(contractor)}
                    title="Click to view all observations"
                  >
                    <td className="p-2 truncate max-w-[150px]" title={contractor.name}>
                      <span className="text-blue-600 hover:underline">{contractor.name}</span>
                    </td>
                    <td className="p-2 text-center font-medium">{contractor.totalObs}</td>
                    <td className="p-2 text-center">
                      <span className={
                        contractor.qualityScore >= 70 ? 'text-green-600' :
                        contractor.qualityScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                      }>
                        {contractor.qualityScore}
                      </span>
                    </td>
                    <td className="p-2 text-center text-surface-600">{contractor.activeDays}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECTION 4: Data Quality Details - Side by Side */}
      <div className="grid grid-cols-2 gap-4">
        {/* Categorization Before vs After Comparison */}
        <div className="bg-white border border-surface-200 rounded-lg p-4">
        <h3 className="text-xs font-semibold text-surface-700 uppercase tracking-wide mb-4 flex items-center gap-2">
          Categorization Breakdown (Before vs After)
          <InfoTooltip text="Compare how observations were categorized in Excel (before) vs current state (after auto-classification). Shows the improvement from auto-classification." />
        </h3>

        <div className="grid grid-cols-2 gap-8">
          {/* BEFORE - From Excel */}
          <div>
            <div className="text-center text-xs font-medium text-surface-500 mb-2 uppercase">Before (From Excel)</div>
            <div className="flex items-center gap-4">
              <div className="w-28 h-28">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Proper', value: categorizationComparison.before.proper },
                        { name: 'Blank', value: categorizationComparison.before.blank },
                        { name: 'Other', value: categorizationComparison.before.other }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={20}
                      outerRadius={40}
                      dataKey="value"
                      onClick={(data) => {
                        const records = filteredIncidents.filter(inc => {
                          const val = (inc.originalHazardCategory || '').trim()
                          if (data.name === 'Proper') return val && !['Other', 'Others', 'other', 'others', 'General', 'General Safety', '', 'Not Specified'].includes(val)
                          if (data.name === 'Blank') return !val || val === '' || val === 'Not Specified'
                          return ['Other', 'Others', 'other', 'others', 'General', 'General Safety'].includes(val)
                        })
                        openDrillDown(`Original ${data.name}`, records, ['Data Quality', 'Before', data.name])
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-before-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-green-500 rounded"></span>
                  <span>Proper: {categorizationComparison.before.proper} ({categorizationComparison.before.properRate}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-surface-400 rounded"></span>
                  <span>Blank: {categorizationComparison.before.blank}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-orange-500 rounded"></span>
                  <span>Other: {categorizationComparison.before.other}</span>
                </div>
              </div>
            </div>
          </div>

          {/* AFTER - Current State */}
          <div>
            <div className="text-center text-xs font-medium text-surface-500 mb-2 uppercase">After (Current)</div>
            <div className="flex items-center gap-4">
              <div className="w-28 h-28">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Proper', value: categorizationComparison.after.proper },
                        { name: 'Blank', value: categorizationComparison.after.blank },
                        { name: 'Other', value: categorizationComparison.after.other }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={20}
                      outerRadius={40}
                      dataKey="value"
                      onClick={(data) => handleCategorizationDrillDown(data.name, data.value)}
                      style={{ cursor: 'pointer' }}
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-after-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-green-500 rounded"></span>
                  <span>Proper: {categorizationComparison.after.proper} ({categorizationComparison.after.properRate}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-surface-400 rounded"></span>
                  <span>Blank: {categorizationComparison.after.blank}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-orange-500 rounded"></span>
                  <span>Other: {categorizationComparison.after.other}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Improvement Summary - Compact */}
        {categorizationComparison.improvement.hasImprovement && (
          <div className="mt-3 pt-2 border-t border-surface-200 text-center text-xs text-green-600">
            <TrendingUp size={12} className="inline mr-1" />
            +{categorizationComparison.improvement.properRateDelta}% proper rate ({categorizationComparison.improvement.blankDelta} blanks filled)
          </div>
        )}
        </div>

        {/* Description Length Distribution */}
        <div className="bg-white border border-surface-200 rounded-lg p-4">
          <h3 className="text-xs font-semibold text-surface-700 uppercase tracking-wide mb-3 flex items-center gap-2">
            Description Length Distribution
            <InfoTooltip text="Word count distribution of observation descriptions. Good descriptions have 16+ words providing sufficient detail. Click bars to see records in each range." />
          </h3>
          <div className="space-y-2">
            {[
              { label: '0-5 words (Poor)', value: description.distribution.veryShort, color: 'bg-red-500', flagged: true, range: 'veryShort' },
              { label: '6-15 words', value: description.distribution.short, color: 'bg-yellow-500', range: 'short' },
              { label: '16-30 words (Good)', value: description.distribution.good, color: 'bg-green-400', range: 'good' },
              { label: '31+ words (Excellent)', value: description.distribution.excellent, color: 'bg-green-600', range: 'excellent' }
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 text-xs cursor-pointer hover:bg-surface-50 rounded px-2 py-1 -mx-2 transition-colors"
                onClick={() => handleDescriptionDrillDown(item.range, item.label)}
                title={`Click to view ${item.value} records`}
              >
                <span className="w-28 text-surface-600">{item.label}</span>
                <div className="flex-1 h-4 bg-surface-100 rounded overflow-hidden">
                  <div
                    className={`h-full ${item.color}`}
                    style={{ width: `${(item.value / incidents.length) * 100}%` }}
                  ></div>
                </div>
                <span className="w-12 text-right font-medium">{item.value}</span>
                {item.flagged && item.value > 0 && (
                  <span className="text-red-500">!</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reporter Deep Dive Modal */}
      <ReporterModal
        isOpen={!!selectedReporter}
        onClose={() => setSelectedReporter(null)}
        data={reporterDeepDive}
      />

      {/* Drill-Down Modal for all other sections */}
      <DrillDownModal
        isOpen={drillDown.isOpen}
        onClose={closeDrillDown}
        title={drillDown.title}
        data={drillDown.data}
        type={drillDown.type}
        breadcrumb={drillDown.breadcrumb}
        canGoBack={false}
        onDrillDown={(observations) => {
          // Handle drill from monthly-breakdown to records view
          if (drillDown.type === 'monthly-breakdown' && observations) {
            setDrillDown({
              isOpen: true,
              type: 'records',
              title: `${drillDown.data?.month || ''} - All Observations`,
              data: observations,
              breadcrumb: [...drillDown.breadcrumb, 'Observations'],
              level: 2,
              context: drillDown.context
            })
          }
        }}
      />
    </div>
  )
}

export default DataQuality
