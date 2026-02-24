import { useMemo, memo } from 'react'
import { MapPin } from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts'

/**
 * Get variance-based bar color
 * High counts = red, medium = amber, low = blue
 */
const getBarColor = (count, maxCount) => {
  const ratio = maxCount > 0 ? count / maxCount : 0
  if (ratio > 0.6) return '#ef4444' // red
  if (ratio > 0.3) return '#f59e0b' // amber
  return '#3b82f6' // blue
}

/**
 * CategoryTopHazards - Horizontal bar chart showing top hazards for a category
 * Clickable bars to filter observations by hazard
 */
const CategoryTopHazards = ({ hazards = [], onBarClick, isMobile = false }) => {
  const { chartData } = useMemo(() => {
    if (!hazards?.length) return { chartData: [], maxCount: 0 }

    // Prepare data for chart
    const data = hazards.map(h => ({
      name: h.name.length > 18 ? h.name.substring(0, 18) + '...' : h.name,
      fullName: h.name,
      count: h.count,
      percentage: h.percentage
    }))

    const max = Math.max(...data.map(d => d.count), 0)

    return {
      chartData: data.map(d => ({
        ...d,
        fill: getBarColor(d.count, max)
      })),
      maxCount: max
    }
  }, [hazards])

  if (!chartData.length) {
    return (
      <div className={`bg-white rounded-lg border border-surface-200 ${isMobile ? 'p-3' : 'p-4'}`}>
        <div className="flex items-center gap-2 mb-2">
          <MapPin size={16} className="text-surface-400" />
          <span className="text-xs font-semibold text-surface-500 uppercase tracking-wide">Top Hazards</span>
        </div>
        <p className="text-sm text-surface-400 text-center py-6">No hazard data available</p>
      </div>
    )
  }

  const handleBarClick = (data) => {
    if (onBarClick && data?.fullName) {
      onBarClick(data.fullName)
    }
  }

  // Calculate dynamic height based on number of items
  const chartHeight = Math.max(120, chartData.length * 28)

  return (
    <div className={`bg-white rounded-lg border border-surface-200 ${isMobile ? 'p-3' : 'p-4'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-orange-500" />
          <span className="text-xs font-semibold text-surface-500 uppercase tracking-wide">Top Hazard Categories</span>
        </div>
        <span className="text-2xs text-surface-400">{hazards.length} hazards</span>
      </div>

      {/* Chart */}
      <div style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
            <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 10, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              width={100}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="bg-surface-900 text-white px-3 py-2 rounded-lg shadow-xl text-xs">
                      <p className="font-medium">{data.fullName}</p>
                      <p className="text-surface-300">
                        Count: <span className="text-white font-bold">{data.count}</span>
                        <span className="text-surface-400 ml-1">({data.percentage}%)</span>
                      </p>
                      {onBarClick && (
                        <p className="text-surface-400 text-2xs mt-1">Click to view observations</p>
                      )}
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar
              dataKey="count"
              radius={[0, 4, 4, 0]}
              isAnimationActive={true}
              animationDuration={400}
              onClick={handleBarClick}
              style={{ cursor: onBarClick ? 'pointer' : 'default' }}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${entry.fullName}-${index}`}
                  fill={entry.fill}
                  style={{ cursor: onBarClick ? 'pointer' : 'default' }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Click hint */}
      {onBarClick && (
        <p className="text-2xs text-surface-400 text-center mt-2">Click a bar to view related observations</p>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-surface-100 text-2xs text-surface-500">
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-[#ef4444]" />
          <span>High</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-[#f59e0b]" />
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-[#3b82f6]" />
          <span>Low</span>
        </div>
      </div>
    </div>
  )
}

export default memo(CategoryTopHazards)
