import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Filter, X, ChevronDown, ChevronUp, Check, Search } from 'lucide-react'
import useIsMobile, { MOBILE_BREAKPOINT } from '../../hooks/useIsMobile'

/**
 * MultiSelectDropdown - Dropdown with checkboxes for multi-selection (inclusion mode)
 * Uses optimistic local state so checkbox toggles are instant, with debounced onChange to FilterContext.
 */
const MultiSelectDropdown = ({ filter, value = [], onChange, isMobile }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef(null)
  const searchRef = useRef(null)

  // Optimistic local state — drives all visual rendering
  const [localValue, setLocalValue] = useState(value)
  const debounceRef = useRef(null)
  const lastEmittedRef = useRef(value)

  // Sync localValue when value prop changes externally (Clear All, cascade resets)
  useEffect(() => {
    // Compare by reference first (fast path), then by content
    if (lastEmittedRef.current !== value) {
      setLocalValue(value)
    }
    lastEmittedRef.current = value
  }, [value])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => clearTimeout(debounceRef.current)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus()
    }
  }, [isOpen])

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return filter.options
    const term = searchTerm.toLowerCase()
    return filter.options.filter(o => o.label.toLowerCase().includes(term))
  }, [filter.options, searchTerm])

  // Instant local toggle + debounced context update
  const toggleOption = useCallback((optionValue) => {
    setLocalValue(prev => {
      const next = prev.includes(optionValue)
        ? prev.filter(v => v !== optionValue)
        : [...prev, optionValue]
      clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        lastEmittedRef.current = next
        onChange(filter.key, next)
      }, 60)
      return next
    })
  }, [onChange, filter.key])

  // Clear: instant local + immediate context update (no debounce)
  const clearSelection = useCallback((e) => {
    e.stopPropagation()
    clearTimeout(debounceRef.current)
    const next = []
    setLocalValue(next)
    lastEmittedRef.current = next
    onChange(filter.key, next)
  }, [onChange, filter.key])

  // Select All: instant local + debounced context update
  const selectAll = useCallback(() => {
    const next = filteredOptions.map(o => o.value)
    setLocalValue(next)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      lastEmittedRef.current = next
      onChange(filter.key, next)
    }, 150)
  }, [onChange, filter.key, filteredOptions])

  // Intersect localValue with available options to ignore stale selections
  const validValue = useMemo(() => {
    if (localValue.length === 0 || filter.options.length === 0) return localValue
    const optionSet = new Set(filter.options.map(o => o.value))
    const filtered = localValue.filter(v => optionSet.has(v))
    return filtered.length === localValue.length ? localValue : filtered
  }, [localValue, filter.options])

  const hasSelection = validValue.length > 0

  // Display text logic
  const displayText = useMemo(() => {
    if (!hasSelection) return filter.placeholder || `All ${filter.label}`
    if (validValue.length <= 2) {
      const labels = validValue.map(v => {
        const opt = filter.options.find(o => o.value === v)
        return opt ? opt.label : v
      })
      return labels.join(', ')
    }
    return `${validValue.length} selected`
  }, [hasSelection, validValue, filter.options, filter.placeholder, filter.label])

  return (
    <div ref={dropdownRef} className="relative">
      {isMobile && (
        <label className="block text-xs font-medium text-surface-500 mb-1">
          {filter.label}
        </label>
      )}
      <button
        type="button"
        onClick={() => { setIsOpen(!isOpen); if (isOpen) setSearchTerm('') }}
        className={`
          flex items-center justify-between gap-2
          appearance-none font-medium
          bg-white border rounded-md cursor-pointer
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500
          ${isMobile ? 'w-full px-3 py-3 text-base h-12' : 'px-3 py-1.5 text-xs min-w-[160px]'}
          ${hasSelection
            ? 'border-primary-300 bg-primary-50 text-primary-700'
            : 'border-surface-300 text-surface-700 hover:border-surface-400'
          }
        `}
        aria-label={filter.label}
        aria-expanded={isOpen}
      >
        <span className="truncate">
          {displayText}
        </span>
        <div className="flex items-center gap-1">
          {hasSelection && (
            <X
              size={14}
              className="text-primary-500 hover:text-primary-700"
              onClick={clearSelection}
            />
          )}
          <ChevronDown
            size={isMobile ? 18 : 14}
            className={`text-surface-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {isOpen && (
        <div className={`
          absolute z-50 mt-1 bg-white border border-surface-200 rounded-lg shadow-lg
          ${isMobile ? 'left-0 right-0' : 'min-w-[220px]'}
        `}>
          {/* Search input */}
          <div className="p-2 border-b border-surface-100">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={`Search ${filter.label.toLowerCase()}...`}
                  aria-label={`Search ${filter.label.toLowerCase()}`}
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-surface-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

          {/* Select All / Deselect All */}
          <div className="flex items-center gap-1 px-3 py-1.5 border-b border-surface-100">
            <button
              type="button"
              onClick={selectAll}
              className="text-xs text-primary-600 hover:text-primary-800 font-medium"
            >
              Select All
            </button>
            <span className="text-surface-300">|</span>
            <button
              type="button"
              onClick={clearSelection}
              className="text-xs text-surface-500 hover:text-surface-700 font-medium"
            >
              Deselect All
            </button>
            {hasSelection && (
              <span className="ml-auto text-2xs text-surface-400">{validValue.length} selected</span>
            )}
          </div>

          {/* Options list */}
          <div className="max-h-52 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-surface-400">No matches</div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = validValue.includes(option.value)
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleOption(option.value)}
                    className={`
                      w-full px-3 py-2 text-left text-sm flex items-center gap-2
                      hover:bg-surface-50 transition-colors
                      ${isSelected ? 'bg-primary-50' : ''}
                    `}
                  >
                    <div className={`
                      w-4 h-4 rounded border flex items-center justify-center flex-shrink-0
                      ${isSelected
                        ? 'bg-primary-500 border-primary-500'
                        : 'border-surface-300'
                      }
                    `}>
                      {isSelected && <Check size={12} className="text-white" />}
                    </div>
                    <span className="truncate">{option.label}</span>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * FilterBar - Consistent filter controls with animations
 * Mobile-optimized: Collapsible on mobile, larger touch targets
 */
const FilterBarComponent = ({
  filters,
  activeFilters,
  onFilterChange,
  onClearFilters,
  className = '',
}) => {
  const isMobile = useIsMobile(MOBILE_BREAKPOINT)
  const [isExpanded, setIsExpanded] = useState(false)
  const hasActiveFilters = Object.values(activeFilters).some(
    (v) => v !== '' && v !== null && v !== undefined && (!Array.isArray(v) || v.length > 0)
  )

  const activeCount = Object.values(activeFilters).filter(
    (v) => v !== '' && v !== null && v !== undefined && (!Array.isArray(v) || v.length > 0)
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
              {filter.type === 'multiSelect' ? (
                <MultiSelectDropdown
                  filter={filter}
                  value={activeFilters[filter.key] || []}
                  onChange={onFilterChange}
                  isMobile={isMobile}
                />
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

// Memoize to prevent re-renders on every filter change
const FilterBar = React.memo(FilterBarComponent)

export default FilterBar
