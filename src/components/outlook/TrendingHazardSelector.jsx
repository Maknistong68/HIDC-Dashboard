import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, X, TrendingUp, TrendingDown, Minus, Check, Zap } from 'lucide-react'

/**
 * TrendingHazardSelector - Multi-select hazard picker with trend badges
 *
 * Features:
 * - "All Trending Hazards" checkbox (auto-selects significant-rise + rising)
 * - Multi-select dropdown with trend level badges
 * - Pill display of selected hazards with remove buttons
 */
const TrendingHazardSelector = ({
  trendingHazards = [],
  selectedHazards = [],
  selectAllTrending = false,
  onToggleHazard,
  onToggleAllTrending,
  onClearSelection,
  maxDisplay = 3
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Get trend badge config
  const getTrendBadge = (trendLevel) => {
    if (!trendLevel) return { color: 'bg-surface-200 text-surface-600', icon: Minus, label: 'Unknown' }

    switch (trendLevel.level) {
      case 'significant-rise':
        return { color: 'bg-red-100 text-red-700', icon: TrendingUp, label: '↑↑' }
      case 'rising':
        return { color: 'bg-orange-100 text-orange-700', icon: TrendingUp, label: '↑' }
      case 'stable':
        return { color: 'bg-surface-200 text-surface-600', icon: Minus, label: '–' }
      case 'declining':
        return { color: 'bg-green-100 text-green-700', icon: TrendingDown, label: '↓' }
      case 'significant-decline':
        return { color: 'bg-green-100 text-green-700', icon: TrendingDown, label: '↓↓' }
      case 'no-data':
        return { color: 'bg-surface-100 text-surface-400', icon: Minus, label: '○' }
      default:
        return { color: 'bg-surface-200 text-surface-600', icon: Minus, label: '–' }
    }
  }

  // Filter to get trending hazards (significant-rise or rising)
  const trendingList = trendingHazards.filter(h =>
    h.trendLevel?.level === 'significant-rise' ||
    h.trendLevel?.level === 'rising'
  )

  // Get display text for button
  const getDisplayText = () => {
    if (selectAllTrending) {
      return `All Trending (${trendingList.length})`
    }
    if (selectedHazards.length === 0) {
      return 'Select hazards...'
    }
    if (selectedHazards.length === 1) {
      return selectedHazards[0]
    }
    return `${selectedHazards.length} hazards selected`
  }

  // Visible pills (limited to maxDisplay)
  const visiblePills = selectedHazards.slice(0, maxDisplay)
  const hiddenCount = Math.max(0, selectedHazards.length - maxDisplay)

  return (
    <div className="space-y-2">
      {/* Label */}
      <div className="flex items-center gap-2">
        <Zap size={14} className="text-amber-500" />
        <span className="text-xs font-medium text-surface-600">Target Hazards</span>
      </div>

      {/* Selector Button & Dropdown */}
      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-3 py-2 text-sm border rounded-lg bg-white transition-all ${
            isOpen
              ? 'border-primary-400 ring-2 ring-primary-100'
              : 'border-surface-200 hover:border-surface-300'
          }`}
        >
          <span className={`truncate ${selectedHazards.length === 0 && !selectAllTrending ? 'text-surface-400' : 'text-surface-700'}`}>
            {getDisplayText()}
          </span>
          <ChevronDown
            size={16}
            className={`text-surface-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-surface-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {/* All Trending Option */}
            <button
              type="button"
              onClick={() => {
                onToggleAllTrending()
                setIsOpen(false)
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                selectAllTrending
                  ? 'bg-primary-50 text-primary-700'
                  : 'hover:bg-surface-50 text-surface-700'
              }`}
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                selectAllTrending
                  ? 'bg-primary-600 border-primary-600'
                  : 'border-surface-300'
              }`}>
                {selectAllTrending && <Check size={12} className="text-white" />}
              </div>
              <TrendingUp size={14} className="text-red-500" />
              <span className="font-medium">All Trending Hazards</span>
              <span className="ml-auto text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                {trendingList.length}
              </span>
            </button>

            {/* Divider */}
            <div className="border-t border-surface-100 my-1" />

            {/* Individual Hazards */}
            {trendingHazards
              .filter(h => !h.hasNoData && h.totalCount > 0)
              .map(hazard => {
                const isSelected = selectedHazards.includes(hazard.name)
                const trend = getTrendBadge(hazard.trendLevel)

                return (
                  <button
                    key={hazard.name}
                    type="button"
                    onClick={() => onToggleHazard(hazard.name)}
                    disabled={selectAllTrending}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                      selectAllTrending
                        ? 'opacity-50 cursor-not-allowed bg-surface-50'
                        : isSelected
                          ? 'bg-primary-50 text-primary-700'
                          : 'hover:bg-surface-50 text-surface-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                      isSelected || (selectAllTrending && trendingList.some(t => t.name === hazard.name))
                        ? 'bg-primary-600 border-primary-600'
                        : 'border-surface-300'
                    }`}>
                      {(isSelected || (selectAllTrending && trendingList.some(t => t.name === hazard.name))) && (
                        <Check size={12} className="text-white" />
                      )}
                    </div>
                    <span className="flex-1 text-left truncate">{hazard.name}</span>
                    <span className={`text-2xs px-1.5 py-0.5 rounded ${trend.color}`}>
                      {trend.label}
                    </span>
                    <span className="text-xs text-surface-400">
                      {hazard.totalCount}
                    </span>
                  </button>
                )
              })}

            {/* No hazards message */}
            {trendingHazards.filter(h => !h.hasNoData && h.totalCount > 0).length === 0 && (
              <div className="px-3 py-4 text-sm text-surface-400 text-center">
                No hazards with data available
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Hazard Pills */}
      {(selectedHazards.length > 0 || selectAllTrending) && (
        <div className="flex flex-wrap items-center gap-1.5">
          {selectAllTrending ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
              <TrendingUp size={12} />
              All Trending ({trendingList.length})
              <button
                type="button"
                onClick={onToggleAllTrending}
                className="ml-0.5 hover:bg-red-200 rounded-full p-0.5 transition-colors"
              >
                <X size={10} />
              </button>
            </span>
          ) : (
            <>
              {visiblePills.map(hazardName => {
                const hazard = trendingHazards.find(h => h.name === hazardName)
                const trend = getTrendBadge(hazard?.trendLevel)

                return (
                  <span
                    key={hazardName}
                    className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${trend.color}`}
                  >
                    {hazardName.length > 20 ? `${hazardName.slice(0, 18)}...` : hazardName}
                    <button
                      type="button"
                      onClick={() => onToggleHazard(hazardName)}
                      className="ml-0.5 hover:opacity-70 rounded-full p-0.5 transition-opacity"
                    >
                      <X size={10} />
                    </button>
                  </span>
                )
              })}
              {hiddenCount > 0 && (
                <span className="text-xs text-surface-500">
                  +{hiddenCount} more
                </span>
              )}
            </>
          )}

          {/* Clear All Button */}
          {selectedHazards.length > 1 && !selectAllTrending && (
            <button
              type="button"
              onClick={onClearSelection}
              className="text-xs text-surface-500 hover:text-surface-700 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default React.memo(TrendingHazardSelector)
