import { useMemo, memo } from 'react'
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer
} from 'recharts'
import { TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react'

/**
 * Calculate 7-day moving average for the data
 */
const calculateMovingAverage = (data, windowSize = 7) => {
  if (!data || data.length === 0) return []

  return data.map((point, index) => {
    const start = Math.max(0, index - windowSize + 1)
    const window = data.slice(start, index + 1)
    const sum = window.reduce((acc, p) => acc + (p.count || 0), 0)
    const avg = sum / window.length

    return {
      ...point,
      movingAvg: Math.round(avg * 10) / 10
    }
  })
}

/**
 * Custom Tooltip for the chart
 */
const ChartTooltip = ({ active, payload, label, isPrediction: _isPrediction }) => {
  if (!active || !payload || !payload.length) return null

  const data = payload[0]?.payload
  const isProjected = data?.isProjected

  return (
    <div className={`px-3 py-2 rounded-lg shadow-lg border text-xs ${
      isProjected
        ? 'bg-amber-50 border-amber-200'
        : 'bg-white border-surface-200'
    }`}>
      <div className={`font-medium mb-1 ${isProjected ? 'text-amber-700' : 'text-surface-700'}`}>
        {data?.label || label}
        {isProjected && <span className="ml-1 text-amber-500">(Projected)</span>}
      </div>
      {payload.map((entry, idx) => {
        if (entry.dataKey === 'confidenceUpper' || entry.dataKey === 'confidenceLower') return null
        return (
          <div key={idx} className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-surface-600">{entry.name}:</span>
            <span className="font-semibold text-surface-800">
              {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
            </span>
          </div>
        )
      })}
      {data?.confidenceUpper !== undefined && data?.confidenceLower !== undefined && (
        <div className="text-surface-500 mt-1 pt-1 border-t border-surface-100">
          Range: {data.confidenceLower} - {data.confidenceUpper}
        </div>
      )}
    </div>
  )
}

/**
 * PredictionTrendChart - Mini trend chart with prediction extension
 * Shows historical data flowing into a projected future with confidence interval
 */
const PredictionTrendChart = ({
  historicalData = [],
  prediction,
  range,
  trend = 'stable',
  hazardName,
  avgPerDay: _avgPerDay,
  compact = false
}) => {
  // Process historical data with moving average
  const processedData = useMemo(() => {
    if (!historicalData || historicalData.length === 0) return []

    // Filter to non-zero days and add moving average
    const withMA = calculateMovingAverage(historicalData)

    // Take last 30 days of data for display
    const recentData = withMA.slice(-30).map(d => ({
      ...d,
      isProjected: false
    }))

    // Add prediction extension points (7 days)
    if (prediction !== undefined && prediction !== null && recentData.length > 0) {
      const lastDate = new Date(recentData[recentData.length - 1].date)
      const dailyPrediction = prediction / 7

      // Calculate confidence interval spread per day
      const rangeSpread = range ? (range.max - range.min) / 2 / 7 : dailyPrediction * 0.15

      for (let i = 1; i <= 7; i++) {
        const futureDate = new Date(lastDate)
        futureDate.setDate(futureDate.getDate() + i)

        const dateStr = futureDate.toISOString().split('T')[0]
        const label = futureDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

        // Gradually widen confidence interval
        const spreadMultiplier = 1 + (i - 1) * 0.1

        recentData.push({
          date: dateStr,
          label,
          count: null, // No actual count for future
          movingAvg: Math.round(dailyPrediction * 10) / 10,
          predictedValue: Math.round(dailyPrediction * 10) / 10,
          confidenceUpper: Math.round((dailyPrediction + rangeSpread * spreadMultiplier) * 10) / 10,
          confidenceLower: Math.max(0, Math.round((dailyPrediction - rangeSpread * spreadMultiplier) * 10) / 10),
          isProjected: true
        })
      }
    }

    return recentData
  }, [historicalData, prediction, range])

  // Calculate stats
  const stats = useMemo(() => {
    const historical = processedData.filter(d => !d.isProjected && d.count > 0)
    if (historical.length === 0) return { avg: 0, max: 0 }

    const total = historical.reduce((sum, d) => sum + d.count, 0)
    const avg = total / historical.length
    const max = Math.max(...historical.map(d => d.count))

    return {
      avg: Math.round(avg * 10) / 10,
      max,
      weeklyAvg: Math.round(avg * 7)
    }
  }, [processedData])

  // Y-axis domain
  const yDomain = useMemo(() => {
    if (processedData.length === 0) return [0, 10]

    const values = processedData.flatMap(d => [
      d.count || 0,
      d.movingAvg || 0,
      d.confidenceUpper || 0
    ]).filter(v => v > 0)

    if (values.length === 0) return [0, 10]

    const max = Math.max(...values)
    return [0, Math.ceil(max * 1.2)]
  }, [processedData])

  // X-axis ticks
  const xTicks = useMemo(() => {
    if (processedData.length <= 8) return processedData.map(d => d.date)
    const interval = Math.ceil(processedData.length / 6)
    return processedData.filter((_, idx) => idx % interval === 0 || idx === processedData.length - 1).map(d => d.date)
  }, [processedData])

  // Find the transition point (last historical date)
  const transitionIndex = useMemo(() => {
    return processedData.findIndex(d => d.isProjected) - 1
  }, [processedData])

  const getTrendIcon = () => {
    if (trend === 'increasing') return <TrendingUp size={14} className="text-red-500" />
    if (trend === 'decreasing') return <TrendingDown size={14} className="text-green-500" />
    return <Minus size={14} className="text-surface-400" />
  }

  const getTrendColor = () => {
    if (trend === 'increasing') return 'text-red-500'
    if (trend === 'decreasing') return 'text-green-500'
    return 'text-surface-500'
  }

  const getTrendLabel = () => {
    if (trend === 'increasing') return 'Rising'
    if (trend === 'decreasing') return 'Falling'
    return 'Stable'
  }

  if (!processedData.length) {
    return (
      <div className="flex items-center justify-center h-32 text-surface-400 text-sm">
        No trend data available
      </div>
    )
  }

  const chartHeight = compact ? 120 : 160

  return (
    <div className="space-y-2">
      {/* Header */}
      {!compact && hazardName && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-surface-400" />
            <span className="text-xs font-medium text-surface-600">
              {hazardName} - 30 Day Trend + 7 Day Forecast
            </span>
          </div>
          <div className={`flex items-center gap-1 text-xs ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="font-medium">{getTrendLabel()}</span>
          </div>
        </div>
      )}

      {/* Chart */}
      <div style={{ height: chartHeight }} className="bg-surface-50 rounded-lg p-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={processedData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              {/* Gradient for historical area */}
              <linearGradient id="historicalGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.05} />
              </linearGradient>
              {/* Gradient for confidence interval */}
              <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="2 4" stroke="#e2e8f0" vertical={false} />

            <XAxis
              dataKey="date"
              tick={{ fontSize: 9, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              ticks={xTicks}
              tickFormatter={(dateStr) => {
                const d = processedData.find(p => p.date === dateStr)
                return d?.label || ''
              }}
            />

            <YAxis
              domain={yDomain}
              tick={{ fontSize: 9, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              width={25}
              allowDecimals={false}
            />

            <Tooltip content={<ChartTooltip />} />

            {/* Average reference line */}
            <ReferenceLine
              y={stats.avg}
              stroke="#94a3b8"
              strokeDasharray="4 4"
              strokeWidth={1}
            />

            {/* Today reference line */}
            {transitionIndex >= 0 && processedData[transitionIndex] && (
              <ReferenceLine
                x={processedData[transitionIndex].date}
                stroke="#6366f1"
                strokeWidth={2}
                strokeDasharray="4 4"
                label={{
                  value: 'Today',
                  position: 'top',
                  fill: '#6366f1',
                  fontSize: 9,
                  fontWeight: 600
                }}
              />
            )}

            {/* Confidence interval area (only for projected) */}
            <Area
              type="monotone"
              dataKey="confidenceUpper"
              stroke="transparent"
              fill="url(#confidenceGradient)"
              fillOpacity={1}
              connectNulls={false}
            />
            <Area
              type="monotone"
              dataKey="confidenceLower"
              stroke="transparent"
              fill="#ffffff"
              fillOpacity={1}
              connectNulls={false}
            />

            {/* Historical area */}
            <Area
              type="monotone"
              dataKey="count"
              stroke="#6366f1"
              strokeWidth={1.5}
              fill="url(#historicalGradient)"
              dot={false}
              activeDot={{ r: 4, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
              connectNulls={false}
            />

            {/* Moving average / Prediction line */}
            <Line
              type="monotone"
              dataKey="movingAvg"
              name="7-Day MA"
              stroke="#6366f1"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
              connectNulls
            />

            {/* Predicted value line (dashed) */}
            <Line
              type="monotone"
              dataKey="predictedValue"
              name="Predicted"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="5 3"
              dot={false}
              activeDot={{ r: 4, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }}
              connectNulls={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-xs px-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-primary-500 rounded" />
            <span className="text-surface-500">Historical</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-amber-500 rounded" style={{ borderStyle: 'dashed' }} />
            <span className="text-surface-500">Predicted</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-2 bg-amber-500 opacity-20 rounded" />
            <span className="text-surface-500">Confidence</span>
          </div>
        </div>
        <div className="text-surface-400">
          Avg: <span className="font-medium text-surface-600">{stats.avg}/day</span>
        </div>
      </div>
    </div>
  )
}

export default memo(PredictionTrendChart)
