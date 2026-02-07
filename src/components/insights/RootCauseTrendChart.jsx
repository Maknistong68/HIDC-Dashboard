import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { TrendingUp } from 'lucide-react'

/**
 * RootCauseTrendChart - Line chart showing root cause trends over time
 */
const RootCauseTrendChart = ({ data, onPointClick }) => {
  if (!data || !data.hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center mb-3">
          <TrendingUp size={24} className="text-surface-400" />
        </div>
        <p className="text-sm text-surface-500">
          No trend data available
        </p>
        <p className="text-xs text-surface-400 mt-1">
          Requires historical root cause data
        </p>
      </div>
    )
  }

  const { trends, rootCauses } = data

  // Colors for each root cause line
  const lineColors = [
    '#8b5cf6', // purple
    '#f97316', // orange
    '#22c55e', // green
    '#3b82f6', // blue
    '#ef4444', // red
  ]

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-3 py-2 shadow-lg rounded-lg border border-surface-200">
          <p className="font-semibold text-surface-800 text-sm mb-1">{label}</p>
          {payload.map((entry) => (
            <p key={entry.name} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={trends}
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="line"
            iconSize={12}
            formatter={(value) => (
              <span className="text-xs text-surface-600">
                {value.length > 15 ? value.substring(0, 15) + '...' : value}
              </span>
            )}
          />
          {rootCauses.map((rc, index) => (
            <Line
              key={rc}
              type="monotone"
              dataKey={rc}
              name={rc}
              stroke={lineColors[index % lineColors.length]}
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 2 }}
              activeDot={{
                r: 5,
                strokeWidth: 2,
                onClick: (e, payload) => onPointClick?.(payload.payload, rc)
              }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default React.memo(RootCauseTrendChart)
