import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react'
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
import { TrendingUp, TrendingDown, Minus, Layers, ZoomIn, ZoomOut, Maximize2, Move } from 'lucide-react'

/**
 * Calculate moving average for an array of data points
 */
const calculateMovingAverage = (data, windowSize = 7, key = 'count') => {
  if (!data || data.length === 0) return []

  return data.map((point, index) => {
    const start = Math.max(0, index - windowSize + 1)
    const window = data.slice(start, index + 1)
    const sum = window.reduce((acc, p) => acc + (p[key] || 0), 0)
    const avg = sum / window.length

    return {
      ...point,
      movingAvg: Math.round(avg * 10) / 10
    }
  })
}

/**
 * Trading-style Tooltip
 */
const TradingTooltip = ({ active, payload, label, activeDays, avgValue }) => {
  if (active && payload && payload.length) {
    const dayData = activeDays.find(d => d.date === label)
    const countValue = payload.find(p => p.dataKey === 'count')?.value || 0
    const maValue = payload.find(p => p.dataKey === 'movingAvg')?.value

    const vsAvg = avgValue > 0 ? ((countValue - avgValue) / avgValue * 100).toFixed(0) : 0
    const isAboveAvg = countValue > avgValue

    return (
      <div className="bg-surface-900 text-white px-4 py-3 rounded-lg shadow-xl border border-surface-700 min-w-[160px] pointer-events-none">
        <div className="text-xs text-surface-400 mb-2 pb-2 border-b border-surface-700">
          {dayData?.label || label}
        </div>

        <div className="flex items-baseline justify-between mb-1">
          <span className="text-xs text-surface-400">Detections</span>
          <span className="text-lg font-bold text-amber-400">{countValue}</span>
        </div>

        {maValue !== null && maValue !== undefined && (
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-xs text-surface-400">7-Day MA</span>
            <span className="text-sm font-semibold text-blue-400">{maValue.toFixed(1)}</span>
          </div>
        )}

        {avgValue > 0 && (
          <div className="flex items-baseline justify-between pt-2 mt-2 border-t border-surface-700">
            <span className="text-xs text-surface-400">vs Avg</span>
            <span className={`text-sm font-semibold ${isAboveAvg ? 'text-red-400' : 'text-green-400'}`}>
              {isAboveAvg ? '+' : ''}{vsAvg}%
            </span>
          </div>
        )}
      </div>
    )
  }
  return null
}

/**
 * Custom Crosshair Cursor
 */
const CustomCursor = ({ points, width, height }) => {
  if (!points || points.length === 0) return null
  const { x, y } = points[0]

  return (
    <g>
      <line
        x1={x}
        y1={0}
        x2={x}
        y2={height}
        stroke="#64748b"
        strokeWidth={1}
        strokeDasharray="4 4"
        opacity={0.6}
      />
      <line
        x1={0}
        y1={y}
        x2={width}
        y2={y}
        stroke="#64748b"
        strokeWidth={1}
        strokeDasharray="4 4"
        opacity={0.6}
      />
    </g>
  )
}

/**
 * FactorTrendChart - Trading-style chart with drag & scroll zoom for factor trends
 */
const FactorTrendChart = ({ data, factorName, timePeriod }) => {
  const [showMovingAvg, setShowMovingAvg] = useState(true)
  const [viewRange, setViewRange] = useState({ start: 0, end: null })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(null)
  const chartRef = useRef(null)

  const totalCount = data?.totalCount || 0
  const trend = data?.trend || 'stable'

  // Filter and calculate moving average
  const allDays = useMemo(() => {
    const days = data?.days || []
    const filtered = days.filter(d => d.count > 0)
    if (showMovingAvg && filtered.length > 0) {
      return calculateMovingAverage(filtered, 7, 'count')
    }
    return filtered
  }, [data?.days, showMovingAvg])

  // Initialize view range when data changes
  useEffect(() => {
    if (allDays.length > 0 && viewRange.end === null) {
      setViewRange({ start: 0, end: allDays.length - 1 })
    }
  }, [allDays.length, viewRange.end])

  // Reset view range when factor changes
  useEffect(() => {
    setViewRange({ start: 0, end: null })
  }, [factorName])

  // Get visible data based on view range
  const visibleDays = useMemo(() => {
    if (allDays.length === 0) return []
    const end = viewRange.end ?? allDays.length - 1
    return allDays.slice(viewRange.start, end + 1)
  }, [allDays, viewRange])

  // Calculate average for reference line
  const avgValue = useMemo(() => {
    if (visibleDays.length === 0) return 0
    const sum = visibleDays.reduce((acc, d) => acc + (d.count || 0), 0)
    return Math.round((sum / visibleDays.length) * 10) / 10
  }, [visibleDays])

  // X-axis ticks
  const xAxisTicks = useMemo(() => {
    if (visibleDays.length <= 10) return visibleDays.map(d => d.date)
    const interval = Math.ceil(visibleDays.length / 8)
    return visibleDays.filter((_, idx) => idx % interval === 0).map(d => d.date)
  }, [visibleDays])

  // Y-axis max
  const yAxisMax = useMemo(() => {
    if (visibleDays.length === 0) return 1
    const maxCount = Math.max(...visibleDays.map(d => d.count || 0), 1)
    return Math.ceil(maxCount * 1.2)
  }, [visibleDays])

  // Zoom function
  const zoom = useCallback((direction, centerRatio = 0.5) => {
    if (allDays.length < 3) return

    const currentStart = viewRange.start
    const currentEnd = viewRange.end ?? allDays.length - 1
    const currentRange = currentEnd - currentStart

    let newRange
    if (direction === 'in') {
      newRange = Math.max(Math.floor(currentRange * 0.7), 5)
    } else {
      newRange = Math.min(Math.floor(currentRange * 1.4), allDays.length - 1)
    }

    const center = currentStart + currentRange * centerRatio
    let newStart = Math.round(center - newRange * centerRatio)
    let newEnd = newStart + newRange

    if (newStart < 0) {
      newStart = 0
      newEnd = Math.min(newRange, allDays.length - 1)
    }
    if (newEnd >= allDays.length) {
      newEnd = allDays.length - 1
      newStart = Math.max(0, newEnd - newRange)
    }

    setViewRange({ start: newStart, end: newEnd })
  }, [allDays.length, viewRange])

  // Pan function
  const pan = useCallback((deltaPoints) => {
    if (allDays.length === 0) return

    const currentStart = viewRange.start
    const currentEnd = viewRange.end ?? allDays.length - 1
    const range = currentEnd - currentStart

    let newStart = currentStart + deltaPoints
    let newEnd = newStart + range

    if (newStart < 0) {
      newStart = 0
      newEnd = range
    }
    if (newEnd >= allDays.length) {
      newEnd = allDays.length - 1
      newStart = newEnd - range
    }

    setViewRange({ start: Math.max(0, newStart), end: Math.min(allDays.length - 1, newEnd) })
  }, [allDays.length, viewRange])

  // Mouse wheel zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault()

    if (chartRef.current) {
      const rect = chartRef.current.getBoundingClientRect()
      const centerRatio = (e.clientX - rect.left) / rect.width

      if (e.deltaY < 0) {
        zoom('in', centerRatio)
      } else {
        zoom('out', centerRatio)
      }
    }
  }, [zoom])

  // Mouse drag to pan
  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return
    setIsDragging(true)
    setDragStart(e.clientX)
    e.preventDefault()
  }, [])

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || dragStart === null || !chartRef.current) return

    const rect = chartRef.current.getBoundingClientRect()
    const chartWidth = rect.width
    const deltaX = dragStart - e.clientX

    const currentRange = (viewRange.end ?? allDays.length - 1) - viewRange.start
    const pointsPerPixel = currentRange / chartWidth
    const deltaPoints = Math.round(deltaX * pointsPerPixel)

    if (Math.abs(deltaPoints) >= 1) {
      pan(deltaPoints)
      setDragStart(e.clientX)
    }
  }, [isDragging, dragStart, viewRange, allDays.length, pan])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setDragStart(null)
  }, [])

  // Global mouse listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('mousemove', handleMouseMove)
      return () => {
        window.removeEventListener('mouseup', handleMouseUp)
        window.removeEventListener('mousemove', handleMouseMove)
      }
    }
  }, [isDragging, handleMouseUp, handleMouseMove])

  // Reset zoom
  const handleResetZoom = () => {
    setViewRange({ start: 0, end: allDays.length - 1 })
  }

  // Tooltip renderer - must be before early return to maintain hooks order
  const renderTooltip = useCallback((props) => (
    <TradingTooltip {...props} activeDays={visibleDays} avgValue={avgValue} />
  ), [visibleDays, avgValue])

  // Early return for no data - AFTER all hooks
  if (!data || !data.hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-80 text-center p-4">
        <div className="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center mb-3">
          <Layers size={24} className="text-surface-400" />
        </div>
        <p className="text-sm text-surface-500">No trend data available</p>
        <p className="text-xs text-surface-400 mt-1">Select a factor to view its trend</p>
      </div>
    )
  }

  const getTrendIcon = () => {
    if (trend === 'increasing') return <TrendingUp size={14} className="text-red-500" />
    if (trend === 'decreasing') return <TrendingDown size={14} className="text-green-500" />
    return <Minus size={14} className="text-surface-400" />
  }

  const getTrendLabel = () => {
    if (trend === 'increasing') return 'Rising'
    if (trend === 'decreasing') return 'Falling'
    return 'Stable'
  }

  const getTrendColor = () => {
    if (trend === 'increasing') return 'text-red-500'
    if (trend === 'decreasing') return 'text-green-500'
    return 'text-surface-500'
  }

  const formatXAxisTick = (dateStr) => {
    const dayData = visibleDays.find(d => d.date === dateStr)
    return dayData?.label || ''
  }

  const getPeriodLabel = () => {
    if (timePeriod === null || timePeriod === undefined) return 'All time'
    if (timePeriod === 0) return 'All time'
    if (timePeriod < 1) {
      const weeks = Math.round(timePeriod * 4)
      if (weeks === 0) return 'All time'
      return `${weeks} week${weeks !== 1 ? 's' : ''}`
    }
    if (timePeriod === 1) return '1 month'
    return `${timePeriod} months`
  }

  const isZoomed = viewRange.start > 0 || (viewRange.end !== null && viewRange.end < allDays.length - 1)

  const visibleRangeText = allDays.length > 0
    ? `${visibleDays[0]?.label || ''} - ${visibleDays[visibleDays.length - 1]?.label || ''}`
    : ''

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div>
          <h3 className="text-base font-semibold text-surface-800">{factorName}</h3>
          <p className="text-xs text-surface-500">
            {isZoomed ? visibleRangeText : `${getPeriodLabel()} trend`}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {/* Stats badges */}
          <div className="flex items-center gap-1.5 bg-surface-100 rounded-full px-2 py-1">
            <span className="text-surface-500">Total</span>
            <span className="font-bold text-amber-600">{totalCount || 0}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-surface-100 rounded-full px-2 py-1">
            <span className="text-surface-500">Avg</span>
            <span className="font-bold text-surface-700">{avgValue}</span>
          </div>
          <div className={`flex items-center gap-1 bg-surface-100 rounded-full px-2 py-1 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="font-medium">{getTrendLabel()}</span>
          </div>

          {/* MA Toggle */}
          <label className="flex items-center gap-1 cursor-pointer select-none bg-blue-50 rounded-full px-2 py-1">
            <input
              type="checkbox"
              checked={showMovingAvg}
              onChange={(e) => setShowMovingAvg(e.target.checked)}
              className="w-3 h-3 rounded border-blue-300 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
            />
            <span className="text-blue-700 font-medium">MA</span>
          </label>

          {/* Zoom controls */}
          <div className="flex items-center gap-0.5 bg-surface-100 rounded-full p-0.5">
            <button
              onClick={() => zoom('in')}
              className="p-1.5 hover:bg-surface-200 rounded-full transition-colors"
              title="Zoom In (or scroll up)"
            >
              <ZoomIn size={14} className="text-surface-600" />
            </button>
            <button
              onClick={() => zoom('out')}
              className="p-1.5 hover:bg-surface-200 rounded-full transition-colors"
              title="Zoom Out (or scroll down)"
            >
              <ZoomOut size={14} className="text-surface-600" />
            </button>
            <button
              onClick={handleResetZoom}
              className={`p-1.5 rounded-full transition-colors ${isZoomed ? 'hover:bg-primary-100 text-primary-600' : 'hover:bg-surface-200 text-surface-400'}`}
              title="Reset Zoom"
            >
              <Maximize2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Trading-style chart */}
      <div
        ref={chartRef}
        className={`flex-1 min-h-[200px] bg-surface-50 rounded-lg p-2 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        style={{ touchAction: 'none' }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={visibleDays} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
            {/* Gradient definitions */}
            <defs>
              <linearGradient id="factorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
                <stop offset="50%" stopColor="#f59e0b" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            {/* Grid */}
            <CartesianGrid
              strokeDasharray="1 3"
              stroke="#cbd5e1"
              opacity={0.5}
              vertical={false}
            />

            {/* Axes */}
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              ticks={xAxisTicks}
              tickFormatter={formatXAxisTick}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[0, yAxisMax]}
              tick={{ fontSize: 10, fill: '#64748b' }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              width={35}
            />

            {/* Tooltip with crosshair */}
            <Tooltip
              content={renderTooltip}
              cursor={<CustomCursor />}
            />

            {/* Average reference line */}
            <ReferenceLine
              y={avgValue}
              stroke="#94a3b8"
              strokeDasharray="6 4"
              strokeWidth={1.5}
              label={{
                value: `Avg: ${avgValue}`,
                position: 'right',
                fill: '#64748b',
                fontSize: 10
              }}
            />

            {/* Area fill for detections */}
            <Area
              type="monotone"
              dataKey="count"
              stroke="#f59e0b"
              strokeWidth={2}
              fill="url(#factorGradient)"
              dot={false}
              activeDot={{
                r: 6,
                fill: '#f59e0b',
                stroke: '#fff',
                strokeWidth: 2
              }}
            />

            {/* Moving Average line */}
            {showMovingAvg && (
              <Line
                type="monotone"
                dataKey="movingAvg"
                name="7-day MA"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={false}
                activeDot={{
                  r: 5,
                  fill: '#3b82f6',
                  stroke: '#fff',
                  strokeWidth: 2
                }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Footer with legend */}
      <div className="flex items-center justify-between mt-2 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-amber-500 opacity-60" />
            <span className="text-surface-600">Daily</span>
          </div>
          {showMovingAvg && (
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0.5 bg-blue-500 rounded" />
              <span className="text-surface-600">7-Day MA</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0 border-t-2 border-dashed border-surface-400" />
            <span className="text-surface-600">Avg</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-surface-400">
          <Move size={12} />
          <span>Drag to pan</span>
          <span className="text-surface-300">|</span>
          <span>Scroll to zoom</span>
        </div>
      </div>

      {visibleDays.length === 0 && (
        <p className="text-xs text-surface-400 text-center mt-2">No detections in this period</p>
      )}
    </div>
  )
}

export default React.memo(FactorTrendChart)
