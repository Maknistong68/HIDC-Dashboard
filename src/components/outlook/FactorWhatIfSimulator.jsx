import React, { useState, useMemo, useCallback } from 'react'
import {
  RefreshCw,
  TrendingDown,
  Target,
  ChevronDown,
  ChevronUp,
  Info,
  Zap
} from 'lucide-react'
import { NEGATIVE_TYPES } from '../../utils/rootCauseEngine'

// Custom slider styles for better visibility
const sliderStyles = `
  .whatif-slider-lg {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 10px;
    border-radius: 5px;
    outline: none;
    cursor: pointer;
    background: linear-gradient(to right, #f3e8ff, #a855f7);
  }
  .whatif-slider-lg::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    cursor: pointer;
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    background: #9333ea;
  }
  .whatif-slider-lg::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    cursor: pointer;
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    background: #9333ea;
  }
`

/**
 * FactorWhatIfSimulator - Compact simulation for a selected contributing factor
 * Shows cross-hazard impact with horizontal layout
 */
const FactorWhatIfSimulator = ({ factor, factorData, incidents }) => {
  // Get factor-specific data
  const analysisData = useMemo(() => {
    if (!factor || !incidents?.length) return null

    const hazardCounts = factorData?.byFactorHazard?.[factor.name] || {}
    const hazardsAffected = Object.entries(hazardCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    const totalWithFactor = factor.count || 0

    const hazardImpact = hazardsAffected.map(h => {
      const hazardTotal = incidents.filter(i =>
        i.location === h.name && NEGATIVE_TYPES.includes(i.type)
      ).length
      const percentage = hazardTotal > 0 ? Math.round((h.count / hazardTotal) * 100) : 0
      return { ...h, hazardTotal, percentage }
    })

    return {
      totalWithFactor,
      hazardsAffected: hazardImpact,
      factorCategory: factor.category || 'Unknown'
    }
  }, [factor, factorData, incidents])

  const [reductionTarget, setReductionTarget] = useState(0)
  const [showDetails, setShowDetails] = useState(false)

  // Calculate cross-hazard projections
  const projection = useMemo(() => {
    if (!analysisData || reductionTarget === 0) return null

    const hazardProjections = analysisData.hazardsAffected.map(h => {
      const reductionPct = (h.percentage * reductionTarget) / 100
      const incidentsReduced = Math.round((h.count * reductionTarget) / 100)
      return {
        hazard: h.name,
        currentCount: h.count,
        factorContribution: h.percentage,
        reductionPct: Math.round(reductionPct),
        incidentsReduced,
        projectedCount: h.count - incidentsReduced
      }
    })

    const totalReduced = hazardProjections.reduce((sum, h) => sum + h.incidentsReduced, 0)
    const hazardsImproved = hazardProjections.filter(h => h.incidentsReduced > 0).length
    const avgReduction = hazardsImproved > 0
      ? Math.round(hazardProjections.reduce((sum, h) => sum + h.reductionPct, 0) / hazardsImproved)
      : 0

    return { hazardProjections, totalReduced, hazardsImproved, avgReduction }
  }, [analysisData, reductionTarget])

  const handleReset = useCallback(() => {
    setReductionTarget(0)
  }, [])

  if (!analysisData || analysisData.totalWithFactor === 0) {
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

      {/* Slider Card */}
      <div className="bg-white rounded-xl border border-surface-200 p-4 shadow-sm">
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="p-2 rounded-lg bg-purple-100">
              <Target size={18} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-surface-700">Reduce "{factor.name}"</p>
              <p className="text-xs text-surface-400">{analysisData.totalWithFactor} occurrences across {analysisData.hazardsAffected.length} hazards</p>
            </div>
          </div>

          {/* Value Display */}
          <div className="ml-auto text-right">
            <div className="text-3xl font-bold text-purple-600">{reductionTarget}%</div>
            <p className="text-[10px] text-surface-400">reduction target</p>
          </div>
        </div>

        {/* Slider */}
        <div className="mb-2">
          <input
            type="range"
            min={0}
            max={75}
            step={5}
            value={reductionTarget}
            onChange={(e) => setReductionTarget(parseInt(e.target.value))}
            className="whatif-slider-lg"
          />
          <div className="flex justify-between text-[10px] text-surface-400 mt-1">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
          </div>
        </div>

        {/* Quick Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-surface-100">
          <span className="text-xs text-surface-500">Quick:</span>
          {[10, 25, 50, 75].map(val => (
            <button
              key={val}
              onClick={() => setReductionTarget(val)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                reductionTarget === val
                  ? 'bg-purple-500 text-white shadow-sm'
                  : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
              }`}
            >
              {val}%
            </button>
          ))}
          {reductionTarget > 0 && (
            <button
              onClick={handleReset}
              className="ml-auto flex items-center gap-1 px-2 py-1 text-xs text-surface-500 hover:text-surface-700 rounded-lg transition-colors"
            >
              <RefreshCw size={12} />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Impact Result */}
      <div className={`p-3 rounded-lg transition-all ${
        reductionTarget > 0 ? 'bg-emerald-50 border border-emerald-200' : 'bg-surface-50'
      }`}>
        {reductionTarget > 0 && projection ? (
          <div className="space-y-2">
            {/* Stats Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-xl font-bold text-emerald-600">-{projection.totalReduced}</p>
                  <p className="text-[9px] text-surface-500">incidents</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-emerald-600">{projection.hazardsImproved}</p>
                  <p className="text-[9px] text-surface-500">hazards improved</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-600">
                  <Zap size={12} />
                  <span>Multi-hazard impact</span>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="p-1.5 hover:bg-surface-100 rounded-lg transition-colors"
                title="Reset"
              >
                <RefreshCw size={14} className="text-surface-400" />
              </button>
            </div>

            {/* Top Affected Hazards */}
            <div className="flex flex-wrap gap-1.5">
              {projection.hazardProjections.slice(0, 5).map(h => (
                <span
                  key={h.hazard}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-lg text-[10px] border border-emerald-100"
                >
                  <span className="text-surface-600 truncate max-w-[100px]">{h.hazard}</span>
                  <span className="text-emerald-600 font-bold">-{h.incidentsReduced}</span>
                </span>
              ))}
              {projection.hazardProjections.length > 5 && (
                <span className="px-2 py-1 text-[10px] text-surface-400">
                  +{projection.hazardProjections.length - 5} more
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-xs text-surface-500">
              Move the slider to see projected impact across {analysisData.hazardsAffected.length} hazard categories
            </p>
          </div>
        )}
      </div>

      {/* Expandable Details */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-1 text-[10px] text-surface-400 hover:text-surface-600 transition-colors w-full justify-center"
      >
        <Info size={10} />
        <span>How it works</span>
        {showDetails ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
      </button>

      {showDetails && (
        <div className="text-[10px] text-surface-500 bg-surface-50 rounded-lg p-2">
          <p><span className="font-medium text-purple-600">Formula:</span> (Factor's % contribution to each hazard) × (your reduction %) = incidents prevented</p>
          <p className="mt-1 text-surface-400">
            This factor affects {analysisData.hazardsAffected.length} hazard categories with varying contribution levels.
          </p>
        </div>
      )}
    </div>
  )
}

export default React.memo(FactorWhatIfSimulator)
