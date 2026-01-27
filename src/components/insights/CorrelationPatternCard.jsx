import React from 'react'
import { Link2, Users, AlertTriangle, ArrowRight } from 'lucide-react'

/**
 * CorrelationPatternCard - Displays a statistically significant correlation pattern
 */
const CorrelationPatternCard = ({ pattern, onClick }) => {
  const {
    type,
    contractor,
    hazard,
    rootCause,
    observed,
    expected,
    ratio,
    significance,
    pValue,
    description
  } = pattern

  const isContractorPattern = type === 'contractor-rootcause'

  const getSignificanceConfig = () => {
    if (pValue <= 0.001) {
      return {
        label: 'Highly Significant',
        stars: '***',
        bg: 'bg-safety-critical-light',
        border: 'border-safety-critical/30',
        badge: 'bg-safety-critical text-white'
      }
    }
    if (pValue <= 0.01) {
      return {
        label: 'Very Significant',
        stars: '**',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        badge: 'bg-amber-500 text-white'
      }
    }
    return {
      label: 'Significant',
      stars: '*',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      badge: 'bg-blue-500 text-white'
    }
  }

  const config = getSignificanceConfig()

  return (
    <div
      className={`p-4 rounded-lg border ${config.bg} ${config.border} ${
        onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
      }`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {isContractorPattern ? (
            <Users size={18} className="text-surface-600" />
          ) : (
            <AlertTriangle size={18} className="text-surface-600" />
          )}
          <span className={`px-2 py-0.5 text-xs font-bold rounded ${config.badge}`}>
            {ratio}x {significance}
          </span>
        </div>
        <span className="text-xs text-surface-500">
          p &lt; {pValue}
        </span>
      </div>

      {/* Pattern Description */}
      <div className="mt-3">
        {isContractorPattern ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-1 bg-white rounded text-sm font-semibold text-surface-800 border border-surface-200">
                {contractor}
              </span>
              <ArrowRight size={14} className="text-surface-400" />
              <span className="px-2 py-1 bg-purple-100 rounded text-sm font-medium text-purple-700">
                {rootCause}
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-1 bg-white rounded text-sm font-semibold text-surface-800 border border-surface-200">
                {hazard}
              </span>
              <ArrowRight size={14} className="text-surface-400" />
              <span className="px-2 py-1 bg-purple-100 rounded text-sm font-medium text-purple-700">
                {rootCause}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mt-3 flex items-center gap-4 text-xs text-surface-600">
        <span>
          Observed: <strong className="text-surface-800">{observed}</strong>
        </span>
        <span>
          Expected: <strong className="text-surface-800">{expected}</strong>
        </span>
        <span className="text-surface-500">
          {config.label}
        </span>
      </div>

      {/* Description */}
      <p className="mt-2 text-xs text-surface-600 leading-relaxed">
        {description}
      </p>
    </div>
  )
}

export default React.memo(CorrelationPatternCard)
