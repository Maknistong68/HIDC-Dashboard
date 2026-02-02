import React, { useState, useMemo } from 'react'
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus, HelpCircle, Target } from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts'

/**
 * IncidentPredictionPanel - Clean, collapsible prediction panel
 * Displays: Weekly/Monthly forecasts, Type Probability donut, Risk Assessment bars
 * Designed to be easy to absorb and data-accurate
 */
const IncidentPredictionPanel = ({ incidentPrediction, filteredIncidents }) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showMethodology, setShowMethodology] = useState(false)

  const { weekly, monthly, typeProbability, typeRisk } = incidentPrediction

  // Don't render if no meaningful data
  if (!weekly && !monthly && !typeProbability?.hasData) {
    return null
  }

  return (
    <div className="bg-white border border-surface-200 rounded-lg overflow-hidden shadow-soft">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Target size={18} className="text-primary-600" />
          <h3 className="text-sm font-semibold text-surface-800">Incident Prediction</h3>
        </div>
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronUp size={18} className="text-surface-500" />
          ) : (
            <ChevronDown size={18} className="text-surface-500" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-surface-200">
          {/* Weekly & Monthly Predictions - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-surface-200">
            {/* Next Week */}
            <PredictionCard
              label="NEXT WEEK"
              predicted={weekly?.predicted}
              range={weekly?.range}
              trend={weekly?.trend}
              confidence={weekly?.confidence}
              changePercent={weekly?.changePercent}
            />
            {/* Next Month */}
            <PredictionCard
              label="NEXT MONTH"
              predicted={monthly?.predicted}
              range={monthly?.range}
              trend={monthly?.trend}
              confidence={monthly?.confidence}
              changePercent={monthly?.changePercent}
            />
          </div>

          {/* Type Probability & Risk Assessment - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-surface-200 border-t border-surface-200">
            {/* Type Probability Donut */}
            {typeProbability?.hasData && (
              <TypeProbabilitySection data={typeProbability} />
            )}
            {/* Risk Assessment */}
            {typeRisk?.hasData && (
              <RiskAssessmentSection data={typeRisk} />
            )}
          </div>

          {/* Methodology Disclosure */}
          <div className="border-t border-surface-200">
            <button
              onClick={() => setShowMethodology(!showMethodology)}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-xs text-surface-500 hover:bg-surface-50 transition-colors"
            >
              <HelpCircle size={14} />
              <span>How are predictions calculated?</span>
              {showMethodology ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showMethodology && (
              <div className="px-4 pb-4 text-xs text-surface-600 space-y-2">
                <p>
                  <strong>Count Forecast:</strong> Linear regression analysis of your historical incident data
                  with 95% confidence intervals. Recent data is weighted more heavily.
                </p>
                <p>
                  <strong>Type Probability:</strong> Exponential weighted moving average analyzing the last
                  6 months of incident type distribution.
                </p>
                <p>
                  <strong>Risk Score:</strong> Calculated as Probability × Severity × Trend Multiplier.
                  Higher scores indicate areas needing attention.
                </p>
                <p className="text-surface-400 italic pt-1">
                  Based on {filteredIncidents?.length || 0} observations in the selected period.
                  Predictions are statistical estimates and may vary from actual outcomes.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * PredictionCard - Individual prediction display (Week/Month)
 */
const PredictionCard = ({ label, predicted, range, trend, confidence, changePercent }) => {
  if (predicted === undefined || predicted === null) {
    return (
      <div className="p-4 flex items-center justify-center">
        <span className="text-sm text-surface-400">Insufficient data</span>
      </div>
    )
  }

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

  return (
    <div className="p-4 relative">
      {/* PROJECTED badge */}
      <span className="absolute top-3 right-3 text-2xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-700 uppercase tracking-wide">
        Projected
      </span>

      {/* Label */}
      <p className="text-xs font-medium text-surface-500 uppercase tracking-wide mb-2">
        {label}
      </p>

      {/* Big Number */}
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-4xl font-bold text-surface-800">{predicted}</span>
        {changePercent !== undefined && changePercent !== 0 && (
          <span className={`text-sm font-semibold ${getTrendColor()}`}>
            {changePercent > 0 ? '+' : ''}{changePercent}%
          </span>
        )}
      </div>

      {/* Range */}
      {range && (
        <p className="text-sm text-surface-500 mb-2">
          Range: {range.min} - {range.max}
        </p>
      )}

      {/* Trend & Confidence */}
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-1 ${getTrendColor()}`}>
          {getTrendIcon()}
          <span className="text-xs font-medium">
            {trend === 'increasing' ? 'Trending up' : trend === 'decreasing' ? 'Trending down' : 'Stable'}
          </span>
        </div>
        <span className="text-xs text-surface-400">
          {confidence ? `${confidence.charAt(0).toUpperCase()}${confidence.slice(1)} Confidence` : ''}
        </span>
      </div>
    </div>
  )
}

/**
 * TypeProbabilitySection - Donut chart with legend
 */
const TypeProbabilitySection = ({ data }) => {
  const { types, mostLikely } = data

  // Prepare chart data
  const chartData = useMemo(() => {
    return types?.map(t => ({
      name: formatTypeName(t.type),
      fullName: t.label,
      value: t.probability,
      color: t.color,
      trend: t.trend,
      trendChange: t.trendChange
    })) || []
  }, [types])

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null
    const item = payload[0].payload
    return (
      <div className="bg-white p-2 rounded shadow-lg border border-surface-200 text-xs">
        <p className="font-semibold" style={{ color: item.color }}>{item.fullName}</p>
        <p className="text-surface-700">{item.value.toFixed(1)}%</p>
      </div>
    )
  }

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, value }) => {
    if (value < 5) return null
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-semibold"
        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
      >
        {name} {value.toFixed(0)}%
      </text>
    )
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-surface-700">Type Probability</h4>
        <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-700 uppercase tracking-wide">
          Projected
        </span>
      </div>

      {/* Donut Chart */}
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
              labelLine={false}
              label={renderLabel}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Most Likely */}
      {mostLikely && (
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-surface-100">
          <span className="text-xs text-surface-500">Most likely:</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold" style={{ color: mostLikely.color }}>
              {formatTypeName(mostLikely.type)}
            </span>
            <span className="text-xs text-surface-500">({mostLikely.probability}%)</span>
            <TrendIcon trend={mostLikely.trend} size={12} />
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-2 space-y-1">
        {types?.slice(0, 4).map(t => (
          <div key={t.type} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: t.color }} />
              <span className="text-surface-600">{formatTypeName(t.type)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-surface-700">{t.probability}%</span>
              <TrendIcon trend={t.trend} size={10} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * RiskAssessmentSection - Risk bars with highest risk indicator
 */
const RiskAssessmentSection = ({ data }) => {
  const { risks, highestRisk } = data

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-surface-700">Risk Assessment</h4>
        <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-700 uppercase tracking-wide">
          Projected
        </span>
      </div>

      {/* Risk Bars */}
      <div className="space-y-3">
        {risks?.slice(0, 4).map((risk) => (
          <div key={risk.type} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-surface-700">{formatTypeName(risk.type)}</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-surface-800">{risk.riskScore}%</span>
                <TrendIcon trend={risk.trend} size={12} />
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getRiskBarColor(risk.riskLevel)}`}
                style={{ width: `${Math.max(2, risk.riskScore)}%` }}
              />
            </div>

            {/* Trend change */}
            {risk.trendChange !== 0 && (
              <p className={`text-2xs ${risk.trend === 'increasing' ? 'text-red-500' : risk.trend === 'decreasing' ? 'text-green-500' : 'text-surface-400'}`}>
                {risk.trendChange > 0 ? '+' : ''}{risk.trendChange}% from previous period
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Highest Risk */}
      {highestRisk && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-surface-100">
          <span className="text-xs text-surface-500">Highest Risk:</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold" style={{ color: highestRisk.color }}>
              {formatTypeName(highestRisk.type)}
            </span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-surface-100 text-surface-600">
              Score: {highestRisk.riskScore}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * TrendIcon - Reusable trend indicator
 */
const TrendIcon = ({ trend, size = 12 }) => {
  if (trend === 'increasing') return <TrendingUp size={size} className="text-red-500" />
  if (trend === 'decreasing') return <TrendingDown size={size} className="text-green-500" />
  return <Minus size={size} className="text-surface-400" />
}

/**
 * Helper: Format incident type name for display
 */
const formatTypeName = (type) => {
  if (!type) return 'Unknown'
  switch (type.toLowerCase()) {
    case 'near-miss': return 'Near'
    case 'fac': return 'FAC'
    case 'mti': return 'MTI'
    case 'lti': return 'LTI'
    case 'positive': return 'Positive'
    case 'unsafe-act': return 'Unsafe Act'
    case 'unsafe-condition': return 'Unsafe Cond.'
    case 'ncr': return 'NCR'
    default: return type
  }
}

/**
 * Helper: Get risk bar color based on level
 */
const getRiskBarColor = (riskLevel) => {
  if (riskLevel === 'high') return 'bg-red-500'
  if (riskLevel === 'medium') return 'bg-amber-500'
  return 'bg-green-500'
}

export default React.memo(IncidentPredictionPanel)
