import React, { useState, useMemo } from 'react'
import { AlertCircle, ChevronRight, Info } from 'lucide-react'
import { FACTOR_TYPE } from '../../utils/rootCauseEngine'

// Type badge configs - matches HazardList trend indicator pattern
const TYPE_CONFIGS = {
  'common': { bg: 'bg-teal-500', text: 'text-white', label: 'C', fullLabel: 'Common' },
  'specific': { bg: 'bg-violet-500', text: 'text-white', label: 'S', fullLabel: 'Specific' },
  'default': { bg: 'bg-surface-400', text: 'text-white', label: '?', fullLabel: 'Unknown' }
}

// Helper to check if factor is common type
const isCommonType = (type) => type === FACTOR_TYPE.COMMON || type === 'common'
const isSpecificType = (type) => type === FACTOR_TYPE.SPECIFIC || type === 'specific'

const getTypeConfig = (factor) => {
  if (isCommonType(factor.type)) return TYPE_CONFIGS.common
  if (isSpecificType(factor.type)) return TYPE_CONFIGS.specific
  return TYPE_CONFIGS.default
}

/**
 * Get confidence level based on sample size
 */
const getConfidence = (count) => {
  if (count >= 10) return { level: 'high', color: 'text-green-600' }
  if (count >= 5) return { level: 'medium', color: 'text-amber-600' }
  return { level: 'low', color: 'text-red-500', icon: '⚠' }
}

/**
 * FactorList - Left panel showing contributing factors sorted by count
 * Matches HazardList UI pattern with optimized performance
 */
const FactorList = ({ factors, selected, onSelect, totalIncidents, analyzedCount, totalNegative }) => {
  const [sortBy, setSortBy] = useState('count')

  // Use totalNegative as the base for percentage (factor coverage)
  const baseCount = totalNegative || totalIncidents || 1

  // Sort factors based on selected criteria - memoized for performance
  const sortedFactors = useMemo(() => {
    if (!factors || factors.length === 0) return []
    const sorted = [...factors]

    switch (sortBy) {
      case 'count':
        sorted.sort((a, b) => b.count - a.count)
        break
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'type':
        // Common factors first, then Specific, then by count within type
        sorted.sort((a, b) => {
          const aIsCommon = isCommonType(a.type)
          const bIsCommon = isCommonType(b.type)
          if (aIsCommon && !bIsCommon) return -1
          if (!aIsCommon && bIsCommon) return 1
          return b.count - a.count
        })
        break
      default:
        break
    }

    return sorted
  }, [factors, sortBy])

  // Count common vs specific factors for summary
  const typeCounts = useMemo(() => {
    if (!factors) return { common: 0, specific: 0 }
    return factors.reduce((acc, f) => {
      if (isCommonType(f.type)) acc.common++
      else if (isSpecificType(f.type)) acc.specific++
      return acc
    }, { common: 0, specific: 0 })
  }, [factors])

  // Empty state
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
          const percentage = baseCount > 0
            ? ((factor.count / baseCount) * 100).toFixed(1)
            : '0.0'
          const confidence = getConfidence(factor.count)

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
              title={`${typeConfig.fullLabel} Factor - ${factor.count} occurrences (${percentage}% of negative observations)`}
            >
              {/* Type indicator badge */}
              <span className={`flex-shrink-0 w-6 h-6 rounded ${typeConfig.bg} ${typeConfig.text} flex items-center justify-center text-xs font-bold`}>
                {typeConfig.label}
              </span>

              {/* Name and count */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className={`text-sm truncate ${isSelected ? 'text-primary-800 font-semibold' : 'text-surface-800 font-medium'}`}>
                    {factor.name}
                  </p>
                  {/* Low confidence warning */}
                  {confidence.level === 'low' && (
                    <span className={`text-xs ${confidence.color}`} title="Low sample size - may be unreliable">
                      {confidence.icon}
                    </span>
                  )}
                </div>
                <p className="text-xs text-surface-500">
                  {factor.count} occurrence{factor.count !== 1 ? 's' : ''}
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

      {/* Footer with coverage stats and legend */}
      <div className="flex-shrink-0 pt-2 border-t border-surface-200 mt-2 space-y-2">
        {/* Type legend */}
        <div className="flex items-center justify-center gap-3 text-xs">
          <div className="flex items-center gap-1" title="Common Factors apply to all hazard types">
            <span className="w-4 h-4 rounded bg-teal-500 text-white flex items-center justify-center text-2xs font-bold">C</span>
            <span className="text-surface-500">Common ({typeCounts.common})</span>
          </div>
          <div className="flex items-center gap-1" title="Specific Factors are unique to certain hazard types">
            <span className="w-4 h-4 rounded bg-violet-500 text-white flex items-center justify-center text-2xs font-bold">S</span>
            <span className="text-surface-500">Specific ({typeCounts.specific})</span>
          </div>
        </div>

        {/* Coverage stats */}
        {totalNegative > 0 && (
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
        )}
      </div>
    </div>
  )
}

export default React.memo(FactorList)
