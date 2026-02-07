import React, { useMemo, useState, useCallback } from 'react'
import { SlidersHorizontal, AlertTriangle, Info } from 'lucide-react'
import { calculateEntityRiskRanking } from '../../utils/insightsCalculations'

const DIMENSION_LABELS = { contractor: 'Contractor', site: 'Site', subregion: 'SubRegion' }

const SIGNAL_LABELS = {
  severityMix: 'Severity Mix',
  trend: 'Trend (30d)',
  openActionRate: 'Open Actions',
  highRiskExposure: 'High-Risk Exposure',
  nearMissRate: 'Near-Miss Rate',
  positiveRate: 'Positive Rate'
}

const PRESET_LABELS = {
  balanced: 'Balanced',
  operations: 'Operations',
  culture: 'Culture',
  compliance: 'Compliance'
}

const normalizeWeights = (key, newValue, weights) => {
  const oldValue = weights[key]
  const delta = newValue - oldValue
  if (delta === 0) return weights

  const otherKeys = Object.keys(weights).filter(k => k !== key)
  const otherSum = otherKeys.reduce((s, k) => s + weights[k], 0)
  const updated = { ...weights, [key]: newValue }

  if (otherSum > 0) {
    otherKeys.forEach(k => {
      const proportion = weights[k] / otherSum
      updated[k] = Math.max(5, Math.round(weights[k] - delta * proportion))
    })
  } else {
    const each = Math.round((100 - newValue) / otherKeys.length)
    otherKeys.forEach(k => { updated[k] = Math.max(5, each) })
  }

  const sum = Object.values(updated).reduce((s, v) => s + v, 0)
  if (sum !== 100) {
    const largest = otherKeys.sort((a, b) => updated[b] - updated[a])[0]
    updated[largest] += (100 - sum)
  }
  return updated
}

const getRiskColor = (level) => {
  if (level === 'High') return { bg: 'bg-red-100', text: 'text-red-700', bar: 'bg-red-500', dot: 'bg-red-500' }
  if (level === 'Moderate') return { bg: 'bg-amber-100', text: 'text-amber-700', bar: 'bg-amber-500', dot: 'bg-amber-500' }
  return { bg: 'bg-green-100', text: 'text-green-700', bar: 'bg-green-500', dot: 'bg-green-500' }
}

const EntityRiskRanking = ({
  filteredIncidents,
  siteClassifications,
  entityWeights,
  onEntityWeightsChange,
  presetProfile,
  onPresetChange
}) => {
  const [dimension, setDimension] = useState('contractor')
  const [showEditor, setShowEditor] = useState(false)
  const [hoveredIdx, setHoveredIdx] = useState(null)

  const rankings = useMemo(() => {
    if (!filteredIncidents?.length) return []
    return calculateEntityRiskRanking(filteredIncidents, dimension, siteClassifications, entityWeights)
  }, [filteredIncidents, dimension, siteClassifications, entityWeights])

  const handleSliderChange = useCallback((key, value) => {
    const newWeights = normalizeWeights(key, value, entityWeights)
    onEntityWeightsChange(newWeights)
  }, [entityWeights, onEntityWeightsChange])

  if (!filteredIncidents?.length) {
    return (
      <div className="bg-white rounded-lg border border-surface-200 p-4 text-center text-sm text-surface-500">
        No data available for entity risk ranking.
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-surface-200 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle size={15} className="text-amber-500" />
          <h3 className="text-sm font-semibold text-surface-800">Entity Risk Ranking</h3>
          <button
            onClick={() => setShowEditor(e => !e)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-medium transition-all ${
              showEditor
                ? 'bg-primary-100 text-primary-700'
                : 'text-surface-400 hover:text-surface-600 hover:bg-surface-50'
            }`}
          >
            <SlidersHorizontal size={11} />
            Adjust
          </button>
        </div>
        <span className="text-2xs text-surface-400">{rankings.length} entities</span>
      </div>

      {/* Weight Editor (collapsible) */}
      {showEditor && (
        <div className="bg-surface-50 rounded-lg p-3 space-y-2.5 border border-surface-100">
          {/* Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-2xs text-surface-400 font-medium mr-1">Preset:</span>
            {Object.keys(PRESET_LABELS).map(key => (
              <button
                key={key}
                onClick={() => onPresetChange(key)}
                className={`px-2.5 py-1 rounded-full text-2xs font-medium transition-all ${
                  presetProfile === key
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                }`}
              >
                {PRESET_LABELS[key]}
              </button>
            ))}
            {presetProfile === 'custom' && (
              <span className="px-2.5 py-1 rounded-full text-2xs font-medium bg-amber-100 text-amber-700">
                Custom
              </span>
            )}
          </div>

          {/* Sliders — 2-column grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {Object.entries(SIGNAL_LABELS).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-2xs text-surface-600 w-24 truncate">{label}</span>
                <input
                  type="range"
                  min={5}
                  max={50}
                  value={entityWeights[key]}
                  onChange={(e) => handleSliderChange(key, parseInt(e.target.value))}
                  className="unified-slider admin flex-1 h-1.5"
                />
                <span className="text-2xs text-surface-500 font-mono w-7 text-right">{entityWeights[key]}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dimension Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {Object.entries(DIMENSION_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setDimension(key)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                dimension === key
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Ranked List */}
      <div className="max-h-[400px] overflow-y-auto space-y-1 pr-1">
        {rankings.map((entity, idx) => {
          const colors = getRiskColor(entity.riskLevel)
          return (
            <div
              key={entity.name}
              className="relative flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-surface-50 transition-colors group"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Rank */}
              <span className="text-xs font-semibold text-surface-400 w-5 text-right shrink-0">
                {entity.rank}
              </span>

              {/* Name */}
              <span className="text-xs font-medium text-surface-700 w-32 truncate shrink-0" title={entity.name}>
                {entity.name}
              </span>

              {/* Score bar */}
              <div className="flex-1 h-3 bg-surface-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
                  style={{ width: `${Math.max(2, entity.score)}%` }}
                />
              </div>

              {/* Score */}
              <span className="text-xs font-bold text-surface-700 w-7 text-right shrink-0">
                {entity.score}
              </span>

              {/* Risk badge */}
              <span className={`px-1.5 py-0.5 rounded text-2xs font-semibold shrink-0 ${colors.bg} ${colors.text}`}>
                {entity.riskLevel}
              </span>

              {/* Low confidence indicator */}
              {entity.lowConfidence && (
                <span title="Low confidence — fewer than 5 incidents">
                  <Info size={12} className="text-surface-400 shrink-0" />
                </span>
              )}

              {/* Tooltip on hover — signal breakdown */}
              {hoveredIdx === idx && (
                <div className="absolute left-0 top-full mt-1 z-20 bg-surface-800 text-white rounded-lg shadow-lg p-3 min-w-[240px] text-2xs space-y-1.5">
                  <div className="font-semibold text-xs mb-1">{entity.name} — Signal Breakdown</div>
                  {Object.entries(entity.signals).map(([key, sig]) => (
                    <div key={key} className="flex items-center justify-between gap-3">
                      <span className="text-surface-300">{SIGNAL_LABELS[key]}</span>
                      <span>
                        <span className="font-mono font-bold">{sig.score}</span>
                        <span className="text-surface-400 ml-1.5">{sig.detail}</span>
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-surface-600 pt-1 mt-1 text-surface-400">
                    {entity.incidentCount} incidents{entity.lowConfidence ? ' (low confidence)' : ''}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {rankings.length === 0 && (
          <div className="text-center text-xs text-surface-400 py-6">No entities found for this dimension.</div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 pt-2 border-t border-surface-100">
        {[
          { level: 'High', label: 'High (>60)' },
          { level: 'Moderate', label: 'Moderate (31-60)' },
          { level: 'Low', label: 'Low (\u226430)' }
        ].map(({ level, label }) => {
          const c = getRiskColor(level)
          return (
            <div key={level} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${c.dot}`} />
              <span className="text-2xs text-surface-500">{label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default React.memo(EntityRiskRanking)
