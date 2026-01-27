import React from 'react'
import { TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react'

/**
 * TrendIndicatorCard - Shows trend direction with visual indicator
 */
const TrendIndicatorCard = ({ label, trend, isGood, subtitle }) => {
  if (!trend) return null

  const { direction, change, confidence } = trend

  const config = {
    improving: {
      icon: TrendingDown,
      color: isGood ? 'text-safety-success' : 'text-safety-critical',
      bg: isGood ? 'bg-safety-success-light' : 'bg-safety-critical-light',
      label: 'Improving'
    },
    worsening: {
      icon: TrendingUp,
      color: isGood ? 'text-safety-success' : 'text-safety-critical',
      bg: isGood ? 'bg-safety-success-light' : 'bg-safety-critical-light',
      label: 'Worsening'
    },
    stable: {
      icon: Minus,
      color: 'text-surface-500',
      bg: 'bg-surface-100',
      label: 'Stable'
    }
  }

  const { icon: Icon, color, bg, label: directionLabel } = config[direction] || config.stable

  return (
    <div className="p-4 bg-white rounded-lg border border-surface-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide">
            {label}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-lg font-bold ${color}`}>
              {change > 0 ? '+' : ''}{change}%
            </span>
            <div className={`p-1 rounded ${bg}`}>
              <Icon size={16} className={color} />
            </div>
          </div>
          {subtitle && (
            <p className="text-xs text-surface-500 mt-1">{subtitle}</p>
          )}
        </div>

        <div className="text-right">
          <span className={`text-xs font-medium ${color}`}>{directionLabel}</span>
          {confidence && (
            <p className="text-2xs text-surface-400 mt-0.5">
              {confidence} confidence
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * TrendIndicatorGroup - Container for multiple trend indicators
 */
export const TrendIndicatorGroup = ({ trends }) => {
  if (!trends) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {trends.incidents && (
        <TrendIndicatorCard
          label={trends.incidents.label}
          trend={trends.incidents}
          isGood={trends.incidents.isGood}
          subtitle="vs previous 3 months"
        />
      )}
      {trends.nearMiss && (
        <TrendIndicatorCard
          label={trends.nearMiss.label}
          trend={trends.nearMiss}
          isGood={trends.nearMiss.isGood}
          subtitle="vs previous 3 months"
        />
      )}
    </div>
  )
}

export default React.memo(TrendIndicatorCard)
