import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { Target, AlertTriangle, AlertCircle } from 'lucide-react'
import { useData } from '../context/DataContext'
import { useDate } from '../context/DateContext'
import { useFilter } from '../context/FilterContext'
import { HazardList, HazardDetailPanel, FactorList, FactorDetailPanel } from '../components/outlook'
import FilterBar from '../components/common/FilterBar'
import TimePeriodToggle from '../components/common/TimePeriodToggle'
import { getHazardTrendingByPeriod } from '../utils/insightsCalculations'
import { aggregateContributingFactors, NEGATIVE_TYPES } from '../utils/rootCauseEngine'

/**
 * TrendSummary - Compact inline summary for Hazards tab
 */
const TrendSummary = ({ hazards }) => {
  const counts = useMemo(() => {
    const summary = { rising: 0, stable: 0, declining: 0 }

    hazards.forEach(h => {
      switch (h.trendLevel.level) {
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
      }
    })

    return summary
  }, [hazards])

  return (
    <div className="flex items-center gap-3 text-xs">
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
}

/**
 * FactorCoverageSummary - Shows factor detection coverage for Factors tab
 */
const FactorCoverageSummary = ({ factorData, totalNegative }) => {
  const coverage = useMemo(() => {
    const analyzed = factorData?.analyzed || 0
    const total = totalNegative || 0
    const percentage = total > 0 ? ((analyzed / total) * 100).toFixed(1) : 0
    const noFactor = total - analyzed

    return { analyzed, total, percentage, noFactor }
  }, [factorData, totalNegative])

  // Color based on coverage percentage
  const getCoverageColor = (pct) => {
    const p = parseFloat(pct)
    if (p >= 50) return 'text-green-600'
    if (p >= 25) return 'text-amber-600'
    return 'text-red-500'
  }

  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="text-surface-500">
        <span className={`font-medium ${getCoverageColor(coverage.percentage)}`}>{coverage.analyzed}</span>
        <span className="text-surface-400">/{coverage.total}</span> with factors
      </span>
      <span className="text-surface-300">·</span>
      <span className="text-surface-500">
        <span className={`font-bold ${getCoverageColor(coverage.percentage)}`}>{coverage.percentage}%</span> coverage
      </span>
    </div>
  )
}

/**
 * SafetyOutlook - Main page component with hazard list view
 */
const SafetyOutlook = () => {
  const { incidents } = useData()
  const { getPeriodRange } = useDate()

  // Shared filter state from context
  const { period, setPeriod, filters, setFilter, clearFilters, contractor, site } = useFilter()

  // Local state
  const [activeView, setActiveView] = useState('hazards') // 'hazards' | 'factors'
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

  // Filter configuration - Contractor (parent) and Site (child)
  const filterConfig = [
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

  // Filtered incidents based on contractor, site, and period
  const filteredIncidents = useMemo(() => {
    // If period is null, show all data (no date filtering)
    if (period === null) {
      return incidents.filter(i => {
        if (contractor && i.contractor !== contractor) return false
        if (site && i.site !== site) return false
        return true
      })
    }

    // Get date range from period
    const { start: dateFrom, end: dateTo } = getPeriodRange(period)

    return incidents.filter(i => {
      if (contractor && i.contractor !== contractor) return false
      if (site && i.site !== site) return false
      if (i.date < dateFrom) return false
      if (i.date > dateTo) return false
      return true
    })
  }, [incidents, contractor, site, period, getPeriodRange])

  // Calculate hazard trends based on filtered incidents and period
  const sortedHazards = useMemo(() => {
    return getHazardTrendingByPeriod(filteredIncidents, period)
  }, [filteredIncidents, period])

  // Calculate contributing factors data (for Factors tab)
  const factorData = useMemo(() => {
    return aggregateContributingFactors(filteredIncidents, 'negative')
  }, [filteredIncidents])

  // Count total negative observations (for factor coverage calculation)
  const totalNegativeObservations = useMemo(() => {
    return filteredIncidents.filter(i => NEGATIVE_TYPES.includes(i.type)).length
  }, [filteredIncidents])

  // Auto-select first hazard when data loads, or update selection if current hazard no longer exists
  useEffect(() => {
    if (sortedHazards.length === 0) {
      // No hazards available, clear selection
      if (selectedHazard) {
        setSelectedHazard(null)
      }
      return
    }

    if (!selectedHazard) {
      // No selection, pick first
      setSelectedHazard(sortedHazards[0])
      return
    }

    // Check if currently selected hazard still exists in the filtered list
    const stillExists = sortedHazards.some(h => h.name === selectedHazard.name)
    if (!stillExists) {
      // Selected hazard no longer in list, select first available
      setSelectedHazard(sortedHazards[0])
    }
  }, [sortedHazards, selectedHazard])

  // Auto-select first factor when factor data loads
  useEffect(() => {
    if (factorData.byFactor.length === 0) {
      if (selectedFactor) {
        setSelectedFactor(null)
      }
      return
    }

    if (!selectedFactor) {
      setSelectedFactor(factorData.byFactor[0])
      return
    }

    // Check if currently selected factor still exists
    const stillExists = factorData.byFactor.some(f => f.name === selectedFactor.name)
    if (!stillExists) {
      setSelectedFactor(factorData.byFactor[0])
    }
  }, [factorData.byFactor, selectedFactor])

  // Handlers
  const handleViewChange = useCallback((view) => {
    setActiveView(view)
    // Don't reset selections - preserve them when switching tabs
  }, [])

  const handlePeriodChange = useCallback((newPeriod) => {
    setPeriod(newPeriod)
    setSelectedHazard(null)
    setSelectedFactor(null)
  }, [setPeriod])

  const handleFilterChange = useCallback((key, value) => {
    setFilter(key, value)
    setSelectedHazard(null)
    setSelectedFactor(null)
  }, [setFilter])

  const handleClearFilters = useCallback(() => {
    clearFilters()
    setSelectedHazard(null)
    setSelectedFactor(null)
  }, [clearFilters])

  const handleHazardSelect = useCallback((hazard) => {
    setSelectedHazard(hazard)
  }, [])

  const handleFactorSelect = useCallback((factor) => {
    setSelectedFactor(factor)
  }, [])

  // Check if we have data
  const hasData = filteredIncidents.length > 0 && sortedHazards.length > 0

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
    <div className="space-y-3 flex flex-col h-full">
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

      {/* Tab selector with stats */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-surface-100 p-1 rounded-lg">
          <button
            onClick={() => handleViewChange('hazards')}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all
              ${activeView === 'hazards'
                ? 'bg-white text-surface-900 shadow-sm'
                : 'text-surface-600 hover:text-surface-800 hover:bg-surface-50'
              }
            `}
          >
            <Target size={14} />
            Hazards
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeView === 'hazards' ? 'bg-primary-100 text-primary-700' : 'bg-surface-200 text-surface-500'}`}>
              {sortedHazards.length}
            </span>
          </button>
          <button
            onClick={() => handleViewChange('factors')}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all
              ${activeView === 'factors'
                ? 'bg-white text-surface-900 shadow-sm'
                : 'text-surface-600 hover:text-surface-800 hover:bg-surface-50'
              }
            `}
          >
            <AlertCircle size={14} />
            Factors
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeView === 'factors' ? 'bg-primary-100 text-primary-700' : 'bg-surface-200 text-surface-500'}`}>
              {factorData.byFactor.length}
            </span>
          </button>
        </div>

        {/* Stats summary on the right */}
        <div className="flex items-center gap-3">
          {activeView === 'hazards' && <TrendSummary hazards={sortedHazards} />}
          {activeView === 'factors' && <FactorCoverageSummary factorData={factorData} totalNegative={totalNegativeObservations} />}
        </div>
      </div>

      {/* Main content - conditional rendering based on active view */}
      {activeView === 'hazards' ? (
        <div className="flex gap-3 flex-1 min-h-[320px] max-h-[calc(100vh-260px)]">
          {/* Left: Hazard List */}
          <div className="w-72 flex-shrink-0 bg-surface-50 rounded-lg border border-surface-200 p-3 flex flex-col">
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
          <div className="flex-1 min-w-0">
            <HazardDetailPanel
              hazard={selectedHazard}
              incidents={filteredIncidents}
              timePeriod={period}
            />
          </div>
        </div>
      ) : (
        <div className="flex gap-3 flex-1 min-h-[320px] max-h-[calc(100vh-260px)]">
          {/* Left: Factor List */}
          <div className="w-72 flex-shrink-0 bg-surface-50 rounded-lg border border-surface-200 p-3 flex flex-col">
            <div className="flex items-center justify-between mb-1 flex-shrink-0">
              <h2 className="text-sm font-semibold text-surface-800">Factors</h2>
              <span className="text-xs bg-surface-200 text-surface-600 px-1.5 py-0.5 rounded-full">{factorData.byFactor.length}</span>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              <FactorList
                factors={factorData.byFactor}
                selected={selectedFactor}
                onSelect={handleFactorSelect}
                totalIncidents={filteredIncidents.length}
                analyzedCount={factorData.analyzed}
                totalNegative={totalNegativeObservations}
              />
            </div>
          </div>

          {/* Right: Factor Detail Panel */}
          <div className="flex-1 min-w-0">
            <FactorDetailPanel
              factor={selectedFactor}
              factorData={factorData}
              incidents={filteredIncidents}
              timePeriod={period}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default SafetyOutlook
