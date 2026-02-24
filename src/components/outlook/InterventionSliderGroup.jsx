import React, { useState, useMemo } from 'react'
import { ChevronDown, ChevronUp, Settings, Shield, User, Leaf, HelpCircle, Target } from 'lucide-react'
import { CONTROL_HIERARCHY, getTopKeywordsForFactor } from '../insights/ScenarioSimulatorEngine'

// Category icons and colors
const CATEGORY_CONFIG = {
  engineering: {
    icon: Settings,
    color: 'blue',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    sliderClass: 'engineering'
  },
  administrative: {
    icon: Shield,
    color: 'indigo',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-200',
    sliderClass: 'administrative'
  },
  ppe: {
    icon: User,
    color: 'amber',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
    sliderClass: 'ppe'
  },
  environmental: {
    icon: Leaf,
    color: 'green',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
    sliderClass: 'environmental'
  }
}

/**
 * InterventionSliderGroup - Accordion-style collapsible slider groups
 *
 * Features:
 * - Shows summary when collapsed: "Engineering: 2 factors, +45% avg"
 * - Expand one category at a time
 * - Only shows factors relevant to selected hazard(s)
 */
const InterventionSliderGroup = ({
  slidersByCategory,
  sliders,
  onSliderChange,
  factorData,
  selectedHazards = [],
  expandedCategory,
  onToggleCategory
}) => {
  // Calculate category summaries
  const categorySummaries = useMemo(() => {
    const summaries = {}

    for (const [categoryKey, categorySliders] of Object.entries(slidersByCategory)) {
      if (categorySliders.length === 0) {
        summaries[categoryKey] = null
        continue
      }

      const activeSliders = categorySliders.filter(s => sliders[s.id] !== undefined && sliders[s.id] !== 0)
      const totalValue = activeSliders.reduce((sum, s) => sum + (sliders[s.id] || 0), 0)
      const avgValue = activeSliders.length > 0 ? Math.round(totalValue / activeSliders.length) : 0

      summaries[categoryKey] = {
        factorCount: categorySliders.length,
        activeCount: activeSliders.length,
        avgValue,
        hasChanges: activeSliders.length > 0
      }
    }

    return summaries
  }, [slidersByCategory, sliders])

  return (
    <div className="space-y-2">
      {Object.entries(slidersByCategory).map(([categoryKey, categorySliders]) => {
        if (categorySliders.length === 0) return null

        const category = CONTROL_HIERARCHY[categoryKey]
        const config = CATEGORY_CONFIG[categoryKey]
        const Icon = config.icon
        const summary = categorySummaries[categoryKey]
        const isExpanded = expandedCategory === categoryKey

        return (
          <div
            key={categoryKey}
            className={`border rounded-lg overflow-hidden transition-all ${
              isExpanded ? config.borderColor : 'border-surface-200'
            }`}
          >
            {/* Accordion Header */}
            <button
              type="button"
              onClick={() => onToggleCategory(categoryKey)}
              className={`w-full flex items-center justify-between px-3 py-2 transition-colors ${
                isExpanded ? config.bgColor : 'bg-surface-50 hover:bg-surface-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon size={16} className={isExpanded ? config.textColor : 'text-surface-500'} />
                <span className={`text-sm font-medium ${isExpanded ? config.textColor : 'text-surface-700'}`}>
                  {category.name}
                </span>
                {summary?.hasChanges && (
                  <span className={`text-2xs px-1.5 py-0.5 rounded-full ${
                    summary.avgValue > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {summary.avgValue > 0 ? '+' : ''}{summary.avgValue}% avg
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Factor count */}
                <span className="text-2xs text-surface-500">
                  {summary?.factorCount} factors
                </span>
                {/* Effectiveness badge */}
                <span className="text-2xs bg-surface-200 text-surface-600 px-1.5 py-0.5 rounded">
                  {Math.round(category.effectiveness * 100)}%
                </span>
                {/* Expand icon */}
                {isExpanded ? (
                  <ChevronUp size={16} className="text-surface-400" />
                ) : (
                  <ChevronDown size={16} className="text-surface-400" />
                )}
              </div>
            </button>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="px-3 py-3 space-y-3 bg-white border-t border-surface-100">
                {categorySliders.map(slider => {
                  // Get top keywords for this factor
                  const hazardName = selectedHazards.length === 1 ? selectedHazards[0] : 'all'
                  const topKeywords = getTopKeywordsForFactor(
                    factorData,
                    slider.factor,
                    hazardName,
                    3
                  )

                  return (
                    <CompactSlider
                      key={slider.id}
                      slider={slider}
                      value={sliders[slider.id] || 0}
                      onChange={(value) => onSliderChange(slider.id, value)}
                      colorClass={config.sliderClass}
                      effectiveness={category.effectiveness}
                      topKeywords={topKeywords}
                    />
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/**
 * CompactSlider - Individual slider component (simplified from UnifiedPredictivePanel)
 */
const CompactSlider = ({
  slider,
  value,
  onChange,
  colorClass,
  effectiveness,
  topKeywords = []
}) => {
  const [showDetails, setShowDetails] = useState(false)

  const displayValue = value > 0 ? `+${value}` : value.toString()
  const isPositive = value > 0
  const isNegative = value < 0
  const sources = slider.sources || {}

  // Calculate actual impact
  const actualImpact = slider.prevalence && effectiveness
    ? (slider.prevalence * effectiveness * (value / 100)).toFixed(1)
    : 0

  return (
    <div className="space-y-1.5">
      {/* Label Row */}
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0 flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-medium text-surface-700">{slider.label}</span>
          {/* Relevance badges */}
          {sources.expert && (
            <span
              className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-700"
              title={sources.expertAction ? `Recommended: ${sources.expertAction}` : 'Expert recommended for this hazard'}
            >
              Expert
            </span>
          )}
          {sources.temporal && (
            <span
              className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700"
              title={`Higher impact on ${sources.peakDays?.join(', ') || 'peak days'}`}
            >
              Peak Time
            </span>
          )}
          {sources.data && !sources.expert && (
            <span
              className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700"
              title="Detected in your incident data"
            >
              Data
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Prevalence badge */}
          {slider.prevalence !== null && slider.prevalence !== undefined && (
            <span className="text-2xs bg-surface-100 text-surface-500 px-1.5 py-0.5 rounded">
              {slider.prevalence.toFixed(1)}%
            </span>
          )}
          {/* Value display */}
          <span className={`text-sm font-bold min-w-[50px] text-right ${
            isPositive ? 'text-green-600' : isNegative ? 'text-red-500' : 'text-surface-500'
          }`}>
            {displayValue}%
          </span>
        </div>
      </div>

      {/* Slider */}
      <input
        type="range"
        min={-50}
        max={100}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className={`unified-slider ${colorClass} w-full block`}
      />

      {/* Labels Row */}
      <div className="flex justify-between text-2xs text-surface-400">
        <span>reduce</span>
        {slider.maxReduction !== undefined && (
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-0.5 text-primary-600 hover:text-primary-700 transition-colors"
          >
            <HelpCircle size={10} />
            <span>Max: -{slider.maxReduction.toFixed(1)}%</span>
          </button>
        )}
        <span>increase</span>
      </div>

      {/* Details Panel */}
      {showDetails && (
        <div className="mt-2 p-2 bg-surface-50 rounded-lg border border-surface-200 text-xs space-y-2">
          {/* Impact calculation */}
          <div className="flex items-center justify-between text-2xs">
            <span className="text-surface-500">
              {slider.prevalence?.toFixed(1)}% × {(effectiveness * 100).toFixed(0)}% × {value}%
            </span>
            <span className={`font-bold ${parseFloat(actualImpact) > 0 ? 'text-green-600' : parseFloat(actualImpact) < 0 ? 'text-red-500' : 'text-surface-600'}`}>
              = {parseFloat(actualImpact) > 0 ? '-' : ''}{Math.abs(parseFloat(actualImpact)).toFixed(1)}%
            </span>
          </div>

          {/* Top keywords */}
          {topKeywords.length > 0 && (
            <div className="space-y-1">
              <span className="text-2xs text-surface-500 flex items-center gap-1">
                <Target size={10} /> Top contributors:
              </span>
              <div className="flex flex-wrap gap-1">
                {topKeywords.map((kw, idx) => (
                  <span key={idx} className="text-2xs bg-white px-1.5 py-0.5 rounded border border-surface-200">
                    {kw.keyword} ({kw.count})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default React.memo(InterventionSliderGroup)
