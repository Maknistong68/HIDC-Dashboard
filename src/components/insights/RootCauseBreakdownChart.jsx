import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { PieChartIcon } from 'lucide-react'

/**
 * RootCauseBreakdownChart - Donut chart showing root cause distribution
 */
const RootCauseBreakdownChart = ({ data, onSliceClick }) => {
  if (!data || !data.hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center mb-3">
          <PieChartIcon size={24} className="text-surface-400" />
        </div>
        <p className="text-sm text-surface-500">
          No root cause data available
        </p>
        <p className="text-xs text-surface-400 mt-1">
          Root causes are populated from incident data
        </p>
      </div>
    )
  }

  const { breakdown, total, topCause } = data

  // Filter out "Not Specified" for cleaner visualization and take top 8
  const chartData = breakdown
    .filter(item => item.name !== 'Not Specified')
    .slice(0, 8)

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload
      return (
        <div className="bg-white px-3 py-2 shadow-lg rounded-lg border border-surface-200">
          <p className="font-semibold text-surface-800 text-sm">{item.name}</p>
          <p className="text-xs text-surface-600">
            {item.count} incidents ({item.percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null // Don't show labels for small slices
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={90}
            paddingAngle={2}
            dataKey="count"
            nameKey="name"
            labelLine={false}
            label={renderCustomizedLabel}
            onClick={(data) => onSliceClick?.(data)}
            className="cursor-pointer"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                className="transition-opacity hover:opacity-80"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span className="text-xs text-surface-600">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center text for donut */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ marginTop: '-40px' }}>
        <div className="text-center">
          <p className="text-2xl font-bold text-surface-800">{total}</p>
          <p className="text-xs text-surface-500">Total</p>
        </div>
      </div>

      {/* Top cause highlight */}
      {topCause && topCause.name !== 'Not Specified' && (
        <div className="mt-2 p-2 bg-surface-50 rounded-lg text-center">
          <p className="text-xs text-surface-500">Most Common</p>
          <p className="text-sm font-semibold text-surface-700">{topCause.name}</p>
          <p className="text-xs text-surface-500">{topCause.percentage}% of incidents</p>
        </div>
      )}
    </div>
  )
}

export default React.memo(RootCauseBreakdownChart)
