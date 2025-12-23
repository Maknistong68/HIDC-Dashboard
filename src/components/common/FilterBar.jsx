import React from 'react'
import { Filter, X } from 'lucide-react'

const FilterBar = ({ filters, activeFilters, onFilterChange, onClearFilters }) => {
  const hasActiveFilters = Object.values(activeFilters).some(
    (v) => v !== '' && v !== null && v !== undefined
  )

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 bg-gray-50 rounded-sm border border-gray-300">
      <div className="flex items-center gap-1 text-gray-600">
        <Filter size={16} />
        <span className="text-xs font-semibold uppercase tracking-wide">Filters:</span>
      </div>

      {filters.map((filter) => (
        <div key={filter.key} className="flex-shrink-0">
          {filter.type === 'select' ? (
            <select
              value={activeFilters[filter.key] || ''}
              onChange={(e) => onFilterChange(filter.key, e.target.value)}
              className="px-2 py-1 text-xs border border-gray-300 rounded-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
            >
              <option value="">{filter.placeholder || `All ${filter.label}`}</option>
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : filter.type === 'date' ? (
            <input
              type="date"
              value={activeFilters[filter.key] || ''}
              onChange={(e) => onFilterChange(filter.key, e.target.value)}
              className="px-2 py-1 text-xs border border-gray-300 rounded-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder={filter.placeholder}
            />
          ) : null}
        </div>
      ))}

      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:bg-red-100 rounded-sm transition-colors"
        >
          <X size={14} />
          Clear
        </button>
      )}
    </div>
  )
}

export default FilterBar
