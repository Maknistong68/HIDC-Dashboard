import React, { useMemo } from 'react'
import { format, subDays, startOfWeek, addDays } from 'date-fns'

const ActivityHeatmap = ({ data, title = 'Activity Heatmap', period = null }) => {
  const today = new Date()

  // Calculate weeks to show based on period (max 12 columns)
  const weeksToShow = useMemo(() => {
    if (period === null) return 12 // All - show max
    if (period === 0.25) return 1  // 1W
    if (period === 1) return 4     // 1M
    if (period === 3) return 12    // 3M
    if (period === 6) return 12    // 6M (capped)
    if (period === 12) return 12   // 1Y (capped)
    return 12 // default max
  }, [period])

  // Calculate the active period boundary for highlighting
  const activePeriodStart = useMemo(() => {
    if (period === null) return null // All - no dimming
    const daysBack = period === 0.25 ? 7 : period * 30
    return subDays(today, daysBack)
  }, [period, today])

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

        // Determine if date is outside active period
        const isOutsidePeriod = activePeriodStart && date < activePeriodStart

        weekData.push({
          date: dateStr,
          displayDate: format(date, 'MMM d, yyyy'),
          count: dayData?.count || 0,
          level: dayData?.level || 0,
          isFuture: date > today,
          isOutsidePeriod,
        })
      }
      weeks.push(weekData)
    }

    return weeks
  }, [data, today, weeksToShow, activePeriodStart])

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
  }, [today, weeksToShow])

  const getLevelColor = (level, isFuture, isOutsidePeriod) => {
    if (isFuture) return '#f3f4f6'
    const colors = [
      '#ebedf0', // 0 - no activity
      '#9be9a8', // 1 - low
      '#40c463', // 2 - medium
      '#30a14e', // 3 - high
      '#216e39', // 4 - very high
    ]
    // Dimmed colors for dates outside active period
    const dimmedColors = [
      '#f5f5f5', // 0 - no activity (dimmed)
      '#d4e8d6', // 1 - low (dimmed)
      '#b3dbb8', // 2 - medium (dimmed)
      '#a8c9ab', // 3 - high (dimmed)
      '#9bb89e', // 4 - very high (dimmed)
    ]
    if (isOutsidePeriod) {
      return dimmedColors[level] || dimmedColors[0]
    }
    return colors[level] || colors[0]
  }

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Calculate responsive cell size based on weeks shown
  const cellSize = useMemo(() => {
    // Larger cells when fewer weeks are shown
    if (weeksToShow <= 1) return 'w-6 h-6'
    if (weeksToShow <= 4) return 'w-4 h-4'
    return 'w-2.5 h-2.5' // default for 12 weeks
  }, [weeksToShow])

  // Calculate month label positioning based on cell size
  const cellPixelSize = useMemo(() => {
    if (weeksToShow <= 1) return 24
    if (weeksToShow <= 4) return 16
    return 10
  }, [weeksToShow])

  return (
    <div className="bg-white rounded-sm border border-surface-200 p-3">
      <h3 className="text-xs font-semibold text-surface-800 mb-2 uppercase tracking-wide">{title}</h3>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Month labels */}
          <div className="flex mb-0.5">
            <div className="w-6 flex-shrink-0"></div>
            <div className="flex gap-0.5 relative">
              {monthLabels.map((label, index) => (
                <div
                  key={index}
                  className="text-xs text-surface-400 absolute"
                  style={{
                    left: `${label.week * (cellPixelSize + 1)}px`,
                    fontSize: '9px',
                  }}
                >
                  {label.label}
                </div>
              ))}
            </div>
          </div>

          {/* Spacer for month labels */}
          <div className="h-3"></div>

          {/* Heatmap grid */}
          <div className="flex">
            {/* Day labels */}
            <div className="flex flex-col gap-px mr-0.5 flex-shrink-0">
              {dayLabels.map((label, index) => (
                <div
                  key={label}
                  className={`${cellSize} text-surface-400 flex items-center`}
                  style={{ visibility: index % 2 === 1 ? 'visible' : 'hidden', fontSize: '8px' }}
                >
                  {label.substring(0, 1)}
                </div>
              ))}
            </div>

            {/* Grid - responsive with CSS grid */}
            <div
              className="grid gap-px"
              style={{
                gridTemplateColumns: `repeat(${weeksToShow}, 1fr)`,
                maxWidth: '100%'
              }}
            >
              {calendarData.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-px">
                  {week.map((day) => (
                    <div
                      key={day.date}
                      className={`${cellSize} cursor-pointer transition-all hover:scale-110 hover:ring-1 hover:ring-surface-400 ${
                        day.isOutsidePeriod ? 'opacity-60' : ''
                      }`}
                      style={{
                        backgroundColor: getLevelColor(day.level, day.isFuture, day.isOutsidePeriod),
                        minWidth: cellPixelSize,
                        minHeight: cellPixelSize,
                      }}
                      title={`${day.displayDate}: ${day.count} activities${day.isOutsidePeriod ? ' (outside selected period)' : ''}`}
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
                style={{ backgroundColor: getLevelColor(level, false, false) }}
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
