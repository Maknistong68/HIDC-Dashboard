import React, { useState, useMemo, useCallback } from 'react'
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Shield, Wrench, Clock, SlidersHorizontal } from 'lucide-react'
import {
  generateDynamicSliders,
  calculateProjectedChange,
  calculateFactorPrevalence
} from '../insights/ScenarioSimulatorEngine'

/**
 * Scenario card component
 */
const ScenarioCard = ({
  title,
  subtitle,
  variant,
  riskReduction,
  expectedType,
  expectedSeverity,
  timeEstimate,
  costBenefit,
  trendDirection,
  isNoChange
}) => {
  const variantConfig = {
    danger: {
      bg: 'bg-gradient-to-br from-red-50 to-orange-50',
      border: 'border-red-200',
      headerBg: 'bg-red-500',
      headerText: 'text-white',
      iconColor: 'text-red-500'
    },
    warning: {
      bg: 'bg-gradient-to-br from-amber-50 to-yellow-50',
      border: 'border-amber-200',
      headerBg: 'bg-amber-500',
      headerText: 'text-white',
      iconColor: 'text-amber-500'
    },
    success: {
      bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
      border: 'border-green-200',
      headerBg: 'bg-green-500',
      headerText: 'text-white',
      iconColor: 'text-green-500'
    }
  }

  const config = variantConfig[variant] || variantConfig.warning

  const TrendIcon = trendDirection === 'up' ? TrendingUp
    : trendDirection === 'down' ? TrendingDown
    : Minus

  return (
    <div className={`${config.bg} ${config.border} border rounded-lg overflow-hidden h-full flex flex-col`}>
      {/* Header */}
      <div className={`${config.headerBg} ${config.headerText} px-4 py-2.5`}>
        <h4 className="text-sm font-semibold">{title}</h4>
        {subtitle && <p className="text-2xs opacity-90 mt-0.5">{subtitle}</p>}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Risk change */}
        {riskReduction !== undefined && (
          <div className="mb-3">
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-bold ${isNoChange ? 'text-red-600' : config.iconColor}`}>
                {isNoChange ? '+' : ''}{riskReduction}%
              </span>
              <span className="text-xs text-surface-500">
                {isNoChange ? 'risk increase' : 'risk reduction'}
              </span>
            </div>
          </div>
        )}

        {/* Expected outcome for no-change scenario */}
        {isNoChange && (
          <div className="space-y-2 mb-3">
            {trendDirection && (
              <div className="flex items-center gap-2">
                <TrendIcon size={14} className={config.iconColor} />
                <span className="text-xs text-surface-600">
                  Trend: {trendDirection === 'up' ? 'Worsening' : trendDirection === 'down' ? 'Improving' : 'Stable'}
                </span>
              </div>
            )}
            {expectedType && (
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} className={config.iconColor} />
                <span className="text-xs text-surface-600">
                  Expected: {expectedType}
                </span>
              </div>
            )}
            {expectedSeverity && (
              <div className="flex items-center gap-2">
                <Shield size={14} className={config.iconColor} />
                <span className="text-xs text-surface-600">
                  Severity: {expectedSeverity}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Time estimate for control scenarios */}
        {timeEstimate && (
          <div className="flex items-center gap-2 mb-2">
            <Clock size={14} className={config.iconColor} />
            <span className="text-xs text-surface-600">{timeEstimate}</span>
          </div>
        )}

        {/* Cost-benefit for best controls */}
        {costBenefit && (
          <div className="flex items-center gap-2 mb-2">
            <Wrench size={14} className={config.iconColor} />
            <span className="text-xs text-surface-600">{costBenefit}</span>
          </div>
        )}

        {/* Controls applied indicator */}
        {!isNoChange && (
          <div className="mt-auto pt-3 border-t border-surface-200">
            <div className="text-2xs text-surface-500 font-medium uppercase tracking-wide mb-1">
              Controls Applied
            </div>
            <div className="text-xs text-surface-600">
              {variant === 'warning' ? 'PPE, Training, Supervision' : 'Engineering + 10 actions closed'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * ThreeScenarioPanel - Panel C
 * Shows 3 fixed scenarios: No Change, Minimum Controls, Best Controls
 */
const ThreeScenarioPanel = ({
  scenarios,
  topRiskHazard,
  incidentPrediction,
  factorData,
  negativeIncidents
}) => {
  const { noChange, minControls, bestControls } = scenarios || {}
  const [sliderValues, setSliderValues] = useState({})

  // Get trend direction from top hazard
  const trendDirection = topRiskHazard?.trend === 'significant-rise' || topRiskHazard?.trend === 'rising'
    ? 'up'
    : topRiskHazard?.trend === 'declining' || topRiskHazard?.trend === 'significant-decline'
    ? 'down'
    : 'stable'

  // Get expected type
  const expectedType = incidentPrediction?.typeProbability?.types?.[0]?.label?.split(' (')[0] || 'Near Miss'

  // Severity based on trend
  const expectedSeverity = trendDirection === 'up' ? 'Elevated' : trendDirection === 'down' ? 'Low' : 'Moderate'

  // Generate top 3 dynamic sliders from actual factor data
  const dynamicSliders = useMemo(() => {
    if (!factorData?.byFactor || !negativeIncidents?.length) return []
    return generateDynamicSliders(factorData, 'all', negativeIncidents.length).slice(0, 3)
  }, [factorData, negativeIncidents])

  // Calculate factor prevalence for projection
  const prevalence = useMemo(() => {
    if (!factorData?.byFactor || !negativeIncidents?.length) return {}
    return calculateFactorPrevalence(factorData, negativeIncidents.length)
  }, [factorData, negativeIncidents])

  // Live projected change from slider values
  const totalEffect = useMemo(() => {
    const hasAny = Object.values(sliderValues).some(v => v > 0)
    if (!hasAny) return 0
    const result = calculateProjectedChange(sliderValues, prevalence)
    return result.totalEffect
  }, [sliderValues, prevalence])

  const hasChanges = Object.values(sliderValues).some(v => v > 0)

  const handleSliderChange = useCallback((id, value) => {
    setSliderValues(prev => ({ ...prev, [id]: Number(value) }))
  }, [])

  const handleReset = useCallback(() => {
    setSliderValues({})
  }, [])

  return (
    <div className="bg-white rounded-lg border border-surface-200 p-5 h-full">
      <style>{`
        .scenario-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 6px; border-radius: 3px; outline: none; background: #e2e8f0; }
        .scenario-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 16px; height: 16px; border-radius: 50%; cursor: pointer; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
        .scenario-slider::-moz-range-thumb { width: 16px; height: 16px; border-radius: 50%; cursor: pointer; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
        .scenario-slider.engineering::-webkit-slider-thumb { background: #3b82f6; }
        .scenario-slider.engineering::-moz-range-thumb { background: #3b82f6; }
        .scenario-slider.administrative::-webkit-slider-thumb { background: #6366f1; }
        .scenario-slider.administrative::-moz-range-thumb { background: #6366f1; }
        .scenario-slider.ppe::-webkit-slider-thumb { background: #f59e0b; }
        .scenario-slider.ppe::-moz-range-thumb { background: #f59e0b; }
        .scenario-slider.environmental::-webkit-slider-thumb { background: #10b981; }
        .scenario-slider.environmental::-moz-range-thumb { background: #10b981; }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-surface-700">Scenario Comparison</h3>
        <span className="text-2xs text-surface-400">What happens next...</span>
      </div>

      {/* Three scenario cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Scenario 1: No Change */}
        <ScenarioCard
          title="If Nothing Changes"
          subtitle="Current trajectory"
          variant="danger"
          riskReduction={noChange?.riskChange || 15}
          isNoChange={true}
          trendDirection={trendDirection}
          expectedType={expectedType}
          expectedSeverity={expectedSeverity}
        />

        {/* Scenario 2: Minimum Controls */}
        <ScenarioCard
          title="Minimum Controls"
          subtitle="PPE + basic training"
          variant="warning"
          riskReduction={minControls?.riskReduction || 25}
          timeEstimate={minControls?.timeEstimate || '2-3 weeks to see effect'}
        />

        {/* Scenario 3: Best Controls */}
        <ScenarioCard
          title="Best Controls"
          subtitle="Engineering + actions"
          variant="success"
          riskReduction={bestControls?.riskReduction || 45}
          timeEstimate={bestControls?.timeEstimate || '4-6 weeks to see effect'}
          costBenefit={bestControls?.costBenefit || 'High ROI - addresses root cause'}
        />
      </div>

      {/* Custom Scenario Sliders */}
      {dynamicSliders.length > 0 && (
        <div className="mt-4 pt-3 border-t border-surface-100">
          {/* Header row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-surface-400" />
              <span className="text-xs font-semibold text-surface-600 uppercase tracking-wide">
                Custom Scenario
              </span>
            </div>
            {totalEffect !== 0 && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                totalEffect < 0
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {totalEffect > 0 ? '+' : ''}{totalEffect}% projected
              </span>
            )}
          </div>

          {/* Top 3 dynamic sliders */}
          <div className="space-y-3">
            {dynamicSliders.map(slider => (
              <div key={slider.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-surface-600">{slider.label}</span>
                  <span className="text-2xs text-surface-400">
                    {slider.prevalence.toFixed(0)}% of incidents
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={sliderValues[slider.id] || 0}
                  onChange={e => handleSliderChange(slider.id, e.target.value)}
                  className={`scenario-slider ${slider.categoryKey}`}
                />
                <div className="flex justify-between text-2xs text-surface-400 mt-0.5">
                  <span>No change</span>
                  <span>Max effort</span>
                </div>
              </div>
            ))}
          </div>

          {/* Reset link */}
          {hasChanges && (
            <button
              onClick={handleReset}
              className="text-2xs text-blue-500 hover:text-blue-600 mt-2"
            >
              Reset all
            </button>
          )}
        </div>
      )}

      {/* Methodology note */}
      <div className="mt-4 pt-3 border-t border-surface-100">
        <p className="text-2xs text-surface-400">
          Projections based on Monte Carlo simulation (300 iterations) and historical control effectiveness.
          Engineering controls: 75% effectiveness. Administrative: 50%. PPE: 30%.
        </p>
      </div>
    </div>
  )
}

export default React.memo(ThreeScenarioPanel)
