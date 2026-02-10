import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

/**
 * EntityScoreGauge - Circular SVG gauge for entity risk score
 * Color thresholds: 0-30 green, 30-50 blue, 50-70 amber, 70-100 red
 */
const EntityScoreGauge = ({ score, riskLevel, trend, trendPercent, benchmark }) => {
  // Gauge dimensions
  const size = 100
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(100, Math.max(0, score)) / 100
  const offset = circumference * (1 - progress)

  // Color based on score threshold
  const getScoreColor = (s) => {
    if (s <= 30) return { stroke: '#10b981', text: 'text-emerald-600', bg: 'bg-emerald-100', label: 'excellent' }
    if (s <= 50) return { stroke: '#3b82f6', text: 'text-blue-600', bg: 'bg-blue-100', label: 'good' }
    if (s <= 70) return { stroke: '#f59e0b', text: 'text-amber-600', bg: 'bg-amber-100', label: 'caution' }
    return { stroke: '#ef4444', text: 'text-red-600', bg: 'bg-red-100', label: 'concern' }
  }

  const colorInfo = getScoreColor(score)

  // Risk level badge colors
  const getRiskBadge = (level) => {
    if (level === 'High') return { bg: 'bg-red-100', text: 'text-red-700' }
    if (level === 'Moderate') return { bg: 'bg-amber-100', text: 'text-amber-700' }
    return { bg: 'bg-green-100', text: 'text-green-700' }
  }

  const badgeColors = getRiskBadge(riskLevel)

  // Trend indicator
  const renderTrendIndicator = () => {
    if (trend === undefined || trend === null) return null

    if (trend === 'up' || trendPercent > 5) {
      return (
        <div className="flex items-center gap-0.5 text-red-500">
          <TrendingUp size={12} />
          <span className="text-2xs font-medium">{trendPercent > 0 ? `+${trendPercent}%` : ''}</span>
        </div>
      )
    }
    if (trend === 'down' || trendPercent < -5) {
      return (
        <div className="flex items-center gap-0.5 text-green-500">
          <TrendingDown size={12} />
          <span className="text-2xs font-medium">{trendPercent < 0 ? `${trendPercent}%` : ''}</span>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-0.5 text-surface-400">
        <Minus size={12} />
        <span className="text-2xs font-medium">Stable</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center">
      {/* SVG Gauge */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            className="score-gauge-ring"
          />
          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colorInfo.stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={`score-gauge-fill ${colorInfo.label} transition-all duration-700`}
          />
        </svg>
        {/* Center score */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${colorInfo.text}`}>{score}</span>
          <span className="text-2xs text-surface-400">/100</span>
        </div>
      </div>

      {/* Risk level badge */}
      <div className={`mt-2 px-2 py-0.5 rounded-full text-2xs font-semibold ${badgeColors.bg} ${badgeColors.text}`}>
        {riskLevel}
      </div>

      {/* Trend indicator */}
      <div className="mt-1">
        {renderTrendIndicator()}
      </div>

      {/* Benchmark comparison */}
      {benchmark && (
        <p className="mt-1 text-2xs text-surface-400 text-center">
          avg: {benchmark.avg} &middot; #{benchmark.rank}/{benchmark.total}
        </p>
      )}
    </div>
  )
}

export default React.memo(EntityScoreGauge)
