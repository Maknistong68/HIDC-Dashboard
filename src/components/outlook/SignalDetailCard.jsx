import React, { useEffect, useRef } from 'react'
import { X, TrendingUp, Info, AlertTriangle, Lightbulb, HelpCircle } from 'lucide-react'
import {
  SIGNAL_LABELS,
  SIGNAL_META,
  SIGNAL_ACTIONS,
  INVERTED_EXPLANATIONS,
  getTrendArrow,
  getSignalDotColor,
  getSignalTextColor,
  getSignalBorderColor,
  getSignalBgColor
} from '../../utils/signalConstants'

/**
 * SignalDetailCard - Expanded detail overlay for a single signal
 *
 * Features:
 * - Shows full signal name, score, interpretation
 * - Detail data (e.g., "12 cur / 5 prev")
 * - Trend arrow and percent change
 * - Spike warning if detected
 * - Recommended action
 * - Inverted signal explanations
 * - Mobile-friendly with slide-up animation
 */
const SignalDetailCard = ({ signalKey, signal, onClose }) => {
  const closeButtonRef = useRef(null)

  // Focus close button on mount for accessibility
  useEffect(() => {
    closeButtonRef.current?.focus()
  }, [])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose?.()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  if (!signalKey || !signal) return null

  const label = SIGNAL_LABELS[signalKey] || signalKey
  const meta = SIGNAL_META[signalKey]
  const interpretation = meta?.interpret?.(signal.score) || ''
  const action = SIGNAL_ACTIONS[signalKey]
  const trendArrow = signalKey === 'trend' ? getTrendArrow(signal.detail) : null

  // Get inverted explanation if applicable
  const invertedExplanation =
    meta?.inverted && signal.score > 30 && INVERTED_EXPLANATIONS[signalKey]
      ? signal.hasCultureContext === false
        ? INVERTED_EXPLANATIONS[signalKey].smallSample
        : signal.score > 60
          ? INVERTED_EXPLANATIONS[signalKey].high
          : INVERTED_EXPLANATIONS[signalKey].moderate
      : null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40 md:hidden animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Card */}
      <div
        className={`
          fixed md:absolute inset-x-0 bottom-0 md:inset-auto md:top-4 md:left-4 md:right-4
          bg-white rounded-t-xl md:rounded-lg shadow-xl z-50
          border ${getSignalBorderColor(signal.score)}
          animate-slide-up md:animate-fade-in
          max-h-[80vh] md:max-h-none overflow-y-auto
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby="signal-detail-title"
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between gap-3 p-4 border-b ${getSignalBorderColor(signal.score)} ${getSignalBgColor(signal.score)}`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${getSignalDotColor(signal.score)}`} />
            <h3 id="signal-detail-title" className="text-base font-semibold text-surface-800">
              {label}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-lg font-bold ${getSignalTextColor(signal.score)}`}>
              {signal.score}/100
            </span>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-surface-100 hover:bg-surface-200
                         flex items-center justify-center transition-colors
                         focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Close"
            >
              <X size={16} className="text-surface-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Interpretation */}
          <div className="flex items-start gap-3">
            <Info size={16} className="text-surface-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-surface-700">{interpretation}</p>
          </div>

          {/* Detail data */}
          {signal.detail && (
            <div className="bg-surface-50 rounded-lg p-3">
              <p className="text-xs text-surface-500 mb-1">Detail</p>
              <p className="text-sm font-medium text-surface-800">{signal.detail}</p>
            </div>
          )}

          {/* Trend arrow for trend signal */}
          {trendArrow && (
            <div className="flex items-center gap-2 flex-wrap">
              {trendArrow.icon}
              <span className={`text-sm font-medium ${trendArrow.color}`}>{trendArrow.text}</span>
            </div>
          )}

          {/* Spike warning */}
          {signal.spikeDetected && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <TrendingUp size={14} className="text-red-500 flex-shrink-0" />
              <span className="text-xs font-medium text-red-700">
                Recent spike detected — last 30 days significantly higher than 60-day average
              </span>
            </div>
          )}

          {/* Inverted signal explanation */}
          {invertedExplanation && (
            <div
              className={`flex items-start gap-2 rounded-lg px-3 py-2 ${
                signal.hasCultureContext === false
                  ? 'bg-surface-50 border border-surface-200'
                  : 'bg-blue-50 border border-blue-100'
              }`}
            >
              {signal.hasCultureContext === false ? (
                <HelpCircle size={14} className="text-surface-400 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertTriangle size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
              )}
              <p
                className={`text-xs leading-relaxed ${
                  signal.hasCultureContext === false ? 'text-surface-600' : 'text-blue-800'
                }`}
              >
                {invertedExplanation}
              </p>
            </div>
          )}

          {/* Recommended action */}
          {action && (
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Lightbulb size={14} className="text-primary-600" />
                <p className="text-xs font-semibold text-primary-700 uppercase tracking-wide">
                  Recommended Action
                </p>
              </div>
              <p className="text-sm text-primary-800 capitalize">{action}</p>
            </div>
          )}

          {/* How it's calculated tooltip */}
          {meta?.tooltip && (
            <details className="group">
              <summary className="flex items-center gap-2 cursor-pointer text-xs text-surface-500 hover:text-surface-700 transition-colors">
                <Info size={12} />
                <span>How this is calculated</span>
              </summary>
              <p className="mt-2 text-xs text-surface-600 leading-relaxed pl-5">{meta.tooltip}</p>
            </details>
          )}
        </div>
      </div>
    </>
  )
}

export default React.memo(SignalDetailCard)
