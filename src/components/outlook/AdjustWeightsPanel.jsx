import React, { useState, useCallback } from 'react'
import { SlidersHorizontal, X, AlertTriangle, Info } from 'lucide-react'

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
  severityMix: { inverted: false },
  trend: { inverted: false },
  openActionRate: { inverted: false },
  highRiskExposure: { inverted: false },
  nearMissRate: { inverted: true },
  positiveRate: { inverted: true }
}

const SIGNAL_RANGES = {
  severityMix: { min: 5, max: 35 },
  trend: { min: 5, max: 30 },
  openActionRate: { min: 5, max: 35 },
  highRiskExposure: { min: 5, max: 25 },
  nearMissRate: { min: 5, max: 10 },
  positiveRate: { min: 5, max: 20 }
}

const PRESETS = {
  balanced: { severityMix: 25, trend: 20, openActionRate: 20, highRiskExposure: 15, nearMissRate: 10, positiveRate: 10 },
  operations: { severityMix: 30, trend: 25, openActionRate: 20, highRiskExposure: 15, nearMissRate: 5, positiveRate: 5 },
  culture: { severityMix: 20, trend: 20, openActionRate: 20, highRiskExposure: 10, nearMissRate: 10, positiveRate: 20 },
  compliance: { severityMix: 20, trend: 15, openActionRate: 30, highRiskExposure: 20, nearMissRate: 10, positiveRate: 5 }
}

/**
 * AdjustWeightsPanel - Floating glassmorphism panel for weight configuration
 * Fixed position bottom-right, collapsible with smooth animation
 */
const AdjustWeightsPanel = ({
  entityWeights,
  setEntityWeights,
  presetProfile,
  setPresetProfile
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const handlePresetChange = useCallback((key) => {
    const preset = PRESETS[key]
    if (preset) {
      setEntityWeights(preset)
      setPresetProfile(key)
    }
  }, [setEntityWeights, setPresetProfile])

  const handleSliderChange = useCallback((key, value) => {
    const range = SIGNAL_RANGES[key] || { min: 5, max: 50 }
    const clamped = Math.min(range.max, Math.max(range.min, value))
    setEntityWeights(prev => ({ ...prev, [key]: clamped }))
    setPresetProfile('custom')
  }, [setEntityWeights, setPresetProfile])

  return (
    <div className="adjust-panel-floating">
      {/* Collapsed: Trigger button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="adjust-panel-trigger flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-surface-600 hover:text-surface-800 transition-all"
          aria-label="Open weight configuration"
        >
          <SlidersHorizontal size={14} />
          Adjust
        </button>
      )}

      {/* Expanded: Full panel */}
      {isOpen && (
        <div className="adjust-panel-expanded">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal size={14} className="text-primary-500" />
              <h3 className="text-sm font-semibold text-surface-800">Weight Configuration</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded hover:bg-surface-100 text-surface-400 hover:text-surface-600 transition-colors"
              aria-label="Close weight configuration"
            >
              <X size={16} />
            </button>
          </div>

          {/* Preset pills */}
          <div className="flex items-center gap-1.5 flex-wrap mb-3">
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
              <span className="px-2 py-0.5 rounded-full text-2xs font-medium bg-amber-100 text-amber-700">
                Custom
              </span>
            )}
          </div>

          {/* Weight sliders */}
          <div className="space-y-2 mb-3">
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
                  <span className="text-2xs text-surface-500 font-mono w-7 text-right" aria-live="polite">
                    {entityWeights[key]}%
                  </span>
                </div>
              )
            })}
          </div>

          {/* Footer info */}
          <div className="flex items-start gap-1.5 pt-2 border-t border-surface-100">
            <Info size={10} className="text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-2xs text-blue-600 leading-relaxed">
              Inverted signals (Near-Miss, Positive) score higher when reporting is low — indicating potential under-reporting.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default React.memo(AdjustWeightsPanel)
