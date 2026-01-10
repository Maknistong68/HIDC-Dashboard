import React, { useState } from 'react'
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react'
import useIsMobile from '../../hooks/useIsMobile'

/**
 * FilterBar - Consistent filter controls with animations
 * Mobile-optimized: Collapsible on mobile, larger touch targets
 */
const FilterBar = ({
  filters,
  activeFilters,
  onFilterChange,
  onClearFilters,
  className = '',
}) => {
  const isMobile = useIsMobile(640)
  const [isExpanded, setIsExpanded] = useState(false)

  const hasActiveFilters = Object.values(activeFilters).some(
    (v) => v !== '' && v !== null && v !== undefined
  )

  const activeCount = Object.values(activeFilters).filter(
    (v) => v !== '' && v !== null && v !== undefined
  ).length

  // On mobile, show collapsed by default unless there are active filters
  const showFilters = isMobile ? (isExpanded || hasActiveFilters) : true

  return (
    <div
      className={`
        bg-surface-50 rounded-lg border border-surface-200
        transition-all duration-200
        ${className}
      `}
      role="search"
      aria-label="Filter controls"
    >
      {/* Header - Always visible */}
      <div
        className={`
          flex items-center justify-between gap-2 p-2.5
          ${isMobile && !isExpanded && !hasActiveFilters ? 'cursor-pointer' : ''}
        `}
        onClick={() => isMobile && setIsExpanded(!isExpanded)}
        role={isMobile ? 'button' : undefined}
        aria-expanded={isMobile ? isExpanded : undefined}
      >
        <div className="flex items-center gap-1.5 text-surface-600">
          <Filter size={16} aria-hidden="true" />
          <span className="text-xs font-semibold uppercase tracking-wide">Filters</span>
          {activeCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-2xs font-semibold bg-primary-100 text-primary-700 rounded-full">
              {activeCount}
            </span>
          )}
        </div>

        {/* Mobile toggle + Clear button */}
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onClearFilters()
              }}
              className={`
                flex items-center gap-1.5 px-2.5 py-1.5
                text-xs font-medium text-safety-critical
                bg-safety-critical-light rounded-md
                transition-all duration-200
                hover:bg-red-100 active:scale-95
                ${isMobile ? 'h-9' : ''}
              `}
              aria-label="Clear all filters"
            >
              <X size={14} aria-hidden="true" />
              <span>Clear</span>
            </button>
          )}

          {isMobile && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(!isExpanded)
              }}
              className="w-9 h-9 flex items-center justify-center rounded-md bg-white border border-surface-200 hover:bg-surface-100 active:bg-surface-200 transition-colors"
              aria-label={isExpanded ? 'Collapse filters' : 'Expand filters'}
            >
              {isExpanded ? (
                <ChevronUp size={18} className="text-surface-600" />
              ) : (
                <ChevronDown size={18} className="text-surface-600" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Filter inputs - Collapsible on mobile */}
      {showFilters && (
        <div
          data-filters
          className={`
            flex gap-2 border-t border-surface-200
            ${isMobile ? 'flex-col p-3' : 'flex-wrap items-center px-2.5 pb-2.5'}
          `}
        >
          {filters.map((filter) => (
            <div key={filter.key} className={`relative ${isMobile ? 'w-full' : 'flex-shrink-0'}`}>
              {filter.type === 'select' ? (
                <div className="relative">
                  {isMobile && (
                    <label className="block text-xs font-medium text-surface-500 mb-1">
                      {filter.label}
                    </label>
                  )}
                  <select
                    value={activeFilters[filter.key] || ''}
                    onChange={(e) => onFilterChange(filter.key, e.target.value)}
                    className={`
                      appearance-none pr-8 font-medium
                      bg-white border rounded-md cursor-pointer
                      transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500
                      ${isMobile ? 'w-full pl-3 py-3 text-base h-12' : 'pl-3 py-1.5 text-xs'}
                      ${activeFilters[filter.key]
                        ? 'border-primary-300 bg-primary-50 text-primary-700'
                        : 'border-surface-300 text-surface-700 hover:border-surface-400'
                      }
                    `}
                    aria-label={filter.label}
                  >
                    <option value="">{filter.placeholder || `All ${filter.label}`}</option>
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={isMobile ? 18 : 14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none"
                    style={isMobile ? { top: 'calc(50% + 10px)' } : undefined}
                    aria-hidden="true"
                  />
                </div>
              ) : filter.type === 'date' ? (
                <div>
                  {isMobile && (
                    <label className="block text-xs font-medium text-surface-500 mb-1">
                      {filter.label}
                    </label>
                  )}
                  <input
                    type="date"
                    value={activeFilters[filter.key] || ''}
                    onChange={(e) => onFilterChange(filter.key, e.target.value)}
                    className={`
                      font-medium bg-white border rounded-md
                      transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500
                      ${isMobile ? 'w-full px-3 py-3 text-base h-12' : 'px-3 py-1.5 text-xs'}
                      ${activeFilters[filter.key]
                        ? 'border-primary-300 bg-primary-50 text-primary-700'
                        : 'border-surface-300 text-surface-700 hover:border-surface-400'
                      }
                    `}
                    aria-label={filter.label}
                  />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FilterBar
