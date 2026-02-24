import { useMemo, memo } from 'react'
import Modal from '../common/Modal'
import { AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip
} from 'recharts'

/**
 * RiskExplanationModal - Visual modal explaining why risk is at current level
 * Shows threshold chart and factor contribution diagram
 */
const RiskExplanationModal = ({
  isOpen,
  onClose,
  riskAnalysis,
  factorData,
  predicted,
  average,
  trendAnalysis: _trendAnalysis
}) => {
  const { level: _level, label, changePercent, isAbove } = riskAnalysis || {}

  // Threshold zones data for the chart
  const thresholdZones = useMemo(() => [
    { zone: 'Low', start: -100, end: -30, color: '#22c55e', label: '≤-30%' },
    { zone: 'OK', start: -30, end: -10, color: '#10b981', label: '-30% to -10%' },
    { zone: 'Medium', start: -10, end: 15, color: '#f59e0b', label: '-10% to +15%' },
    { zone: 'High', start: 15, end: 40, color: '#f97316', label: '+15% to +40%' },
    { zone: 'Critical', start: 40, end: 100, color: '#ef4444', label: '>+40%' },
  ], [])

  // Bar chart data - show zones as ranges
  const chartData = useMemo(() => {
    return thresholdZones.map(zone => ({
      name: zone.zone,
      range: zone.end - zone.start,
      start: zone.start,
      end: zone.end,
      color: zone.color,
      label: zone.label
    }))
  }, [thresholdZones])

  // Get current zone info
  const currentZone = useMemo(() => {
    return thresholdZones.find((z, idx) => {
      if (idx === 0) return changePercent <= z.end
      if (idx === thresholdZones.length - 1) return changePercent > z.start
      return changePercent > z.start && changePercent <= z.end
    }) || thresholdZones[2]
  }, [changePercent, thresholdZones])

  // Top factors for the diagram
  const topFactors = useMemo(() => {
    if (!factorData?.byFactor) return []

    return Object.entries(factorData.byFactor)
      .map(([name, data]) => ({
        name,
        count: data.count || 0,
        percentage: data.percentage || 0,
        category: getCategoryForFactor(name)
      }))
      .filter(f => f.count > 0)
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5)
  }, [factorData])

  // Get total factor contribution
  const totalContribution = useMemo(() => {
    return topFactors.reduce((sum, f) => sum + f.percentage, 0)
  }, [topFactors])

  // Category colors for factor diagram
  const categoryColors = {
    'Administrative': '#8b5cf6', // purple
    'Engineering': '#3b82f6',    // blue
    'PPE': '#10b981',            // emerald
    'Environmental': '#f59e0b',  // amber
    'Human': '#ef4444',          // red
    'Other': '#6b7280'           // gray
  }

  function getCategoryForFactor(name) {
    const categories = {
      'Training': 'Administrative',
      'Supervision': 'Administrative',
      'Procedure': 'Administrative',
      'Communication': 'Administrative',
      'Awareness': 'Administrative',
      'Equipment': 'Engineering',
      'Orderliness': 'Engineering',
      'Environment': 'Environmental',
      'PPE': 'PPE',
      'Fatigue': 'Human',
      'Behavior': 'Human'
    }
    return categories[name] || 'Other'
  }

  // Get risk level color
  const getRiskColor = () => {
    switch (label) {
      case 'Low': return '#22c55e'
      case 'OK': return '#10b981'
      case 'Medium': return '#f59e0b'
      case 'High': return '#f97316'
      case 'Critical': return '#ef4444'
      default: return '#6b7280'
    }
  }

  // Calculate position angle for factor nodes (spread around center)
  const getFactorPosition = (index, total) => {
    const startAngle = -90 // Start from top
    const spreadAngle = 180 // Spread across top half
    const angle = startAngle + (spreadAngle / (total + 1)) * (index + 1)
    const radius = 100
    const x = 150 + radius * Math.cos(angle * Math.PI / 180)
    const y = 120 + radius * Math.sin(angle * Math.PI / 180)
    return { x, y, angle }
  }

  // Custom tooltip for threshold chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-surface-200 text-xs">
          <p className="font-semibold" style={{ color: data.color }}>{data.name}</p>
          <p className="text-surface-600">{data.label}</p>
        </div>
      )
    }
    return null
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <AlertTriangle size={20} style={{ color: getRiskColor() }} />
          Why is risk {label}?
        </span>
      }
      size="lg"
    >
      <div className="space-y-6">
        {/* Section 1: Threshold Chart */}
        <div className="bg-surface-50 rounded-xl p-4 border border-surface-200">
          <h3 className="text-sm font-semibold text-surface-700 mb-3">
            Risk Threshold Position
          </h3>

          {/* Current position indicator */}
          <div className="mb-4 flex items-center justify-center">
            <div
              className="px-4 py-2 rounded-full text-white font-bold text-sm flex items-center gap-2"
              style={{ backgroundColor: getRiskColor() }}
            >
              {isAbove ? <TrendingUp size={16} /> : changePercent < 0 ? <TrendingDown size={16} /> : <Minus size={16} />}
              You are here: {changePercent > 0 ? '+' : ''}{changePercent}%
            </div>
          </div>

          {/* Threshold bar visualization */}
          <div className="relative h-20 mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <XAxis
                  type="number"
                  domain={[-100, 100]}
                  tickFormatter={(v) => `${v > 0 ? '+' : ''}${v}%`}
                  tick={{ fontSize: 10 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis type="category" dataKey="name" hide />
                <Tooltip content={<CustomTooltip />} />

                {/* Zone bars */}
                <Bar dataKey="range" stackId="a" barSize={30}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      opacity={entry.zone === label ? 1 : 0.4}
                    />
                  ))}
                </Bar>

                {/* Current position line */}
                <ReferenceLine
                  x={changePercent}
                  stroke="#1e293b"
                  strokeWidth={3}
                  strokeDasharray="none"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Zone labels */}
          <div className="flex justify-between text-2xs px-4">
            {thresholdZones.map((zone) => (
              <div
                key={zone.zone}
                className={`text-center ${zone.zone === label ? 'font-bold' : 'text-surface-400'}`}
                style={{ color: zone.zone === label ? zone.color : undefined }}
              >
                {zone.zone}
              </div>
            ))}
          </div>

          {/* Safe zone indicator */}
          <div className="mt-3 text-center text-xs text-surface-500">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full">
              Safe Zone: Low to Medium (≤+15%)
            </span>
          </div>
        </div>

        {/* Section 2: Factor Connection Diagram */}
        {topFactors.length > 0 && (
          <div className="bg-surface-50 rounded-xl p-4 border border-surface-200">
            <h3 className="text-sm font-semibold text-surface-700 mb-3">
              Factor Contribution Diagram
            </h3>

            {/* SVG Diagram */}
            <div className="flex justify-center">
              <svg viewBox="0 0 300 200" className="w-full max-w-md">
                {/* Connection lines from factors to center */}
                {topFactors.map((factor, idx) => {
                  const pos = getFactorPosition(idx, topFactors.length)
                  const lineWidth = Math.max(1, factor.percentage / 10)
                  return (
                    <line
                      key={`line-${idx}`}
                      x1={pos.x}
                      y1={pos.y}
                      x2={150}
                      y2={120}
                      stroke={categoryColors[factor.category]}
                      strokeWidth={lineWidth}
                      opacity={0.6}
                      className="transition-all duration-300"
                    />
                  )
                })}

                {/* Center node - Risk Level */}
                <g transform="translate(150, 120)">
                  <circle
                    r={35}
                    fill={getRiskColor()}
                    className="drop-shadow-lg"
                  />
                  <text
                    textAnchor="middle"
                    dy="-5"
                    fill="white"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    {label}
                  </text>
                  <text
                    textAnchor="middle"
                    dy="10"
                    fill="white"
                    fontSize="12"
                    fontWeight="bold"
                  >
                    RISK
                  </text>
                </g>

                {/* Factor nodes */}
                {topFactors.map((factor, idx) => {
                  const pos = getFactorPosition(idx, topFactors.length)
                  return (
                    <g key={`factor-${idx}`} transform={`translate(${pos.x}, ${pos.y})`}>
                      {/* Factor circle */}
                      <circle
                        r={25}
                        fill="white"
                        stroke={categoryColors[factor.category]}
                        strokeWidth={2}
                        className="drop-shadow"
                      />
                      {/* Factor name */}
                      <text
                        textAnchor="middle"
                        dy="-5"
                        fill="#374151"
                        fontSize="8"
                        fontWeight="500"
                      >
                        {factor.name.length > 10 ? factor.name.substring(0, 9) + '...' : factor.name}
                      </text>
                      {/* Percentage */}
                      <text
                        textAnchor="middle"
                        dy="8"
                        fill={categoryColors[factor.category]}
                        fontSize="10"
                        fontWeight="bold"
                      >
                        {factor.percentage.toFixed(0)}%
                      </text>
                    </g>
                  )
                })}

                {/* Arrow indicators pointing to center */}
                {topFactors.map((factor, idx) => {
                  const pos = getFactorPosition(idx, topFactors.length)
                  const angle = Math.atan2(120 - pos.y, 150 - pos.x)
                  const arrowX = pos.x + 35 * Math.cos(angle)
                  const arrowY = pos.y + 35 * Math.sin(angle)
                  return (
                    <polygon
                      key={`arrow-${idx}`}
                      points={`0,-4 8,0 0,4`}
                      fill={categoryColors[factor.category]}
                      transform={`translate(${arrowX}, ${arrowY}) rotate(${angle * 180 / Math.PI})`}
                    />
                  )
                })}
              </svg>
            </div>

            {/* Total contribution summary */}
            <div className="mt-4 text-center">
              <p className="text-sm text-surface-600">
                Top factors represent{' '}
                <span className="font-bold" style={{ color: getRiskColor() }}>
                  {totalContribution.toFixed(0)}%
                </span>{' '}
                of recent observations
              </p>
            </div>

            {/* Category legend */}
            <div className="mt-3 flex flex-wrap justify-center gap-3 text-2xs">
              {Object.entries(categoryColors).map(([cat, color]) => {
                const hasFactors = topFactors.some(f => f.category === cat)
                if (!hasFactors) return null
                return (
                  <div key={cat} className="flex items-center gap-1">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-surface-500">{cat}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* No factor data message */}
        {topFactors.length === 0 && (
          <div className="bg-surface-50 rounded-xl p-4 border border-surface-200 text-center text-surface-500">
            <p className="text-sm">Factor contribution data not available.</p>
            <p className="text-xs mt-1">Risk level is based on predicted vs historical average.</p>
          </div>
        )}

        {/* Summary footer */}
        <div className="bg-surface-100 rounded-lg p-3 text-center text-sm text-surface-600">
          <strong>{predicted}</strong> predicted vs <strong>{Math.round(average)}</strong> average = {' '}
          <span className={isAbove ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>
            {changePercent > 0 ? '+' : ''}{changePercent}% {isAbove ? 'above' : 'below'} average
          </span>
          <br />
          <span className="text-xs text-surface-500">
            Threshold for {label}: {currentZone.label}
          </span>
        </div>
      </div>
    </Modal>
  )
}

export default memo(RiskExplanationModal)
