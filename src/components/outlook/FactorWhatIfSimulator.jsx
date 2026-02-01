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

// Custom slider styles - same as HazardWhatIfSimulator
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
  .whatif-slider.purple {
    background: linear-gradient(to right, #f3e8ff, #a855f7);
  }
  .whatif-slider.purple::-webkit-slider-thumb {
    background: #9333ea;
  }
  .whatif-slider.purple::-moz-range-thumb {
    background: #9333ea;
  }
`

/**
 * FactorWhatIfSimulator - Compact simulation for a selected contributing factor
 * UI matches HazardWhatIfSimulator style
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

  const hasChanges = reductionTarget > 0

  return (
    <div className="space-y-3">
      {/* Inject slider styles */}
      <style>{sliderStyles}</style>

      {/* Slider Card - matches Hazard style */}
      <div className="bg-white rounded-xl border border-surface-200 p-3 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-100">
              <Target size={14} className="text-purple-600" />
            </div>
            <div>
              <span className="text-xs font-semibold text-surface-700">Reduce Factor</span>
              <p className="text-[10px] text-surface-400">{analysisData.totalWithFactor} occurrences</p>
            </div>
          </div>
          <span className="text-lg font-bold text-purple-600">{reductionTarget}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={75}
          step={5}
          value={reductionTarget}
          onChange={(e) => setReductionTarget(parseInt(e.target.value))}
          className="whatif-slider purple"
        />
        <div className="flex justify-between text-[10px] text-surface-400 mt-1">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
        </div>
      </div>

      {/* Impact Result Bar - matches Hazard style */}
      <div className={`flex items-center gap-3 p-2.5 rounded-lg transition-all ${
        hasChanges ? 'bg-emerald-50 border border-emerald-200' : 'bg-surface-50'
      }`}>
        {hasChanges && projection ? (
          <>
            {/* Progress Bar */}
            <div className="flex-1">
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="text-surface-500">Multi-hazard Impact</span>
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  <Zap size={10} />
                  {projection.hazardsImproved} hazards improved
                </span>
              </div>
              <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (projection.totalReduced / analysisData.totalWithFactor) * 100)}%` }}
                />
              </div>
              {/* Affected Hazards Pills */}
              <div className="flex flex-wrap gap-1 mt-2">
                {projection.hazardProjections.slice(0, 4).map(h => (
                  <span
                    key={h.hazard}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-white rounded text-[9px] border border-emerald-100"
                  >
                    <span className="text-surface-600 truncate max-w-[60px]">{h.hazard}</span>
                    <span className="text-emerald-600 font-bold">-{h.incidentsReduced}</span>
                  </span>
                ))}
                {projection.hazardProjections.length > 4 && (
                  <span className="px-1.5 py-0.5 text-[9px] text-surface-400">
                    +{projection.hazardProjections.length - 4} more
                  </span>
                )}
              </div>
            </div>

            {/* Result Badge */}
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-center">
                <div className="flex items-center gap-1">
                  <TrendingDown size={14} />
                  <span className="text-base font-bold">-{projection.totalReduced}</span>
                </div>
                <p className="text-[9px] opacity-90">incidents</p>
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
              Adjust slider to simulate factor reduction
            </p>
            <p className="text-[10px] text-surface-400">
              Affects {analysisData.hazardsAffected.length} hazard categories
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
        <div className="text-[10px] text-surface-500 bg-surface-50 rounded-lg p-2">
          <p><span className="font-medium text-purple-600">Formula:</span> (Factor's % contribution to each hazard) × (your reduction %)</p>
          <p className="mt-1 text-surface-400">
            This factor affects {analysisData.hazardsAffected.length} hazard categories with varying contribution levels.
          </p>
        </div>
      )}
    </div>
  )
}

export default React.memo(FactorWhatIfSimulator)
