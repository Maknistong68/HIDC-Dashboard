import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  MapPin,
  Sliders,
  Settings,
  Shield,
  HardHat,
  RotateCcw,
  Calendar,
  X,
  Info,
  CheckCircle,
  User,
  AlertCircle,
} from 'lucide-react'
import { QUICK_ACTION_PRESETS, ENV_SUB_TYPES, DMG_SUB_TYPES } from '../../utils/constants'
import { getDayOfWeekPatterns, getHourlyPatterns } from '../../utils/insightsCalculations'
import {
  CONTROL_HIERARCHY,
  generateContextualSliders,
  calculateProjectedChange,
  calculateFactorPrevalence,
  calculateActionClosureEffect,
  applyQuickActionPreset,
} from '../insights/ScenarioSimulatorEngine'
import { SEVERITY_WEIGHTS } from '../../utils/calculations'
import { isOpenAction } from '../../utils/incidentHelpers'
import {
  plotHazardsOnMatrix,
  getCellRiskColor,
  getScoreColor,
  getScoreLabel,
  getRiskZone,
  CONSEQUENCE_LABELS,
  LIKELIHOOD_LABELS,
} from '../../utils/riskMatrix'

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const TrendIndicator = ({ trend, size = 12 }) => {
  const level = trend?.level
  if (level === 'significant-rise' || level === 'rising') {
    return <TrendingUp size={size} className="text-red-600" strokeWidth={2.5} />
  }
  if (level === 'declining' || level === 'significant-decline') {
    return <TrendingDown size={size} className="text-green-600" strokeWidth={2.5} />
  }
  return <Minus size={size} className="text-surface-400" strokeWidth={2} />
}

// ============================================================================
// MODAL DETAIL COMPONENTS
// ============================================================================

const FactorSlider = React.memo(({ slider, value, onChange }) => {
  const normalizedValue = ((value + 50) / 150) * 100
  const sources = slider.sources || {}

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-sm font-medium text-surface-700 truncate">{slider.label}</span>
          {/* Relevance badges */}
          {sources.expert && (
            <span className="flex-shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200" title={sources.expertAction || 'Expert recommended'}>
              Expert
            </span>
          )}
          {sources.temporal && (
            <span className="flex-shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200" title={sources.peakDays ? `Peak: ${sources.peakDays.join(', ')}` : 'Peak time correlation'}>
              Peak Time
            </span>
          )}
          {!sources.expert && sources.data && (
            <span className="flex-shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200" title="Detected in incident data">
              Data
            </span>
          )}
        </div>
        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded flex-shrink-0 ${
          value > 0 ? 'bg-green-100 text-green-700' : value < 0 ? 'bg-red-100 text-red-700' : 'text-surface-500'
        }`}>
          {value > 0 ? '+' : ''}{value}%
        </span>
      </div>
      <div className="relative">
        <div className="absolute inset-0 h-2 rounded-full bg-surface-200" style={{ top: '50%', transform: 'translateY(-50%)' }} />
        <div className="absolute h-3 w-0.5 bg-surface-400 rounded-full" style={{ left: '33.33%', top: '50%', transform: 'translateY(-50%)' }} />
        <div
          className={`absolute h-2 rounded-full ${value >= 0 ? 'bg-green-400' : 'bg-red-400'} transition-all duration-150`}
          style={{
            top: '50%',
            transform: 'translateY(-50%)',
            left: value >= 0 ? '33.33%' : `${normalizedValue}%`,
            width: value >= 0 ? `${(value / 100) * 66.67}%` : `${33.33 - normalizedValue}%`
          }}
        />
        <input
          type="range"
          min="-50"
          max="100"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          className="relative w-full h-6 appearance-none bg-transparent cursor-pointer z-10"
        />
      </div>
      <div className="flex items-center justify-between text-[10px] text-surface-400">
        <span>-50%</span>
        <span>0</span>
        <span>+100%</span>
      </div>
    </div>
  )
})

FactorSlider.displayName = 'FactorSlider'

/**
 * Tiny 5×5 grid dot — one for "Current", one for "Projected".
 * Orientation: red (high risk) top-left, green (low risk) bottom-right.
 * Rows = Impact/Consequence (5→1 top→bottom), Cols = Likelihood (5→1 left→right).
 */
const MiniGrid = ({ likelihood, consequence, label, dotClass }) => {
  const score = likelihood * consequence
  const zone = getRiskZone(likelihood, consequence)
  const scoreColor = getScoreColor(score)
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] font-semibold text-surface-500">{label}</span>
      <div className="grid grid-cols-5 gap-[2px]" style={{ width: 70, height: 70 }}>
        {[5, 4, 3, 2, 1].map(c =>
          [5, 4, 3, 2, 1].map(l => {
            const s = l * c
            const color = getScoreColor(s)
            const isActive = l === likelihood && c === consequence
            return (
              <div
                key={`${l}-${c}`}
                className="relative flex items-center justify-center rounded-[2px]"
                style={{ backgroundColor: color.backgroundColor, opacity: isActive ? 1 : 0.35 }}
              >
                {isActive && <div className={`w-[9px] h-[9px] rounded-full ${dotClass}`} />}
              </div>
            )
          })
        )}
      </div>
      <span className="text-[9px] text-surface-400">L{likelihood} × C{consequence} = {score}</span>
      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: scoreColor.backgroundColor, color: scoreColor.color, fontSize: '8px' }}>
        {zone.label}
      </span>
    </div>
  )
}

const MiniRiskMatrix = ({ likelihood, consequence, projectedLikelihood }) => {
  const pL = projectedLikelihood != null && projectedLikelihood !== likelihood ? projectedLikelihood : likelihood

  return (
    <div className="bg-white rounded-lg border border-surface-200 px-3 py-2">
      <div className="flex items-center justify-center gap-5">
        <MiniGrid likelihood={likelihood} consequence={consequence} label="Current" dotClass="bg-white border-2 border-surface-800" />
        <span className="text-surface-300 text-lg">&rarr;</span>
        <MiniGrid likelihood={pL} consequence={consequence} label="Projected" dotClass="bg-green-400 border-2 border-white animate-pulse" />
      </div>
    </div>
  )
}

const QuickActionButton = ({ label, icon: Icon, onClick, isActive, colorClass }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isActive ? 'ring-2 ring-primary-400 ' + colorClass : colorClass + ' opacity-80 hover:opacity-100'}`}
  >
    <Icon size={14} />
    {label}
  </button>
)

const ICON_MAP = { Settings, Shield, User, CheckCircle, HardHat }

const SimulationPanel = ({ currentHazard, hazardIncidents, factorData, dayPatterns, onProjectionChange, renderImpactSummary = true }) => {
  const [sliders, setSliders] = useState({})
  const [actionsToClose, setActionsToClose] = useState(0)
  const [activeQuickAction, setActiveQuickAction] = useState(null)

  // Count open actions for this hazard
  const openActionsCount = useMemo(() => {
    if (!hazardIncidents?.length) return 0
    return hazardIncidents.filter(isOpenAction).length
  }, [hazardIncidents])

  // Confidence indicator based on observation count
  const confidence = useMemo(() => {
    const count = hazardIncidents?.length || 0
    if (count >= 50) return { level: 'High', pct: 90, color: 'text-green-600' }
    if (count >= 20) return { level: 'Moderate', pct: 70, color: 'text-blue-600' }
    if (count >= 10) return { level: 'Low', pct: 50, color: 'text-amber-600' }
    return { level: 'Insufficient', pct: 25, color: 'text-red-500' }
  }, [hazardIncidents])

  // Shared computation: build hazard-specific factor data (used by both sliders and prevalence)
  const hazardFactorData = useMemo(() => {
    if (!factorData?.byFactor || !hazardIncidents?.length) return []
    const hazardIncidentIds = new Set(hazardIncidents.map(i => i.id))
    return factorData.byFactor
      .filter(f => !f.isUnclassified && f.name !== 'Unclassified')
      .map(factor => {
        const matchingIncidents = (factor.incidents || []).filter(inc => hazardIncidentIds.has(inc.id))
        return { name: factor.name, count: matchingIncidents.length, hazards: { [currentHazard?.name]: matchingIncidents.length } }
      })
      .filter(f => f.count > 0)
      .sort((a, b) => b.count - a.count)
  }, [factorData, currentHazard, hazardIncidents])

  // Generate contextual sliders using engine (Expert 50% + Data 30% + Temporal 20%)
  const contextualSliders = useMemo(() => {
    if (!hazardFactorData.length || !hazardIncidents?.length) return []
    const result = generateContextualSliders(
      { byFactor: hazardFactorData },
      currentHazard?.name,
      hazardIncidents.length,
      dayPatterns
    )
    return (result.sliders || result).slice(0, 8)
  }, [hazardFactorData, currentHazard, hazardIncidents, dayPatterns])

  // Calculate factor prevalence for engine projection
  const prevalence = useMemo(() => {
    if (!hazardFactorData.length || !hazardIncidents?.length) return {}
    return calculateFactorPrevalence({ byFactor: hazardFactorData }, hazardIncidents.length)
  }, [hazardFactorData, hazardIncidents])

  // Project change using engine (diminishing returns, -45% to +40% cap)
  const projection = useMemo(() => {
    const hasSliders = Object.values(sliders).some(v => v !== 0)
    if (!hasSliders && actionsToClose === 0) return { totalEffect: 0, effects: {}, factorsAddressed: 0 }

    const engineResult = calculateProjectedChange(sliders, prevalence)

    // Add action closure effect
    let actionEffect = 0
    if (actionsToClose > 0 && openActionsCount > 0) {
      actionEffect = calculateActionClosureEffect(actionsToClose, openActionsCount, hazardIncidents?.length || 0)
    }

    const combinedEffect = engineResult.totalEffect + actionEffect
    // Clamp to engine bounds: -45% to +40%
    const clampedEffect = Math.round(Math.min(40, Math.max(-45, combinedEffect)) * 10) / 10

    const factorsAddressed = Object.keys(engineResult.effects || {}).length + (actionsToClose > 0 ? 1 : 0)

    return {
      // impactScore is absolute value of reduction (positive = good)
      impactScore: clampedEffect < 0 ? Math.abs(clampedEffect) : 0,
      totalEffect: clampedEffect,
      effects: engineResult.effects,
      factorsAddressed,
      isCapped: engineResult.isCapped,
      hasDisminishingReturns: engineResult.hasDisminishingReturns,
      actionEffect: Math.round(actionEffect * 10) / 10,
      actionsToClose,
      openActionsCount,
      prevalenceData: prevalence,
    }
  }, [sliders, actionsToClose, prevalence, openActionsCount, hazardIncidents])

  const applyQuickAction = useCallback((presetId) => {
    if (activeQuickAction === presetId) {
      setSliders({})
      setActionsToClose(0)
      setActiveQuickAction(null)
      return
    }
    const result = applyQuickActionPreset(presetId, prevalence, openActionsCount)
    // Only apply slider values that match available sliders
    const validSliderIds = new Set(contextualSliders.map(s => s.id))
    const filtered = {}
    for (const [key, val] of Object.entries(result.sliders || {})) {
      if (validSliderIds.has(key)) filtered[key] = val
    }
    // If no sliders matched, set all available sliders to 50
    if (Object.keys(filtered).length === 0 && contextualSliders.length > 0 && presetId !== 'close-actions') {
      contextualSliders.forEach(s => { filtered[s.id] = 50 })
    }
    setSliders(filtered)
    setActionsToClose(result.actionsToClose || 0)
    setActiveQuickAction(presetId)
  }, [activeQuickAction, prevalence, openActionsCount, contextualSliders])

  // Notify parent of projection changes for MiniRiskMatrix
  useEffect(() => {
    if (onProjectionChange) onProjectionChange(projection)
  }, [projection, onProjectionChange])

  // Stable per-slider onChange callbacks (prevents FactorSlider re-renders from new closures)
  const sliderCallbacksRef = useRef({})
  const getSliderOnChange = useCallback((sliderId) => {
    if (!sliderCallbacksRef.current[sliderId]) {
      sliderCallbacksRef.current[sliderId] = (v) => setSliders(s => ({ ...s, [sliderId]: v }))
    }
    return sliderCallbacksRef.current[sliderId]
  }, [])

  const presetColorMap = { blue: 'bg-blue-100 text-blue-700 hover:bg-blue-200', indigo: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200', amber: 'bg-amber-100 text-amber-700 hover:bg-amber-200', green: 'bg-green-100 text-green-700 hover:bg-green-200' }

  const isInsufficient = (hazardIncidents?.length || 0) < 10

  return (
    <div className="space-y-4">
      {/* Insufficient data warning */}
      {isInsufficient && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle size={16} className="text-amber-600 flex-shrink-0" />
          <p className="text-xs text-amber-700">
            <span className="font-semibold">Low confidence:</span> Only {hazardIncidents?.length || 0} observations. Results improve with 10+ observations.
          </p>
        </div>
      )}

      {/* Confidence indicator */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-surface-500">Confidence:</span>
        <div className="flex-1 h-1.5 bg-surface-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${confidence.pct >= 70 ? 'bg-green-400' : confidence.pct >= 50 ? 'bg-blue-400' : 'bg-amber-400'}`} style={{ width: `${confidence.pct}%` }} />
        </div>
        <span className={`font-semibold ${confidence.color}`}>{confidence.level}</span>
      </div>

      {/* Quick Actions from QUICK_ACTION_PRESETS */}
      <div>
        <h3 className="text-sm font-semibold text-surface-800 mb-3">Quick Actions</h3>
        <div className="flex flex-wrap items-center gap-2">
          {QUICK_ACTION_PRESETS.map(preset => {
            const PresetIcon = ICON_MAP[preset.icon] || Settings
            return (
              <QuickActionButton
                key={preset.id}
                label={preset.label}
                icon={PresetIcon}
                onClick={() => applyQuickAction(preset.id)}
                isActive={activeQuickAction === preset.id}
                colorClass={presetColorMap[preset.color] || 'bg-surface-100 text-surface-700 hover:bg-surface-200'}
              />
            )
          })}
          {(Object.keys(sliders).length > 0 || actionsToClose > 0) && (
            <button onClick={() => { setSliders({}); setActionsToClose(0); setActiveQuickAction(null) }} className="flex items-center gap-1 text-xs text-surface-500 hover:text-surface-700 ml-2">
              <RotateCcw size={12} />Reset
            </button>
          )}
        </div>
      </div>

      {/* Intervention Sliders + Action Closure (merged) */}
      {contextualSliders.length > 0 ? (
        <div className="bg-white rounded-lg border border-surface-200 p-4">
          <h4 className="text-xs font-semibold text-surface-600 uppercase tracking-wider mb-3">Intervention Sliders</h4>
          <div className="space-y-3">
            {contextualSliders.map(slider => (
              <FactorSlider
                key={slider.id}
                slider={slider}
                value={sliders[slider.id] || 0}
                onChange={getSliderOnChange(slider.id)}
              />
            ))}

            {/* Action Closure — inline within sliders card */}
            {openActionsCount > 0 ? (
              <div className="border-t border-surface-100 pt-2 mt-1 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-surface-700">Close Actions</span>
                  <span className="text-xs font-semibold text-green-700 bg-green-100 px-1.5 py-0.5 rounded">
                    {actionsToClose} / {openActionsCount}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={openActionsCount}
                  value={actionsToClose}
                  onChange={(e) => setActionsToClose(parseInt(e.target.value, 10))}
                  className="w-full h-6 appearance-none bg-transparent cursor-pointer"
                />
                <div className="flex items-center justify-between text-[10px] text-surface-400">
                  <span>0</span>
                  <span>{openActionsCount} open</span>
                </div>
              </div>
            ) : (
              <div className="border-t border-surface-100 pt-2 mt-1">
                <div className="flex items-center gap-1.5 text-xs text-surface-400">
                  <CheckCircle size={12} />
                  <span>No open actions to close</span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : openActionsCount > 0 ? (
        <div className="bg-white rounded-lg border border-surface-200 p-4">
          <h4 className="text-xs font-semibold text-surface-600 uppercase tracking-wider mb-3">Action Closure</h4>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-surface-700">Close Actions</span>
              <span className="text-xs font-semibold text-green-700 bg-green-100 px-1.5 py-0.5 rounded">
                {actionsToClose} / {openActionsCount}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max={openActionsCount}
              value={actionsToClose}
              onChange={(e) => setActionsToClose(parseInt(e.target.value, 10))}
              className="w-full h-6 appearance-none bg-transparent cursor-pointer"
            />
            <div className="flex items-center justify-between text-[10px] text-surface-400">
              <span>0</span>
              <span>{openActionsCount} open</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-surface-50 rounded-lg p-4 text-center">
          <p className="text-sm text-surface-500">No controllable factors detected for this hazard.</p>
        </div>
      )}

      {/* Intervention Impact Summary — immediate feedback (skip when extracted to right column) */}
      {renderImpactSummary && projection.factorsAddressed > 0 && (
        <InterventionImpactSummary projection={projection} />
      )}

    </div>
  )
}


// ============================================================================
// INTERVENTION IMPACT SUMMARY — immediate feedback when sliders move
// ============================================================================

/** Build a lookup: factorName → { categoryKey, effectiveness } */
const FACTOR_CONTROL_MAP = (() => {
  const map = {}
  for (const [key, cat] of Object.entries(CONTROL_HIERARCHY)) {
    for (const f of cat.factors) {
      map[f] = { categoryKey: key, categoryName: cat.name, effectiveness: cat.effectiveness }
    }
  }
  return map
})()

const InterventionImpactSummary = ({ projection }) => {
  if (!projection || projection.factorsAddressed === 0) return null

  const effect = projection.totalEffect
  const isReduction = effect < 0
  const absEffect = Math.abs(effect)

  // Progress bar: map -45..+40 to 0..100
  // Center (0%) is at position 52.9% (45/85)
  const center = (45 / 85) * 100
  const barPos = isReduction
    ? center - (absEffect / 45) * center
    : center + (absEffect / 40) * (100 - center)

  // Color coding
  const colorClass = isReduction
    ? absEffect >= 30 ? 'text-green-700' : absEffect >= 15 ? 'text-green-600' : 'text-green-500'
    : effect > 0 ? 'text-red-600' : 'text-surface-500'
  const bgClass = isReduction ? 'bg-green-50 border-green-200' : effect > 0 ? 'bg-red-50 border-red-200' : 'bg-surface-50 border-surface-200'

  return (
    <div className={`rounded-lg border p-3 ${bgClass}`}>
      <div className="flex items-center justify-between mb-1.5">
        <h4 className="text-xs font-semibold text-surface-600 uppercase tracking-wider">Projected Impact</h4>
        <span className="text-[10px] text-surface-400">{projection.factorsAddressed} factor{projection.factorsAddressed !== 1 ? 's' : ''}</span>
      </div>

      {/* % display */}
      <div className="text-center mb-2">
        <span className={`text-2xl font-black ${colorClass}`}>
          {effect > 0 ? '+' : ''}{effect}%
        </span>
        <p className="text-[10px] text-surface-500 mt-0.5">
          {isReduction ? 'Projected risk reduction' : effect > 0 ? 'Projected risk increase' : 'No change'}
        </p>
      </div>

      {/* Progress bar: -45% to +40% scale */}
      <div className="relative h-2 bg-surface-100 rounded-full overflow-hidden mb-1">
        <div className="absolute top-0 bottom-0 w-px bg-surface-400 z-10" style={{ left: `${center}%` }} />
        <div
          className={`absolute top-0 bottom-0 rounded-full transition-all duration-300 ${isReduction ? 'bg-green-400' : effect > 0 ? 'bg-red-400' : ''}`}
          style={{
            left: isReduction ? `${barPos}%` : `${center}%`,
            width: `${Math.abs(barPos - center)}%`,
          }}
        />
      </div>
      <div className="flex items-center justify-between text-[9px] text-surface-400 mb-2">
        <span>-45%</span>
        <span>0%</span>
        <span>+40%</span>
      </div>

      {/* Capped indicator */}
      {projection.isCapped && (
        <div className="flex items-center gap-1.5 text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded">
          <AlertCircle size={11} />
          <span>Effect capped at conservative bounds</span>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// CALCULATION BREAKDOWN PANEL — numerical risk detail below MiniRiskMatrix
// ============================================================================

const CalculationBreakdownPanel = ({ hazard, projectedLikelihood, projection }) => {
  if (!hazard?.likelihood || !hazard?.consequence) return null

  const L = hazard.likelihood
  const C = hazard.consequence
  const currentScore = L * C
  const currentColor = getScoreColor(currentScore)
  const currentZone = getRiskZone(L, C)

  const pL = projectedLikelihood ?? L
  const projectedScore = pL * C
  const projectedColor = getScoreColor(projectedScore)
  const projectedZone = getRiskZone(pL, C)
  const hasChange = pL !== L

  // Build per-intervention breakdown from projection.effects
  const effectRows = useMemo(() => {
    if (!projection?.effects) return []
    return Object.values(projection.effects)
      .map(e => {
        const ctrl = FACTOR_CONTROL_MAP[e.factor]
        return {
          factor: e.factor,
          label: e.label,
          sliderValue: e.sliderValue,
          effect: e.effect,
          effectiveness: ctrl?.effectiveness ?? 0,
          category: e.category,
        }
      })
      .sort((a, b) => a.effect - b.effect) // most negative (biggest reduction) first
  }, [projection])

  const hasEffects = effectRows.length > 0 || (projection?.totalEffect && projection.totalEffect !== 0)
  if (!hasEffects && !hasChange) return null

  return (
    <div className="bg-white rounded-lg border border-surface-200 px-4 py-4 space-y-3">
      <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Risk Calculation</h4>

      {/* Current → Projected scores */}
      <div className="flex items-center justify-center gap-4">
        {/* Current */}
        <div className="text-center">
          <p className="text-[11px] text-surface-400 mb-1">Current</p>
          <div className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded" style={{ backgroundColor: currentColor.backgroundColor + '30', border: `1px solid ${currentColor.borderColor}` }}>
            <span className="text-sm font-bold" style={{ color: currentColor.borderColor }}>
              L{L} <span className="text-xs font-normal">"{LIKELIHOOD_LABELS[L]}"</span> × C{C} <span className="text-xs font-normal">"{CONSEQUENCE_LABELS[C]}"</span> = {currentScore}
            </span>
          </div>
          <div className="mt-1">
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: currentColor.backgroundColor, color: currentColor.color }}>
              {currentZone.label}
            </span>
          </div>
        </div>

        {/* Arrow */}
        {hasChange && (
          <>
            <span className="text-surface-300 text-xl">&rarr;</span>
            {/* Projected */}
            <div className="text-center">
              <p className="text-[11px] text-surface-400 mb-1">Projected</p>
              <div className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded" style={{ backgroundColor: projectedColor.backgroundColor + '30', border: `1px solid ${projectedColor.borderColor}` }}>
                <span className="text-sm font-bold" style={{ color: projectedColor.borderColor }}>
                  L{pL} <span className="text-xs font-normal">"{LIKELIHOOD_LABELS[pL]}"</span> × C{C} = {projectedScore}
                </span>
              </div>
              <div className="mt-1">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: projectedColor.backgroundColor, color: projectedColor.color }}>
                  {projectedZone.label}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Per-intervention breakdown table */}
      {effectRows.length > 0 && (
        <div>
          <h5 className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider mb-2">Intervention Breakdown</h5>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-surface-400 border-b border-surface-100">
                  <th className="text-left py-1.5 pr-2 font-semibold">Factor</th>
                  <th className="text-right py-1.5 px-1 font-semibold">Prevalence</th>
                  <th className="text-right py-1.5 px-1 font-semibold">Eff.</th>
                  <th className="text-right py-1.5 px-1 font-semibold">Slider</th>
                  <th className="text-right py-1.5 pl-1 font-semibold">= Effect</th>
                </tr>
              </thead>
              <tbody>
                {effectRows.map(row => {
                  const prev = projection?.prevalenceData?.[row.factor]
                  const prevalencePct = prev?.percentage ?? '—'
                  return (
                    <tr key={row.factor} className="border-b border-surface-50">
                      <td className="py-1.5 pr-2 text-surface-700 truncate max-w-[120px]" title={row.factor}>{row.factor}</td>
                      <td className="py-1.5 px-1 text-right text-surface-500">{typeof prevalencePct === 'number' ? prevalencePct.toFixed(1) + '%' : prevalencePct}</td>
                      <td className="py-1.5 px-1 text-right text-surface-500">×{Math.round(row.effectiveness * 100)}%</td>
                      <td className="py-1.5 px-1 text-right text-surface-500">×{row.sliderValue}%</td>
                      <td className={`py-1.5 pl-1 text-right font-semibold ${row.effect < 0 ? 'text-green-600' : row.effect > 0 ? 'text-red-600' : 'text-surface-500'}`}>
                        {row.effect > 0 ? '+' : ''}{row.effect}%
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Action closure effect */}
      {projection?.actionEffect !== 0 && projection?.actionEffect != null && (
        <div className="flex items-center justify-between text-xs px-2 py-1.5 bg-green-50 rounded">
          <span className="text-surface-600">Close {projection.actionsToClose} of {projection.openActionsCount} actions</span>
          <span className="font-semibold text-green-600">{projection.actionEffect > 0 ? '+' : ''}{projection.actionEffect.toFixed(1)}%</span>
        </div>
      )}

      {/* Diminishing returns note */}
      {projection?.hasDisminishingReturns && effectRows.length > 1 && (
        <div className="flex items-start gap-1.5 text-[11px] text-surface-400">
          <Info size={12} className="flex-shrink-0 mt-0.5" />
          <span>Diminishing returns applied: each subsequent intervention gets 70% of remaining effect capacity.</span>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// CENTER HAZARD CARD - Shows severity breakdown (Pyramid visualization)
// ============================================================================

const CenterHazardCard = ({ hazard, hazardIncidents, cellColor, trend, trendDetails }) => {
  // Calculate severity breakdown
  const severityBreakdown = useMemo(() => {
    if (!hazardIncidents?.length) return { fatality: 0, lti: 0, mti: 0, fac: 0, env: 0, fire: 0, security: 0, dmg: 0, nearMiss: 0, observations: 0, total: 0, weightedScore: 0 }

    const counts = { fatality: 0, lti: 0, mti: 0, fac: 0, env: 0, fire: 0, security: 0, dmg: 0, nearMiss: 0, observations: 0 }
    let weightedScore = 0

    hazardIncidents.forEach(i => {
      const type = i.type?.toLowerCase()
      const weight = SEVERITY_WEIGHTS[type] || SEVERITY_WEIGHTS.default || 1
      weightedScore += weight

      if (type === 'fatality') counts.fatality++
      else if (type === 'lti') counts.lti++
      else if (type === 'mti') counts.mti++
      else if (type === 'fac') counts.fac++
      else if (ENV_SUB_TYPES.has(type) || type === 'environmental') counts.env++
      else if (type === 'fire') counts.fire++
      else if (type === 'security') counts.security++
      else if (DMG_SUB_TYPES.has(type) || type === 'damage-to-property') counts.dmg++
      else if (type === 'near-miss') counts.nearMiss++
      else counts.observations++
    })

    return { ...counts, total: hazardIncidents.length, weightedScore }
  }, [hazardIncidents])

  const hasRecordable = severityBreakdown.fatality > 0 || severityBreakdown.lti > 0 || severityBreakdown.mti > 0 || severityBreakdown.fac > 0

  // Compact severity pill definitions — only render those with count > 0
  const SEVERITY_PILLS = [
    { key: 'fatality', label: 'Fatality', weight: '×10000', bg: 'bg-red-200', dot: 'bg-red-900', text: 'text-red-900', wsub: 'text-red-700' },
    { key: 'lti', label: 'LTI', weight: '×1000', bg: 'bg-red-100', dot: 'bg-red-600', text: 'text-red-700', wsub: 'text-red-500' },
    { key: 'mti', label: 'MTI', weight: '×500', bg: 'bg-orange-100', dot: 'bg-orange-500', text: 'text-orange-700', wsub: 'text-orange-500' },
    { key: 'fac', label: 'FAC', weight: '×100', bg: 'bg-yellow-100', dot: 'bg-yellow-500', text: 'text-yellow-700', wsub: 'text-yellow-600' },
    { key: 'env', label: 'ENV', weight: '×200', bg: 'bg-amber-100', dot: 'bg-amber-600', text: 'text-amber-700', wsub: 'text-amber-500' },
    { key: 'fire', label: 'Fire', weight: '×500', bg: 'bg-red-50', dot: 'bg-red-500', text: 'text-red-600', wsub: 'text-red-400' },
    { key: 'security', label: 'Security', weight: '×100', bg: 'bg-stone-100', dot: 'bg-stone-500', text: 'text-stone-600', wsub: 'text-stone-400' },
    { key: 'dmg', label: 'DMG', weight: '×200', bg: 'bg-lime-100', dot: 'bg-lime-600', text: 'text-lime-700', wsub: 'text-lime-500' },
    { key: 'nearMiss', label: 'Near Miss', weight: '×50', bg: 'bg-amber-50', dot: 'bg-amber-500', text: 'text-amber-700', wsub: 'text-amber-500' },
    { key: 'observations', label: 'Obs', weight: '×1', bg: 'bg-surface-100', dot: 'bg-surface-400', text: 'text-surface-600', wsub: 'text-surface-400' },
  ]

  return (
    <div className={`${cellColor?.bg || 'bg-primary-50'} ${cellColor?.border || 'border-primary-300'} border-2 rounded-2xl p-5 shadow-md`}>
      {/* Top row: Trend Badge + Risk Score */}
      <div className="flex items-center justify-between mb-3">
        <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${trend.bg}`}>
          <TrendIndicator trend={hazard?.trendLevel} size={13} />
          <span className={`text-[11px] font-semibold ${trend.color}`}>{trend.label}</span>
          {trendDetails.changePercent !== 0 && (
            <span className={`text-[11px] ${trend.color}`}>
              {trendDetails.changePercent > 0 ? '+' : ''}{trendDetails.changePercent}%
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-surface-400 uppercase">Risk Score</span>
          <span className={`text-lg font-bold ${cellColor?.text || 'text-primary-700'}`}>{hazard?.riskScore || 0}</span>
        </div>
      </div>

      {/* Hazard Name — centered heading */}
      <h2 className={`text-xl font-bold text-center leading-tight mb-2 ${cellColor?.text || 'text-primary-800'}`} title={hazard?.name}>
        {hazard?.name}
      </h2>

      {/* Large total count */}
      <div className="text-center mb-4">
        <span className="text-3xl font-black text-surface-800">{severityBreakdown.total}</span>
        <p className="text-xs text-surface-500 mt-0.5">total observations</p>
      </div>

      {/* Severity pills — vertical pyramid */}
      <div className="space-y-1.5 mb-3">
        {SEVERITY_PILLS.map(pill => {
          const count = severityBreakdown[pill.key]
          if (!count) return null
          return (
            <div key={pill.key} className={`flex items-center justify-center gap-1.5 ${pill.bg} px-3 py-1 rounded-full mx-auto`} style={{ width: 'fit-content', minWidth: '60%' }}>
              <div className={`w-2 h-2 rounded-full ${pill.dot}`} />
              <span className={`text-xs font-semibold ${pill.text}`}>{count} {pill.label}</span>
              <span className={`text-[10px] ${pill.wsub}`}>{pill.weight}</span>
            </div>
          )
        })}
      </div>

      {/* Weighted Score summary */}
      {hasRecordable && (
        <div className="border-t border-surface-200/50 pt-2 text-center">
          <span className="text-xs text-surface-500">Weighted Score: </span>
          <span className="text-sm font-bold text-red-600">{severityBreakdown.weightedScore}</span>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// CONNECTED HUB DIAGRAM - Infographic layout with WHEN | HAZARD | WHERE
// ============================================================================

const ConnectedHubDiagram = ({
  hazard,
  hazardIncidents,
  hazardFactors,
  dayPatterns,
  hourPatterns,
  siteClassifications,
  cellColor,
  projection,
  projectedLikelihood: projectedLikelihoodProp,
  showRiskFeedback = true,
}) => {
  // Calculate WHERE data: top site + top 4 contractors (no duplication)
  const whereData = useMemo(() => {
    if (!hazardIncidents?.length) return { topSite: null, contractors: [] }

    const siteCounts = {}
    const contractorCounts = {}
    hazardIncidents.forEach(i => {
      const site = i.site || 'Unknown'
      const contractor = i.contractor || i.contractorName || 'Unknown'
      siteCounts[site] = (siteCounts[site] || 0) + 1
      contractorCounts[contractor] = (contractorCounts[contractor] || 0) + 1
    })

    const sortedSites = Object.entries(siteCounts)
      .map(([name, count]) => ({ name, pct: Math.round((count / hazardIncidents.length) * 100) }))
      .sort((a, b) => b.pct - a.pct)
    const topSite = sortedSites[0] || null

    const contractors = Object.entries(contractorCounts)
      .map(([name, count]) => ({ name, pct: Math.round((count / hazardIncidents.length) * 100) }))
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 4)

    return { topSite, contractors }
  }, [hazardIncidents])

  // Calculate WHEN data: peak/lowest day and shift with deviation %
  const whenData = useMemo(() => {
    const result = { day: null, shift: null, lowestDay: null, lowestShift: null }

    if (dayPatterns?.hasData && dayPatterns.patterns?.length > 0) {
      const sortedDaysDesc = [...dayPatterns.patterns].sort((a, b) => b.count - a.count)
      const peakDay = sortedDaysDesc[0]
      if (peakDay && peakDay.count > 0) {
        result.day = { label: peakDay.day, deviation: Math.round(peakDay.riskIndex - 100) }
      }
      // Lowest day: pick lowest count > 0
      const sortedDaysAsc = [...dayPatterns.patterns].filter(p => p.count > 0).sort((a, b) => a.count - b.count)
      const lowestDay = sortedDaysAsc[0]
      if (lowestDay && lowestDay.day !== peakDay?.day) {
        result.lowestDay = { label: lowestDay.day, deviation: Math.round(lowestDay.riskIndex - 100) }
      }
    }

    if (hourPatterns?.hasData && hourPatterns.shifts?.length > 0) {
      const sortedShiftsDesc = [...hourPatterns.shifts].sort((a, b) => b.count - a.count)
      const peakShift = sortedShiftsDesc[0]
      if (peakShift && peakShift.count > 0) {
        result.shift = {
          label: peakShift.key.charAt(0).toUpperCase() + peakShift.key.slice(1),
          deviation: Math.round(peakShift.riskIndex - 100)
        }
      }
      // Lowest shift: pick lowest count > 0
      const sortedShiftsAsc = [...hourPatterns.shifts].filter(s => s.count > 0).sort((a, b) => a.count - b.count)
      const lowestShift = sortedShiftsAsc[0]
      if (lowestShift && lowestShift.key !== peakShift?.key) {
        result.lowestShift = {
          label: lowestShift.key.charAt(0).toUpperCase() + lowestShift.key.slice(1),
          deviation: Math.round(lowestShift.riskIndex - 100)
        }
      }
    }

    return result
  }, [dayPatterns, hourPatterns])

  // Trend configuration
  const trendConfig = {
    'significant-rise': { label: 'RISING', color: 'text-red-700', bg: 'bg-red-100', icon: 'text-red-600' },
    'rising': { label: 'RISING', color: 'text-red-700', bg: 'bg-red-100', icon: 'text-red-600' },
    'stable': { label: 'STABLE', color: 'text-surface-700', bg: 'bg-surface-100', icon: 'text-surface-500' },
    'new': { label: 'NEW', color: 'text-blue-700', bg: 'bg-blue-100', icon: 'text-blue-600' },
    'declining': { label: 'DECLINING', color: 'text-green-700', bg: 'bg-green-100', icon: 'text-green-600' },
    'significant-decline': { label: 'DECLINING', color: 'text-green-700', bg: 'bg-green-100', icon: 'text-green-600' }
  }
  const trend = trendConfig[hazard?.trendLevel?.level] || trendConfig.stable

  // Use prop from parent (HazardDetailModal lifts this), or null
  const projectedLikelihood = projectedLikelihoodProp ?? null

  const hasWhenData = whenData.day || whenData.shift || whenData.lowestDay || whenData.lowestShift
  const hasWhereData = whereData.topSite || whereData.contractors.length > 0

  // Calculate trend details for bottom card
  const trendDetails = useMemo(() => {
    const currentCount = hazard?.currentPeriodCount ?? hazardIncidents?.length ?? 0
    const previousCount = hazard?.previousPeriodCount ?? 0
    const changePercent = hazard?.changePercent ?? 0

    return {
      currentCount,
      previousCount,
      changePercent: Math.round(changePercent),
      direction: changePercent > 5 ? 'rising' : changePercent < -5 ? 'declining' : 'stable'
    }
  }, [hazard, hazardIncidents])

  return (
    <div className="space-y-4">
      {/* TOP ROW: WHEN + WHERE side by side */}
      <div className="grid grid-cols-2 gap-4">
        {/* WHEN Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
              <Calendar size={15} className="text-blue-600" />
            </div>
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">When</p>
          </div>
          {hasWhenData ? (
            <div className="space-y-2">
              {whenData.day && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-surface-500">Peak Day</span>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-surface-800">{whenData.day.label}</p>
                    <p className={`text-[10px] font-semibold ${whenData.day.deviation > 0 ? 'text-red-500' : whenData.day.deviation < 0 ? 'text-green-500' : 'text-surface-400'}`}>
                      {whenData.day.deviation > 0 ? '+' : ''}{whenData.day.deviation}% vs avg
                    </p>
                  </div>
                </div>
              )}
              {whenData.shift && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-surface-500">Peak Shift</span>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-surface-800">{whenData.shift.label}</p>
                    <p className={`text-[10px] font-semibold ${whenData.shift.deviation > 0 ? 'text-red-500' : whenData.shift.deviation < 0 ? 'text-green-500' : 'text-surface-400'}`}>
                      {whenData.shift.deviation > 0 ? '+' : ''}{whenData.shift.deviation}% vs avg
                    </p>
                  </div>
                </div>
              )}
              {(whenData.lowestDay || whenData.lowestShift) && (
                <div className="border-t border-blue-200 my-1" />
              )}
              {whenData.lowestDay && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-surface-500">Lowest Day</span>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-surface-800">{whenData.lowestDay.label}</p>
                    <p className={`text-[10px] font-semibold ${whenData.lowestDay.deviation > 0 ? 'text-red-500' : whenData.lowestDay.deviation < 0 ? 'text-green-500' : 'text-surface-400'}`}>
                      {whenData.lowestDay.deviation > 0 ? '+' : ''}{whenData.lowestDay.deviation}% vs avg
                    </p>
                  </div>
                </div>
              )}
              {whenData.lowestShift && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-surface-500">Lowest Shift</span>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-surface-800">{whenData.lowestShift.label}</p>
                    <p className={`text-[10px] font-semibold ${whenData.lowestShift.deviation > 0 ? 'text-red-500' : whenData.lowestShift.deviation < 0 ? 'text-green-500' : 'text-surface-400'}`}>
                      {whenData.lowestShift.deviation > 0 ? '+' : ''}{whenData.lowestShift.deviation}% vs avg
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-surface-400 italic text-center py-2">No temporal data</p>
          )}
        </div>

        {/* WHERE Card */}
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center">
              <MapPin size={15} className="text-purple-600" />
            </div>
            <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Where</p>
          </div>
          {hasWhereData ? (
            <div className="space-y-1.5">
              {whereData.topSite && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-surface-400">Site</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs truncate max-w-[90px] ${whereData.topSite.name === 'Unknown' ? 'text-surface-400 italic' : 'text-surface-700 font-medium'}`} title={whereData.topSite.name}>
                      {whereData.topSite.name}
                    </span>
                    <span className="text-xs font-semibold text-purple-600">{whereData.topSite.pct}%</span>
                  </div>
                </div>
              )}
              {whereData.contractors.map((c, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className={`text-xs truncate max-w-[60%] ${c.name === 'Unknown' ? 'text-surface-400 italic' : 'text-surface-600'}`} title={c.name}>
                    {c.name}
                  </span>
                  <span className={`text-xs font-semibold ${c.name === 'Unknown' ? 'text-surface-400' : 'text-purple-600'}`}>{c.pct}%</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-surface-400 italic text-center py-2">No location data</p>
          )}
        </div>
      </div>

      {/* CENTER: Main Hazard Card with severity breakdown */}
      <CenterHazardCard
        hazard={hazard}
        hazardIncidents={hazardIncidents}
        cellColor={cellColor}
        trend={trend}
        trendDetails={trendDetails}
      />

      {/* BOTTOM ROW: Contributing Factors + Trend Details side by side */}
      <div className="grid grid-cols-2 gap-4">
        {/* Contributing Factors Card */}
        <div className="bg-white rounded-xl border border-surface-200 p-4">
          <h3 className="text-xs font-semibold text-surface-600 uppercase tracking-wider mb-3">Contributing Factors</h3>
          {hazardFactors?.length > 0 ? (
            <div className="space-y-2">
              {hazardFactors.map((factor, idx) => (
                <div key={factor.name} className="flex items-center gap-2">
                  <span className="text-[10px] text-surface-400 w-3">{idx + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs text-surface-800 truncate">{factor.name}</span>
                      <span className="text-[10px] font-semibold text-primary-600 ml-2">{Math.round(factor.percentage)}%</span>
                    </div>
                    <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-400 rounded-full transition-all" style={{ width: `${Math.min(100, factor.percentage)}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-surface-400 italic text-center py-4">No factors detected</p>
          )}
        </div>

        {/* Trend Details Card */}
        <div className="bg-white rounded-xl border border-surface-200 p-4">
          <h3 className="text-xs font-semibold text-surface-600 uppercase tracking-wider mb-3">Period Comparison</h3>
          <div className="space-y-3">
            {/* Current vs Previous */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-surface-500">Current Period</span>
              <span className="text-lg font-bold text-surface-800">{trendDetails.currentCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-surface-500">Previous Period</span>
              <span className="text-lg font-medium text-surface-500">{trendDetails.previousCount || '—'}</span>
            </div>

            {/* Divider */}
            <div className="border-t border-surface-100" />

            {/* Change indicator */}
            <div className={`flex items-center justify-center gap-2 p-2 rounded-lg ${
              trendDetails.direction === 'rising' ? 'bg-red-50' :
              trendDetails.direction === 'declining' ? 'bg-green-50' : 'bg-surface-50'
            }`}>
              {trendDetails.direction === 'rising' && <TrendingUp size={16} className="text-red-600" />}
              {trendDetails.direction === 'declining' && <TrendingDown size={16} className="text-green-600" />}
              {trendDetails.direction === 'stable' && <Minus size={16} className="text-surface-500" />}
              <span className={`text-sm font-semibold ${
                trendDetails.direction === 'rising' ? 'text-red-700' :
                trendDetails.direction === 'declining' ? 'text-green-700' : 'text-surface-600'
              }`}>
                {trendDetails.changePercent > 0 ? '+' : ''}{trendDetails.changePercent}% change
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MINI RISK MATRIX + CALCULATION BREAKDOWN (skip when extracted to right column) */}
      {showRiskFeedback && hazard?.likelihood && hazard?.consequence && (
        <div className="space-y-3">
          <MiniRiskMatrix
            likelihood={hazard.likelihood}
            consequence={hazard.consequence}
            projectedLikelihood={projectedLikelihood}
          />
          <CalculationBreakdownPanel
            hazard={hazard}
            projectedLikelihood={projectedLikelihood}
            projection={projection}
          />
        </div>
      )}
    </div>
  )
}

// ============================================================================
// DRILL-DOWN MODAL (Horizontal 2-Section Layout)
// ============================================================================

const HazardDetailModal = ({
  isOpen,
  onClose,
  hazard,
  hazardIncidents,
  hazardFactors,
  dayPatterns,
  hourPatterns,
  factorData,
  siteClassifications,
  cellColor,
}) => {
  const modalRef = useRef(null)
  const previousActiveElement = useRef(null)
  const [projection, setProjection] = useState(null)

  const handleProjectionChange = useCallback((proj) => {
    setProjection(proj)
  }, [])

  // Lifted from ConnectedHubDiagram so both left + right columns can use it
  const projectedLikelihood = useMemo(() => {
    if (!projection || !hazard?.likelihood) return null
    const reductionPct = projection.totalEffect < 0 ? Math.abs(projection.totalEffect) : 0
    if (reductionPct < 15) return null
    let steps = 0
    if (reductionPct >= 45) steps = 3
    else if (reductionPct >= 30) steps = 2
    else steps = 1
    const projected = Math.max(1, hazard.likelihood - steps)
    return projected === hazard.likelihood ? null : projected
  }, [projection, hazard])

  useEffect(() => {
    if (!isOpen) return
    previousActiveElement.current = document.activeElement
    const handleEscape = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    if (modalRef.current) modalRef.current.focus()
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
      if (previousActiveElement.current?.focus) previousActiveElement.current.focus()
    }
  }, [isOpen, onClose])

  if (!isOpen || !hazard) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full max-w-[1600px] max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col animate-fade-in"
      >
        {/* Floating close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 bg-white/80 hover:bg-surface-100 rounded-lg transition-colors shadow-sm border border-surface-200"
          aria-label="Close modal"
        >
          <X size={18} className="text-surface-600" />
        </button>

        {/* Content - 3-Column Layout */}
        <div className="flex-1 overflow-y-auto p-6 pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* LEFT COLUMN: Connected Hub Diagram */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider border-b border-surface-200 pb-2">
                Current State
              </h3>
              <ConnectedHubDiagram
                hazard={hazard}
                hazardIncidents={hazardIncidents}
                hazardFactors={hazardFactors}
                dayPatterns={dayPatterns}
                hourPatterns={hourPatterns}
                siteClassifications={siteClassifications}
                cellColor={cellColor}
                projection={projection}
                projectedLikelihood={projectedLikelihood}
                showRiskFeedback={false}
              />
            </div>

            {/* CENTER COLUMN: Predictive Simulation */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider border-b border-surface-200 pb-2 flex items-center gap-2">
                <Sliders size={14} className="text-primary-500" />
                Simulation
              </h3>
              <SimulationPanel
                currentHazard={hazard}
                hazardIncidents={hazardIncidents}
                factorData={factorData}
                dayPatterns={dayPatterns}
                onProjectionChange={handleProjectionChange}
                renderImpactSummary={false}
              />
            </div>

            {/* RIGHT COLUMN: Live Feedback (sticky) */}
            <div className="space-y-3 lg:sticky lg:top-0 lg:self-start">
              <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider border-b border-surface-200 pb-2">
                Live Feedback
              </h3>

              {/* Mini Risk Matrix */}
              {hazard?.likelihood && hazard?.consequence && (
                <MiniRiskMatrix
                  likelihood={hazard.likelihood}
                  consequence={hazard.consequence}
                  projectedLikelihood={projectedLikelihood}
                />
              )}

              {/* Projected Impact */}
              {projection?.factorsAddressed > 0 && (
                <InterventionImpactSummary projection={projection} />
              )}

              {/* Calculation Breakdown */}
              {hazard?.likelihood && hazard?.consequence && (
                <CalculationBreakdownPanel
                  hazard={hazard}
                  projectedLikelihood={projectedLikelihood}
                  projection={projection}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ============================================================================
// TRUE RISK MATRIX VIEW (Likelihood x Impact, score-based classification)
// ============================================================================

const RiskMatrixLegend = () => (
  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-surface-600">
    <div className="flex items-center gap-2 sm:gap-3">
      <span className="text-[10px] text-surface-400 uppercase tracking-wider">Risk:</span>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded" style={{ backgroundColor: '#dc2626', border: '1px solid #991b1b' }} />
        <span className="font-medium text-red-700">V.High <span className="text-[10px] text-surface-400">(20-25)</span></span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded" style={{ backgroundColor: '#f87171', border: '1px solid #ef4444' }} />
        <span className="font-medium text-red-600">High <span className="text-[10px] text-surface-400">(10-19)</span></span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded" style={{ backgroundColor: '#eab308', border: '1px solid #ca8a04' }} />
        <span className="font-medium text-yellow-700">Medium <span className="text-[10px] text-surface-400">(5-9)</span></span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded" style={{ backgroundColor: '#84cc16', border: '1px solid #65a30d' }} />
        <span className="font-medium text-lime-700">Low <span className="text-[10px] text-surface-400">(3-4)</span></span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded" style={{ backgroundColor: '#22c55e', border: '1px solid #16a34a' }} />
        <span className="font-medium text-green-700">V.Low <span className="text-[10px] text-surface-400">(1-2)</span></span>
      </div>
    </div>
  </div>
)

/**
 * HazardChip - Compact badge for a hazard in a risk matrix cell
 */
const HazardChip = ({ hazard, onClick }) => {
  const zone = hazard.zone
  return (
    <button
      onClick={() => onClick(hazard)}
      className={`${zone.chipBg} ${zone.chipText} ${zone.chipBorder} border
                  px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-medium
                  truncate max-w-full transition-all hover:scale-105 hover:shadow-sm cursor-pointer`}
      title={`${hazard.name} — L${hazard.likelihood} x I${hazard.consequence} = ${hazard.riskScore} (${zone.label})`}
    >
      {hazard.name}
    </button>
  )
}

/**
 * RiskMatrixCell - A cell in the true L x C grid with HSL gradient background
 * Shows "Level - Score" label centered, hazard chips below
 */
const RiskMatrixCell = ({ likelihood, consequence, hazards, onClick }) => {
  const score = likelihood * consequence
  const hasHazards = hazards.length > 0
  const scoreColor = getScoreColor(score)
  const label = getScoreLabel(likelihood, consequence)

  return (
    <div
      className={`${hasHazards ? 'border-2 shadow-sm' : 'border'}
                  rounded p-1 sm:p-1.5 flex flex-col items-center justify-center gap-0.5 overflow-hidden`}
      style={{
        backgroundColor: scoreColor.backgroundColor,
        color: scoreColor.color,
        borderColor: scoreColor.borderColor,
      }}
    >
      {/* Level - Score label */}
      <span className="text-[9px] sm:text-[11px] font-bold leading-tight text-center whitespace-nowrap">
        {label}
      </span>

      {/* Hazard chips */}
      {hazards.length > 0 && (
        <div className="flex flex-wrap gap-0.5 justify-center overflow-y-auto w-full">
          {hazards.map(h => (
            <HazardChip key={h.name} hazard={h} onClick={onClick} />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * RiskMatrixView - True 5x5 Likelihood x Impact grid (score-based)
 * Columns reversed: L5 (left) → L1 (right) so highest risk is top-left
 */
const RiskMatrixView = ({ matrixData, allIncidents, onHazardClick }) => {
  // Build 5x5 grid: grid[consequence][likelihood] = [hazards]
  const grid = useMemo(() => {
    const g = {}
    for (let c = 1; c <= 5; c++) {
      g[c] = {}
      for (let l = 1; l <= 5; l++) {
        g[c][l] = []
      }
    }
    if (matrixData?.hazards) {
      for (const h of matrixData.hazards) {
        if (h.consequence >= 1 && h.consequence <= 5 && h.likelihood >= 1 && h.likelihood <= 5) {
          g[h.consequence][h.likelihood].push(h)
        }
      }
    }
    return g
  }, [matrixData])

  // Stats summary
  const stats = useMemo(() => {
    if (!matrixData?.hazards?.length) return null
    const zones = { veryHigh: 0, high: 0, medium: 0, low: 0, veryLow: 0 }
    matrixData.hazards.forEach(h => { zones[h.zone.level] = (zones[h.zone.level] || 0) + 1 })
    return { total: matrixData.hazards.length, ...zones, totalDays: matrixData.totalDays, isAdaptive: matrixData.isAdaptive }
  }, [matrixData])

  if (!matrixData?.hazards?.length) return null

  return (
    <div className="space-y-3">
      {/* Stats row */}
      {stats && (
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="text-surface-500">{stats.total} hazards plotted over {stats.totalDays} days</span>
          {stats.isAdaptive && (
            <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              <Info size={11} />
              Adaptive thresholds (dataset &lt;90 days)
            </span>
          )}
          {stats.veryHigh > 0 && <span className="font-semibold text-red-700">{stats.veryHigh} Very High</span>}
          {stats.high > 0 && <span className="font-semibold text-red-600">{stats.high} High</span>}
          {stats.medium > 0 && <span className="font-semibold text-yellow-700">{stats.medium} Medium</span>}
          {stats.low > 0 && <span className="font-semibold text-emerald-700">{stats.low} Low</span>}
          {stats.veryLow > 0 && <span className="font-semibold text-green-700">{stats.veryLow} Very Low</span>}
        </div>
      )}

      {/* Matrix Grid — single CSS grid, columns reversed (L5 left → L1 right) */}
      <div className="bg-white rounded-xl border border-surface-200 p-3 sm:p-5">
        <div
          className="w-full"
          style={{
            display: 'grid',
            gridTemplateColumns: '4.5rem repeat(5, 1fr)',
            gridTemplateRows: 'auto auto repeat(5, minmax(80px, 1fr))',
            gap: '4px 5px',
            minHeight: 'calc(100vh - 290px)',
          }}
        >
          {/* Row 0: empty corner + "← Likelihood" spanning data cols */}
          <div />
          <div
            style={{ gridColumn: '2 / -1' }}
            className="text-center text-[10px] font-semibold text-surface-400 uppercase tracking-widest pb-0.5"
          >
            &larr; Likelihood
          </div>

          {/* Row 1: "Impact ↓" + column headers */}
          <div className="flex items-end justify-end pr-2 pb-0.5">
            <span className="text-[10px] font-semibold text-surface-400 uppercase tracking-widest leading-tight">
              Impact&nbsp;&darr;
            </span>
          </div>
          {[5, 4, 3, 2, 1].map(l => (
            <div key={`lh-${l}`} className="text-center pb-0.5">
              <span className="text-[10px] sm:text-xs font-bold text-surface-700">{l}</span>
              <p className="text-[8px] sm:text-[10px] text-surface-400 leading-tight">{LIKELIHOOD_LABELS[l]}</p>
            </div>
          ))}

          {/* Rows 2-6: data rows (Impact 5 → 1) */}
          {[5, 4, 3, 2, 1].map(c => (
            <React.Fragment key={`row-${c}`}>
              {/* Row label */}
              <div className="flex items-center justify-end pr-2">
                <div className="text-right">
                  <span className="text-[10px] sm:text-xs font-bold text-surface-700">{c}</span>
                  <p className="text-[8px] sm:text-[10px] text-surface-400 leading-tight">{CONSEQUENCE_LABELS[c]}</p>
                </div>
              </div>
              {/* 5 data cells — reversed: L5, L4, L3, L2, L1 */}
              {[5, 4, 3, 2, 1].map(l => (
                <RiskMatrixCell
                  key={`cell-${l}-${c}`}
                  likelihood={l}
                  consequence={c}
                  hazards={grid[c][l]}
                  onClick={onHazardClick}
                />
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}


// ============================================================================
// MAIN COMPONENT
// ============================================================================

const HazardRiskMatrix = ({
  sortedHazards,
  negativeIncidents,
  filteredIncidents,
  factorData,
  period,
  siteClassifications = {},
  matrixData: matrixDataProp,
}) => {
  const [selectedHazard, setSelectedHazard] = useState(null)
  const [selectedCellColor, setSelectedCellColor] = useState(null)

  // True Risk Matrix data (L x C placement)
  // Use prop if provided, otherwise compute internally (backward compat)
  const matrixDataInternal = useMemo(() => {
    if (matrixDataProp) return matrixDataProp
    return plotHazardsOnMatrix(filteredIncidents, sortedHazards)
  }, [matrixDataProp, filteredIncidents, sortedHazards])
  const matrixData = matrixDataInternal

  // Handle clicks from the true risk matrix view
  const handleMatrixHazardClick = useCallback((hazard) => {
    setSelectedHazard(hazard)
    setSelectedCellColor(hazard.zone || null)
  }, [])

  const handleCloseModal = useCallback(() => {
    setSelectedHazard(null)
    setSelectedCellColor(null)
  }, [])

  const hazardIncidents = useMemo(() => {
    if (!selectedHazard || !negativeIncidents?.length) return []
    return negativeIncidents.filter(i => i.location === selectedHazard.name)
  }, [selectedHazard, negativeIncidents])

  const hazardFactors = useMemo(() => {
    if (!selectedHazard || !factorData?.byFactor || !hazardIncidents.length) return []
    const hazardIncidentIds = new Set(hazardIncidents.map(i => i.id))
    return factorData.byFactor
      .filter(f => !f.isUnclassified && f.name !== 'Unclassified')
      .map(factor => {
        const matchingIncidents = (factor.incidents || []).filter(inc => hazardIncidentIds.has(inc.id))
        return { name: factor.name, count: matchingIncidents.length, percentage: hazardIncidents.length > 0 ? (matchingIncidents.length / hazardIncidents.length) * 100 : 0 }
      })
      .filter(f => f.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [selectedHazard, factorData, hazardIncidents])

  const dayPatterns = useMemo(() => hazardIncidents.length ? getDayOfWeekPatterns(hazardIncidents) : null, [hazardIncidents])
  const hourPatterns = useMemo(() => hazardIncidents.length ? getHourlyPatterns(hazardIncidents) : null, [hazardIncidents])

  const hasMatrixData = matrixData?.hazards?.length > 0

  if (!hasMatrixData) {
    return (
      <div className="bg-white rounded-xl border border-surface-200 p-10 text-center">
        <div className="w-16 h-16 rounded-full bg-surface-100 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={32} className="text-surface-400" />
        </div>
        <h2 className="text-lg font-bold text-surface-800 mb-2">No Hazard Data Available</h2>
        <p className="text-sm text-surface-500 max-w-md mx-auto">
          No hazards found for the selected period. Try importing more observations or adjusting your filters.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-surface-800">Hazard Risk Matrix</h2>
          <p className="text-xs text-surface-500 mt-0.5">
            Hazards plotted by Likelihood × Impact. Score = L × C. Click any hazard for detailed analysis.
          </p>
        </div>
        <RiskMatrixLegend />
      </div>

      <RiskMatrixView
        matrixData={matrixData}
        allIncidents={filteredIncidents}
        onHazardClick={handleMatrixHazardClick}
      />

      <HazardDetailModal
        isOpen={!!selectedHazard}
        onClose={handleCloseModal}
        hazard={selectedHazard}
        hazardIncidents={hazardIncidents}
        hazardFactors={hazardFactors}
        dayPatterns={dayPatterns}
        hourPatterns={hourPatterns}
        factorData={factorData}
        siteClassifications={siteClassifications}
        cellColor={selectedCellColor}
      />
    </div>
  )
}

export default React.memo(HazardRiskMatrix)
