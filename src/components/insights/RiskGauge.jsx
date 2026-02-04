import React, { useMemo } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

/**
 * RiskGauge - Visual 5-level risk gauge showing where prediction falls on risk spectrum
 *
 * Props:
 *  - predicted: The predicted incident count
 *  - average: Historical average for comparison
 *  - confidence: 'low' | 'medium' | 'high'
 *  - size: 'small' | 'medium' | 'large'
 *  - trend: 'increasing' | 'stable' | 'decreasing'
 */
const RiskGauge = ({
  predicted,
  average,
  confidence = 'medium',
  size = 'medium',
  trend = 'stable',
  showComparison = true
}) => {
  // Calculate risk level based on predicted vs average
  const riskAnalysis = useMemo(() => {
    if (predicted === undefined || predicted === null || average === undefined || average === null) {
      return {
        level: 2, // Medium as default
        label: 'Medium',
        color: 'amber',
        percent: 50,
        changePercent: 0,
        isAbove: false
      }
    }

    const changePercent = average > 0 ? Math.round(((predicted - average) / average) * 100) : 0
    const isAbove = predicted > average

    // Determine risk level (0-4)
    let level, label, color
    if (changePercent <= -30) {
      level = 0
      label = 'Low'
      color = 'green'
    } else if (changePercent <= -10) {
      level = 1
      label = 'OK'
      color = 'emerald'
    } else if (changePercent <= 15) {
      level = 2
      label = 'Medium'
      color = 'amber'
    } else if (changePercent <= 40) {
      level = 3
      label = 'High'
      color = 'orange'
    } else {
      level = 4
      label = 'Critical'
      color = 'red'
    }

    // Calculate pointer position (0-100%)
    // Maps level 0-4 to position 10%, 30%, 50%, 70%, 90%
    const percent = 10 + level * 20

    return { level, label, color, percent, changePercent, isAbove }
  }, [predicted, average])

  const sizeClasses = {
    small: {
      container: 'py-2',
      gauge: 'h-3',
      pointer: 'w-3 h-3 -top-0.5',
      text: 'text-xs',
      label: 'text-2xs'
    },
    medium: {
      container: 'py-3',
      gauge: 'h-4',
      pointer: 'w-4 h-4 -top-0.5',
      text: 'text-sm',
      label: 'text-xs'
    },
    large: {
      container: 'py-4',
      gauge: 'h-5',
      pointer: 'w-5 h-5 -top-1',
      text: 'text-base',
      label: 'text-sm'
    }
  }

  const s = sizeClasses[size] || sizeClasses.medium

  const getTrendIcon = () => {
    if (trend === 'increasing') return <TrendingUp size={size === 'small' ? 12 : 14} className="text-red-500" />
    if (trend === 'decreasing') return <TrendingDown size={size === 'small' ? 12 : 14} className="text-green-500" />
    return <Minus size={size === 'small' ? 12 : 14} className="text-surface-400" />
  }

  const getColorClasses = (color) => {
    switch (color) {
      case 'green':
        return { bg: 'bg-green-500', text: 'text-green-600', light: 'bg-green-100' }
      case 'emerald':
        return { bg: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-100' }
      case 'amber':
        return { bg: 'bg-amber-500', text: 'text-amber-600', light: 'bg-amber-100' }
      case 'orange':
        return { bg: 'bg-orange-500', text: 'text-orange-600', light: 'bg-orange-100' }
      case 'red':
        return { bg: 'bg-red-500', text: 'text-red-600', light: 'bg-red-100' }
      default:
        return { bg: 'bg-surface-500', text: 'text-surface-600', light: 'bg-surface-100' }
    }
  }

  const colors = getColorClasses(riskAnalysis.color)

  return (
    <div className={`space-y-2 ${s.container}`}>
      {/* Risk Level Label */}
      <div className="flex items-center justify-between">
        <span className={`font-medium text-surface-700 ${s.label}`}>Weekly Risk Level</span>
        <div className="flex items-center gap-2">
          <span className={`font-bold ${colors.text} ${s.text}`}>
            {riskAnalysis.label}
          </span>
          {getTrendIcon()}
        </div>
      </div>

      {/* Gauge Container */}
      <div className="relative">
        {/* Gauge Track */}
        <div className={`flex rounded-full overflow-hidden ${s.gauge}`}>
          {/* LOW */}
          <div className="flex-1 bg-green-500" title="Low" />
          {/* OK */}
          <div className="flex-1 bg-emerald-400" title="OK" />
          {/* MEDIUM */}
          <div className="flex-1 bg-amber-400" title="Medium" />
          {/* HIGH */}
          <div className="flex-1 bg-orange-500" title="High" />
          {/* CRITICAL */}
          <div className="flex-1 bg-red-500" title="Critical" />
        </div>

        {/* Pointer */}
        <div
          className="absolute transition-all duration-500 ease-out"
          style={{ left: `calc(${riskAnalysis.percent}% - 8px)`, top: '-2px' }}
        >
          <div className={`${s.pointer} relative`}>
            {/* Pointer arrow */}
            <div
              className="w-0 h-0 mx-auto"
              style={{
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '8px solid #1e293b'
              }}
            />
          </div>
        </div>

        {/* Scale Labels */}
        <div className="flex justify-between mt-1 px-1">
          <span className="text-2xs text-surface-400">Low</span>
          <span className="text-2xs text-surface-400">OK</span>
          <span className="text-2xs text-surface-400">Med</span>
          <span className="text-2xs text-surface-400">High</span>
          <span className="text-2xs text-surface-400">Crit</span>
        </div>
      </div>

      {/* Comparison Stats */}
      {showComparison && predicted !== undefined && average !== undefined && (
        <div className={`flex items-center justify-between pt-1 border-t border-surface-100 ${s.label}`}>
          <span className="text-surface-500">
            {predicted} predicted vs {Math.round(average)} avg
          </span>
          <span className={`font-bold ${riskAnalysis.isAbove ? 'text-red-500' : 'text-green-500'}`}>
            {riskAnalysis.isAbove ? '+' : ''}{riskAnalysis.changePercent}%
          </span>
        </div>
      )}

      {/* Confidence indicator */}
      {confidence && (
        <div className={`flex items-center gap-1 ${s.label}`}>
          <span className="text-surface-400">Confidence:</span>
          <div className="flex items-center gap-0.5">
            <div className={`w-1.5 h-3 rounded-full ${confidence !== 'low' ? 'bg-primary-500' : 'bg-surface-200'}`} />
            <div className={`w-1.5 h-3 rounded-full ${confidence === 'high' || confidence === 'medium' ? 'bg-primary-500' : 'bg-surface-200'}`} />
            <div className={`w-1.5 h-3 rounded-full ${confidence === 'high' ? 'bg-primary-500' : 'bg-surface-200'}`} />
          </div>
          <span className="text-surface-500 capitalize">{confidence}</span>
        </div>
      )}
    </div>
  )
}

export default React.memo(RiskGauge)
