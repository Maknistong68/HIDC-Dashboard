import React from 'react'
import { Filter, X, ChevronDown } from 'lucide-react'

/**
 * FilterBar - Consistent filter controls with animations
 */
const FilterBar = ({
  filters,
  activeFilters,
  onFilterChange,
  onClearFilters,
  className = '',
}) => {
  const hasActiveFilters = Object.values(activeFilters).some(
    (v) => v !== '' && v !== null && v !== undefined
  )

  const activeCount = Object.values(activeFilters).filter(
    (v) => v !== '' && v !== null && v !== undefined
  ).length

  return (
    <div
      className={`
        flex flex-wrap items-center gap-2 p-2.5
        bg-surface-50 rounded-lg border border-surface-200
        transition-all duration-200
        ${className}
      `}
      role="search"
      aria-label="Filter controls"
    >
      {/* Filter label */}
      <div className="flex items-center gap-1.5 text-surface-600">
        <Filter size={16} aria-hidden="true" />
        <span className="text-xs font-semibold uppercase tracking-wide">Filters</span>
        {activeCount > 0 && (
          <span className="ml-1 px-1.5 py-0.5 text-2xs font-semibold bg-primary-100 text-primary-700 rounded-full">
            {activeCount}
          </span>
        )}
      </div>

      {/* Filter inputs */}
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((filter) => (
          <div key={filter.key} className="relative flex-shrink-0">
            {filter.type === 'select' ? (
              <div className="relative">
                <select
                  value={activeFilters[filter.key] || ''}
                  onChange={(e) => onFilterChange(filter.key, e.target.value)}
                  className={`
                    appearance-none pl-3 pr-8 py-1.5 text-xs font-medium
                    bg-white border rounded-md cursor-pointer
                    transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500
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
                  size={14}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none"
                  aria-hidden="true"
                />
              </div>
            ) : filter.type === 'date' ? (
              <input
                type="date"
                value={activeFilters[filter.key] || ''}
                onChange={(e) => onFilterChange(filter.key, e.target.value)}
                className={`
                  px-3 py-1.5 text-xs font-medium
                  bg-white border rounded-md
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500
                  ${activeFilters[filter.key]
                    ? 'border-primary-300 bg-primary-50 text-primary-700'
                    : 'border-surface-300 text-surface-700 hover:border-surface-400'
                  }
                `}
                aria-label={filter.label}
              />
            ) : null}
          </div>
        ))}
      </div>

      {/* Clear button */}
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className={`
            flex items-center gap-1.5 px-2.5 py-1.5
            text-xs font-medium text-safety-critical
            bg-safety-critical-light rounded-md
            transition-all duration-200
            hover:bg-red-100 active:scale-95
          `}
          aria-label="Clear all filters"
        >
          <X size={14} aria-hidden="true" />
          <span>Clear</span>
        </button>
      )}
    </div>
  )
}

export default FilterBar
