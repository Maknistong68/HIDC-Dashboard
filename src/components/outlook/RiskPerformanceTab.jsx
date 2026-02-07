import React, { useState, useEffect, useMemo, useCallback, startTransition } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { calculateEntityRiskRanking } from '../../utils/insightsCalculations'
import EntityRiskList from './EntityRiskList'
import EntityDetailPanel from './EntityDetailPanel'

const STORAGE_KEY = 'hse_risk_weights'

const DEFAULT_ENTITY_WEIGHTS = { severityMix: 25, trend: 20, openActionRate: 20, highRiskExposure: 15, nearMissRate: 10, positiveRate: 10 }

const DIMENSION_LABELS = { contractor: 'Contractor', site: 'Site', subregion: 'SubRegion' }

const PRESETS = {
  balanced: { severityMix: 25, trend: 20, openActionRate: 20, highRiskExposure: 15, nearMissRate: 10, positiveRate: 10 },
  operations: { severityMix: 30, trend: 25, openActionRate: 20, highRiskExposure: 15, nearMissRate: 5, positiveRate: 5 },
  culture: { severityMix: 15, trend: 15, openActionRate: 15, highRiskExposure: 10, nearMissRate: 20, positiveRate: 25 },
  compliance: { severityMix: 20, trend: 15, openActionRate: 30, highRiskExposure: 20, nearMissRate: 10, positiveRate: 5 }
}

const sliderStyles = `
  .unified-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 8px;
    border-radius: 4px;
    outline: none;
    cursor: pointer;
    margin: 0;
    padding: 0;
  }
  .unified-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 1px 4px rgba(0,0,0,0.25);
    margin-top: -4px;
  }
  .unified-slider::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 1px 4px rgba(0,0,0,0.25);
  }
  .unified-slider.risk-weight {
    background: linear-gradient(to right, #e2e8f0 0%, #94a3b8 50%, #64748b 100%);
  }
  .unified-slider.risk-weight::-webkit-slider-thumb { background: #475569; }
  .unified-slider.risk-weight::-moz-range-thumb { background: #475569; }
`

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

const loadWeights = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return {
        entity: parsed.entity || DEFAULT_ENTITY_WEIGHTS,
        preset: parsed.preset || 'balanced'
      }
    }
  } catch { /* ignore */ }
  return { entity: DEFAULT_ENTITY_WEIGHTS, preset: 'balanced' }
}

/**
 * RiskPerformanceTab - Tab 3: Master-detail layout matching Hazards tab
 */
const RiskPerformanceTab = ({ filteredIncidents, siteClassifications }) => {
  const [dimension, setDimension] = useState('contractor')
  const [selectedEntity, setSelectedEntity] = useState(null)
  const [entityWeights, setEntityWeights] = useState(() => loadWeights().entity)
  const [presetProfile, setPresetProfile] = useState(() => loadWeights().preset)
  const [showEditor, setShowEditor] = useState(false)

  // Persist weights
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      entity: entityWeights,
      preset: presetProfile
    }))
  }, [entityWeights, presetProfile])

  // Calculate rankings
  const rankings = useMemo(() => {
    if (!filteredIncidents?.length) return []
    return calculateEntityRiskRanking(filteredIncidents, dimension, siteClassifications, entityWeights)
  }, [filteredIncidents, dimension, siteClassifications, entityWeights])

  // Risk summary counts
  const riskSummary = useMemo(() => {
    const s = { high: 0, moderate: 0, low: 0 }
    rankings.forEach(r => {
      if (r.riskLevel === 'High') s.high++
      else if (r.riskLevel === 'Moderate') s.moderate++
      else s.low++
    })
    return s
  }, [rankings])

  // Filter incidents for selected entity
  const entityIncidents = useMemo(() => {
    if (!selectedEntity || !filteredIncidents?.length) return []
    return filteredIncidents.filter(i => {
      switch (dimension) {
        case 'site': return i.site === selectedEntity.name
        case 'subregion': return (siteClassifications[i.site] || 'Unclassified') === selectedEntity.name
        default: return i.contractor === selectedEntity.name
      }
    })
  }, [filteredIncidents, selectedEntity, dimension, siteClassifications])

  // Auto-select first entity when rankings change
  useEffect(() => {
    if (rankings.length === 0) {
      if (selectedEntity) setSelectedEntity(null)
      return
    }
    if (!selectedEntity) {
      startTransition(() => { setSelectedEntity(rankings[0]) })
      return
    }
    const stillExists = rankings.some(r => r.name === selectedEntity.name)
    if (!stillExists) {
      startTransition(() => { setSelectedEntity(rankings[0]) })
    }
  }, [rankings, selectedEntity])

  const handleEntitySelect = useCallback((entity) => {
    startTransition(() => { setSelectedEntity(entity) })
  }, [])

  const handleDimensionChange = useCallback((dim) => {
    startTransition(() => {
      setDimension(dim)
      setSelectedEntity(null)
    })
  }, [])

  const handlePresetChange = useCallback((key) => {
    const preset = PRESETS[key]
    if (preset) {
      setEntityWeights(preset)
      setPresetProfile(key)
    }
  }, [])

  const handleSliderChange = useCallback((key, value) => {
    const newWeights = normalizeWeights(key, value, entityWeights)
    setEntityWeights(newWeights)
    setPresetProfile('custom')
  }, [entityWeights])

  if (!filteredIncidents?.length) {
    return (
      <div className="bg-white rounded-lg border border-surface-100 p-6 text-center">
        <p className="text-sm text-surface-500">No data available for risk & performance analysis.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 flex-1 flex flex-col">
      {/* Sub-tab row: dimension tabs + summary + Adjust */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          {Object.entries(DIMENSION_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => handleDimensionChange(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                dimension === key
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-surface-600 hover:bg-surface-100'
              }`}
            >
              {label}
              {dimension === key && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary-200 text-primary-800">
                  {rankings.length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Risk summary */}
          <div className="flex items-center gap-3 text-xs">
            <span className="text-surface-500">
              <span className="font-medium text-red-500">{riskSummary.high}</span> High
            </span>
            <span className="text-surface-300">&middot;</span>
            <span className="text-surface-500">
              <span className="font-medium text-amber-500">{riskSummary.moderate}</span> Moderate
            </span>
            <span className="text-surface-300">&middot;</span>
            <span className="text-surface-500">
              <span className="font-medium text-green-500">{riskSummary.low}</span> Low
            </span>
          </div>

          {/* Adjust button */}
          <button
            onClick={() => setShowEditor(e => !e)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              showEditor
                ? 'bg-primary-100 text-primary-700'
                : 'text-surface-500 hover:text-surface-700 hover:bg-surface-100'
            }`}
          >
            <SlidersHorizontal size={13} />
            Adjust
          </button>
        </div>
      </div>

      {/* Master-detail panels */}
      <div className="flex gap-3 flex-1 min-h-[320px] max-h-[calc(100vh-310px)] animate-fade-in">
        {/* Left: Entity List */}
        <div className="w-72 flex-shrink-0 bg-surface-50 rounded-lg border border-surface-200 p-3 sm:p-4 flex flex-col transition-all duration-200">
          <div className="flex items-center justify-between mb-1 flex-shrink-0">
            <h2 className="text-sm font-semibold text-surface-800">Entities</h2>
            <span className="text-xs bg-surface-200 text-surface-600 px-1.5 py-0.5 rounded-full">{rankings.length}</span>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <EntityRiskList
              rankings={rankings}
              selected={selectedEntity}
              onSelect={handleEntitySelect}
            />
          </div>
        </div>

        {/* Right: Detail Panel (with inline weight editor when open) */}
        <div className="flex-1 min-w-0 transition-all duration-200">
          <style>{sliderStyles}</style>
          <EntityDetailPanel
            entity={selectedEntity}
            incidents={entityIncidents}
            dimension={DIMENSION_LABELS[dimension]}
            totalIncidents={filteredIncidents.length}
            showEditor={showEditor}
            entityWeights={entityWeights}
            presetProfile={presetProfile}
            onPresetChange={handlePresetChange}
            onSliderChange={handleSliderChange}
          />
        </div>
      </div>
    </div>
  )
}

export default React.memo(RiskPerformanceTab)
