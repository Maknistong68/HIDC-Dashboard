import React from 'react'
import { MapPin, TrendingUp, TrendingDown, Minus } from 'lucide-react'

const RISK_BADGE = {
  High: { bg: 'bg-red-100', text: 'text-red-700' },
  Elevated: { bg: 'bg-amber-100', text: 'text-amber-700' },
  Moderate: { bg: 'bg-amber-50', text: 'text-amber-600' },
  Low: { bg: 'bg-green-100', text: 'text-green-700' }
}

const RANK_COLORS = ['bg-red-500','bg-amber-500','bg-amber-400','bg-surface-400','bg-surface-300']

const TrendArrow = ({ trend }) => {
  if (trend === 'significant-rise' || trend === 'rising') return <TrendingUp size={11} className="text-red-500" />
  if (trend === 'declining' || trend === 'significant-decline') return <TrendingDown size={11} className="text-green-500" />
  return <Minus size={11} className="text-surface-400" />
}

const HazardRiskCards = ({ hazardSummaries }) => {
  if (!hazardSummaries?.length) {
    return (
      <div className="bg-white rounded-lg border border-surface-200 p-4 text-center text-xs text-surface-400">
        Run simulation to see hazard risk ranking.
      </div>
    )
  }

  const top5 = hazardSummaries.slice(0, 5)

  return (
    <div className="bg-white rounded-lg border border-surface-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-surface-200">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-primary-600" />
          <h3 className="text-sm font-semibold text-surface-800">Areas to Watch</h3>
          <span className="text-2xs text-surface-400">Where?</span>
        </div>
      </div>
      <div className="p-3 space-y-1.5">
        {top5.map((h, idx) => {
          const badge = RISK_BADGE[h.riskLevel] || RISK_BADGE.Low
          return (
            <div key={h.name} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg border border-surface-100 hover:bg-surface-50 transition-colors">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-2xs font-bold text-white flex-shrink-0 ${RANK_COLORS[idx] || RANK_COLORS[4]}`}>
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-surface-800 truncate">{h.name}</span>
                  <span className={`text-2xs px-1 py-0.5 rounded-full font-medium ${badge.bg} ${badge.text}`}>{h.riskLevel}</span>
                  <TrendArrow trend={h.trend} />
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-2xs text-surface-500">
                  <span><span className="font-semibold text-surface-700">{h.exceedanceProb}%</span> chance exceeding normal</span>
                  {h.weeklyMean > 0 && <span className="text-surface-300">&middot; ~{h.weeklyMean}/wk</span>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default React.memo(HazardRiskCards)
