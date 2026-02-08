import React from 'react'
import { AlertTriangle, TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react'

/**
 * Heat badge color based on probability
 */
const getProbabilityBadge = (probability) => {
  if (probability >= 70) return { bg: 'bg-red-100', text: 'text-red-700', label: 'High' }
  if (probability >= 50) return { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Mod' }
  if (probability >= 30) return { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Low' }
  return { bg: 'bg-green-100', text: 'text-green-700', label: 'Min' }
}

/**
 * Trend indicator icon
 */
const TrendIcon = ({ trend }) => {
  const config = {
    'significant-rise': { icon: TrendingUp, color: 'text-red-500' },
    'rising': { icon: TrendingUp, color: 'text-orange-500' },
    'stable': { icon: Minus, color: 'text-surface-400' },
    'declining': { icon: TrendingDown, color: 'text-green-500' },
    'significant-decline': { icon: TrendingDown, color: 'text-green-600' },
    'new': { icon: Activity, color: 'text-blue-500' }
  }

  const { icon: Icon, color } = config[trend] || config.stable
  return <Icon size={14} className={color} />
}

/**
 * TopCriticalHazardsPanel - Shows top 5 hazards by volume
 * Complements RiskForecastPanel by always showing highest-volume hazards
 * regardless of trend direction
 */
const TopCriticalHazardsPanel = ({
  sortedHazards,
  hazardRiskSummaries,
  isSimulating
}) => {
  // Get top 5 hazards by volume (totalCount), filter out no-data
  const topByVolume = React.useMemo(() => {
    if (!sortedHazards?.length) return []
    return [...sortedHazards]
      .filter(h => !h.hasNoData && h.totalCount > 0)
      .sort((a, b) => b.totalCount - a.totalCount)
      .slice(0, 5)
      .map(h => {
        // Find matching risk summary for probability data
        const riskData = hazardRiskSummaries?.find(r => r.name === h.name)
        return {
          ...h,
          exceedanceProb: riskData?.exceedanceProb || 0
        }
      })
  }, [sortedHazards, hazardRiskSummaries])

  if (!topByVolume.length) {
    return (
      <div className="bg-white rounded-lg border border-surface-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={16} className="text-surface-400" />
          <h3 className="text-sm font-semibold text-surface-700">Top Critical Hazards</h3>
        </div>
        <p className="text-xs text-surface-500 text-center py-4">No hazard data available</p>
      </div>
    )
  }

  // Calculate max count for bar width scaling
  const maxCount = topByVolume[0]?.totalCount || 1

  return (
    <div className="bg-white rounded-lg border border-surface-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-500" />
          <h3 className="text-sm font-semibold text-surface-700">Top Critical Hazards</h3>
        </div>
        <span className="text-2xs text-surface-400 uppercase tracking-wide">By Volume</span>
      </div>

      {/* Hazard list */}
      <div className="space-y-2">
        {topByVolume.map((hazard, idx) => {
          const badge = getProbabilityBadge(hazard.exceedanceProb)
          const barWidth = (hazard.totalCount / maxCount) * 100

          return (
            <div key={hazard.name} className="relative">
              {/* Background bar */}
              <div
                className="absolute inset-y-0 left-0 bg-surface-50 rounded"
                style={{ width: `${barWidth}%` }}
              />

              {/* Content row */}
              <div className="relative flex items-center gap-2 py-1.5 px-2">
                {/* Rank */}
                <span className="text-xs font-bold text-surface-400 w-4">
                  {idx + 1}
                </span>

                {/* Hazard name */}
                <span className="text-xs font-medium text-surface-700 flex-1 truncate">
                  {hazard.name}
                </span>

                {/* Observation count */}
                <span className="text-xs font-semibold text-surface-600 tabular-nums">
                  {hazard.totalCount.toLocaleString()}
                </span>

                {/* Probability badge */}
                {hazard.exceedanceProb > 0 && (
                  <span className={`text-2xs font-medium px-1.5 py-0.5 rounded ${badge.bg} ${badge.text}`}>
                    {hazard.exceedanceProb}%
                  </span>
                )}

                {/* Trend indicator */}
                <TrendIcon trend={hazard.trendLevel?.level} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer note */}
      <div className="mt-3 pt-2 border-t border-surface-100">
        <p className="text-2xs text-surface-400">
          Ranked by total observations. High-volume hazards represent greatest exposure.
        </p>
      </div>
    </div>
  )
}

export default React.memo(TopCriticalHazardsPanel)
