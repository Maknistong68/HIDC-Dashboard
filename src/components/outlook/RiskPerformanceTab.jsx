import React, { useState, useEffect, useMemo, useCallback, startTransition } from 'react'
import { SlidersHorizontal, AlertTriangle, Info, ChevronRight } from 'lucide-react'
import { calculateEntityRiskRanking } from '../../utils/insightsCalculations'
import EntityRiskList from './EntityRiskList'
import EntityDetailPanel from './EntityDetailPanel'

const STORAGE_KEY = 'hse_risk_weights'

const DEFAULT_ENTITY_WEIGHTS = { severityMix: 25, trend: 20, openActionRate: 20, highRiskExposure: 15, nearMissRate: 10, positiveRate: 10 }

const DIMENSION_LABELS = { contractor: 'Contractor', site: 'Site', subregion: 'SubRegion' }

const SIGNAL_LABELS = {
  severityMix: 'Injury Severity',
  trend: 'Trend (30d)',
  openActionRate: 'Open Actions',
  highRiskExposure: 'High-Risk Exp.',
  nearMissRate: 'Near-Miss Rate',
  positiveRate: 'Positive Rate'
}

const PRESET_LABELS = {
  balanced: 'Balanced',
  operations: 'Operations',
  culture: 'Culture',
  compliance: 'Compliance'
}

const SIGNAL_HINTS = {
  severityMix:      { inverted: false },
  trend:            { inverted: false },
  openActionRate:   { inverted: false },
  highRiskExposure: { inverted: false },
  nearMissRate:     { inverted: true },
  positiveRate:     { inverted: true }
}

const SIGNAL_RANGES = {
  severityMix:      { min: 5, max: 35 },
  trend:            { min: 5, max: 30 },
  openActionRate:   { min: 5, max: 35 },
  highRiskExposure: { min: 5, max: 25 },
  nearMissRate:     { min: 5, max: 10 },
  positiveRate:     { min: 5, max: 20 },
}

const PRESETS = {
  balanced: { severityMix: 25, trend: 20, openActionRate: 20, highRiskExposure: 15, nearMissRate: 10, positiveRate: 10 },
  operations: { severityMix: 30, trend: 25, openActionRate: 20, highRiskExposure: 15, nearMissRate: 5, positiveRate: 5 },
  culture: { severityMix: 20, trend: 20, openActionRate: 20, highRiskExposure: 10, nearMissRate: 10, positiveRate: 20 },
  compliance: { severityMix: 20, trend: 15, openActionRate: 30, highRiskExposure: 20, nearMissRate: 10, positiveRate: 5 }
}

// Slider styles now in global index.css (.unified-slider)

/**
 * Update a single weight independently (no redistribution).
 * Each slider controls its own value within min/max range.
 */
const updateWeight = (key, newValue, weights) => {
  const { min, max } = SIGNAL_RANGES[key] || { min: 5, max: 50 }
  const clamped = Math.min(max, Math.max(min, newValue))
  return { ...weights, [key]: clamped }
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

  // Top attention entity
  const topAttention = useMemo(() => {
    if (!rankings.length) return null
    const top = rankings[0]
    if (top.score <= 30) return null
    let topConcern = null
    if (top.signals) {
      const sorted = Object.entries(top.signals)
        .filter(([, v]) => v && typeof v.score === 'number')
        .sort((a, b) => b[1].score - a[1].score)
      if (sorted.length > 0) {
        const [key, val] = sorted[0]
        topConcern = { label: SIGNAL_LABELS[key] || key, score: val.score }
      }
    }
    return { name: top.name, score: top.score, topConcern }
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
    const newWeights = updateWeight(key, value, entityWeights)
    setEntityWeights(newWeights)
    setPresetProfile('custom')
  }, [entityWeights])

  if (!filteredIncidents?.length) {
    return (
      <div className="bg-white rounded-lg border border-surface-100 p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center mx-auto mb-3">
          <AlertTriangle size={24} className="text-surface-400" />
        </div>
        <h2 className="text-base font-semibold text-surface-800 mb-1">No Risk Data</h2>
        <p className="text-xs text-surface-500">No data available for risk & performance analysis.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 flex-1 animate-fade-in">
      {/* Sub-tab row: dimension tabs + summary + Adjust */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          {Object.entries(DIMENSION_LABELS).map(([key, label]) => (
            <button
              key={key}
              role="tab"
              aria-selected={dimension === key}
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
            aria-expanded={showEditor}
            aria-controls="risk-weight-editor"
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

      {/* Weight editor (full-width, collapsible) */}
      {showEditor && (
        <div id="risk-weight-editor" className="bg-surface-50 rounded-lg border border-surface-100 px-4 py-3 space-y-2.5 animate-fade-in">
          {/* Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-2xs text-surface-400 font-medium">Preset:</span>
            {Object.entries(PRESET_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => handlePresetChange(key)}
                className={`px-2 py-0.5 rounded-full text-2xs font-medium transition-all ${
                  presetProfile === key
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                }`}
              >
                {label}
              </button>
            ))}
            {presetProfile === 'custom' && (
              <span className="px-2 py-0.5 rounded-full text-2xs font-medium bg-amber-100 text-amber-700">Custom</span>
            )}
          </div>

          {/* Sliders — 3 columns at full width */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1.5">
            {Object.entries(SIGNAL_LABELS).map(([key, label]) => {
              const hint = SIGNAL_HINTS[key]
              const range = SIGNAL_RANGES[key] || { min: 5, max: 50 }
              return (
                <div key={key} className="flex items-center gap-2">
                  <span className={`text-2xs w-24 truncate flex-shrink-0 ${
                    hint?.inverted ? 'text-amber-600 font-medium' : 'text-surface-600'
                  }`}>
                    {hint?.inverted && <AlertTriangle size={9} className="inline mr-0.5 -mt-px" />}
                    {label}
                  </span>
                  <input
                    type="range"
                    min={range.min}
                    max={range.max}
                    value={entityWeights[key]}
                    onChange={(e) => handleSliderChange(key, parseInt(e.target.value))}
                    aria-label={`${label} weight: ${entityWeights[key]}%`}
                    className="unified-slider risk-weight flex-1 h-1.5"
                  />
                  <span className="text-2xs text-surface-500 font-mono w-7 text-right" aria-live="polite">{entityWeights[key]}%</span>
                </div>
              )
            })}
          </div>

          {/* Info */}
          <div className="flex items-center gap-1.5">
            <Info size={10} className="text-blue-400 flex-shrink-0" />
            <p className="text-2xs text-blue-600">
              Weights set scoring priorities, not safety importance. Inverted signals score higher when reporting is low.
            </p>
          </div>
        </div>
      )}

      {/* Top attention banner */}
      {topAttention && (
        <button
          onClick={() => {
            const match = rankings.find(r => r.name === topAttention.name)
            if (match) handleEntitySelect(match)
          }}
          className="w-full flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-left hover:bg-red-100 transition-colors group"
        >
          <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-red-800">
              Needs attention: {topAttention.name}
              <span className="ml-2 text-red-600 font-bold">Score {topAttention.score}/100</span>
            </p>
            {topAttention.topConcern && (
              <p className="text-xs text-red-600">
                Top concern: {topAttention.topConcern.label} ({topAttention.topConcern.score}/100)
              </p>
            )}
          </div>
          <ChevronRight size={16} className="text-red-400 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}

      {/* Master-detail panels */}
      <div className="flex gap-3 flex-1 min-h-[320px] max-h-[calc(100vh-310px)]">
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

        {/* Right: Detail Panel */}
        <div className="flex-1 min-w-0">
          <EntityDetailPanel
            entity={selectedEntity}
            incidents={entityIncidents}
            dimension={DIMENSION_LABELS[dimension]}
            totalIncidents={filteredIncidents.length}
            rankings={rankings}
          />
        </div>
      </div>
    </div>
  )
}

export default React.memo(RiskPerformanceTab)
