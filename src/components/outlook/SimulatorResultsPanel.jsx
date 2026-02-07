import React from 'react'
import { TrendingUp, TrendingDown, Minus, CheckCircle2, AlertTriangle } from 'lucide-react'
import RiskGauge from '../insights/RiskGauge'

/**
 * SimulatorResultsPanel - Live projection card for scenario simulator (right column)
 * Shows before/after, risk gauge, and impact breakdown
 */
const SimulatorResultsPanel = ({
  projection,
  hasChanges,
  weekly,
  weeklyAverage,
  factorData,
  hazardTrendData
}) => {
  if (!projection && !weekly) {
    return (
      <div className="bg-surface-50 rounded-lg border border-surface-200 p-4 flex items-center justify-center min-h-[200px]">
        <p className="text-sm text-surface-400">Configure interventions to see projected results.</p>
      </div>
    )
  }

  const getRiskColor = (level) => {
    switch (level) {
      case 'low': return 'bg-green-500'
      case 'medium': return 'bg-amber-500'
      case 'high': return 'bg-orange-500'
      case 'critical': return 'bg-red-500'
      default: return 'bg-surface-400'
    }
  }

  const getRiskTextColor = (level) => {
    switch (level) {
      case 'low': return 'text-green-600'
      case 'medium': return 'text-amber-600'
      case 'high': return 'text-orange-600'
      case 'critical': return 'text-red-600'
      default: return 'text-surface-600'
    }
  }

  return (
    <div className="space-y-4">
      {/* Projected Outcome Card */}
      <div className={`rounded-lg border-2 p-4 ${
        hasChanges && projection
          ? projection.isImproved
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
          : 'bg-surface-50 border-surface-200'
      }`}>
        <h4 className="text-xs font-semibold text-surface-600 uppercase tracking-wide mb-3">
          Projected Outcome
        </h4>
        {/* Text label alongside color to meet WCAG 1.4.1 */}
        {hasChanges && projection && (
          <div className="flex items-center gap-1.5 mb-3">
            {projection.isImproved ? (
              <>
                <CheckCircle2 size={14} className="text-green-600" />
                <span className="text-xs font-semibold text-green-700">Improved</span>
              </>
            ) : (
              <>
                <AlertTriangle size={14} className="text-red-600" />
                <span className="text-xs font-semibold text-red-700">Worsened</span>
              </>
            )}
          </div>
        )}

        {hasChanges && projection ? (
          <div className="space-y-3">
            {/* Before / After */}
            <div className="flex items-center gap-3">
              <div>
                <span className="text-xs text-surface-500 block">Baseline</span>
                <span className="text-lg font-bold text-surface-600">{projection.baseline}/wk</span>
              </div>
              <span className="text-surface-300 text-lg">&rarr;</span>
              <div>
                <span className="text-xs text-surface-500 block">After</span>
                <span className={`text-lg font-bold ${projection.isImproved ? 'text-green-600' : 'text-red-600'}`}>
                  {projection.projected}/wk
                </span>
              </div>
            </div>

            {/* Change badge */}
            <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-bold ${
              projection.isImproved ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {projection.isImproved ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
              {projection.changePercent > 0 ? '+' : ''}{projection.changePercent}% impact
            </div>

            {/* Risk Level */}
            {projection.riskLevel && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-surface-500">Risk Level</span>
                  <span className={`font-semibold uppercase ${getRiskTextColor(projection.riskLevel)}`}>
                    {projection.riskLevel}
                  </span>
                </div>
                <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${getRiskColor(projection.riskLevel)}`}
                    style={{
                      width: `${
                        projection.riskLevel === 'low' ? 25 :
                        projection.riskLevel === 'medium' ? 50 :
                        projection.riskLevel === 'high' ? 75 : 100
                      }%`
                    }}
                  />
                </div>
              </div>
            )}

            {/* Multi-hazard info */}
            {projection.isMultiHazard && (
              <p className="text-2xs text-surface-400">
                Covering {projection.hazardCount} hazards ({projection.proportion}% of incidents)
              </p>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-surface-400 py-4">
            <Minus size={16} />
            <span className="text-sm">Adjust interventions to see projected impact</span>
          </div>
        )}
      </div>

      {/* Risk Gauge */}
      {weekly && (
        <div className="bg-white rounded-lg border border-surface-200 p-4">
          <RiskGauge
            predicted={weekly.predicted}
            average={weeklyAverage}
            confidence={weekly.confidence}
            trend={weekly.trend}
            size="medium"
            factorData={factorData}
            weeklyHistory={hazardTrendData}
          />
        </div>
      )}
    </div>
  )
}

export default React.memo(SimulatorResultsPanel)
