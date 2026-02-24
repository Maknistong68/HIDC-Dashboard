import { memo } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

/**
 * IncidentPredictionCard - Shows predicted incident count for a period (week/month)
 * Features dashed borders and muted backgrounds to indicate projected data
 */
const IncidentPredictionCard = ({
  period = 'week',
  predicted = 0,
  range = { min: 0, max: 0 },
  trend = 'stable',
  confidence = 'medium',
  changePercent = 0
}) => {
  const periodLabel = period === 'week' ? 'Next Week' : 'Next Month'

  const getTrendIcon = () => {
    if (trend === 'increasing') return <TrendingUp size={16} className="text-safety-critical" />
    if (trend === 'decreasing') return <TrendingDown size={16} className="text-safety-success" />
    return <Minus size={16} className="text-surface-400" />
  }

  const getTrendLabel = () => {
    if (trend === 'increasing') return 'Trending up'
    if (trend === 'decreasing') return 'Trending down'
    return 'Stable'
  }

  const getTrendColor = () => {
    if (trend === 'increasing') return 'text-safety-critical'
    if (trend === 'decreasing') return 'text-safety-success'
    return 'text-surface-500'
  }

  const getConfidenceBadge = () => {
    const colors = {
      high: 'bg-safety-success-light text-safety-success',
      medium: 'bg-amber-100 text-amber-700',
      low: 'bg-surface-100 text-surface-500'
    }
    return (
      <span className={`text-2xs px-1.5 py-0.5 rounded-full ${colors[confidence] || colors.low}`}>
        {confidence.charAt(0).toUpperCase() + confidence.slice(1)} Confidence
      </span>
    )
  }

  return (
    <div className="bg-surface-50 rounded-lg border-2 border-dashed border-surface-300 p-4 relative">
      {/* PROJECTED badge */}
      <div className="absolute top-2 right-2">
        <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-700 uppercase tracking-wide">
          Projected
        </span>
      </div>

      {/* Period label */}
      <p className="text-xs font-medium text-surface-500 uppercase tracking-wide mb-1">
        {periodLabel}
      </p>

      {/* Predicted count */}
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-3xl font-bold text-surface-800">{predicted}</span>
        {changePercent !== 0 && (
          <span className={`text-sm font-medium ${getTrendColor()}`}>
            {changePercent > 0 ? '+' : ''}{changePercent}%
          </span>
        )}
      </div>

      {/* Range */}
      <p className="text-sm text-surface-500 mb-2">
        Range: {range.min} - {range.max}
      </p>

      {/* Trend and confidence */}
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-1 ${getTrendColor()}`}>
          {getTrendIcon()}
          <span className="text-xs font-medium">{getTrendLabel()}</span>
        </div>
        {getConfidenceBadge()}
      </div>
    </div>
  )
}

export default memo(IncidentPredictionCard)
