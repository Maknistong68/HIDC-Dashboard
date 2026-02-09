import React, { useState, useMemo, useCallback } from 'react'
import {
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Target,
  Zap,
  BarChart3,
  CheckCircle2,
  Minus,
  AlertTriangle,
  Info
} from 'lucide-react'
import TrendingHazardSelector from './TrendingHazardSelector'
import QuickActionPanel from './QuickActionPanel'
import HazardSpecificActions from './HazardSpecificActions'
import InterventionSliderGroup from './InterventionSliderGroup'
import {
  CONTROL_HIERARCHY,
  calculateFactorPrevalence,
  generateDynamicSliders,
  calculateMultiHazardProjection
} from '../insights/ScenarioSimulatorEngine'

// Slider styles (reused from UnifiedPredictivePanel)
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
    width: 18px;
    height: 18px;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    margin-top: -5px;
  }
  .unified-slider::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  }
  .unified-slider.engineering {
    background: linear-gradient(to right, #fecaca 0%, #bfdbfe 50%, #d1fae5 100%);
  }
  .unified-slider.engineering::-webkit-slider-thumb { background: #3b82f6; }
  .unified-slider.engineering::-moz-range-thumb { background: #3b82f6; }
  .unified-slider.administrative {
    background: linear-gradient(to right, #fecaca 0%, #e0e7ff 50%, #d1fae5 100%);
  }
  .unified-slider.administrative::-webkit-slider-thumb { background: #6366f1; }
  .unified-slider.administrative::-moz-range-thumb { background: #6366f1; }
  .unified-slider.ppe {
    background: linear-gradient(to right, #fecaca 0%, #fef3c7 50%, #d1fae5 100%);
  }
  .unified-slider.ppe::-webkit-slider-thumb { background: #f59e0b; }
  .unified-slider.ppe::-moz-range-thumb { background: #f59e0b; }
  .unified-slider.environmental {
    background: linear-gradient(to right, #fecaca 0%, #d1fae5 50%, #d1fae5 100%);
  }
  .unified-slider.environmental::-webkit-slider-thumb { background: #10b981; }
  .unified-slider.environmental::-moz-range-thumb { background: #10b981; }
  .unified-slider.actions {
    background: linear-gradient(to right, #fef3c7 0%, #d1fae5 100%);
  }
  .unified-slider.actions::-webkit-slider-thumb { background: #f59e0b; }
  .unified-slider.actions::-moz-range-thumb { background: #f59e0b; }
`

/**
 * ScenarioSimulatorCompact - Compact, feature-rich scenario simulator
 *
 * Features:
 * - 60% smaller footprint through collapsible design and tabbed interface
 * - Dynamic actions that adapt to trending hazards
 * - Multi-hazard targeting or "All Trending" mode
 * - Quick action presets for common intervention bundles
 * - Hazard-specific recommendations based on hazard type
 */
const ScenarioSimulatorCompact = ({
  trendingHazards = [],
  factorData,
  incidentStats,
  prevalence: externalPrevalence,
  filteredIncidents = [],
  hazardFilteredIncidents = [],
  selectedHazard,
  onHazardChange,
  weekly,
  onProjectionChange
}) => {
  // UI State
  const [isExpanded, setIsExpanded] = useState(true)
  const [mode, setMode] = useState('quick') // 'quick' | 'custom' | 'advanced'
  const [expandedCategory, setExpandedCategory] = useState(null)

  // Selection State
  const [selectedHazards, setSelectedHazards] = useState([])
  const [selectAllTrending, setSelectAllTrending] = useState(false)

  // Intervention State
  const [activeQuickAction, setActiveQuickAction] = useState(null)
  const [sliders, setSliders] = useState({})
  const [actionsToClose, setActionsToClose] = useState(0)

  // Get trending hazards (significant-rise or rising)
  const trendingList = useMemo(() => {
    return trendingHazards.filter(h =>
      h.trendLevel?.level === 'significant-rise' ||
      h.trendLevel?.level === 'rising'
    )
  }, [trendingHazards])

  // Effective selected hazards
  const effectiveSelectedHazards = useMemo(() => {
    if (selectAllTrending) {
      return trendingList.map(h => h.name)
    }
    return selectedHazards
  }, [selectAllTrending, trendingList, selectedHazards])

  // Calculate factor prevalence
  const prevalence = useMemo(() => {
    if (externalPrevalence && Object.keys(externalPrevalence).length > 0) {
      return externalPrevalence
    }
    if (!factorData?.byFactor || !incidentStats?.totalNegative) return {}
    return calculateFactorPrevalence(factorData, incidentStats.totalNegative)
  }, [externalPrevalence, factorData, incidentStats?.totalNegative])

  // Generate dynamic sliders based on selected hazards or all data
  const { sliders: dynamicSliders, unmappedFactors } = useMemo(() => {
    if (!factorData?.byFactor) return { sliders: [], unmappedFactors: [] }
    const hazardName = effectiveSelectedHazards.length === 1
      ? effectiveSelectedHazards[0]
      : 'all'
    return generateDynamicSliders(factorData, hazardName, incidentStats?.totalNegative || 0)
  }, [factorData, effectiveSelectedHazards, incidentStats?.totalNegative])

  // Group sliders by HSE control category
  const slidersByCategory = useMemo(() => {
    const grouped = {
      engineering: [],
      administrative: [],
      ppe: [],
      environmental: []
    }

    for (const slider of dynamicSliders) {
      if (grouped[slider.categoryKey]) {
        grouped[slider.categoryKey].push(slider)
      }
    }

    return grouped
  }, [dynamicSliders])

  // Calculate projection
  const projection = useMemo(() => {
    if (!weekly?.predicted) return null

    return calculateMultiHazardProjection({
      hazards: effectiveSelectedHazards,
      sliders,
      factorData,
      incidents: filteredIncidents,
      trendingData: trendingHazards,
      basePrediction: weekly.predicted,
      openActionsCount: incidentStats?.openActionsCount || 0,
      actionsToClose
    })
  }, [weekly, effectiveSelectedHazards, sliders, factorData, filteredIncidents, trendingHazards, incidentStats, actionsToClose])

  // Check for changes
  const hasChanges = useMemo(() => {
    const hasSliderChanges = Object.values(sliders).some(v => v !== 0)
    return hasSliderChanges || actionsToClose > 0 || effectiveSelectedHazards.length > 0
  }, [sliders, actionsToClose, effectiveSelectedHazards])

  // Fix 2.5: Check for empty data state
  const hasNoData = (incidentStats?.totalNegative || 0) === 0

  // Fix 2.1: Check for insufficient data (< 10 incidents)
  const hasInsufficientData = !hasNoData && (incidentStats?.totalNegative || 0) < 10

  // Fix 3.2: Calculate confidence level based on sample size
  const confidenceLevel = useMemo(() => {
    const total = incidentStats?.totalNegative || 0
    if (total >= 100) return { level: 'high', label: 'High confidence', color: 'text-green-600', bg: 'bg-green-100' }
    if (total >= 30) return { level: 'medium', label: 'Medium confidence', color: 'text-amber-600', bg: 'bg-amber-100' }
    return { level: 'low', label: 'Low confidence', color: 'text-red-500', bg: 'bg-red-100' }
  }, [incidentStats?.totalNegative])

  // Fix 2.4: Check for negative sliders (reducing controls = increasing risk)
  const negativeSliderIds = useMemo(() => {
    return Object.entries(sliders)
      .filter(([_, value]) => value < 0)
      .map(([id]) => id)
  }, [sliders])

  // Handlers
  const handleToggleHazard = useCallback((hazardName) => {
    setSelectAllTrending(false)
    setSelectedHazards(prev => {
      if (prev.includes(hazardName)) {
        return prev.filter(h => h !== hazardName)
      }
      return [...prev, hazardName]
    })
  }, [])

  const handleToggleAllTrending = useCallback(() => {
    setSelectAllTrending(prev => !prev)
    if (!selectAllTrending) {
      setSelectedHazards([])
    }
  }, [selectAllTrending])

  const handleClearSelection = useCallback(() => {
    setSelectAllTrending(false)
    setSelectedHazards([])
  }, [])

  const handleQuickActionToggle = useCallback((actionId) => {
    setActiveQuickAction(prev => {
      if (prev === actionId) {
        setSliders({})
        setActionsToClose(0)
        return null
      }

      // Apply preset effects
      const presets = {
        'engineering-boost': { barriers: 75, guards: 75, devices: 75 },
        'admin-boost': { training: 80, inspections: 70, supervision: 60 },
        'ppe-push': { ppe: 100 },
        'close-actions': {}
      }

      const effect = presets[actionId] || {}
      setSliders(effect)

      if (actionId === 'close-actions') {
        setActionsToClose(incidentStats?.openActionsCount || 0)
      } else {
        setActionsToClose(0)
      }

      return actionId
    })
  }, [incidentStats?.openActionsCount])

  const handleSliderChange = useCallback((sliderId, value) => {
    setActiveQuickAction(null)
    setSliders(prev => ({ ...prev, [sliderId]: value }))
  }, [])

  const handleActionsToCloseChange = useCallback((value) => {
    setActiveQuickAction(null)
    setActionsToClose(value)
  }, [])

  const handleApplyRecommendation = useCallback((factor, effect) => {
    setActiveQuickAction(null)
    setSliders(prev => ({ ...prev, [factor.toLowerCase()]: effect }))
  }, [])

  const handleReset = useCallback(() => {
    setActiveQuickAction(null)
    setSliders({})
    setActionsToClose(0)
    setSelectedHazards([])
    setSelectAllTrending(false)
  }, [])

  const handleToggleCategory = useCallback((categoryKey) => {
    setExpandedCategory(prev => prev === categoryKey ? null : categoryKey)
  }, [])

  // Calculate impact badge
  const impactBadge = useMemo(() => {
    if (!projection || !hasChanges) return null

    const change = projection.changePercent
    if (change === 0) return null

    return {
      value: change,
      isPositive: change < 0,
      label: `${change > 0 ? '+' : ''}${change}%`
    }
  }, [projection, hasChanges])

  return (
    <div className="bg-white border border-surface-200 rounded-lg overflow-hidden shadow-soft">
      <style>{sliderStyles}</style>

      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-surface-50 to-surface-100 hover:from-surface-100 hover:to-surface-150 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Target size={16} className="text-primary-600" />
          <span className="text-sm font-semibold text-surface-800">Scenario Simulator</span>
          <span className="text-2xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
            Data-Driven
          </span>
          {effectiveSelectedHazards.length > 0 && (
            <span className="text-2xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
              {selectAllTrending ? 'All Trending' : `${effectiveSelectedHazards.length} hazard${effectiveSelectedHazards.length > 1 ? 's' : ''}`}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Reset button */}
          {hasChanges && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleReset()
              }}
              className="flex items-center gap-1 px-2 py-1 text-xs text-surface-500 hover:text-surface-700 hover:bg-surface-200 rounded transition-colors"
            >
              <RefreshCw size={12} />
              Reset
            </button>
          )}

          {/* Impact Badge */}
          {impactBadge && (
            <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${
              impactBadge.isPositive
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {impactBadge.isPositive ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
              {impactBadge.label}
            </span>
          )}

          {/* Expand/Collapse */}
          {isExpanded ? (
            <ChevronUp size={18} className="text-surface-500" />
          ) : (
            <ChevronDown size={18} className="text-surface-500" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-surface-200">
          {/* Hazard Selector */}
          <div className="px-4 py-3 border-b border-surface-100 bg-surface-50">
            <TrendingHazardSelector
              trendingHazards={trendingHazards}
              selectedHazards={selectedHazards}
              selectAllTrending={selectAllTrending}
              onToggleHazard={handleToggleHazard}
              onToggleAllTrending={handleToggleAllTrending}
              onClearSelection={handleClearSelection}
            />
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-surface-200">
            {['quick', 'custom', 'advanced'].map(tab => (
              <button
                key={tab}
                onClick={() => setMode(tab)}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                  mode === tab
                    ? 'text-primary-700 border-b-2 border-primary-600 bg-primary-50'
                    : 'text-surface-500 hover:text-surface-700 hover:bg-surface-50'
                }`}
              >
                {tab === 'quick' && 'Quick Actions'}
                {tab === 'custom' && 'Custom'}
                {tab === 'advanced' && 'Advanced'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-4 space-y-4">
            {/* Fix 2.5: Empty Data State */}
            {hasNoData && (
              <div className="text-center py-6 px-4 bg-surface-50 rounded-lg border border-surface-200">
                <Info size={24} className="mx-auto text-surface-400 mb-2" />
                <p className="text-sm font-medium text-surface-600">No incidents in selected date range</p>
                <p className="text-xs text-surface-400 mt-1">Adjust filters to run simulations.</p>
              </div>
            )}

            {/* Fix 2.1: Insufficient Data Warning */}
            {hasInsufficientData && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-amber-700">Limited data available</p>
                  <p className="text-xs text-amber-600 mt-0.5">
                    Projections may be unreliable with fewer than 10 incidents ({incidentStats?.totalNegative || 0} available).
                  </p>
                </div>
              </div>
            )}

            {/* Fix 3.2: Confidence Indicator */}
            {!hasNoData && (
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${confidenceLevel.bg} ${confidenceLevel.color}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {confidenceLevel.label}
                  </span>
                  <span className="text-surface-400">({incidentStats?.totalNegative || 0} incidents)</span>
                </div>
                {unmappedFactors.length > 0 && (
                  <span className="text-surface-400" title={`Unmapped: ${unmappedFactors.join(', ')}`}>
                    {unmappedFactors.length} factor{unmappedFactors.length > 1 ? 's' : ''} not modelable
                  </span>
                )}
              </div>
            )}

            {/* Quick Actions Tab */}
            {mode === 'quick' && !hasNoData && (
              <>
                <QuickActionPanel
                  activeAction={activeQuickAction}
                  onToggleAction={handleQuickActionToggle}
                  openActionsCount={incidentStats?.openActionsCount || 0}
                />

                {/* Hazard-Specific Recommendations */}
                {effectiveSelectedHazards.length > 0 && (
                  <HazardSpecificActions
                    selectedHazards={effectiveSelectedHazards}
                    onApplyAction={handleApplyRecommendation}
                    appliedActions={sliders}
                  />
                )}
              </>
            )}

            {/* Custom Tab - Accordion Sliders */}
            {mode === 'custom' && !hasNoData && (
              <>
                {/* Open Actions Slider */}
                {(incidentStats?.openActionsCount || 0) > 0 && (
                  <div className="space-y-2 pb-3 border-b border-surface-100">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-amber-600" />
                      <span className="text-sm font-medium text-surface-700">Corrective Actions</span>
                      <span className="text-2xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                        {incidentStats.openActionsCount} open
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={incidentStats.openActionsCount}
                      value={actionsToClose}
                      onChange={(e) => handleActionsToCloseChange(parseInt(e.target.value))}
                      className="unified-slider actions w-full"
                    />
                    <div className="flex justify-between text-2xs text-surface-400">
                      <span>0 closed</span>
                      <span className="font-medium text-amber-600">{actionsToClose} to close</span>
                      <span>{incidentStats.openActionsCount} closed</span>
                    </div>
                  </div>
                )}

                {/* Factor Sliders by Category */}
                <InterventionSliderGroup
                  slidersByCategory={slidersByCategory}
                  sliders={sliders}
                  onSliderChange={handleSliderChange}
                  factorData={factorData}
                  selectedHazards={effectiveSelectedHazards}
                  expandedCategory={expandedCategory}
                  onToggleCategory={handleToggleCategory}
                />

                {/* No factors message */}
                {dynamicSliders.length === 0 && (
                  <div className="text-center py-4 text-sm text-surface-500">
                    <p>No contributing factors detected.</p>
                    <p className="text-xs text-surface-400 mt-1">Factors are extracted from observation descriptions.</p>
                  </div>
                )}
              </>
            )}

            {/* Advanced Tab - All Sliders Expanded */}
            {mode === 'advanced' && !hasNoData && (
              <div className="space-y-4">
                {/* Open Actions Slider */}
                {(incidentStats?.openActionsCount || 0) > 0 && (
                  <div className="space-y-2 pb-3 border-b border-surface-100">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-amber-600" />
                      <span className="text-sm font-medium text-surface-700">Corrective Actions</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={incidentStats.openActionsCount}
                      value={actionsToClose}
                      onChange={(e) => handleActionsToCloseChange(parseInt(e.target.value))}
                      className="unified-slider actions w-full"
                    />
                    <div className="flex justify-between text-2xs text-surface-400">
                      <span>0 closed</span>
                      <span className="font-medium">{actionsToClose} / {incidentStats.openActionsCount}</span>
                      <span>{incidentStats.openActionsCount} closed</span>
                    </div>
                  </div>
                )}

                {/* All sliders expanded */}
                {Object.entries(slidersByCategory).map(([categoryKey, categorySliders]) => {
                  if (categorySliders.length === 0) return null
                  const category = CONTROL_HIERARCHY[categoryKey]

                  return (
                    <div key={categoryKey} className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-surface-700">
                        <span>{category.name}</span>
                        <span className="text-2xs bg-surface-200 text-surface-600 px-1.5 py-0.5 rounded">
                          {Math.round(category.effectiveness * 100)}% eff.
                        </span>
                      </div>
                      {categorySliders.map(slider => {
                        const sliderValue = sliders[slider.id] || 0
                        const isNegative = sliderValue < 0
                        return (
                          <div key={slider.id} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-surface-600">{slider.label}</span>
                              <span className={`font-medium ${
                                sliderValue > 0 ? 'text-green-600' :
                                sliderValue < 0 ? 'text-red-500' : 'text-surface-500'
                              }`}>
                                {sliderValue > 0 ? '+' : ''}{sliderValue}%
                              </span>
                            </div>
                            <input
                              type="range"
                              min={-50}
                              max={100}
                              value={sliderValue}
                              onChange={(e) => handleSliderChange(slider.id, parseInt(e.target.value))}
                              className={`unified-slider ${categoryKey} w-full`}
                            />
                            {/* Fix 2.4: Negative slider warning */}
                            {isNegative && (
                              <p className="text-[10px] text-red-500 flex items-center gap-1">
                                <AlertTriangle size={10} />
                                Reducing this control will increase incidents
                              </p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Impact Summary Bar */}
          {projection && hasChanges && (
            <div className="px-4 py-3 bg-surface-50 border-t border-surface-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-surface-500">Impact:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-surface-600">{projection.baseline}/wk</span>
                    <span className="text-surface-400">→</span>
                    <span className={`text-sm font-bold ${
                      projection.isImproved ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {projection.projected}/wk
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-surface-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        projection.isImproved ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{
                        width: `${Math.min(100, Math.abs(projection.changePercent))}%`
                      }}
                    />
                  </div>
                  <span className={`text-sm font-bold ${
                    projection.isImproved ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {projection.changePercent > 0 ? '+' : ''}{projection.changePercent}%
                  </span>
                </div>
              </div>

              {/* Multi-hazard info */}
              {projection.isMultiHazard && (
                <p className="text-2xs text-surface-400 mt-1">
                  Projection for {projection.hazardCount} hazards ({projection.proportion}% of incidents)
                </p>
              )}
            </div>
          )}

          {/* No changes placeholder */}
          {(!projection || !hasChanges) && (
            <div className="px-4 py-3 bg-surface-50 border-t border-surface-200">
              <div className="flex items-center gap-2 text-surface-400">
                <Minus size={14} />
                <span className="text-sm">Adjust controls above to see projected impact</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default React.memo(ScenarioSimulatorCompact)
