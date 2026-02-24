import { memo } from 'react'
import { Calendar, AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react'

/**
 * SeasonalRiskPrediction - 7-day risk forecast based on seasonal patterns
 *
 * ## How Prediction Data Works:
 *
 * Data flows: incidents -> predictSeasonalRisk() -> this component
 *
 * 1. **Day Risk**: Based on historical day-of-week patterns
 *    - Formula: (incidents on this day / expected per day) * 100
 *
 * 2. **Month Risk**: Based on historical month patterns
 *    - Formula: (incidents in this month / expected per month) * 100
 *
 * 3. **Combined Risk**: Geometric mean of day and month risks
 *    - Formula: sqrt(dayRisk * monthRisk)
 *    - This prevents extreme values from dominating
 *
 * Risk Levels:
 *   - High: > 125%
 *   - Elevated: 110-125%
 *   - Normal: 80-110%
 *   - Low: < 80%
 */
const SeasonalRiskPrediction = ({ data, title = '7-Day Risk Forecast' }) => {
  if (!data || !data.hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-48 bg-surface-50 rounded-lg border border-surface-200">
        <Calendar size={32} className="text-surface-400 mb-2" />
        <p className="text-sm text-surface-500">{data?.error || 'Insufficient data for prediction'}</p>
      </div>
    )
  }

  const { predictions, highestRiskDay, summary } = data

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'high': return 'bg-red-500'
      case 'elevated': return 'bg-amber-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-blue-500'
    }
  }

  const getRiskBgColor = (riskLevel) => {
    switch (riskLevel) {
      case 'high': return 'bg-red-50 border-red-200'
      case 'elevated': return 'bg-amber-50 border-amber-200'
      case 'low': return 'bg-green-50 border-green-200'
      default: return 'bg-surface-50 border-surface-200'
    }
  }

  const getRiskTextColor = (riskLevel) => {
    switch (riskLevel) {
      case 'high': return 'text-red-700'
      case 'elevated': return 'text-amber-700'
      case 'low': return 'text-green-700'
      default: return 'text-surface-700'
    }
  }

  const getRiskIcon = (riskLevel) => {
    switch (riskLevel) {
      case 'high': return <AlertTriangle size={14} className="text-red-500" />
      case 'elevated': return <TrendingUp size={14} className="text-amber-500" />
      case 'low': return <CheckCircle size={14} className="text-green-500" />
      default: return <Calendar size={14} className="text-blue-500" />
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-primary-600" />
          <h3 className="font-semibold text-surface-800">{title}</h3>
        </div>
        {summary && (
          <div className="text-xs text-surface-500">
            Avg Risk: <span className="font-semibold">{summary.averageRisk}%</span>
          </div>
        )}
      </div>

      {/* Alert for high risk days */}
      {summary?.highRiskDays > 0 && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle size={16} className="text-red-600" />
          <span className="text-sm text-red-700">
            <span className="font-semibold">{summary.highRiskDays}</span> high-risk day{summary.highRiskDays > 1 ? 's' : ''} in the next 7 days
            {highestRiskDay && ` - highest on ${highestRiskDay.dayName}`}
          </span>
        </div>
      )}

      {/* 7-day prediction grid */}
      <div className="grid grid-cols-7 gap-1">
        {predictions.map((day) => (
          <div
            key={day.date}
            className={`
              relative p-2 rounded-lg border text-center transition-all
              ${day.isToday ? 'ring-2 ring-primary-400 ring-offset-1' : ''}
              ${getRiskBgColor(day.riskLevel)}
            `}
          >
            {/* Day label */}
            <p className="text-xs font-medium text-surface-600">
              {day.isToday ? 'Today' : day.dayName.substring(0, 3)}
            </p>

            {/* Risk indicator bar */}
            <div className="mt-1 h-1 bg-surface-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${getRiskColor(day.riskLevel)} transition-all`}
                style={{ width: `${Math.min(day.combinedRisk, 150)}%` }}
              />
            </div>

            {/* Risk percentage */}
            <p className={`mt-1 text-lg font-bold ${getRiskTextColor(day.riskLevel)}`}>
              {day.combinedRisk}%
            </p>

            {/* Risk icon */}
            <div className="flex justify-center mt-0.5">
              {getRiskIcon(day.riskLevel)}
            </div>

            {/* Date */}
            <p className="text-xs text-surface-400 mt-1">
              {day.dateLabel.split(', ')[1]}
            </p>

            {/* Weekend indicator */}
            {day.isWeekend && (
              <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-surface-400 rounded-full" title="Weekend" />
            )}
          </div>
        ))}
      </div>

      {/* Risk breakdown legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-surface-500 pt-2">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded bg-red-500" />
          <span>High</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded bg-amber-500" />
          <span>Elevated</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded bg-blue-500" />
          <span>Normal</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded bg-green-500" />
          <span>Low</span>
        </div>
      </div>

      {/* Methodology note */}
      <p className="text-xs text-surface-400 text-center pt-2 border-t border-surface-100">
        Predictions based on historical day-of-week and monthly incident patterns
      </p>
    </div>
  )
}

export default memo(SeasonalRiskPrediction)
