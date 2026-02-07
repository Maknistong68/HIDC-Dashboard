import React, { useState, useMemo, useCallback } from 'react'
import { Layers, ChevronRight, AlertTriangle } from 'lucide-react'

/**
 * Get color based on count for the badge
 */
const getCountColor = (count, maxCount) => {
  const ratio = maxCount > 0 ? count / maxCount : 0
  if (ratio > 0.7) return { bg: 'bg-red-500', text: 'text-white' }
  if (ratio > 0.4) return { bg: 'bg-amber-500', text: 'text-white' }
  if (ratio > 0.2) return { bg: 'bg-blue-500', text: 'text-white' }
  return { bg: 'bg-surface-400', text: 'text-white' }
}

/**
 * DetectionRatioCard - Shows total observations vs detected ratio
 * Includes warning when unclassified rate exceeds threshold
 */
const DetectionRatioCard = React.memo(({ totalIncidents, detectedCount, factors }) => {
  const detectionRate = totalIncidents > 0 ? ((detectedCount / totalIncidents) * 100).toFixed(1) : 0
  const notDetectedCount = totalIncidents - detectedCount
  const unclassifiedRate = totalIncidents > 0 ? ((notDetectedCount / totalIncidents) * 100) : 0

  // Show warning when unclassified rate exceeds 20%
  const showUnclassifiedWarning = unclassifiedRate > 20 && totalIncidents > 10

  return (
    <div className="bg-white rounded-lg border border-surface-200 p-3 mb-3">
      {/* Main stats */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-center flex-1">
          <p className="text-2xl font-bold text-surface-800">{totalIncidents}</p>
          <p className="text-2xs text-surface-500">Total Observations</p>
        </div>
        <div className="w-px h-10 bg-surface-200" />
        <div className="text-center flex-1">
          <p className="text-2xl font-bold text-primary-600">{detectedCount}</p>
          <p className="text-2xs text-surface-500">With Factors</p>
        </div>
      </div>

      {/* Detection rate bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-2xs text-surface-500">Detection Rate</span>
          <span className={`text-xs font-bold ${parseFloat(detectionRate) > 50 ? 'text-green-600' : parseFloat(detectionRate) > 20 ? 'text-amber-600' : 'text-red-500'}`}>
            {detectionRate}%
          </span>
        </div>
        <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              parseFloat(detectionRate) > 50 ? 'bg-green-500' : parseFloat(detectionRate) > 20 ? 'bg-amber-500' : 'bg-red-500'
            }`}
            style={{ width: `${detectionRate}%` }}
          />
        </div>
      </div>

      {/* Breakdown */}
      <div className="flex items-center justify-between text-2xs pt-2 border-t border-surface-100">
        <span className="text-surface-500">
          <span className="font-medium text-primary-600">{detectedCount}</span> detected
        </span>
        <span className="text-surface-300">|</span>
        <span className="text-surface-500">
          <span className="font-medium text-surface-600">{notDetectedCount}</span> no factors
        </span>
        <span className="text-surface-300">|</span>
        <span className="text-surface-500">
          <span className="font-medium text-surface-700">{factors?.length || 0}</span> factors
        </span>
      </div>

      {/* Unclassified warning - shown when >20% of observations have no factors */}
      {showUnclassifiedWarning && (
        <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-2xs">
              <p className="font-medium text-amber-800">
                High Unclassified Rate: {unclassifiedRate.toFixed(1)}%
              </p>
              <p className="text-amber-700 mt-0.5">
                {notDetectedCount} observations couldn't be classified. Factor detection patterns may need expansion.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

DetectionRatioCard.displayName = 'DetectionRatioCard'

/**
 * FactorItem - Individual factor button matching HazardItem styling
 */
const FactorItem = React.memo(({ factor, isSelected, onSelect, maxCount }) => {
  const isUnclassified = factor.isUnclassified || factor.name === 'Unclassified'
  // Use gray color for Unclassified factor
  const colorConfig = isUnclassified
    ? { bg: 'bg-gray-500', text: 'text-white' }
    : getCountColor(factor.count, maxCount)
  const hazardCount = factor.hazardBreakdown?.length || 0

  return (
    <button
      onClick={() => onSelect(factor)}
      className={`
        w-full flex items-center gap-2 p-2 rounded-lg
        text-left group
        transition-all duration-200 ease-out
        ${isSelected
          ? isUnclassified
            ? 'bg-gray-100 border-2 border-gray-500 shadow-sm'
            : 'bg-primary-100 border-2 border-primary-500 shadow-sm'
          : isUnclassified
            ? 'bg-gray-50 hover:bg-gray-100 hover:shadow-sm border-2 border-gray-300 hover:border-gray-400'
            : 'bg-white hover:bg-primary-50 hover:shadow-sm border-2 border-surface-200 hover:border-primary-200'
        }
      `}
    >
      {/* Count badge - matches trend indicator styling */}
      <span className={`flex-shrink-0 w-6 h-6 rounded ${colorConfig.bg} ${colorConfig.text} flex items-center justify-center text-xs font-bold transition-transform duration-200 ${isSelected ? 'scale-110' : ''}`}>
        {factor.count > 99 ? '99+' : factor.count}
      </span>

      {/* Name and hazard count */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm truncate transition-colors duration-200 ${
          isSelected
            ? isUnclassified ? 'text-gray-800 font-semibold' : 'text-primary-800 font-semibold'
            : isUnclassified ? 'text-gray-700 font-medium' : 'text-surface-800 font-medium'
        }`}>
          {factor.name}
          {isUnclassified && <span className="ml-1 text-2xs text-gray-500">(no factors)</span>}
        </p>
        <p className="text-xs text-surface-500">
          {hazardCount} hazard{hazardCount !== 1 ? 's' : ''} affected
        </p>
      </div>

      {/* Arrow */}
      <div className="flex flex-col items-end gap-0.5">
        <div className="flex items-center gap-1">
          <span className={`text-xs font-bold transition-colors duration-200 ${
            isSelected
              ? isUnclassified ? 'text-gray-600' : 'text-primary-600'
              : 'text-surface-500'
          }`}>
            {factor.count}
          </span>
          <ChevronRight
            size={16}
            className={`transition-all duration-200 ${
              isSelected
                ? isUnclassified ? 'text-gray-600 translate-x-0.5' : 'text-primary-600 translate-x-0.5'
                : 'text-surface-400 group-hover:text-surface-600 group-hover:translate-x-0.5'
            }`}
          />
        </div>
      </div>
    </button>
  )
})

FactorItem.displayName = 'FactorItem'

/**
 * FactorList - Left panel showing list of contributing factors
 * Styled to match HazardList
 */
const FactorList = ({ factors, selected, onSelect, totalIncidents = 0, detectedCount = 0 }) => {
  const [sortBy, setSortBy] = useState('count')

  // Memoized select handler
  const handleSelect = useCallback((factor) => {
    onSelect(factor)
  }, [onSelect])

  // Calculate max count for color scaling
  const maxCount = useMemo(() => {
    if (!factors?.length) return 0
    return Math.max(...factors.map(f => f.count))
  }, [factors])

  // Sort factors based on criteria
  const sortedFactors = useMemo(() => {
    if (!factors) return []
    const sorted = [...factors]

    if (sortBy === 'count') {
      sorted.sort((a, b) => b.count - a.count)
    } else if (sortBy === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === 'hazards') {
      sorted.sort((a, b) => (b.hazardBreakdown?.length || 0) - (a.hazardBreakdown?.length || 0))
    }

    return sorted
  }, [factors, sortBy])

  if (!factors || factors.length === 0) {
    return (
      <div className="flex flex-col h-full">
        {/* Still show the detection card even if no factors */}
        <DetectionRatioCard
          totalIncidents={totalIncidents}
          detectedCount={detectedCount}
          factors={factors}
        />
        <div className="flex flex-col items-center justify-center flex-1 text-center p-4">
          <div className="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center mb-3">
            <Layers size={24} className="text-surface-400" />
          </div>
          <p className="text-sm text-surface-500">No factors detected</p>
          <p className="text-xs text-surface-400 mt-1">Factors are detected from descriptions</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Detection ratio card */}
      <DetectionRatioCard
        totalIncidents={totalIncidents}
        detectedCount={detectedCount}
        factors={factors}
      />

      {/* Header with sort */}
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <p className="text-xs text-surface-500">Select to explore</p>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="text-xs text-surface-600 bg-white border border-surface-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-300 transition-colors duration-200"
        >
          <option value="count">By Count</option>
          <option value="hazards">By Hazards</option>
          <option value="name">By Name</option>
        </select>
      </div>

      {/* Factor list - scrollable with smooth scroll */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-1 pr-1 scroll-smooth">
        {sortedFactors.map((factor) => (
          <FactorItem
            key={factor.name}
            factor={factor}
            isSelected={selected?.name === factor.name}
            onSelect={handleSelect}
            maxCount={maxCount}
          />
        ))}
      </div>
    </div>
  )
}

export default React.memo(FactorList)
