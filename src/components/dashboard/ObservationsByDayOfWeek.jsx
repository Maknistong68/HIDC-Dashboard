import React, { useMemo } from 'react'
import { InfoTooltip } from '../ui/Tooltip'
import { Card } from '../ui'
import { parseISO, getDay } from 'date-fns'

/**
 * ObservationsByDayOfWeek - Horizontal bar chart showing observations by day
 */
const ObservationsByDayOfWeek = ({ incidents = [] }) => {
  const dayData = useMemo(() => {
    const days = [
      { key: 0, name: 'Sun', isWeekend: false },
      { key: 1, name: 'Mon', isWeekend: false },
      { key: 2, name: 'Tue', isWeekend: false },
      { key: 3, name: 'Wed', isWeekend: false },
      { key: 4, name: 'Thu', isWeekend: false },
      { key: 5, name: 'Fri', isWeekend: true },
      { key: 6, name: 'Sat', isWeekend: true },
    ]

    const counts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }

    incidents.forEach(incident => {
      if (incident.date) {
        try {
          const dayOfWeek = getDay(parseISO(incident.date))
          counts[dayOfWeek]++
        } catch (e) {
          // Skip invalid dates
        }
      }
    })

    const maxCount = Math.max(...Object.values(counts), 1)

    return days.map(day => ({
      ...day,
      count: counts[day.key],
      percent: (counts[day.key] / maxCount) * 100
    }))
  }, [incidents])

  // Calculate totals for legend
  const totals = useMemo(() => {
    const weekday = dayData.filter(d => !d.isWeekend).reduce((sum, d) => sum + d.count, 0)
    const weekend = dayData.filter(d => d.isWeekend).reduce((sum, d) => sum + d.count, 0)
    return { weekday, weekend }
  }, [dayData])

  const maxCount = Math.max(...dayData.map(d => d.count), 1)

  return (
    <Card padding="default" className="h-full flex flex-col">
      <Card.Header>
        <Card.Title>
          Observations by Day of Week
          <InfoTooltip text="Distribution of observations across days of the week. Blue bars are weekdays, gray bars are weekends. Helps identify reporting patterns and potential gaps." />
        </Card.Title>
      </Card.Header>

      <div className="flex-1 flex flex-col justify-center space-y-1.5">
        {dayData.map((day) => (
          <div key={day.key} className="flex items-center gap-2">
            <span className="w-8 text-xs font-medium text-surface-500">{day.name}</span>
            <div className="flex-1 h-6 bg-surface-100 rounded-sm overflow-hidden relative">
              <div
                className={`h-full transition-all duration-300 ${
                  day.isWeekend ? 'bg-surface-300' : 'bg-blue-300'
                }`}
                style={{ width: `${day.percent}%` }}
              />
              {day.count > 0 && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-surface-600">
                  {day.count}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between mt-2 px-10 text-xs text-surface-400">
        <span>0</span>
        <span>{Math.round(maxCount / 4)}</span>
        <span>{Math.round(maxCount / 2)}</span>
        <span>{Math.round(maxCount * 3 / 4)}</span>
        <span>{maxCount}</span>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-2 pt-2 border-t border-surface-100">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-blue-300" />
          <span className="text-xs text-surface-500">Weekday ({totals.weekday})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-surface-300" />
          <span className="text-xs text-surface-500">Weekend ({totals.weekend})</span>
        </div>
      </div>
    </Card>
  )
}

export default ObservationsByDayOfWeek
