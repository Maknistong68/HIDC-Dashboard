import React from 'react'
import { Zap, MapPin, TrendingDown, Shield, AlertTriangle, CheckCircle } from 'lucide-react'

/**
 * SingleActionRecommendation - Panel D (CEO Button)
 * Shows the single most impactful action to take now
 */
const SingleActionRecommendation = ({
  bestAction,
  topRiskHazard,
  dataSourceBreakdown
}) => {
  // No action available
  if (!bestAction || !bestAction.action) {
    return (
      <div className="bg-surface-50 rounded-lg border border-surface-200 p-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center mx-auto mb-3">
            <Zap size={24} className="text-surface-400" />
          </div>
          <p className="text-sm text-surface-500">
            Import more data to generate action recommendations.
          </p>
        </div>
      </div>
    )
  }

  const {
    action,
    factor,
    category,
    riskReduction,
    hazardName,
    confidence,
    reasoning
  } = bestAction

  // Determine confidence level styling
  const confidenceConfig = {
    high: { bg: 'bg-green-100', text: 'text-green-700', label: 'High confidence' },
    medium: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Medium confidence' },
    low: { bg: 'bg-red-100', text: 'text-red-700', label: 'Low confidence' }
  }

  const confStyle = confidenceConfig[confidence] || confidenceConfig.medium

  return (
    <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg border border-primary-500 overflow-hidden">
      {/* Main action banner */}
      <div className="px-6 py-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left: Main action */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={18} className="text-primary-200" />
              <span className="text-xs font-semibold text-primary-200 uppercase tracking-wide">
                Priority Action
              </span>
            </div>
            <h3 className="text-xl lg:text-2xl font-bold text-white leading-tight">
              DO THIS NOW: {action}
            </h3>
            {hazardName && (
              <div className="flex items-center gap-2 mt-2">
                <MapPin size={14} className="text-primary-300" />
                <span className="text-sm text-primary-200">
                  Focus area: <span className="text-white font-medium">{hazardName}</span>
                </span>
              </div>
            )}
          </div>

          {/* Right: Impact badge */}
          <div className="flex items-center gap-4">
            <div className="bg-white/10 backdrop-blur rounded-lg px-5 py-3 text-center">
              <div className="text-3xl font-bold text-white">
                {riskReduction > 0 ? '-' : ''}{riskReduction}%
              </div>
              <div className="text-xs text-primary-200">Risk Reduction</div>
            </div>
          </div>
        </div>
      </div>

      {/* Why this matters section */}
      <div className="bg-white px-6 py-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold text-surface-500 uppercase tracking-wide">
            Why This Matters
          </span>
          <span className={`text-2xs px-2 py-0.5 rounded-full ${confStyle.bg} ${confStyle.text}`}>
            {confStyle.label}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Reason 1: Risk reduction */}
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
              <TrendingDown size={14} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-surface-700">
                <span className="font-medium">{riskReduction}% risk reduction</span>
                {' '}in {hazardName || 'targeted hazard area'}
              </p>
            </div>
          </div>

          {/* Reason 2: Addresses factor */}
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
              <Shield size={14} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-surface-700">
                Addresses <span className="font-medium">{factor}</span>
                {category && <span className="text-surface-500"> ({category})</span>}
              </p>
            </div>
          </div>

          {/* Reason 3: Confidence/data quality */}
          <div className="flex items-start gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
              dataSourceBreakdown?.hasBias ? 'bg-amber-100' : 'bg-green-100'
            }`}>
              {dataSourceBreakdown?.hasBias ? (
                <AlertTriangle size={14} className="text-amber-600" />
              ) : (
                <CheckCircle size={14} className="text-green-600" />
              )}
            </div>
            <div>
              <p className="text-sm text-surface-700">
                {dataSourceBreakdown?.hasBias
                  ? 'Recommendation adjusted for data bias'
                  : 'Based on balanced, representative data'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Additional reasoning if provided */}
        {reasoning && (
          <p className="text-xs text-surface-500 mt-3 pt-3 border-t border-surface-100">
            {reasoning}
          </p>
        )}
      </div>
    </div>
  )
}

export default React.memo(SingleActionRecommendation)
