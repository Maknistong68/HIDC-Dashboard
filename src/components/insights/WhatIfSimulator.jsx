import React, { useState, useMemo, useCallback } from 'react'
import { Sliders, RefreshCw, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react'
import ScenarioImpactCard from './ScenarioImpactCard'

/**
 * WhatIfSimulator - Interactive simulation of improvement scenarios
 */
const WhatIfSimulator = ({ incidents, simulationFn, overdueCount, currentNightPct, topRootCauses }) => {
  const [params, setParams] = useState({
    actionsToClose: 0,
    targetNightPct: Math.round(currentNightPct || 15),
    rootCause: topRootCauses?.[0] || null,
    rootCauseReductionPct: 25
  })

  const handleSliderChange = useCallback((key, value) => {
    setParams(prev => ({ ...prev, [key]: value }))
  }, [])

  const handleReset = useCallback(() => {
    setParams({
      actionsToClose: 0,
      targetNightPct: Math.round(currentNightPct || 15),
      rootCause: topRootCauses?.[0] || null,
      rootCauseReductionPct: 25
    })
  }, [currentNightPct, topRootCauses])

  // Run simulation when params change
  const simulation = useMemo(() => {
    if (!simulationFn) return null
    return simulationFn(incidents, params)
  }, [incidents, params, simulationFn])

  const hasChanges = params.actionsToClose > 0 ||
    params.targetNightPct !== Math.round(currentNightPct || 15) ||
    params.rootCauseReductionPct !== 25

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders size={18} className="text-primary-600" />
          <span className="text-sm font-medium text-surface-700">
            Adjust parameters to see projected impact
          </span>
        </div>
        {hasChanges && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-surface-600 hover:text-surface-800 hover:bg-surface-100 rounded-lg transition-colors"
          >
            <RefreshCw size={14} />
            Reset
          </button>
        )}
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Action Closure Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-surface-700">
              Close Overdue Actions
            </label>
            <span className="text-sm font-bold text-primary-600">
              {params.actionsToClose} / {overdueCount || 0}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={overdueCount || 10}
            value={params.actionsToClose}
            onChange={(e) => handleSliderChange('actionsToClose', parseInt(e.target.value))}
            className="w-full h-2 bg-surface-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          />
          <p className="text-xs text-surface-500">
            Simulate closing overdue observation actions
          </p>
        </div>

        {/* Night Coverage Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-surface-700">
              Night Shift Coverage
            </label>
            <span className="text-sm font-bold text-primary-600">
              {params.targetNightPct}%
            </span>
          </div>
          <input
            type="range"
            min={Math.round(currentNightPct || 5)}
            max={40}
            value={params.targetNightPct}
            onChange={(e) => handleSliderChange('targetNightPct', parseInt(e.target.value))}
            className="w-full h-2 bg-surface-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          />
          <p className="text-xs text-surface-500">
            Target: 25% (current: {Math.round(currentNightPct || 0)}%)
          </p>
        </div>

        {/* Root Cause Reduction */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-surface-700">
              Root Cause Reduction
            </label>
            <span className="text-sm font-bold text-primary-600">
              {params.rootCauseReductionPct}%
            </span>
          </div>

          {/* Root cause selector */}
          {topRootCauses && topRootCauses.length > 0 && (
            <select
              value={params.rootCause || ''}
              onChange={(e) => handleSliderChange('rootCause', e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {topRootCauses.map(rc => (
                <option key={rc} value={rc}>{rc}</option>
              ))}
            </select>
          )}

          <input
            type="range"
            min={0}
            max={50}
            step={5}
            value={params.rootCauseReductionPct}
            onChange={(e) => handleSliderChange('rootCauseReductionPct', parseInt(e.target.value))}
            className="w-full h-2 bg-surface-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          />
          <p className="text-xs text-surface-500">
            Simulate reducing incidents with this root cause
          </p>
        </div>
      </div>

      {/* Results */}
      {simulation && (
        <div className="space-y-4">
          {/* Combined Impact */}
          <div className="p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg border border-primary-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide">
                  Projected Risk Score Impact
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-2xl font-bold text-surface-700">
                    {simulation.combined.currentRiskScore}%
                  </span>
                  <ArrowRight size={20} className="text-surface-400" />
                  <span className="text-2xl font-bold text-primary-600">
                    {simulation.combined.projectedRiskScore}%
                  </span>
                  {simulation.combined.totalImprovement > 0 && (
                    <span className="px-2 py-1 bg-safety-success text-white text-sm font-bold rounded">
                      +{simulation.combined.totalImprovement} pts
                    </span>
                  )}
                </div>
              </div>
              {simulation.combined.totalImprovement > 0 && (
                <CheckCircle size={32} className="text-safety-success" />
              )}
            </div>
          </div>

          {/* Scenario Breakdown */}
          {simulation.scenarios.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {simulation.scenarios.map((scenario, idx) => (
                <ScenarioImpactCard key={idx} scenario={scenario} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* No changes hint */}
      {!hasChanges && (
        <div className="p-4 bg-surface-50 rounded-lg border border-surface-200 text-center">
          <p className="text-sm text-surface-600">
            Adjust the sliders above to simulate improvement scenarios
          </p>
        </div>
      )}
    </div>
  )
}

export default React.memo(WhatIfSimulator)
