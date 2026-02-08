import React from 'react'
import { Calendar, TrendingUp } from 'lucide-react'

/**
 * HazardTemporalPatterns - Day-of-week distribution with peak day highlight
 */
const HazardTemporalPatterns = ({ temporal, isMobile = false }) => {
  if (!temporal || !temporal.dayOfWeek) {
    return (
      <div className={`bg-white rounded-lg border border-surface-200 ${isMobile ? 'p-3' : 'p-4'}`}>
        <div className="flex items-center gap-2 mb-2">
          <Calendar size={16} className="text-surface-400" />
          <span className="text-xs font-semibold text-surface-500 uppercase tracking-wide">Temporal Patterns</span>
        </div>
        <p className="text-sm text-surface-400 text-center py-4">No temporal data available</p>
      </div>
    )
  }

  const { dayOfWeek, peakDay, peakDayCount, peakDayPercentage } = temporal

  // Find max count for scaling
  const maxCount = Math.max(...dayOfWeek.map(d => d.count), 1)

  // Get cell color based on intensity
  const getCellColor = (count, isPeak) => {
    if (count === 0) return 'bg-surface-100 text-surface-400'
    if (isPeak) return 'bg-primary-500 text-white'
    const ratio = count / maxCount
    if (ratio > 0.6) return 'bg-primary-400 text-white'
    if (ratio > 0.3) return 'bg-primary-200 text-primary-800'
    return 'bg-primary-100 text-primary-700'
  }

  return (
    <div className={`bg-white rounded-lg border border-surface-200 ${isMobile ? 'p-3' : 'p-4'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-indigo-500" />
          <span className="text-xs font-semibold text-surface-500 uppercase tracking-wide">Day of Week Pattern</span>
        </div>
      </div>

      {/* Peak Day Highlight */}
      {peakDay && peakDayCount > 0 && (
        <div className="flex items-center gap-2 mb-3 p-2 bg-primary-50 rounded-lg border border-primary-100">
          <TrendingUp size={14} className="text-primary-600" />
          <span className="text-xs text-primary-700">
            Peak: <span className="font-bold">{peakDay}</span>
            <span className="text-primary-500 ml-1">({peakDayCount} obs, {peakDayPercentage}%)</span>
          </span>
        </div>
      )}

      {/* Day of Week Grid */}
      <div className="grid grid-cols-7 gap-1">
        {dayOfWeek.map((day) => {
          const isPeak = day.day === peakDay
          const cellColor = getCellColor(day.count, isPeak)

          return (
            <div
              key={day.day}
              className={`relative rounded-lg p-2 text-center transition-all ${cellColor} ${
                isPeak ? 'ring-2 ring-primary-400 ring-offset-1' : ''
              }`}
            >
              {/* Day label */}
              <span className={`text-xs font-medium ${day.count === 0 ? 'text-surface-400' : ''}`}>
                {day.day}
              </span>
              {/* Count */}
              <div className={`text-lg font-bold mt-0.5 ${day.count === 0 ? 'text-surface-300' : ''}`}>
                {day.count}
              </div>
              {/* Percentage */}
              <span className={`text-2xs ${day.count === 0 ? 'text-surface-300' : 'opacity-80'}`}>
                {day.percentage}%
              </span>
              {/* Weekend indicator */}
              {day.isWeekend && (
                <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-surface-400" title="Weekend" />
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-100 text-2xs text-surface-500">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-surface-100 border border-surface-200" />
            <span>None</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-primary-100" />
            <span>Low</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-primary-300" />
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-primary-500" />
            <span>Peak</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-surface-400" />
          <span>Weekend</span>
        </div>
      </div>
    </div>
  )
}

export default React.memo(HazardTemporalPatterns)
