import React, { useState, useMemo } from 'react'
import { AlertCircle, ChevronRight } from 'lucide-react'
import { FACTOR_TYPE } from '../../utils/rootCauseEngine'

// Type badge configs - similar to trend configs in HazardList
const TYPE_CONFIGS = {
  'common': { bg: 'bg-teal-500', text: 'text-white', label: 'C' },
  'specific': { bg: 'bg-violet-500', text: 'text-white', label: 'S' },
  'default': { bg: 'bg-surface-400', text: 'text-white', label: '?' }
}

const getTypeConfig = (factor) => {
  if (factor.type === FACTOR_TYPE.COMMON || factor.type === 'common') {
    return TYPE_CONFIGS.common
  }
  if (factor.type === FACTOR_TYPE.SPECIFIC || factor.type === 'specific') {
    return TYPE_CONFIGS.specific
  }
  return TYPE_CONFIGS.default
}

/**
 * FactorList - Left panel showing contributing factors sorted by count
 * Matches HazardList UI pattern
 */
const FactorList = ({ factors, selected, onSelect, totalIncidents, analyzedCount, totalNegative }) => {
  const [sortBy, setSortBy] = useState('count')

  // Sort factors based on selected criteria
  const sortedFactors = useMemo(() => {
    if (!factors) return []
    const sorted = [...factors]

    if (sortBy === 'count') {
      sorted.sort((a, b) => b.count - a.count)
    } else if (sortBy === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === 'type') {
      // Sort by type: Common first, then Specific
      sorted.sort((a, b) => {
        const aIsCommon = a.type === FACTOR_TYPE.COMMON || a.type === 'common'
        const bIsCommon = b.type === FACTOR_TYPE.COMMON || b.type === 'common'
        if (aIsCommon && !bIsCommon) return -1
        if (!aIsCommon && bIsCommon) return 1
        return b.count - a.count
      })
    }

    return sorted
  }, [factors, sortBy])

  if (!factors || factors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-4">
        <div className="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center mb-3">
          <AlertCircle size={24} className="text-surface-400" />
        </div>
        <p className="text-sm text-surface-500">No contributing factors found</p>
        <p className="text-xs text-surface-400 mt-1">Factors are detected from observation descriptions</p>
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
          className="text-xs text-surface-600 bg-white border border-surface-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-300"
        >
          <option value="count">By Count</option>
          <option value="name">By Name</option>
          <option value="type">By Type</option>
        </select>
      </div>

      {/* Factor list - scrollable */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1">
        {sortedFactors.map((factor) => {
          const typeConfig = getTypeConfig(factor)
          const isSelected = selected?.name === factor.name
          const percentage = totalIncidents > 0
            ? ((factor.count / totalIncidents) * 100).toFixed(1)
            : 0
          const isCommon = factor.type === FACTOR_TYPE.COMMON || factor.type === 'common'

          return (
            <button
              key={factor.name}
              onClick={() => onSelect(factor)}
              className={`
                w-full flex items-center gap-2 p-2 rounded-lg transition-all duration-150
                text-left group
                ${isSelected
                  ? 'bg-primary-100 ring-2 ring-primary-500 ring-inset shadow-sm'
                  : 'bg-white hover:bg-primary-50 hover:shadow-sm border border-surface-200'
                }
              `}
              title={isCommon ? 'Common Factor - applies to all hazards' : `Specific to ${factor.category || 'this hazard'}`}
            >
              {/* Type indicator badge */}
              <span className={`flex-shrink-0 w-6 h-6 rounded ${typeConfig.bg} ${typeConfig.text} flex items-center justify-center text-xs font-bold`}>
                {typeConfig.label}
              </span>

              {/* Name and type */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm truncate ${isSelected ? 'text-primary-800 font-semibold' : 'text-surface-800 font-medium'}`}>
                  {factor.name}
                </p>
                <p className="text-xs text-surface-500">
                  {factor.count} occurrences
                </p>
              </div>

              {/* Percentage and arrow */}
              <div className="flex flex-col items-end gap-0.5">
                <div className="flex items-center gap-1">
                  <span className={`text-xs font-bold ${isSelected ? 'text-primary-700' : 'text-surface-600'}`}>
                    {percentage}%
                  </span>
                  <ChevronRight
                    size={16}
                    className={`transition-transform ${isSelected ? 'text-primary-600' : 'text-surface-400 group-hover:text-surface-600 group-hover:translate-x-0.5'}`}
                  />
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Footer with coverage stats */}
      {totalNegative > 0 && (
        <div className="flex-shrink-0 pt-2 border-t border-surface-200 mt-2">
          <div className="flex items-center justify-center gap-2 text-xs">
            <span className="text-surface-400">Coverage:</span>
            <span className={`font-semibold ${
              analyzedCount / totalNegative >= 0.5 ? 'text-green-600' :
              analyzedCount / totalNegative >= 0.25 ? 'text-amber-600' : 'text-red-500'
            }`}>
              {analyzedCount} / {totalNegative}
            </span>
            <span className={`font-bold px-1.5 py-0.5 rounded ${
              analyzedCount / totalNegative >= 0.5 ? 'bg-green-100 text-green-700' :
              analyzedCount / totalNegative >= 0.25 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'
            }`}>
              {((analyzedCount / totalNegative) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default React.memo(FactorList)
