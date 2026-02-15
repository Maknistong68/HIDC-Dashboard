import React, { useTransition } from 'react'
import { useFilterState, useFilterActions } from '../../context/FilterContext'

/**
 * TimePeriodToggle - Compact toggle buttons for time periods + Work-Related Only toggle
 *
 * @param {number} period - Current selected period in months (0.25 = 1 week)
 * @param {function} onPeriodChange - Callback when period changes
 * @param {array} periods - Optional custom periods array [{value, label}]
 */
const TimePeriodToggle = ({ period, onPeriodChange, periods: customPeriods, showAll = false, hideWorkRelated = false }) => {
  const { workRelatedOnly } = useFilterState()
  const { setWorkRelatedOnly } = useFilterActions()
  const [, startTransition] = useTransition()

  const defaultPeriods = [
    ...(showAll ? [{ value: null, label: 'All' }] : []),
    { value: 0.25, label: '1W' },
    { value: 1, label: '1M' },
    { value: 3, label: '3M' },
    { value: 6, label: '6M' },
    { value: 12, label: '1Y' }
  ]

  const periods = customPeriods || defaultPeriods

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

      {/* Period buttons */}
      <div className="inline-flex rounded border border-surface-200 bg-surface-50">
        {periods.map((p) => (
          <button
            key={p.value}
            onClick={() => startTransition(() => onPeriodChange(p.value))}
            className={`
              px-2.5 py-1 text-xs font-medium transition-all duration-150
              ${period === p.value
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-surface-500 hover:text-surface-700'
              }
            `}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default TimePeriodToggle
