import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react'

/**
 * HazardTrendingChart - Bar chart showing hazards with trend arrows
 */
const HazardTrendingChart = ({ data, onBarClick }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center mb-3">
          <AlertTriangle size={24} className="text-surface-400" />
        </div>
        <p className="text-sm text-surface-500">No hazard data available</p>
      </div>
    )
  }

  // Take top 10 hazards by current count
  const chartData = data.slice(0, 10).map(item => ({
    ...item,
    name: item.hazard.length > 18 ? item.hazard.substring(0, 18) + '...' : item.hazard,
    fullName: item.hazard
  }))

  // Get color based on trend
  const getBarColor = (item) => {
    if (item.isMajor && item.trend === 'up') return '#dc2626' // red for major + up
    if (item.trend === 'up') return '#f97316' // orange for up
    if (item.trend === 'down') return '#22c55e' // green for down
    return '#3b82f6' // blue for stable
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload
      return (
        <div className="bg-white px-3 py-2 shadow-lg rounded-lg border border-surface-200">
          <p className="font-semibold text-surface-800 text-sm">{item.fullName}</p>
          <div className="mt-1 space-y-0.5 text-xs">
            <p className="text-surface-600">Current: {item.currentCount}</p>
            <p className="text-surface-600">Previous: {item.previousCount}</p>
            <p className={
              item.trend === 'up' ? 'text-safety-critical' :
              item.trend === 'down' ? 'text-safety-success' :
              'text-surface-500'
            }>
              Change: {item.changePercent > 0 ? '+' : ''}{item.changePercent.toFixed(0)}%
            </p>
            {item.isMajor && (
              <p className="text-safety-critical font-semibold">Major Hazard</p>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  const TrendIcon = ({ trend }) => {
    if (trend === 'up') return <TrendingUp size={12} className="text-safety-critical" />
    if (trend === 'down') return <TrendingDown size={12} className="text-safety-success" />
    return <Minus size={12} className="text-surface-400" />
  }

  return (
    <div>
      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
          >
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: '#6b7280' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={130}
              tick={{ fontSize: 11, fill: '#374151' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="currentCount"
              radius={[0, 4, 4, 0]}
              onClick={(data) => onBarClick?.(data)}
              className="cursor-pointer"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getBarColor(entry)}
                  className="transition-opacity hover:opacity-80"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Trend indicators legend */}
      <div className="mt-4 flex flex-wrap gap-3">
        {chartData.slice(0, 5).map(item => (
          <div
            key={item.hazard}
            className="flex items-center gap-1.5 text-xs px-2 py-1 bg-surface-50 rounded"
          >
            <TrendIcon trend={item.trend} />
            <span className="text-surface-600 truncate max-w-[100px]" title={item.hazard}>
              {item.name}
            </span>
            <span className={
              item.trend === 'up' ? 'text-safety-critical font-semibold' :
              item.trend === 'down' ? 'text-safety-success font-semibold' :
              'text-surface-500'
            }>
              {item.changePercent > 0 ? '+' : ''}{item.changePercent.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-4 text-xs text-surface-500 border-t border-surface-100 pt-3">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-[#dc2626]" />
          <span>Major + Rising</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-[#f97316]" />
          <span>Rising</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-[#22c55e]" />
          <span>Declining</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-[#3b82f6]" />
          <span>Stable</span>
        </div>
      </div>
    </div>
  )
}

export default React.memo(HazardTrendingChart)
