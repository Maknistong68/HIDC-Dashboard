import React, { useMemo } from 'react'
import { CheckCircle2, AlertTriangle } from 'lucide-react'
import {
  SIGNAL_LABELS,
  SIGNAL_KEYS,
  DEFAULT_THRESHOLDS,
  getSignalDotColor,
  getSignalTextColor
} from '../../utils/signalConstants'

/**
 * CompactPriorityStrip - Horizontal pill strip showing signals exceeding thresholds
 * Compact replacement for SignalPriorityList in the dominant-radar layout.
 */
const CompactPriorityStrip = ({ signals, thresholds = DEFAULT_THRESHOLDS, onSignalClick }) => {
  const exceedingSignals = useMemo(() => {
    if (!signals) return []
    return SIGNAL_KEYS
      .map((key) => ({ key, signal: signals[key] }))
      .filter(({ key, signal }) => signal?.score > (thresholds[key] ?? 60))
      .sort((a, b) => b.signal.score - a.signal.score)
  }, [signals, thresholds])

  if (exceedingSignals.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
        <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
        <span className="text-xs text-emerald-700 font-medium">
          All signals within thresholds
        </span>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <AlertTriangle size={12} className="text-amber-500" />
        <span className="text-xs font-semibold text-surface-700">
          Exceeding Thresholds ({exceedingSignals.length})
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {exceedingSignals.map(({ key, signal }) => (
          <button
            key={key}
            onClick={() => onSignalClick?.(key)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-surface-200
                       rounded-lg hover:border-surface-300 hover:shadow-sm transition-all duration-150
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
            aria-label={`${SIGNAL_LABELS[key]}: ${signal.score}/100`}
          >
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getSignalDotColor(signal.score)}`} />
            <span className="text-xs text-surface-700 font-medium">{SIGNAL_LABELS[key]}</span>
            <span className={`text-xs font-bold ${getSignalTextColor(signal.score)}`}>
              {signal.score}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default React.memo(CompactPriorityStrip)
