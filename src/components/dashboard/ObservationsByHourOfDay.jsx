import React, { useMemo } from 'react'
import { InfoTooltip } from '../ui/Tooltip'
import { Card } from '../ui'

/**
 * ObservationsByHourOfDay - Bar chart with heatmap-style coloring
 * Higher observations = redder color
 */
const ObservationsByHourOfDay = ({ incidents = [] }) => {
  const hourData = useMemo(() => {
    // Initialize 24 hours
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      label: `${i.toString().padStart(2, '0')}:00`,
      count: 0,
      isDayShift: i >= 6 && i < 18, // 6 AM to 6 PM
    }))

    incidents.forEach(incident => {
      // Try to extract hour from time field or date field
      let hour = null

      if (incident.eventTime) {
        // Parse time string (e.g., "14:30", "2:30 PM")
        const timeStr = incident.eventTime.toString()
        const match = timeStr.match(/(\d{1,2}):?(\d{2})?/)
        if (match) {
          hour = parseInt(match[1], 10)
          // Handle PM times
          if (timeStr.toLowerCase().includes('pm') && hour !== 12) {
            hour += 12
          } else if (timeStr.toLowerCase().includes('am') && hour === 12) {
            hour = 0
          }
        }
      }

      if (hour !== null && hour >= 0 && hour < 24) {
        hours[hour].count++
      }
    })

    const maxCount = Math.max(...hours.map(h => h.count), 1)

    return hours.map(h => ({
      ...h,
      percent: (h.count / maxCount) * 100,
      maxCount
    }))
  }, [incidents])

  // Calculate shift totals
  const shiftTotals = useMemo(() => {
    const dayShift = hourData.filter(h => h.isDayShift).reduce((sum, h) => sum + h.count, 0)
    const nightShift = hourData.filter(h => !h.isDayShift).reduce((sum, h) => sum + h.count, 0)
    const total = dayShift + nightShift
    return {
      dayShift,
      nightShift,
      dayPercent: total > 0 ? ((dayShift / total) * 100).toFixed(1) : 0,
      nightPercent: total > 0 ? ((nightShift / total) * 100).toFixed(1) : 0,
    }
  }, [hourData])

  // Heatmap color function - softer colors matching dashboard theme
  const getHeatmapColor = (count, maxCount) => {
    if (count === 0 || maxCount === 0) {
      return '#f1f5f9' // slate-100
    }

    const intensity = count / maxCount

    if (intensity <= 0.2) {
      return '#fef3c7' // amber-100
    } else if (intensity <= 0.4) {
      return '#fde68a' // amber-200
    } else if (intensity <= 0.6) {
      return '#fdba74' // orange-300
    } else if (intensity <= 0.8) {
      return '#fb923c' // orange-400
    } else {
      return '#f87171' // red-400
    }
  }

  const maxCount = Math.max(...hourData.map(h => h.count), 1)

  return (
    <Card padding="default" className="h-full flex flex-col">
      <Card.Header>
        <Card.Title>
          Observations by Hour of Day
          <InfoTooltip text="Distribution of observations by hour. Bars are colored by intensity (yellow to red = more observations). Day shift: 6AM-6PM, Night shift: 6PM-6AM." />
        </Card.Title>
      </Card.Header>

      {/* Chart - flex-1 to fill available space, min-height for mobile */}
      <div className="flex-1 flex flex-col" style={{ minHeight: '120px' }}>
        <div className="flex-1 flex items-end relative" style={{ minHeight: '80px' }}>
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-surface-400 pr-1 w-6">
            <span>{maxCount}</span>
            <span>{Math.round(maxCount / 2)}</span>
            <span>0</span>
          </div>

          {/* Bars */}
          <div className="ml-7 flex-1 flex items-end gap-px h-full border-b border-l border-surface-200">
            {hourData.map((hour) => (
              <div
                key={hour.hour}
                className="flex-1 flex flex-col items-center justify-end group relative h-full"
              >
                {/* Bar */}
                <div
                  className="w-full rounded-t-sm transition-all duration-300 cursor-pointer hover:opacity-80"
                  style={{
                    height: `${(hour.count / maxCount) * 100}%`,
                    backgroundColor: getHeatmapColor(hour.count, maxCount),
                    minHeight: hour.count > 0 ? '4px' : '0px',
                  }}
                  title={`${hour.label}: ${hour.count} observations`}
                />

                {/* Tooltip on hover */}
                {hour.count > 0 && (
                  <div className="hidden group-hover:block absolute -top-6 left-1/2 -translate-x-1/2 bg-surface-800 text-white text-xs px-1.5 py-0.5 rounded whitespace-nowrap z-10">
                    {hour.count}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* X-axis labels */}
        <div className="ml-7 flex justify-between mt-1 text-xs text-surface-400">
          <span>00</span>
          <span>06</span>
          <span>12</span>
          <span>18</span>
          <span>23</span>
        </div>
      </div>

      {/* Legend - all in one line */}
      <div className="flex items-center justify-center gap-4 mt-2 pt-2 border-t border-surface-100 text-xs text-surface-500 flex-wrap">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-surface-300" />
          <span>Day ({shiftTotals.dayPercent}%)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-surface-500" />
          <span>Night ({shiftTotals.nightPercent}%)</span>
        </div>
        <span className="text-surface-300">|</span>
        <div className="flex items-center gap-1">
          <span className="text-surface-400">Low</span>
          <div className="flex gap-px">
            <span className="w-3 h-2.5 rounded-sm bg-amber-100" />
            <span className="w-3 h-2.5 rounded-sm bg-amber-200" />
            <span className="w-3 h-2.5 rounded-sm bg-orange-300" />
            <span className="w-3 h-2.5 rounded-sm bg-orange-400" />
            <span className="w-3 h-2.5 rounded-sm bg-red-400" />
          </div>
          <span className="text-surface-400">High</span>
        </div>
      </div>
    </Card>
  )
}

export default React.memo(ObservationsByHourOfDay)
