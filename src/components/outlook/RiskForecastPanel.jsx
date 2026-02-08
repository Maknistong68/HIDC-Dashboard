import React from 'react'
import { AlertTriangle, TrendingUp, TrendingDown, Minus, MapPin, Clock, Loader2 } from 'lucide-react'

/**
 * Heat bar color by probability
 */
const getHeatColor = (probability) => {
  if (probability >= 70) return 'bg-red-500'
  if (probability >= 50) return 'bg-orange-500'
  if (probability >= 30) return 'bg-amber-400'
  return 'bg-green-500'
}

const getHeatColorText = (probability) => {
  if (probability >= 70) return 'text-red-600'
  if (probability >= 50) return 'text-orange-600'
  if (probability >= 30) return 'text-amber-600'
  return 'text-green-600'
}

/**
 * 6-week heat bar visualization
 */
const WeeklyHeatBar = ({ weeklyProbs }) => {
  if (!weeklyProbs?.length) return null

  return (
    <div className="flex gap-1">
      {weeklyProbs.map((prob, idx) => (
        <div key={idx} className="flex-1 flex flex-col items-center">
          <div
            className={`w-full h-3 rounded ${getHeatColor(prob)} transition-all`}
            title={`Week ${idx + 1}: ${prob}% probability`}
          />
          <span className="text-2xs text-surface-400 mt-1">W{idx + 1}</span>
        </div>
      ))}
    </div>
  )
}

/**
 * Trend icon component
 */
const TrendIndicator = ({ trend }) => {
  const config = {
    'significant-rise': { icon: TrendingUp, color: 'text-red-500', label: 'Rising sharply' },
    'rising': { icon: TrendingUp, color: 'text-orange-500', label: 'Rising' },
    'stable': { icon: Minus, color: 'text-surface-500', label: 'Stable' },
    'declining': { icon: TrendingDown, color: 'text-green-500', label: 'Declining' },
    'significant-decline': { icon: TrendingDown, color: 'text-green-600', label: 'Declining sharply' }
  }

  const { icon: Icon, color, label } = config[trend] || config.stable

  return (
    <div className={`flex items-center gap-1 ${color}`}>
      <Icon size={14} />
      <span className="text-xs font-medium">{label}</span>
    </div>
  )
}

/**
 * RiskForecastPanel - Panel A
 * Answers: When/Where is the next hazard most likely?
 */
const RiskForecastPanel = ({
  topRiskHazard,
  hazardRiskSummaries,
  isSimulating,
  typeProbability,
  period
}) => {
  // Loading state
  if (isSimulating && !topRiskHazard) {
    return (
      <div className="bg-white rounded-lg border border-surface-200 p-5">
        <div className="flex items-center gap-3 justify-center py-8">
          <Loader2 size={20} className="text-primary-500 animate-spin" />
          <span className="text-sm text-surface-500">Analyzing risk patterns...</span>
        </div>
      </div>
    )
  }

  // No data state
  if (!topRiskHazard) {
    return (
      <div className="bg-white rounded-lg border border-surface-200 p-5">
        <div className="text-center py-6">
          <div className="w-10 h-10 rounded-full bg-surface-100 flex items-center justify-center mx-auto mb-3">
            <MapPin size={18} className="text-surface-400" />
          </div>
          <p className="text-sm text-surface-500">Insufficient data for risk forecast</p>
        </div>
      </div>
    )
  }

  const probability = topRiskHazard.exceedanceProb || 0
  const riskColor = getHeatColorText(probability)

  // Get most likely incident type
  const topType = typeProbability?.types?.[0]
  const typeLabel = topType?.label || 'Near Miss'

  // Exceedance probability = per-week likelihood, not time-until-event
  const timeframe = probability >= 70 ? 'in any given week'
    : probability >= 50 ? 'in a typical week'
    : probability >= 30 ? 'occasionally'
    : 'rarely'

  return (
    <div className="bg-white rounded-lg border border-surface-200 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${getHeatColor(probability)}`} />
          <h3 className="text-sm font-semibold text-surface-700">Risk Forecast</h3>
        </div>
        <TrendIndicator trend={topRiskHazard.trend} />
      </div>

      {/* Main prediction sentence */}
      <div className="mb-4">
        <p className="text-base font-medium text-surface-800 leading-relaxed">
          <span className={`font-bold ${riskColor}`}>
            {probability >= 50 ? 'High likelihood' : probability >= 30 ? 'Moderate likelihood' : 'Low likelihood'}
          </span>
          {' '}of{' '}
          <span className="font-semibold text-surface-900">{topRiskHazard.name}</span>
          {' '}incident {timeframe}.
        </p>
      </div>

      {/* Key metrics row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-surface-50 rounded-lg p-3 text-center">
          <div className={`text-xl font-bold ${riskColor}`}>{probability}%</div>
          <div className="text-2xs text-surface-500">Probability</div>
        </div>
        <div className="bg-surface-50 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-surface-700">{topRiskHazard.avgProjected}</div>
          <div className="text-2xs text-surface-500">Projected/wk</div>
        </div>
        <div className="bg-surface-50 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-surface-700">{topRiskHazard.p95}</div>
          <div className="text-2xs text-surface-500">95th percentile</div>
        </div>
      </div>

      {/* 6-week heat bar */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 mb-2">
          <Clock size={12} className="text-surface-400" />
          <span className="text-2xs font-medium text-surface-500 uppercase tracking-wide">6-Week Outlook</span>
        </div>
        <WeeklyHeatBar weeklyProbs={topRiskHazard.weeklyProbs} />
      </div>

      {/* Expected incident type */}
      {topType && (
        <div className="border-t border-surface-100 pt-3 mt-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-surface-500">Expected type if incident occurs:</span>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${topType.color}20`, color: topType.color }}
            >
              {topType.label?.split(' (')[0] || typeLabel}
            </span>
          </div>
        </div>
      )}

      {/* Secondary hazards */}
      {hazardRiskSummaries.length > 1 && (
        <div className="border-t border-surface-100 pt-3 mt-3">
          <div className="text-2xs font-medium text-surface-500 uppercase tracking-wide mb-2">Other Risks</div>
          <div className="space-y-1.5">
            {hazardRiskSummaries.slice(1, 4).map((hazard, idx) => (
              <div key={hazard.name} className="flex items-center justify-between">
                <span className="text-xs text-surface-600 truncate flex-1">{hazard.name}</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getHeatColor(hazard.exceedanceProb)}`} />
                  <span className={`text-xs font-medium ${getHeatColorText(hazard.exceedanceProb)}`}>
                    {hazard.exceedanceProb}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default React.memo(RiskForecastPanel)
