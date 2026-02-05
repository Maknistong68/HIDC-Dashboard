/**
 * Shared status color utilities
 * Used across DataTable, DrillDownModal, and other components for consistent status styling
 *
 * DESIGN PRINCIPLES (Non-Bias Data Representation):
 * 1. Status colors should NOT imply moral judgment (good/bad)
 * 2. Colors indicate STATE, not VALUE - "Open" is not "bad", it's "needs action"
 * 3. Palette is colorblind-accessible (avoids pure red/green dichotomy)
 * 4. Labels use neutral action-oriented language
 *
 * COLOR RATIONALE:
 * - Slate: Neutral, indicates item needs attention without implying failure
 * - Blue: Active/in-motion, universally understood as "working on it"
 * - Teal: Completion indicator distinct from "success green" judgment
 *
 * ACCESSIBILITY:
 * - All colors pass WCAG 2.1 AA contrast requirements
 * - Color is not the sole indicator - patterns available via StatusBadge component
 * - Approximately 8% of males have red-green color blindness (deuteranopia/protanopia)
 */

/**
 * Status configuration with neutral, non-judgmental colors
 * Each status has: color classes, accessible label, and pattern type for accessibility
 */
export const STATUS_CONFIG = {
  open: {
    label: 'Needs Action',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300',
    // For inline styles (charts, etc.)
    bgHex: '#f1f5f9',
    colorHex: '#334155',
    // Accessibility pattern type
    pattern: 'dots'
  },
  'in-progress': {
    label: 'In Progress',
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-300',
    bgHex: '#dbeafe',
    colorHex: '#1d4ed8',
    pattern: 'stripes'
  },
  closed: {
    label: 'Resolved',
    bg: 'bg-teal-100',
    text: 'text-teal-700',
    border: 'border-teal-300',
    bgHex: '#ccfbf1',
    colorHex: '#0f766e',
    pattern: 'solid'
  }
}

/**
 * Get Tailwind classes for action status badge styling
 * @param {string} status - The action status ('closed', 'in-progress', 'open', etc.)
 * @returns {string} Tailwind CSS classes for bg, text, and border colors
 */
export const getStatusColor = (status) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.open
  return `${config.bg} ${config.text} ${config.border}`
}

/**
 * Get status label (neutral, action-oriented language)
 * @param {string} status - The action status
 * @returns {string} Human-readable label
 */
export const getStatusLabel = (status) => {
  return STATUS_CONFIG[status]?.label || 'Needs Action'
}

/**
 * Get status hex colors for charts and inline styles
 * @param {string} status - The action status
 * @returns {Object} { bg: string, color: string }
 */
export const getStatusHexColors = (status) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.open
  return {
    bg: config.bgHex,
    color: config.colorHex
  }
}

/**
 * Get status pattern type for accessibility
 * @param {string} status - The action status
 * @returns {string} Pattern type: 'dots', 'stripes', or 'solid'
 */
export const getStatusPattern = (status) => {
  return STATUS_CONFIG[status]?.pattern || 'dots'
}

/**
 * Observation type configuration
 * Note: Observation types are CATEGORICAL, not judgmental
 * - "Unsafe" observations are valuable safety data, not failures
 * - Color indicates category for quick scanning, not quality
 */
export const TYPE_CONFIG = {
  positive: {
    label: 'Positive',
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    bgHex: '#d1fae5',
    colorHex: '#047857'
  },
  'unsafe-act': {
    label: 'Unsafe Act',
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    bgHex: '#fef3c7',
    colorHex: '#b45309'
  },
  'unsafe-condition': {
    label: 'Unsafe Condition',
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    bgHex: '#ffedd5',
    colorHex: '#c2410c'
  },
  'near-miss': {
    label: 'Near Miss',
    bg: 'bg-cyan-100',
    text: 'text-cyan-700',
    bgHex: '#cffafe',
    colorHex: '#0e7490'
  },
  lti: {
    label: 'LTI',
    bg: 'bg-rose-100',
    text: 'text-rose-700',
    bgHex: '#ffe4e6',
    colorHex: '#be123c'
  },
  mti: {
    label: 'MTI',
    bg: 'bg-red-100',
    text: 'text-red-700',
    bgHex: '#fee2e2',
    colorHex: '#dc2626'
  },
  fac: {
    label: 'FAC',
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    bgHex: '#fef9c3',
    colorHex: '#a16207'
  }
}

/**
 * Get status color for observation types
 * @param {string} type - The observation type
 * @returns {string} Tailwind CSS classes
 */
export const getTypeColor = (type) => {
  const normalizedType = type?.toLowerCase().replace(/\s+/g, '-')
  const config = TYPE_CONFIG[normalizedType]

  if (config) {
    return `${config.bg} ${config.text}`
  }

  // Fallback for unrecognized types
  return 'bg-surface-100 text-surface-700'
}

/**
 * Get type hex colors for charts
 * @param {string} type - The observation type
 * @returns {Object} { bg: string, color: string }
 */
export const getTypeHexColors = (type) => {
  const normalizedType = type?.toLowerCase().replace(/\s+/g, '-')
  const config = TYPE_CONFIG[normalizedType]

  if (config) {
    return { bg: config.bgHex, color: config.colorHex }
  }

  return { bg: '#f1f5f9', color: '#475569' }
}
