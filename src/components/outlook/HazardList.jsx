import React, { useState, useMemo, useCallback } from 'react'
import { Target, ChevronRight } from 'lucide-react'
import Tooltip from '../ui/Tooltip'

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
 */
const getTrendConfig = (trendLevel) => {
  if (!trendLevel || !trendLevel.level) {
    return TREND_CONFIGS.default
  }
  return TREND_CONFIGS[trendLevel.level] || TREND_CONFIGS.default
}

/**
 * HazardItem - Individual hazard button with smooth transitions
 */
const HazardItem = React.memo(({ hazard, isSelected, onSelect }) => {
  const trendConfig = getTrendConfig(hazard.trendLevel)

  // Format percentage with absolute counts for context
  const formatPercentWithCounts = () => {
    if (hazard.hasNoData) return { percent: '--', counts: null }

    // For new hazards, show as "New" with count
    if (hazard.isNew) {
      return {
        percent: '+100%',
        counts: `(0→${hazard.currentCount})`,
        isNew: true
      }
    }

    if (hazard.changePercent === undefined || hazard.changePercent === null) {
      return { percent: '--', counts: null }
    }

    const percent = Math.round(hazard.changePercent)
    let percentStr
    // Cap extreme percentages for readability but preserve info in tooltip
    if (percent > 500) {
      percentStr = '>500%'
    } else if (percent < -80) {
      percentStr = '<-80%'
    } else {
      const sign = percent >= 0 ? '+' : ''
      percentStr = `${sign}${percent}%`
    }

    // Include absolute counts for context
    const counts = `(${hazard.previousCount}→${hazard.currentCount})`

    return { percent: percentStr, counts }
  }

  const getPercentColor = () => {
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

  const getConfidenceIndicator = () => {
    if (hazard.hasNoData) return null
    // Show warning for low sample sizes
    if (hazard.confidence?.level === 'low') {
      return {
        icon: '⚠',
        tooltip: 'Low sample size - trend may be unreliable',
        color: 'text-amber-500'
      }
    }
    return null
  }

  const { percent, counts, isNew } = formatPercentWithCounts()
  const confidenceIndicator = getConfidenceIndicator()

  const buttonContent = (
    <button
      onClick={() => onSelect(hazard)}
      className={`
        w-full flex items-center gap-2 p-2 rounded-lg
        text-left group
        transition-all duration-200 ease-out
        ${isSelected
          ? 'bg-primary-50 border-2 border-primary-400 shadow-sm'
          : 'bg-white hover:bg-surface-50 border border-surface-200 hover:border-surface-300'
        }
      `}
    >
      {/* Trend indicator badge */}
      <span className={`flex-shrink-0 w-6 h-6 rounded ${trendConfig.bg} ${trendConfig.text} flex items-center justify-center text-xs font-bold`}>
        {trendConfig.icon}
      </span>

      {/* Name and count */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <p className={`text-sm truncate transition-colors duration-200 ${isSelected ? 'text-primary-700 font-semibold' : 'text-surface-800 font-medium'}`}>
            {hazard.name}
          </p>
          {/* Confidence warning indicator */}
          {confidenceIndicator && (
            <Tooltip content={confidenceIndicator.tooltip} position="top" delay={200}>
              <span className={`text-xs ${confidenceIndicator.color}`}>
                {confidenceIndicator.icon}
              </span>
            </Tooltip>
          )}
        </div>
        <p className="text-xs text-surface-500">
          {hazard.totalCount} observations
          {/* Show major hazard badge */}
          {hazard.isMajor && (
            <span className="ml-1.5 px-1 py-0.5 bg-red-100 text-red-600 rounded text-2xs font-medium">
              Major
            </span>
          )}
        </p>
      </div>

      {/* Change percent with absolute counts */}
      <div className="flex flex-col items-end gap-0.5">
        <div className="flex items-center gap-1">
          <span className={`text-xs font-bold transition-colors duration-200 ${getPercentColor()}`}>
            {isNew ? 'New' : percent}
          </span>
          <ChevronRight
            size={16}
            className={`transition-colors duration-200 ${isSelected ? 'text-primary-500' : 'text-surface-400 group-hover:text-surface-500'}`}
          />
        </div>
        {/* Absolute counts for context */}
        {counts && (
          <span className="text-2xs text-surface-400">
            {counts}
          </span>
        )}
      </div>
    </button>
  )

  // Wrap with Tooltip if confidence description exists
  if (hazard.confidence?.description) {
    return (
      <Tooltip content={hazard.confidence.description} position="right" delay={300}>
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
        <div className="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center mb-3">
          <Target size={24} className="text-surface-400" />
        </div>
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
      <div className="flex-1 overflow-y-auto space-y-1 pr-1 scroll-smooth">
        {sortedHazards.map((hazard) => (
          <HazardItem
            key={hazard.name}
            hazard={hazard}
            isSelected={selected?.name === hazard.name}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </div>
  )
}

export default React.memo(HazardList)
