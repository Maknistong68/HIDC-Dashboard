import React, { useState } from 'react'
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react'

/**
 * ForecastChart - Line chart with historical data and forecast with confidence bands
 */
const ForecastChart = ({ data, onPeriodChange }) => {
  const [forecastDays, setForecastDays] = useState(30)

  if (!data || data.error) {
    return (
      <div className="flex items-center justify-center h-64 bg-surface-50 rounded-lg border border-surface-200">
        <div className="text-center text-surface-500">
          <AlertTriangle size={32} className="mx-auto mb-2 text-surface-400" />
          <p className="text-sm">{data?.error || 'Insufficient data for forecasting'}</p>
          <p className="text-xs mt-1">Need at least 7 days of data</p>
        </div>
      </div>
    )
  }

  const { historical, forecast, model, summary } = data

  // Combine historical and forecast for chart
  const chartData = [
    ...historical.map(h => ({ ...h, forecast: null, upper: null, lower: null })),
    ...forecast.map(f => ({ ...f, value: null }))
  ]

  // Add connecting point (last historical = first forecast)
  if (historical.length > 0 && forecast.length > 0) {
    const lastHistorical = historical[historical.length - 1]
    chartData[historical.length - 1] = {
      ...lastHistorical,
      forecast: lastHistorical.value,
      upper: lastHistorical.value,
      lower: lastHistorical.value
    }
  }

  const getTrendIcon = () => {
    if (model?.trend === 'increasing') return <TrendingUp size={16} className="text-safety-critical" />
    if (model?.trend === 'decreasing') return <TrendingDown size={16} className="text-safety-success" />
    return <Minus size={16} className="text-surface-400" />
  }

  const getTrendColor = () => {
    if (model?.trend === 'increasing') return 'text-safety-critical'
    if (model?.trend === 'decreasing') return 'text-safety-success'
    return 'text-surface-600'
  }

  const handlePeriodChange = (days) => {
    setForecastDays(days)
    if (onPeriodChange) onPeriodChange(days)
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null

    const item = payload[0]?.payload
    const isHistorical = item?.type === 'historical'
    const isForecast = item?.type === 'forecast'

    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-surface-200">
        <p className="text-xs font-semibold text-surface-700 mb-1">{label}</p>
        {isHistorical && (
          <p className="text-sm">
            <span className="text-surface-500">Actual:</span>{' '}
            <span className="font-semibold text-primary-600">{item.value}</span>
          </p>
        )}
        {isForecast && (
          <>
            <p className="text-sm">
              <span className="text-surface-500">Forecast:</span>{' '}
              <span className="font-semibold text-amber-600">{item.forecast}</span>
            </p>
            <p className="text-xs text-surface-400">
              95% CI: {item.lower} - {item.upper}
            </p>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with period selector and model info */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-surface-100 rounded-lg p-1">
            {[30, 60, 90].map(days => (
              <button
                key={days}
                onClick={() => handlePeriodChange(days)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  forecastDays === days
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-surface-600 hover:text-surface-800'
                }`}
              >
                {days}d
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-surface-500">Trend:</span>
            <span className={`flex items-center gap-1 font-medium ${getTrendColor()}`}>
              {getTrendIcon()}
              {model?.trend || 'stable'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-surface-500">
          <span>
            R² = {model?.rSquared || 0}{' '}
            <span className="text-surface-400">
              ({summary?.confidence || 'low'} confidence)
            </span>
          </span>
          <span>
            Avg: {summary?.avgHistorical || 0}/day → {summary?.avgForecast || 0}/day
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="dateLabel"
              tick={{ fontSize: 10, fill: '#64748b' }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#64748b' }}
              tickLine={false}
              axisLine={false}
              width={35}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Reference line at transition point */}
            {historical.length > 0 && (
              <ReferenceLine
                x={historical[historical.length - 1].dateLabel}
                stroke="#94a3b8"
                strokeDasharray="5 5"
                label={{
                  value: 'Forecast',
                  position: 'top',
                  fill: '#64748b',
                  fontSize: 10
                }}
              />
            )}

            {/* Average line */}
            <ReferenceLine
              y={summary?.avgHistorical || 0}
              stroke="#94a3b8"
              strokeDasharray="3 3"
            />

            {/* Confidence band (forecast only) */}
            <Area
              type="monotone"
              dataKey="upper"
              stroke="none"
              fill="#f59e0b"
              fillOpacity={0.1}
            />
            <Area
              type="monotone"
              dataKey="lower"
              stroke="none"
              fill="#ffffff"
              fillOpacity={1}
            />

            {/* Historical line */}
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#3b82f6' }}
              connectNulls={false}
            />

            {/* Forecast line */}
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              activeDot={{ r: 4, fill: '#f59e0b' }}
              connectNulls={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-primary-500"></div>
          <span className="text-surface-600">Historical</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-amber-500" style={{ borderStyle: 'dashed' }}></div>
          <span className="text-surface-600">Forecast</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-3 bg-amber-500 opacity-20 rounded-sm"></div>
          <span className="text-surface-600">95% Confidence</span>
        </div>
      </div>
    </div>
  )
}

export default React.memo(ForecastChart)
