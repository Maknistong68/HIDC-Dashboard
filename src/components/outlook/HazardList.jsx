import React, { useState, useMemo, useCallback } from 'react'
import Tooltip from '../ui/Tooltip'

/**
 * Get trend-based text color for the value display
 */
const getValueColor = (hazard) => {
  if (hazard.hasNoData) return 'text-surface-300'
  if (hazard.isNew) return 'text-blue-600'
  const percent = hazard.changePercent
  if (percent === undefined || percent === null) return 'text-surface-500'
  if (percent > 30) return 'text-safety-critical'
  if (percent > 10) return 'text-safety-warning'
  if (percent > -10) return 'text-surface-500'
  if (percent > -30) return 'text-emerald-500'
  return 'text-safety-success'
}

/**
 * Format the change percent for display
 */
const formatChangePercent = (hazard) => {
  if (hazard.hasNoData) return '--'
  if (hazard.isNew) return 'New'
  if (hazard.changePercent === undefined || hazard.changePercent === null) return '--'

  const percent = Math.round(hazard.changePercent)
  if (percent > 500) return '>500%'
  if (percent < -80) return '<-80%'
  const sign = percent >= 0 ? '+' : ''
  return `${sign}${percent}%`
}

/**
 * HazardItem - Clean numbered hazard row
 */
const HazardItem = React.memo(({ hazard, index, isSelected, onSelect, sortBy }) => {
  const value = sortBy === 'count'
    ? hazard.totalCount
    : formatChangePercent(hazard)

  const valueColor = sortBy === 'change' ? getValueColor(hazard) : 'text-surface-600'

  const buttonContent = (
    <button
      onClick={() => onSelect(hazard)}
      className={`
        w-full flex items-center gap-2.5 px-3 py-2 rounded-lg
        text-left group
        transition-all duration-200 ease-out
        ${isSelected
          ? 'bg-primary-50 border-2 border-primary-400 shadow-sm'
          : 'bg-white hover:bg-surface-50 border-2 border-surface-200 hover:border-surface-300'
        }
      `}
    >
      {/* Rank number */}
      <span className="flex-shrink-0 w-5 text-xs text-surface-400 text-right tabular-nums">
        {index + 1}.
      </span>

      {/* Hazard name */}
      <p className={`flex-1 min-w-0 text-sm truncate transition-colors duration-200 ${isSelected ? 'text-primary-700 font-semibold' : 'text-surface-800 font-medium'}`}>
        {hazard.name}
      </p>

      {/* Value (count or % change) */}
      <span className={`flex-shrink-0 text-xs font-bold tabular-nums ${valueColor}`}>
        {value}
      </span>
    </button>
  )

  // Wrap with Tooltip if confidence description exists
  if (hazard.confidence?.description) {
    return (
      <Tooltip content={hazard.confidence.description} position="right" delay={300} className="w-full">
        {buttonContent}
      </Tooltip>
    )
  }

  return buttonContent
})

HazardItem.displayName = 'HazardItem'

/**
 * HazardList - Left panel showing sortable list of hazard categories
 * Fixed height with scroll, sort filter, simplified styling
 * Optimized with React.memo and smooth transitions
 */
const HazardList = ({ hazards, selected, onSelect }) => {
  const [sortBy, setSortBy] = useState('count')

  // Memoized select handler
  const handleSelect = useCallback((hazard) => {
    onSelect(hazard)
  }, [onSelect])

  // Sort hazards based on selected criteria
  const sortedHazards = useMemo(() => {
    if (!hazards) return []
    const sorted = [...hazards]

    if (sortBy === 'count') {
      // Sort by observation count (highest first)
      sorted.sort((a, b) => (b.totalCount || 0) - (a.totalCount || 0))
    } else if (sortBy === 'change') {
      // Sort by % change (highest first)
      sorted.sort((a, b) => {
        // Get effective change percent (new hazards treated as +100%)
        const aEffective = a.isNew ? 100 : (a.changePercent ?? -Infinity)
        const bEffective = b.isNew ? 100 : (b.changePercent ?? -Infinity)

        // No-data hazards go to bottom
        if (a.hasNoData && !b.hasNoData) return 1
        if (!a.hasNoData && b.hasNoData) return -1

        // Sort by effective change descending
        if (bEffective !== aEffective) {
          return bEffective - aEffective
        }

        // Tie-breaker: higher count first
        return (b.totalCount || 0) - (a.totalCount || 0)
      })
    }

    return sorted
  }, [hazards, sortBy])

  if (!hazards || hazards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-4">
        <p className="text-sm text-surface-500">No hazard data available</p>
        <p className="text-xs text-surface-400 mt-1">Import data to see hazard trends</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header with sort */}
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <p className="text-xs text-surface-500">Select to explore</p>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="text-xs text-surface-600 bg-white border border-surface-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-300 transition-colors duration-200"
        >
          <option value="count">By Count</option>
          <option value="change">By % Change</option>
        </select>
      </div>

      {/* Hazard list - scrollable with smooth scroll */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-1 pr-1 scroll-smooth">
        {sortedHazards.map((hazard, index) => (
          <HazardItem
            key={hazard.name}
            hazard={hazard}
            index={index}
            isSelected={selected?.name === hazard.name}
            onSelect={handleSelect}
            sortBy={sortBy}
          />
        ))}
      </div>
    </div>
  )
}

export default React.memo(HazardList)
