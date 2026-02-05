import React from 'react'

/**
 * StatusBadge - Badge component for incident types and action statuses
 *
 * DESIGN PRINCIPLES (Non-Bias & Accessibility):
 * 1. Colors indicate STATE, not VALUE - neutral palette avoids moral judgment
 * 2. Pattern differentiation for colorblind accessibility (8% of males affected)
 * 3. ARIA labels provide screen reader context
 * 4. Labels use action-oriented language ("Needs Action" vs "Open")
 */

// Incident type colors - categorical, not judgmental
const TYPE_CONFIG = {
  lti: { label: 'LTI', bg: '#ffe4e6', color: '#be123c' },
  mti: { label: 'MTI', bg: '#fee2e2', color: '#dc2626' },
  fac: { label: 'FAC', bg: '#fef9c3', color: '#a16207' },
  'near-miss': { label: 'Near Miss', bg: '#cffafe', color: '#0e7490' },
  'unsafe-act': { label: 'Unsafe Act', bg: '#fef3c7', color: '#b45309' },
  'unsafe-condition': { label: 'Unsafe Condition', bg: '#ffedd5', color: '#c2410c' },
  positive: { label: 'Positive', bg: '#d1fae5', color: '#047857' },
}

// Action status colors - NEUTRAL palette, no red/green moral judgment
// Designed for colorblind accessibility
const STATUS_CONFIG = {
  open: {
    label: 'Needs Action',
    bg: '#f1f5f9',      // Slate-100: Neutral
    color: '#334155',   // Slate-700
    pattern: 'dots',
    ariaDescription: 'Status: Needs action - this item requires attention'
  },
  'in-progress': {
    label: 'In Progress',
    bg: '#dbeafe',      // Blue-100: Active/working
    color: '#1d4ed8',   // Blue-700
    pattern: 'stripes',
    ariaDescription: 'Status: In progress - this item is being worked on'
  },
  closed: {
    label: 'Resolved',
    bg: '#ccfbf1',      // Teal-100: Complete (not "success green")
    color: '#0f766e',   // Teal-700
    pattern: 'solid',
    ariaDescription: 'Status: Resolved - this item has been addressed'
  },
}

/**
 * SVG Pattern definitions for accessibility
 * These patterns provide visual differentiation beyond color alone
 */
const PatternDefs = () => (
  <svg width="0" height="0" style={{ position: 'absolute' }}>
    <defs>
      {/* Dots pattern for "Needs Action" */}
      <pattern id="pattern-dots" width="4" height="4" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r="0.8" fill="currentColor" opacity="0.4" />
      </pattern>
      {/* Diagonal stripes pattern for "In Progress" */}
      <pattern id="pattern-stripes" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="4" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      </pattern>
    </defs>
  </svg>
)

/**
 * Pattern overlay component for accessibility
 */
const PatternOverlay = ({ pattern, color }) => {
  if (pattern === 'solid') return null

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    >
      <rect
        width="100%"
        height="100%"
        fill={`url(#pattern-${pattern})`}
        style={{ color }}
      />
    </svg>
  )
}

const StatusBadge = ({
  type,
  status,
  size = 'default',
  className = '',
  showPattern = true, // Enable/disable accessibility patterns
}) => {
  const isStatus = !type && status
  const config = type ? TYPE_CONFIG[type] : STATUS_CONFIG[status]

  if (!config) return null

  const sizes = {
    small: 'text-2xs px-1.5 py-0.5',
    default: 'text-xs px-2 py-0.5',
    large: 'text-sm px-2.5 py-1',
  }

  // For status badges, include pattern support and ARIA
  if (isStatus && showPattern) {
    return (
      <>
        <PatternDefs />
        <span
          className={`
            inline-flex items-center font-medium rounded-md relative overflow-hidden
            ${sizes[size]}
            ${className}
          `}
          style={{
            backgroundColor: config.bg,
            color: config.color,
          }}
          role="status"
          aria-label={config.ariaDescription}
        >
          <PatternOverlay pattern={config.pattern} color={config.color} />
          <span className="relative z-10">{config.label}</span>
        </span>
      </>
    )
  }

  // Standard badge (types or status without patterns)
  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-md
        ${sizes[size]}
        ${className}
      `}
      style={{
        backgroundColor: config.bg,
        color: config.color,
      }}
      role={isStatus ? 'status' : undefined}
      aria-label={isStatus ? config.ariaDescription : undefined}
    >
      {config.label}
    </span>
  )
}

// Export configs for external use
export { TYPE_CONFIG, STATUS_CONFIG }

export default StatusBadge
