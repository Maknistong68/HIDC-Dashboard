import React, { memo, useCallback, useRef } from 'react'
import { Settings, Shield, User, CheckCircle, RotateCcw } from 'lucide-react'
import { QUICK_ACTION_PRESETS } from '../../utils/constants'

const ICON_MAP = { Settings, Shield, User, CheckCircle }

const PRESET_COLORS = {
  blue: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  indigo: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
  amber: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
  green: 'bg-green-100 text-green-700 hover:bg-green-200',
}

const RISK_LEVELS = {
  HIGH: { label: 'HIGH', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  MEDIUM: { label: 'MEDIUM', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  LOW: { label: 'LOW', bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
}

function getRiskLevel(probability) {
  if (probability >= 70) return RISK_LEVELS.HIGH
  if (probability >= 40) return RISK_LEVELS.MEDIUM
  return RISK_LEVELS.LOW
}

/**
 * Compact factor slider for the forecast simulator.
 */
const CompactSlider = memo(({ slider, value, onChange }) => {
  const normalizedValue = ((value + 50) / 150) * 100
  const sources = slider.sources || {}

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs font-medium text-surface-700 truncate">{slider.label}</span>
          {sources.expert && (
            <span className="flex-shrink-0 text-[8px] font-semibold px-1 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200" title={sources.expertAction || 'Expert recommended'}>
              Expert
            </span>
          )}
          {sources.temporal && (
            <span className="flex-shrink-0 text-[8px] font-semibold px-1 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200" title={sources.peakDays ? `Peak: ${sources.peakDays.join(', ')}` : 'Peak time'}>
              Peak Time
            </span>
          )}
          {!sources.expert && sources.data && (
            <span className="flex-shrink-0 text-[8px] font-semibold px-1 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">
              Data
            </span>
          )}
        </div>
        <span className={`text-[10px] font-semibold px-1 py-0.5 rounded flex-shrink-0 ${
          value > 0 ? 'bg-green-100 text-green-700' : value < 0 ? 'bg-red-100 text-red-700' : 'text-surface-400'
        }`}>
          {value > 0 ? '+' : ''}{value}%
        </span>
      </div>
      <div className="relative">
        <div className="absolute inset-0 h-1.5 rounded-full bg-surface-200" style={{ top: '50%', transform: 'translateY(-50%)' }} />
        <div className="absolute h-2 w-0.5 bg-surface-400 rounded-full" style={{ left: '33.33%', top: '50%', transform: 'translateY(-50%)' }} />
        <div
          className={`absolute h-1.5 rounded-full ${value >= 0 ? 'bg-green-400' : 'bg-red-400'} transition-all duration-150`}
          style={{
            top: '50%', transform: 'translateY(-50%)',
            left: value >= 0 ? '33.33%' : `${normalizedValue}%`,
            width: value >= 0 ? `${(value / 100) * 66.67}%` : `${33.33 - normalizedValue}%`
          }}
        />
        <input
          type="range" min="-50" max="100"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          className="relative w-full h-5 appearance-none bg-transparent cursor-pointer z-10"
        />
      </div>
    </div>
  )
})

CompactSlider.displayName = 'CompactSlider'

/**
 * ForecastSimulatorPanel - Inline simulation with sliders, presets, projected impact.
 */
const ForecastSimulatorPanel = ({
  sliders,
  sliderValues,
  onSliderChange,
  projection,
  baselineProbability,
  simulatedProbability,
  openActionsCount,
  actionsToClose,
  onActionsToCloseChange,
  onReset,
  onPreset,
  activePreset,
}) => {
  const hasActiveSimulation = Object.values(sliderValues).some(v => v !== 0) || actionsToClose > 0

  // Stable per-slider onChange callbacks
  const sliderCallbacksRef = useRef({})
  const getSliderOnChange = useCallback((sliderId) => {
    if (!sliderCallbacksRef.current[sliderId]) {
      sliderCallbacksRef.current[sliderId] = (v) => onSliderChange(sliderId, v)
    }
    return sliderCallbacksRef.current[sliderId]
  }, [onSliderChange])

  const effect = projection?.totalEffect || 0
  const isReduction = effect < 0

  const baselineRisk = getRiskLevel(baselineProbability)
  const simulatedRisk = getRiskLevel(simulatedProbability)

  return (
    <div className="bg-white rounded-lg border border-surface-200 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-surface-600 uppercase tracking-wider">Simulation</h4>
        {hasActiveSimulation && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-[10px] text-surface-500 hover:text-surface-700"
          >
            <RotateCcw size={10} />Reset
          </button>
        )}
      </div>

      {/* Quick preset pills */}
      <div className="flex flex-wrap gap-1.5">
        {QUICK_ACTION_PRESETS.map(preset => {
          const PresetIcon = ICON_MAP[preset.icon] || Settings
          return (
            <button
              key={preset.id}
              onClick={() => onPreset(preset.id)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                activePreset === preset.id
                  ? 'ring-2 ring-primary-400 ' + (PRESET_COLORS[preset.color] || PRESET_COLORS.blue)
                  : (PRESET_COLORS[preset.color] || PRESET_COLORS.blue) + ' opacity-80 hover:opacity-100'
              }`}
              title={preset.description}
            >
              <PresetIcon size={11} />
              {preset.label}
            </button>
          )
        })}
      </div>

      {/* Factor sliders + Close Actions (unified container) */}
      {(sliders.length > 0 || openActionsCount > 0) && (
        <div className="space-y-2.5">
          {sliders.map(slider => (
            <CompactSlider
              key={slider.id}
              slider={slider}
              value={sliderValues[slider.id] || 0}
              onChange={getSliderOnChange(slider.id)}
            />
          ))}

          {/* Close Actions slider — inline with factor sliders */}
          {openActionsCount > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-surface-700">Close Actions</span>
                <span className="text-[10px] font-semibold text-green-700 bg-green-100 px-1.5 py-0.5 rounded">
                  {actionsToClose} / {openActionsCount}
                </span>
              </div>
              <input
                type="range" min="0" max={openActionsCount}
                value={actionsToClose}
                onChange={(e) => onActionsToCloseChange(parseInt(e.target.value, 10))}
                className="w-full h-5 appearance-none bg-transparent cursor-pointer"
              />
            </div>
          )}
        </div>
      )}

      {/* Projected Impact card — always visible */}
      <div className={`rounded-lg border p-3 ${isReduction ? 'bg-green-50 border-green-200' : effect > 0 ? 'bg-red-50 border-red-200' : 'bg-surface-50 border-surface-200'}`}>
        <h5 className="text-[10px] font-semibold text-surface-500 uppercase tracking-wider mb-2">Projected Impact</h5>

        {/* Risk level badges with arrow + effect % */}
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded ${baselineRisk.bg} ${baselineRisk.text} ${baselineRisk.border} border`}>
            {baselineRisk.label}
          </span>
          {hasActiveSimulation && (
            <>
              <span className="text-surface-400">&rarr;</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${simulatedRisk.bg} ${simulatedRisk.text} ${simulatedRisk.border} border`}>
                {simulatedRisk.label}
              </span>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                isReduction ? 'bg-green-200 text-green-800' : effect > 0 ? 'bg-red-200 text-red-800' : 'bg-surface-200 text-surface-600'
              }`}>
                {effect > 0 ? '+' : ''}{effect}%
                {effect !== 0 && (
                  <span className="font-normal opacity-75 ml-0.5">
                    (&rarr; {Math.round(effect * 2.3) > 0 ? '+' : ''}{Math.round(effect * 2.3)}% by wk 4)
                  </span>
                )}
              </span>
            </>
          )}
        </div>

        {/* Probability detail */}
        <div className="text-xs text-surface-600">
          <span className="text-surface-500">Incident risk (4 wks): </span>
          <span className="font-medium">{baselineProbability}%</span>
          {hasActiveSimulation && (
            <>
              <span className="text-surface-300 mx-1">&rarr;</span>
              <span className={`font-bold ${simulatedProbability < baselineProbability ? 'text-green-700' : simulatedProbability > baselineProbability ? 'text-red-700' : 'text-surface-700'}`}>
                {simulatedProbability}%
              </span>
            </>
          )}
        </div>

        {/* Notes */}
        {(projection?.isCapped || projection?.hasDisminishingReturns) && (
          <p className="text-[9px] text-surface-400 mt-1.5 italic">
            {projection.isCapped && 'Effect capped at bounds. '}
            {projection.hasDisminishingReturns && 'Diminishing returns applied.'}
          </p>
        )}

        <p className="text-[9px] text-surface-400 mt-1.5 italic">
          Model estimates only &middot; Based on Poisson probability
        </p>
      </div>

      {/* Empty state */}
      {!hasActiveSimulation && sliders.length === 0 && openActionsCount === 0 && (
        <p className="text-xs text-surface-400 text-center py-2">
          No controllable factors detected for this hazard.
        </p>
      )}
    </div>
  )
}

export default memo(ForecastSimulatorPanel)
