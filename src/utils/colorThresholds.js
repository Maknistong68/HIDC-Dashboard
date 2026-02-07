/**
 * Centralized color and threshold utilities for Safety Outlook
 * Single source of truth for risk colors, score thresholds, and badges.
 */

// --- Score Thresholds ---
export const SCORE_THRESHOLDS = {
  HIGH: 60,
  MEDIUM: 30,
  LOW: 0,
}

// --- Risk Level Colors ---
export const RISK_COLORS = {
  low:      { bg: 'bg-green-500',   text: 'text-green-600',   badge: 'bg-green-100 text-green-700',   hex: '#22c55e' },
  medium:   { bg: 'bg-amber-500',   text: 'text-amber-600',   badge: 'bg-amber-100 text-amber-700',   hex: '#f59e0b' },
  high:     { bg: 'bg-orange-500',  text: 'text-orange-600',  badge: 'bg-orange-100 text-orange-700',  hex: '#f97316' },
  critical: { bg: 'bg-red-500',     text: 'text-red-600',     badge: 'bg-red-100 text-red-700',       hex: '#ef4444' },
  default:  { bg: 'bg-surface-400', text: 'text-surface-600', badge: 'bg-surface-100 text-surface-600', hex: '#94a3b8' },
}

/**
 * Get color set for a risk level string (low/medium/high/critical)
 */
export const getRiskColors = (level) => {
  return RISK_COLORS[level] || RISK_COLORS.default
}

/**
 * Get color set for a numeric score (0-100 where higher = riskier)
 */
export const getScoreColors = (score) => {
  if (score > SCORE_THRESHOLDS.HIGH) return RISK_COLORS.critical
  if (score > SCORE_THRESHOLDS.MEDIUM) return RISK_COLORS.medium
  return RISK_COLORS.low
}

/**
 * Get signal bar color class for a score (0-100)
 */
export const getSignalBarColor = (score) => {
  if (score > 60) return 'bg-red-500'
  if (score > 30) return 'bg-amber-500'
  return 'bg-emerald-500'
}

/**
 * Get score text color class for a score (0-100)
 */
export const getScoreTextColor = (score) => {
  if (score > 60) return 'text-red-600'
  if (score > 30) return 'text-amber-600'
  return 'text-emerald-600'
}

// --- Detection Rate Colors ---
export const getDetectionRateColor = (rate) => {
  if (rate > 50) return 'text-green-600'
  if (rate > 20) return 'text-amber-600'
  return 'text-red-500'
}

// --- Risk Comparison Colors (inverted: higher score = better) ---
export const getComparisonColor = (score) => {
  if (score >= 70) return '#22c55e' // green
  if (score >= 50) return '#f59e0b' // amber
  return '#ef4444' // red
}

// --- Badge Utilities ---
export const getBadgeClass = (level) => {
  switch (level) {
    case 'good': return 'bg-green-100 text-green-700'
    case 'warning': return 'bg-amber-100 text-amber-700'
    case 'critical': return 'bg-red-100 text-red-700'
    default: return 'bg-surface-100 text-surface-600'
  }
}

// --- Anomaly Severity Colors ---
export const ANOMALY_COLORS = {
  spike: { bg: 'bg-red-50', border: 'border-red-100', icon: 'text-red-500', badge: 'bg-red-100 text-red-700' },
  drop:  { bg: 'bg-blue-50', border: 'border-blue-100', icon: 'text-blue-500', badge: 'bg-blue-100 text-blue-700' },
}
