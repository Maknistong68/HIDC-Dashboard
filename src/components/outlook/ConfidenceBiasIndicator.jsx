import React from 'react'
import { Shield, AlertTriangle, CheckCircle, Eye, ClipboardList, AlertCircle, FileWarning } from 'lucide-react'

/**
 * Source type icons
 */
const SOURCE_CONFIG = {
  inspections: { icon: ClipboardList, label: 'Inspections', color: 'bg-blue-500' },
  observations: { icon: Eye, label: 'Observations', color: 'bg-green-500' },
  incidents: { icon: AlertCircle, label: 'Incidents', color: 'bg-red-500' },
  nearMisses: { icon: FileWarning, label: 'Near Misses', color: 'bg-amber-500' }
}

/**
 * Confidence level badge
 */
const ConfidenceBadge = ({ level, percentage }) => {
  const config = {
    high: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
    medium: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
    low: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' }
  }

  const { bg, text, border } = config[level] || config.medium

  return (
    <div className={`${bg} ${border} border rounded-lg px-3 py-2 flex items-center gap-2`}>
      <Shield size={16} className={text} />
      <div>
        <div className={`text-sm font-semibold ${text} capitalize`}>{level} Confidence</div>
        {percentage !== undefined && (
          <div className="text-2xs text-surface-500">{percentage}% data quality score</div>
        )}
      </div>
    </div>
  )
}

/**
 * Source breakdown bar
 */
const SourceBreakdownBar = ({ breakdown }) => {
  if (!breakdown?.sources) return null

  const sources = breakdown.sources
  const total = Object.values(sources).reduce((a, b) => a + b, 0)

  if (total === 0) return null

  const segments = Object.entries(sources)
    .filter(([_, count]) => count > 0)
    .map(([key, count]) => ({
      key,
      count,
      percentage: Math.round((count / total) * 100),
      ...SOURCE_CONFIG[key]
    }))
    .sort((a, b) => b.percentage - a.percentage)

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <span className="text-2xs font-medium text-surface-500 uppercase tracking-wide">Data Sources</span>
      </div>

      {/* Stacked bar */}
      <div className="h-3 flex rounded-full overflow-hidden bg-surface-100">
        {segments.map(({ key, color, percentage }) => (
          <div
            key={key}
            className={`${color} transition-all`}
            style={{ width: `${percentage}%` }}
            title={`${SOURCE_CONFIG[key]?.label}: ${percentage}%`}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {segments.map(({ key, label, color, percentage, count }) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${color}`} />
            <span className="text-2xs text-surface-600">
              {label}: <span className="font-medium">{percentage}%</span>
              <span className="text-surface-400 ml-1">({count})</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * ConfidenceBiasIndicator - Panel B
 * Shows prediction confidence and data bias warnings
 */
const ConfidenceBiasIndicator = ({
  dataSourceBreakdown,
  incidentCount,
  negativeCount,
  isSparseData
}) => {
  const { hasBias, dominantSource, biasMessage, confidenceLevel, confidenceScore } = dataSourceBreakdown || {}

  return (
    <div className="bg-white rounded-lg border border-surface-200 p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Shield size={16} className="text-surface-500" />
        <h3 className="text-sm font-semibold text-surface-700">Prediction Confidence</h3>
      </div>

      {/* Confidence badge */}
      <div className="mb-4">
        <ConfidenceBadge
          level={confidenceLevel || (isSparseData ? 'low' : 'medium')}
          percentage={confidenceScore}
        />
      </div>

      {/* Bias warning */}
      {hasBias && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 mb-4">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-amber-800">Data Bias Detected</p>
              <p className="text-2xs text-amber-600 mt-0.5">
                {biasMessage || `Predictions may be skewed due to ${dominantSource}-heavy data.`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* No bias indicator */}
      {!hasBias && !isSparseData && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2.5 mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-green-500" />
            <p className="text-xs font-medium text-green-800">Balanced data sources</p>
          </div>
        </div>
      )}

      {/* Source breakdown */}
      <SourceBreakdownBar breakdown={dataSourceBreakdown} />

      {/* Data stats */}
      <div className="border-t border-surface-100 pt-3 mt-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <div className="text-lg font-bold text-surface-700">{incidentCount}</div>
            <div className="text-2xs text-surface-500">Total Records</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-surface-700">{negativeCount}</div>
            <div className="text-2xs text-surface-500">Negative Obs.</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(ConfidenceBiasIndicator)
