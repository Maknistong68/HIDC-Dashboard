import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { InfoTooltip } from '../ui/Tooltip'
import { Card } from '../ui'

/**
 * IncidentTrendChart - Positive vs Negative observation trend
 */
const IncidentTrendChart = ({ data }) => {
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null

    return (
      <div className="bg-white/95 backdrop-blur-sm border border-surface-200 rounded-lg shadow-medium p-3 animate-fade-in">
        <p className="text-xs font-medium text-surface-700 mb-2">{label}</p>
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2 text-xs">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-surface-600">{entry.name}:</span>
            <span className="font-semibold text-surface-800">{entry.value}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Card padding="default" className="h-full flex flex-col">
      <Card.Header>
        <Card.Title>
          Positive vs. Negative Observation Trend
          <InfoTooltip text="HOW THIS CHART IS CREATED: We look at the 'Date' field of each observation and group them by month. Then we split each month's observations into two groups based on the 'Type' field: POSITIVE (green line) = observations where someone was doing something safely - good behaviors being recognized. NEGATIVE (red line) = everything else including near misses, unsafe acts, unsafe conditions, and incidents. A healthy safety culture shows the green line trending UP over time (more recognition of safe behaviors) while the red line stays stable or goes DOWN. Hover over any point to see exact numbers." />
        </Card.Title>
      </Card.Header>

      <div className="flex-1 min-h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <defs>
              <linearGradient id="positiveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e2e8f0"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              dy={5}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              width={35}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="positive"
              name="Positive"
              stroke="#22c55e"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#22c55e', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, fill: '#22c55e', stroke: '#fff', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="negative"
              name="Negative"
              stroke="#ef4444"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-3 pt-3 border-t border-surface-100">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-safety-success" aria-hidden="true" />
          <span className="text-xs text-surface-600">
            Positive (Good Practice, Safe Behavior)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-safety-critical" aria-hidden="true" />
          <span className="text-xs text-surface-600">
            Negative (Unsafe Act/Condition, Near Miss)
          </span>
        </div>
      </div>
    </Card>
  )
}

export default React.memo(IncidentTrendChart)
