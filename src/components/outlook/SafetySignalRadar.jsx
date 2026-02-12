import React, { useMemo, useCallback, useState } from 'react'
import { SIGNAL_META, DEFAULT_THRESHOLDS } from '../../utils/signalConstants'

/**
 * SafetySignalRadar - Pentagon radar chart for safety signals
 * Shows 5 risk signals with individual threshold markers per axis
 *
 * Enhanced with:
 * - onSignalSelect callback for click interactions
 * - selectedSignal prop for highlight state
 * - Larger invisible hit areas (20px radius) for easier clicks
 * - Enhanced hover tooltip with interpretation
 * - Individual thresholds per signal (thresholds object prop)
 */

// Signal configuration - order matters (clockwise from top) - 5 signals (trend removed)
export const SIGNAL_CONFIG = [
  { key: 'severityMix', label: 'Severity', fullLabel: 'Injury Severity' },
  { key: 'openActionRate', label: 'Actions', fullLabel: 'Open Actions' },
  { key: 'highRiskExposure', label: 'Exposure', fullLabel: 'High-Risk Exposure' },
  { key: 'nearMissRate', label: 'Near-Miss', fullLabel: 'Near-Miss Rate' },
  { key: 'positiveRate', label: 'Positive', fullLabel: 'Positive Rate' }
]

// Get angle for axis i (starting at top, clockwise) - 72° per axis (360/5)
const getAngle = (i) => (i * 72 - 90) * (Math.PI / 180)

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
  thresholds = DEFAULT_THRESHOLDS,
  onSignalSelect,
  selectedSignal = null,
  size = 260
}) => {
  const [hoveredAxis, setHoveredAxis] = useState(null)

  // Layout calculations
  const padding = 55 // Space for labels (increased from 45 for label room)
  const cx = size / 2
  const cy = size / 2
  const radius = (size - padding * 2) / 2

  // Extract signal scores
  const signalValues = useMemo(() => {
    if (!signals) return Array(5).fill(0)
    return SIGNAL_CONFIG.map(({ key }) => {
      const sig = signals[key]
      return sig?.score ?? 0
    })
  }, [signals])

  // Extract threshold values per signal
  const thresholdValues = useMemo(() => {
    return SIGNAL_CONFIG.map(({ key }) => thresholds[key] ?? 60)
  }, [thresholds])

  // Grid levels (25%, 50%, 75%, 100%)
  const gridLevels = [25, 50, 75, 100]

  // Which signals exceed their individual threshold
  const exceedingIndices = useMemo(() => {
    return signalValues
      .map((v, i) => (v > thresholdValues[i] ? i : -1))
      .filter((i) => i !== -1)
  }, [signalValues, thresholdValues])

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
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="select-none"
    >
      {/* Grid circles */}
      {gridLevels.map((level) => (
        <polygon
          key={`grid-${level}`}
          points={getPolygonPoints(Array(5).fill(level), cx, cy, radius)}
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

      {/* Individual threshold polygon (irregular - each axis has its own threshold) */}
      <polygon
        points={getPolygonPoints(thresholdValues, cx, cy, radius)}
        fill="none"
        stroke="#ef4444"
        strokeWidth={2}
        strokeDasharray="6 4"
        className="opacity-70"
        style={{ transition: 'all 0.2s ease' }}
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

        // Adjust label position based on angle (72° per axis for pentagon)
        let textAnchor = 'middle'
        let dy = 0
        const angle = i * 72

        if (angle === 0) {
          // Top
          dy = -4
        } else if (angle < 180) {
          // Right side (72°, 144°)
          textAnchor = 'start'
          dy = 4
        } else if (angle === 180) {
          // Bottom (not reached with 5 points at 72° each)
          dy = 12
        } else {
          // Left side (216°, 288°)
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
