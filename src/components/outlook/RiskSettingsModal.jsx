import React, { useCallback } from 'react'
import { SlidersHorizontal, Target, RotateCcw, AlertTriangle, Info } from 'lucide-react'
import Modal from '../common/Modal'
import {
  SIGNAL_LABELS,
  SIGNAL_KEYS,
  DEFAULT_THRESHOLDS,
  getSignalDotColor
} from '../../utils/signalConstants'

const WEIGHT_LABELS = {
  severityMix: 'Injury Severity',
  trend: 'Trend (30d)',
  openActionRate: 'Open Actions',
  highRiskExposure: 'High-Risk Exp.',
  nearMissRate: 'Near-Miss Rate',
  positiveRate: 'Positive Rate'
}

const WEIGHT_HINTS = {
  nearMissRate: { inverted: true },
  positiveRate: { inverted: true }
}

const WEIGHT_RANGES = {
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

const PRESET_LABELS = {
  balanced: 'Balanced',
  operations: 'Operations',
  culture: 'Culture',
  compliance: 'Compliance'
}

/**
 * RiskSettingsModal - Unified modal for Risk Weights + Signal Thresholds
 * Both settings persist to localStorage and apply globally
 */
const RiskSettingsModal = ({
  isOpen,
  onClose,
  // Weights
  entityWeights,
  setEntityWeights,
  presetProfile,
  setPresetProfile,
  // Thresholds
  thresholds,
  onThresholdChange,
  signals
}) => {
  // Weight handlers
  const handlePresetChange = useCallback((key) => {
    setEntityWeights(PRESETS[key])
    setPresetProfile(key)
  }, [setEntityWeights, setPresetProfile])

  const handleWeightChange = useCallback((key, value) => {
    const range = WEIGHT_RANGES[key] || { min: 5, max: 50 }
    const clamped = Math.min(range.max, Math.max(range.min, value))
    setEntityWeights(prev => ({ ...prev, [key]: clamped }))
    setPresetProfile('custom')
  }, [setEntityWeights, setPresetProfile])

  // Threshold handlers
  const handleResetThresholds = useCallback(() => {
    SIGNAL_KEYS.forEach((key) => {
      onThresholdChange(key, DEFAULT_THRESHOLDS[key])
    })
  }, [onThresholdChange])

  const hasThresholdChanges = SIGNAL_KEYS.some(k => thresholds[k] !== DEFAULT_THRESHOLDS[k])

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Risk & Signal Settings" size="md">
      {/* Section 1: Risk Weights */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <SlidersHorizontal size={16} className="text-primary-500" />
          <h3 className="text-sm font-semibold text-surface-800">Risk Weights</h3>
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
                  ? 'bg-primary-500 text-white'
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
        <div className="space-y-2">
          {Object.entries(WEIGHT_LABELS).map(([key, label]) => {
            const hint = WEIGHT_HINTS[key]
            const range = WEIGHT_RANGES[key] || { min: 5, max: 50 }
            return (
              <div key={key} className="flex items-center gap-2">
                <span className={`text-2xs w-28 truncate flex-shrink-0 ${
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
                  onChange={(e) => handleWeightChange(key, parseInt(e.target.value))}
                  className="unified-slider risk-weight flex-1 h-1.5"
                />
                <span className="text-2xs text-surface-500 font-mono w-7 text-right">
                  {entityWeights[key]}%
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-surface-200 my-4" />

      {/* Section 2: Signal Thresholds */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target size={16} className="text-red-500" />
            <h3 className="text-sm font-semibold text-surface-800">Signal Thresholds</h3>
          </div>
          <button
            onClick={handleResetThresholds}
            disabled={!hasThresholdChanges}
            className={`flex items-center gap-1 text-2xs ${
              hasThresholdChanges ? 'text-surface-500 hover:text-surface-700' : 'text-surface-300 cursor-not-allowed'
            }`}
          >
            <RotateCcw size={10} />
            Reset
          </button>
        </div>

        {/* Threshold sliders */}
        <div className="space-y-2">
          {SIGNAL_KEYS.map((key) => {
            const label = SIGNAL_LABELS[key]
            const threshold = thresholds[key] ?? 60
            const score = signals?.[key]?.score ?? 0
            const dotColor = getSignalDotColor(score)

            return (
              <div key={key} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
                <span className="text-2xs text-surface-600 w-28 truncate">{label}</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={threshold}
                  onChange={(e) => onThresholdChange(key, Number(e.target.value))}
                  className="unified-slider threshold flex-1 h-1.5"
                />
                <span className="text-2xs font-semibold text-red-600 w-6 text-right tabular-nums">
                  {threshold}
                </span>
              </div>
            )
          })}
        </div>

        {/* Info note */}
        <div className="flex items-start gap-1.5 mt-3 pt-2 border-t border-surface-100">
          <Info size={10} className="text-blue-400 mt-0.5 flex-shrink-0" />
          <p className="text-2xs text-blue-600 leading-relaxed">
            Thresholds define the alert level shown on radar charts. Signals exceeding their threshold pulse red.
          </p>
        </div>
      </div>
    </Modal>
  )
}

export default React.memo(RiskSettingsModal)
