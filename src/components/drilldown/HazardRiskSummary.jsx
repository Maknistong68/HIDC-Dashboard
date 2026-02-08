import React from 'react'
import { Shield, TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react'

/**
 * HazardRiskSummary - Risk score gauge + trend indicator
 * Shows risk score (0-100), level badge, trend direction, and major hazard badge
 */
const HazardRiskSummary = ({ risk, trend, isMobile = false }) => {
  if (!risk) {
    return (
      <div className="bg-white rounded-lg border border-surface-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield size={16} className="text-surface-400" />
          <span className="text-xs font-semibold text-surface-500 uppercase tracking-wide">Risk Summary</span>
        </div>
        <p className="text-sm text-surface-400 text-center py-4">No risk data available</p>
      </div>
    )
  }

  const { score, level, isMajorHazard, severeCount, openCount } = risk
  const { direction, percentChange, previousCount, currentCount } = trend || {}

  // Risk level colors
  const levelConfig = {
    high: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', gaugeFill: 'bg-red-500' },
    medium: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', gaugeFill: 'bg-amber-500' },
    low: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', gaugeFill: 'bg-green-500' }
  }

  const config = levelConfig[level] || levelConfig.medium

  // Trend icon and color
  const getTrendDisplay = () => {
    if (direction === 'up') {
      return {
        icon: <TrendingUp size={14} />,
        color: 'text-red-600',
        label: `+${Math.abs(percentChange)}%`,
        subtitle: 'vs last period'
      }
    }
    if (direction === 'down') {
      return {
        icon: <TrendingDown size={14} />,
        color: 'text-green-600',
        label: `-${Math.abs(percentChange)}%`,
        subtitle: 'vs last period'
      }
    }
    return {
      icon: <Minus size={14} />,
      color: 'text-surface-500',
      label: 'Stable',
      subtitle: 'No significant change'
    }
  }

  const trendDisplay = getTrendDisplay()

  return (
    <div className={`bg-white rounded-lg border border-surface-200 ${isMobile ? 'p-3' : 'p-4'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.bg}`}>
            <Shield size={16} className={config.text} />
          </div>
          <span className="text-xs font-semibold text-surface-500 uppercase tracking-wide">Risk Score</span>
        </div>
        {isMajorHazard && (
          <span className="flex items-center gap-1 text-2xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
            <AlertTriangle size={10} />
            Major Hazard
          </span>
        )}
      </div>

      {/* Score Display */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex-1">
          {/* Large score number */}
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${config.text}`}>{score}</span>
            <span className="text-sm text-surface-500">/100</span>
          </div>
          {/* Level badge */}
          <span className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${config.bg} ${config.text}`}>
            {level.charAt(0).toUpperCase() + level.slice(1)} Risk
          </span>
        </div>

        {/* Gauge visual */}
        <div className="w-20 h-20 relative">
          <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
            {/* Background circle */}
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="3"
            />
            {/* Progress circle */}
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={level === 'high' ? '#ef4444' : level === 'medium' ? '#f59e0b' : '#22c55e'}
              strokeWidth="3"
              strokeDasharray={`${score}, 100`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xs font-bold ${config.text}`}>{score}%</span>
          </div>
        </div>
      </div>

      {/* Trend indicator */}
      <div className="flex items-center justify-between pt-3 border-t border-surface-100">
        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1 ${trendDisplay.color}`}>
            {trendDisplay.icon}
            <span className="text-sm font-semibold">{trendDisplay.label}</span>
          </span>
          <span className="text-xs text-surface-400">{trendDisplay.subtitle}</span>
        </div>
        {previousCount !== undefined && currentCount !== undefined && (
          <span className="text-xs text-surface-500">
            {previousCount} → {currentCount}
          </span>
        )}
      </div>

      {/* Quick stats */}
      {(severeCount > 0 || openCount > 0) && (
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-surface-100">
          {severeCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs">
              <AlertTriangle size={12} className="text-red-500" />
              <span className="text-surface-600">{severeCount} severe</span>
            </div>
          )}
          {openCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-surface-600">{openCount} open</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default React.memo(HazardRiskSummary)
