import React, { useState, useMemo, useCallback } from 'react'
import {
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Minus,
  HelpCircle,
  Zap,
  RefreshCw
} from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts'

// Slider styles for scenario simulator
const sliderStyles = `
  .unified-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 8px;
    border-radius: 4px;
    outline: none;
    cursor: pointer;
  }
  .unified-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 1px 4px rgba(0,0,0,0.2);
  }
  .unified-slider::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 1px 4px rgba(0,0,0,0.2);
  }
  .unified-slider.actions {
    background: linear-gradient(to right, #fef3c7 0%, #d1fae5 100%);
  }
  .unified-slider.actions::-webkit-slider-thumb {
    background: #f59e0b;
  }
  .unified-slider.actions::-moz-range-thumb {
    background: #f59e0b;
  }
  .unified-slider.training {
    background: linear-gradient(to right, #fecaca 0%, #e0e7ff 50%, #d1fae5 100%);
  }
  .unified-slider.training::-webkit-slider-thumb {
    background: #6366f1;
  }
  .unified-slider.training::-moz-range-thumb {
    background: #6366f1;
  }
  .unified-slider.inspection {
    background: linear-gradient(to right, #fecaca 0%, #cffafe 50%, #d1fae5 100%);
  }
  .unified-slider.inspection::-webkit-slider-thumb {
    background: #06b6d4;
  }
  .unified-slider.inspection::-moz-range-thumb {
    background: #06b6d4;
  }
  .unified-slider.supervision {
    background: linear-gradient(to right, #fecaca 0%, #fce7f3 50%, #d1fae5 100%);
  }
  .unified-slider.supervision::-webkit-slider-thumb {
    background: #ec4899;
  }
  .unified-slider.supervision::-moz-range-thumb {
    background: #ec4899;
  }
`

/**
 * UnifiedPredictivePanel - Combined forecasting and scenario simulation
 * Replaces both IncidentPredictionPanel and PredictiveAnalysisSection
 */
const UnifiedPredictivePanel = ({ incidentPrediction, filteredIncidents }) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showMethodology, setShowMethodology] = useState(false)

  // Scenario simulator slider state
  const [sliders, setSliders] = useState({
    closeActions: 0,
    training: 0,
    inspection: 0,
    supervision: 0
  })

  const { weekly, monthly, typeProbability, typeRisk } = incidentPrediction || {}

  // Calculate data-driven values for slider labels
  const sliderData = useMemo(() => {
    if (!filteredIncidents?.length) {
      return {
        openActionsCount: 0,
        trainingPercent: 0,
        supervisionPercent: 0
      }
    }

    // Count open actions
    const openActionsCount = filteredIncidents.filter(
      i => i.actionStatus === 'open' || i.actionStatus === 'Open'
    ).length

    // Calculate root cause percentages
    const totalNegative = filteredIncidents.filter(
      i => !['positive', 'leadership'].includes(i.type?.toLowerCase())
    ).length

    const trainingCount = filteredIncidents.filter(
      i => i.rootCause?.toLowerCase()?.includes('training') ||
           i.rootCause?.toLowerCase()?.includes('inadequate training')
    ).length

    const supervisionCount = filteredIncidents.filter(
      i => i.rootCause?.toLowerCase()?.includes('supervision') ||
           i.rootCause?.toLowerCase()?.includes('lack of supervision')
    ).length

    const trainingPercent = totalNegative > 0
      ? Math.round((trainingCount / totalNegative) * 100)
      : 0

    const supervisionPercent = totalNegative > 0
      ? Math.round((supervisionCount / totalNegative) * 100)
      : 0

    return {
      openActionsCount,
      trainingPercent,
      supervisionPercent,
      trainingCount,
      supervisionCount,
      totalNegative
    }
  }, [filteredIncidents])

  // Calculate projected outcome based on slider values
  const projection = useMemo(() => {
    if (weekly?.predicted === undefined || weekly?.predicted === null) return null

    const basePrediction = weekly.predicted
    const { openActionsCount, trainingPercent, supervisionPercent } = sliderData

    // Calculate individual effects
    const effects = {
      // Each closed action = ~2.5% reduction, max 15% total
      openActions: openActionsCount > 0
        ? (sliders.closeActions / openActionsCount) * -15
        : 0,

      // Training: proportional to root cause %, max effect based on contribution
      training: trainingPercent > 0
        ? (trainingPercent * sliders.training / 100) * -0.8
        : sliders.training * -0.1,

      // Inspection: general 1.5% per 10% increase
      inspection: sliders.inspection * -0.15,

      // Supervision: proportional to root cause %
      supervision: supervisionPercent > 0
        ? (supervisionPercent * sliders.supervision / 100) * -0.8
        : sliders.supervision * -0.1
    }

    // Total effect (capped at -60% to +40%)
    const totalEffect = Math.max(-60, Math.min(40,
      effects.openActions + effects.training + effects.inspection + effects.supervision
    ))

    // Projected outcome
    const projected = Math.round(basePrediction * (1 + totalEffect / 100))

    // Determine risk level
    let riskLevel = 'medium'
    if (totalEffect <= -20) riskLevel = 'low'
    else if (totalEffect >= 20) riskLevel = 'high'
    else if (totalEffect >= 30) riskLevel = 'critical'

    // Previous risk level (baseline)
    let baseRiskLevel = 'medium'
    if (weekly.changePercent <= -10) baseRiskLevel = 'low'
    else if (weekly.changePercent >= 10) baseRiskLevel = 'medium'
    else if (weekly.changePercent >= 20) baseRiskLevel = 'high'

    return {
      baseline: basePrediction,
      projected,
      changePercent: Math.round(totalEffect),
      riskLevel,
      baseRiskLevel,
      effects,
      isImproved: totalEffect < 0
    }
  }, [weekly, sliders, sliderData])

  const handleSliderChange = useCallback((id, value) => {
    setSliders(prev => ({ ...prev, [id]: value }))
  }, [])

  const handleReset = useCallback(() => {
    setSliders({
      closeActions: 0,
      training: 0,
      inspection: 0,
      supervision: 0
    })
  }, [])

  const hasChanges = Object.values(sliders).some(v => v !== 0)

  // Don't render if no meaningful data
  if (!weekly && !monthly && !typeProbability?.hasData) {
    return null
  }

  return (
    <div className="bg-white border border-surface-200 rounded-lg overflow-hidden shadow-soft">
      {/* Inject slider styles */}
      <style>{sliderStyles}</style>

      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Zap size={18} className="text-primary-600" />
          <h3 className="text-sm font-semibold text-surface-800">Predictive Analysis</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-700 uppercase tracking-wide">
            Projected
          </span>
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
            <PredictionCard
              label="NEXT WEEK"
              predicted={weekly?.predicted}
              range={weekly?.range}
              trend={weekly?.trend}
              confidence={weekly?.confidence}
              changePercent={weekly?.changePercent}
            />
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
            {typeProbability?.hasData && (
              <TypeProbabilitySection data={typeProbability} />
            )}
            {typeRisk?.hasData && (
              <RiskAssessmentSection data={typeRisk} />
            )}
          </div>

          {/* Scenario Simulator Section */}
          <div className="border-t border-surface-200">
            <div className="flex items-center justify-between px-4 py-3 bg-surface-50">
              <h4 className="text-sm font-semibold text-surface-700 uppercase tracking-wide">
                Scenario Simulator
              </h4>
              {hasChanges && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 text-xs text-surface-500 hover:text-surface-700 transition-colors"
                >
                  <RefreshCw size={12} />
                  Reset
                </button>
              )}
            </div>

            <div className="p-4 space-y-4">
              {/* Slider: Close Open Actions */}
              <ScenarioSlider
                id="closeActions"
                label="Close Open Actions"
                sublabel={`Currently ${sliderData.openActionsCount} open`}
                value={sliders.closeActions}
                min={0}
                max={Math.max(sliderData.openActionsCount, 10)}
                unit=" actions"
                leftLabel="leave open"
                rightLabel="close more"
                colorClass="actions"
                onChange={handleSliderChange}
              />

              {/* Slider: Training Hours */}
              <ScenarioSlider
                id="training"
                label="Training Hours"
                sublabel={`${sliderData.trainingPercent}% of incidents from inadequate training`}
                value={sliders.training}
                min={-50}
                max={100}
                unit="%"
                leftLabel="reduce"
                rightLabel="increase"
                colorClass="training"
                onChange={handleSliderChange}
              />

              {/* Slider: Inspection Frequency */}
              <ScenarioSlider
                id="inspection"
                label="Inspection Frequency"
                sublabel="Weekly inspections baseline"
                value={sliders.inspection}
                min={-50}
                max={100}
                unit="%"
                leftLabel="less"
                rightLabel="more"
                colorClass="inspection"
                onChange={handleSliderChange}
              />

              {/* Slider: Supervision Level */}
              <ScenarioSlider
                id="supervision"
                label="Supervision Level"
                sublabel={`${sliderData.supervisionPercent}% of incidents from lack of supervision`}
                value={sliders.supervision}
                min={-50}
                max={100}
                unit="%"
                leftLabel="reduce"
                rightLabel="increase"
                colorClass="supervision"
                onChange={handleSliderChange}
              />

              {/* Projected Impact Box */}
              {projection && (
                <ProjectedImpactBox
                  projection={projection}
                  hasChanges={hasChanges}
                />
              )}
            </div>
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
              <div className="px-4 pb-4 text-xs text-surface-600 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold text-surface-700 mb-1">Forecast Predictions</p>
                    <ul className="space-y-1 text-surface-500">
                      <li><strong>Count Forecast:</strong> Linear regression with 95% confidence intervals</li>
                      <li><strong>Type Probability:</strong> Exponential weighted moving average (6 months)</li>
                      <li><strong>Risk Score:</strong> Probability x Severity x Trend Multiplier</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-surface-700 mb-1">Scenario Effects</p>
                    <ul className="space-y-1 text-surface-500">
                      <li><strong>Close Actions:</strong> Each closed = ~2.5% reduction (max 15%)</li>
                      <li><strong>Training:</strong> Scaled by training root-cause % (x0.8)</li>
                      <li><strong>Inspection:</strong> +10% inspection = ~1.5% reduction</li>
                      <li><strong>Supervision:</strong> Scaled by supervision root-cause % (x0.8)</li>
                    </ul>
                  </div>
                </div>
                <p className="text-surface-400 italic pt-1">
                  Based on {filteredIncidents?.length || 0} observations. Maximum combined impact capped at -60% to +40%.
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
      trend: t.trend
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
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-surface-700">Type Probability</h4>
      </div>

      {/* Donut Chart */}
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={55}
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
    </div>
  )
}

/**
 * RiskAssessmentSection - Risk bars with trend indicators
 */
const RiskAssessmentSection = ({ data }) => {
  const { risks, highestRisk } = data

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-surface-700">Risk Assessment</h4>
      </div>

      {/* Risk Bars */}
      <div className="space-y-2.5">
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
          </div>
        ))}
      </div>

      {/* Highest Risk */}
      {highestRisk && (
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-surface-100">
          <span className="text-xs text-surface-500">Highest:</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold" style={{ color: highestRisk.color }}>
              {formatTypeName(highestRisk.type)}
            </span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-surface-100 text-surface-600">
              {highestRisk.riskScore}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * ScenarioSlider - Data-driven scenario slider
 */
const ScenarioSlider = ({
  id,
  label,
  sublabel,
  value,
  min,
  max,
  unit = '',
  leftLabel,
  rightLabel,
  colorClass,
  onChange
}) => {
  const displayValue = value > 0 ? `+${value}` : value.toString()
  const isPositive = value > 0
  const isNegative = value < 0

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-medium text-surface-700">{label}</span>
          {sublabel && (
            <p className="text-xs text-surface-400">{sublabel}</p>
          )}
        </div>
        <span className={`text-sm font-bold ${
          isPositive ? 'text-green-600' : isNegative ? 'text-red-500' : 'text-surface-500'
        }`}>
          {displayValue}{unit}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(id, parseInt(e.target.value))}
          className={`unified-slider ${colorClass}`}
        />
      </div>
      <div className="flex justify-between text-2xs text-surface-400">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  )
}

/**
 * ProjectedImpactBox - Shows the projected impact of scenario changes
 */
const ProjectedImpactBox = ({ projection, hasChanges }) => {
  const { baseline, projected, changePercent, riskLevel, baseRiskLevel, isImproved } = projection

  const getRiskColor = (level) => {
    switch (level) {
      case 'low': return 'bg-green-500'
      case 'medium': return 'bg-amber-500'
      case 'high': return 'bg-orange-500'
      case 'critical': return 'bg-red-500'
      default: return 'bg-surface-400'
    }
  }

  const getRiskWidth = (level) => {
    switch (level) {
      case 'low': return '25%'
      case 'medium': return '50%'
      case 'high': return '75%'
      case 'critical': return '100%'
      default: return '50%'
    }
  }

  return (
    <div className={`p-4 rounded-lg border-2 ${
      hasChanges
        ? isImproved
          ? 'bg-green-50 border-green-200'
          : 'bg-red-50 border-red-200'
        : 'bg-surface-50 border-surface-200'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-surface-600 uppercase tracking-wide">
          Projected Impact
        </span>
      </div>

      {hasChanges ? (
        <>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-bold ${isImproved ? 'text-green-600' : 'text-red-600'}`}>
                {projected}
              </span>
              <span className="text-sm text-surface-500">/week</span>
            </div>
            <span className="text-sm text-surface-400">(was {baseline})</span>
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded ${
              isImproved ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {isImproved ? (
                <TrendingDown size={14} />
              ) : (
                <TrendingUp size={14} />
              )}
              <span className="text-sm font-bold">
                {changePercent > 0 ? '+' : ''}{changePercent}%
              </span>
            </div>
          </div>

          {/* Risk Level Bar */}
          <div className="space-y-1">
            <div className="h-2.5 bg-surface-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getRiskColor(riskLevel)}`}
                style={{ width: getRiskWidth(riskLevel) }}
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-surface-400">Risk:</span>
              <span className={`font-semibold ${
                riskLevel === 'low' ? 'text-green-600' :
                riskLevel === 'medium' ? 'text-amber-600' :
                riskLevel === 'high' ? 'text-orange-600' :
                'text-red-600'
              }`}>
                {baseRiskLevel?.toUpperCase()} {'->'} {riskLevel?.toUpperCase()}
              </span>
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-2 text-surface-500">
          <Minus size={16} />
          <span className="text-sm">Adjust sliders above to see projected impact</span>
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

export default React.memo(UnifiedPredictivePanel)
