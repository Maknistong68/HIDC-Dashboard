import React from 'react'
import { Link2, Users, AlertTriangle, Lightbulb, CheckCircle } from 'lucide-react'
import CorrelationPatternCard from './CorrelationPatternCard'

/**
 * PatternInsightsList - Container for correlation pattern insights
 */
const PatternInsightsList = ({ data, onPatternClick }) => {
  if (!data || !data.hasData) {
    return (
      <div className="p-6 bg-surface-50 rounded-lg border border-surface-200 text-center">
        <Lightbulb size={32} className="mx-auto mb-2 text-surface-400" />
        <p className="text-sm text-surface-600">Insufficient Data for Pattern Analysis</p>
        <p className="text-xs text-surface-500 mt-1">
          Need at least 30 observations to identify significant patterns
        </p>
      </div>
    )
  }

  const { patterns, summary } = data

  if (patterns.length === 0) {
    return (
      <div className="p-6 bg-safety-success-light rounded-lg border border-safety-success/20 text-center">
        <CheckCircle size={32} className="mx-auto mb-2 text-safety-success" />
        <p className="text-sm font-medium text-safety-success">No Significant Patterns Detected</p>
        <p className="text-xs text-surface-600 mt-1">
          Incident distributions appear random - no contractor or hazard shows unusual root cause concentration
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-surface-50 rounded-lg border border-surface-200">
          <p className="text-2xs font-semibold text-surface-500 uppercase tracking-wide">
            Patterns Found
          </p>
          <p className="text-xl font-bold text-surface-800 mt-1">
            {summary.totalPatterns}
          </p>
        </div>

        <div className="p-3 bg-safety-critical-light rounded-lg border border-safety-critical/20">
          <p className="text-2xs font-semibold text-surface-500 uppercase tracking-wide">
            Highly Significant
          </p>
          <p className="text-xl font-bold text-safety-critical mt-1">
            {summary.highlySignificant}
          </p>
        </div>

        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-1.5">
            <Users size={14} className="text-blue-600" />
            <p className="text-2xs font-semibold text-surface-500 uppercase tracking-wide">
              Contractor
            </p>
          </div>
          <p className="text-xl font-bold text-blue-600 mt-1">
            {summary.contractorPatterns}
          </p>
        </div>

        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center gap-1.5">
            <AlertTriangle size={14} className="text-purple-600" />
            <p className="text-2xs font-semibold text-surface-500 uppercase tracking-wide">
              Hazard
            </p>
          </div>
          <p className="text-xl font-bold text-purple-600 mt-1">
            {summary.hazardPatterns}
          </p>
        </div>
      </div>

      {/* Info banner */}
      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-2">
          <Lightbulb size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-800">
            <p className="font-medium">Statistical Significance Guide</p>
            <p className="mt-1 text-blue-700">
              <strong>***</strong> (p&lt;0.001): Very strong evidence |{' '}
              <strong>**</strong> (p&lt;0.01): Strong evidence |{' '}
              <strong>*</strong> (p&lt;0.05): Moderate evidence
            </p>
          </div>
        </div>
      </div>

      {/* Pattern Cards */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-surface-600 uppercase tracking-wide">
          Top Correlation Patterns
        </h4>
        {patterns.map((pattern, index) => (
          <CorrelationPatternCard
            key={`pattern-${index}`}
            pattern={pattern}
            onClick={() => onPatternClick && onPatternClick(pattern)}
          />
        ))}
      </div>
    </div>
  )
}

export default React.memo(PatternInsightsList)
