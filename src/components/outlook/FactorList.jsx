import React, { useState, useMemo } from 'react'
import { AlertCircle, ChevronRight } from 'lucide-react'

// Category color mapping for visual distinction
const CATEGORY_COLORS = {
  'Human Factors': { bg: 'bg-orange-100', border: 'border-orange-300', dot: 'bg-orange-500' },
  'Equipment': { bg: 'bg-blue-100', border: 'border-blue-300', dot: 'bg-blue-500' },
  'Process': { bg: 'bg-purple-100', border: 'border-purple-300', dot: 'bg-purple-500' },
  'Environmental': { bg: 'bg-green-100', border: 'border-green-300', dot: 'bg-green-500' },
  'Documentation': { bg: 'bg-indigo-100', border: 'border-indigo-300', dot: 'bg-indigo-500' },
  'Management': { bg: 'bg-red-100', border: 'border-red-300', dot: 'bg-red-500' },
  'Training': { bg: 'bg-amber-100', border: 'border-amber-300', dot: 'bg-amber-500' },
  'default': { bg: 'bg-surface-100', border: 'border-surface-300', dot: 'bg-surface-500' }
}

const getCategoryColors = (category) => {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.default
}

/**
 * FactorList - Left panel showing contributing factors sorted by count
 * Similar layout to HazardList but displays factors instead
 */
const FactorList = ({ factors, selected, onSelect, totalIncidents, analyzedCount, totalNegative }) => {
  const [sortBy, setSortBy] = useState('count')
  const [filterCategory, setFilterCategory] = useState('all')

  // Extract unique categories
  const categories = useMemo(() => {
    if (!factors || factors.length === 0) return []
    const uniqueCats = [...new Set(factors.map(f => f.category).filter(Boolean))]
    return uniqueCats.sort()
  }, [factors])

  // Filter and sort factors
  const displayedFactors = useMemo(() => {
    if (!factors) return []

    let filtered = [...factors]

    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(f => f.category === filterCategory)
    }

    // Sort
    if (sortBy === 'count') {
      filtered.sort((a, b) => b.count - a.count)
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === 'category') {
      filtered.sort((a, b) => {
        const catCompare = (a.category || '').localeCompare(b.category || '')
        if (catCompare !== 0) return catCompare
        return b.count - a.count
      })
    }

    return filtered
  }, [factors, sortBy, filterCategory])

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
      {/* Header with filters */}
      <div className="flex flex-col gap-2 mb-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <p className="text-xs text-surface-500">Select to explore</p>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs text-surface-600 bg-white border border-surface-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-300"
          >
            <option value="count">By Count</option>
            <option value="name">By Name</option>
            <option value="category">By Category</option>
          </select>
        </div>

        {/* Category filter */}
        {categories.length > 1 && (
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs text-surface-600 bg-white border border-surface-200 rounded px-2 py-1 w-full focus:outline-none focus:ring-1 focus:ring-primary-300"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        )}
      </div>

      {/* Factor list - scrollable */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1">
        {displayedFactors.map((factor) => {
          const isSelected = selected?.name === factor.name
          const colors = getCategoryColors(factor.category)
          const percentage = totalIncidents > 0
            ? ((factor.count / totalIncidents) * 100).toFixed(1)
            : 0

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
            >
              {/* Category indicator */}
              <span className={`flex-shrink-0 w-2 h-8 rounded-full ${colors.dot}`} />

              {/* Name and category */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm truncate ${isSelected ? 'text-primary-800 font-semibold' : 'text-surface-800 font-medium'}`}>
                  {factor.name}
                </p>
                <p className="text-xs text-surface-400 truncate">
                  {factor.category || 'Uncategorized'}
                </p>
              </div>

              {/* Count and percentage */}
              <div className="flex flex-col items-end gap-0.5">
                <span className={`text-sm font-bold ${isSelected ? 'text-primary-700' : 'text-surface-700'}`}>
                  {factor.count}
                </span>
                <span className="text-xs text-surface-400">
                  {percentage}%
                </span>
              </div>

              {/* Arrow */}
              <ChevronRight
                size={16}
                className={`flex-shrink-0 transition-transform ${isSelected ? 'text-primary-600' : 'text-surface-400 group-hover:text-surface-600 group-hover:translate-x-0.5'}`}
              />
            </button>
          )
        })}
      </div>

      {/* Footer with count and coverage */}
      <div className="flex-shrink-0 pt-2 border-t border-surface-200 mt-2 space-y-1">
        <p className="text-xs text-surface-500 text-center">
          {displayedFactors.length} of {factors.length} factors
        </p>
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
