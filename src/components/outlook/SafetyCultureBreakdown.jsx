import React, { useMemo, useState, useCallback } from 'react'
import { Lightbulb, SlidersHorizontal } from 'lucide-react'
import { calculateSafetyCultureScore } from '../../utils/insightsCalculations'

const CULTURE_LABELS = {
  velocity: 'Engagement Velocity',
  diversity: 'Reporter Diversity',
  proactive: 'Proactive Ratio',
  leadership: 'Leadership Visibility'
}

const PRESET_LABELS = {
  balanced: 'Balanced',
  operations: 'Operations',
  culture: 'Culture',
  compliance: 'Compliance'
}

const CULTURE_WEIGHT_RANGE = { min: 5, max: 60 }

/**
 * Normalize weights so they always sum to 100.
 * Distributes remaining weight proportionally, applies min/max,
 * and corrects rounding residual on the largest weight.
 */
const normalizeWeights = (key, newValue, weights) => {
  if (newValue === weights[key]) return weights

  const otherKeys = Object.keys(weights).filter(k => k !== key)
  const remaining = 100 - newValue
  const updated = { ...weights, [key]: newValue }

  const otherSum = otherKeys.reduce((s, k) => s + weights[k], 0)

  if (otherSum > 0) {
    let allocated = 0
    otherKeys.forEach((k, idx) => {
      if (idx === otherKeys.length - 1) {
        updated[k] = Math.min(CULTURE_WEIGHT_RANGE.max, Math.max(CULTURE_WEIGHT_RANGE.min, remaining - allocated))
      } else {
        const proportion = weights[k] / otherSum
        const target = Math.round(remaining * proportion)
        updated[k] = Math.min(CULTURE_WEIGHT_RANGE.max, Math.max(CULTURE_WEIGHT_RANGE.min, target))
        allocated += updated[k]
      }
    })
  } else {
    const each = Math.floor(remaining / otherKeys.length)
    otherKeys.forEach(k => { updated[k] = Math.max(CULTURE_WEIGHT_RANGE.min, each) })
  }

  // Final correction
  const sum = Object.values(updated).reduce((s, v) => s + v, 0)
  if (sum !== 100) {
    const sortedOthers = [...otherKeys].sort((a, b) => updated[b] - updated[a])
    for (const k of sortedOthers) {
      const adjusted = updated[k] + (100 - sum)
      if (adjusted >= CULTURE_WEIGHT_RANGE.min && adjusted <= CULTURE_WEIGHT_RANGE.max) {
        updated[k] = adjusted
        break
      }
    }
  }

  return updated
}

/**
 * SafetyCultureBreakdown - Shows weighted component bars + recommendations
 * With inline weight editor for director customization
 */
const SafetyCultureBreakdown = ({
  filteredIncidents,
  cultureWeights,
  onCultureWeightsChange,
  presetProfile,
  onPresetChange,
  presets
}) => {
  const [showEditor, setShowEditor] = useState(false)

  const cultureData = useMemo(() => {
    if (!filteredIncidents?.length) return null
    return calculateSafetyCultureScore(filteredIncidents, cultureWeights)
  }, [filteredIncidents, cultureWeights])

  const handleSliderChange = useCallback((key, value) => {
    const newWeights = normalizeWeights(key, value, cultureWeights)
    onCultureWeightsChange(newWeights)
  }, [cultureWeights, onCultureWeightsChange])

  if (!cultureData) {
    return (
      <div className="bg-white rounded-lg border border-surface-200 p-4 text-center text-sm text-surface-500">
        Insufficient data for culture breakdown.
      </div>
    )
  }

  const getBarColor = (score) => {
    if (score >= 70) return 'bg-green-500'
    if (score >= 50) return 'bg-amber-500'
    return 'bg-red-500'
  }

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-green-600'
    if (score >= 50) return 'text-amber-600'
    return 'text-red-600'
  }

  return (
    <div className="bg-white rounded-lg border border-surface-200 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-surface-800">Safety Culture Breakdown</h3>
          <button
            onClick={() => setShowEditor(e => !e)}
            aria-expanded={showEditor}
            aria-controls="culture-weight-editor"
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
        <span className={`text-sm font-bold ${getScoreColor(cultureData.score)}`}>
          {cultureData.score}/100
        </span>
      </div>

      {/* Preset selector - visible when editor is open */}
      {showEditor && (
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
      )}

      {/* Component Bars with optional sliders */}
      <div className="space-y-3">
        {cultureData.components.map((component) => {
          const weightKey = Object.keys(CULTURE_LABELS).find(k => CULTURE_LABELS[k] === component.name)
          const currentWeight = weightKey ? cultureWeights[weightKey] : component.weight

          return (
            <div key={component.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-surface-600 font-medium">
                  {component.name}
                  <span className="text-surface-400 ml-1">({currentWeight}%)</span>
                </span>
                <span className={`font-semibold ${getScoreColor(component.score)}`}>
                  {component.score}
                </span>
              </div>

              {/* Weight slider - visible when editor is open */}
              {showEditor && weightKey && (
                <div className="flex items-center gap-2 pl-0.5">
                  <input
                    type="range"
                    min={5}
                    max={60}
                    value={currentWeight}
                    onChange={(e) => handleSliderChange(weightKey, parseInt(e.target.value))}
                    aria-label={`${component.name} weight: ${currentWeight}%`}
                    className="unified-slider engineering flex-1 h-1.5"
                  />
                  <span className="text-2xs text-surface-500 font-mono w-7 text-right" aria-live="polite">{currentWeight}%</span>
                </div>
              )}

              <div className="h-2.5 bg-surface-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getBarColor(component.score)}`}
                  style={{ width: `${Math.max(2, component.score)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Recommendations */}
      {cultureData.recommendations.length > 0 && (
        <div className="pt-3 border-t border-surface-100">
          <div className="flex items-center gap-1.5 mb-2">
            <Lightbulb size={14} className="text-amber-500" />
            <span className="text-xs font-semibold text-surface-600">Recommendations</span>
          </div>
          <ul className="space-y-1.5">
            {cultureData.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-surface-600">
                <span className="text-surface-400 mt-0.5">-</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default React.memo(SafetyCultureBreakdown)
