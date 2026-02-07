import React, { useMemo, useState, useCallback, useEffect, startTransition, memo } from 'react'
import { Target, AlertTriangle, Layers, Zap, Shield } from 'lucide-react'
import { useData } from '../context/DataContext'
import { useDate } from '../context/DateContext'
import { useFilter } from '../context/FilterContext'
import { HazardList, HazardDetailPanel, FactorList, FactorDetailPanel, RiskPerformanceTab, PredictiveSimulationTab } from '../components/outlook'
import TabErrorBoundary from '../components/common/TabErrorBoundary'
import FilterBar from '../components/common/FilterBar'
import TimePeriodToggle from '../components/common/TimePeriodToggle'
import { getHazardTrendingByPeriod, getHazardDailyData, getIncidentPredictionSummary } from '../utils/insightsCalculations'
import { aggregateContributingFactors, isPositiveType } from '../utils/rootCauseEngine'
import { SUB_REGION_OPTIONS } from '../utils/constants'

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

/**
 * SafetyOutlook - Main page component with 3-tab layout
 * Tab 1: Correlations (Hazards & Factors)
 * Tab 2: Predictive & Simulation
 * Tab 3: Risk & Performance
 */
const SafetyOutlook = () => {
  const { incidents, siteClassifications, hasSubregionAssignments } = useData()
  const { getPeriodRange } = useDate()

  // Shared filter state from context
  const { period, setPeriod, filters, setFilter, clearFilters, contractor, site, subRegion } = useFilter()

  // Local state
  const [activeMainTab, setActiveMainTab] = useState('correlations')
  const [activeSubTab, setActiveSubTab] = useState('hazards') // 'hazards' or 'factors'
  const [selectedHazard, setSelectedHazard] = useState(null)
  const [selectedFactor, setSelectedFactor] = useState(null)

  // Get unique contractors from incidents
  const uniqueContractors = useMemo(() => {
    const contractors = [...new Set(incidents.map(i => i.contractor).filter(Boolean))]
    return contractors.sort().map(contractor => ({ value: contractor, label: contractor }))
  }, [incidents])

  // Get sites filtered by selected contractor (parent-child relationship)
  const siteOptions = useMemo(() => {
    let relevantIncidents = incidents
    if (contractor) {
      relevantIncidents = incidents.filter(i => i.contractor === contractor)
    }
    const sites = [...new Set(relevantIncidents.map(i => i.site).filter(Boolean))]
    return sites.sort().map(site => ({ value: site, label: site }))
  }, [incidents, contractor])

  // Filter configuration - Contractor (parent), Site (child), and Sub-Region (conditional)
  const filterConfig = useMemo(() => {
    const config = [
      {
        key: 'contractor',
        type: 'select',
        label: 'Contractor',
        placeholder: 'All Contractors',
        options: uniqueContractors
      },
      {
        key: 'site',
        type: 'select',
        label: 'Site',
        placeholder: 'All Sites',
        options: siteOptions
      }
    ]

    // Only show Sub-Region filter if there are any site assignments
    if (hasSubregionAssignments) {
      config.push({
        key: 'subRegion',
        type: 'select',
        label: 'Sub-Region',
        placeholder: 'All Sub-Regions',
        options: SUB_REGION_OPTIONS
      })
    }

    return config
  }, [uniqueContractors, siteOptions, hasSubregionAssignments])

  // Filtered incidents based on contractor, site, subRegion, and period
  const filteredIncidents = useMemo(() => {
    // If period is null, show all data (no date filtering)
    if (period === null) {
      return incidents.filter(i => {
        if (contractor && i.contractor !== contractor) return false
        if (site && i.site !== site) return false
        // Filter by sub-region using site classifications
        if (subRegion && siteClassifications[i.site] !== subRegion) return false
        return true
      })
    }

    // Get date range from period
    const { start: dateFrom, end: dateTo } = getPeriodRange(period)

    return incidents.filter(i => {
      if (contractor && i.contractor !== contractor) return false
      if (site && i.site !== site) return false
      // Filter by sub-region using site classifications
      if (subRegion && siteClassifications[i.site] !== subRegion) return false
      if (i.date < dateFrom) return false
      if (i.date > dateTo) return false
      return true
    })
  }, [incidents, contractor, site, subRegion, siteClassifications, period, getPeriodRange])

  // Calculate hazard trends based on filtered incidents and period
  const sortedHazards = useMemo(() => {
    return getHazardTrendingByPeriod(filteredIncidents, period)
  }, [filteredIncidents, period])

  // Calculate contributing factors (negative observations only)
  const factorData = useMemo(() => {
    return aggregateContributingFactors(filteredIncidents, 'negative')
  }, [filteredIncidents])

  // Calculate hazard trend data for selected hazard
  const hazardTrendData = useMemo(() => {
    if (!selectedHazard?.name) return null
    return getHazardDailyData(filteredIncidents, selectedHazard.name, period)
  }, [filteredIncidents, selectedHazard?.name, period])

  // Calculate factor trend data for selected factor
  const factorTrendData = useMemo(() => {
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
  const negativeIncidents = useMemo(() => {
    return filteredIncidents.filter(i => !isPositiveType(i.type))
  }, [filteredIncidents])

  // Incident prediction summary (for Tab 2)
  const incidentPrediction = useMemo(() => {
    return getIncidentPredictionSummary(negativeIncidents)
  }, [negativeIncidents])

  // General daily trend data for all hazards (for Tab 2 forecast chart)
  const allHazardTrendData = useMemo(() => {
    if (!negativeIncidents.length) return { days: [], avgPerDay: 0, hasData: false }
    const dateMap = new Map()
    negativeIncidents.forEach(i => {
      if (!i.date) return
      const d = typeof i.date === 'string' ? i.date.split('T')[0] : i.date
      dateMap.set(d, (dateMap.get(d) || 0) + 1)
    })
    const days = Array.from(dateMap.entries())
      .map(([date, count]) => ({ date, label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), count }))
      .sort((a, b) => a.date.localeCompare(b.date))
    const avgPerDay = days.length > 0 ? negativeIncidents.length / days.length : 0
    return { days, avgPerDay, totalCount: negativeIncidents.length, hasData: true }
  }, [negativeIncidents])

  // Calculate detected incidents count (unique incidents that have at least one REAL factor - exclude Unclassified)
  const detectedIncidentsCount = useMemo(() => {
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
    startTransition(() => {
      setSelectedHazard(null)
    })
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

  const handleMainTabChange = useCallback((tab) => {
    startTransition(() => {
      setActiveMainTab(tab)
    })
  }, [])

  const handleSubTabChange = useCallback((tab) => {
    setActiveSubTab(tab)
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
              activeFilters={filters}
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
              activeFilters={filters}
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
    <div className="space-y-4 flex flex-col">
      {/* Filters Row - consistent with Dashboard */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <FilterBar
            filters={filterConfig}
            activeFilters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
        </div>
        <TimePeriodToggle period={period} onPeriodChange={handlePeriodChange} showAll />
      </div>

      {/* ==================== 3 MAIN TABS ==================== */}
      <div role="tablist" aria-label="Safety Outlook tabs" className="flex items-center gap-1 overflow-x-auto border-b border-surface-200 pb-0">
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

      {/* ==================== TAB CONTENT ==================== */}

      {/* Tab 1: Correlations */}
      {activeMainTab === 'correlations' && (
        <TabErrorBoundary label="Correlations">
        <div role="tabpanel" id="tabpanel-correlations" aria-labelledby="tab-correlations" className="flex flex-col gap-3 flex-1 animate-fade-in">
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
          <div className="flex gap-3 flex-1 min-h-[320px] max-h-[calc(100vh-310px)]">
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
                <div className="flex-1 min-w-0 transition-all duration-200">
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
                <div className="flex-1 min-w-0 transition-all duration-200">
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
      )}

      {/* Tab 2: Predictive & Simulation */}
      {activeMainTab === 'predictive' && (
        <TabErrorBoundary label="Predictive & Simulation">
        <div role="tabpanel" id="tabpanel-predictive" aria-labelledby="tab-predictive">
          <PredictiveSimulationTab
            filteredIncidents={filteredIncidents}
            negativeIncidents={negativeIncidents}
            sortedHazards={sortedHazards}
            factorData={factorData}
            incidentPrediction={incidentPrediction}
            hazardTrendData={allHazardTrendData}
            selectedHazardName={selectedHazard?.name}
            period={period}
          />
        </div>
        </TabErrorBoundary>
      )}

      {/* Tab 3: Risk & Performance */}
      {activeMainTab === 'risk' && (
        <TabErrorBoundary label="Risk & Performance">
        <div role="tabpanel" id="tabpanel-risk" aria-labelledby="tab-risk">
          <RiskPerformanceTab
            filteredIncidents={filteredIncidents}
            siteClassifications={siteClassifications}
          />
        </div>
        </TabErrorBoundary>
      )}
    </div>
  )
}

export default memo(SafetyOutlook)
