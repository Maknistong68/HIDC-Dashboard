import React from 'react'

/**
 * TimePeriodToggle - Compact toggle buttons for time periods
 *
 * @param {number} period - Current selected period in months (0.25 = 1 week)
 * @param {function} onPeriodChange - Callback when period changes
 * @param {array} periods - Optional custom periods array [{value, label}]
 */
const TimePeriodToggle = ({ period, onPeriodChange, periods: customPeriods, showAll = false }) => {
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
    <div className="inline-flex rounded border border-surface-200 bg-surface-50">
      {periods.map((p) => (
        <button
          key={p.value}
          onClick={() => onPeriodChange(p.value)}
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
  )
}

export default TimePeriodToggle
