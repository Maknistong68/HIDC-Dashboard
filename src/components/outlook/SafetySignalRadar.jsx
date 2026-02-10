import React, { useMemo, useCallback, useState, useRef } from 'react'
import { SIGNAL_META } from '../../utils/signalConstants'

/**
 * SafetySignalRadar - Hexagonal radar chart for safety signals
 * Shows 6 risk signals with draggable threshold ring
 *
 * Enhanced with:
 * - onSignalSelect callback for click interactions
 * - selectedSignal prop for highlight state
 * - Larger invisible hit areas (20px radius) for easier clicks
 * - Enhanced hover tooltip with interpretation
 */

// Signal configuration - order matters (clockwise from top)
export const SIGNAL_CONFIG = [
  { key: 'severityMix', label: 'Severity', fullLabel: 'Injury Severity' },
  { key: 'trend', label: 'Trend', fullLabel: 'Trend (60d)' },
  { key: 'openActionRate', label: 'Actions', fullLabel: 'Open Actions' },
  { key: 'highRiskExposure', label: 'Exposure', fullLabel: 'High-Risk Exposure' },
  { key: 'nearMissRate', label: 'Near-Miss', fullLabel: 'Near-Miss Rate' },
  { key: 'positiveRate', label: 'Positive', fullLabel: 'Positive Rate' }
]

// Get angle for axis i (starting at top, clockwise)
const getAngle = (i) => (i * 60 - 90) * (Math.PI / 180)

// Get point coordinates at distance from center
const getPoint = (i, value, cx, cy, radius) => {
  const angle = getAngle(i)
  const r = (value / 100) * radius
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle)
  }
}

// Generate polygon points string
const getPolygonPoints = (values, cx, cy, radius) => {
  return values
    .map((v, i) => {
      const pt = getPoint(i, v, cx, cy, radius)
      return `${pt.x},${pt.y}`
    })
    .join(' ')
}

const SafetySignalRadar = ({
  signals,
  threshold = 60,
  onThresholdChange,
  onSignalSelect,
  selectedSignal = null,
  size = 260
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [hoveredAxis, setHoveredAxis] = useState(null)
  const svgRef = useRef(null)

  // Layout calculations
  const padding = 45 // Space for labels
  const cx = size / 2
  const cy = size / 2
  const radius = (size - padding * 2) / 2

  // Extract signal scores
  const signalValues = useMemo(() => {
    if (!signals) return Array(6).fill(0)
    return SIGNAL_CONFIG.map(({ key }) => {
      const sig = signals[key]
      return sig?.score ?? 0
    })
  }, [signals])

  // Grid levels (25%, 50%, 75%, 100%)
  const gridLevels = [25, 50, 75, 100]

  // Calculate distance from center to determine threshold value
  const calculateThresholdFromPosition = useCallback(
    (clientX, clientY) => {
      if (!svgRef.current) return threshold
      const rect = svgRef.current.getBoundingClientRect()
      const x = clientX - rect.left - cx
      const y = clientY - rect.top - cy
      const distance = Math.sqrt(x * x + y * y)
      const newThreshold = Math.round((distance / radius) * 100)
      return Math.max(0, Math.min(100, newThreshold))
    },
    [cx, cy, radius, threshold]
  )

  // Mouse/touch handlers for threshold drag
  const handleMouseDown = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging || !onThresholdChange) return
      const newThreshold = calculateThresholdFromPosition(e.clientX, e.clientY)
      onThresholdChange(newThreshold)
    },
    [isDragging, onThresholdChange, calculateThresholdFromPosition]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleTouchStart = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleTouchMove = useCallback(
    (e) => {
      if (!isDragging || !onThresholdChange) return
      const touch = e.touches[0]
      const newThreshold = calculateThresholdFromPosition(touch.clientX, touch.clientY)
      onThresholdChange(newThreshold)
    },
    [isDragging, onThresholdChange, calculateThresholdFromPosition]
  )

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Which signals exceed threshold
  const exceedingIndices = useMemo(() => {
    return signalValues
      .map((v, i) => (v > threshold ? i : -1))
      .filter((i) => i !== -1)
  }, [signalValues, threshold])

  // Get selected signal index
  const selectedIndex = useMemo(() => {
    if (!selectedSignal) return -1
    return SIGNAL_CONFIG.findIndex((c) => c.key === selectedSignal)
  }, [selectedSignal])

  // Handle signal click
  const handleSignalClick = useCallback(
    (index) => {
      if (onSignalSelect) {
        onSignalSelect(SIGNAL_CONFIG[index].key)
      }
    },
    [onSignalSelect]
  )

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Grid circles */}
      {gridLevels.map((level) => (
        <polygon
          key={`grid-${level}`}
          points={getPolygonPoints(Array(6).fill(level), cx, cy, radius)}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={1}
        />
      ))}

      {/* Axis lines */}
      {SIGNAL_CONFIG.map((_, i) => {
        const pt = getPoint(i, 100, cx, cy, radius)
        return (
          <line
            key={`axis-${i}`}
            x1={cx}
            y1={cy}
            x2={pt.x}
            y2={pt.y}
            stroke="#cbd5e1"
            strokeWidth={1}
          />
        )
      })}

      {/* Threshold ring (draggable) */}
      <polygon
        points={getPolygonPoints(Array(6).fill(threshold), cx, cy, radius)}
        fill="none"
        stroke="#ef4444"
        strokeWidth={2}
        strokeDasharray="6 4"
        className={`cursor-pointer ${isDragging ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        style={{ transition: isDragging ? 'none' : 'all 0.2s ease' }}
      />

      {/* Data polygon */}
      <polygon
        points={getPolygonPoints(signalValues, cx, cy, radius)}
        fill="rgba(52, 120, 246, 0.25)"
        stroke="#3478f6"
        strokeWidth={2}
        style={{ transition: 'all 0.3s ease' }}
      />

      {/* Data points */}
      {signalValues.map((value, i) => {
        const pt = getPoint(i, value, cx, cy, radius)
        const exceeds = exceedingIndices.includes(i)
        const isHovered = hoveredAxis === i
        const isSelected = selectedIndex === i

        return (
          <g key={`point-${i}`}>
            {/* Invisible larger hit area for easier clicking */}
            <circle
              cx={pt.x}
              cy={pt.y}
              r={20}
              fill="transparent"
              className="cursor-pointer"
              onClick={() => handleSignalClick(i)}
              onMouseEnter={() => setHoveredAxis(i)}
              onMouseLeave={() => setHoveredAxis(null)}
              role="button"
              tabIndex={0}
              aria-label={`${SIGNAL_CONFIG[i].fullLabel}: ${value} out of 100`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleSignalClick(i)
                }
              }}
            />
            {/* Pulse ring for exceeding points */}
            {exceeds && (
              <circle
                cx={pt.x}
                cy={pt.y}
                r={8}
                fill="none"
                stroke="#ef4444"
                strokeWidth={2}
                className="radar-point-pulse"
                opacity={0.6}
              />
            )}
            {/* Selected ring */}
            {isSelected && (
              <circle
                cx={pt.x}
                cy={pt.y}
                r={10}
                fill="none"
                stroke="#1e293b"
                strokeWidth={3}
                opacity={0.8}
              />
            )}
            {/* Main data point */}
            <circle
              cx={pt.x}
              cy={pt.y}
              r={exceeds ? 6 : 5}
              fill={exceeds ? '#ef4444' : '#3478f6'}
              stroke={isSelected ? '#1e293b' : 'white'}
              strokeWidth={isSelected ? 3 : 2}
              className={`cursor-pointer ${isHovered ? 'scale-125' : ''}`}
              style={{
                transition: 'transform 0.15s ease, r 0.15s ease',
                transformOrigin: `${pt.x}px ${pt.y}px`
              }}
              pointerEvents="none"
            />
          </g>
        )
      })}

      {/* Axis labels */}
      {SIGNAL_CONFIG.map((config, i) => {
        const labelDistance = radius + 20
        const pt = getPoint(i, (labelDistance / radius) * 100, cx, cy, radius)

        // Adjust label position based on angle
        let textAnchor = 'middle'
        let dy = 0
        const angle = i * 60

        if (angle === 0 || angle === 180) {
          // Top or bottom
          dy = angle === 0 ? -4 : 12
        } else if (angle < 180) {
          // Right side
          textAnchor = 'start'
          dy = 4
        } else {
          // Left side
          textAnchor = 'end'
          dy = 4
        }

        const exceeds = exceedingIndices.includes(i)
        const isHovered = hoveredAxis === i
        const isSelected = selectedIndex === i

        return (
          <text
            key={`label-${i}`}
            x={pt.x}
            y={pt.y}
            dy={dy}
            textAnchor={textAnchor}
            className={`text-xs font-medium transition-colors duration-150 cursor-pointer ${
              isSelected
                ? 'fill-surface-900 font-bold'
                : exceeds
                  ? 'fill-red-600'
                  : isHovered
                    ? 'fill-blue-600'
                    : 'fill-surface-600'
            }`}
            style={{ fontSize: '11px', textDecoration: isSelected ? 'underline' : 'none' }}
            onMouseEnter={() => setHoveredAxis(i)}
            onMouseLeave={() => setHoveredAxis(null)}
            onClick={() => handleSignalClick(i)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleSignalClick(i)
              }
            }}
          >
            {config.label}
          </text>
        )
      })}

      {/* Score tooltip on hover with interpretation */}
      {hoveredAxis !== null && (() => {
        const config = SIGNAL_CONFIG[hoveredAxis]
        const score = signalValues[hoveredAxis]
        const meta = SIGNAL_META[config.key]
        const interpretation = meta?.interpret?.(score) || ''
        // Truncate interpretation for tooltip
        const shortInterpretation =
          interpretation.length > 30 ? interpretation.slice(0, 27) + '...' : interpretation

        return (
          <g>
            <rect
              x={cx - 70}
              y={cy - 22}
              width={140}
              height={44}
              rx={4}
              fill="#1e293b"
              opacity={0.95}
            />
            <text
              x={cx}
              y={cy - 5}
              textAnchor="middle"
              fill="white"
              style={{ fontSize: '12px', fontWeight: 600 }}
            >
              {config.label}: {score}/100
            </text>
            <text
              x={cx}
              y={cy + 12}
              textAnchor="middle"
              fill="#94a3b8"
              style={{ fontSize: '10px' }}
            >
              {shortInterpretation}
            </text>
          </g>
        )
      })()}
    </svg>
  )
}

export default React.memo(SafetySignalRadar)
