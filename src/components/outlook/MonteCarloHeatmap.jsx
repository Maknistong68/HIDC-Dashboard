import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Flame, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'
import { computeHazardStats, runMonteCarloSimulation } from '../../utils/monteCarloEngine'

const MAX_HAZARDS = 8

/**
 * Interpolate color from green → amber → red based on probability (0-1)
 */
function getHeatColor(probability) {
  if (probability < 0.3) {
    // Green to light green
    const t = probability / 0.3
    const r = Math.round(34 + t * (200 - 34))
    const g = Math.round(197 + t * (220 - 197))
    const b = Math.round(94 + t * (40 - 94))
    return `rgb(${r},${g},${b})`
  }
  if (probability < 0.6) {
    // Amber range
    const t = (probability - 0.3) / 0.3
    const r = Math.round(200 + t * (245 - 200))
    const g = Math.round(220 + t * (158 - 220))
    const b = Math.round(40 + t * (11 - 40))
    return `rgb(${r},${g},${b})`
  }
  // Red range
  const t = Math.min(1, (probability - 0.6) / 0.4)
  const r = Math.round(245 + t * (220 - 245))
  const g = Math.round(158 * (1 - t) + 38 * t)
  const b = Math.round(11 + t * (38 - 11))
  return `rgb(${r},${g},${b})`
}

function getTextColor(probability) {
  return probability > 0.5 ? '#fff' : '#1f2937'
}

const MonteCarloHeatmap = ({ negativeIncidents, sortedHazards, period }) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const abortRef = useRef(false)
  const hasRun = useRef(false)

  const topHazards = useMemo(() => {
    if (!sortedHazards?.length) return []
    return sortedHazards.slice(0, MAX_HAZARDS).map(h => h.name)
  }, [sortedHazards])

  const runSimulation = useCallback(() => {
    if (!negativeIncidents?.length || !topHazards.length) return

    abortRef.current = false
    setIsRunning(true)
    setProgress(0)
    setResult(null)

    const stats = computeHazardStats(negativeIncidents, topHazards)

    runMonteCarloSimulation({
      hazardStats: stats,
      hazardNames: topHazards,
      weeks: 6,
      iterations: 500,
      chunkSize: 50,
      onProgress: setProgress,
      abortRef
    }).then(res => {
      if (res) setResult(res)
      setIsRunning(false)
    })
  }, [negativeIncidents, topHazards])

  // Auto-run on mount
  useEffect(() => {
    if (!hasRun.current && topHazards.length > 0 && negativeIncidents?.length > 0) {
      hasRun.current = true
      runSimulation()
    }
  }, [topHazards, negativeIncidents, runSimulation])

  // Abort on unmount
  useEffect(() => {
    return () => { abortRef.current = true }
  }, [])

  if (!topHazards.length) return null

  return (
    <div className="bg-white rounded-lg border border-surface-200 overflow-hidden">
      <button
        onClick={() => setIsExpanded(prev => !prev)}
        className="flex items-center justify-between w-full px-4 py-3 border-b border-surface-200 hover:bg-surface-50 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <Flame size={16} className="text-orange-500" />
          <h3 className="text-sm font-semibold text-surface-800">Monte Carlo Risk Heatmap</h3>
          <span className="text-2xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
            {result ? `${result.iterations} sims` : 'Probabilistic'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!isRunning && result && (
            <button
              onClick={(e) => { e.stopPropagation(); hasRun.current = false; runSimulation() }}
              className="p-1 hover:bg-surface-100 rounded transition-colors"
              title="Re-run simulation"
            >
              <RefreshCw size={14} className="text-surface-400" />
            </button>
          )}
          {isExpanded ? <ChevronUp size={14} className="text-surface-400" /> : <ChevronDown size={14} className="text-surface-400" />}
        </div>
      </button>

      {isExpanded && (
        <div className="p-4">
          {/* Progress bar */}
          {isRunning && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-2xs text-surface-500 mb-1">
                <span>Running simulation...</span>
                <span>{Math.round(progress * 100)}%</span>
              </div>
              <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all duration-200"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Heatmap Grid */}
          {result && (
            <>
              <div className="overflow-x-auto">
                <div className="min-w-[500px]">
                  {/* Header row */}
                  <div className="grid gap-1 mb-1" style={{ gridTemplateColumns: `140px repeat(${result.weeks.length}, 1fr)` }}>
                    <div className="text-2xs font-medium text-surface-400 px-1">Hazard</div>
                    {result.weeks.map(w => (
                      <div key={w} className="text-2xs font-medium text-surface-400 text-center">{w}</div>
                    ))}
                  </div>

                  {/* Data rows */}
                  {result.hazards.map((hazard, hIdx) => (
                    <div
                      key={hazard}
                      className="grid gap-1 mb-1"
                      style={{ gridTemplateColumns: `140px repeat(${result.weeks.length}, 1fr)` }}
                    >
                      <div className="text-2xs font-medium text-surface-700 px-1 truncate flex items-center" title={hazard}>
                        {hazard}
                      </div>
                      {result.cells[hIdx].map((cell, wIdx) => (
                        <div
                          key={`${hIdx}-${wIdx}`}
                          className="rounded px-1.5 py-1.5 text-center text-2xs font-semibold cursor-default transition-transform hover:scale-105"
                          style={{
                            backgroundColor: getHeatColor(cell.probability),
                            color: getTextColor(cell.probability)
                          }}
                          title={`${hazard} ${result.weeks[wIdx]}: ${(cell.probability * 100).toFixed(0)}% chance of ≥${cell.threshold} incidents\nAvg: ${cell.avg} | P95: ${cell.p95}`}
                        >
                          {(cell.probability * 100).toFixed(0)}%
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-100">
                <div className="flex items-center gap-2 text-2xs text-surface-400">
                  <span>Exceedance probability:</span>
                  <div className="flex items-center gap-0.5">
                    {[0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9].map(p => (
                      <div
                        key={p}
                        className="w-4 h-3 rounded-sm"
                        style={{ backgroundColor: getHeatColor(p) }}
                      />
                    ))}
                  </div>
                  <span>Low → High</span>
                </div>
                <span className="text-2xs text-surface-400">
                  Threshold: 1.5× historical weekly avg
                </span>
              </div>
            </>
          )}

          {!isRunning && !result && (
            <div className="text-center py-6 text-sm text-surface-400">
              <p>Insufficient data to run simulation.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default React.memo(MonteCarloHeatmap)
