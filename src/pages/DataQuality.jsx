import React, { useMemo, useDeferredValue, useState, useCallback, memo } from 'react'
import useIsMobile from '../hooks/useIsMobile'
import {
  BarChart3,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  XCircle,
  TrendingUp,
  Users,
  FileText,
  FileX,
  Building2,
  Download,
  ChevronDown,
  ChevronUp,
  Tag,
  Eye,
  Brain,
  Target,
  Zap,
  Type,
  Copy,
  AlignLeft,
  HelpCircle,
  AlertOctagon,
  MessageSquareWarning,
  Flag,
  Search,
  X
} from 'lucide-react'
import FilterBar from '../components/common/FilterBar'
import TimePeriodToggle from '../components/common/TimePeriodToggle'
import { InfoTooltip } from '../components/ui/Tooltip'
import { AnimatedNumber } from '../components/ui'
import Skeleton from '../components/ui/Skeleton'
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
  ReferenceLine
} from 'recharts'
import { useDataState, useDataActions } from '../context/DataContext'
import { useFilterState, useFilterActions } from '../context/FilterContext'
import { useFilteredData } from '../context/FilteredDataContext'
import { useTabCache } from '../hooks/useTabCache'
import { useWorkerTask } from '../hooks/useWorkerTask'
import {
  calculateQualityScore,
  getNearMissMetrics,
  getReporterMetrics,
  getContractorMetrics,
  getReporterDeepDive,
  extractHour,
  getImportClassificationMetrics,
} from '../utils/dataQualityCalculations'
import { parseSentence, analyzeForRootCause } from '../utils/sentenceParser'
import { categorizeHazard } from '../utils/excelParser'
import ReporterModal from '../components/common/ReporterModal'

import QualityScoreTrend from '../components/dataQuality/QualityScoreTrend'
import NearMissComplianceTrend from '../components/dataQuality/NearMissComplianceTrend'
import ContractorModal from '../components/common/ContractorModal'
import DrillDownModal from '../components/common/DrillDownModal'
import BatchImportModal from '../components/fileManager/BatchImportModal'

// Status → icon bubble color mapping (matches KPICard pattern)
const getStatusBubbleColors = (status) => {
  switch (status) {
    case 'good': return { bg: 'bg-safety-success-light', icon: 'text-safety-success' }
    case 'warning': return { bg: 'bg-safety-warning-light', icon: 'text-safety-warning' }
    case 'poor': return { bg: 'bg-safety-critical-light', icon: 'text-safety-critical' }
    default: return { bg: 'bg-surface-100', icon: 'text-surface-500' }
  }
}

const DataQuality = () => {
  const { incidents, isLoading, importWarnings } = useDataState()
  const { updateIncident } = useDataActions()
  const isMobile = useIsMobile(640) // sm breakpoint for mobile detection
  const [expandedSection, setExpandedSection] = useState(null)
  const [reporterSort, setReporterSort] = useState('total')
  const [contractorSort, setContractorSort] = useState('totalObs')
  const [selectedReporter, setSelectedReporter] = useState(null)
  const [selectedContractor, setSelectedContractor] = useState(null)
  const [showDuplicates, setShowDuplicates] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showClassificationReview, setShowClassificationReview] = useState(false)
  const [classificationTab, setClassificationTab] = useState('summary') // 'summary' | 'detailed'
  const [showMisclassification, setShowMisclassification] = useState(false)
  const [misclassificationTab, setMisclassificationTab] = useState('detailed') // 'detailed' | 'byCurrent' | 'bySuggested'
  const [showUnclassifiable, setShowUnclassifiable] = useState(false)
  const [showSpellingIssues, setShowSpellingIssues] = useState(false)
  const [showObservationTester, setShowObservationTester] = useState(false)
  const [testObservation, setTestObservation] = useState('')
  const [testResult, setTestResult] = useState(null)
  const [reporterSearch, setReporterSearch] = useState('')
  const [contractorSearch, setContractorSearch] = useState('')

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

  // Shared filter state from context
  const { period, customDateRange, filters, contractor, site, subRegion, excludedReporters } = useFilterState()
  const { setPeriod, setFilter, clearFilters, setExcludedReporters } = useFilterActions()

  // Centralized filtered data from shared context (eliminates ~5 duplicate useMemos)
  const { filteredIncidents: _fi, filterConfig, filterFingerprint } = useFilteredData()
  const filteredIncidents = useDeferredValue(_fi)

  // Stable prop for FilterBar — prevents React.memo defeat from inline spreading
  const activeFilters = useMemo(
    () => ({ ...filters, period, customDateRange }),
    [filters, period, customDateRange]
  )

  // Handle period change
  const handlePeriodChange = useCallback((newPeriod) => {
    setPeriod(newPeriod)
  }, [setPeriod])

  // Handle filter changes - uses shared context (resets site when contractor changes)
  const handleFilterChange = useCallback((key, value) => {
    setFilter(key, value)
  }, [setFilter])

  const handleClearFilters = useCallback(() => {
    clearFilters()
  }, [clearFilters])

  // uniqueContractors, siteOptions, filterConfig, filteredIncidents
  // are now provided by FilteredDataContext (see useFilteredData() above)

  // ============================================
  // SPLIT CALCULATIONS INTO FOCUSED MEMOS
  // Each group only recalculates when its dependencies change
  // ============================================

  // Misclassification analysis - detects records with wrong categories
  // Offloaded to Web Worker to keep main thread free
  const { result: misclassificationData, isPending: misclassificationPending } = useWorkerTask(
    'misclassification', filteredIncidents, null, [filteredIncidents], null
  )

  // Group 1: Core quality score metrics (depends on misclassification data)
  // useTabCache so hidden tabs skip this O(n) computation + LRU fingerprint cache
  const coreQualityMetrics = useTabCache('coreQualityMetrics', () => {
    if (filteredIncidents.length === 0) return null
    return {
      quality: calculateQualityScore(filteredIncidents, misclassificationData),
      nearMiss: getNearMissMetrics(filteredIncidents),
    }
  }, filterFingerprint, [filteredIncidents, misclassificationData])

  // Group 2: Categorization metrics - offloaded to Web Worker
  const { result: categorizationMetrics } = useWorkerTask(
    'categorization', filteredIncidents, null, [filteredIncidents], null
  )

  // Group 3: Text analysis (spelling, duplicates, vague hazards) - offloaded to Web Worker
  const { result: textAnalysisMetrics } = useWorkerTask(
    'textAnalysis', filteredIncidents, null, [filteredIncidents], null
  )

  // Group 4: Reporter and contractor metrics (includes classification accuracy)
  const reporterContractorMetrics = useTabCache('reporterContractorMetrics', () => {
    if (filteredIncidents.length === 0) return null
    return {
      reporters: getReporterMetrics(filteredIncidents, misclassificationData),
      contractors: getContractorMetrics(filteredIncidents, misclassificationData),
    }
  }, filterFingerprint, [filteredIncidents, misclassificationData])

  // Group 5: Flagged records - offloaded to Web Worker
  const { result: trendAndFlaggedMetrics } = useWorkerTask(
    'trendFlagged', filteredIncidents, null, [filteredIncidents], null
  )

  // Combined quality data object - only creates new reference when sub-memos change
  // Safe defaults for worker-async fields (prevents undefined access while worker is computing)
  const EMPTY_REASON = { count: 0, records: [], percentage: '0', label: '', description: '' }
  const WORKER_DEFAULTS = {
    description: { avgWords: 0, totalDescriptions: 0, percentEmpty: 0, emptyDescriptions: 0, distribution: { veryShort: 0, short: 0, good: 0, excellent: 0 } },
    duplicates: { duplicateGroups: [], totalGroups: 0, totalDuplicates: 0, uniqueDescriptions: 0, duplicateRate: '0' },
    spellingIssues: { count: 0, records: [], percentage: '0', isReady: true },
    foulWords: { count: 0, records: [], percentage: '0', status: 'good', summary: { highSeverity: 0, mediumSeverity: 0, lowSeverity: 0 } },
    vagueHazards: { count: 0, records: [], percentage: '0', status: 'good', summary: { shortDescriptions: 0, primaryDescriptor: 0, topVagueTerms: [] } },
    autoClassification: { totalAutoClassified: 0, percentageOfTotal: '0.0', classifications: [] },
    otherHazards: { totalOther: 0, categories: [] },
    unclassifiableRecords: { total: 0, byReason: { noDescription: EMPTY_REASON, tooShort: EMPTY_REASON, unrecognizedCategory: EMPTY_REASON, lowConfidence: EMPTY_REASON, historicalPlaceholder: EMPTY_REASON, restrictedClassification: EMPTY_REASON }, summary: { actionable: 0, total: 0, percentage: '0', message: '' } },
  }

  const qualityData = useMemo(() => {
    if (!coreQualityMetrics) return null

    return {
      // Core quality
      quality: coreQualityMetrics.quality,
      nearMiss: coreQualityMetrics.nearMiss,
      // Categorization (worker-async - provide defaults)
      autoClassification: categorizationMetrics?.autoClassification ?? WORKER_DEFAULTS.autoClassification,
      otherHazards: categorizationMetrics?.otherHazards ?? WORKER_DEFAULTS.otherHazards,
      // Text analysis (worker-async - provide defaults)
      description: textAnalysisMetrics?.description ?? WORKER_DEFAULTS.description,
      duplicates: textAnalysisMetrics?.duplicates ?? WORKER_DEFAULTS.duplicates,
      spellingIssues: textAnalysisMetrics?.spellingIssues ?? WORKER_DEFAULTS.spellingIssues,
      foulWords: textAnalysisMetrics?.foulWords ?? WORKER_DEFAULTS.foulWords,
      vagueHazards: textAnalysisMetrics?.vagueHazards ?? WORKER_DEFAULTS.vagueHazards,
      // Reporter/contractor
      reporters: reporterContractorMetrics?.reporters ?? [],
      contractors: reporterContractorMetrics?.contractors ?? [],
      // Flagged (worker-async - provide defaults)
      unclassifiableRecords: trendAndFlaggedMetrics?.unclassifiableRecords ?? WORKER_DEFAULTS.unclassifiableRecords,
      flaggedRecords: trendAndFlaggedMetrics?.flaggedRecords ?? [],
      // Legacy empty array
      alerts: [],
    }
  }, [coreQualityMetrics, categorizationMetrics, textAnalysisMetrics, reporterContractorMetrics, trendAndFlaggedMetrics])

  // Sort reporters
  const sortedReporters = useMemo(() => {
    if (!qualityData) return []

    // Filter by search term first
    let filtered = [...qualityData.reporters]
    if (reporterSearch.trim()) {
      const searchLower = reporterSearch.toLowerCase().trim()
      filtered = filtered.filter(r => r.name.toLowerCase().includes(searchLower))
    }

    // Then sort (no slice limit - show all reporters)
    return filtered.sort((a, b) => {
      if (reporterSort === 'total') return b.total - a.total
      if (reporterSort === 'nearMiss') return b.nearMiss - a.nearMiss
      if (reporterSort === 'quality') return parseFloat(b.qualityRate) - parseFloat(a.qualityRate)
      return 0
    })
  }, [qualityData, reporterSort, reporterSearch])

  // Sort contractors
  const sortedContractors = useMemo(() => {
    if (!qualityData) return []
    let filtered = [...qualityData.contractors]
    if (contractorSearch.trim()) {
      const searchLower = contractorSearch.toLowerCase().trim()
      filtered = filtered.filter(c => c.name.toLowerCase().includes(searchLower))
    }
    return filtered.sort((a, b) => {
      if (contractorSort === 'totalObs') return b.totalObs - a.totalObs
      if (contractorSort === 'qualityScore') return b.qualityScore - a.qualityScore
      return 0
    })
  }, [qualityData, contractorSort, contractorSearch])

  // Reporter deep dive data
  const reporterDeepDive = useMemo(() => {
    if (!selectedReporter) return null
    const result = getReporterDeepDive(filteredIncidents, selectedReporter, incidents, misclassificationData)
    return result
  }, [selectedReporter, filteredIncidents, incidents, misclassificationData])

  // Import classification review data
  const classificationReviewData = useMemo(() => {
    if (!importWarnings?.hazardIssues || importWarnings.hazardIssues.length === 0) {
      return null
    }
    return getImportClassificationMetrics(importWarnings.hazardIssues, incidents)
  }, [importWarnings, incidents])

  // Handle reporter click
  const handleReporterClick = useCallback((reporterName) => {
    setSelectedReporter(reporterName)
  }, [])

  // Drill-down handlers - memoized to prevent child re-renders
  const openDrillDown = useCallback((title, records, breadcrumb = [], context = {}) => {
    setDrillDown({
      isOpen: true,
      type: 'records',
      title,
      data: records,
      breadcrumb,
      level: 2,
      context
    })
  }, [])

  const closeDrillDown = useCallback(() => {
    setDrillDown({
      isOpen: false,
      type: null,
      title: '',
      data: [],
      breadcrumb: [],
      level: 1,
      context: {}
    })
  }, [])

  // Day of week drill-down
  const handleDayDrillDown = useCallback((dayData) => {
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
  }, [filteredIncidents, openDrillDown])

  // Hour drill-down
  const handleHourDrillDown = useCallback((hourData) => {
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
  }, [filteredIncidents, openDrillDown])

  // Contractor click - opens modal
  const handleContractorDrillDown = useCallback((contractor) => {
    setSelectedContractor(contractor.name)
  }, [])

  // KPI drill-down
  const handleKPIDrillDown = useCallback((metric, title, filterFn) => {
    const records = filteredIncidents.filter(filterFn)
    openDrillDown(
      title,
      records,
      ['Data Quality', metric],
      { metric }
    )
  }, [filteredIncidents, openDrillDown])

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

  // Foul words drill-down - show single incident with flagged words
  const handleFoulWordsDrillDown = (record) => {
    openDrillDown(
      `Inappropriate Language - ${record.flaggedWords.length} word${record.flaggedWords.length > 1 ? 's' : ''} flagged`,
      [record.incident],
      ['Data Quality', 'Foul Words'],
      {
        flaggedWords: record.flaggedWords,
        severity: record.severity,
        reporter: record.reporter
      }
    )
  }

  // Vague hazards drill-down - show single incident with vague terms
  const handleVagueHazardsDrillDown = (record) => {
    openDrillDown(
      `Vague Description - "${record.vagueTerms[0]?.term}" needs specificity`,
      [record.incident],
      ['Data Quality', 'Vague Hazards'],
      {
        vagueTerms: record.vagueTerms,
        wordCount: record.wordCount,
        improvement: record.improvement,
        reporter: record.reporter
      }
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
    }).catch(() => {
      alert('Failed to copy report')
    })
  }

  // Test observation parsing
  const handleTestObservation = () => {
    if (!testObservation.trim()) {
      setTestResult(null)
      return
    }

    const text = testObservation.trim()
    const parsed = parseSentence(text)
    const rootCause = analyzeForRootCause(text)
    const category = categorizeHazard(text)

    setTestResult({
      text,
      parsed,
      rootCause,
      category
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
      lowConfidence: 'Low Confidence',
      historicalPlaceholder: 'Historical/Placeholder',
      restrictedClassification: 'Restricted Classification'
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
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton.KPICard key={i} />
          ))}
        </div>
        <Skeleton.Chart height={200} />
        <Skeleton.Table rows={6} cols={5} />
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
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Time Period Toggle */}
          <TimePeriodToggle period={period} onPeriodChange={handlePeriodChange} showAll />
        </div>

        <div className="flex flex-col items-center justify-center h-64 text-surface-500">
          <BarChart3 size={48} className="mb-4 opacity-50" />
          <p>No observations match the current filters.</p>
        </div>
      </div>
    )
  }

  const { quality, description, nearMiss, reporters, contractors, alerts, duplicates, spellingIssues, otherHazards, autoClassification, unclassifiableRecords, flaggedRecords } = qualityData

  return (
    <div className="space-y-3 safe-area-bottom pb-3">
      {/* Filters Row - responsive layout */}
      <div className={isMobile ? 'space-y-3' : 'flex items-center gap-2'}>
        <div className={isMobile ? '' : 'flex-1'}>
          <FilterBar
            filters={filterConfig}
            activeFilters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
          />
        </div>

        {/* Action Buttons - side by side on mobile */}
        <div className={isMobile ? 'flex items-center gap-2' : 'flex items-center gap-2'}>
          {/* Time Period Toggle */}
          <TimePeriodToggle period={period} onPeriodChange={handlePeriodChange} showAll />

          {/* Observation Tester Button */}
          <button
            onClick={() => setShowObservationTester(!showObservationTester)}
            className={`flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              isMobile ? 'flex-1 h-11 px-3' : 'px-3 py-2'
            } ${
              showObservationTester
                ? 'bg-purple-600 text-white'
                : 'bg-white border border-purple-300 text-purple-700 hover:bg-purple-50'
            }`}
          >
            <Brain size={isMobile ? 18 : 16} />
            {isMobile ? 'Test' : 'Test Parser'}
          </button>
        </div>
      </div>

      {/* Observation Tester Panel */}
      {showObservationTester && (
        <div className="bg-white border border-purple-200 rounded-lg p-4 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-purple-800 flex items-center gap-2">
              <Brain size={16} />
              Observation Parser Tester
            </h3>
            <button
              onClick={() => setShowObservationTester(false)}
              className="text-surface-400 hover:text-surface-600"
            >
              <XCircle size={18} />
            </button>
          </div>

          <div className="space-y-3">
            {/* Input */}
            <div>
              <label className="text-xs font-medium text-surface-600 mb-1 block">
                Paste observation text to test:
              </label>
              <div className="flex gap-2">
                <textarea
                  value={testObservation}
                  onChange={(e) => setTestObservation(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleTestObservation()
                    }
                  }}
                  placeholder="e.g., Worker not wearing harness while working at height on scaffold"
                  className="flex-1 px-3 py-2 border border-surface-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={2}
                />
                <button
                  onClick={handleTestObservation}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium self-end"
                >
                  Parse
                </button>
              </div>
            </div>

            {/* Results */}
            {testResult && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                {/* Sentence Breakdown */}
                <div className="bg-surface-50 border border-surface-200 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-surface-700 uppercase mb-2 flex items-center gap-1">
                    <AlignLeft size={12} />
                    Sentence Breakdown
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-start">
                      <span className="w-16 text-surface-500 font-medium shrink-0">WHO:</span>
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="text-surface-800">{testResult.parsed.actor || '(none)'}</span>
                        {testResult.parsed.actorType && (
                          <span className="text-purple-600 text-[10px]">[{testResult.parsed.actorType}]</span>
                        )}
                        {testResult.parsed.actorIsSpecialist && (
                          <span className="bg-green-500 text-white text-[9px] px-1 py-0.5 rounded font-bold">SPECIALIST</span>
                        )}
                        {testResult.parsed.actorSuggestedHazard && (
                          <span className="text-green-600 text-[10px]">→ {testResult.parsed.actorSuggestedHazard} ({Math.round(testResult.parsed.actorHazardConfidence * 100)}%)</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="w-16 text-surface-500 font-medium shrink-0">WHAT:</span>
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="text-surface-800">{testResult.parsed.object || '(none)'}</span>
                        {testResult.parsed.objectType && (
                          <span className="text-purple-600 text-[10px]">[{testResult.parsed.objectType}]</span>
                        )}
                        {testResult.parsed.objectSuggestedHazard && (
                          <span className="text-blue-600 text-[10px]">→ {testResult.parsed.objectSuggestedHazard}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="w-16 text-surface-500 font-medium shrink-0">ACTION:</span>
                      <div className="flex items-center gap-1">
                        <span className="text-surface-800">{testResult.parsed.action || '(none)'}</span>
                        {testResult.parsed.actionType && (
                          <span className="text-purple-600 text-[10px]">[{testResult.parsed.actionType}]</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="w-16 text-surface-500 font-medium shrink-0">WHERE:</span>
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="text-surface-800">{testResult.parsed.location || '(none)'}</span>
                        {testResult.parsed.locationInfo?.preposition && (
                          <span className="text-orange-600 text-[10px]">[{testResult.parsed.locationInfo.preposition}]</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="w-16 text-surface-500 font-medium shrink-0">SUBJECT:</span>
                      <span className="text-surface-800 font-semibold">{testResult.parsed.mainSubject || '(none)'}</span>
                    </div>
                  </div>
                </div>

                {/* Classification Result */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-purple-700 uppercase mb-2 flex items-center gap-1">
                    <Target size={12} />
                    Classification
                  </h4>
                  <div className="space-y-2">
                    <div className="text-lg font-bold text-purple-900">
                      {testResult.category}
                    </div>
                    {testResult.parsed.keywords?.length > 0 && (
                      <div>
                        <span className="text-xs text-surface-500 font-medium">Keywords:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {testResult.parsed.keywords.map((k, i) => (
                            <span
                              key={i}
                              className={`text-xs px-1.5 py-0.5 rounded ${
                                k.role === 'SUBJECT' ? 'bg-green-100 text-green-700' :
                                k.role === 'OBJECT' ? 'bg-blue-100 text-blue-700' :
                                k.role === 'ACTOR' ? (k.isSpecialist ? 'bg-green-200 text-green-800 font-bold' : 'bg-yellow-100 text-yellow-700') :
                                k.role === 'ACTION' ? 'bg-orange-100 text-orange-700' :
                                k.role === 'LOCATION' ? 'bg-gray-100 text-gray-600' :
                                'bg-surface-100 text-surface-600'
                              }`}
                              title={k.suggestedHazard ? `Suggests: ${k.suggestedHazard}` : ''}
                            >
                              {k.text} ({Math.round(k.weight * 100)}%)
                              {k.isSpecialist && ' ⭐'}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ambiguity Resolution */}
                {testResult.parsed.ambiguities?.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <h4 className="text-xs font-semibold text-yellow-700 uppercase mb-2 flex items-center gap-1">
                      <HelpCircle size={12} />
                      Ambiguity Resolution
                    </h4>
                    <div className="space-y-1.5 text-xs">
                      {testResult.parsed.ambiguities.map((amb, i) => (
                        <div key={i} className="flex items-start gap-1">
                          <span className="font-medium text-yellow-800">"{amb.word}"</span>
                          <span className="text-surface-500">→</span>
                          <span className={amb.resolved ? 'text-green-700' : 'text-orange-600'}>
                            {amb.hazard} ({Math.round(amb.confidence * 100)}%)
                          </span>
                          {amb.resolved && <span className="text-green-600 text-[10px]">✓ context matched</span>}
                          {!amb.resolved && <span className="text-orange-500 text-[10px]">(default)</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Root Cause Analysis */}
                {testResult.rootCause && (
                  <div className={`bg-amber-50 border border-amber-200 rounded-lg p-3 ${!testResult.parsed.ambiguities?.length ? 'lg:col-span-1' : ''}`}>
                    <h4 className="text-xs font-semibold text-amber-700 uppercase mb-2 flex items-center gap-1">
                      <Zap size={12} />
                      Root Cause Components
                    </h4>
                    <div className="space-y-1 text-xs">
                      <div>
                        <span className="text-surface-500 font-medium">Deviation: </span>
                        <span className="text-surface-800">{testResult.rootCause.deviation || '(none)'}</span>
                      </div>
                      <div>
                        <span className="text-surface-500 font-medium">Cause: </span>
                        <span className="text-surface-800">{testResult.rootCause.immediateCause || testResult.rootCause.cause || '(none)'}</span>
                      </div>
                      <div>
                        <span className="text-surface-500 font-medium">Consequence: </span>
                        <span className="text-surface-800">{testResult.rootCause.consequence || '(none)'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Confidence Summary */}
                <div className="md:col-span-2 lg:col-span-3 bg-surface-100 border border-surface-200 rounded-lg p-3">
                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <div>
                      <span className="text-surface-500 font-medium">Pattern: </span>
                      <span className="text-surface-800 font-mono">{testResult.parsed.pattern || 'NONE'}</span>
                    </div>
                    <div>
                      <span className="text-surface-500 font-medium">Parse Confidence: </span>
                      <span className={`font-bold ${testResult.parsed.confidence >= 0.7 ? 'text-green-600' : testResult.parsed.confidence >= 0.5 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {Math.round(testResult.parsed.confidence * 100)}%
                      </span>
                    </div>
                    {testResult.parsed.actorIsSpecialist && (
                      <div className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-[10px] font-bold">
                        Specialist Role Detected → Higher Confidence
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content wrapper - bg-surface-50 makes white cards pop (matches Dashboard) */}
      <div className="space-y-3 bg-surface-50 p-2 -m-2">

      {/* SECTION 1: Hero KPI Cards */}
      {(() => {
        const overallStatus = quality.score >= 80 ? 'good' : quality.score >= 60 ? 'warning' : 'poor'
        const classAccuracy = quality.breakdown.classificationAccuracy
        const descQuality = quality.breakdown.description
        const reporterEng = quality.breakdown.reporters
        const reporterEngStatus = reporterEng.value >= 70 ? 'good' : reporterEng.value >= 40 ? 'warning' : 'poor'
        const dataInteg = quality.breakdown.dataIntegrity

        const shortReportCount = (description.distribution?.veryShort || 0) + (description.distribution?.short || 0)
        const autoClassCount = autoClassification?.totalAutoClassified || 0
        const autoClassPct = autoClassification?.percentageOfTotal || '0.0'
        const autoClassStatus = autoClassCount === 0 ? 'good' : parseFloat(autoClassPct) <= 10 ? 'warning' : 'poor'
        const otherCount = otherHazards?.totalOther || 0
        const otherPct = filteredIncidents.length > 0 ? ((otherCount / filteredIncidents.length) * 100).toFixed(1) : '0.0'
        const otherStatus = otherCount === 0 ? 'good' : parseFloat(otherPct) <= 5 ? 'warning' : 'poor'

        const heroCards = [
          { title: 'Overall Score', value: quality.score, subtitle: 'out of 100', status: overallStatus, Icon: BarChart3, suffix: '', tooltip: 'Weighted average of all quality metrics below. Green above 80, amber 60-79, red below 60.' },
          { title: 'Wrong Category', value: classAccuracy.total > 0 ? parseFloat((100 - classAccuracy.value).toFixed(1)) : 0, subtitle: `${classAccuracy.misclassifiedCount} of ${classAccuracy.total} reports checked`, status: classAccuracy.status, Icon: AlertOctagon, suffix: '%', tooltip: 'Percentage of reports filed under the wrong hazard type. The system scans each description for keywords and flags mismatches. Lower is better.' },
          { title: 'Short Descriptions', value: shortReportCount, subtitle: `${filteredIncidents.length > 0 ? ((shortReportCount / filteredIncidents.length) * 100).toFixed(1) : '0.0'}% under 10 words`, status: descQuality.status, Icon: AlignLeft, suffix: '', tooltip: 'Number of reports with fewer than 10 words. Short descriptions lack the detail needed to investigate or take action.' },
          { title: 'Near Miss Reporting', value: parseFloat(nearMiss.complianceRate), subtitle: `${nearMiss.sitesMetTarget} of ${nearMiss.totalSiteMonths} site-months hit target`, status: nearMiss.status, Icon: AlertTriangle, suffix: '%', tooltip: 'Percentage of site-months that reported at least 2 near-misses. Low near-miss reporting often means incidents go unreported, not that they don\'t happen.' },
          { title: 'Active Reporters', value: Math.round(reporterEng.value), subtitle: `${reporterEng.active} of ${reporterEng.total} reported 5+ times`, status: reporterEngStatus, Icon: Users, suffix: '%', tooltip: 'Percentage of reporters who submitted 5 or more observations. Higher means safety reporting is spread across the workforce, not just a few individuals.' },
          { title: 'Duplicate Reports', value: parseFloat(dataInteg.duplicateRate), subtitle: `${dataInteg.duplicateCount} duplicate reports found`, status: dataInteg.status, Icon: Copy, suffix: '%', tooltip: 'Percentage of reports with copy-pasted or near-identical descriptions. High duplication inflates numbers without adding real safety data.' },
          { title: 'Auto-Classified', value: parseFloat(autoClassPct), subtitle: `${autoClassCount} reports auto-fixed`, status: autoClassStatus, Icon: Zap, suffix: '%', tooltip: 'Percentage of reports that arrived with a blank or generic category and were automatically assigned one based on description keywords.' },
          { title: '"Other" Hazards', value: otherCount, subtitle: `${otherPct}% filed under Other`, status: otherStatus, Icon: Tag, suffix: '', tooltip: 'Reports filed under "Other" instead of a specific hazard category. These often contain enough detail to be properly categorized but were submitted lazily.' },
        ]

        return (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-surface-500 uppercase tracking-wide flex items-center gap-2">
                <BarChart3 size={16} />
                Data Quality Overview
                <InfoTooltip text="HOW THIS SCORE IS CALCULATED: Your data is evaluated across 5 categories, each contributing to the total: (1) WRONG CATEGORY (25%): How many reports are filed under the wrong hazard type? Lower is better. (2) DETAILED REPORTS (25%): What percentage of reports have enough detail to act on? 16+ words scores higher. (3) NEAR MISS REPORTING (20%): Are near-misses being reported? 2+ per site per month is the target. (4) ACTIVE REPORTERS (15%): How many people report regularly? More reporters with 5+ submissions = wider engagement. (5) DUPLICATE REPORTS (15%): How many descriptions are copy-pasted? Fewer duplicates = higher score." />
              </h2>
              <span className="text-xs text-surface-400">{filteredIncidents.length} of {incidents.length} observations</span>
            </div>
            <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
              {heroCards.map((card) => {
                const bubbleColors = getStatusBubbleColors(card.status)
                return (
                  <div
                    key={card.title}
                    className="group bg-white border border-surface-200 rounded-lg p-3 sm:p-4 transition-all duration-300 ease-out hover:shadow-medium hover:border-surface-300 shadow-soft"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-xs sm:text-sm font-semibold text-surface-500 uppercase tracking-wide truncate">{card.title}</span>
                          {card.tooltip && <InfoTooltip text={card.tooltip} className="flex-shrink-0" />}
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-surface-800 mt-1 tabular-nums">
                          <AnimatedNumber value={card.value} />
                          {card.suffix}
                        </p>
                        <p className="text-xs text-surface-500 mt-1 truncate">{card.subtitle}</p>
                      </div>
                      <div className={`flex-shrink-0 p-2.5 rounded-lg transition-transform duration-300 ease-out group-hover:scale-110 ${bubbleColors.bg} ${bubbleColors.icon}`}>
                        <card.Icon size={22} aria-hidden="true" />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Alerts */}
            {alerts.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
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
        )
      })()}

      {/* SECTION 1B: Quality Trend + Near-Miss Compliance (2 columns) */}
      <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
        {/* Quality Score Trend */}
        <QualityScoreTrend incidents={filteredIncidents} isMobile={isMobile} />

        {/* Near-Miss Compliance Trend */}
        <NearMissComplianceTrend incidents={filteredIncidents} isMobile={isMobile} />
      </div>

      {/* ROW 1: Duplicates & Spelling (2 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Duplicates */}
        <div className="bg-white border border-surface-200 rounded-lg p-3 shadow-soft flex flex-col min-h-[280px]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-safety-warning-light rounded-lg">
                <FileText size={16} className="text-safety-warning" />
              </div>
              <span className="text-xs font-semibold text-surface-700 uppercase tracking-wide">Duplicates</span>
              <InfoTooltip text="HOW DUPLICATES ARE DETECTED: We compare the description text of every observation against all others. If two or more observations have identical or nearly identical descriptions, they're flagged as potential copy-paste entries. This often indicates someone is re-using the same description instead of writing specific details for each observation. WHY THIS MATTERS: Copied descriptions don't capture what actually happened in each unique situation, making them less useful for identifying patterns and preventing future incidents. Consider training reporters to write unique, specific descriptions for each observation." />
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${duplicates.totalGroups > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {duplicates.totalGroups}
              </div>
              <div className="text-xs text-surface-500">groups</div>
            </div>
          </div>

          {duplicates.totalGroups === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <CheckCircle size={32} className="text-green-500 mx-auto mb-2" />
                <span className="text-sm text-green-600 font-medium">All Clear</span>
              </div>
            </div>
          ) : (
            <>
              {/* Summary bar with View All */}
              <div className="mb-3 p-2 bg-surface-50 rounded-lg flex items-center justify-between">
                <div className="text-xs">
                  <span className="text-surface-600">{duplicates.totalDuplicates} entries</span>
                  <span className="font-bold text-surface-700 ml-2">{duplicates.duplicateRate}%</span>
                </div>
                <button
                  onClick={() => openDrillDown(
                    `All Duplicate Groups (${duplicates.totalGroups} groups)`,
                    duplicates.duplicateGroups.flatMap(g => g.incidents),
                    ['Data Quality', 'Duplicates', 'All Records'],
                    { totalGroups: duplicates.totalGroups }
                  )}
                  className="text-xs font-medium text-surface-600 hover:text-surface-800 flex items-center gap-1"
                >
                  <Eye size={12} />
                  View All
                </button>
              </div>

              {/* Floating chips for duplicate groups */}
              <div className="flex-1 overflow-y-auto max-h-[180px]">
                <div className="flex flex-wrap gap-2">
                  {duplicates.duplicateGroups.map((group, idx) => {
                    // Get first 3-4 words for context
                    const words = group.description.split(/\s+/).slice(0, 4).join(' ')
                    const shortDesc = words.length > 25 ? words.slice(0, 25) + '...' : words + '...'
                    return (
                      <button
                        key={idx}
                        onClick={() => handleDuplicateDrillDown(group)}
                        className={`px-2.5 py-1 rounded-full text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                          group.isSameReporter
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-surface-200 text-surface-700 hover:bg-surface-300'
                        }`}
                        title={`${group.isSameReporter ? '(Same reporter) ' : ''}${group.description.slice(0, 100)}`}
                      >
                        <span className="font-bold">{group.count}x</span>
                        <span className="font-normal truncate max-w-[120px]">{shortDesc}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="mt-2 pt-2 border-t border-surface-200 flex items-center justify-center gap-4 text-xs text-surface-500">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-red-100 border border-red-200"></span>
                  Same reporter
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-surface-200 border border-surface-300"></span>
                  Multiple reporters
                </span>
              </div>
            </>
          )}
        </div>

        {/* Spelling Issues */}
        <div className="bg-white border border-surface-200 rounded-lg p-3 shadow-soft flex flex-col min-h-[280px]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary-50 rounded-lg">
                <Type size={16} className="text-primary-600" />
              </div>
              <span className="text-xs font-semibold text-surface-700 uppercase tracking-wide">Spelling</span>
              <InfoTooltip text="HOW MISSPELLINGS ARE DETECTED: We run every description through a spell checker that compares words against a large dictionary. Words not found in the dictionary are flagged as potential misspellings. The system is smart enough to ignore proper nouns, technical terms, and common abbreviations. WHY THIS MATTERS: Excessive spelling errors can indicate rushed data entry, which often correlates with poor overall quality. They can also make it harder to search for specific terms later. Consider this as one indicator of data entry care, not as a criticism of individual reporters." />
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${spellingIssues.count > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {spellingIssues.count}
              </div>
              <div className="text-xs text-surface-500">records</div>
            </div>
          </div>

          {spellingIssues.count === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <CheckCircle size={32} className="text-green-500 mx-auto mb-2" />
                <span className="text-sm text-green-600 font-medium">All Clear</span>
              </div>
            </div>
          ) : (
            <>
              {/* Summary bar with View All and Copy */}
              <div className="mb-3 p-2 bg-surface-50 rounded-lg flex items-center justify-between">
                <span className="text-xs text-surface-600">{spellingIssues.percentage}% of records</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={copySpellingReport}
                    className="flex items-center gap-1 text-xs text-surface-600 hover:text-surface-800 font-medium"
                    title="Copy report"
                  >
                    <Copy size={12} />
                    Copy
                  </button>
                  <button
                    onClick={() => openDrillDown(
                      `All Spelling Issues (${spellingIssues.count} records)`,
                      spellingIssues.records.map(r => r.incident),
                      ['Data Quality', 'Spelling', 'All Records'],
                      { totalRecords: spellingIssues.count }
                    )}
                    className="text-xs font-medium text-surface-600 hover:text-surface-800 flex items-center gap-1"
                  >
                    <Eye size={12} />
                    View All
                  </button>
                </div>
              </div>

              {/* Floating chips for unique misspellings */}
              <div className="flex-1 overflow-y-auto max-h-[180px]">
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    // Group misspellings by word pairs and collect associated records
                    const misspellingGroups = {}
                    spellingIssues.records.forEach(record => {
                      record.misspellings.forEach(m => {
                        const key = `${m.misspelled}|${m.correction}`
                        if (!misspellingGroups[key]) {
                          misspellingGroups[key] = { misspelled: m.misspelled, correction: m.correction, records: [] }
                        }
                        misspellingGroups[key].records.push(record)
                      })
                    })
                    // Sort by frequency
                    const sorted = Object.values(misspellingGroups).sort((a, b) => b.records.length - a.records.length)
                    return sorted.map((group, idx) => (
                      <button
                        key={idx}
                        onClick={() => openDrillDown(
                          `Misspelling: "${group.misspelled}" (${group.records.length} records)`,
                          group.records.map(r => r.incident),
                          ['Data Quality', 'Spelling', group.misspelled],
                          { misspelled: group.misspelled, correction: group.correction }
                        )}
                        className="px-2 py-1 rounded-full text-xs font-medium bg-surface-100 hover:bg-surface-200 transition-colors cursor-pointer flex items-center gap-1"
                        title={`${group.records.length} record${group.records.length > 1 ? 's' : ''} with this misspelling`}
                      >
                        <span className="line-through text-red-500">{group.misspelled}</span>
                        <span className="text-surface-400">→</span>
                        <span className="text-green-600">{group.correction}</span>
                        {group.records.length > 1 && (
                          <span className="ml-1 px-1.5 py-0.5 bg-surface-200 rounded-full text-surface-600 text-[10px]">
                            {group.records.length}
                          </span>
                        )}
                      </button>
                    ))
                  })()}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ROW 1B: Foul Words & Vague Hazards (2 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Foul Words */}
        <div className="bg-white border border-surface-200 rounded-lg p-3 shadow-soft flex flex-col min-h-[280px]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-safety-critical-light rounded-lg">
                <AlertOctagon size={16} className="text-safety-critical" />
              </div>
              <span className="text-xs font-semibold text-surface-700 uppercase tracking-wide">Foul Words</span>
              <InfoTooltip text="HOW FLAGGED LANGUAGE IS DETECTED: We scan descriptions for words that may be inappropriate, unprofessional, or indicate frustration rather than objective reporting. This includes profanity, inflammatory language, and highly subjective terms. WHY THIS MATTERS: Safety reports should be objective and factual. Emotional or inappropriate language can indicate reporter frustration (which may be worth addressing) or could create issues if reports are shared with external parties. These records may need review and potential editing to maintain professional standards." />
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${qualityData.foulWords?.count > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {qualityData.foulWords?.count || 0}
              </div>
              <div className="text-xs text-surface-500">records</div>
            </div>
          </div>

          {!qualityData.foulWords || qualityData.foulWords.count === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <CheckCircle size={32} className="text-green-500 mx-auto mb-2" />
                <span className="text-sm text-green-600 font-medium">All Clear</span>
              </div>
            </div>
          ) : (
            <>
              {/* Summary bar with View All */}
              <div className="mb-3 p-2 bg-red-50 rounded-lg flex items-center justify-between">
                <span className="text-xs text-red-700">{qualityData.foulWords.percentage}% of records</span>
                <button
                  onClick={() => openDrillDown(
                    `All Foul Words (${qualityData.foulWords.count} records)`,
                    qualityData.foulWords.records.map(r => r.incident),
                    ['Data Quality', 'Foul Words', 'All Records'],
                    { totalRecords: qualityData.foulWords.count }
                  )}
                  className="text-xs font-medium text-red-700 hover:text-red-900 flex items-center gap-1"
                >
                  <Eye size={12} />
                  View All
                </button>
              </div>

              {/* Floating chips for unique foul words */}
              <div className="flex-1 overflow-y-auto max-h-[180px]">
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    // Group records by flagged word
                    const wordGroups = {}
                    qualityData.foulWords.records.forEach(record => {
                      record.flaggedWords.forEach(word => {
                        const normalizedWord = word.toLowerCase()
                        if (!wordGroups[normalizedWord]) {
                          wordGroups[normalizedWord] = { word, records: [] }
                        }
                        wordGroups[normalizedWord].records.push(record)
                      })
                    })
                    // Sort by frequency
                    const sorted = Object.values(wordGroups).sort((a, b) => b.records.length - a.records.length)
                    return sorted.map((group, idx) => (
                      <button
                        key={idx}
                        onClick={() => openDrillDown(
                          `Foul Word: "${group.word}" (${group.records.length} records)`,
                          group.records.map(r => r.incident),
                          ['Data Quality', 'Foul Words', group.word],
                          { flaggedWord: group.word }
                        )}
                        className="px-3 py-1.5 rounded-full text-xs font-bold bg-red-100 text-red-700 hover:bg-red-200 transition-colors cursor-pointer"
                        title={`${group.records.length} record${group.records.length > 1 ? 's' : ''} with "${group.word}"`}
                      >
                        {group.word} ({group.records.length})
                      </button>
                    ))
                  })()}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Vague Hazards */}
        <div className="bg-white border border-surface-200 rounded-lg p-3 shadow-soft flex flex-col min-h-[280px]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-safety-warning-light rounded-lg">
                <MessageSquareWarning size={16} className="text-safety-warning" />
              </div>
              <span className="text-xs font-semibold text-surface-700 uppercase tracking-wide">Vague Hazards</span>
              <InfoTooltip text="HOW VAGUE DESCRIPTIONS ARE DETECTED: We look for descriptions that use generic safety terms (like 'unsafe', 'dangerous', 'hazardous', 'at risk') without providing specific details about WHAT was unsafe or WHY it was dangerous. A good description should explain the specific situation, not just label it. WHY THIS MATTERS: Vague descriptions like 'worker was unsafe' don't help anyone understand or fix the problem. What were they doing? What made it unsafe? Without specifics, the observation has limited value for prevention. Consider coaching reporters to always include the WHO, WHAT, WHERE, and WHY details." />
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${qualityData.vagueHazards?.count > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                {qualityData.vagueHazards?.count || 0}
              </div>
              <div className="text-xs text-surface-500">records</div>
            </div>
          </div>

          {!qualityData.vagueHazards || qualityData.vagueHazards.count === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <CheckCircle size={32} className="text-green-500 mx-auto mb-2" />
                <span className="text-sm text-green-600 font-medium">All Clear</span>
              </div>
            </div>
          ) : (
            <>
              {/* Summary bar with View All */}
              <div className="mb-3 p-2 bg-yellow-50 rounded-lg flex items-center justify-between">
                <span className="text-xs text-yellow-700">{qualityData.vagueHazards.percentage}% of records</span>
                <button
                  onClick={() => openDrillDown(
                    `All Vague Descriptions (${qualityData.vagueHazards.count} records)`,
                    qualityData.vagueHazards.records.map(r => r.incident),
                    ['Data Quality', 'Vague Hazards', 'All Records'],
                    { totalRecords: qualityData.vagueHazards.count }
                  )}
                  className="text-xs font-medium text-yellow-700 hover:text-yellow-900 flex items-center gap-1"
                >
                  <Eye size={12} />
                  View All
                </button>
              </div>

              {/* Floating chips for ALL vague terms */}
              <div className="flex-1 overflow-y-auto max-h-[180px]">
                <div className="flex flex-wrap gap-2">
                  {qualityData.vagueHazards.summary?.topVagueTerms?.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        // Find records containing this vague term
                        const matchingRecords = qualityData.vagueHazards.records.filter(r =>
                          r.vagueTerms.some(t => t.term.toLowerCase() === item.term.toLowerCase())
                        )
                        openDrillDown(
                          `Vague Term: "${item.term}" (${item.count} records)`,
                          matchingRecords.map(r => r.incident),
                          ['Data Quality', 'Vague Hazards', item.term],
                          { vagueTerm: item.term }
                        )
                      }}
                      className="px-3 py-1.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors cursor-pointer"
                      title={`${item.count} record${item.count > 1 ? 's' : ''} using "${item.term}"`}
                    >
                      "{item.term}" ({item.count})
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ROW 2: Needs Review & Description Quality (2 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Needs Review (Unclassifiable + Flagged Records) */}
        <div className="bg-white border border-surface-200 rounded-lg p-3 shadow-soft flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-safety-critical-light rounded-lg">
                <AlertTriangle size={16} className="text-safety-critical" />
              </div>
              <span className="text-xs font-semibold text-surface-700 uppercase tracking-wide">Needs Review</span>
              <InfoTooltip text="HOW UNCLASSIFIABLE RECORDS ARE IDENTIFIED: When we try to automatically categorize observations into hazard types, some records don't contain enough information to determine the correct category. This happens when: the description is too short, the description is too vague, no recognizable hazard keywords are present, or the hazard type is very unusual. WHY THIS MATTERS: These records are essentially 'unknown' in your data - they can't be properly analyzed or included in hazard trending. Review these records and consider adding better descriptions or manually assigning hazard categories to improve your data completeness." />
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${
                (qualityData.unclassifiableRecords?.total || 0) > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {qualityData.unclassifiableRecords?.total || 0}
              </div>
              <div className="text-xs text-surface-500">
                {(qualityData.unclassifiableRecords?.totalReviewed || 0) > 0
                  ? `${qualityData.unclassifiableRecords.totalReviewed} reviewed`
                  : 'records'
                }
              </div>
            </div>
          </div>

          {(!qualityData.unclassifiableRecords || qualityData.unclassifiableRecords.total === 0) ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <CheckCircle size={32} className="text-green-500 mx-auto mb-2" />
                <span className="text-sm text-green-600 font-medium">All Clear</span>
              </div>
            </div>
          ) : (
            <>
              {/* Visual breakdown with progress bars */}
              <div className="flex-1 space-y-3">
                {/* No Description */}
                {qualityData.unclassifiableRecords?.byReason?.noDescription?.count > 0 && (
                  <div
                    className="group cursor-pointer hover:bg-surface-50 rounded p-1 -m-1"
                    onClick={() => handleUnclassifiableDrillDown('noDescription')}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-surface-600 group-hover:text-surface-800">No Description</span>
                      <span className="text-sm font-bold text-surface-700">{qualityData.unclassifiableRecords.byReason.noDescription.count}</span>
                    </div>
                    <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${Math.max(5, Math.min(100, (qualityData.unclassifiableRecords.byReason.noDescription.count / (qualityData.unclassifiableRecords?.total || 1)) * 100))}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Too Short */}
                {qualityData.unclassifiableRecords?.byReason?.tooShort?.count > 0 && (
                  <div
                    className="group cursor-pointer hover:bg-surface-50 rounded p-1 -m-1"
                    onClick={() => handleUnclassifiableDrillDown('tooShort')}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-surface-600 group-hover:text-surface-800">Too Short</span>
                      <span className="text-sm font-bold text-surface-700">{qualityData.unclassifiableRecords.byReason.tooShort.count}</span>
                    </div>
                    <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${Math.max(5, Math.min(100, (qualityData.unclassifiableRecords.byReason.tooShort.count / (qualityData.unclassifiableRecords?.total || 1)) * 100))}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Unrecognized Category */}
                {qualityData.unclassifiableRecords?.byReason?.unrecognizedCategory?.count > 0 && (
                  <div
                    className="group cursor-pointer hover:bg-surface-50 rounded p-1 -m-1"
                    onClick={() => handleUnclassifiableDrillDown('unrecognizedCategory')}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-surface-600 group-hover:text-surface-800">Unrecognized</span>
                      <span className="text-sm font-bold text-surface-700">{qualityData.unclassifiableRecords.byReason.unrecognizedCategory.count}</span>
                    </div>
                    <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${Math.max(5, Math.min(100, (qualityData.unclassifiableRecords.byReason.unrecognizedCategory.count / (qualityData.unclassifiableRecords?.total || 1)) * 100))}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Low Confidence */}
                {qualityData.unclassifiableRecords?.byReason?.lowConfidence?.count > 0 && (
                  <div
                    className="group cursor-pointer hover:bg-surface-50 rounded p-1 -m-1"
                    onClick={() => handleUnclassifiableDrillDown('lowConfidence')}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-surface-600 group-hover:text-surface-800">Low Confidence</span>
                      <span className="text-sm font-bold text-surface-700">{qualityData.unclassifiableRecords.byReason.lowConfidence.count}</span>
                    </div>
                    <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${Math.max(5, Math.min(100, (qualityData.unclassifiableRecords.byReason.lowConfidence.count / (qualityData.unclassifiableRecords?.total || 1)) * 100))}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Historical/Placeholder (Enablon legacy) */}
                {qualityData.unclassifiableRecords?.byReason?.historicalPlaceholder?.count > 0 && (
                  <div
                    className="group cursor-pointer hover:bg-surface-50 rounded p-1 -m-1"
                    onClick={() => handleUnclassifiableDrillDown('historicalPlaceholder')}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-surface-600 group-hover:text-surface-800">Historical/Placeholder</span>
                      <span className="text-sm font-bold text-surface-700">{qualityData.unclassifiableRecords.byReason.historicalPlaceholder.count}</span>
                    </div>
                    <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full transition-all"
                        style={{ width: `${Math.max(5, Math.min(100, (qualityData.unclassifiableRecords.byReason.historicalPlaceholder.count / (qualityData.unclassifiableRecords?.total || 1)) * 100))}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Restricted Classification (blocked by generic "Other" source) */}
                {qualityData.unclassifiableRecords?.byReason?.restrictedClassification?.count > 0 && (
                  <div
                    className="group cursor-pointer hover:bg-surface-50 rounded p-1 -m-1"
                    onClick={() => handleUnclassifiableDrillDown('restrictedClassification')}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-surface-600 group-hover:text-surface-800">Restricted</span>
                      <span className="text-sm font-bold text-surface-700">{qualityData.unclassifiableRecords.byReason.restrictedClassification.count}</span>
                    </div>
                    <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all"
                        style={{ width: `${Math.max(5, Math.min(100, (qualityData.unclassifiableRecords.byReason.restrictedClassification.count / (qualityData.unclassifiableRecords?.total || 1)) * 100))}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Review progress */}
              {(qualityData.unclassifiableRecords?.totalReviewed || 0) > 0 && (
                <div className="mt-3 pt-2 border-t border-surface-200">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-surface-500">Review Progress</span>
                    <span className="font-bold text-green-600">
                      {qualityData.unclassifiableRecords.totalReviewed}/{qualityData.unclassifiableRecords.totalDetected}
                    </span>
                  </div>
                  <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${Math.round((qualityData.unclassifiableRecords.totalReviewed / qualityData.unclassifiableRecords.totalDetected) * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="mt-3 pt-2 border-t border-surface-200 text-center">
                <span className="text-xs text-surface-500">Click any category to view records</span>
              </div>
            </>
          )}
        </div>

        {/* Description Length Distribution */}
        <div className="bg-white border border-surface-200 rounded-lg p-3 shadow-soft flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-safety-info-light rounded-lg">
                <AlignLeft size={16} className="text-safety-info" />
              </div>
              <span className="text-xs font-semibold text-surface-700 uppercase tracking-wide">Description Quality</span>
              <InfoTooltip text="HOW WORD COUNT IS MEASURED: We simply count the number of words in each observation's description. The bars show how many observations fall into each length category. SHORT (1-15 words): Often too brief to be useful - may just be a sentence fragment. MEDIUM (16-50 words): A good target range - enough to explain the situation. LONG (51+ words): Very detailed - excellent for serious issues. WHY THIS MATTERS: Research shows that observations with more words tend to contain more actionable information. Very short descriptions often miss important context. This chart helps you see if your reporters are generally providing enough detail." />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">{description.qualityRate}%</div>
              <div className="text-xs text-surface-500">quality rate</div>
            </div>
          </div>

          {/* Summary stats */}
          <div className="mb-3 p-2 bg-surface-50 rounded-lg flex items-center justify-between text-xs">
            <span className="text-surface-600">Avg {description.avgWordCount} words per description</span>
            <span className="font-bold text-surface-700">{description.distribution.good + description.distribution.excellent} good+</span>
          </div>

          {/* Distribution bars */}
          <div className="flex-1 space-y-2">
            {[
              { label: '0-5 words', value: description.distribution.veryShort, range: 'veryShort' },
              { label: '6-15 words', value: description.distribution.short, range: 'short' },
              { label: '16-30 words', value: description.distribution.good, range: 'good' },
              { label: '31+ words', value: description.distribution.excellent, range: 'excellent' }
            ].map((item) => (
              <div
                key={item.label}
                className="group cursor-pointer hover:bg-surface-50 rounded px-2 py-1.5 -mx-2 transition-colors"
                onClick={() => handleDescriptionDrillDown(item.range, item.label)}
                title={`Click to view ${item.value} records`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-surface-600 group-hover:text-surface-800">{item.label}</span>
                  <span className="text-sm font-bold text-surface-700">{item.value}</span>
                </div>
                <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${Math.max(2, (item.value / filteredIncidents.length) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-3 pt-2 border-t border-surface-200 text-center">
            <span className="text-xs text-surface-500">Click any bar to view records</span>
          </div>
        </div>
      </div>

      {/* SECTION: Potential Misclassifications */}
      {misclassificationData && misclassificationData.totalMisclassified > 0 && (
        <div className="bg-white border border-surface-200 rounded-lg p-3 shadow-soft">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-medium text-surface-500 uppercase tracking-wide flex items-center gap-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              <AlertTriangle size={16} className="text-surface-600" />
              Potential Misclassifications
              <InfoTooltip text="HOW MISCLASSIFICATIONS ARE DETECTED: We read each observation's description and use keyword analysis to determine what hazard category it SHOULD be in. Then we compare this to what category it's ACTUALLY assigned to. When they don't match, it's flagged as a potential misclassification. Example: A description about 'ladder without proper footing' is about Working at Height, but might have been marked as 'Manual Handling'. WHY THIS MATTERS: Misclassified records throw off your hazard statistics. If you're tracking 'Working at Height' incidents but some are hidden in other categories, you won't see the true picture. Review these and correct the categories to improve data accuracy." />
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                {misclassificationData.totalMisclassified}
              </span>
            </h3>
          </div>

          {/* KPI Cards */}
          <div className={`grid gap-3 mb-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
            <div className="bg-surface-50 rounded-lg p-3 text-center">
              <div className={`font-bold text-surface-800 ${isMobile ? 'text-xl' : 'text-2xl'}`}>{misclassificationData.totalMisclassified}</div>
              <div className="text-xs text-surface-500">Total Found</div>
            </div>
            <div className="bg-red-50 rounded-lg p-3 text-center">
              <div className={`font-bold text-red-700 ${isMobile ? 'text-xl' : 'text-2xl'}`}>{misclassificationData.summary.highConfidence}</div>
              <div className="text-xs text-surface-500">High Confidence</div>
            </div>
            <div className="bg-amber-50 rounded-lg p-3 text-center">
              <div className={`font-bold text-amber-700 ${isMobile ? 'text-xl' : 'text-2xl'}`}>{misclassificationData.summary.mediumConfidence}</div>
              <div className="text-xs text-surface-500">Medium Confidence</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <div className={`font-bold text-blue-700 ${isMobile ? 'text-xl' : 'text-2xl'}`}>{misclassificationData.percentageOfTotal}%</div>
              <div className="text-xs text-surface-500">% of Records</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-3 border-b border-surface-200">
            <button
              onClick={() => setMisclassificationTab('detailed')}
              className={`px-3 py-1.5 text-xs font-medium rounded-t transition-colors ${
                misclassificationTab === 'detailed'
                  ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500'
                  : 'text-surface-500 hover:text-surface-700 hover:bg-surface-50'
              }`}
            >
              All Records ({misclassificationData.misclassifiedRecords.length})
            </button>
            <button
              onClick={() => setMisclassificationTab('byCurrent')}
              className={`px-3 py-1.5 text-xs font-medium rounded-t transition-colors ${
                misclassificationTab === 'byCurrent'
                  ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500'
                  : 'text-surface-500 hover:text-surface-700 hover:bg-surface-50'
              }`}
            >
              By Current Category ({misclassificationData.byCurrentCategory.length})
            </button>
            <button
              onClick={() => setMisclassificationTab('bySuggested')}
              className={`px-3 py-1.5 text-xs font-medium rounded-t transition-colors ${
                misclassificationTab === 'bySuggested'
                  ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500'
                  : 'text-surface-500 hover:text-surface-700 hover:bg-surface-50'
              }`}
            >
              By Suggested Category ({misclassificationData.bySuggestedCategory.length})
            </button>
          </div>

          {/* Tab Content - All Records */}
          {misclassificationTab === 'detailed' && (
            <div className="overflow-auto max-h-80">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-surface-50 z-10">
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
                  {misclassificationData.misclassifiedRecords.map((record, idx) => (
                    <tr
                      key={record.id || idx}
                      className={`${idx % 2 === 0 ? 'bg-white' : 'bg-surface-50'} hover:bg-blue-50 cursor-pointer`}
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
                        <Eye size={14} className="text-blue-600 inline" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab Content - By Current Category */}
          {misclassificationTab === 'byCurrent' && (
            <div className="overflow-auto max-h-80">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-surface-50 z-10">
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
                      className={`${idx % 2 === 0 ? 'bg-white' : 'bg-surface-50'} hover:bg-blue-50 cursor-pointer`}
                      onClick={() => handleMisclassificationCategoryDrillDown(cat, 'current')}
                    >
                      <td className="p-2">
                        <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs">
                          {cat.category}
                        </span>
                      </td>
                      <td className="p-2 text-right font-medium">{cat.count}</td>
                      <td className="p-2 text-center">
                        <Eye size={14} className="text-blue-600 inline" />
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
                <thead className="sticky top-0 bg-surface-50 z-10">
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
                      className={`${idx % 2 === 0 ? 'bg-white' : 'bg-surface-50'} hover:bg-blue-50 cursor-pointer`}
                      onClick={() => handleMisclassificationCategoryDrillDown(cat, 'suggested')}
                    >
                      <td className="p-2">
                        <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                          {cat.category}
                        </span>
                      </td>
                      <td className="p-2 text-right font-medium">{cat.count}</td>
                      <td className="p-2 text-center">
                        <Eye size={14} className="text-blue-600 inline" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SECTION: Import Classification Review */}
      {classificationReviewData && (
        <div className="bg-white border border-surface-200 rounded-lg p-3 shadow-soft">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-surface-700 uppercase tracking-wide flex items-center gap-2">
              <Tag size={14} className="text-blue-600" />
              Import Classification Review
              <InfoTooltip text="HOW AUTO-CLASSIFICATION WORKS: When you import data, some observations may have blank hazard categories or just say 'Other'. The system automatically reads the description and assigns an appropriate hazard category based on keywords it finds. For example, if the description mentions 'scaffolding' or 'ladder', it gets classified as 'Working at Height'. The table shows which keywords triggered each auto-classification. WHY THIS MATTERS: Auto-classification helps fill in missing data so your analysis is more complete. However, it's not perfect - keywords can sometimes be misleading. Review the matches to verify the system got it right, especially for high-priority hazard categories." />
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                {classificationReviewData.totalAutoClassified}
              </span>
            </h3>
            <button
              onClick={() => setShowClassificationReview(!showClassificationReview)}
              className={`flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors ${
                isMobile ? 'h-11 px-3 bg-blue-50 rounded-lg active:bg-blue-100' : ''
              }`}
            >
              {showClassificationReview ? 'Hide' : 'View'} Details
              {showClassificationReview ? <ChevronUp size={isMobile ? 18 : 16} /> : <ChevronDown size={isMobile ? 18 : 16} />}
            </button>
          </div>

          {/* Summary Stats Row - always visible */}
          <div className={`grid gap-3 mb-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-5'}`}>
            <div className="bg-blue-50 rounded-lg p-2 text-center">
              <div className={`font-bold text-blue-700 ${isMobile ? 'text-base' : 'text-lg'}`}>{classificationReviewData.totalAutoClassified}</div>
              <div className="text-xs text-surface-500">Auto-Classified</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-2 text-center">
              <div className={`font-bold text-blue-700 ${isMobile ? 'text-base' : 'text-lg'}`}>{classificationReviewData.percentageOfImport}%</div>
              <div className="text-xs text-surface-500">% of Import</div>
            </div>
            <div className="bg-surface-50 rounded-lg p-2 text-center">
              <div className={`font-bold text-surface-700 ${isMobile ? 'text-base' : 'text-lg'}`}>{classificationReviewData.summary.fromBlank}</div>
              <div className="text-xs text-surface-500">From Blank</div>
            </div>
            <div className="bg-surface-50 rounded-lg p-2 text-center">
              <div className={`font-bold text-surface-700 ${isMobile ? 'text-base' : 'text-lg'}`}>{classificationReviewData.summary.fromOther}</div>
              <div className="text-xs text-surface-500">From Other</div>
            </div>
            <div className={`bg-green-50 rounded-lg p-2 text-center ${isMobile ? 'col-span-2' : ''}`}>
              <div className={`font-bold text-green-700 ${isMobile ? 'text-base' : 'text-lg'}`}>{classificationReviewData.summary.highConfidence}</div>
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

      {/* SECTION: Contractor Performance (Full Width) */}
      <div className="bg-white border border-surface-200 rounded-lg p-3 shadow-soft">
        <div className={isMobile ? 'space-y-3 mb-4' : 'flex items-center justify-between mb-4'}>
          <div className="flex items-center justify-between">
            <h3 className={`font-medium text-surface-500 uppercase tracking-wide flex items-center gap-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              <Building2 size={16} />
              Contractor Performance
              <InfoTooltip text="HOW CONTRACTOR METRICS ARE CALCULATED: For each contractor, we analyze all their observations to calculate: TOTAL OBS: How many observations they've submitted. REPORTERS: Number of unique reporters from that contractor. QUALITY RATE: Average quality of their descriptions. NM RATE: Near-miss reporting rate. SCORE: Composite quality score. FLAGS: Low Quality (quality rate < 30%), Zero NM (no near-misses with 10+ obs), Top Performer (score >= 70 with 10+ obs). Click any row to see detailed analytics for that contractor." />
            </h3>
            {isMobile && (
              <select
                value={contractorSort}
                onChange={(e) => setContractorSort(e.target.value)}
                className="text-xs border border-surface-200 rounded px-2 py-1 h-9"
              >
                <option value="totalObs">By Total</option>
                <option value="qualityScore">By Score</option>
              </select>
            )}
          </div>
          <div className={isMobile ? 'flex items-center gap-2 flex-wrap' : 'flex items-center gap-3'}>
            {/* Search Bar */}
            <div className="relative">
              <Search
                className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-surface-400"
                size={14}
              />
              <input
                type="text"
                placeholder="Search contractors..."
                value={contractorSearch}
                onChange={(e) => setContractorSearch(e.target.value)}
                className={`pl-8 pr-8 py-1.5 text-xs border border-surface-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                  isMobile ? 'w-36' : 'w-44'
                }`}
              />
              {contractorSearch && (
                <button
                  onClick={() => setContractorSearch('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-surface-400 hover:text-surface-600"
                >
                  <X size={12} />
                </button>
              )}
            </div>
            {contractorSearch && (
              <span className="text-xs text-surface-500">
                Showing {sortedContractors.length} of {contractors.length}
              </span>
            )}
            {/* Performance Flags Summary */}
            <div className={`flex items-center gap-2 text-xs ${isMobile ? 'flex-wrap' : ''}`}>
              <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded">
                <AlertTriangle size={12} />
                {contractors.filter(c => parseFloat(c.qualityRate || 0) < 30).length} {isMobile ? 'Low' : 'Low Quality'}
              </span>
              <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded">
                <Target size={12} />
                {contractors.filter(c => parseFloat(c.classificationAccuracy) < 85).length} {isMobile ? 'Acc' : 'Low Accuracy'}
              </span>
              <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                <AlertCircle size={12} />
                {contractors.filter(c => c.nearMissRate === 0 && c.totalObs >= 10).length} {isMobile ? 'NM' : 'Zero NM'}
              </span>
              <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded">
                <CheckCircle size={12} />
                {contractors.filter(c => c.qualityScore >= 70 && c.totalObs >= 10).length} {isMobile ? 'Top' : 'Top Performers'}
              </span>
            </div>
            {!isMobile && (
              <select
                value={contractorSort}
                onChange={(e) => setContractorSort(e.target.value)}
                className="text-xs border border-surface-200 rounded px-2 py-1"
              >
                <option value="totalObs">Sort by Total</option>
                <option value="qualityScore">Sort by Score</option>
              </select>
            )}
          </div>
        </div>

        {/* KPI Cards */}
        <div className={`grid gap-3 mb-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
          <div className="bg-surface-50 rounded-lg p-3 text-center">
            <div className={`font-bold text-surface-800 ${isMobile ? 'text-xl' : 'text-2xl'}`}>{contractors.length}</div>
            <div className="text-xs text-surface-500">Total Contractors</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className={`font-bold text-blue-700 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
              {contractors.filter(c => c.totalObs >= 10).length}
            </div>
            <div className="text-xs text-surface-500">Active (10+ obs)</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className={`font-bold text-green-700 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
              {contractors.length > 0 ? (contractors.reduce((sum, c) => sum + parseFloat(c.qualityRate || 0), 0) / contractors.length).toFixed(0) : 0}%
            </div>
            <div className="text-xs text-surface-500">Avg Quality Rate</div>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 text-center">
            <div className={`font-bold text-amber-700 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
              {contractors.length > 0 ? (contractors.reduce((sum, c) => sum + c.totalObs, 0) / contractors.length).toFixed(0) : 0}
            </div>
            <div className="text-xs text-surface-500">Avg Obs/Contractor</div>
          </div>
        </div>

        {/* Contractor Table */}
        {isMobile ? (
          /* Mobile Card View */
          <div className="space-y-2 max-h-80 overflow-auto">
            {sortedContractors.map((contractor) => {
              const lowQuality = parseFloat(contractor.qualityRate || 0) < 30
              const zeroNM = contractor.nearMissRate === 0 && contractor.totalObs >= 10
              const topPerformer = contractor.qualityScore >= 70 && contractor.totalObs >= 10
              const lowAccuracy = parseFloat(contractor.classificationAccuracy) < 85
              return (
                <div
                  key={contractor.name}
                  onClick={() => handleContractorDrillDown(contractor)}
                  className="p-3 bg-surface-50 rounded-lg cursor-pointer active:bg-surface-100 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-blue-600 truncate flex-1">{contractor.name}</span>
                    <div className="flex gap-1 ml-2">
                      {lowQuality && <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px]">Low Q</span>}
                      {lowAccuracy && <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px]">Low Acc</span>}
                      {zeroNM && <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded text-[10px]">0 NM</span>}
                      {topPerformer && <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px]">Star</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-surface-500">
                    <span><strong>{contractor.totalObs}</strong> obs</span>
                    <span className={
                      contractor.qualityScore >= 70 ? 'text-green-600' :
                      contractor.qualityScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                    }>
                      Score: <strong>{contractor.qualityScore}</strong>
                    </span>
                    <span className={
                      parseFloat(contractor.classificationAccuracy) >= 95 ? 'text-green-600' :
                      parseFloat(contractor.classificationAccuracy) >= 85 ? 'text-yellow-600' : 'text-red-600'
                    }>
                      Acc: <strong>{contractor.classificationAccuracy}%</strong>
                    </span>
                    <span>{contractor.activeReporters} reporters</span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* Desktop Table View */
          <div className="overflow-auto max-h-80">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-surface-50">
                <tr>
                  <th className="text-left p-2 font-medium text-surface-600">Contractor</th>
                  <th className="text-center p-2 font-medium text-surface-600">Total</th>
                  <th className="text-center p-2 font-medium text-surface-600">Reporters</th>
                  <th className="text-center p-2 font-medium text-surface-600">Quality Rate</th>
                  <th className="text-center p-2 font-medium text-surface-600">Accuracy</th>
                  <th className="text-center p-2 font-medium text-surface-600">NM Rate</th>
                  <th className="text-center p-2 font-medium text-surface-600">Score</th>
                  <th className="text-center p-2 font-medium text-surface-600">Flags</th>
                </tr>
              </thead>
              <tbody>
                {sortedContractors.map((contractor, idx) => {
                  const lowQuality = parseFloat(contractor.qualityRate || 0) < 30
                  const zeroNM = contractor.nearMissRate === 0 && contractor.totalObs >= 10
                  const topPerformer = contractor.qualityScore >= 70 && contractor.totalObs >= 10
                  const lowAccuracy = parseFloat(contractor.classificationAccuracy) < 85
                  return (
                    <tr
                      key={contractor.name}
                      className={`${idx % 2 === 0 ? 'bg-white' : 'bg-surface-50'} cursor-pointer hover:bg-blue-50 transition-colors`}
                      onClick={() => handleContractorDrillDown(contractor)}
                      title="Click to view detailed analytics"
                    >
                      <td className="p-2">
                        <span className="text-blue-600 hover:underline font-medium">{contractor.name}</span>
                      </td>
                      <td className="p-2 text-center font-bold">{contractor.totalObs}</td>
                      <td className="p-2 text-center text-surface-600">{contractor.activeReporters}</td>
                      <td className="p-2 text-center">
                        <span className={`font-medium ${
                          parseFloat(contractor.qualityRate || 0) >= 75 ? 'text-green-600' :
                          parseFloat(contractor.qualityRate || 0) >= 50 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {contractor.qualityRate || 0}%
                        </span>
                      </td>
                      <td className="p-2 text-center">
                        <span className={`font-medium ${
                          parseFloat(contractor.classificationAccuracy) >= 95 ? 'text-green-600' :
                          parseFloat(contractor.classificationAccuracy) >= 85 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {contractor.classificationAccuracy}%
                        </span>
                      </td>
                      <td className="p-2 text-center text-surface-500">{contractor.nearMissRate || 0}%</td>
                      <td className="p-2 text-center">
                        <span className={
                          contractor.qualityScore >= 70 ? 'text-green-600' :
                          contractor.qualityScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                        }>
                          {contractor.qualityScore}
                        </span>
                      </td>
                      <td className="p-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {lowQuality && (
                            <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px]" title="Low quality rate">
                              Low Q
                            </span>
                          )}
                          {lowAccuracy && (
                            <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px]" title="Low classification accuracy">
                              Low Acc
                            </span>
                          )}
                          {zeroNM && (
                            <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded text-[10px]" title="No near misses reported">
                              0 NM
                            </span>
                          )}
                          {topPerformer && (
                            <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px]" title="Top performer">
                              Star
                            </span>
                          )}
                          {!lowQuality && !lowAccuracy && !zeroNM && !topPerformer && (
                            <span className="text-surface-300">-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer with quality review recommendation */}
        {contractors.some(c => parseFloat(c.qualityRate || 0) < 30 && c.totalObs >= 10) && (
          <div className="mt-3 pt-3 border-t border-surface-200 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 rounded-lg p-2">
            <AlertTriangle size={14} />
            <span className="font-medium">Quality Review Recommended:</span>
            <span>{contractors.filter(c => parseFloat(c.qualityRate || 0) < 30 && c.totalObs >= 10).length} contractors with 10+ observations have quality rates below 30% - consider a quality improvement discussion.</span>
          </div>
        )}
      </div>

      {/* SECTION: Reporter Performance (Full Width with Flags) */}
      <div className="bg-white border border-surface-200 rounded-lg p-3 shadow-soft">
        <div className={isMobile ? 'space-y-3 mb-4' : 'flex items-center justify-between mb-4'}>
          <div className="flex items-center justify-between">
            <h3 className={`font-medium text-surface-500 uppercase tracking-wide flex items-center gap-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              <Users size={16} />
              Reporter Performance
              <InfoTooltip text="HOW REPORTER METRICS ARE CALCULATED: For each individual reporter, we analyze: TOTAL OBSERVATIONS: How many they've submitted. POSITIVE %: What percentage of their reports are positive observations (recognizing safe behaviors). AVG QUALITY: Average quality score of their descriptions. FLAGS: Special indicators like 'Top Reporter' (high volume), 'Quality Star' (consistently detailed), or concerns like 'Declining' (fewer reports recently) or 'Low Quality' (brief descriptions). Click any row to see detailed analytics for that reporter. WHY THIS MATTERS: Helps identify your safety champions (high reporters), people who may need coaching (low quality), and concerning trends (declining activity) so you can provide targeted support and recognition." />
            </h3>
            {isMobile && (
              <select
                value={reporterSort}
                onChange={(e) => setReporterSort(e.target.value)}
                className="text-xs border border-surface-200 rounded px-2 py-1 h-9"
              >
                <option value="total">By Total</option>
                <option value="nearMiss">By Near Miss</option>
                <option value="quality">By Quality</option>
              </select>
            )}
          </div>
          <div className={isMobile ? 'flex items-center gap-2 flex-wrap' : 'flex items-center gap-3'}>
            {/* Search Bar */}
            <div className="relative">
              <Search
                className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-surface-400"
                size={14}
              />
              <input
                type="text"
                placeholder="Search reporters..."
                value={reporterSearch}
                onChange={(e) => setReporterSearch(e.target.value)}
                className={`pl-8 pr-8 py-1.5 text-xs border border-surface-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                  isMobile ? 'w-36' : 'w-44'
                }`}
              />
              {reporterSearch && (
                <button
                  onClick={() => setReporterSearch('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-surface-400 hover:text-surface-600"
                >
                  <X size={12} />
                </button>
              )}
            </div>
            {reporterSearch && (
              <span className="text-xs text-surface-500">
                Showing {sortedReporters.length} of {reporters.length}
              </span>
            )}
            {/* Performance Flags Summary */}
            <div className={`flex items-center gap-2 text-xs ${isMobile ? 'flex-wrap' : ''}`}>
              <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded">
                <AlertTriangle size={12} />
                {reporters.filter(r => r.nearMiss === 0 && r.total >= 5).length} {isMobile ? 'NM' : 'Zero NM'}
              </span>
              <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                <AlertCircle size={12} />
                {reporters.filter(r => parseFloat(r.qualityRate) < 50).length} {isMobile ? 'Low' : 'Low Quality'}
              </span>
              <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded">
                <Target size={12} />
                {reporters.filter(r => parseFloat(r.classificationAccuracy) < 85).length} {isMobile ? 'Acc' : 'Low Accuracy'}
              </span>
              <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded">
                <CheckCircle size={12} />
                {reporters.filter(r => r.nearMiss > 0 && parseFloat(r.qualityRate) >= 75).length} {isMobile ? 'Top' : 'Top Performers'}
              </span>
            </div>
            {!isMobile && (
              <select
                value={reporterSort}
                onChange={(e) => setReporterSort(e.target.value)}
                className="text-xs border border-surface-200 rounded px-2 py-1"
              >
                <option value="total">Sort by Total</option>
                <option value="nearMiss">Sort by Near Miss</option>
                <option value="quality">Sort by Quality</option>
              </select>
            )}
          </div>
        </div>

        {/* Performance Insights */}
        <div className={`grid gap-3 mb-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
          <div className="bg-surface-50 rounded-lg p-3 text-center">
            <div className={`font-bold text-surface-800 ${isMobile ? 'text-xl' : 'text-2xl'}`}>{reporters.length}</div>
            <div className="text-xs text-surface-500">Total Reporters</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className={`font-bold text-blue-700 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
              {reporters.filter(r => r.total >= 10).length}
            </div>
            <div className="text-xs text-surface-500">Active (10+ obs)</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className={`font-bold text-green-700 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
              {(reporters.reduce((sum, r) => sum + parseFloat(r.qualityRate), 0) / reporters.length).toFixed(0)}%
            </div>
            <div className="text-xs text-surface-500">Avg Quality Rate</div>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 text-center">
            <div className={`font-bold text-amber-700 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
              {(reporters.reduce((sum, r) => sum + r.nearMiss, 0) / reporters.length).toFixed(1)}
            </div>
            <div className="text-xs text-surface-500">Avg NM/Reporter</div>
          </div>
        </div>

        {/* Reporter Table with Flags */}
        {isMobile ? (
          /* Mobile Card View */
          <div className="space-y-2 max-h-80 overflow-auto">
            {sortedReporters.map((reporter) => {
              const nmRate = reporter.total > 0 ? ((reporter.nearMiss / reporter.total) * 100).toFixed(1) : 0
              const hasZeroNM = reporter.nearMiss === 0 && reporter.total >= 5
              const lowQuality = parseFloat(reporter.qualityRate) < 50
              const topPerformer = reporter.nearMiss > 0 && parseFloat(reporter.qualityRate) >= 75 && reporter.total >= 10
              const lowAccuracy = parseFloat(reporter.classificationAccuracy) < 85
              return (
                <div
                  key={reporter.name}
                  onClick={() => handleReporterClick(reporter.name)}
                  className="p-3 bg-surface-50 rounded-lg cursor-pointer active:bg-surface-100 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-blue-600 truncate flex-1">{reporter.name}</span>
                    <div className="flex gap-1 ml-2">
                      {hasZeroNM && <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px]">0 NM</span>}
                      {lowQuality && <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded text-[10px]">Low Q</span>}
                      {lowAccuracy && <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px]">Low Acc</span>}
                      {topPerformer && <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px]">Star</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-surface-500">
                    <span><strong>{reporter.total}</strong> total</span>
                    <span className={reporter.nearMiss === 0 ? 'text-red-600' : 'text-green-600'}>
                      <strong>{reporter.nearMiss}</strong> NM
                    </span>
                    <span className={
                      parseFloat(reporter.qualityRate) >= 75 ? 'text-green-600' :
                      parseFloat(reporter.qualityRate) >= 50 ? 'text-yellow-600' : 'text-red-600'
                    }>
                      <strong>{reporter.qualityRate}%</strong> quality
                    </span>
                    <span className={
                      parseFloat(reporter.classificationAccuracy) >= 95 ? 'text-green-600' :
                      parseFloat(reporter.classificationAccuracy) >= 85 ? 'text-yellow-600' : 'text-red-600'
                    }>
                      <strong>{reporter.classificationAccuracy}%</strong> acc
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* Desktop Table View */
          <div className="overflow-auto max-h-80">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-surface-50">
                <tr>
                  <th className="text-left p-2 font-medium text-surface-600">Reporter</th>
                  <th className="text-center p-2 font-medium text-surface-600">Total</th>
                  <th className="text-center p-2 font-medium text-surface-600">Near Miss</th>
                  <th className="text-center p-2 font-medium text-surface-600">Quality Rate</th>
                  <th className="text-center p-2 font-medium text-surface-600">Accuracy</th>
                  <th className="text-center p-2 font-medium text-surface-600">NM Rate</th>
                  <th className="text-center p-2 font-medium text-surface-600">Flags</th>
                </tr>
              </thead>
              <tbody>
                {sortedReporters.map((reporter, idx) => {
                  const nmRate = reporter.total > 0 ? ((reporter.nearMiss / reporter.total) * 100).toFixed(1) : 0
                  const hasZeroNM = reporter.nearMiss === 0 && reporter.total >= 5
                  const lowQuality = parseFloat(reporter.qualityRate) < 50
                  const topPerformer = reporter.nearMiss > 0 && parseFloat(reporter.qualityRate) >= 75 && reporter.total >= 10
                  const lowAccuracy = parseFloat(reporter.classificationAccuracy) < 85
                  return (
                    <tr
                      key={reporter.name}
                      className={`${idx % 2 === 0 ? 'bg-white' : 'bg-surface-50'} cursor-pointer hover:bg-blue-50 transition-colors`}
                      onClick={() => handleReporterClick(reporter.name)}
                      title="Click to view detailed analytics"
                    >
                      <td className="p-2">
                        <span className="text-blue-600 hover:underline font-medium">{reporter.name}</span>
                      </td>
                      <td className="p-2 text-center font-bold">{reporter.total}</td>
                      <td className="p-2 text-center">
                        <span className={`px-2 py-0.5 rounded ${
                          reporter.nearMiss === 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {reporter.nearMiss}
                        </span>
                      </td>
                      <td className="p-2 text-center">
                        <span className={`font-medium ${
                          parseFloat(reporter.qualityRate) >= 75 ? 'text-green-600' :
                          parseFloat(reporter.qualityRate) >= 50 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {reporter.qualityRate}%
                        </span>
                      </td>
                      <td className="p-2 text-center">
                        <span className={`font-medium ${
                          parseFloat(reporter.classificationAccuracy) >= 95 ? 'text-green-600' :
                          parseFloat(reporter.classificationAccuracy) >= 85 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {reporter.classificationAccuracy}%
                        </span>
                      </td>
                      <td className="p-2 text-center text-surface-500">{nmRate}%</td>
                      <td className="p-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {hasZeroNM && (
                            <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px]" title="No near misses reported - training needed">
                              0 NM
                            </span>
                          )}
                          {lowQuality && (
                            <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded text-[10px]" title="Low description quality">
                              Low Q
                            </span>
                          )}
                          {lowAccuracy && (
                            <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px]" title="Low classification accuracy">
                              Low Acc
                            </span>
                          )}
                          {topPerformer && (
                            <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px]" title="Top performer">
                              Star
                            </span>
                          )}
                          {!hasZeroNM && !lowQuality && !lowAccuracy && !topPerformer && (
                            <span className="text-surface-300">-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer with training suggestion */}
        {reporters.some(r => r.nearMiss === 0 && r.total >= 10) && (
          <div className="mt-3 pt-3 border-t border-surface-200 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 rounded-lg p-2">
            <AlertTriangle size={14} />
            <span className="font-medium">Training Recommended:</span>
            <span>{reporters.filter(r => r.nearMiss === 0 && r.total >= 10).length} reporters with 10+ observations have reported 0 near misses - this may indicate a need for hazard recognition training.</span>
          </div>
        )}
      </div>

      </div>{/* End content wrapper */}

      {/* Reporter Deep Dive Modal */}
      <ReporterModal
        isOpen={!!selectedReporter}
        onClose={() => setSelectedReporter(null)}
        data={reporterDeepDive}
      />

      {/* Contractor Deep Dive Modal */}
      <ContractorModal
        isOpen={!!selectedContractor}
        onClose={() => setSelectedContractor(null)}
        contractorName={selectedContractor}
        filteredIncidents={filteredIncidents}
        allIncidents={incidents}
        excludedReporters={excludedReporters}
        setExcludedReporters={setExcludedReporters}
        misclassificationData={misclassificationData}
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
        source="Data Quality"
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

export default memo(DataQuality)
