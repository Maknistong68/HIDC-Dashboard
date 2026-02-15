import React, { useState, useEffect, useRef, useMemo, useCallback, startTransition } from 'react'
import { AlertTriangle } from 'lucide-react'
import { calculateEntityRiskRanking } from '../../utils/insightsCalculations'
import { DEFAULT_THRESHOLDS } from '../../utils/signalConstants'
import EntityRiskList from './EntityRiskList'
import EntityDetailPanel from './EntityDetailPanel'

const WEIGHTS_STORAGE_KEY = 'hse_risk_weights'
const THRESHOLDS_STORAGE_KEY = 'hse_signal_thresholds'

const DEFAULT_ENTITY_WEIGHTS = { severityMix: 25, trend: 20, openActionRate: 20, highRiskExposure: 15, nearMissRate: 10, positiveRate: 10 }

const DIMENSION_LABELS = { contractor: 'Contractor', site: 'Site', subregion: 'SubRegion' }

const loadWeights = () => {
  try {
    const saved = localStorage.getItem(WEIGHTS_STORAGE_KEY)
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

const loadThresholds = () => {
  try {
    const saved = localStorage.getItem(THRESHOLDS_STORAGE_KEY)
    if (saved) {
      return { ...DEFAULT_THRESHOLDS, ...JSON.parse(saved) }
    }
  } catch { /* ignore */ }
  return { ...DEFAULT_THRESHOLDS }
}

/**
 * RiskPerformanceTab - Tab 3: Master-detail layout matching Hazards tab
 * Weight editor moved to floating AdjustWeightsPanel
 */
const RiskPerformanceTab = ({ filteredIncidents, siteClassifications }) => {
  const [dimension, setDimension] = useState('contractor')
  const [selectedEntity, setSelectedEntity] = useState(null)
  const [entityWeights, setEntityWeights] = useState(() => loadWeights().entity)
  const [presetProfile, setPresetProfile] = useState(() => loadWeights().preset)
  const [thresholds, setThresholds] = useState(() => loadThresholds())

  // Debounced weights for expensive ranking computation (300ms delay)
  const [debouncedWeights, setDebouncedWeights] = useState(() => loadWeights().entity)
  const weightsTimerRef = useRef(null)

  useEffect(() => {
    weightsTimerRef.current = setTimeout(() => {
      setDebouncedWeights(entityWeights)
    }, 300)
    return () => clearTimeout(weightsTimerRef.current)
  }, [entityWeights])

  // Persist weights (debounced 500ms to avoid writes every drag frame)
  const persistTimerRef = useRef(null)
  useEffect(() => {
    persistTimerRef.current = setTimeout(() => {
      localStorage.setItem(WEIGHTS_STORAGE_KEY, JSON.stringify({
        entity: entityWeights,
        preset: presetProfile
      }))
    }, 500)
    return () => clearTimeout(persistTimerRef.current)
  }, [entityWeights, presetProfile])

  // Persist thresholds (debounced 500ms)
  const thresholdTimerRef = useRef(null)
  useEffect(() => {
    thresholdTimerRef.current = setTimeout(() => {
      localStorage.setItem(THRESHOLDS_STORAGE_KEY, JSON.stringify(thresholds))
    }, 500)
    return () => clearTimeout(thresholdTimerRef.current)
  }, [thresholds])

  // Handler for updating individual threshold
  const updateThreshold = useCallback((signalKey, value) => {
    setThresholds(prev => ({ ...prev, [signalKey]: value }))
  }, [])

  // Calculate rankings using debounced weights (avoids recalc every drag frame)
  const rankings = useMemo(() => {
    if (!filteredIncidents?.length) return []
    return calculateEntityRiskRanking(filteredIncidents, dimension, siteClassifications, debouncedWeights)
  }, [filteredIncidents, dimension, siteClassifications, debouncedWeights])

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
    <div className="flex flex-col gap-3 animate-fade-in">
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

        {/* Right: Risk summary */}
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
      </div>

      {/* Master-detail panels */}
      <div className="flex gap-3 h-[calc(100vh-300px)] min-h-[400px]">
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
        <div className="flex-1 min-w-0 h-full">
          <EntityDetailPanel
            entity={selectedEntity}
            incidents={entityIncidents}
            dimension={DIMENSION_LABELS[dimension]}
            totalIncidents={filteredIncidents.length}
            rankings={rankings}
            thresholds={thresholds}
            onThresholdChange={updateThreshold}
            entityWeights={entityWeights}
            setEntityWeights={setEntityWeights}
            presetProfile={presetProfile}
            setPresetProfile={setPresetProfile}
          />
        </div>
      </div>

    </div>
  )
}

export default React.memo(RiskPerformanceTab)
