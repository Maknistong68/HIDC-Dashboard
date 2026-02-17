import React, { useState, useMemo, useCallback } from 'react'
import { AlertTriangle } from 'lucide-react'

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
 * FactorItem - Clean numbered factor row matching HazardItem styling
 */
const FactorItem = React.memo(({ factor, index, isSelected, onSelect, sortBy }) => {
  const isUnclassified = factor.isUnclassified || factor.name === 'Unclassified'
  const hazardCount = factor.hazardBreakdown?.length || 0

  // Value depends on active sort
  const value = sortBy === 'hazards' ? hazardCount : factor.count

  return (
    <button
      onClick={() => onSelect(factor)}
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

      {/* Factor name */}
      <p className={`flex-1 min-w-0 text-sm truncate transition-colors duration-200 ${
        isSelected ? 'text-primary-700 font-semibold' : isUnclassified ? 'text-surface-500 font-medium' : 'text-surface-800 font-medium'
      }`}>
        {factor.name}
      </p>

      {/* Value (count or hazard count) */}
      <span className="flex-shrink-0 text-xs font-bold tabular-nums text-surface-600">
        {value}
      </span>
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
        {sortedFactors.map((factor, index) => (
          <FactorItem
            key={factor.name}
            factor={factor}
            index={index}
            isSelected={selected?.name === factor.name}
            onSelect={handleSelect}
            sortBy={sortBy}
          />
        ))}
      </div>
    </div>
  )
}

export default React.memo(FactorList)
