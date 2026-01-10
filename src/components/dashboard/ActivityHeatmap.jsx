import React, { useMemo } from 'react'
import { format, subDays, startOfWeek, addDays, getDay } from 'date-fns'

const ActivityHeatmap = ({ data, title = 'Activity Heatmap' }) => {
  const today = new Date()
  const weeksToShow = 26 // 6 months

  // Generate calendar data
  const calendarData = useMemo(() => {
    const weeks = []
    const startDate = startOfWeek(subDays(today, weeksToShow * 7), { weekStartsOn: 0 })

    for (let week = 0; week < weeksToShow; week++) {
      const weekData = []
      for (let day = 0; day < 7; day++) {
        const date = addDays(startDate, week * 7 + day)
        const dateStr = format(date, 'yyyy-MM-dd')
        const dayData = data.find(d => d.date === dateStr)

        weekData.push({
          date: dateStr,
          displayDate: format(date, 'MMM d, yyyy'),
          count: dayData?.count || 0,
          level: dayData?.level || 0,
          isFuture: date > today,
        })
      }
      weeks.push(weekData)
    }

    return weeks
  }, [data, today])

  // Month labels
  const monthLabels = useMemo(() => {
    const labels = []
    const startDate = startOfWeek(subDays(today, weeksToShow * 7), { weekStartsOn: 0 })

    let lastMonth = -1
    for (let week = 0; week < weeksToShow; week++) {
      const weekStart = addDays(startDate, week * 7)
      const month = weekStart.getMonth()

      if (month !== lastMonth) {
        labels.push({
          week,
          label: format(weekStart, 'MMM'),
        })
        lastMonth = month
      }
    }

    return labels
  }, [today])

  const getLevelColor = (level, isFuture) => {
    if (isFuture) return '#f3f4f6'
    const colors = [
      '#ebedf0', // 0 - no activity
      '#9be9a8', // 1 - low
      '#40c463', // 2 - medium
      '#30a14e', // 3 - high
      '#216e39', // 4 - very high
    ]
    return colors[level] || colors[0]
  }

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="bg-white rounded-sm border border-surface-200 p-3">
      <h3 className="text-xs font-semibold text-surface-800 mb-2 uppercase tracking-wide">{title}</h3>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Month labels */}
          <div className="flex mb-0.5">
            <div className="w-6"></div>
            <div className="flex gap-0.5">
              {monthLabels.map((label, index) => (
                <div
                  key={index}
                  className="text-xs text-surface-400"
                  style={{
                    position: 'relative',
                    left: `${label.week * 11}px`,
                    fontSize: '9px',
                  }}
                >
                  {label.label}
                </div>
              ))}
            </div>
          </div>

          {/* Heatmap grid */}
          <div className="flex">
            {/* Day labels */}
            <div className="flex flex-col gap-px mr-0.5">
              {dayLabels.map((label, index) => (
                <div
                  key={label}
                  className="h-2.5 text-surface-400 flex items-center"
                  style={{ visibility: index % 2 === 1 ? 'visible' : 'hidden', fontSize: '8px' }}
                >
                  {label.substring(0, 1)}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="flex gap-px">
              {calendarData.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-px">
                  {week.map((day, dayIndex) => (
                    <div
                      key={day.date}
                      className="w-2.5 h-2.5 cursor-pointer transition-transform hover:scale-125"
                      style={{ backgroundColor: getLevelColor(day.level, day.isFuture) }}
                      title={`${day.displayDate}: ${day.count} activities`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-1 mt-2">
            <span className="text-surface-400" style={{ fontSize: '9px' }}>Less</span>
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className="w-2.5 h-2.5"
                style={{ backgroundColor: getLevelColor(level, false) }}
              />
            ))}
            <span className="text-surface-400" style={{ fontSize: '9px' }}>More</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ActivityHeatmap
