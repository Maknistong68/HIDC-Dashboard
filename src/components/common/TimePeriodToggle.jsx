import { useState, useRef, useEffect, useCallback, useTransition, memo } from 'react'
import { Calendar, X } from 'lucide-react'
import { useFilterState, useFilterActions } from '../../context/FilterContext'
import { formatDateRangeDisplay } from '../../utils/dateUtils'

/**
 * TimePeriodToggle - Compact toggle buttons for time periods + Work-Related Only toggle
 *
 * When showAll is true (page-level usage), a Calendar icon is appended after 1Y
 * that opens a date range picker popover. Custom range and period buttons are
 * mutually exclusive.
 *
 * @param {number} period - Current selected period in months (0.25 = 1 week)
 * @param {function} onPeriodChange - Callback when period changes
 * @param {array} periods - Optional custom periods array [{value, label}]
 */
const TimePeriodToggle = ({ period, onPeriodChange, periods: customPeriods, showAll = false, hideWorkRelated = false }) => {
  const { workRelatedOnly, customDateRange } = useFilterState()
  const { setWorkRelatedOnly, setCustomDateRange } = useFilterActions()
  const [, startTransition] = useTransition()

  // Date picker popover state
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [tempStartDate, setTempStartDate] = useState('')
  const [tempEndDate, setTempEndDate] = useState('')
  const [error, setError] = useState('')
  const popoverRef = useRef(null)
  const calendarBtnRef = useRef(null)

  // Only show calendar on page-level usage (showAll=true, no custom periods)
  const showCalendar = showAll && !customPeriods
  const hasCustomRange = showCalendar && customDateRange !== null

  const defaultPeriods = [
    ...(showAll ? [{ value: null, label: 'All' }] : []),
    { value: 0.25, label: '1W' },
    { value: 1, label: '1M' },
    { value: 3, label: '3M' },
    { value: 6, label: '6M' },
    { value: 12, label: '1Y' }
  ]

  const periods = customPeriods || defaultPeriods

  // Click-outside to close popover
  useEffect(() => {
    if (!showDatePicker) return
    const handleMouseDown = (e) => {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target) &&
        calendarBtnRef.current && !calendarBtnRef.current.contains(e.target)
      ) {
        setShowDatePicker(false)
        setError('')
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [showDatePicker])

  // Open popover — pre-fill with current custom range if active
  const handleCalendarClick = useCallback(() => {
    if (showDatePicker) {
      setShowDatePicker(false)
      setError('')
      return
    }
    if (customDateRange) {
      setTempStartDate(customDateRange.start)
      setTempEndDate(customDateRange.end)
    } else {
      setTempStartDate('')
      setTempEndDate('')
    }
    setError('')
    setShowDatePicker(true)
  }, [showDatePicker, customDateRange])

  // Apply custom range
  const handleApply = useCallback(() => {
    if (!tempStartDate || !tempEndDate) return
    if (tempStartDate > tempEndDate) {
      setError('Start date must be before end date')
      return
    }
    startTransition(() => {
      setCustomDateRange({ start: tempStartDate, end: tempEndDate })
    })
    setShowDatePicker(false)
    setError('')
  }, [tempStartDate, tempEndDate, setCustomDateRange, startTransition])

  // Clear custom range via X button
  const handleClearCustomRange = useCallback((e) => {
    e.stopPropagation()
    startTransition(() => {
      setCustomDateRange(null)
    })
  }, [setCustomDateRange, startTransition])

  // Cancel popover
  const handleCancel = useCallback(() => {
    setShowDatePicker(false)
    setTempStartDate('')
    setTempEndDate('')
    setError('')
  }, [])

  // Handle Enter key in date inputs
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') handleApply()
    if (e.key === 'Escape') handleCancel()
  }, [handleApply, handleCancel])

  return (
    <div className="flex items-center gap-2">
      {/* Work-Related Only toggle */}
      {!hideWorkRelated && (
      <label className="flex items-center gap-1.5 cursor-pointer select-none">
        <span className={`text-[11px] font-medium whitespace-nowrap transition-colors ${workRelatedOnly ? 'text-sky-600' : 'text-surface-400'}`}>
          Work-Related
        </span>
        <button
          role="switch"
          aria-checked={workRelatedOnly}
          aria-label="Work-Related Only"
          onClick={() => startTransition(() => setWorkRelatedOnly(!workRelatedOnly))}
          className={`
            relative inline-flex h-[18px] w-8 items-center rounded-full
            transition-colors duration-200 ease-in-out
            focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2
            ${workRelatedOnly ? 'bg-sky-500' : 'bg-surface-300'}
          `}
        >
          <span
            className={`
              inline-block h-3 w-3 rounded-full bg-white shadow-sm
              transition-transform duration-200 ease-in-out
              ${workRelatedOnly ? 'translate-x-[16px]' : 'translate-x-[3px]'}
            `}
          />
        </button>
      </label>
      )}

      {/* Period buttons + Calendar */}
      <div className="relative inline-flex items-center rounded border border-surface-200 bg-surface-50">
        {periods.map((p) => (
          <button
            key={p.value}
            onClick={() => startTransition(() => onPeriodChange(p.value))}
            className={`
              px-2.5 py-1 text-xs font-medium transition-all duration-150
              ${period === p.value && !hasCustomRange
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-surface-500 hover:text-surface-700'
              }
            `}
          >
            {p.label}
          </button>
        ))}

        {/* Calendar icon button */}
        {showCalendar && (
          <>
            <div className="w-px h-4 bg-surface-200" />
            <button
              ref={calendarBtnRef}
              onClick={handleCalendarClick}
              aria-label={hasCustomRange ? `Custom range: ${formatDateRangeDisplay(customDateRange)}` : 'Custom date range'}
              title={hasCustomRange ? formatDateRangeDisplay(customDateRange) : 'Custom date range'}
              className={`
                relative flex items-center gap-0.5 px-2 py-1 text-xs font-medium transition-all duration-150
                ${hasCustomRange
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-surface-500 hover:text-surface-700'
                }
              `}
            >
              <Calendar size={14} />
              {hasCustomRange && (
                <span
                  onClick={handleClearCustomRange}
                  className="ml-0.5 rounded-full hover:bg-primary-200 p-0.5 transition-colors"
                  aria-label="Clear custom date range"
                >
                  <X size={10} />
                </span>
              )}
            </button>
          </>
        )}

        {/* Date picker popover */}
        {showDatePicker && (
          <div
            ref={popoverRef}
            className="absolute top-full right-0 mt-1.5 z-50 bg-white rounded-lg border border-surface-200 shadow-lg p-3 animate-fade-in-down"
            style={{ minWidth: '260px' }}
          >
            <div className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-medium text-surface-500 mb-1">From</label>
                <input
                  type="date"
                  value={tempStartDate}
                  onChange={(e) => { setTempStartDate(e.target.value); setError('') }}
                  onKeyDown={handleKeyDown}
                  className="w-full px-2.5 py-1.5 text-xs border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-surface-500 mb-1">To</label>
                <input
                  type="date"
                  value={tempEndDate}
                  min={tempStartDate || undefined}
                  onChange={(e) => { setTempEndDate(e.target.value); setError('') }}
                  onKeyDown={handleKeyDown}
                  className="w-full px-2.5 py-1.5 text-xs border border-surface-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                />
              </div>
              {error && (
                <p className="text-[11px] text-red-500">{error}</p>
              )}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={handleCancel}
                  className="px-3 py-1 text-xs text-surface-500 hover:text-surface-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  disabled={!tempStartDate || !tempEndDate}
                  className="px-3 py-1 text-xs font-medium bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(TimePeriodToggle)
