import React, { useMemo, useState, useEffect } from 'react'
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
import { getIncidentsByMonth, getIncidentsByWeek, getIncidentsByQuarter, getIncidentDataRange } from '../../utils/calculations'
import TimePeriodToggle from '../common/TimePeriodToggle'

const GRANULARITY_OPTIONS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
]

/**
 * IncidentTrendChart - Positive vs Negative observation trend
 * Toggle controls data granularity (Weekly/Monthly/Quarterly), not time range.
 * Auto-detects the best granularity based on data span.
 */
const IncidentTrendChart = ({ data, incidents }) => {
  // Auto-detect default granularity from data range
  const defaultGranularity = useMemo(() => {
    if (!incidents || incidents.length === 0) return 'monthly'
    const { spanMonths } = getIncidentDataRange(incidents)
    if (spanMonths <= 3) return 'weekly'
    if (spanMonths <= 12) return 'monthly'
    return 'quarterly'
  }, [incidents])

  const [granularity, setGranularity] = useState(null) // null = use auto-detected default

  // Reset to auto-detect when data changes (e.g. filter change)
  useEffect(() => {
    setGranularity(null)
  }, [defaultGranularity])

  const effectiveGranularity = granularity || defaultGranularity

  // Compute trend data using the selected granularity — always shows ALL data
  const trendData = useMemo(() => {
    if (incidents) {
      switch (effectiveGranularity) {
        case 'weekly':
          return getIncidentsByWeek(incidents)
        case 'quarterly':
          return getIncidentsByQuarter(incidents)
        case 'monthly':
        default:
          return getIncidentsByMonth(incidents)
      }
    }
    return data || []
  }, [incidents, effectiveGranularity, data])

  // Trim leading and trailing periods where both positive AND negative are 0.
  // Interior zeros are preserved — they represent meaningful dips in the data.
  const trimmedData = useMemo(() => {
    if (!trendData || trendData.length === 0) return []

    let startIdx = 0
    while (startIdx < trendData.length && trendData[startIdx].positive === 0 && trendData[startIdx].negative === 0) {
      startIdx++
    }

    let endIdx = trendData.length - 1
    while (endIdx >= 0 && trendData[endIdx].positive === 0 && trendData[endIdx].negative === 0) {
      endIdx--
    }

    // All data is zero — return full array so chart isn't empty
    if (startIdx > endIdx) return trendData

    return trendData.slice(startIdx, endIdx + 1)
  }, [trendData])

  // Dynamic Y-axis max: highest value across both series + 20% padding
  const yAxisMax = useMemo(() => {
    if (trimmedData.length === 0) return 1

    const maxValue = Math.max(
      ...trimmedData.map(d => d.positive || 0),
      ...trimmedData.map(d => d.negative || 0),
      1
    )
    return Math.ceil(maxValue * 1.2)
  }, [trimmedData])

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

  // Responsive XAxis: rotate labels when there are many data points (weekly view)
  const isDense = trimmedData.length > 15

  return (
    <Card padding="default" className="h-full flex flex-col">
      <Card.Header action={incidents ? (
        <TimePeriodToggle
          period={effectiveGranularity}
          onPeriodChange={setGranularity}
          periods={GRANULARITY_OPTIONS}
        />
      ) : undefined}>
        <Card.Title>
          Positive vs. Negative Observation Trend
          <InfoTooltip text="HOW THIS CHART IS CREATED: We look at the 'Date' field of each observation and group them by the selected time period (Weekly, Monthly, or Quarterly). Use the toggle to change granularity — it auto-selects the best view based on your data range. POSITIVE (green line) = observations where someone was doing something safely. NEGATIVE (red line) = everything else including near misses, unsafe acts, unsafe conditions, and incidents. A healthy safety culture shows the green line trending UP over time while the red line stays stable or goes DOWN. Hover over any point to see exact numbers." />
        </Card.Title>
      </Card.Header>

      <div className="flex-1 min-h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={trimmedData}
            margin={{ top: 5, right: 20, left: 0, bottom: isDense ? 20 : 5 }}
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
              dataKey="label"
              tick={{ fontSize: isDense ? 10 : 11, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              dy={5}
              interval={isDense ? 1 : 0}
              angle={isDense ? -45 : 0}
              textAnchor={isDense ? 'end' : 'middle'}
            />
            <YAxis
              domain={[0, yAxisMax]}
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
              dot={{ r: isDense ? 3 : 4, fill: '#22c55e', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, fill: '#22c55e', stroke: '#fff', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="negative"
              name="Negative"
              stroke="#ef4444"
              strokeWidth={2.5}
              dot={{ r: isDense ? 3 : 4, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }}
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
