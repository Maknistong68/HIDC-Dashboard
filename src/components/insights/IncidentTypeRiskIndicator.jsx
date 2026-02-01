import React from 'react'
import { TrendingUp, TrendingDown, Minus, AlertTriangle, AlertCircle } from 'lucide-react'

/**
 * IncidentTypeRiskIndicator - Risk bars per incident type with alerts
 * Shows risk score as horizontal bars with trend indicators and warnings
 */
const IncidentTypeRiskIndicator = ({ data }) => {
  if (!data || !data.hasData || !data.risks || data.risks.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-surface-50 rounded-lg border border-dashed border-surface-300">
        <p className="text-sm text-surface-500">No risk data available</p>
      </div>
    )
  }

  const { risks, highestRisk, alerts } = data

  const getTrendIcon = (trend, size = 12) => {
    if (trend === 'increasing') return <TrendingUp size={size} className="text-safety-critical" />
    if (trend === 'decreasing') return <TrendingDown size={size} className="text-safety-success" />
    return <Minus size={size} className="text-surface-400" />
  }

  const getRiskBarColor = (riskScore, riskLevel) => {
    if (riskLevel === 'high') return 'bg-safety-critical'
    if (riskLevel === 'medium') return 'bg-amber-500'
    return 'bg-safety-success'
  }

  const getRiskBgColor = (riskLevel) => {
    if (riskLevel === 'high') return 'bg-safety-critical-light'
    if (riskLevel === 'medium') return 'bg-amber-100'
    return 'bg-surface-100'
  }

  return (
    <div className="bg-surface-50 rounded-lg border-2 border-dashed border-surface-300 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-surface-700">Risk Assessment</h4>
        <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-700 uppercase tracking-wide">
          Projected
        </span>
      </div>

      {/* Risk bars */}
      <div className="space-y-3">
        {risks.slice(0, 4).map((risk, index) => (
          <div key={risk.type} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-medium text-surface-700">
                  {risk.label.split(' ')[0]}
                </span>
                {risk.alert && (
                  <AlertCircle size={12} className="text-safety-critical" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-surface-800">
                  {risk.riskScore}%
                </span>
                {getTrendIcon(risk.trend)}
              </div>
            </div>

            {/* Progress bar */}
            <div className={`h-2 rounded-full overflow-hidden ${getRiskBgColor(risk.riskLevel)}`}>
              <div
                className={`h-full rounded-full transition-all duration-500 ${getRiskBarColor(risk.riskScore, risk.riskLevel)}`}
                style={{
                  width: `${Math.max(2, risk.riskScore)}%`,
                  background: risk.riskLevel === 'high'
                    ? 'repeating-linear-gradient(45deg, #dc2626, #dc2626 2px, #ef4444 2px, #ef4444 4px)'
                    : undefined
                }}
              />
            </div>

            {/* Trend change indicator */}
            {risk.trendChange !== 0 && (
              <div className="flex items-center gap-1 text-2xs text-surface-500">
                <span className={
                  risk.trend === 'increasing' ? 'text-safety-critical' :
                  risk.trend === 'decreasing' ? 'text-safety-success' :
                  'text-surface-400'
                }>
                  {risk.trendChange > 0 ? '+' : ''}{risk.trendChange}% from previous period
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Highest risk summary */}
      {highestRisk && (
        <div className="mt-4 pt-3 border-t border-surface-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-surface-500">Highest Risk:</span>
            <div className="flex items-center gap-2">
              <span
                className="text-sm font-semibold"
                style={{ color: highestRisk.color }}
              >
                {highestRisk.label.split(' ')[0]}
              </span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-surface-200 text-surface-600">
                Score: {highestRisk.riskScore}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Alerts */}
      {alerts && alerts.length > 0 && (
        <div className="mt-3 space-y-2">
          {alerts.slice(0, 2).map((alert, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2 p-2 rounded text-xs ${
                alert.type === 'critical'
                  ? 'bg-safety-critical-light text-safety-critical'
                  : 'bg-amber-50 text-amber-700'
              }`}
            >
              <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
              <span>{alert.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default React.memo(IncidentTypeRiskIndicator)
