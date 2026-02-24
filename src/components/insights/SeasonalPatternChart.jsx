import React, { useState, useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from 'recharts'
import { Calendar, Clock, Sun, TrendingUp, AlertTriangle, Info } from 'lucide-react'

/**
 * SeasonalPatternChart - Visualizes day-of-week, hour-of-day, and month patterns
 *
 * ## How Chart Data Works:
 *
 * Data flows from incidents -> detectSeasonalPatterns() -> this component
 *
 * 1. **Day of Week Pattern**:
 *    - Input: Array of incidents with `date` field
 *    - Processing: Groups by day index (0=Sun to 6=Sat), calculates risk index
 *    - Output: { patterns: [{day, count, riskIndex, riskLevel}], insights, peakDay }
 *
 * 2. **Hour of Day Pattern**:
 *    - Input: Incidents with `eventTime` or ISO datetime in `date`
 *    - Processing: Groups by hour (0-23), calculates shift distributions
 *    - Output: { patterns: [{hour, count, riskIndex, shift}], shifts, peakHours }
 *
 * 3. **Month Pattern**:
 *    - Input: Incidents with `date` field
 *    - Processing: Groups by month (0-11), analyzes seasonal trends
 *    - Output: { patterns: [{month, count, riskIndex, season}], seasonPatterns }
 *
 * Risk Index Calculation:
 *   riskIndex = (actual count / expected count) * 100
 *   - 100 = average
 *   - >130 = high risk
 *   - <70 = low risk
 */
const SeasonalPatternChart = ({ data, title = 'Seasonal Patterns' }) => {
  const [activeView, setActiveView] = useState('dayOfWeek')

  const { dayOfWeek, hourOfDay, monthOfYear, riskFactors, summary } = data || {}

  // Prepare chart data based on active view
  const chartData = useMemo(() => {
    if (!data?.hasData) return []
    switch (activeView) {
      case 'dayOfWeek':
        return dayOfWeek?.patterns?.map(p => ({
          name: p.shortName,
          fullName: p.day,
          value: p.count,
          riskIndex: p.riskIndex,
          riskLevel: p.riskLevel,
          isWeekend: p.isWeekend
        })) || []

      case 'hourOfDay':
        return hourOfDay?.patterns?.map(p => ({
          name: p.hour12.replace(' ', ''),
          fullName: p.hourLabel,
          value: p.count,
          riskIndex: p.riskIndex,
          riskLevel: p.riskLevel,
          shift: p.shift
        })) || []

      case 'monthOfYear':
        return monthOfYear?.patterns?.map(p => ({
          name: p.month,
          fullName: p.fullName,
          value: p.count,
          riskIndex: p.riskIndex,
          riskLevel: p.riskLevel,
          season: p.season
        })) || []

      default:
        return []
    }
  }, [activeView, data?.hasData, dayOfWeek, hourOfDay, monthOfYear])

  const avgValue = useMemo(() => {
    if (chartData.length === 0) return 0
    return chartData.reduce((sum, d) => sum + d.value, 0) / chartData.length
  }, [chartData])

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null
    const item = payload[0].payload

    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-surface-200">
        <p className="font-semibold text-surface-800">{item.fullName}</p>
        <div className="mt-2 space-y-1">
          <p className="text-sm">
            <span className="text-surface-500">Incidents: </span>
            <span className="font-semibold text-surface-800">{item.value}</span>
          </p>
          <p className="text-sm">
            <span className="text-surface-500">Risk Index: </span>
            <span className={`font-semibold ${item.riskIndex > 120 ? 'text-red-600' : item.riskIndex < 80 ? 'text-green-600' : 'text-surface-800'}`}>
              {item.riskIndex}%
            </span>
          </p>
          <p className="text-xs mt-1">
            <span className={`px-1.5 py-0.5 rounded ${getRiskBgColor(item.riskLevel)}`}>
              {item.riskLevel.charAt(0).toUpperCase() + item.riskLevel.slice(1)} Risk
            </span>
          </p>
        </div>
      </div>
    )
  }

  // Get current view insights
  const currentInsights = useMemo(() => {
    switch (activeView) {
      case 'dayOfWeek': return dayOfWeek?.insights || []
      case 'hourOfDay': return hourOfDay?.insights || []
      case 'monthOfYear': return monthOfYear?.insights || []
      default: return []
    }
  }, [activeView, dayOfWeek, hourOfDay, monthOfYear])

  if (!data || !data.hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-surface-50 rounded-lg border border-surface-200">
        <AlertTriangle size={32} className="text-surface-400 mb-2" />
        <p className="text-sm text-surface-500">{data?.error || 'Insufficient data for seasonal analysis'}</p>
        <p className="text-xs text-surface-400 mt-1">Need at least 30 incidents</p>
      </div>
    )
  }

  const views = [
    { key: 'dayOfWeek', label: 'Day', icon: Calendar, hasData: dayOfWeek?.hasData },
    { key: 'hourOfDay', label: 'Hour', icon: Clock, hasData: hourOfDay?.hasData },
    { key: 'monthOfYear', label: 'Month', icon: Sun, hasData: monthOfYear?.hasData }
  ]

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'high': return '#dc2626'
      case 'elevated': return '#f59e0b'
      case 'low': return '#22c55e'
      default: return '#3b82f6'
    }
  }

  const getRiskBgColor = (riskLevel) => {
    switch (riskLevel) {
      case 'high': return 'bg-red-100 text-red-700'
      case 'elevated': return 'bg-amber-100 text-amber-700'
      case 'low': return 'bg-green-100 text-green-700'
      default: return 'bg-blue-100 text-blue-700'
    }
  }

  return (
    <div className="space-y-4">
      {/* Header with view selector */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp size={18} className="text-primary-600" />
          <h3 className="font-semibold text-surface-800">{title}</h3>
        </div>

        {/* View tabs */}
        <div className="flex items-center gap-1 bg-surface-100 rounded-lg p-1">
          {views.map(view => (
            <button
              key={view.key}
              onClick={() => view.hasData && setActiveView(view.key)}
              disabled={!view.hasData}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all
                ${activeView === view.key
                  ? 'bg-white text-primary-600 shadow-sm'
                  : view.hasData
                    ? 'text-surface-600 hover:text-surface-800'
                    : 'text-surface-400 cursor-not-allowed'
                }
              `}
            >
              <view.icon size={14} />
              {view.label}
            </button>
          ))}
        </div>
      </div>

      {/* Current risk indicator */}
      {riskFactors?.current && (
        <div className={`flex items-center gap-3 p-3 rounded-lg ${getRiskBgColor(riskFactors.current.riskLevel)}`}>
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} />
            <span className="text-sm font-medium">Current Risk Level:</span>
            <span className="font-bold">{riskFactors.current.combinedRisk}%</span>
          </div>
          <span className="text-xs opacity-80">
            (Day: {riskFactors.current.dayRisk}% | Hour: {riskFactors.current.hourRisk}% | Month: {riskFactors.current.monthRisk}%)
          </span>
        </div>
      )}

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: '#64748b' }}
              tickLine={false}
              interval={activeView === 'hourOfDay' ? 2 : 0}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#64748b' }}
              tickLine={false}
              axisLine={false}
              width={35}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={avgValue}
              stroke="#94a3b8"
              strokeDasharray="3 3"
              label={{ value: 'Avg', position: 'right', fill: '#64748b', fontSize: 10 }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={getRiskColor(entry.riskLevel)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Insights */}
      {currentInsights.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-surface-600">
            <Info size={12} />
            Key Insights
          </div>
          <div className="flex flex-wrap gap-2">
            {currentInsights.slice(0, 3).map((insight) => (
              <div
                key={insight.message}
                className="px-3 py-1.5 bg-surface-50 border border-surface-200 rounded-lg text-xs text-surface-700"
              >
                {insight.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary points */}
      {summary && summary.length > 0 && (
        <div className="text-xs text-surface-500 border-t border-surface-100 pt-3 space-y-1">
          {/* key={index} acceptable: summary is a static string array with no reordering */}
          {summary.map((point, index) => (
            <p key={index}>• {point}</p>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-surface-500 pt-2 border-t border-surface-100">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-500" />
          <span>High Risk (&gt;130%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-amber-500" />
          <span>Elevated (115-130%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-blue-500" />
          <span>Normal (70-115%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span>Low (&lt;70%)</span>
        </div>
      </div>
    </div>
  )
}

export default React.memo(SeasonalPatternChart)
