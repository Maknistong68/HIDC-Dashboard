import React from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

/**
 * IncidentTypeProbabilityChart - Donut chart showing LTI/MTI/FAC probability breakdown
 * Features dashed stroke pattern to indicate projected/predicted data
 */
const IncidentTypeProbabilityChart = ({ data }) => {
  if (!data || !data.hasData || !data.types || data.types.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-surface-50 rounded-lg border border-dashed border-surface-300">
        <p className="text-sm text-surface-500">No incident type data available</p>
      </div>
    )
  }

  const { types, mostLikely } = data

  // Prepare chart data with defensive coding for missing labels
  const chartData = types
    .filter(t => t && t.label) // Filter out entries without labels
    .map(t => ({
      name: (t.label || 'Unknown').split(' ')[0], // Just "LTI", "MTI", etc.
      fullName: t.label || 'Unknown',
      value: t.probability || 0,
      color: t.color || '#94a3b8',
      trend: t.trend || 'stable',
      trendChange: t.trendChange || 0
    }))

  const getTrendIcon = (trend, size = 12) => {
    if (trend === 'increasing') return <TrendingUp size={size} className="text-safety-critical" />
    if (trend === 'decreasing') return <TrendingDown size={size} className="text-safety-success" />
    return <Minus size={size} className="text-surface-400" />
  }

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null

    const item = payload[0].payload

    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-surface-200">
        <p className="text-sm font-semibold text-surface-700 mb-1">{item.fullName}</p>
        <p className="text-lg font-bold" style={{ color: item.color }}>
          {item.value}%
        </p>
        <div className="flex items-center gap-1 mt-1 text-xs text-surface-500">
          {getTrendIcon(item.trend)}
          <span>
            {item.trend === 'stable' ? 'Stable' :
             item.trend === 'increasing' ? `+${item.trendChange}%` :
             `${item.trendChange}%`}
          </span>
        </div>
      </div>
    )
  }

  // Custom label renderer
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }) => {
    if (percent < 0.05) return null // Don't show labels for tiny slices

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
        {`${name} ${value.toFixed(0)}%`}
      </text>
    )
  }

  return (
    <div className="bg-surface-50 rounded-lg border-2 border-dashed border-surface-300 p-4">
      {/* PROJECTED badge */}
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-surface-700">Type Probability</h4>
        <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-700 uppercase tracking-wide">
          Projected
        </span>
      </div>

      {/* Donut Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={75}
              paddingAngle={2}
              dataKey="value"
              labelLine={false}
              label={renderCustomLabel}
              strokeWidth={2}
              strokeDasharray="5 5"
              stroke="#fff"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  strokeDasharray="5 5"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Most likely type */}
      {mostLikely && (
        <div className="mt-3 pt-3 border-t border-surface-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-surface-500">Most likely:</span>
            <div className="flex items-center gap-2">
              <span
                className="text-sm font-semibold"
                style={{ color: mostLikely.color }}
              >
                {(mostLikely?.label || 'Unknown').split(' ')[0]}
              </span>
              <span className="text-xs text-surface-500">
                ({mostLikely.probability}%)
              </span>
              {getTrendIcon(mostLikely.trend)}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-3 space-y-1">
        {types.slice(0, 4).filter(t => t && t.label).map(t => (
          <div key={t.type} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: t.color || '#94a3b8' }}
              />
              <span className="text-surface-600">{(t.label || 'Unknown').split(' ')[0]}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-surface-700">{t.probability || 0}%</span>
              {getTrendIcon(t.trend, 10)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default React.memo(IncidentTypeProbabilityChart)
