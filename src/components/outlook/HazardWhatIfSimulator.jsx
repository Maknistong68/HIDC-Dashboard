import React, { useState, useMemo, useCallback } from 'react'
import {
  RefreshCw,
  TrendingDown,
  Clock,
  Users,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react'
import { NEGATIVE_TYPES } from '../../utils/rootCauseEngine'

// Custom slider styles for better visibility
const sliderStyles = `
  .whatif-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 8px;
    border-radius: 4px;
    outline: none;
    cursor: pointer;
  }
  .whatif-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    cursor: pointer;
    border: 3px solid white;
    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  }
  .whatif-slider::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    cursor: pointer;
    border: 3px solid white;
    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  }
  .whatif-slider.amber {
    background: linear-gradient(to right, #fef3c7, #fbbf24);
  }
  .whatif-slider.amber::-webkit-slider-thumb {
    background: #f59e0b;
  }
  .whatif-slider.amber::-moz-range-thumb {
    background: #f59e0b;
  }
  .whatif-slider.emerald {
    background: linear-gradient(to right, #d1fae5, #34d399);
  }
  .whatif-slider.emerald::-webkit-slider-thumb {
    background: #10b981;
  }
  .whatif-slider.emerald::-moz-range-thumb {
    background: #10b981;
  }
`

/**
 * HazardWhatIfSimulator - Compact simulation controls for a selected hazard
 * Horizontal layout with sliders and impact gauge
 */
const HazardWhatIfSimulator = ({ hazard, incidents }) => {
  // Get hazard-specific data
  const hazardData = useMemo(() => {
    if (!hazard || !incidents?.length) return null

    const hazardIncidents = incidents.filter(i => i.location === hazard.name)
    const negativeIncidents = hazardIncidents.filter(i => NEGATIVE_TYPES.includes(i.type))

    // Calculate weekly average (assuming 12 weeks of data)
    const weeklyAvg = Math.max(1, Math.round(negativeIncidents.length / 12))

    return { total: negativeIncidents.length, weeklyAvg }
  }, [hazard, incidents])

  const [params, setParams] = useState({
    actionsToClose: 0,
    trainingIncrease: 0
  })

  const [showDetails, setShowDetails] = useState(false)

  // Calculate projections
  const projection = useMemo(() => {
    if (!hazardData) return null

    let totalReduction = 0
    const actionEffect = Math.min(30, params.actionsToClose * 3)
    totalReduction += actionEffect

    const trainingEffect = Math.min(20, params.trainingIncrease * 0.2)
    totalReduction += trainingEffect
    totalReduction = Math.min(50, totalReduction)

    const projectedWeekly = hazardData.weeklyAvg * (1 - totalReduction / 100)
    const quarterSaved = Math.round((hazardData.weeklyAvg - projectedWeekly) * 12)

    return {
      reductionPct: Math.round(totalReduction),
      weeklyNow: hazardData.weeklyAvg,
      weeklyAfter: Math.round(projectedWeekly * 10) / 10,
      quarterSaved,
      breakdown: {
        actions: Math.round(actionEffect * 10) / 10,
        training: Math.round(trainingEffect * 10) / 10
      }
    }
  }, [hazardData, params])

  const handleChange = useCallback((key, value) => {
    setParams(prev => ({ ...prev, [key]: value }))
  }, [])

  const handleReset = useCallback(() => {
    setParams({
      actionsToClose: 0,
      trainingIncrease: 0
    })
  }, [])

  const hasChanges = params.actionsToClose > 0 || params.trainingIncrease > 0

  if (!hazardData || hazardData.total === 0) {
    return (
      <div className="text-center py-3 text-xs text-surface-400">
        No data available for simulation
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Inject slider styles */}
      <style>{sliderStyles}</style>

      {/* Compact Sliders Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Close Actions */}
        <div className="bg-white rounded-xl border border-surface-200 p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-100">
                <Clock size={14} className="text-amber-600" />
              </div>
              <span className="text-xs font-semibold text-surface-700">Close Actions</span>
            </div>
            <span className="text-lg font-bold text-amber-600">{params.actionsToClose}</span>
          </div>
          <input
            type="range"
            min={0}
            max={10}
            value={params.actionsToClose}
            onChange={(e) => handleChange('actionsToClose', parseInt(e.target.value))}
            className="whatif-slider amber"
          />
          <div className="flex justify-between text-[10px] text-surface-400 mt-1">
            <span>0</span>
            <span>5</span>
            <span>10</span>
          </div>
        </div>

        {/* Training */}
        <div className="bg-white rounded-xl border border-surface-200 p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-100">
                <Users size={14} className="text-emerald-600" />
              </div>
              <span className="text-xs font-semibold text-surface-700">Training</span>
            </div>
            <span className="text-lg font-bold text-emerald-600">{params.trainingIncrease}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={10}
            value={params.trainingIncrease}
            onChange={(e) => handleChange('trainingIncrease', parseInt(e.target.value))}
            className="whatif-slider emerald"
          />
          <div className="flex justify-between text-[10px] text-surface-400 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Impact Result Bar */}
      <div className={`flex items-center gap-3 p-2.5 rounded-lg transition-all ${
        hasChanges ? 'bg-emerald-50 border border-emerald-200' : 'bg-surface-50'
      }`}>
        {hasChanges && projection ? (
          <>
            {/* Progress Bar */}
            <div className="flex-1">
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="text-surface-500">Projected Impact</span>
                <span className="text-emerald-600 font-medium">
                  {projection.weeklyNow} → {projection.weeklyAfter}/week
                </span>
              </div>
              <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (projection.reductionPct / 50) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-surface-400 mt-0.5">
                <span>0%</span>
                <span>50% max</span>
              </div>
            </div>

            {/* Result Badge */}
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-center">
                <div className="flex items-center gap-1">
                  <TrendingDown size={14} />
                  <span className="text-base font-bold">{projection.reductionPct}%</span>
                </div>
                <p className="text-[9px] opacity-90">-{projection.quarterSaved}/qtr</p>
              </div>
              <button
                onClick={handleReset}
                className="p-1.5 hover:bg-surface-100 rounded-lg transition-colors"
                title="Reset"
              >
                <RefreshCw size={14} className="text-surface-400" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 text-center py-1">
            <p className="text-xs text-surface-500">
              Adjust sliders to simulate incident reduction
            </p>
            <p className="text-[10px] text-surface-400">
              Current rate: ~{hazardData.weeklyAvg}/week • {hazardData.total} total observations
            </p>
          </div>
        )}
      </div>

      {/* Expandable Formula */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-1 text-[10px] text-surface-400 hover:text-surface-600 transition-colors w-full justify-center"
      >
        <Info size={10} />
        <span>How it works</span>
        {showDetails ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
      </button>

      {showDetails && (
        <div className="text-[10px] text-surface-500 bg-surface-50 rounded-lg p-2 grid grid-cols-2 gap-2">
          <div>
            <span className="font-medium text-amber-600">Actions:</span> 3%/action (max 30%)
          </div>
          <div>
            <span className="font-medium text-emerald-600">Training:</span> 2%/10% (max 20%)
          </div>
        </div>
      )}
    </div>
  )
}

export default React.memo(HazardWhatIfSimulator)
