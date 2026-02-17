import React, { useMemo, useDeferredValue, useState, useCallback, useEffect, useRef, startTransition, memo } from 'react'
import { Target, AlertTriangle, Layers, Zap, Shield, HelpCircle, TrendingUp, Dices } from 'lucide-react'
import { useDataState } from '../context/DataContext'
import { useFilterState, useFilterActions } from '../context/FilterContext'
import { useFilteredData } from '../context/FilteredDataContext'
import { useDeferredMemo } from '../hooks/useDeferredMemo'
import { useWorkerTask } from '../hooks/useWorkerTask'
import { HazardList, HazardDetailPanel, FactorList, FactorDetailPanel, RiskPerformanceTab, HazardRiskMatrix, RiskTrendForecast, MonteCarloTab } from '../components/outlook'
import TabErrorBoundary from '../components/common/TabErrorBoundary'
import FilterBar from '../components/common/FilterBar'
import TimePeriodToggle from '../components/common/TimePeriodToggle'
import { getHazardDailyData, forecastIncidents } from '../utils/insightsCalculations'
import { isPositiveType } from '../utils/rootCauseEngine'
import { MethodologyExplorerModal } from '../components/methodology'
import { plotHazardsOnMatrix } from '../utils/riskMatrix'

/**
 * TrendSummary - Compact inline summary for Hazards
 */
const TrendSummary = React.memo(({ hazards }) => {
  const counts = useMemo(() => {
    const summary = { rising: 0, stable: 0, declining: 0 }

    hazards.forEach(h => {
      switch (h.trendLevel?.level) {
        case 'significant-rise':
        case 'rising':
          summary.rising++
          break
        case 'stable':
        case 'new':
          summary.stable++
          break
        case 'declining':
        case 'significant-decline':
          summary.declining++
          break
        default:
          summary.stable++
      }
    })

    return summary
  }, [hazards])

  return (
    <div className="flex items-center gap-3 text-xs transition-all duration-200">
      <span className="text-surface-500">
        <span className="font-medium text-red-500">{counts.rising}</span> Rising
      </span>
      <span className="text-surface-300">·</span>
      <span className="text-surface-500">
        <span className="font-medium text-surface-600">{counts.stable}</span> Stable
      </span>
      <span className="text-surface-300">·</span>
      <span className="text-surface-500">
        <span className="font-medium text-green-500">{counts.declining}</span> Declining
      </span>
    </div>
  )
})

TrendSummary.displayName = 'TrendSummary'

/**
 * FactorSummary - Compact inline summary for Factors
 */
const FactorSummary = React.memo(({ factorData, totalIncidents }) => {
  const detectionRate = useMemo(() => {
    if (totalIncidents === 0) return 0
    // Count unique incidents with factors
    const incidentSet = new Set()
    factorData.byFactor.forEach(f => {
      f.incidents?.forEach(inc => {
        if (inc.id) incidentSet.add(inc.id)
      })
    })
    return ((incidentSet.size / totalIncidents) * 100).toFixed(1)
  }, [factorData, totalIncidents])

  const totalOccurrences = useMemo(() => {
    return factorData.byFactor.reduce((sum, f) => sum + f.count, 0)
  }, [factorData])

  return (
    <div className="flex items-center gap-3 text-xs transition-all duration-200">
      <span className="text-surface-500">
        Detection: <span className={`font-medium ${parseFloat(detectionRate) > 50 ? 'text-green-600' : parseFloat(detectionRate) > 20 ? 'text-amber-600' : 'text-red-500'}`}>{detectionRate}%</span>
      </span>
      <span className="text-surface-300">·</span>
      <span className="text-surface-500">
        <span className="font-medium text-surface-600">{totalOccurrences}</span> occurrences
      </span>
      <span className="text-surface-300">·</span>
      <span className="text-surface-500">
        <span className="font-medium text-primary-600">{factorData.byFactor.length}</span> factors
      </span>
    </div>
  )
})

FactorSummary.displayName = 'FactorSummary'

/**
 * MAIN TAB DEFINITIONS
 */
const MAIN_TABS = [
  { id: 'correlations', label: 'Correlations', icon: Target },
  { id: 'predictive', label: 'Predictive & Simulation', icon: Zap },
  { id: 'risk', label: 'Risk & Performance', icon: Shield }
]

const PREDICTIVE_SUB_TABS = [
  { id: 'smsa', label: 'Risk Matrix', icon: Shield },
  { id: 'trend-forecast', label: 'Risk Trend', icon: TrendingUp },
  { id: 'monte-carlo', label: 'Monte Carlo', icon: Dices },
]

/**
 * SafetyOutlook - Main page component with 3-tab layout
 * Tab 1: Correlations (Hazards & Factors)
 * Tab 2: Predictive & Simulation
 * Tab 3: Risk & Performance
 */
const SafetyOutlook = () => {
  const { incidents, siteClassifications } = useDataState()

  // Shared filter state from context
  const { period, customDateRange, filters } = useFilterState()
  const { setPeriod, setFilter, clearFilters } = useFilterActions()

  // Centralized filtered data from shared context (eliminates ~5 duplicate useMemos)
  const { filteredIncidents: _fi, filterConfig } = useFilteredData()
  const filteredIncidents = useDeferredValue(_fi)

  // Stable prop for FilterBar — prevents React.memo defeat from inline spreading
  const activeFilters = useMemo(
    () => ({ ...filters, period, customDateRange }),
    [filters, period, customDateRange]
  )

  // Local state
  const [activeMainTab, setActiveMainTab] = useState('correlations')
  const [activeSubTab, setActiveSubTab] = useState('hazards') // 'hazards' or 'factors'
  const [selectedHazard, setSelectedHazard] = useState(null)
  const [selectedFactor, setSelectedFactor] = useState(null)
  const [showGuide, setShowGuide] = useState(false)
  const [activePredictiveSubTab, setActivePredictiveSubTab] = useState('smsa')

  // uniqueContractors, siteOptions, filterConfig, filteredIncidents
  // are now provided by FilteredDataContext (see useFilteredData() above)

  // Calculate hazard trends based on filtered incidents and period
  // Offloaded to Web Worker to keep main thread free
  const { result: sortedHazards, isPending: sortedHazardsPending } = useWorkerTask(
    'hazardTrending', filteredIncidents, { period }, [filteredIncidents, period], []
  )

  // Calculate contributing factors (all observations including positive)
  // Offloaded to Web Worker to keep main thread free
  const { result: factorData, isPending: factorDataPending } = useWorkerTask(
    'aggregateFactors', filteredIncidents, null, [filteredIncidents],
    { byFactor: [], analyzed: 0, total: 0 }
  )

  // Calculate hazard trend data for selected hazard
  const hazardTrendData = useDeferredMemo(() => {
    if (!selectedHazard?.name) return null
    return getHazardDailyData(filteredIncidents, selectedHazard.name, period)
  }, [filteredIncidents, selectedHazard?.name, period])

  // Calculate factor trend data for selected factor
  const factorTrendData = useDeferredMemo(() => {
    if (!selectedFactor?.name || !factorData?.byFactor) return null
    // Build trend data from factor's incidents
    const factor = factorData.byFactor.find(f => f.name === selectedFactor.name)
    if (!factor || !factor.incidents?.length) {
      return { days: [], totalCount: 0, trend: 'stable', hasData: false }
    }

    // Group factor incidents by date
    const dateMap = new Map()
    factor.incidents.forEach(inc => {
      if (!inc.date) return
      const dateStr = typeof inc.date === 'string' ? inc.date.split('T')[0] : inc.date
      dateMap.set(dateStr, (dateMap.get(dateStr) || 0) + 1)
    })

    // Convert to sorted array
    const days = Array.from(dateMap.entries())
      .map(([date, count]) => ({
        date,
        label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Calculate trend
    let trend = 'stable'
    if (days.length >= 7) {
      const recent = days.slice(-7)
      const previous = days.slice(-14, -7)
      if (previous.length >= 3) {
        const recentAvg = recent.reduce((sum, d) => sum + d.count, 0) / recent.length
        const previousAvg = previous.reduce((sum, d) => sum + d.count, 0) / previous.length
        const changePercent = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0
        if (changePercent > 20) trend = 'increasing'
        else if (changePercent < -20) trend = 'decreasing'
      }
    }

    return {
      days,
      totalCount: factor.count,
      trend,
      hasData: true
    }
  }, [selectedFactor?.name, factorData?.byFactor])

  // Negative incidents (for Tab 2 - Predictive & Simulation)
  // Use isPositiveType for consistent filtering across codebase
  const negativeIncidents = useDeferredMemo(() => {
    return filteredIncidents.filter(i => !isPositiveType(i.type))
  }, [filteredIncidents])

  // Lifted matrixData for both HazardRiskMatrix and Methodology Guide
  const matrixData = useDeferredMemo(() => {
    return plotHazardsOnMatrix(filteredIncidents, sortedHazards)
  }, [filteredIncidents, sortedHazards])

  // Lifted forecastData for Methodology Guide
  const forecastData = useDeferredMemo(() => {
    if (!negativeIncidents.length) return null
    return forecastIncidents(negativeIncidents)
  }, [negativeIncidents])

  // Calculate detected incidents count (unique incidents that have at least one REAL factor - exclude Unclassified)
  const detectedIncidentsCount = useDeferredMemo(() => {
    const incidentSet = new Set()
    factorData.byFactor.forEach(f => {
      // Exclude Unclassified from detected count - those are observations WITHOUT factors
      if (f.isUnclassified || f.name === 'Unclassified') return
      f.incidents?.forEach(inc => {
        if (inc.id) incidentSet.add(inc.id)
      })
    })
    return incidentSet.size
  }, [factorData])

  // Auto-select first hazard when data loads, or update selection if current hazard no longer exists
  useEffect(() => {
    if (sortedHazards.length === 0) {
      if (selectedHazard) {
        setSelectedHazard(null)
      }
      return
    }

    if (!selectedHazard) {
      // Use startTransition to prevent blocking
      startTransition(() => {
        setSelectedHazard(sortedHazards[0])
      })
      return
    }

    // Check if currently selected hazard still exists in the filtered list
    const stillExists = sortedHazards.some(h => h.name === selectedHazard.name)
    if (!stillExists) {
      startTransition(() => {
        setSelectedHazard(sortedHazards[0])
      })
    }
  }, [sortedHazards, selectedHazard])

  // Auto-select first factor when switching to factors sub-tab or when data changes
  useEffect(() => {
    if (activeMainTab !== 'correlations' || activeSubTab !== 'factors') return

    if (factorData.byFactor.length === 0) {
      if (selectedFactor) {
        setSelectedFactor(null)
      }
      return
    }

    if (!selectedFactor) {
      startTransition(() => {
        setSelectedFactor(factorData.byFactor[0])
      })
      return
    }

    // Check if currently selected factor still exists
    const stillExists = factorData.byFactor.some(f => f.name === selectedFactor.name)
    if (!stillExists) {
      startTransition(() => {
        setSelectedFactor(factorData.byFactor[0])
      })
    }
  }, [activeMainTab, activeSubTab, factorData.byFactor, selectedFactor])

  // Handlers - use startTransition for non-urgent updates
  const handlePeriodChange = useCallback((newPeriod) => {
    setPeriod(newPeriod)
    startTransition(() => {
      setSelectedHazard(null)
    })
  }, [setPeriod])

  const handleFilterChange = useCallback((key, value) => {
    setFilter(key, value)
    startTransition(() => {
      setSelectedHazard(null)
    })
  }, [setFilter])

  const handleClearFilters = useCallback(() => {
    clearFilters()
    setSelectedHazard(null)
  }, [clearFilters])

  // CRITICAL: Use startTransition for selection to prevent lag
  const handleHazardSelect = useCallback((hazard) => {
    startTransition(() => {
      setSelectedHazard(hazard)
    })
  }, [])

  const handleFactorSelect = useCallback((factor) => {
    startTransition(() => {
      setSelectedFactor(factor)
    })
  }, [])

  // Track visited tabs for keep-alive rendering (mount once, hide with display:none)
  const visitedTabsRef = useRef(new Set(['correlations']))

  const handleMainTabChange = useCallback((tab) => {
    visitedTabsRef.current.add(tab)
    startTransition(() => {
      setActiveMainTab(tab)
    })
  }, [])

  const handleSubTabChange = useCallback((tab) => {
    startTransition(() => {
      setActiveSubTab(tab)
    })
  }, [])

  const handlePredictiveSubTabChange = useCallback((tab) => {
    startTransition(() => {
      setActivePredictiveSubTab(tab)
    })
  }, [])


  // Check if we have data
  const hasData = filteredIncidents.length > 0 && sortedHazards.length > 0

  // Empty state renders
  if (!incidents.length) {
    return (
      <div className="space-y-3">
        {/* Filters Row */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <FilterBar
              filters={filterConfig}
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </div>
          <TimePeriodToggle period={period} onPeriodChange={handlePeriodChange} showAll />
        </div>
        <div className="bg-white rounded-lg border border-surface-100 p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center mx-auto mb-3">
            <Target size={24} className="text-surface-400" />
          </div>
          <h2 className="text-base font-semibold text-surface-800 mb-1">No Data Available</h2>
          <p className="text-xs text-surface-500">Import observation data to view hazard trends.</p>
        </div>
      </div>
    )
  }

  if (!hasData) {
    return (
      <div className="space-y-3">
        {/* Filters Row */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <FilterBar
              filters={filterConfig}
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </div>
          <TimePeriodToggle period={period} onPeriodChange={handlePeriodChange} showAll />
        </div>
        <div className="bg-white rounded-lg border border-surface-100 p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center mx-auto mb-3">
            <AlertTriangle size={24} className="text-surface-400" />
          </div>
          <h2 className="text-base font-semibold text-surface-800 mb-1">No Hazard Data</h2>
          <p className="text-xs text-surface-500">No hazard categories found for the selected filters.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters Row - consistent with Dashboard */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <FilterBar
            filters={filterConfig}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
        </div>
        <TimePeriodToggle period={period} onPeriodChange={handlePeriodChange} showAll />
      </div>

      {/* ==================== 3 MAIN TABS ==================== */}
      <div className="flex items-center justify-between border-b border-surface-200 pb-0">
        <div role="tablist" aria-label="Safety Outlook tabs" className="flex items-center gap-1 overflow-x-auto">
          {MAIN_TABS.map(tab => {
            const Icon = tab.icon
            const isActive = activeMainTab === tab.id
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.id}`}
                id={`tab-${tab.id}`}
                onClick={() => handleMainTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all duration-200 border-b-2 -mb-px ${
                  isActive
                    ? 'border-primary-600 text-primary-700'
                    : 'border-transparent text-surface-500 hover:text-surface-700 hover:border-surface-300'
                }`}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            )
          })}
        </div>
        {activeMainTab === 'predictive' && (
          <div className="flex items-center gap-1 pb-1">
            <button
              onClick={() => setShowGuide(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-primary-600 hover:bg-primary-50 transition-colors"
              title="How everything is calculated — with your data"
            >
              <HelpCircle size={14} />
              <span className="hidden sm:inline">How it's Calculated?</span>
            </button>
          </div>
        )}
      </div>

      {/* ==================== TAB CONTENT (Keep-Alive: display:none + lazy mount) ==================== */}

      {/* Tab 1: Correlations (always mounted - default tab) */}
      <div style={{ display: activeMainTab === 'correlations' ? 'block' : 'none' }}>
        <TabErrorBoundary label="Correlations">
        <div role="tabpanel" id="tabpanel-correlations" aria-labelledby="tab-correlations" className="flex flex-col gap-3 animate-fade-in">
          {/* Sub-tab Toggle (Hazards / Factors) + Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div role="tablist" aria-label="Correlation sub-tabs" className="flex items-center gap-2">
              {/* Hazards Sub-Tab */}
              <button
                role="tab"
                aria-selected={activeSubTab === 'hazards'}
                aria-controls="subtabpanel-hazards"
                onClick={() => handleSubTabChange('hazards')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeSubTab === 'hazards'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-surface-600 hover:bg-surface-100'
                }`}
              >
                <Target size={14} />
                Hazards
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeSubTab === 'hazards' ? 'bg-primary-200 text-primary-800' : 'bg-surface-200 text-surface-600'
                }`}>
                  {sortedHazards.length}
                </span>
              </button>

              {/* Factors Sub-Tab */}
              <button
                role="tab"
                aria-selected={activeSubTab === 'factors'}
                aria-controls="subtabpanel-factors"
                onClick={() => handleSubTabChange('factors')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeSubTab === 'factors'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-surface-600 hover:bg-surface-100'
                }`}
              >
                <Layers size={14} />
                Factors
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeSubTab === 'factors' ? 'bg-primary-200 text-primary-800' : 'bg-surface-200 text-surface-600'
                }`}>
                  {factorData.byFactor.length}
                </span>
              </button>
            </div>

            {/* Show summary based on active sub-tab */}
            <div className="text-xs">
              {activeSubTab === 'hazards' && <TrendSummary hazards={sortedHazards} />}
              {activeSubTab === 'factors' && <FactorSummary factorData={factorData} totalIncidents={filteredIncidents.length} />}
            </div>
          </div>

          {/* Main content */}
          <div className="flex gap-3 h-[calc(100vh-300px)] min-h-[400px]">
            {activeSubTab === 'hazards' ? (
              <>
                {/* Left: Hazard List */}
                <div className="w-72 flex-shrink-0 bg-surface-50 rounded-lg border border-surface-200 p-3 sm:p-4 flex flex-col transition-all duration-200">
                  <div className="flex items-center justify-between mb-1 flex-shrink-0">
                    <h2 className="text-sm font-semibold text-surface-800">Hazards</h2>
                    <span className="text-xs bg-surface-200 text-surface-600 px-1.5 py-0.5 rounded-full">{sortedHazards.length}</span>
                  </div>
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <HazardList
                      hazards={sortedHazards}
                      selected={selectedHazard}
                      onSelect={handleHazardSelect}
                    />
                  </div>
                </div>

                {/* Right: Hazard Detail Panel */}
                <div className="flex-1 min-w-0 h-full transition-all duration-200">
                  <HazardDetailPanel
                    hazard={selectedHazard}
                    incidents={filteredIncidents}
                    timePeriod={period}
                    trendData={hazardTrendData}
                  />
                </div>
              </>
            ) : (
              <>
                {/* Left: Factor List */}
                <div className="w-72 flex-shrink-0 bg-surface-50 rounded-lg border border-surface-200 p-3 sm:p-4 flex flex-col transition-all duration-200">
                  <div className="flex items-center justify-between mb-1 flex-shrink-0">
                    <h2 className="text-sm font-semibold text-surface-800">Factors</h2>
                    <span className="text-xs bg-surface-200 text-surface-600 px-1.5 py-0.5 rounded-full">{factorData.byFactor.length}</span>
                  </div>
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <FactorList
                      factors={factorData.byFactor}
                      selected={selectedFactor}
                      onSelect={handleFactorSelect}
                      totalIncidents={factorData.analyzed}
                      detectedCount={detectedIncidentsCount}
                    />
                  </div>
                </div>

                {/* Right: Factor Detail Panel */}
                <div className="flex-1 min-w-0 h-full transition-all duration-200">
                  <FactorDetailPanel
                    factor={selectedFactor}
                    totalIncidents={factorData.analyzed}
                    analyzedIncidents={factorData.analyzed}
                    allFactors={factorData.byFactor}
                    trendData={factorTrendData}
                    timePeriod={period}
                  />
                </div>
              </>
            )}
          </div>
        </div>
        </TabErrorBoundary>
      </div>

      {/* Tab 2: Predictive & Simulation (lazy mount + keep-alive) */}
      {visitedTabsRef.current.has('predictive') && (
        <div style={{ display: activeMainTab === 'predictive' ? 'block' : 'none' }}>
          <TabErrorBoundary label="Predictive & Simulation">
          <div role="tabpanel" id="tabpanel-predictive" aria-labelledby="tab-predictive" className="space-y-3">
            {/* Predictive Sub-Tab Pills */}
            <div className="flex items-center gap-2" role="tablist" aria-label="Predictive sub-tabs">
              {PREDICTIVE_SUB_TABS.map(tab => {
                const Icon = tab.icon
                const isActive = activePredictiveSubTab === tab.id
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => handlePredictiveSubTabChange(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-surface-600 hover:bg-surface-100'
                    }`}
                  >
                    <Icon size={14} />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Sub-tab content */}
            {activePredictiveSubTab === 'smsa' && (
              <HazardRiskMatrix
                sortedHazards={sortedHazards}
                negativeIncidents={negativeIncidents}
                filteredIncidents={filteredIncidents}
                factorData={factorData}
                period={period}
                siteClassifications={siteClassifications}
                matrixData={matrixData}
              />
            )}
            {activePredictiveSubTab === 'trend-forecast' && (
              <RiskTrendForecast
                incidents={negativeIncidents}
                sortedHazards={sortedHazards}
                factorData={factorData}
                negativeIncidents={negativeIncidents}
              />
            )}
            {activePredictiveSubTab === 'monte-carlo' && (
              <MonteCarloTab
                negativeIncidents={negativeIncidents}
                sortedHazards={sortedHazards}
              />
            )}
          </div>
          </TabErrorBoundary>
        </div>
      )}

      {/* Tab 3: Risk & Performance (lazy mount + keep-alive) */}
      {visitedTabsRef.current.has('risk') && (
        <div style={{ display: activeMainTab === 'risk' ? 'block' : 'none' }}>
          <TabErrorBoundary label="Risk & Performance">
          <div role="tabpanel" id="tabpanel-risk" aria-labelledby="tab-risk">
            <RiskPerformanceTab
              filteredIncidents={filteredIncidents}
              siteClassifications={siteClassifications}
            />
          </div>
          </TabErrorBoundary>
        </div>
      )}

      {/* Methodology Guide */}
      <MethodologyExplorerModal
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
        matrixData={matrixData}
        filteredIncidents={filteredIncidents}
        sortedHazards={sortedHazards}
        forecastData={forecastData}
        negativeIncidents={negativeIncidents}
      />
    </div>
  )
}

export default memo(SafetyOutlook)
