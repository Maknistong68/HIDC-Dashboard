import React, { useMemo } from 'react'
import { CheckCircle2, AlertTriangle, ChevronRight } from 'lucide-react'
import {
  SIGNAL_LABELS,
  SIGNAL_META,
  SIGNAL_KEYS,
  DEFAULT_THRESHOLDS,
  getSignalDotColor,
  getSignalTextColor
} from '../../utils/signalConstants'

/**
 * SignalPriorityList - Condensed list showing top signals exceeding their individual threshold
 *
 * Features:
 * - Shows top 2-3 highest signals above their respective thresholds
 * - Each item: color dot + label + score + one-line interpretation
 * - Click to expand detail card
 * - "All signals OK" message when none exceed threshold
 * - Supports individual thresholds per signal (thresholds object)
 */
const SignalPriorityList = ({ signals, thresholds = DEFAULT_THRESHOLDS, onSignalClick, maxItems = 3 }) => {
  // Get signals exceeding their individual threshold, sorted by score descending
  const prioritySignals = useMemo(() => {
    if (!signals) return []
    return SIGNAL_KEYS
      .map((key) => [key, signals[key]])
      .filter(([key, sig]) => sig?.score > (thresholds[key] ?? 60))
      .sort((a, b) => b[1].score - a[1].score)
      .slice(0, maxItems)
  }, [signals, thresholds, maxItems])

  // Count total exceeding their individual threshold
  const totalExceeding = useMemo(() => {
    if (!signals) return 0
    return SIGNAL_KEYS.filter((key) => {
      const sig = signals[key]
      return sig?.score > (thresholds[key] ?? 60)
    }).length
  }, [signals, thresholds])

  // Empty state - all signals OK
  if (prioritySignals.length === 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={20} className="text-emerald-600" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-emerald-800">All Signals OK</h4>
            <p className="text-xs text-emerald-600 mt-0.5">
              No signals exceed their thresholds. Continue monitoring.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle size={14} className="text-amber-500" />
        <h4 className="text-xs font-semibold text-surface-700">
          Priority Signals ({totalExceeding})
        </h4>
      </div>

      {/* Signal items */}
      {prioritySignals.map(([key, sig]) => {
        const label = SIGNAL_LABELS[key] || key
        const meta = SIGNAL_META[key]
        const interpretation = meta?.interpret?.(sig.score) || ''

        return (
          <button
            key={key}
            onClick={() => onSignalClick?.(key)}
            className="w-full text-left bg-white border border-surface-200 rounded-lg p-3
                       hover:border-surface-300 hover:shadow-sm transition-all duration-150
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1
                       group"
            aria-label={`${label}: ${sig.score} out of 100. ${interpretation}`}
          >
            <div className="flex items-start gap-3">
              {/* Color indicator dot */}
              <div
                className={`w-3 h-3 rounded-full flex-shrink-0 mt-0.5 ${getSignalDotColor(sig.score)}`}
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Label and score */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-surface-800 truncate">{label}</span>
                  <span className={`text-sm font-bold ${getSignalTextColor(sig.score)}`}>
                    {sig.score}/100
                  </span>
                </div>

                {/* Interpretation */}
                <p className="text-xs text-surface-500 mt-0.5 line-clamp-1">{interpretation}</p>

                {/* Inverted badge for culture signals */}
                {meta?.inverted && (
                  <span className="inline-flex items-center gap-1 mt-1 text-2xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                    <span className="text-blue-400">↕</span>
                    {meta.invertedNote}
                  </span>
                )}
              </div>

              {/* Chevron */}
              <ChevronRight
                size={16}
                className="text-surface-400 flex-shrink-0 group-hover:text-surface-600 transition-colors"
              />
            </div>
          </button>
        )
      })}

      {/* Show more indicator */}
      {totalExceeding > maxItems && (
        <p className="text-2xs text-surface-400 text-center pt-1">
          +{totalExceeding - maxItems} more signal{totalExceeding - maxItems > 1 ? 's' : ''} above
          threshold
        </p>
      )}
    </div>
  )
}

export default React.memo(SignalPriorityList)
