import React, { useState, useMemo, useCallback } from 'react'
import { Sparkles, Info, ChevronDown, ChevronUp, TrendingDown, TrendingUp, Minus, RefreshCw } from 'lucide-react'
import { NEGATIVE_TYPES } from '../../utils/rootCauseEngine'

// Bidirectional slider styles with center at 0
const sliderStyles = `
  .predictive-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 10px;
    border-radius: 5px;
    outline: none;
    cursor: pointer;
  }
  .predictive-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    cursor: pointer;
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.25);
  }
  .predictive-slider::-moz-range-thumb {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    cursor: pointer;
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.25);
  }
  .predictive-slider.actions {
    background: linear-gradient(to right, #fecaca 0%, #fef3c7 50%, #d1fae5 100%);
  }
  .predictive-slider.actions::-webkit-slider-thumb {
    background: #f59e0b;
  }
  .predictive-slider.actions::-moz-range-thumb {
    background: #f59e0b;
  }
  .predictive-slider.training {
    background: linear-gradient(to right, #fecaca 0%, #cffafe 50%, #d1fae5 100%);
  }
  .predictive-slider.training::-webkit-slider-thumb {
    background: #10b981;
  }
  .predictive-slider.training::-moz-range-thumb {
    background: #10b981;
  }
`

/**
 * InterventionSlider - Bidirectional slider centered at 0
 */
const InterventionSlider = ({ id, label, value, min, max, step = 1, unit = '', onChange, colorClass }) => {
  const isPositive = value > 0
  const isNegative = value < 0
  const displayValue = value > 0 ? `+${value}` : value.toString()

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-surface-700">{label}</span>
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
          step={step}
          value={value}
          onChange={(e) => onChange(id, parseInt(e.target.value))}
          className={`predictive-slider ${colorClass}`}
        />
        {/* Center marker */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0.5 h-4 bg-surface-400 pointer-events-none" />
      </div>
      <div className="flex justify-between text-xs text-surface-400">
        <span>{min}{unit}</span>
        <span className="font-medium">0</span>
        <span>+{max}{unit}</span>
      </div>
    </div>
  )
}

/**
 * RiskBar - Visual risk level indicator
 */
const RiskBar = ({ level, label }) => {
  const getWidth = () => {
    switch (level) {
      case 'low': return '25%'
      case 'medium': return '50%'
      case 'high': return '75%'
      case 'critical': return '100%'
      default: return '50%'
    }
  }

  const getColor = () => {
    switch (level) {
      case 'low': return 'bg-green-500'
      case 'medium': return 'bg-amber-500'
      case 'high': return 'bg-orange-500'
      case 'critical': return 'bg-red-500'
      default: return 'bg-surface-400'
    }
  }

  return (
    <div className="space-y-1">
      <div className="h-3 bg-surface-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getColor()}`}
          style={{ width: getWidth() }}
        />
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-surface-400">Low</span>
        <span className={`font-semibold ${
          level === 'low' ? 'text-green-600' :
          level === 'medium' ? 'text-amber-600' :
          level === 'high' ? 'text-orange-600' :
          'text-red-600'
        }`}>{label}</span>
        <span className="text-surface-400">High</span>
      </div>
    </div>
  )
}

/**
 * PredictiveAnalysisSection - What-If + Prediction panel
 * Two-column layout: Scenario (left) | Projected Outcome (right)
 */
const PredictiveAnalysisSection = ({ incidents, incidentPrediction, selectedHazard }) => {
  const [showMethodology, setShowMethodology] = useState(false)

  // Intervention state - bidirectional sliders centered at 0
  const [interventions, setInterventions] = useState({
    actions: 0,      // -10 to +10: negative = more open actions, positive = close actions
    training: 0      // -50 to +50: negative = less training, positive = more training
  })

  // Context label showing what's being analyzed
  const contextLabel = useMemo(() => {
    if (selectedHazard) return `For: ${selectedHazard.name}`
    return 'Overall Incidents'
  }, [selectedHazard])

  // Filter incidents based on selected hazard
  const contextIncidents = useMemo(() => {
    if (!incidents?.length) return []
    if (selectedHazard) {
      return incidents.filter(i => i.location === selectedHazard.name)
    }
    return incidents
  }, [incidents, selectedHazard])

  // Calculate baseline data from filtered incidents
  const baselineData = useMemo(() => {
    if (!contextIncidents?.length) return null

    const negativeIncidents = contextIncidents.filter(i => NEGATIVE_TYPES.includes(i.type))

    // Calculate weekly average (assuming 12 weeks of data)
    const weeklyAvg = Math.max(1, Math.round(negativeIncidents.length / 12))

    // Get most likely type from prediction
    const mostLikelyType = incidentPrediction?.typeProbability?.data?.[0] || null

    return {
      totalNegative: negativeIncidents.length,
      weeklyAvg,
      mostLikelyType
    }
  }, [contextIncidents, incidentPrediction])

  // Calculate projected outcome based on interventions
  const projection = useMemo(() => {
    if (!baselineData || !incidentPrediction?.weekly) return null

    const baseline = incidentPrediction.weekly.predicted
    const range = incidentPrediction.weekly.range || { min: baseline * 0.7, max: baseline * 1.3 }

    // Calculate total impact from interventions
    let totalChange = 0

    // Actions: each action closed = -3% incidents, each open action = +3%
    const actionEffect = interventions.actions * -3
    totalChange += actionEffect

    // Training: more training = fewer incidents, less training = more
    const trainingEffect = interventions.training * -0.2
    totalChange += trainingEffect

    // Cap total change at -50% to +50%
    totalChange = Math.max(-50, Math.min(50, totalChange))

    // Calculate projected values
    const projectedWeekly = Math.round(baseline * (1 + totalChange / 100) * 10) / 10
    const projectedMin = Math.round(range.min * (1 + totalChange / 100))
    const projectedMax = Math.round(range.max * (1 + totalChange / 100))

    // Determine risk level based on projected change
    let riskLevel = 'medium'
    if (totalChange <= -30) riskLevel = 'low'
    else if (totalChange <= -10) riskLevel = 'low'
    else if (totalChange >= 30) riskLevel = 'critical'
    else if (totalChange >= 10) riskLevel = 'high'

    // Confidence based on data availability
    const confidence = incidentPrediction.weekly.confidence || 'medium'

    return {
      baseline,
      projected: projectedWeekly,
      range: { min: projectedMin, max: projectedMax },
      changePercent: Math.round(totalChange),
      riskLevel,
      confidence,
      mostLikelyType: baselineData.mostLikelyType?.type || 'Near-Miss',
      isImprovement: totalChange < 0
    }
  }, [baselineData, incidentPrediction, interventions])

  const handleInterventionChange = useCallback((id, value) => {
    setInterventions(prev => ({ ...prev, [id]: value }))
  }, [])

  const handleReset = useCallback(() => {
    setInterventions({ actions: 0, training: 0 })
  }, [])

  const hasChanges = interventions.actions !== 0 || interventions.training !== 0
  const netChange = projection?.changePercent || 0

  // Don't render if no data
  if (!incidents?.length || !incidentPrediction) {
    return null
  }

  return (
    <div className="mt-4 bg-white rounded-lg border-2 border-dashed border-primary-200 overflow-hidden">
      {/* Inject slider styles */}
      <style>{sliderStyles}</style>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary-50 to-emerald-50 border-b border-primary-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary-100">
            <Sparkles size={16} className="text-primary-600" />
          </div>
          <div>
            <h2 className="font-semibold text-surface-800">Predictive Analysis</h2>
            <p className="text-xs text-surface-600">{contextLabel}</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2 py-1 rounded bg-amber-100 text-amber-700 uppercase tracking-wide">
          Projected
        </span>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:divide-x divide-surface-200">
        {/* Left: Scenario / Interventions */}
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-surface-700 uppercase tracking-wide">Scenario</h3>
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

          {/* Context banner */}
          <div className="p-3 bg-primary-50 rounded-lg border border-primary-100">
            <p className="text-xs font-medium text-primary-700">
              Currently analyzing: {selectedHazard?.name || 'All Hazards'}
            </p>
            <div className="flex items-center gap-4 mt-1 text-xs text-primary-600">
              <span>Current rate: {baselineData?.weeklyAvg || 0}/week</span>
            </div>
          </div>

          <div className="space-y-5">
            <InterventionSlider
              id="actions"
              label="Open Actions"
              value={interventions.actions}
              min={-10}
              max={10}
              onChange={handleInterventionChange}
              colorClass="actions"
            />

            <InterventionSlider
              id="training"
              label="Training Level"
              value={interventions.training}
              min={-50}
              max={50}
              step={5}
              unit="%"
              onChange={handleInterventionChange}
              colorClass="training"
            />
          </div>

          {/* Net change summary */}
          <div className={`p-3 rounded-lg border ${
            netChange < 0 ? 'bg-green-50 border-green-200' :
            netChange > 0 ? 'bg-red-50 border-red-200' :
            'bg-surface-50 border-surface-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-surface-600">Net Change</span>
              <span className={`text-lg font-bold ${
                netChange < 0 ? 'text-green-600' :
                netChange > 0 ? 'text-red-600' :
                'text-surface-500'
              }`}>
                {netChange > 0 ? '+' : ''}{netChange}%
              </span>
            </div>
            <p className="text-xs text-surface-500 mt-1">
              {netChange < 0 ? 'Risk reduction from interventions' :
               netChange > 0 ? 'Increased risk from scenario' :
               'Adjust sliders to simulate changes'}
            </p>
          </div>
        </div>

        {/* Right: Projected Outcome */}
        <div className="p-4 space-y-4 bg-surface-50/50">
          <h3 className="text-sm font-semibold text-surface-700 uppercase tracking-wide">Projected Outcome</h3>

          {projection ? (
            <div className="space-y-4">
              {/* Big number - weekly prediction */}
              <div className="text-center py-4">
                <p className="text-sm font-medium text-surface-600 mb-2">
                  {selectedHazard?.name || 'All Incidents'}:
                </p>
                <div className="flex items-center justify-center gap-2">
                  <span className={`text-5xl font-bold ${
                    projection.isImprovement ? 'text-green-600' :
                    projection.changePercent > 10 ? 'text-red-600' :
                    'text-surface-800'
                  }`}>
                    {projection.projected}
                  </span>
                  <span className="text-lg text-surface-500">/week</span>
                </div>
                <p className="text-sm text-surface-500 mt-1">
                  (range: {projection.range.min}-{projection.range.max})
                </p>
                <p className="text-xs text-surface-400 mt-1">
                  based on {contextIncidents.length} incident{contextIncidents.length !== 1 ? 's' : ''} in selected period
                </p>
              </div>

              {/* Change badge */}
              {hasChanges && (
                <div className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg ${
                  projection.isImprovement ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {projection.isImprovement ? (
                    <TrendingDown size={18} className="text-green-600" />
                  ) : (
                    <TrendingUp size={18} className="text-red-600" />
                  )}
                  <span className={`text-lg font-bold ${
                    projection.isImprovement ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {projection.isImprovement ? '' : '+'}{projection.changePercent}%
                  </span>
                  <span className={`text-sm ${
                    projection.isImprovement ? 'text-green-700' : 'text-red-700'
                  }`}>
                    vs. baseline
                  </span>
                </div>
              )}

              {!hasChanges && (
                <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-surface-100">
                  <Minus size={18} className="text-surface-400" />
                  <span className="text-sm text-surface-500">
                    Current baseline projection
                  </span>
                </div>
              )}

              {/* Risk bar */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-surface-600">Risk Level</span>
                </div>
                <RiskBar
                  level={projection.riskLevel}
                  label={projection.riskLevel.toUpperCase()}
                />
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-white rounded-lg border border-surface-200">
                  <p className="text-xs text-surface-500">Most Likely Type</p>
                  <p className="text-sm font-semibold text-surface-700">{projection.mostLikelyType}</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-surface-200">
                  <p className="text-xs text-surface-500">Confidence</p>
                  <p className={`text-sm font-semibold ${
                    projection.confidence === 'high' ? 'text-green-600' :
                    projection.confidence === 'medium' ? 'text-amber-600' :
                    'text-surface-500'
                  }`}>
                    {projection.confidence.charAt(0).toUpperCase() + projection.confidence.slice(1)}
                  </p>
                </div>
              </div>

              {/* Color legend */}
              <div className="flex justify-center gap-4 text-xs text-surface-500 pt-2">
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-green-500" />
                  Improvement
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-red-500" />
                  Increased Risk
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-surface-500">Insufficient data for prediction</p>
              <p className="text-xs text-surface-400 mt-1">Need at least 7 days of data</p>
            </div>
          )}
        </div>
      </div>

      {/* Methodology disclosure */}
      <div className="border-t border-surface-200">
        <button
          onClick={() => setShowMethodology(!showMethodology)}
          className="flex items-center gap-2 w-full px-4 py-2 text-xs text-surface-500 hover:bg-surface-50 transition-colors"
        >
          <Info size={12} />
          <span>How these are calculated</span>
          {showMethodology ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        {showMethodology && (
          <div className="px-4 pb-4 space-y-2 text-xs text-surface-600">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <p className="font-semibold text-surface-700">Scenario Sliders</p>
                <ul className="space-y-1 text-surface-500">
                  <li><span className="font-medium text-amber-600">Open Actions:</span> Each action closed reduces incidents by ~3%</li>
                  <li><span className="font-medium text-emerald-600">Training:</span> +10% training = ~2% incident reduction</li>
                </ul>
              </div>
              <div className="space-y-1.5">
                <p className="font-semibold text-surface-700">Baseline Prediction</p>
                <ul className="space-y-1 text-surface-500">
                  <li><span className="font-medium">Count Forecast:</span> {incidentPrediction?.methodology?.countForecast || 'Linear regression with confidence intervals'}</li>
                  <li><span className="font-medium">Type Probability:</span> {incidentPrediction?.methodology?.typeProbability || 'Exponential weighted moving average'}</li>
                </ul>
              </div>
            </div>
            <p className="text-surface-400 italic pt-2">
              Maximum combined impact capped at 50%. Projections are estimates based on historical patterns.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default React.memo(PredictiveAnalysisSection)
