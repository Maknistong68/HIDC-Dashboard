import React, { memo } from 'react'
import { Clock, MapPin, AlertTriangle, Eye } from 'lucide-react'

const RISK_LEVEL_COLORS = {
  high: 'bg-red-500',
  elevated: 'bg-amber-400',
  normal: 'bg-blue-300',
  low: 'bg-surface-200',
}

/**
 * ForecastIntelligencePanel - 3-column responsive card grid answering WHEN / WHERE / WHY.
 */
const ForecastIntelligencePanel = ({ insights, dayPatterns, hourPatterns }) => {
  if (!insights?.hasData) return null

  // Find peak shift from hourly patterns
  const peakShift = hourPatterns?.shifts
    ?.slice()
    .sort((a, b) => b.count - a.count)[0] || null

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {/* WHEN card */}
      <div className="bg-white rounded-lg border border-blue-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
            <Clock size={13} className="text-blue-600" />
          </div>
          <h4 className="text-xs font-semibold text-surface-600 uppercase tracking-wider">When</h4>
        </div>

        {/* Peak day badge */}
        {dayPatterns?.peakDay && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-surface-800">{dayPatterns.peakDay}</span>
            {dayPatterns.patterns && (() => {
              const peak = dayPatterns.patterns.find(p => p.day === dayPatterns.peakDay)
              return peak ? (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">
                  {peak.riskIndex}% risk index
                </span>
              ) : null
            })()}
          </div>
        )}

        {/* Peak shift */}
        {peakShift && (
          <p className="text-xs text-surface-500 mb-2">
            Peak shift: <span className="font-medium text-surface-700">{peakShift.label}</span>
            <span className="text-surface-400"> ({peakShift.count} incidents)</span>
          </p>
        )}

        {/* Peak hours */}
        {hourPatterns?.peakHours?.length > 0 && (
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-[10px] text-surface-500">Peak hours:</span>
            <div className="flex gap-1">
              {hourPatterns.peakHours.slice(0, 3).map((hour) => (
                <span key={hour} className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                  {hourPatterns.patterns?.[hour]?.hour12 || `${hour}:00`}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Low coverage shifts */}
        {hourPatterns?.shifts?.filter(s => s.riskLevel === 'low').length > 0 && (
          <div className="space-y-1 mb-3">
            {hourPatterns.shifts.filter(s => s.riskLevel === 'low').map((shift) => (
              <div key={shift.key} className="flex items-center gap-1.5">
                <Eye size={10} className="text-amber-500 shrink-0" />
                <span className="text-[10px] text-amber-700">
                  {shift.label}: only {shift.count} obs <span className="text-amber-500">(low coverage)</span>
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Weekly heatmap */}
        {dayPatterns?.patterns?.length > 0 && (
          <div className="flex gap-1">
            {dayPatterns.patterns.map((p) => (
              <div key={p.shortName} className="flex-1 text-center">
                <div
                  className={`h-5 rounded-sm ${RISK_LEVEL_COLORS[p.riskLevel] || RISK_LEVEL_COLORS.normal}`}
                  title={`${p.day}: ${p.count} incidents (${p.riskIndex}% risk index)`}
                />
                <span className="text-[9px] text-surface-400 mt-0.5 block">{p.shortName}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* WHERE card */}
      <div className="bg-white rounded-lg border border-purple-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
            <MapPin size={13} className="text-purple-600" />
          </div>
          <h4 className="text-xs font-semibold text-surface-600 uppercase tracking-wider">Where</h4>
        </div>

        {/* Top sites */}
        {insights.sites?.length > 0 ? (
          <div className="space-y-2">
            {insights.sites.slice(0, 5).map((s, i) => {
              const maxCount = insights.sites[0]?.count || 1
              const pct = Math.round((s.count / maxCount) * 100)
              return (
                <div key={s.name || i}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs text-surface-700 truncate mr-2">{s.name}</span>
                    <span className="text-[10px] font-semibold text-surface-500">{s.count}</span>
                  </div>
                  <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-400 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-xs text-surface-400">No site data</p>
        )}
      </div>

      {/* WHY card */}
      <div className="bg-white rounded-lg border border-amber-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
            <AlertTriangle size={13} className="text-amber-600" />
          </div>
          <h4 className="text-xs font-semibold text-surface-600 uppercase tracking-wider">Why</h4>
        </div>

        {/* Top 5 root causes */}
        {insights.rootCauses?.length > 0 ? (
          <div className="space-y-2">
            {insights.rootCauses.slice(0, 5).map((rc, i) => {
              const maxCount = insights.rootCauses[0]?.count || 1
              const pct = Math.round((rc.count / maxCount) * 100)
              return (
                <div key={rc.name || i}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs text-surface-700 truncate mr-2">{rc.name}</span>
                    <span className="text-[10px] font-semibold text-surface-500">
                      {rc.percentage ? `${rc.percentage}%` : rc.count}
                    </span>
                  </div>
                  <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-xs text-surface-400">No root cause data available</p>
        )}
      </div>
    </div>
  )
}

export default memo(ForecastIntelligencePanel)
