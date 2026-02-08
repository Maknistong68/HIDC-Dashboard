import React, { useMemo } from 'react'
import { Shield, AlertTriangle, AlertOctagon, TrendingUp, TrendingDown, Minus } from 'lucide-react'

const SafetyStatusBanner = ({ weekly, weeklyAverage, anomalyCount = 0 }) => {
  const status = useMemo(() => {
    const predicted = weekly?.predicted
    const trend = weekly?.trend
    if (predicted == null || !weeklyAverage) {
      return { level: 'neutral', sentence: 'Insufficient data to generate a safety summary.' }
    }

    const ratio = predicted / Math.max(weeklyAverage, 1)
    const trendWord = trend === 'increasing' ? 'trending upward'
      : trend === 'decreasing' ? 'trending downward'
      : 'relatively stable'

    let level = 'good'
    let sentence = ''

    if (ratio > 1.5) {
      level = 'danger'
      sentence = `Incidents are ${trendWord} \u2014 ~${predicted} predicted vs. ${weeklyAverage} weekly average.`
    } else if (ratio > 1.1) {
      level = 'caution'
      sentence = `Incidents are slightly above average and ${trendWord} \u2014 ~${predicted} vs. ${weeklyAverage} avg.`
    } else if (ratio < 0.7) {
      level = 'good'
      sentence = `Incidents are below average and ${trendWord} \u2014 ~${predicted} vs. ${weeklyAverage} avg.`
    } else {
      level = trend === 'increasing' ? 'caution' : 'good'
      sentence = `Incidents are near average (~${predicted} vs. ${weeklyAverage}) and ${trendWord}.`
    }

    if (anomalyCount > 0) {
      sentence += ` ${anomalyCount} unusual ${anomalyCount === 1 ? 'spike' : 'spikes'} detected.`
    }

    return { level, sentence }
  }, [weekly, weeklyAverage, anomalyCount])

  const config = {
    good: { border: 'border-l-green-500', bg: 'bg-green-50', icon: Shield, iconColor: 'text-green-600' },
    caution: { border: 'border-l-amber-500', bg: 'bg-amber-50', icon: AlertTriangle, iconColor: 'text-amber-600' },
    danger: { border: 'border-l-red-500', bg: 'bg-red-50', icon: AlertOctagon, iconColor: 'text-red-600' },
    neutral: { border: 'border-l-surface-400', bg: 'bg-surface-50', icon: Shield, iconColor: 'text-surface-400' }
  }

  const cfg = config[status.level] || config.neutral
  const Icon = cfg.icon
  const predicted = weekly?.predicted
  const trend = weekly?.trend
  const trendLabel = trend === 'increasing' ? 'Rising' : trend === 'decreasing' ? 'Falling' : 'Stable'
  const TrendIcon = trend === 'increasing' ? TrendingUp : trend === 'decreasing' ? TrendingDown : Minus
  const trendColor = trend === 'increasing' ? 'text-red-600' : trend === 'decreasing' ? 'text-green-600' : 'text-surface-500'

  return (
    <div className={`rounded-lg border border-surface-200 border-l-4 ${cfg.border} ${cfg.bg} px-4 py-2.5`}>
      <div className="flex items-center gap-2.5">
        <Icon size={16} className={`${cfg.iconColor} flex-shrink-0`} />
        <p className="text-xs text-surface-700 leading-relaxed flex-1 min-w-0">
          {status.sentence}
        </p>
        {predicted != null && (
          <div className="hidden sm:flex items-center gap-3 text-2xs text-surface-500 flex-shrink-0">
            <span>~{predicted}/wk</span>
            <span className="text-surface-300">&middot;</span>
            <span>Avg {weeklyAverage}</span>
            <span className="text-surface-300">&middot;</span>
            <span className={`flex items-center gap-0.5 font-medium ${trendColor}`}>
              <TrendIcon size={10} />{trendLabel}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default React.memo(SafetyStatusBanner)
