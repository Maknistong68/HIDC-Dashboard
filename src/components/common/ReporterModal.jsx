import { memo } from 'react'
import ModalPortal from './ModalPortal'
import {
  X,
  User,
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Target,
  BarChart3
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

const COLORS = {
  nearMiss: '#3b82f6',
  unsafeCondition: '#6366f1',
  unsafeAct: '#8b5cf6',
  positive: '#22c55e',
  incident: '#ef4444'
}

const ReporterModal = ({ isOpen, onClose, data }) => {
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

  if (!isOpen || !data) {
    return null
  }

  const pieData = [
    { name: 'Near Miss', value: data.typeBreakdown.nearMiss, color: COLORS.nearMiss },
    { name: 'Unsafe Condition', value: data.typeBreakdown.unsafeCondition, color: COLORS.unsafeCondition },
    { name: 'Unsafe Act', value: data.typeBreakdown.unsafeAct, color: COLORS.unsafeAct },
    { name: 'Positive', value: data.typeBreakdown.positive, color: COLORS.positive },
    { name: 'Incident', value: data.typeBreakdown.incident, color: COLORS.incident }
  ].filter(d => d.value > 0)

  return (
    <ModalPortal isOpen={true}>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
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
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User size={20} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-surface-900">{data.name}</h2>
                <p className="text-sm text-surface-500">
                  {data.total} observations | Active {data.activeDays} days
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-surface-500" />
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-5 gap-3 mt-4">
            <div className="bg-blue-50 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-blue-700">{data.total}</div>
              <div className="text-xs text-blue-600">Total Obs</div>
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
        <div className="overflow-y-auto p-6 space-y-6" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          {/* Row 1: Type Breakdown + Team Comparison */}
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

            {/* Team Comparison */}
            <div className="bg-surface-50 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-surface-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Target size={14} />
                vs Team Average
              </h3>
              <div className="space-y-3">
                <ComparisonRow
                  label="Total Observations"
                  reporter={data.comparison.totalVsAvg.reporter}
                  team={data.comparison.totalVsAvg.team}
                  better={data.comparison.totalVsAvg.better}
                />
                <ComparisonRow
                  label="Near Miss Rate"
                  reporter={`${data.comparison.nearMissVsAvg.reporter}%`}
                  team={`${data.comparison.nearMissVsAvg.team}%`}
                  better={data.comparison.nearMissVsAvg.better}
                />
                <ComparisonRow
                  label="Quality Rate"
                  reporter={`${data.comparison.qualityVsAvg.reporter}%`}
                  team={`${data.comparison.qualityVsAvg.team}%`}
                  better={data.comparison.qualityVsAvg.better}
                />
                <ComparisonRow
                  label="Daily Rate"
                  reporter={data.comparison.dailyRateVsAvg.reporter}
                  team={data.comparison.dailyRateVsAvg.team}
                  better={data.comparison.dailyRateVsAvg.better}
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
                        className="absolute top-0 left-0 h-full bg-blue-100 rounded"
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
                        <Bar dataKey="count" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center justify-center gap-4 mt-2 text-xs">
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 bg-blue-500 rounded"></span>
                      Day Shift: {data.dayShiftPct}%
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 bg-indigo-500 rounded"></span>
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

          {/* Row 4: Monthly Trend */}
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
                    <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Row 5: Data Quality Issues */}
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
                          <span>{record.date}</span>
                          <span className="text-purple-600 font-medium">{record.confidence}</span>
                        </div>
                        <div className="flex items-center gap-1 text-surface-600 mb-1">
                          <span className="text-red-600 line-through">{record.currentCategory}</span>
                          <span className="text-surface-400">→</span>
                          <span className="text-green-600 font-medium">{record.suggestedCategory}</span>
                        </div>
                        <p className="text-surface-700 italic truncate">&quot;{record.description?.substring(0, 80) || '(empty)'}&hellip;&quot;</p>
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
                          <span>{record.date}</span>
                          <span className="text-red-600 font-medium">{record.wordCount} words</span>
                        </div>
                        <p className="text-surface-700 italic truncate">&quot;{record.description || '(empty)'}&quot;</p>
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
                          <span>{record.date}</span>
                          <span className="text-orange-600 font-medium">Used {record.duplicateCount}x</span>
                        </div>
                        <p className="text-surface-700 italic truncate">&quot;{record.description?.substring(0, 80) || '(empty)'}&hellip;&quot;</p>
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
                          <span>{record.date}</span>
                          <span className="text-surface-600 font-medium">{record.confidence}% confidence</span>
                        </div>
                        <p className="text-surface-700 italic truncate">&quot;{record.description?.substring(0, 80) || '(empty)'}&hellip;&quot;</p>
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
              <p className="text-sm text-green-600">No data quality issues found for this reporter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </ModalPortal>
  )
}

// Comparison Row Component
const ComparisonRow = ({ label, reporter, team, better }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-surface-600">{label}</span>
    <div className="flex items-center gap-2">
      <span className={`font-bold ${better ? 'text-green-600' : 'text-surface-700'}`}>{reporter}</span>
      <span className="text-surface-400">vs</span>
      <span className="text-surface-500">{team}</span>
      {better ? (
        <CheckCircle size={14} className="text-green-500" />
      ) : (
        <span className="w-3.5 h-3.5" />
      )}
    </div>
  </div>
)

export default memo(ReporterModal)
