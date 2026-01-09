import React from 'react'

/**
 * StatusBadge - Specifically for incident types and action statuses
 */

// Incident type colors
const TYPE_CONFIG = {
  lti: { label: 'LTI', bg: '#fef2f2', color: '#dc2626' },
  mti: { label: 'MTI', bg: '#fff7ed', color: '#ea580c' },
  fac: { label: 'FAC', bg: '#fefce8', color: '#ca8a04' },
  'near-miss': { label: 'Near Miss', bg: '#ecfeff', color: '#0891b2' },
  'unsafe-act': { label: 'Unsafe Act', bg: '#fef3c7', color: '#d97706' },
  'unsafe-condition': { label: 'Unsafe Condition', bg: '#fef3c7', color: '#b45309' },
  positive: { label: 'Positive', bg: '#f0fdf4', color: '#16a34a' },
}

// Action status colors
const STATUS_CONFIG = {
  open: { label: 'Open', bg: '#fef2f2', color: '#dc2626' },
  'in-progress': { label: 'In Progress', bg: '#fef3c7', color: '#d97706' },
  closed: { label: 'Closed', bg: '#f0fdf4', color: '#16a34a' },
}

const StatusBadge = ({
  type,
  status,
  size = 'default',
  className = '',
}) => {
  const config = type ? TYPE_CONFIG[type] : STATUS_CONFIG[status]

  if (!config) return null

  const sizes = {
    small: 'text-2xs px-1.5 py-0.5',
    default: 'text-xs px-2 py-0.5',
    large: 'text-sm px-2.5 py-1',
  }

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
    >
      {config.label}
    </span>
  )
}

// Export configs for external use
export { TYPE_CONFIG, STATUS_CONFIG }

export default StatusBadge
