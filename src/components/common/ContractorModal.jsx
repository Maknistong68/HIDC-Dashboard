import React, { useMemo, useState } from 'react'
import ModalPortal from './ModalPortal'
import {
  X,
  Building2,
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Users,
  Target,
  BarChart3,
  UserX,
  Check,
  Filter
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'
import useResizable from '../../hooks/useResizable.jsx'
import { getContractorDeepDive } from '../../utils/dataQualityCalculations'

const COLORS = {
  nearMiss: '#3b82f6',
  unsafeCondition: '#6366f1',
  unsafeAct: '#8b5cf6',
  positive: '#22c55e',
  incident: '#ef4444'
}

const ContractorModal = ({
  isOpen,
  onClose,
  contractorName,
  filteredIncidents,
  allIncidents,
  excludedReporters = [],
  setExcludedReporters,
  misclassificationData = null
}) => {
  const [showExclusionPanel, setShowExclusionPanel] = useState(false)

  // Resizable functionality
  const {
    containerRef,
    containerStyle,
    isResizing,
    ResizeHandles
  } = useResizable({
    minWidth: 600,
    minHeight: 500,
    maxWidthPercent: 95,
    maxHeightPercent: 95
  })

  // Get all reporters for this contractor (before exclusion)
  const allContractorReporters = useMemo(() => {
    if (!contractorName || !filteredIncidents) return []
    const contractorIncidents = filteredIncidents.filter(i => i.contractor === contractorName)
    const reporterCounts = {}
    contractorIncidents.forEach(i => {
      const reporter = i.reportedBy || 'Unknown'
      reporterCounts[reporter] = (reporterCounts[reporter] || 0) + 1
    })
    return Object.entries(reporterCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [contractorName, filteredIncidents])

  // Filter incidents by exclusions for this contractor's view
  const filteredForContractor = useMemo(() => {
    if (!filteredIncidents) return []
    return filteredIncidents.filter(i => {
      if (excludedReporters.length > 0 && excludedReporters.includes(i.reportedBy)) return false
      return true
    })
  }, [filteredIncidents, excludedReporters])

  // Calculate contractor deep dive with exclusions applied
  const data = useMemo(() => {
    if (!contractorName || !filteredForContractor || filteredForContractor.length === 0) return null
    return getContractorDeepDive(filteredForContractor, contractorName, allIncidents, misclassificationData)
  }, [contractorName, filteredForContractor, allIncidents, misclassificationData])

  // Toggle reporter exclusion
  const toggleReporterExclusion = (reporterName) => {
    if (excludedReporters.includes(reporterName)) {
      setExcludedReporters(excludedReporters.filter(r => r !== reporterName))
    } else {
      setExcludedReporters([...excludedReporters, reporterName])
    }
  }

  // Clear all exclusions
  const clearExclusions = () => {
    setExcludedReporters([])
  }

  if (!isOpen || !contractorName) return null

  // Show loading/empty state if no data
  if (!data) {
    return (
      <ModalPortal isOpen={true}>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClose() }}
            aria-label="Close modal"
          />
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 text-center">
            <Building2 size={48} className="mx-auto text-surface-300 mb-4" />
            <p className="text-surface-500">No data available for this contractor</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-surface-100 rounded-lg text-surface-700 hover:bg-surface-200"
            >
              Close
            </button>
          </div>
        </div>
      </ModalPortal>
    )
  }

  const pieData = [
    { name: 'Near Miss', value: data.typeBreakdown.nearMiss, color: COLORS.nearMiss },
    { name: 'Unsafe Condition', value: data.typeBreakdown.unsafeCondition, color: COLORS.unsafeCondition },
    { name: 'Unsafe Act', value: data.typeBreakdown.unsafeAct, color: COLORS.unsafeAct },
    { name: 'Positive', value: data.typeBreakdown.positive, color: COLORS.positive },
    { name: 'Incident', value: data.typeBreakdown.incident, color: COLORS.incident }
  ].filter(d => d.value > 0)

  const excludedCount = excludedReporters.filter(r =>
    allContractorReporters.some(cr => cr.name === r)
  ).length

  return (
    <ModalPortal isOpen={true}>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClose() }}
          aria-label="Close modal"
        />

        {/* Modal */}
        <div
          ref={containerRef}
          className={`relative bg-white/95 backdrop-blur-xl border border-surface-200 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${isResizing ? 'select-none' : ''}`}
          style={containerStyle}
        >
        <ResizeHandles />
        {/* Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-surface-200 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <Building2 size={20} className="text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-surface-900">{data.name}</h2>
                <p className="text-sm text-surface-500">
                  {data.total} observations | {data.activeReporters} reporters | Active {data.activeDays} days
                  {excludedCount > 0 && (
                    <span className="ml-2 text-orange-600">({excludedCount} excluded)</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Exclusion Toggle Button */}
              <button
                onClick={() => setShowExclusionPanel(!showExclusionPanel)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showExclusionPanel || excludedCount > 0
                    ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                    : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                }`}
              >
                <UserX size={16} />
                <span className="hidden sm:inline">Exclude Reporters</span>
                {excludedCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-orange-500 text-white rounded-full text-xs">
                    {excludedCount}
                  </span>
                )}
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-surface-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-surface-500" />
              </button>
            </div>
          </div>

          {/* Exclusion Panel */}
          {showExclusionPanel && (
            <div className="mt-4 p-4 bg-orange-50 rounded-xl border border-orange-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-orange-600" />
                  <span className="text-sm font-semibold text-orange-800">
                    Exclude Reporters from Analysis
                  </span>
                </div>
                {excludedCount > 0 && (
                  <button
                    onClick={clearExclusions}
                    className="text-xs text-orange-600 hover:text-orange-800 underline"
                  >
                    Clear all ({excludedCount})
                  </button>
                )}
              </div>
              <p className="text-xs text-orange-700 mb-3">
                Select reporters to exclude (e.g., client observers) to see the contractor's own employee performance.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                {allContractorReporters.map((reporter) => {
                  const isExcluded = excludedReporters.includes(reporter.name)
                  return (
                    <button
                      key={reporter.name}
                      onClick={() => toggleReporterExclusion(reporter.name)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                        isExcluded
                          ? 'bg-orange-200 text-orange-800 border-2 border-orange-400'
                          : 'bg-white text-surface-700 border border-surface-200 hover:border-orange-300'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                        isExcluded
                          ? 'bg-orange-500 border-orange-500'
                          : 'border-surface-300'
                      }`}>
                        {isExcluded && <Check size={12} className="text-white" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">{reporter.name}</div>
                        <div className="text-xs text-surface-500">{reporter.count} obs</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Quick Stats - 6 columns */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-4">
            <div className="bg-blue-50 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-blue-700">{data.total}</div>
              <div className="text-xs text-blue-600">Total Obs</div>
            </div>
            <div className="bg-indigo-50 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-indigo-700">{data.activeReporters}</div>
              <div className="text-xs text-indigo-600">Reporters</div>
            </div>
            <div className="bg-green-50 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-green-700">{data.qualityRate}%</div>
              <div className="text-xs text-green-600">Quality Rate</div>
            </div>
            <div className={`rounded-lg p-2 text-center ${parseFloat(data.classificationAccuracy) >= 95 ? 'bg-green-50' : parseFloat(data.classificationAccuracy) >= 85 ? 'bg-amber-50' : 'bg-red-50'}`}>
              <div className={`text-lg font-bold ${parseFloat(data.classificationAccuracy) >= 95 ? 'text-green-700' : parseFloat(data.classificationAccuracy) >= 85 ? 'text-amber-700' : 'text-red-700'}`}>{data.classificationAccuracy}%</div>
              <div className={`text-xs ${parseFloat(data.classificationAccuracy) >= 95 ? 'text-green-600' : parseFloat(data.classificationAccuracy) >= 85 ? 'text-amber-600' : 'text-red-600'}`}>Accuracy</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-purple-700">{data.nearMissRate}%</div>
              <div className="text-xs text-purple-600">Near Miss Rate</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-orange-700">{data.dailyRate}</div>
              <div className="text-xs text-orange-600">Obs/Active Day</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6" style={{ maxHeight: 'calc(90vh - 280px)' }}>
          {/* Row 1: Type Breakdown + Contractor Comparison */}
          <div className="grid grid-cols-2 gap-4">
            {/* Observation Type Breakdown */}
            <div className="bg-surface-50 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-surface-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                <BarChart3 size={14} />
                Observation Types
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-32 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={50}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Count']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1 text-xs">
                  {pieData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded" style={{ backgroundColor: item.color }}></span>
                      <span className="text-surface-600">{item.name}:</span>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contractor Comparison */}
            <div className="bg-surface-50 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-surface-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Target size={14} />
                vs Contractor Average
              </h3>
              <div className="space-y-3">
                <ComparisonRow
                  label="Total Observations"
                  value={data.comparison.totalVsAvg.contractor}
                  avg={data.comparison.totalVsAvg.avg}
                  better={data.comparison.totalVsAvg.better}
                />
                <ComparisonRow
                  label="Near Miss Rate"
                  value={`${data.comparison.nearMissVsAvg.contractor}%`}
                  avg={`${data.comparison.nearMissVsAvg.avg}%`}
                  better={data.comparison.nearMissVsAvg.better}
                />
                <ComparisonRow
                  label="Quality Rate"
                  value={`${data.comparison.qualityVsAvg.contractor}%`}
                  avg={`${data.comparison.qualityVsAvg.avg}%`}
                  better={data.comparison.qualityVsAvg.better}
                />
                <ComparisonRow
                  label="Active Reporters"
                  value={data.comparison.reportersVsAvg.contractor}
                  avg={data.comparison.reportersVsAvg.avg}
                  better={data.comparison.reportersVsAvg.better}
                />
              </div>
            </div>
          </div>

          {/* Row 2: Top Hazards */}
          <div className="bg-surface-50 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-surface-700 uppercase tracking-wide mb-3 flex items-center gap-2">
              <AlertTriangle size={14} />
              Top Hazards Reported
            </h3>
            {data.topHazards.length > 0 ? (
              <div className="space-y-2">
                {data.topHazards.map((hazard, idx) => {
                  const maxCount = data.topHazards[0]?.count || 1
                  const width = (hazard.count / maxCount) * 100
                  return (
                    <div key={hazard.name} className="relative">
                      <div className="flex items-center justify-between p-2 relative z-10">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-surface-400 w-4">{idx + 1}</span>
                          <span className="text-sm text-surface-700">{hazard.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-surface-500">{hazard.percentage}%</span>
                          <span className="text-sm font-bold text-surface-900">{hazard.count}</span>
                        </div>
                      </div>
                      <div
                        className="absolute top-0 left-0 h-full bg-indigo-100 rounded"
                        style={{ width: `${width}%`, zIndex: 0 }}
                      />
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-surface-400 text-center py-4">No hazard data available</p>
            )}
          </div>

          {/* Row 3: Time Pattern + Description Quality */}
          <div className="grid grid-cols-2 gap-4">
            {/* Time of Reporting */}
            <div className="bg-surface-50 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-surface-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Clock size={14} />
                Time of Reporting
              </h3>
              {data.hasTimeData ? (
                <>
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.hourlyPattern}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="hour" tick={{ fontSize: 8 }} interval={3} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#6366f1" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center justify-center gap-4 mt-2 text-xs">
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 bg-indigo-500 rounded"></span>
                      Day Shift: {data.dayShiftPct}%
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 bg-purple-500 rounded"></span>
                      Night Shift: {data.nightShiftPct}%
                    </span>
                  </div>
                </>
              ) : (
                <div className="h-32 flex items-center justify-center text-surface-400 text-sm">
                  Time data not available
                </div>
              )}
            </div>

            {/* Description Quality */}
            <div className="bg-surface-50 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-surface-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                <FileText size={14} />
                Description Quality
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-surface-600">Avg Word Count</span>
                  <span className="font-bold text-surface-900">{data.avgWordCount} words</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-surface-600">Quality Rate (&gt;15 words)</span>
                  <span className={`font-bold ${parseFloat(data.qualityRate) >= 75 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {data.qualityRate}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-surface-600">Flagged (poor quality)</span>
                  <span className={`font-bold ${data.flaggedCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {data.flaggedCount} records
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-surface-500">
                  <span>Range</span>
                  <span>{data.minWordCount} - {data.maxWordCount} words</span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 4: Active Reporters */}
          <div className="bg-surface-50 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-surface-700 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Users size={14} />
              Active Reporters ({data.topReporters.length})
              {excludedCount > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs">
                  {excludedCount} excluded
                </span>
              )}
            </h3>
            {data.topReporters.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                {data.topReporters.map((reporter) => (
                  <div
                    key={reporter.name}
                    className="bg-white rounded-lg p-2 border border-surface-200"
                  >
                    <div className="text-sm font-medium text-surface-800 truncate" title={reporter.name}>
                      {reporter.name}
                    </div>
                    <div className="flex items-center justify-between text-xs text-surface-500 mt-1">
                      <span>{reporter.count} obs</span>
                      <span>{reporter.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-surface-400 text-center py-4">No reporter data available</p>
            )}
          </div>

          {/* Row 5: Monthly Trend */}
          {data.monthlyTrend.length > 1 && (
            <div className="bg-surface-50 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-surface-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                <TrendingUp size={14} />
                Monthly Activity
              </h3>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Row 6: Data Quality Issues */}
          {(data.flaggedRecords?.length > 0 || data.duplicateDescriptions?.length > 0 || data.vagueDescriptions?.length > 0 || data.misclassifiedRecords?.length > 0) ? (
            <div className="bg-red-50 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                <AlertTriangle size={14} />
                Data Quality Issues
                <span className="ml-auto px-2 py-0.5 bg-red-200 text-red-800 rounded-full text-xs font-bold">
                  {(data.flaggedRecords?.length || 0) + (data.duplicateDescriptions?.length || 0) + (data.vagueDescriptions?.length || 0) + (data.misclassifiedRecords?.length || 0)} issues
                </span>
              </h3>

              {/* Potential Misclassifications */}
              {data.misclassifiedRecords?.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-purple-200 text-purple-700 rounded text-xs font-medium">
                      Potential Misclassifications ({data.misclassifiedRecords.length})
                    </span>
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {data.misclassifiedRecords.slice(0, 5).map((record, idx) => (
                      <div key={record.id || idx} className="bg-white/70 rounded p-2 text-xs">
                        <div className="flex justify-between text-surface-500 mb-1">
                          <span>{record.date} | {record.reporter || 'Unknown'}</span>
                          <span className="text-purple-600 font-medium">{record.confidence}</span>
                        </div>
                        <div className="flex items-center gap-1 text-surface-600 mb-1">
                          <span className="text-red-600 line-through">{record.currentCategory}</span>
                          <span className="text-surface-400">→</span>
                          <span className="text-green-600 font-medium">{record.suggestedCategory}</span>
                        </div>
                        <p className="text-surface-700 italic truncate">"{record.description?.substring(0, 80) || '(empty)'}..."</p>
                      </div>
                    ))}
                    {data.misclassifiedRecords.length > 5 && (
                      <div className="text-xs text-purple-500 text-center">+{data.misclassifiedRecords.length - 5} more</div>
                    )}
                  </div>
                </div>
              )}

              {/* Short Descriptions */}
              {data.flaggedRecords?.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-red-200 text-red-700 rounded text-xs font-medium">
                      Short Descriptions ({data.flaggedRecords.length})
                    </span>
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {data.flaggedRecords.slice(0, 5).map((record, idx) => (
                      <div key={record.id || idx} className="bg-white/70 rounded p-2 text-xs">
                        <div className="flex justify-between text-surface-500 mb-1">
                          <span>{record.date} | {record.reporter || 'Unknown'}</span>
                          <span className="text-red-600 font-medium">{record.wordCount} words</span>
                        </div>
                        <p className="text-surface-700 italic truncate">"{record.description || '(empty)'}"</p>
                      </div>
                    ))}
                    {data.flaggedRecords.length > 5 && (
                      <div className="text-xs text-red-500 text-center">+{data.flaggedRecords.length - 5} more</div>
                    )}
                  </div>
                </div>
              )}

              {/* Duplicate Descriptions */}
              {data.duplicateDescriptions?.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-orange-200 text-orange-700 rounded text-xs font-medium">
                      Duplicate/Copy-Paste ({data.duplicateDescriptions.length})
                    </span>
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {data.duplicateDescriptions.slice(0, 5).map((record, idx) => (
                      <div key={record.id || idx} className="bg-white/70 rounded p-2 text-xs">
                        <div className="flex justify-between text-surface-500 mb-1">
                          <span>{record.date} | {record.reporter || 'Unknown'}</span>
                          <span className="text-orange-600 font-medium">Used {record.duplicateCount}x</span>
                        </div>
                        <p className="text-surface-700 italic truncate">"{record.description?.substring(0, 80) || '(empty)'}..."</p>
                      </div>
                    ))}
                    {data.duplicateDescriptions.length > 5 && (
                      <div className="text-xs text-orange-500 text-center">+{data.duplicateDescriptions.length - 5} more</div>
                    )}
                  </div>
                </div>
              )}

              {/* Vague Descriptions */}
              {data.vagueDescriptions?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-surface-300 text-surface-700 rounded text-xs font-medium">
                      Vague/Unclear ({data.vagueDescriptions.length})
                    </span>
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {data.vagueDescriptions.slice(0, 5).map((record, idx) => (
                      <div key={record.id || idx} className="bg-white/70 rounded p-2 text-xs">
                        <div className="flex justify-between text-surface-500 mb-1">
                          <span>{record.date} | {record.reporter || 'Unknown'}</span>
                          <span className="text-surface-600 font-medium">{record.confidence}% confidence</span>
                        </div>
                        <p className="text-surface-700 italic truncate">"{record.description?.substring(0, 80) || '(empty)'}..."</p>
                      </div>
                    ))}
                    {data.vagueDescriptions.length > 5 && (
                      <div className="text-xs text-surface-500 text-center">+{data.vagueDescriptions.length - 5} more</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-green-50 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2 flex items-center gap-2">
                <CheckCircle size={14} />
                Data Quality
              </h3>
              <p className="text-sm text-green-600">No data quality issues found for this contractor.</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </ModalPortal>
  )
}

// Comparison Row Component
const ComparisonRow = ({ label, value, avg, better }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-surface-600">{label}</span>
    <div className="flex items-center gap-2">
      <span className={`font-bold ${better ? 'text-green-600' : 'text-surface-700'}`}>{value}</span>
      <span className="text-surface-400">vs</span>
      <span className="text-surface-500">{avg}</span>
      {better ? (
        <CheckCircle size={14} className="text-green-500" />
      ) : (
        <span className="w-3.5 h-3.5" />
      )}
    </div>
  </div>
)

export default ContractorModal
