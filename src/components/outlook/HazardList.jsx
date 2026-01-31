import React, { useState, useMemo } from 'react'
import { Target, ChevronRight } from 'lucide-react'

// Static mapping for trend configs - defined outside component to avoid recreation
const TREND_CONFIGS = {
  'significant-rise': { bg: 'bg-red-500', text: 'text-white', icon: '▲▲' },
  'rising': { bg: 'bg-amber-500', text: 'text-white', icon: '▲' },
  'stable': { bg: 'bg-surface-400', text: 'text-white', icon: '―' },
  'declining': { bg: 'bg-emerald-500', text: 'text-white', icon: '▼' },
  'significant-decline': { bg: 'bg-green-600', text: 'text-white', icon: '▼▼' },
  'new': { bg: 'bg-blue-500', text: 'text-white', icon: '★' },
  'no-data': { bg: 'bg-surface-200', text: 'text-surface-400', icon: '○' },
  'default': { bg: 'bg-surface-300', text: 'text-white', icon: '―' }
}

/**
 * Get trend indicator config based on trendLevel object
 * @param {Object} trendLevel - The trendLevel object containing level property
 */
const getTrendConfig = (trendLevel) => {
  if (!trendLevel || !trendLevel.level) {
    return TREND_CONFIGS.default
  }
  return TREND_CONFIGS[trendLevel.level] || TREND_CONFIGS.default
}

/**
 * HazardList - Left panel showing sortable list of hazard categories
 * Fixed height with scroll, sort filter, simplified styling
 */
const HazardList = ({ hazards, selected, onSelect }) => {
  const [sortBy, setSortBy] = useState('count')

  // Sort hazards based on selected criteria
  const sortedHazards = useMemo(() => {
    if (!hazards) return []
    const sorted = [...hazards]

    if (sortBy === 'count') {
      // Sort by observation count (highest first)
      sorted.sort((a, b) => (b.totalCount || 0) - (a.totalCount || 0))
    } else if (sortBy === 'change') {
      // Sort by % change (highest first), items without change data go to bottom
      sorted.sort((a, b) => {
        const aHasChange = !a.isNew && a.changePercent !== undefined && a.changePercent !== null
        const bHasChange = !b.isNew && b.changePercent !== undefined && b.changePercent !== null

        // Items with change data come first
        if (aHasChange && !bHasChange) return -1
        if (!aHasChange && bHasChange) return 1

        // If both have change data, sort by change percent descending
        if (aHasChange && bHasChange) {
          return (b.changePercent || 0) - (a.changePercent || 0)
        }

        // If neither has change data, sort by count as fallback
        return (b.totalCount || 0) - (a.totalCount || 0)
      })
    }

    return sorted
  }, [hazards, sortBy])

  if (!hazards || hazards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-4">
        <div className="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center mb-3">
          <Target size={24} className="text-surface-400" />
        </div>
        <p className="text-sm text-surface-500">No hazard data available</p>
        <p className="text-xs text-surface-400 mt-1">Import data to see hazard trends</p>
      </div>
    )
  }


  const formatPercent = (hazard) => {
    // Show "--" for no-data or new hazards
    if (hazard.hasNoData) return '--'
    if (hazard.isNew) return '--'
    if (hazard.changePercent === undefined || hazard.changePercent === null) return '--'
    const percent = Math.round(hazard.changePercent)
    // Cap extreme percentages for readability
    if (percent > 500) return '>500%'
    if (percent < -80) return '<-80%'
    const sign = percent >= 0 ? '+' : ''
    return `${sign}${percent}%`
  }

  const getPercentColor = (hazard) => {
    if (hazard.hasNoData) return 'text-surface-300'
    if (hazard.isNew) return 'text-primary-500'
    const percent = hazard.changePercent
    if (percent === undefined || percent === null) return 'text-surface-500'
    if (percent > 30) return 'text-safety-critical'
    if (percent > 10) return 'text-safety-warning'
    if (percent > -10) return 'text-surface-500'
    if (percent > -30) return 'text-emerald-500'
    return 'text-safety-success'
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header with sort */}
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <p className="text-xs text-surface-500">Select to explore</p>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="text-xs text-surface-600 bg-white border border-surface-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-300"
        >
          <option value="count">By Count</option>
          <option value="change">By % Change</option>
        </select>
      </div>

      {/* Hazard list - scrollable */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1">
        {sortedHazards.map((hazard) => {
          const trendConfig = getTrendConfig(hazard.trendLevel)
          const isSelected = selected?.name === hazard.name

          return (
            <button
              key={hazard.name}
              onClick={() => onSelect(hazard)}
              className={`
                w-full flex items-center gap-2 p-2 rounded-lg transition-all duration-150
                text-left group
                ${isSelected
                  ? 'bg-primary-100 ring-2 ring-primary-500 ring-inset shadow-sm'
                  : 'bg-white hover:bg-primary-50 hover:shadow-sm border border-surface-200'
                }
              `}
            >
              {/* Trend indicator badge */}
              <span className={`flex-shrink-0 w-6 h-6 rounded ${trendConfig.bg} ${trendConfig.text} flex items-center justify-center text-xs font-bold`}>
                {trendConfig.icon}
              </span>

              {/* Name and count */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm truncate ${isSelected ? 'text-primary-800 font-semibold' : 'text-surface-800 font-medium'}`}>
                  {hazard.name}
                </p>
                <p className="text-xs text-surface-500">
                  {hazard.totalCount} observations
                </p>
              </div>

              {/* Change percent + arrow */}
              <div className="flex items-center gap-1">
                <span className={`text-xs font-bold ${getPercentColor(hazard)}`}>
                  {formatPercent(hazard)}
                </span>
                <ChevronRight
                  size={16}
                  className={`transition-transform ${isSelected ? 'text-primary-600' : 'text-surface-400 group-hover:text-surface-600 group-hover:translate-x-0.5'}`}
                />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default React.memo(HazardList)
